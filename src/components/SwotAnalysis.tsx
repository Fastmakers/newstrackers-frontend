const stripMd = (t: string) => t.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/`([^`]+)`/g, '$1').trim();
// 첫 문장만 추출 (. 또는 ! 또는 ? 기준)
const firstSentence = (t: string) => {
  const m = t.match(/^(.+?[.!?])\s/);
  return m ? m[1] : t;
};

interface SwotAnalysisProps { data: any; }

const QUADRANTS = [
  { key: 'strengths' as const,     label: '강점', sub: 'Strengths',     border: '#16A34A', bg: '#F0FDF4', dot: '#16A34A' },
  { key: 'weaknesses' as const,    label: '약점', sub: 'Weaknesses',    border: '#DC2626', bg: '#FFF5F5', dot: '#DC2626' },
  { key: 'opportunities' as const, label: '기회', sub: 'Opportunities', border: '#FF7A00', bg: '#FFF3E8', dot: '#FF7A00' },
  { key: 'threats' as const,       label: '위협', sub: 'Threats',       border: '#D97706', bg: '#FFFBEB', dot: '#D97706' },
];

export function SwotAnalysis({ data }: SwotAnalysisProps) {
  const api = data?.apiResponse ?? data ?? {};
  const swot = api.swot ?? {};
  const swotData = {
    strengths:     Array.isArray(swot.strengths)     ? swot.strengths     : [],
    weaknesses:    Array.isArray(swot.weaknesses)    ? swot.weaknesses    : [],
    opportunities: Array.isArray(swot.opportunities) ? swot.opportunities : [],
    threats:       Array.isArray(swot.threats)       ? swot.threats       : [],
  };

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '28px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
      <div style={{ marginBottom: '22px' }}>
        <p style={{ fontWeight: 800, fontSize: '18px', color: '#2B2E34', margin: 0 }}>SWOT 분석</p>
        <p style={{ fontSize: '13px', color: '#616161', marginTop: '4px' }}>지원자 관점 · 해당 기업 지원 기준</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {QUADRANTS.map(({ key, label, sub, border, bg, dot }) => {
          const items = swotData[key];
          return (
            <div key={key} style={{ backgroundColor: bg, borderRadius: '12px', padding: '18px 20px', borderLeft: `4px solid ${border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: border }}>{label}</span>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#616161' }}>{sub}</span>
              </div>
              {items.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#616161' }}>데이터 없음</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {items.map((item: string, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: dot, marginTop: '7px', flexShrink: 0, display: 'block' }} />
                      <span style={{ fontSize: '15px', color: '#2B2E34', lineHeight: 1.65 }}>{firstSentence(stripMd(item))}</span>
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
