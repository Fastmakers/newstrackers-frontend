import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  Clock,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  Download,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { getJob, getJobs, getReport, Job, Report } from "../api";
import { ResumeReview } from "./ResumeReview";
import { IndustryAnalysis } from "./IndustryAnalysis";
import { SwotAnalysis } from "./SwotAnalysis";
import { FinalReportSummary } from "./FinalReportSummary";
import { StreamingReport } from "./StreamingReport";
import type { StreamingState } from "./StreamingReport";

const PIPELINE_STEPS = [
  { step: 1, label: "PDF 파싱", pct: 10 },
  { step: 2, label: "자소서 AI 분석", pct: 25 },
  { step: 3, label: "검색 쿼리 최적화", pct: 30 },
  { step: 4, label: "관련 뉴스 하이브리드 검색", pct: 55 },
  { step: 5, label: "SWOT + 산업 연관성 분석", pct: 80 },
  { step: 6, label: "최종 면접 리포트 생성", pct: 100 },
];

const card: React.CSSProperties = {
  backgroundColor: "#0F172A",
  borderRadius: "16px",
  padding: "24px 28px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
};

function StatusBadge({
  status,
  progress,
}: {
  status: Job["status"];
  progress: number;
}) {
  const styles: Record<
    Job["status"],
    { bg: string; color: string; label: string }
  > = {
    pending: { bg: "#FEF9C3", color: "#854D0E", label: "대기 중" },
    running: { bg: "#FFE4C4", color: "#E56E00", label: `분석 중 ${progress}%` },
    completed: { bg: "#DCFCE7", color: "#15803D", label: "완료" },
    failed: { bg: "#FEE2E2", color: "#B91C1C", label: "실패" },
  };
  const s = styles[status];
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: "100px",
        fontSize: "12px",
        fontWeight: 600,
        backgroundColor: s.bg,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  );
}

function toKST(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DetailHeader({
  onBack,
  job,
  rightSlot,
}: {
  onBack: () => void;
  job: Job;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: "#0F172A",
        borderRadius: "14px",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 1px 6px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.4)",
            padding: 0,
          }}
        >
          <ArrowLeft style={{ width: "15px", height: "15px" }} />
          분석 기록
        </button>
        <div
          style={{ width: "1px", height: "16px", backgroundColor: "rgba(255,255,255,0.1)" }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          {[
            { label: "지원 기업", val: job.company },
            { label: "직무", val: job.job_title },
            { label: "산업", val: job.industry },
            { label: "지원 유형", val: job.career_level },
          ]
            .filter((i) => i.val)
            .map((item) => (
              <div key={item.label}>
                <p
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: "1px",
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  {item.val}
                </p>
              </div>
            ))}
        </div>
      </div>
      {rightSlot}
    </div>
  );
}

type HistoryTab = "streaming" | "list";

export function JobHistory({
  streamingState,
}: {
  streamingState?: StreamingState | null;
}) {
  const [activeSubTab, setActiveSubTab] = useState<HistoryTab>("list");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [progressJob, setProgressJob] = useState<Job | null>(null);
  const progressPollRef = useRef<number | null>(null);
  const detailContentRef = useRef<HTMLDivElement | null>(null);
  const [isExportingDetailPdf, setIsExportingDetailPdf] = useState(false);

  const handleExportDetailPdf = async (job: Job, report: Report) => {
    if (!detailContentRef.current) return;
    try {
      setIsExportingDetailPdf(true);
      const pdf = new jsPDF("p", "mm", "a4");
      const margin = 12, pageW = 210, pageH = 297;
      const printW = pageW - margin * 2;
      const maxH = pageH - margin * 2;
      let curY = margin;
      let isFirstSection = true;
      const sections = Array.from(detailContentRef.current.children) as HTMLElement[];
      for (const section of sections) {
        const dataUrl = await toPng(section, { cacheBust: true, pixelRatio: 2, backgroundColor: "#F5F6FA" });
        const img = await new Promise<HTMLImageElement>((res, rej) => {
          const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = dataUrl;
        });
        const imgH = (img.height * printW) / img.width;
        if (!isFirstSection && curY + imgH > pageH - margin) { pdf.addPage(); curY = margin; }
        if (imgH > maxH) {
          let remaining = imgH, srcY = 0;
          while (remaining > 0) {
            const sliceH = Math.min(remaining, maxH - curY + margin);
            const srcSliceH = Math.round(img.height * (sliceH / imgH));
            const canvas = document.createElement("canvas");
            canvas.width = img.width; canvas.height = srcSliceH;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, -Math.round(srcY));
            pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, curY, printW, sliceH, undefined, "FAST");
            srcY += srcSliceH; remaining -= sliceH; curY += sliceH;
            if (remaining > 0) { pdf.addPage(); curY = margin; }
          }
        } else {
          pdf.addImage(dataUrl, "PNG", margin, curY, printW, imgH, undefined, "FAST");
          curY += imgH + 4;
        }
        isFirstSection = false;
      }
      const slug = (v: string) => v.trim().replace(/\s+/g, "-").replace(/[^\w\-가-힣]/g, "").slice(0, 40) || "report";
      const burl = URL.createObjectURL(pdf.output("blob"));
      const a = document.createElement("a");
      a.href = burl;
      a.download = `${new Date().toISOString().slice(0, 10)}-${slug(job.company || "company")}-report.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.setTimeout(() => URL.revokeObjectURL(burl), 1000);
    } catch {
      window.alert("PDF 생성 중 오류가 발생했습니다.");
    } finally {
      setIsExportingDetailPdf(false);
    }
  };

  // 스트리밍 시작 시 스트리밍 탭으로 자동 전환, 종료 시 목록 탭으로 복귀
  useEffect(() => {
    if (streamingState) {
      setActiveSubTab("streaming");
    } else {
      setActiveSubTab("list");
    }
  }, [!!streamingState]);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getJobs();
      setJobs(data);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // 최초 로드 + 5초마다 자동 새로고침 (상세 뷰 볼 때는 중단)
  useEffect(() => {
    if (selectedReport || progressJob) return;
    load();
    const timer = window.setInterval(() => load(true), 5000);
    return () => window.clearInterval(timer);
  }, [selectedReport, progressJob]);

  // 진행상황 폴링
  const stopProgressPolling = () => {
    if (progressPollRef.current !== null) {
      window.clearInterval(progressPollRef.current);
      progressPollRef.current = null;
    }
  };

  const startProgressPolling = (job: Job) => {
    progressPollRef.current = window.setInterval(async () => {
      try {
        const updated = await getJob(job.job_id);
        setProgressJob((prev) =>
          prev
            ? {
                ...updated,
                progress_pct: Math.max(prev.progress_pct, updated.progress_pct),
              }
            : updated,
        );

        if (updated.status === "completed" && updated.report_id) {
          stopProgressPolling();
          const report = await getReport(updated.report_id);
          setProgressJob(null);
          setSelectedJob(updated);
          setSelectedReport(report);
        } else if (updated.status === "failed") {
          stopProgressPolling();
          setProgressJob(null);
          load();
        }
      } catch {
        // 일시적 네트워크 오류 무시
      }
    }, 3000);
  };

  const handleViewProgress = (job: Job) => {
    setProgressJob(job);
    startProgressPolling(job);
  };

  const handleBackFromProgress = () => {
    stopProgressPolling();
    setProgressJob(null);
    load();
  };

  const handleView = async (job: Job) => {
    if (!job.report_id) return;
    setLoadingReport(job.job_id);
    try {
      const report = await getReport(job.report_id);
      setSelectedJob(job);
      setSelectedReport(report);
    } catch {
      alert("리포트를 불러오는 데 실패했습니다.");
    } finally {
      setLoadingReport(null);
    }
  };

  const handleBack = () => {
    setSelectedJob(null);
    setSelectedReport(null);
  };

  // 서브탭 바 (스트리밍 진행 중일 때만 표시)
  const subTabBar = streamingState ? (
    <div
      style={{
        display: "flex",
        backgroundColor: "#0F172A",
        borderRadius: "12px",
        padding: "4px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        marginBottom: "16px",
        gap: "4px",
      }}
    >
      <button
        onClick={() => setActiveSubTab("streaming")}
        style={{
          flex: 1,
          padding: "9px 16px",
          borderRadius: "9px",
          fontSize: "13px",
          fontWeight: activeSubTab === "streaming" ? 700 : 500,
          color: activeSubTab === "streaming" ? "#ffffff" : "rgba(255,255,255,0.4)",
          backgroundColor:
            activeSubTab === "streaming" ? "#f97316" : "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          transition: "all 0.15s",
        }}
      >
        <Loader2
          style={{ width: "13px", height: "13px" }}
          className="animate-spin"
        />
        분석 중
        {streamingState.resumeProfile?.company && (
          <span style={{ fontWeight: 400, opacity: 0.85 }}>
            · {streamingState.resumeProfile.company}
          </span>
        )}
      </button>
      <button
        onClick={() => setActiveSubTab("list")}
        style={{
          flex: 1,
          padding: "9px 16px",
          borderRadius: "9px",
          fontSize: "13px",
          fontWeight: activeSubTab === "list" ? 700 : 500,
          color: activeSubTab === "list" ? "#ffffff" : "rgba(255,255,255,0.4)",
          backgroundColor: activeSubTab === "list" ? "rgba(255,255,255,0.1)" : "transparent",
          border: "none",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        분석 기록
      </button>
    </div>
  ) : null;

  // 스트리밍 탭 선택된 경우
  if (activeSubTab === "streaming" && streamingState) {
    return (
      <div>
        {subTabBar}
        <StreamingReport {...streamingState} />
      </div>
    );
  }

  // 리포트 상세 뷰
  if (selectedReport && selectedJob) {
    const data = { ...selectedReport, apiResponse: selectedReport };
    return (
      <div>
        {subTabBar}
        {/* 브레드크럼 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "20px",
            fontSize: "14px",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          <button
            onClick={handleBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              color: "rgba(255,255,255,0.4)",
              padding: 0,
              fontWeight: 500,
            }}
          >
            <ArrowLeft style={{ width: "15px", height: "15px" }} />
          </button>
          <span>분석 기록</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
          <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
            {[selectedJob.company, selectedJob.job_title].filter(Boolean).join(" · ")}
          </span>
        </div>

        {/* 2컬럼 레이아웃 */}
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
          {/* 왼쪽 사이드바 */}
          <div
            style={{
              width: "260px",
              flexShrink: 0,
              backgroundColor: "#0F172A",
              borderRadius: "16px",
              padding: "24px 20px",
              color: "#fff",
              position: "sticky",
              top: "20px",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.4)",
                fontWeight: 500,
                marginBottom: "10px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              지원 정보
            </p>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "#ffffff",
                margin: "0 0 4px",
              }}
            >
              {selectedJob.company || "기업 미입력"}
            </h2>
            {selectedJob.job_title && (
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", margin: "0 0 20px" }}>
                {selectedJob.job_title}
              </p>
            )}

            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.1)",
                paddingTop: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              {[
                { label: "산업군", val: selectedJob.industry },
                { label: "지원유형", val: selectedJob.career_level },
                { label: "기업", val: selectedJob.company },
                { label: "직무", val: selectedJob.job_title },
              ]
                .filter((i) => i.val)
                .map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.8)",
                        fontWeight: 500,
                        textAlign: "right",
                      }}
                    >
                      {item.val}
                    </span>
                  </div>
                ))}
            </div>

            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.1)",
                paddingTop: "14px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                <Clock style={{ width: "12px", height: "12px", flexShrink: 0, color: "rgba(255,255,255,0.3)" }} />
                {toKST(selectedReport.created_at)}
              </div>
            </div>

            <button
              onClick={() => handleExportDetailPdf(selectedJob, selectedReport)}
              disabled={isExportingDetailPdf}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                backgroundColor: "#f97316",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 700,
                border: "none",
                cursor: isExportingDetailPdf ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                marginBottom: "8px",
                opacity: isExportingDetailPdf ? 0.7 : 1,
              }}
            >
              <Download style={{ width: "14px", height: "14px" }} />
              {isExportingDetailPdf ? "생성 중..." : "리포트 다운로드 (PDF)"}
            </button>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                style={{
                  flex: 1,
                  padding: "9px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                저장
              </button>
              <button
                style={{
                  flex: 1,
                  padding: "9px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                공유
              </button>
            </div>
          </div>

          {/* 오른쪽 콘텐츠 */}
          <div
            ref={detailContentRef}
            style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <ResumeReview data={data} />
            <IndustryAnalysis data={data} />
            <SwotAnalysis data={data} />
            <FinalReportSummary data={data} />
          </div>
        </div>
      </div>
    );
  }

  // 진행상황 인라인 뷰 (DB job 폴링)
  if (progressJob) {
    const pct = progressJob.progress_pct;
    const currentStep =
      PIPELINE_STEPS.findLast((s) => pct >= s.pct) ?? PIPELINE_STEPS[0];
    return (
      <div>
        {subTabBar}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <DetailHeader onBack={handleBackFromProgress} job={progressJob} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px 0",
            }}
          >
            <div style={{ ...card, width: "100%", maxWidth: "440px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <Loader2
                  style={{
                    width: "20px",
                    height: "20px",
                    color: "#f97316",
                    flexShrink: 0,
                  }}
                  className="animate-spin"
                />
                <div>
                  <p
                    style={{
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.8)",
                      fontSize: "15px",
                    }}
                  >
                    AI 분석 리포트 생성 중
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.4)",
                      marginTop: "2px",
                    }}
                  >
                    분석이 끝나면 결과 화면으로 이동합니다
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#fb923c",
                    }}
                  >
                    {currentStep.label}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#f97316",
                    }}
                  >
                    {pct}%
                  </span>
                </div>
                <div
                  style={{
                    height: "6px",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: "100px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      backgroundColor: "#f97316",
                      borderRadius: "100px",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {PIPELINE_STEPS.map(({ step, label, pct: sPct }) => {
                  const isDone = pct >= sPct;
                  const isActive =
                    pct >= (PIPELINE_STEPS[step - 2]?.pct ?? 0) && !isDone;
                  return (
                    <div
                      key={step}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {isDone ? (
                        <CheckCircle2
                          style={{
                            width: "16px",
                            height: "16px",
                            color: "#22C55E",
                            flexShrink: 0,
                          }}
                        />
                      ) : isActive ? (
                        <Loader2
                          style={{
                            width: "16px",
                            height: "16px",
                            color: "#f97316",
                            flexShrink: 0,
                          }}
                          className="animate-spin"
                        />
                      ) : (
                        <span
                          style={{
                            width: "16px",
                            height: "16px",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: "rgba(255,255,255,0.1)",
                              display: "block",
                            }}
                          />
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: "13px",
                          color: isDone
                            ? "rgba(255,255,255,0.3)"
                            : isActive
                              ? "rgba(255,255,255,0.8)"
                              : "rgba(255,255,255,0.3)",
                          fontWeight: isActive ? 600 : 400,
                          textDecoration: isDone ? "line-through" : "none",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 목록 뷰
  if (loading) {
    return (
      <div>
        {subTabBar}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "60px 0",
          }}
        >
          <Loader2
            style={{ width: "24px", height: "24px", color: "#f97316" }}
            className="animate-spin"
          />
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div>
        {subTabBar}
        <div
          style={{
            ...card,
            textAlign: "center",
            padding: "60px 28px",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          <Clock
            style={{
              width: "32px",
              height: "32px",
              margin: "0 auto 12px",
              color: "rgba(255,255,255,0.3)",
            }}
          />
          <p style={{ fontSize: "15px", fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
            분석 기록이 없습니다
          </p>
          <p style={{ fontSize: "13px", marginTop: "6px" }}>
            자소서를 업로드해 첫 번째 분석을 시작해보세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {subTabBar}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "15px",
            marginLeft: 5,
          }}
        >
          <div>
            <p
              style={{
                fontSize: "25px",
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              분석 기록
            </p>
            <p
              style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)", margin: "3px 0 0" }}
            >
              총 <strong style={{ color: "rgba(255,255,255,0.8)" }}>{jobs.length}</strong>건의
              분석 결과가 저장되어 있습니다.
            </p>
          </div>
          <button
            onClick={() => load()}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "13px",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            <RefreshCw style={{ width: "14px", height: "14px" }} />
            새로고침
          </button>
        </div>

        {jobs.map((job) => (
          <div key={job.job_id} style={{ ...card, padding: "18px 24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              {/* 좌측 정보 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "6px",
                  }}
                >
                  <StatusBadge
                    status={job.status}
                    progress={job.progress_pct}
                  />
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
                    {toKST(job.created_at)}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#ffffff",
                    marginBottom: "2px",
                  }}
                >
                  {job.company || "기업 미입력"}
                  {job.job_title && (
                    <span
                      style={{
                        fontWeight: 400,
                        color: "rgba(255,255,255,0.6)",
                        fontSize: "14px",
                      }}
                    >
                      {" "}
                      · {job.job_title}
                    </span>
                  )}
                </p>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {job.industry && (
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                      {job.industry}
                    </p>
                  )}
                  {job.career_level && (
                    <>
                      {job.industry && (
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
                          ·
                        </span>
                      )}
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                        {job.career_level}
                      </span>
                    </>
                  )}
                </div>

                {/* 진행 중일 때 progress bar */}
                {job.status === "running" && (
                  <div style={{ marginTop: "10px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#f97316",
                          fontWeight: 600,
                        }}
                      >
                        {job.progress_pct}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: "4px",
                        backgroundColor: "rgba(255,255,255,0.1)",
                        borderRadius: "100px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${job.progress_pct}%`,
                          backgroundColor: "#f97316",
                          borderRadius: "100px",
                          transition: "width 0.5s",
                        }}
                      />
                    </div>
                  </div>
                )}

                {job.status === "failed" && job.error_msg && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#EF4444",
                      marginTop: "6px",
                    }}
                  >
                    오류: {job.error_msg}
                  </p>
                )}
              </div>

              {/* 우측 액션 버튼 */}
              <div style={{ flexShrink: 0 }}>
                {job.status === "completed" && job.report_id && (
                  <button
                    onClick={() => handleView(job)}
                    disabled={loadingReport === job.job_id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "8px 14px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#fdba74",
                      backgroundColor: "rgba(249,115,22,0.2)",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {loadingReport === job.job_id ? (
                      <Loader2
                        style={{ width: "14px", height: "14px" }}
                        className="animate-spin"
                      />
                    ) : (
                      <>
                        <ChevronRight
                          style={{ width: "14px", height: "14px" }}
                        />
                        결과 보기
                      </>
                    )}
                  </button>
                )}
                {job.status === "running" && (
                  <button
                    onClick={() => handleViewProgress(job)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "8px 14px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#fdba74",
                      backgroundColor: "rgba(249,115,22,0.2)",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <Loader2
                      style={{ width: "14px", height: "14px" }}
                      className="animate-spin"
                    />
                    진행상황 보기
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
