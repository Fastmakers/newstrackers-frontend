import { renderMarkdown } from "./renderMarkdown";
import { InterviewPrepCard, hasInterviewQuestions } from "./InterviewPrepCard";
import { Award, Zap } from "lucide-react";

interface FinalReportSummaryProps {
  data: any;
}

function extractSection(report: string, start: string, next?: string): string {
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = report.match(
    new RegExp(`(?:^|\\n)(#{1,3}\\s*${esc(start)}[^\\n]*)`, "m"),
  );
  if (!m || m.index === undefined) return "";
  const end = report.indexOf("\n", m.index + (m[0].startsWith("\n") ? 1 : 0));
  const from = end === -1 ? report.length : end + 1;
  if (!next) return report.slice(from).trim();
  const rest = report.slice(from);
  const nm = rest.match(new RegExp(`\\n#{1,3}\\s*${esc(next)}[^\\n]*`, "m"));
  return nm?.index !== undefined ? rest.slice(0, nm.index).trim() : rest.trim();
}

export function FinalReportSummary({ data }: FinalReportSummaryProps) {
  const api = data?.apiResponse ?? data ?? {};
  const report = typeof api.final_report === "string" ? api.final_report : "";

  const sections = [
    {
      key: "면접 준비 포인트",
      next: "최종 권고사항",
      label: "면접 준비 포인트",
      color: "#FF7A00",
      bg: "#FFF3E8",
    },
    {
      key: "최종 권고사항",
      next: undefined,
      label: "최종 권고사항",
      color: "#7C3AED",
      bg: "#F5F3FF",
    },
  ]
    .map((s) => ({ ...s, content: extractSection(report, s.key, s.next) }))
    .filter((s) => s.content);

  if (!sections.length) {
    return (
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "28px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <p style={{ fontSize: "14px", color: "#616161" }}>
          표시할 최종 리포트 데이터가 없습니다.
        </p>
      </div>
    );
  }

  const interviewSec = sections.find((s) => s.key === "면접 준비 포인트");
  const otherSections = sections.filter((s) => s.key !== "면접 준비 포인트");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {interviewSec &&
        (hasInterviewQuestions(interviewSec.content) ? (
          <InterviewPrepCard content={interviewSec.content} />
        ) : (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "28px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "14px",
              }}
            >
              <span
                style={{
                  display: "block",
                  width: "4px",
                  height: "18px",
                  borderRadius: "2px",
                  backgroundColor: "#FF7A00",
                  flexShrink: 0,
                }}
              />
              <span
                style={{ fontSize: "14px", fontWeight: 700, color: "#2B2E34" }}
              >
                면접 준비 포인트
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#FF7A00",
                  backgroundColor: "#FFF3E8",
                  padding: "2px 10px",
                  borderRadius: "100px",
                }}
              >
                AI 추천
              </span>
            </div>
            <div
              style={{
                paddingLeft: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {renderMarkdown(interviewSec.content, {
                baseSize: 15,
                baseColor: "#2B2E34",
              })}
            </div>
          </div>
        ))}

      {otherSections.map((sec, i) => (
        <div
          key={i}
          style={{
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          {/* 헤더 */}
          <div
            style={{
              background:
                "linear-gradient(135deg, #FF9A3C 0%, #FFB066 50%, #FFD4A8 100%)",
              padding: "22px 28px",
            }}
          >
            <p
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.6)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              FINAL REPORT
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Award size={25} color="#ffffff" />
              </div>
              <div>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: "20px",
                    color: "#ffffff",
                    margin: 0,
                  }}
                >
                  {sec.label}
                </p>
                <p
                  style={{
                    fontSize: "16px",
                    // color: "rgba(255,255,255,0.65)",
                    fontWeight: 500,
                    color: "black",
                    margin: "2px 0 0",
                  }}
                >
                  AI 분석 기반 맞춤 전략 제안
                </p>
              </div>
            </div>
          </div>
          {/* 본문 */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "24px 28px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {renderMarkdown(sec.content, {
              baseSize: 18,
              baseColor: "#2B2E34",
              sectionBg: (title: string) =>
                title.includes("차별화") ? "#FFFBEB" : undefined,
              sectionHeader: (title: string) =>
                title.includes("차별화") ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      marginBottom: "6px",
                    }}
                  >
                    <Zap size={15} color="#FF7A00" />
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#FF7A00",
                      }}
                    >
                      AI 핵심 전략
                    </span>
                  </div>
                ) : undefined,
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
