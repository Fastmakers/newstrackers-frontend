/**
 * StreamingReport — 파이프라인 단계별 결과 등장 컴포넌트
 *
 * partial 이벤트마다 해당 섹션이 애니메이션과 함께 마운트되고,
 * token 이벤트마다 최종 리포트가 타이핑 효과로 누적된다.
 */
import { CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';

import { ResumeReview } from './ResumeReview';
import { SwotAnalysis } from './SwotAnalysis';
import { IndustryAnalysis } from './IndustryAnalysis';
import { FinalReportSummary } from './FinalReportSummary';

export interface StreamingState {
  resumeProfile?: any;
  matchedNews?: any[];
  swot?: any;
  relevanceAnalysis?: string;
  finalReportText: string;
  progressPct: number;
  currentLabel: string;
  elapsedSeconds: number;
  uploadedFileName?: string;
}

const fadeIn: React.CSSProperties = {
  animation: 'fadeSlideIn 0.4s ease both',
};

// CSS keyframes를 head에 삽입 (한 번만)
if (typeof document !== 'undefined' && !document.getElementById('streaming-report-styles')) {
  const style = document.createElement('style');
  style.id = 'streaming-report-styles';
  style.textContent = `
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

const PIPELINE_STEPS = [
  { step: 1, label: 'PDF 파싱',             pct: 10  },
  { step: 2, label: '자소서 AI 분석',        pct: 25  },
  { step: 3, label: '검색 쿼리 최적화',      pct: 30  },
  { step: 4, label: '관련 뉴스 검색',        pct: 55  },
  { step: 5, label: 'SWOT + 산업 분석',      pct: 80  },
  { step: 6, label: '최종 리포트 생성',       pct: 100 },
];

function ProgressBar({ pct, label, elapsed }: { pct: number; label: string; elapsed: number }) {
  const currentStep = PIPELINE_STEPS.findLast((s) => pct >= s.pct) ?? PIPELINE_STEPS[0];
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <Loader2 style={{ width: '18px', height: '18px', color: '#FF7A00', flexShrink: 0 }} className="animate-spin" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: '14px', color: '#2B2E34', margin: 0 }}>AI 분석 리포트 생성 중</p>
          <p style={{ fontSize: '12px', color: '#616161', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {label || currentStep.label}
          </p>
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#FF7A00', flexShrink: 0 }}>{pct}% · {elapsed}초</span>
      </div>

      <div style={{ height: '5px', backgroundColor: '#E2E8F0', borderRadius: '100px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#FF7A00', borderRadius: '100px', transition: 'width 0.6s ease' }} />
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '14px', flexWrap: 'wrap' }}>
        {PIPELINE_STEPS.map(({ step, label: sLabel, pct: sPct }) => {
          const done = pct >= sPct;
          const active = !done && pct >= (PIPELINE_STEPS[step - 2]?.pct ?? 0);
          return (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {done
                ? <CheckCircle2 style={{ width: '13px', height: '13px', color: '#22C55E' }} />
                : active
                  ? <Loader2 style={{ width: '13px', height: '13px', color: '#FF7A00' }} className="animate-spin" />
                  : <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'inline-block' }} />}
              <span style={{ fontSize: '11px', color: done ? '#CBD5E1' : active ? '#2B2E34' : '#CBD5E1', fontWeight: active ? 600 : 400, textDecoration: done ? 'line-through' : 'none' }}>
                {sLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NewsCard({ news }: { news: any }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#2B2E34', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {news.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {news.job_category && (
            <span style={{ fontSize: '11px', color: '#FF7A00', backgroundColor: '#FFF3E8', padding: '2px 8px', borderRadius: '100px', fontWeight: 500 }}>
              {news.job_category}
            </span>
          )}
          {news.published_at && (
            <span style={{ fontSize: '11px', color: '#616161' }}>
              {new Date(news.published_at).toLocaleDateString('ko-KR')}
            </span>
          )}
        </div>
      </div>
      {news.url && (
        <a href={news.url} target="_blank" rel="noreferrer" style={{ color: '#616161', flexShrink: 0 }}>
          <ExternalLink style={{ width: '14px', height: '14px' }} />
        </a>
      )}
    </div>
  );
}

function MatchedNewsSection({ news }: { news: any[] }) {
  return (
    <div style={{ ...fadeIn, backgroundColor: '#ffffff', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <p style={{ fontWeight: 700, fontSize: '16px', color: '#2B2E34', margin: 0 }}>관련 뉴스</p>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#FF7A00', backgroundColor: '#FFF3E8', padding: '3px 10px', borderRadius: '100px' }}>{news.length}건 매칭</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {news.slice(0, 8).map((item: any, i: number) => (
          <NewsCard key={item.id ?? i} news={item} />
        ))}
      </div>
    </div>
  );
}


export function StreamingReport({ resumeProfile, matchedNews, swot, relevanceAnalysis, finalReportText, progressPct, currentLabel, elapsedSeconds, uploadedFileName }: StreamingState) {
  // 기존 컴포넌트에 전달할 data 래퍼
  const partialData = {
    resume_profile: resumeProfile,
    matched_news: matchedNews ?? [],
    matched_news_count: matchedNews?.length ?? 0,
    relevance_analysis: relevanceAnalysis ?? '',
    swot: swot ?? {},
    final_report: finalReportText,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <ProgressBar pct={progressPct} label={currentLabel} elapsed={elapsedSeconds} />

      {resumeProfile && (
        <div style={fadeIn}>
          <ResumeReview data={partialData} />
        </div>
      )}

      {(matchedNews && matchedNews.length > 0) || (relevanceAnalysis && relevanceAnalysis.trim().length > 0) ? (
        <div style={fadeIn}>
          <IndustryAnalysis data={partialData} />
        </div>
      ) : null}

      {swot && (Object.values(swot).some((v: any) => Array.isArray(v) && v.length > 0)) && (
        <div style={fadeIn}>
          <SwotAnalysis data={partialData} />
        </div>
      )}

      {progressPct >= 80 && (
        finalReportText.trim().length > 0 ? (
          <div style={fadeIn}>
            <FinalReportSummary data={partialData} />
          </div>
        ) : (
          <div style={{ ...fadeIn, backgroundColor: '#ffffff', borderRadius: '14px', padding: '28px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#616161' }}>
              <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />
              <span style={{ fontSize: '13px' }}>리포트 생성 중...</span>
            </div>
          </div>
        )
      )}
    </div>
  );
}
