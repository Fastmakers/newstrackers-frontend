import { useState } from "react";
import {
  ExternalLink,
  AlertTriangle,
  Newspaper,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Zap,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { renderMarkdown } from "./renderMarkdown";

interface IndustryAnalysisProps {
  data: any;
}

function parseSections(md: string) {
  const t = md.trim();
  if (!t) return [];
  const matches = Array.from(t.matchAll(/^###\s+(.*)$/gm));
  if (!matches.length) return [{ title: "AI 종합 분석", body: t }];
  return matches.map((m, i) => ({
    title: m[1].trim(),
    body: t
      .slice(
        (m.index ?? 0) + m[0].length,
        i < matches.length - 1 ? (matches[i + 1].index ?? t.length) : t.length,
      )
      .trim(),
  }));
}

function toKST(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
}

const SECTION_THEMES: { icon: LucideIcon; color: string; bg: string }[] = [
  { icon: TrendingUp,     color: '#2563EB', bg: '#EFF6FF' },
  { icon: Zap,            color: '#FF7A00', bg: '#FFF3E8' },
  { icon: MessageSquare,  color: '#7C3AED', bg: '#F5F3FF' },
];

function AccordionSection({ title, body, index }: { title: string; body: string; index: number }) {
  const [open, setOpen] = useState(true);
  const theme = SECTION_THEMES[index % SECTION_THEMES.length];
  const Icon = theme.icon;

  return (
    <div style={{ borderRadius: '12px', border: '1px solid #F2F4F6', overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '14px 18px',
          background: open ? theme.bg : '#ffffff',
          border: 'none', cursor: 'pointer',
          transition: 'background 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: '30px', height: '30px', borderRadius: '8px',
            backgroundColor: open ? '#ffffff' : theme.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            transition: 'background 0.15s',
          }}>
            <Icon size={15} color={theme.color} strokeWidth={2.5} />
          </span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#2B2E34' }}>{title}</span>
        </div>
        {open
          ? <ChevronUp size={16} color={theme.color} />
          : <ChevronDown size={16} color="#9CA3AF" />
        }
      </button>

      {open && (
        <div style={{ padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {renderMarkdown(body, { baseSize: 14, baseColor: '#2B2E34' })}
        </div>
      )}
    </div>
  );
}

export function IndustryAnalysis({ data }: IndustryAnalysisProps) {
  const [showAll, setShowAll] = useState(false);
  const api = data?.apiResponse ?? data ?? {};
  const profile = api.resume_profile ?? {};
  const news = Array.isArray(api.matched_news) ? api.matched_news : [];
  const sections = parseSections(api.relevance_analysis || "");
  const visible = showAll ? news : news.slice(0, 3);
  const vecs = news.filter(
    (n: any) => typeof n.distance === "number" && n.distance > 0,
  );
  const sim = (d: number) => Math.round((1 - d) * 100);
  const avgSim = vecs.length
    ? vecs.reduce((s: number, n: any) => s + sim(n.distance), 0) / vecs.length
    : 0;
  const warn = news.length > 0 && (!vecs.length || avgSim < 70);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* 관련 뉴스 카드 */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "28px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div>
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
              CURATED FOR YOU
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Newspaper size={20} color="#2B2E34" />
              <p
                style={{
                  fontWeight: 700,
                  fontSize: "18px",
                  color: "#2B2E34",
                  margin: 0,
                }}
              >
                관련 뉴스
              </p>
            </div>
          </div>
          {news.length > 0 && (
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#616161",
                backgroundColor: "#F3F4F6",
                padding: "4px 12px",
                borderRadius: "100px",
                marginTop: "4px",
              }}
            >
              총 {news.length}건
            </span>
          )}
        </div>

        {/* {warn && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              padding: "12px 16px",
              backgroundColor: "#FFFBEB",
              borderRadius: "10px",
              marginBottom: "16px",
            }}
          >
            <AlertTriangle
              style={{
                width: "16px",
                height: "16px",
                color: "#D97706",
                flexShrink: 0,
                marginTop: "2px",
              }}
            />
            <span
              style={{ fontSize: "13px", color: "#92400E", lineHeight: 1.6 }}
            >
              검색된 뉴스와 자소서의 관련성이 낮습니다. 지원 기업·산업 정보를
              입력하면 더 정확한 결과를 얻을 수 있습니다.
            </span>
          </div>
        )} */}

        {news.length === 0 && (
          <p style={{ fontSize: "14px", color: "#616161" }}>
            매칭된 뉴스 데이터가 없습니다.
          </p>
        )}

        {/* 뉴스 목록 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {visible.map((trend: any, idx: number) => {
            const isVec =
              typeof trend.distance === "number" && trend.distance > 0;
            const similarity = isVec ? sim(trend.distance) : null;
            const rank = idx + 1;

            return (
              <a
                key={`${trend.id || idx}`}
                href={trend.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  // border: "0.5px solid rgba(255, 122, 0)",
                  textDecoration: "none",
                  transition: "background 0.1s",
                  backgroundColor: "#F8FAFC",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#F1F5F9")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#F8FAFC")
                }
              >
                {/* 순위 */}
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: 500,
                    color: "#FF7A00",
                    flexShrink: 0,
                    width: "20px",
                    textAlign: "center",
                    paddingRight: "2",
                  }}
                >
                  {rank}
                </span>
                {/* 본문 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#FF7A00",
                        backgroundColor: "#FFF3E8",
                        padding: "2px 8px",
                        borderRadius: "100px",
                      }}
                    >
                      {trend.job_category || "뉴스"}
                    </span>
                    {similarity !== null && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#4E5968",
                        }}
                      >
                        {similarity}% 관련
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#2B2E34",
                      lineHeight: 1.45,
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {trend.title || "제목 없음"}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginTop: "3px",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                      {profile.industry || trend.job_category || ""}
                    </span>
                    {(profile.industry || trend.job_category) && (
                      <span style={{ fontSize: "12px", color: "#CBD5E1" }}>
                        ·
                      </span>
                    )}
                    <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                      {toKST(trend.published_at)}
                    </span>
                  </div>
                </div>
                <ExternalLink
                  style={{
                    width: "14px",
                    height: "14px",
                    color: "#CBD5E1",
                    flexShrink: 0,
                  }}
                />
              </a>
            );
          })}
        </div>

        {news.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAll((p) => !p)}
            style={{
              width: "100%",
              marginTop: "15px",
              padding: "12px",
              fontSize: "13px",
              fontWeight: 600,
              // color: "#616161",
              color: "rgba(255, 122, 0)",
              backgroundColor: "#F8FAFC",
              //backgroundColor: "#FFFBEB",
              //border: "0.5px solid #FFFBEB",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            {showAll ? (
              <>
                <ChevronUp size={15} />
                &nbsp;접기
              </>
            ) : (
              <>
                <ChevronDown size={15} />
                &nbsp;더보기 ({news.length - 3}건)
              </>
            )}
          </button>
        )}
      </div>

      {/* AI 종합 분석 카드 */}
      {api.relevance_analysis && (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "28px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
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
              AI INSIGHT
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <BrainCircuit size={20} color="#2B2E34" />
              <p
                style={{
                  fontWeight: 700,
                  fontSize: "18px",
                  color: "#2B2E34",
                  margin: 0,
                }}
              >
                AI 종합 분석
              </p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {sections.map((sec, i) => (
              <AccordionSection
                key={`${sec.title}-${i}`}
                title={sec.title}
                body={sec.body}
                index={i}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
