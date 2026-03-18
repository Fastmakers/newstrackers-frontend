import {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  ShieldAlert,
  LayoutGrid,
} from "lucide-react";

const stripMd = (t: string) =>
  t
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
const firstSentence = (t: string) => {
  const m = t.match(/^(.+?[.!?])\s/);
  return m ? m[1] : t;
};

interface SwotAnalysisProps {
  data: any;
}

const QUADRANTS = [
  {
    key: "strengths" as const,
    label: "강점",
    sub: "Strengths",
    border: "#16A34A",
    bg: "#F0FDF4",
    dot: "#16A34A",
    Icon: TrendingUp,
  },
  {
    key: "weaknesses" as const,
    label: "약점",
    sub: "Weaknesses",
    border: "#DC2626",
    bg: "#FFF5F5",
    dot: "#DC2626",
    Icon: TrendingDown,
  },
  {
    key: "opportunities" as const,
    label: "기회",
    sub: "Opportunities",
    border: "#2563EB",
    bg: "#EFF6FF",
    dot: "#2563EB",
    Icon: Lightbulb,
  },
  {
    key: "threats" as const,
    label: "위협",
    sub: "Threats",
    border: "#D97706",
    bg: "#FFFBEB",
    dot: "#D97706",
    Icon: ShieldAlert,
  },
];

export function SwotAnalysis({ data }: SwotAnalysisProps) {
  const api = data?.apiResponse ?? data ?? {};
  const swot = api.swot ?? {};
  const swotData = {
    strengths: Array.isArray(swot.strengths) ? swot.strengths : [],
    weaknesses: Array.isArray(swot.weaknesses) ? swot.weaknesses : [],
    opportunities: Array.isArray(swot.opportunities) ? swot.opportunities : [],
    threats: Array.isArray(swot.threats) ? swot.threats : [],
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "14px",
        padding: "28px",
        boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
      }}
    >
      {/* 헤더 */}
      <div style={{ marginBottom: "22px" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#9CA3AF",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          COMPETENCY MATRIX
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <LayoutGrid size={20} color="#2B2E34" />
          <p
            style={{
              fontWeight: 700,
              fontSize: "18px",
              color: "#2B2E34",
              margin: 0,
            }}
          >
            SWOT 분석
          </p>
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
      >
        {QUADRANTS.map(({ key, label, sub, border, bg, dot, Icon }) => {
          const items = swotData[key];
          return (
            <div
              key={key}
              style={{
                backgroundColor: bg,
                borderRadius: "12px",
                padding: "18px 20px",
                borderLeft: `4px solid ${border}`,
              }}
            >
              {/* 이름 배지 */}
              <div style={{ marginBottom: "14px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    border: `1.5px solid ${border}`,
                    borderRadius: "100px",
                    padding: "4px 12px 4px 8px",
                  }}
                >
                  <Icon size={14} color={border} strokeWidth={2.5} />
                  <span
                    style={{ fontSize: "13px", fontWeight: 700, color: border }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#9CA3AF",
                    }}
                  >
                    {sub}
                  </span>
                </span>
              </div>

              {items.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#616161" }}>
                  데이터 없음
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {items.map((item: string, i: number) => (
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
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: dot,
                          marginTop: "7px",
                          flexShrink: 0,
                          display: "block",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#2B2E34",
                          lineHeight: 1.65,
                        }}
                      >
                        {firstSentence(stripMd(item))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
