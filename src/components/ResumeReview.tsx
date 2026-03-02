import { Edit3, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface ResumeReviewProps {
  data: any;
}

export function ResumeReview({ data }: ResumeReviewProps) {
  const sections = [
    {
      title: '지원 동기 및 목표',
      score: 85,
      status: 'good',
      original: '귀사의 혁신적인 기술과 글로벌 비전에 매료되어 지원하게 되었습니다. 제 경험을 바탕으로 회사 발전에 기여하고 싶습니다.',
      feedback: [
        { type: 'positive', text: '명확한 지원 의사 표현' },
        { type: 'warning', text: '구체적인 기업 분석 내용 추가 필요 (예: 최근 AI 사업 확장 전략 언급)' },
        { type: 'suggestion', text: '지원 기업의 최근 뉴스(매일경제 분석 참고)를 언급하면 더욱 효과적' },
      ],
      improved: '귀사가 최근 발표한 AI 반도체 분야 투자 확대 계획(매일경제 2026.01.18)을 보며, 제 LangChain 기반 데이터 분석 경험이 귀사의 혁신에 기여할 수 있다고 확신했습니다. 특히 HBM 최적화 프로젝트에서의 경험을 활용하여 귀사의 글로벌 경쟁력 강화에 일조하고자 합니다.',
    },
    {
      title: '핵심 역량 및 경험',
      score: 72,
      status: 'warning',
      original: 'Python과 머신러닝을 활용한 데이터 분석 프로젝트를 수행했습니다. 팀 프로젝트에서 리더 역할을 맡아 성공적으로 완수했습니다.',
      feedback: [
        { type: 'positive', text: '기술 스택 명시' },
        { type: 'warning', text: '정량적 성과 지표 부족 (예: 성능 개선율, 처리 데이터 규모 등)' },
        { type: 'suggestion', text: '프로젝트의 비즈니스 임팩트를 구체적으로 서술' },
      ],
      improved: 'LangChain과 RAG 기술을 활용하여 고객 응대 AI 시스템을 구축, 응답 정확도를 68%에서 92%로 향상시켰습니다. 5명 규모 팀을 리딩하며 3개월 내 프로젝트를 완료했고, 이를 통해 고객 만족도 35% 개선이라는 가시적 성과를 달성했습니다.',
    },
    {
      title: '입사 후 포부',
      score: 78,
      status: 'good',
      original: '입사 후 빠르게 업무를 습득하여 팀에 기여하고, 장기적으로 리더로 성장하고 싶습니다.',
      feedback: [
        { type: 'positive', text: '성장 의지 표현' },
        { type: 'warning', text: '단기/장기 목표가 추상적' },
        { type: 'suggestion', text: '회사의 사업 방향과 연계된 구체적 목표 제시' },
      ],
      improved: '입사 첫 해에는 귀사의 AI 에이전트 개발 프로젝트에 참여하여 LangGraph 기반 워크플로우 최적화에 기여하고자 합니다. 3년 내 AI 팀의 핵심 리더로 성장하여, 글로벌 시장을 겨냥한 차세대 제품 개발을 주도하는 것이 목표입니다.',
    },
  ];

  const overallScore = Math.round(sections.reduce((sum, s) => sum + s.score, 0) / sections.length);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Edit3 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-xl">자소서 첨삭 결과</h2>
            <p className="text-sm text-slate-600">AI 기반 상세 피드백 및 개선 제안</p>
          </div>
        </div>

        {/* Overall Score */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">{overallScore}점</div>
          <div className="text-sm text-slate-600">종합 점수</div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {sections.map((section, index) => (
          <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">{section.title}</span>
              {section.status === 'good' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              {section.status === 'warning' && <AlertTriangle className="w-5 h-5 text-orange-600" />}
            </div>
            <div className="text-2xl font-bold text-slate-900">{section.score}점</div>
          </div>
        ))}
      </div>

      {/* Detailed Reviews */}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={index} className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-medium text-slate-900">{section.title}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                section.status === 'good' 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {section.score}점
              </span>
            </div>

            {/* Original */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1.5">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-slate-700">원본</span>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-slate-700 leading-relaxed">{section.original}</p>
              </div>
            </div>

            {/* Feedback */}
            <div className="mb-3">
              <h4 className="text-sm font-medium text-slate-700 mb-1.5">AI 피드백</h4>
              <div className="space-y-1.5">
                {section.feedback.map((fb, fbIndex) => (
                  <div key={fbIndex} className="flex items-start gap-2">
                    {fb.type === 'positive' && <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />}
                    {fb.type === 'warning' && <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />}
                    {fb.type === 'suggestion' && <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />}
                    <span className="text-sm text-slate-700">{fb.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Improved */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-slate-700">개선 예시</span>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-slate-700 leading-relaxed">{section.improved}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Items */}
      <div className="mt-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-slate-900 mb-2">✅ 개선 액션 아이템</h4>
        <ul className="space-y-1.5 text-sm text-slate-700">
          <li>• 산업 동향 분석 결과를 활용하여 기업별 맞춤 내용 추가</li>
          <li>• 모든 경험에 정량적 성과 지표 포함 (숫자, %, 기간 등)</li>
          <li>• 최신 기술 트렌드(AI, LangChain, RAG)와 연계하여 역량 강조</li>
          <li>• 목표 기업의 최근 뉴스 및 사업 전략 언급으로 진정성 표현</li>
        </ul>
      </div>
    </div>
  );
}