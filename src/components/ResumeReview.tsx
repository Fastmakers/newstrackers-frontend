import { Edit3, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ResumeReviewProps {
  data: any;
}

export function ResumeReview({ data }: ResumeReviewProps) {
  const apiResponse = data?.apiResponse ?? data ?? {};
  const resumeProfile = apiResponse.resume_profile ?? {};

  const skills = Array.isArray(resumeProfile.skills) ? resumeProfile.skills : [];
  const experiences = Array.isArray(resumeProfile.experiences) ? resumeProfile.experiences : [];

  const summaryCards = [
    { label: '지원 직무', value: resumeProfile.job_title || '-' },
    { label: '지원 산업', value: resumeProfile.industry || '-' },
    { label: '지원 기업', value: resumeProfile.company || '-' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Edit3 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-xl">자소서 첨삭 요약</h2>
            <p className="text-sm text-slate-600">API 응답 기반 프로필/최종 리포트</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {summaryCards.map((card, index) => (
          <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-sm font-medium text-slate-700 mb-2">{card.label}</div>
            <div className="text-base font-bold text-slate-900 break-words">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <h3 className="font-medium text-slate-900">핵심 스킬</h3>
          </div>
          {skills.length === 0 ? (
            <p className="text-sm text-slate-600">스킬 데이터가 없습니다.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: string, index: number) => (
                <span key={index} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <h3 className="font-medium text-slate-900">주요 경험</h3>
          </div>
          {experiences.length === 0 ? (
            <p className="text-sm text-slate-600">경험 데이터가 없습니다.</p>
          ) : (
            <ul className="space-y-1.5 text-sm text-slate-700">
              {experiences.map((experience: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span>{experience}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
