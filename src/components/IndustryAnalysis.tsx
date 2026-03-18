import { useState } from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { renderMarkdown } from './renderMarkdown';

interface IndustryAnalysisProps { data: any; }

function parseSections(md: string) {
  const t = md.trim();
  if (!t) return [];
  const matches = Array.from(t.matchAll(/^###\s+(.*)$/gm));
  if (!matches.length) return [{ title: 'AI 종합 분석', body: t }];
  return matches.map((m, i) => ({
    title: m[1].trim(),
    body: t.slice((m.index ?? 0) + m[0].length, i < matches.length - 1 ? (matches[i + 1].index ?? t.length) : t.length).trim(),
  }));
}

function toKST(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function AccordionSection({ title, body }: { title: string; body: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ borderBottom: '1px solid #F2F4F6' }}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#4E5968' }}>{title}</span>
        <span style={{ fontSize: '12px', color: '#FF7A00' }}>{open ? '접기' : '펼치기'}</span>
      </button>
      {open && (
        <div style={{ paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {renderMarkdown(body, { baseSize: 15, baseColor: '#2B2E34' })}
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
  const sections = parseSections(api.relevance_analysis || '');
  const visible = showAll ? news : news.slice(0, 3);
  const warn = false;

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontWeight: 700, fontSize: '17px', color: '#2B2E34' }}>관련 뉴스</p>
        <p style={{ fontSize: '14px', color: '#616161', marginTop: '3px' }}>{profile.industry || '산업'} 기반 {news.length}건 매칭</p>
      </div>

      {warn && (
        <div style={{ display: 'flex', gap: '10px', padding: '12px 16px', backgroundColor: '#FFFBEB', borderRadius: '10px', marginBottom: '16px' }}>
          <AlertTriangle style={{ width: '16px', height: '16px', color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
          <span style={{ fontSize: '13px', color: '#92400E', lineHeight: 1.6 }}>검색된 뉴스와 자소서의 관련성이 낮습니다. 지원 기업·산업 정보를 입력하면 더 정확한 결과를 얻을 수 있습니다.</span>
        </div>
      )}

      {news.length === 0 && <p style={{ fontSize: '14px', color: '#616161' }}>매칭된 뉴스 데이터가 없습니다.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {visible.map((trend: any, idx: number) => {
          const rank = news.indexOf(trend) + 1;
          return (
            <a
              key={`${trend.id || idx}`}
              href={trend.url}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', padding: '14px 16px', borderRadius: '10px', textDecoration: 'none', transition: 'background 0.1s, border-color 0.1s', border: '1px solid #F2F4F6', backgroundColor: '#FAFAFA' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F0F4FF'; e.currentTarget.style.borderColor = '#D0DEFF'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FAFAFA'; e.currentTarget.style.borderColor = '#F2F4F6'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#FF7A00', minWidth: '20px', marginTop: '2px' }}>{rank}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#2B2E34', lineHeight: 1.5, margin: 0 }}>{trend.title || '제목 없음'}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#616161' }}>{trend.job_category || '뉴스'}</span>
                    <span style={{ fontSize: '12px', color: '#CBD5E1' }}>·</span>
                    <span style={{ fontSize: '12px', color: '#616161' }}>{toKST(trend.published_at)}</span>
                  </div>
                </div>
              </div>
              <ExternalLink style={{ width: '14px', height: '14px', color: '#CBD5E1', flexShrink: 0, marginTop: '3px' }} />
            </a>
          );
        })}
      </div>

      {news.length > 3 && (
        <button
          type="button"
          onClick={() => setShowAll(p => !p)}
          style={{ fontSize: '13px', fontWeight: 600, color: '#FF7A00', background: 'none', border: 'none', cursor: 'pointer', marginTop: '8px', padding: '4px 0' }}
        >
          {showAll ? '접기' : `${news.length - 3}건 더 보기`}
        </button>
      )}

      {api.relevance_analysis && (
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #F2F4F6' }}>
          <p style={{ fontWeight: 700, fontSize: '15px', color: '#2B2E34', marginBottom: '12px' }}>AI 종합 분석</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {sections.map((sec, i) => (
              <AccordionSection key={`${sec.title}-${i}`} title={sec.title} body={sec.body} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
