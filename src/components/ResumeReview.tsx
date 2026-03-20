import { useState } from "react";
import { Tag, StarsIcon, CheckCircle2 } from "lucide-react";

const stripMd = (t: string) =>
  t
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();

interface ResumeReviewProps {
  data: any;
}

export function ResumeReview({ data }: ResumeReviewProps) {
  const apiResponse = data?.apiResponse ?? data ?? {};
  const resumeProfile = apiResponse.resume_profile ?? {};
  const skills = Array.isArray(resumeProfile.skills)
    ? resumeProfile.skills
    : [];
  const experiences = Array.isArray(resumeProfile.experiences)
    ? resumeProfile.experiences
    : [];
  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null);

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "28px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <p
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: "#9CA3AF",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}
      >
        RESUME ANALYSIS
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "22px",
        }}
      >
        <span style={{ fontSize: "20px" }}>📄</span>
        <p
          style={{
            fontWeight: 700,
            fontSize: "20px",
            color: "#2B2E34",
            margin: 0,
          }}
        >
          자소서 분석 요약
        </p>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        {/* 핵심 스킬 */}
        <div
          style={{
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "14px",
            }}
          >
            <span
              style={{
                width: "27px",
                height: "27px",
                borderRadius: "50%",
                backgroundColor: "#F97316",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Tag
                style={{ width: "17px", height: "17px", color: "#FFFFFF" }}
              />
            </span>
            <p
              style={{
                fontSize: "18px",
                fontWeight: 900,
                color: "#1E293B",
                margin: 0,
              }}
            >
              핵심 스킬
            </p>
          </div>
          {skills.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#616161" }}>데이터 없음</p>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "7px",
                marginTop: 25,
              }}
            >
              {skills.map((skill: string, i: number) => (
                <span
                  key={i}
                  onMouseEnter={() => setHoveredSkill(i)}
                  onMouseLeave={() => setHoveredSkill(null)}
                  style={{
                    padding: "6px 14px",
                    backgroundColor: "#FFFFFF",
                    border: `1px solid ${hoveredSkill === i ? "#FED7AA" : "#E2E8F0"}`,
                    color: hoveredSkill === i ? "#92400E" : "#374151",
                    fontSize: "15px",
                    fontWeight: 800,
                    borderRadius: "100px",
                    cursor: "default",
                    transition: "border-color 0.15s, color 0.15s",
                  }}
                >
                  {stripMd(skill)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 주요 경험 */}
        <div
          style={{
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "14px",
            }}
          >
            <span
              style={{
                width: "27px",
                height: "27px",
                borderRadius: "50%",
                backgroundColor: "#7C3AED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <StarsIcon
                style={{ width: "17px", height: "17px", color: "#FFFFFF" }}
              />
            </span>
            <p
              style={{
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: 0,
              }}
            >
              주요 경험
            </p>
          </div>
          {experiences.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#616161" }}>데이터 없음</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginTop: 25,
              }}
            >
              {experiences.map((exp: string, i: number) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      color: "#7C3AED",
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  >
                    <CheckCircle2 style={{ width: "20" }} />
                  </span>
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#2B2E34",
                      lineHeight: 1.6,
                    }}
                  >
                    {stripMd(exp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
