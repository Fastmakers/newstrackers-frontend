const stripMd = (t: string) => t.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/`([^`]+)`/g, '$1').trim();

interface ResumeReviewProps { data: any; }

export function ResumeReview({ data }: ResumeReviewProps) {
  const apiResponse = data?.apiResponse ?? data ?? {};
  const resumeProfile = apiResponse.resume_profile ?? {};
  const skills = Array.isArray(resumeProfile.skills) ? resumeProfile.skills : [];
  const experiences = Array.isArray(resumeProfile.experiences) ? resumeProfile.experiences : [];

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <p style={{ fontWeight: 700, fontSize: '17px', color: '#2B2E34', marginBottom: '22px' }}>자소서 분석 요약</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {skills.length > 0 && (
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#616161', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>핵심 스킬</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              {skills.map((skill: string, i: number) => (
                <span key={i} style={{ padding: '6px 14px', backgroundColor: '#FFF3E8', color: '#FF7A00', fontSize: '13px', fontWeight: 600, borderRadius: '100px' }}>
                  {stripMd(skill)}
                </span>
              ))}
            </div>
          </div>
        )}

        {experiences.length > 0 && (
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#616161', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>주요 경험</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {experiences.map((exp: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '12px 14px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#616161', marginTop: '8px', flexShrink: 0, display: 'block' }} />
                  <span style={{ fontSize: '14px', color: '#2B2E34', lineHeight: 1.6 }}>{stripMd(exp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {skills.length === 0 && experiences.length === 0 && (
          <p style={{ fontSize: '15px', color: '#616161' }}>분석된 데이터가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
