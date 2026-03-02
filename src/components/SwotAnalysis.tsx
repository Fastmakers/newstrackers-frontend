import { Target, TrendingUp, AlertCircle, Shield, Zap } from 'lucide-react';

interface SwotAnalysisProps {
  data: any;
}

export function SwotAnalysis({ data }: SwotAnalysisProps) {
  const apiResponse = data?.apiResponse ?? data ?? {};
  const swot = apiResponse.swot ?? {};

  const swotData = {
    strengths: Array.isArray(swot.strengths) ? swot.strengths : [],
    weaknesses: Array.isArray(swot.weaknesses) ? swot.weaknesses : [],
    opportunities: Array.isArray(swot.opportunities) ? swot.opportunities : [],
    threats: Array.isArray(swot.threats) ? swot.threats : [],
  };

  const strategies = [
    {
      type: 'SO 전략',
      title: '강점×기회 활용 전략',
      icon: TrendingUp,
      color: 'blue',
      actions: [
        swotData.strengths[0] || '핵심 강점을 산업 기회와 직접 연결해 자소서에 강조하세요.',
        swotData.opportunities[0] || '산업 성장 이슈에 맞춘 프로젝트 경험을 준비하세요.',
      ],
    },
    {
      type: 'WO 전략',
      title: '약점 보완 전략',
      icon: Shield,
      color: 'green',
      actions: [
        swotData.weaknesses[0] || '약점 영역은 학습 계획과 실습 프로젝트로 보완하세요.',
        '면접에서 약점 보완 계획(기간/방법/성과지표)을 함께 제시하세요.',
      ],
    },
    {
      type: 'ST 전략',
      title: '위협 대응 전략',
      icon: AlertCircle,
      color: 'orange',
      actions: [
        swotData.threats[0] || '경쟁 심화에 대비해 차별화 포인트를 숫자로 증명하세요.',
        '직무 관련 최신 트렌드를 정기적으로 업데이트해 대응력을 유지하세요.',
      ],
    },
    {
      type: 'WT 전략',
      title: '리스크 최소화 전략',
      icon: Zap,
      color: 'purple',
      actions: [
        '지원 포지션을 단일 직무에 고정하지 말고 유사 직무까지 확장하세요.',
        '포트폴리오/이력서/자소서에 동일한 핵심 메시지를 일관되게 반영하세요.',
      ],
    },
  ];

  const getStrategyColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200',
      orange: 'bg-orange-50 border-orange-200',
      purple: 'bg-purple-50 border-purple-200',
    };
    return colors[color] || colors.blue;
  };

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      orange: 'text-orange-600 bg-orange-100',
      purple: 'text-purple-600 bg-purple-100',
    };
    return colors[color] || colors.blue;
  };

  const renderSwotList = (items: string[], emptyText: string, dotColor: string) => {
    if (items.length === 0) {
      return <div className="text-sm text-slate-600 bg-white p-2.5 rounded-lg">{emptyText}</div>;
    }

    return items.map((item, index) => (
      <div key={index} className="flex items-start gap-2 bg-white p-2.5 rounded-lg">
        <span className={`font-bold ${dotColor}`}>•</span>
        <span className="text-sm text-slate-700">{item}</span>
      </div>
    ));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <Target className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-xl">SWOT 분석</h2>
          <p className="text-sm text-slate-600">API 응답 기반 강점·약점·기회·위협 분석</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
          <h3 className="font-medium text-green-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            강점 (Strengths)
          </h3>
          <div className="space-y-2">{renderSwotList(swotData.strengths, '강점 데이터가 없습니다.', 'text-green-600')}</div>
        </div>

        <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
          <h3 className="font-medium text-red-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            약점 (Weaknesses)
          </h3>
          <div className="space-y-2">{renderSwotList(swotData.weaknesses, '약점 데이터가 없습니다.', 'text-red-600')}</div>
        </div>

        <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
          <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            기회 (Opportunities)
          </h3>
          <div className="space-y-2">{renderSwotList(swotData.opportunities, '기회 데이터가 없습니다.', 'text-blue-600')}</div>
        </div>

        <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
          <h3 className="font-medium text-orange-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            위협 (Threats)
          </h3>
          <div className="space-y-2">{renderSwotList(swotData.threats, '위협 데이터가 없습니다.', 'text-orange-600')}</div>
        </div>
      </div>

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
    </div>
  );
}
