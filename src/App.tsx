import { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { UploadSection } from "./components/UploadSection";
import { IndustryAnalysis } from "./components/IndustryAnalysis";
import { ResumeReview } from "./components/ResumeReview";
import { SwotAnalysis } from "./components/SwotAnalysis";
import { FinalReportSummary } from "./components/FinalReportSummary";
import { AuthPanel, UserMenuPanel } from "./components/AuthModal";
import { JobHistory } from "./components/JobHistory";
import type { StreamingState } from "./components/StreamingReport";
import { Download, User, LogOut, History, ArrowLeft } from "lucide-react";
import { useAuthStore } from "./store/authStore";

type Tab = "upload" | "history";

export default function App() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("upload");
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamingState, setStreamingState] = useState<StreamingState | null>(
    null,
  );
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const reportExportRef = useRef<HTMLDivElement | null>(null);
  const cancelAnalysisRef = useRef<(() => void) | null>(null);
  const activeStreamSidRef = useRef<string | null>(null);

  // 로그아웃 시 분석 데이터 초기화
  useEffect(() => {
    if (!isAuthenticated) {
      setAnalysisData(null);
      setStreamingState(null);
      setIsAnalyzing(false);
      if (cancelAnalysisRef.current) {
        cancelAnalysisRef.current();
        cancelAnalysisRef.current = null;
      }
      activeStreamSidRef.current = null;
      setActiveTab("upload");
    }
  }, [isAuthenticated]);

  const handleAnalysisComplete = (data: any) => {
    setAnalysisData(data);
  };

  const handleTabClick = (tab: Tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
  };

  const api = analysisData?.apiResponse ?? analysisData ?? {};
  const profile = api.resume_profile ?? {};
  const slug = (v: string) =>
    v
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-가-힣]/g, "")
      .slice(0, 40) || "report";

  const handleExportPdf = async () => {
    if (!reportExportRef.current) return;
    try {
      setIsExportingPdf(true);
      const pdf = new jsPDF("p", "mm", "a4");
      const margin = 12,
        pageW = 210,
        pageH = 297;
      const printW = pageW - margin * 2;
      const maxH = pageH - margin * 2;
      let curY = margin;
      let isFirstSection = true;

      const sections = Array.from(
        reportExportRef.current.children,
      ) as HTMLElement[];
      for (const section of sections) {
        const dataUrl = await toPng(section, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: "#F5F6FA",
        });
        const img = await new Promise<HTMLImageElement>((res, rej) => {
          const i = new Image();
          i.onload = () => res(i);
          i.onerror = rej;
          i.src = dataUrl;
        });
        const imgH = (img.height * printW) / img.width;

        if (!isFirstSection && curY + imgH > pageH - margin) {
          pdf.addPage();
          curY = margin;
        }

        if (imgH > maxH) {
          let remaining = imgH,
            srcY = 0;
          while (remaining > 0) {
            const sliceH = Math.min(remaining, maxH - curY + margin);
            const srcSliceH = Math.round(img.height * (sliceH / imgH));
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = srcSliceH;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, -Math.round(srcY));
            pdf.addImage(
              canvas.toDataURL("image/png"),
              "PNG",
              margin,
              curY,
              printW,
              sliceH,
              undefined,
              "FAST",
            );
            srcY += srcSliceH;
            remaining -= sliceH;
            curY += sliceH;
            if (remaining > 0) {
              pdf.addPage();
              curY = margin;
            }
          }
        } else {
          pdf.addImage(
            dataUrl,
            "PNG",
            margin,
            curY,
            printW,
            imgH,
            undefined,
            "FAST",
          );
          curY += imgH + 4;
        }
        isFirstSection = false;
      }

      const burl = URL.createObjectURL(pdf.output("blob"));
      const a = document.createElement("a");
      a.href = burl;
      a.download = `${new Date().toISOString().slice(0, 10)}-${slug(profile.company || "company")}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(burl), 1000);
    } catch (e) {
      window.alert("PDF 생성 중 오류가 발생했습니다.");
      console.error(e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(api, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${new Date().toISOString().slice(0, 10)}-${slug(profile.company || "company")}-full.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: "upload", label: "자소서 업로드" },
    { id: "history", label: "분석 기록" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F6FA",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <div style={{ maxWidth: "980px", margin: "0 auto", padding: "0 28px" }}>
          <div
            style={{
              paddingTop: "20px",
              paddingBottom: "0",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h1
                style={{
                  fontWeight: 800,
                  fontSize: "20px",
                  color: "#2B2E34",
                  margin: 0,
                  letterSpacing: "-0.3px",
                }}
              >
                AI 취업 전략 리포트
              </h1>
              <p
                style={{ fontSize: "13px", color: "#616161", marginTop: "4px" }}
              >
                자소서 기반 맞춤형 면접 전략을 분석합니다
              </p>
            </div>

            <div style={{ paddingTop: "4px" }}>
              {isAuthenticated && user ? (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <button
                    id="user-menu-btn"
                    onClick={() => {
                      setShowUserMenu((v) => !v);
                      setShowAuthPanel(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <User
                      style={{
                        width: "15px",
                        height: "15px",
                        color: "#616161",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#2B2E34",
                      }}
                    >
                      {user.nickname}
                    </span>
                  </button>
                  {/* <button
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#616161', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <LogOut style={{ width: '13px', height: '13px' }} />로그아웃
                  </button> */}
                </div>
              ) : (
                <button
                  id="auth-login-btn"
                  onClick={() => {
                    setShowAuthPanel((v) => !v);
                    setShowUserMenu(false);
                  }}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#FF7A00",
                    backgroundColor: "#FFF3E8",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  로그인
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", marginTop: "12px" }}>
            {TABS.map(({ id, label }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => handleTabClick(id)}
                  style={{
                    padding: "10px 4px",
                    marginRight: "28px",
                    fontSize: "14px",
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? "#2B2E34" : "#616161",
                    background: "none",
                    border: "none",
                    borderBottom: isActive
                      ? "2px solid #FF7A00"
                      : "2px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {id === "history" && (
                    <History style={{ width: "14px", height: "14px" }} />
                  )}
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main */}
      <main
        style={{
          maxWidth: "980px",
          margin: "0 auto",
          padding: "28px 28px 80px",
        }}
      >
        {/* 업로드 탭 — 스트리밍 중에도 언마운트되지 않도록 display로 제어 */}
        <div style={{ display: activeTab === "upload" ? "block" : "none" }}>
          {analysisData ? (
            /* 분석 완료 결과 뷰 */
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {/* 헤더: 새 분석 버튼 + 기업/직무 + 내보내기 */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "14px",
                  padding: "18px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "20px" }}
                >
                  <button
                    onClick={() => setAnalysisData(null)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#616161",
                      padding: 0,
                    }}
                  >
                    <ArrowLeft style={{ width: "15px", height: "15px" }} />새
                    분석
                  </button>
                  {(profile.company || profile.job_title) && (
                    <>
                      <div
                        style={{
                          width: "1px",
                          height: "16px",
                          backgroundColor: "#E5E7EB",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "28px",
                        }}
                      >
                        {[
                          { label: "지원 기업", val: profile.company },
                          { label: "직무", val: profile.job_title },
                          { label: "산업", val: profile.industry },
                        ]
                          .filter((i) => i.val)
                          .map((item) => (
                            <div key={item.label}>
                              <p
                                style={{
                                  fontSize: "11px",
                                  color: "#616161",
                                  marginBottom: "2px",
                                  fontWeight: 500,
                                }}
                              >
                                {item.label}
                              </p>
                              <p
                                style={{
                                  fontSize: "15px",
                                  fontWeight: 700,
                                  color: "#2B2E34",
                                }}
                              >
                                {item.val}
                              </p>
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[
                    {
                      label: isExportingPdf ? "생성 중..." : "PDF",
                      fn: handleExportPdf,
                      dis: isExportingPdf,
                    },
                    { label: "JSON", fn: handleExportJson, dis: false },
                  ].map((b) => (
                    <button
                      key={b.label}
                      onClick={b.fn}
                      disabled={b.dis}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "7px 14px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#616161",
                        backgroundColor: "#F3F4F6",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <Download style={{ width: "13px", height: "13px" }} />
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
              <div
                ref={reportExportRef}
                id="report-export-root"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <ResumeReview data={analysisData} />
                <IndustryAnalysis data={analysisData} />
                <SwotAnalysis data={analysisData} />
                <FinalReportSummary data={analysisData} />
              </div>
            </div>
          ) : (
            /* 업로드 폼 / 스트리밍 뷰 */
            <UploadSection
              onAnalysisComplete={handleAnalysisComplete}
              onAnalyzingChange={(analyzing, cancel) => {
                setIsAnalyzing(analyzing);
                cancelAnalysisRef.current = cancel ?? null;
                if (analyzing) setActiveTab("history");
              }}
              onStreamingStateChange={(state, sid) => {
                if (state === null) {
                  // 현재 표시 중인 분석이 완료됨 → lock 해제
                  if (activeStreamSidRef.current === sid) {
                    activeStreamSidRef.current = null;
                    setStreamingState(null);
                  }
                } else if (!activeStreamSidRef.current) {
                  // 처음 시작하는 분析 → lock
                  activeStreamSidRef.current = sid;
                  setStreamingState(state);
                } else if (activeStreamSidRef.current === sid) {
                  // 현재 표시 중인 분析의 업데이트
                  setStreamingState(state);
                }
                // 다른 sid → 무시 (와리가리 방지)
              }}
            />
          )}
        </div>

        {/* 분석기록 탭 */}
        <div style={{ display: activeTab === "history" ? "block" : "none" }}>
          {isAuthenticated || streamingState ? (
            <JobHistory streamingState={streamingState} />
          ) : (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#616161",
                  marginBottom: "12px",
                }}
              >
                분석 기록은 로그인 후 확인할 수 있습니다.
              </p>
              <button
                id="auth-login-btn"
                onClick={() => setShowAuthPanel(true)}
                style={{
                  padding: "10px 24px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#fff",
                  backgroundColor: "#FF7A00",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                로그인하기
              </button>
            </div>
          )}
        </div>
      </main>

      {showAuthPanel && <AuthPanel onClose={() => setShowAuthPanel(false)} />}
      {showUserMenu && <UserMenuPanel onClose={() => setShowUserMenu(false)} />}
    </div>
  );
}
