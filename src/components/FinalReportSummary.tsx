import { renderMarkdown } from './renderMarkdown';

interface FinalReportSummaryProps { data: any; }

function extractSection(report: string, start: string, next?: string): string {
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = report.match(new RegExp(`(?:^|\\n)(#{1,3}\\s*${esc(start)}[^\\n]*)`, 'm'));
  if (!m || m.index === undefined) return '';
  const end = report.indexOf('\n', m.index + (m[0].startsWith('\n') ? 1 : 0));
  const from = end === -1 ? report.length : end + 1;
  if (!next) return report.slice(from).trim();
  const rest = report.slice(from);
  const nm = rest.match(new RegExp(`\\n#{1,3}\\s*${esc(next)}[^\\n]*`, 'm'));
  return nm?.index !== undefined ? rest.slice(0, nm.index).trim() : rest.trim();
}

export function FinalReportSummary({ data }: FinalReportSummaryProps) {
  const api = data?.apiResponse ?? data ?? {};
  const report = typeof api.final_report === 'string' ? api.final_report : '';

  const sections = [
    { key: '면접 준비 포인트', next: '최종 권고사항', label: '면접 준비 포인트', color: '#2563EB', bg: '#EFF6FF' },
    { key: '최종 권고사항', next: undefined, label: '최종 권고사항', color: '#7C3AED', bg: '#F5F3FF' },
  ].map(s => ({ ...s, content: extractSection(report, s.key, s.next) })).filter(s => s.content);

  if (!sections.length) {
    return (
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: '14px', color: '#8B95A1' }}>표시할 최종 리포트 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontWeight: 700, fontSize: '17px', color: '#191F28' }}>면접 준비 &amp; 최종 권고</p>
        <p style={{ fontSize: '14px', color: '#8B95A1', marginTop: '3px' }}>AI 분석 기반 맞춤형 전략</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {sections.map((sec, i) => (
          <div key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ display: 'block', width: '4px', height: '18px', borderRadius: '2px', backgroundColor: sec.color, flexShrink: 0 }} />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#191F28' }}>{sec.label}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: sec.color, backgroundColor: sec.bg, padding: '2px 10px', borderRadius: '100px' }}>AI 추천</span>
            </div>
            <div style={{ paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {renderMarkdown(sec.content, { baseSize: 15, baseColor: '#374151' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
