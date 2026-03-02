import { Target, TrendingUp, AlertCircle, Shield, Zap } from 'lucide-react';

interface SwotAnalysisProps {
  data: any;
}

export function SwotAnalysis({ data }: SwotAnalysisProps) {
  const swotData = {
    strengths: [
      { text: 'LangChain/LangGraph 실무 프로젝트 경험', impact: 'high' },
      { text: 'AI 에이전트 개발 역량 보유', impact: 'high' },
      { text: '데이터 분석 및 RAG 시스템 구축 경험', impact: 'medium' },
      { text: '팀 리더십 및 프로젝트 관리 능력', impact: 'medium' },
    ],
    weaknesses: [
      { text: '대기업 실무 경험 부족', impact: 'medium' },
      { text: '도메인 특화 지식 보완 필요', impact: 'low' },
      { text: '글로벌 프로젝트 경험 제한적', impact: 'low' },
    ],
    opportunities: [
      { text: 'AI 인재 수요 급증 (시장 트렌드)', impact: 'high', source: '매일경제 산업 분석' },
      { text: '목표 기업의 AI 사업 확장', impact: 'high', source: '기업 뉴스 분석' },
      { text: '생성형 AI 프로젝트 증가', impact: 'medium', source: '산업 동향' },
      { text: '스타트업 투자 회복세', impact: 'medium', source: '매일경제 시장 분석' },
    ],
    threats: [
      { text: '경력직 선호 트렌드 증가', impact: 'medium', source: '채용 시장 분석' },
      { text: 'AI 분야 경쟁 심화', impact: 'medium', source: '산업 분석' },
      { text: '기술 변화 속도 빠름', impact: 'low', source: '기술 트렌드' },
    ],
  };

  const strategies = [
    {
      type: 'SO 전략',
      title: '강점×기회 활용 전략',
      icon: TrendingUp,
      color: 'blue',
      actions: [
        '현재 보유한 LangChain/RAG 역량을 부각하여 AI 확장 중인 기업 공략',
        '실무 프로젝트 포트폴리오를 산업 트렌드에 맞춰 재구성',
        '생성형 AI 프로젝트 경험을 자소서에 전면 배치',
      ],
    },
    {
      type: 'WO 전략',
      title: '약점 보완 전략',
      icon: Shield,
      color: 'green',
      actions: [
        '온라인 코스/인턴십으로 대기업 프로세스 이해도 향상',
        '목표 산업군 도메인 지식 집중 학습 (3개월 계획)',
        '오픈소스 프로젝트 참여로 글로벌 협업 경험 축적',
      ],
    },
    {
      type: 'ST 전략',
      title: '위협 대응 전략',
      icon: AlertCircle,
      color: 'orange',
      actions: [
        '프로젝트 기반 실무 경험을 경력으로 어필 (정량적 성과 강조)',
        '지속적인 기술 학습으로 최신 트렌드 선도',
        '차별화된 포트폴리오로 경쟁자와 차별화',
      ],
    },
    {
      type: 'WT 전략',
      title: '리스크 최소화 전략',
      icon: Zap,
      color: 'purple',
      actions: [
        '스타트업과 대기업 병행 지원으로 기회 확대',
        '네트워킹 강화 및 추천 경로 활용',
        '단기 프로젝트로 빠르게 경험 축적',
      ],
    },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'low':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getStrategyColor = (color: string) => {
    const colors: any = {
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200',
      orange: 'bg-orange-50 border-orange-200',
      purple: 'bg-purple-50 border-purple-200',
    };
    return colors[color] || colors.blue;
  };

  const getIconColor = (color: string) => {
    const colors: any = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      orange: 'text-orange-600 bg-orange-100',
      purple: 'text-purple-600 bg-purple-100',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <Target className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-xl">SWOT 분석</h2>
          <p className="text-sm text-slate-600">AI 기반 강점·약점·기회·위협 종합 분석</p>
        </div>
      </div>

      {/* SWOT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Strengths */}
        <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
          <h3 className="font-medium text-green-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            강점 (Strengths)
          </h3>
          <div className="space-y-2">
            {swotData.strengths.map((item, index) => (
              <div key={index} className="flex items-start gap-2 bg-white p-2.5 rounded-lg">
                <span className="text-green-600 font-bold">•</span>
                <div className="flex-1">
                  <span className="text-sm text-slate-700">{item.text}</span>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded border ${getImpactColor(item.impact)}`}>
                    {item.impact === 'high' ? '높음' : item.impact === 'medium' ? '중간' : '낮음'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
          <h3 className="font-medium text-red-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            약점 (Weaknesses)
          </h3>
          <div className="space-y-2">
            {swotData.weaknesses.map((item, index) => (
              <div key={index} className="flex items-start gap-2 bg-white p-2.5 rounded-lg">
                <span className="text-red-600 font-bold">•</span>
                <div className="flex-1">
                  <span className="text-sm text-slate-700">{item.text}</span>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded border ${getImpactColor(item.impact)}`}>
                    {item.impact === 'high' ? '높음' : item.impact === 'medium' ? '중간' : '낮음'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunities */}
        <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
          <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            기회 (Opportunities)
          </h3>
          <div className="space-y-2">
            {swotData.opportunities.map((item, index) => (
              <div key={index} className="flex items-start gap-2 bg-white p-2.5 rounded-lg">
                <span className="text-blue-600 font-bold">•</span>
                <div className="flex-1">
                  <span className="text-sm text-slate-700">{item.text}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 text-xs rounded border ${getImpactColor(item.impact)}`}>
                      {item.impact === 'high' ? '높음' : item.impact === 'medium' ? '중간' : '낮음'}
                    </span>
                    <span className="text-xs text-slate-500">출처: {item.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Threats */}
        <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
          <h3 className="font-medium text-orange-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            위협 (Threats)
          </h3>
          <div className="space-y-2">
            {swotData.threats.map((item, index) => (
              <div key={index} className="flex items-start gap-2 bg-white p-2.5 rounded-lg">
                <span className="text-orange-600 font-bold">•</span>
                <div className="flex-1">
                  <span className="text-sm text-slate-700">{item.text}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 text-xs rounded border ${getImpactColor(item.impact)}`}>
                      {item.impact === 'high' ? '높음' : item.impact === 'medium' ? '중간' : '낮음'}
                    </span>
                    <span className="text-xs text-slate-500">출처: {item.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Actions */}
      <div className="mb-5">
        <h3 className="font-medium text-slate-900 mb-3">전략적 액션 플랜</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {strategies.map((strategy, index) => {
            const Icon = strategy.icon;
            return (
              <div key={index} className={`border rounded-lg p-4 ${getStrategyColor(strategy.color)}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconColor(strategy.color)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">{strategy.type}</div>
                    <div className="font-medium text-slate-900">{strategy.title}</div>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {strategy.actions.map((action, aIndex) => (
                    <li key={aIndex} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-slate-400 mt-0.5">→</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Recommendation */}
      <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          최종 취업 전략 제언
        </h4>
        <p className="text-sm text-slate-700 leading-relaxed mb-3">
          귀하는 <strong>LangChain/AI 에이전트 개발</strong>이라는 현 시장에서 매우 높은 가치를 지닌 강점을 보유하고 있습니다. 
          매일경제 빅데이터 분석 결과, {data?.targetIndustry || 'IT'} 산업에서 이러한 역량을 가진 인재 수요가 급증하고 있어 
          <strong className="text-purple-700"> 높은 취업 성공 가능성</strong>이 예상됩니다.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="bg-white p-2.5 rounded-lg">
            <div className="text-xs text-slate-600 mb-1">우선순위 1</div>
            <div className="text-sm font-medium text-slate-900">실무 경험 정량화</div>
          </div>
          <div className="bg-white p-2.5 rounded-lg">
            <div className="text-xs text-slate-600 mb-1">우선순위 2</div>
            <div className="text-sm font-medium text-slate-900">산업 트렌드 반영</div>
          </div>
          <div className="bg-white p-2.5 rounded-lg">
            <div className="text-xs text-slate-600 mb-1">우선순위 3</div>
            <div className="text-sm font-medium text-slate-900">포트폴리오 강화</div>
          </div>
        </div>
      </div>
    </div>
  );
}