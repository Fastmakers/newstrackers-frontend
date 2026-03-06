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
        <span style={{ fontSize: '12px', color: '#3182F6' }}>{open ? '접기' : '펼치기'}</span>
      </button>
      {open && (
        <div style={{ paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {renderMarkdown(body, { baseSize: 15, baseColor: '#374151' })}
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
  const vecs = news.filter((n: any) => typeof n.distance === 'number' && n.distance > 0);
  const sim = (d: number) => Math.round((1 - d) * 100);
  const avgSim = vecs.length ? vecs.reduce((s: number, n: any) => s + sim(n.distance), 0) / vecs.length : 0;
  const warn = news.length > 0 && (!vecs.length || avgSim < 70);

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontWeight: 700, fontSize: '17px', color: '#191F28' }}>관련 뉴스</p>
        <p style={{ fontSize: '14px', color: '#8B95A1', marginTop: '3px' }}>{profile.industry || '산업'} 기반 {news.length}건 매칭</p>
      </div>

      {warn && (
        <div style={{ display: 'flex', gap: '10px', padding: '12px 16px', backgroundColor: '#FFFBEB', borderRadius: '10px', marginBottom: '16px' }}>
          <AlertTriangle style={{ width: '16px', height: '16px', color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
          <span style={{ fontSize: '13px', color: '#92400E', lineHeight: 1.6 }}>검색된 뉴스와 자소서의 관련성이 낮습니다. 지원 기업·산업 정보를 입력하면 더 정확한 결과를 얻을 수 있습니다.</span>
        </div>
      )}

      {news.length === 0 && <p style={{ fontSize: '14px', color: '#8B95A1' }}>매칭된 뉴스 데이터가 없습니다.</p>}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {visible.map((trend: any, idx: number) => {
          const isVec = typeof trend.distance === 'number' && trend.distance > 0;
          const similarity = isVec ? sim(trend.distance) : null;
          return (
            <a
              key={`${trend.id || idx}`}
              href={trend.url}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', padding: '14px 10px', borderRadius: '10px', textDecoration: 'none', transition: 'background 0.1s' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#191F28', lineHeight: 1.5, margin: 0 }}>{trend.title || '제목 없음'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#8B95A1' }}>{trend.job_category || '뉴스'}</span>
                  <span style={{ fontSize: '12px', color: '#CBD5E1' }}>·</span>
                  <span style={{ fontSize: '12px', color: '#8B95A1' }}>{toKST(trend.published_at)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {similarity !== null ? (
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '3px 10px', borderRadius: '100px' }}>{similarity}%</span>
                ) : (
                  <span style={{ fontSize: '11px', color: '#8B95A1', backgroundColor: '#F2F4F6', padding: '3px 10px', borderRadius: '100px' }}>키워드</span>
                )}
                <ExternalLink style={{ width: '14px', height: '14px', color: '#CBD5E1' }} />
              </div>
            </a>
          );
        })}
      </div>

      {news.length > 3 && (
        <button
          type="button"
          onClick={() => setShowAll(p => !p)}
          style={{ fontSize: '13px', fontWeight: 600, color: '#3182F6', background: 'none', border: 'none', cursor: 'pointer', marginTop: '8px', padding: '4px 0' }}
        >
          {showAll ? '접기' : `${news.length - 3}건 더 보기`}
        </button>
      )}

      {api.relevance_analysis && (
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #F2F4F6' }}>
          <p style={{ fontWeight: 700, fontSize: '15px', color: '#191F28', marginBottom: '12px' }}>AI 종합 분석</p>
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
