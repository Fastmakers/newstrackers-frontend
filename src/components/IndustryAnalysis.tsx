import { TrendingUp, Newspaper, AlertCircle, CheckCircle } from 'lucide-react';

interface IndustryAnalysisProps {
  data: any;
}

export function IndustryAnalysis({ data }: IndustryAnalysisProps) {
  // Mock data for demonstration
  const industryTrends = [
    {
      title: 'AI·반도체 투자 급증, 삼성·SK하이닉스 경쟁 치열',
      source: '매일경제',
      date: '2026.01.18',
      summary: '글로벌 AI 반도체 시장이 연평균 35% 성장하며, 국내 기업들의 투자가 가속화되고 있습니다. 특히 HBM(고대역폭메모리) 시장에서 삼성전자와 SK하이닉스의 경쟁이 치열해지고 있으며, 엔비디아와의 파트너십이 핵심 변수로 작용하고 있습니다.',
      relevance: 95,
      keywords: ['AI', '반도체', 'HBM', '투자'],
    },
    {
      title: '디지털 전환 가속화, IT 인재 수요 폭증',
      source: '매일경제',
      date: '2026.01.15',
      summary: '기업들의 디지털 트랜스포메이션이 본격화되면서 클라우드, 빅데이터, AI 전문 인력 수요가 급증하고 있습니다. 특히 LangChain, RAG 등 생성형 AI 관련 기술을 보유한 인재에 대한 경쟁이 치열합니다.',
      relevance: 88,
      keywords: ['디지털전환', 'AI인재', '클라우드', 'LangChain'],
    },
    {
      title: '스타트업 투자 회복세, 테크 기업 채용 재개',
      source: '매일경제',
      date: '2026.01.12',
      summary: '침체기를 벗어난 스타트업 투자 시장이 회복세를 보이며, 주요 테크 기업들이 선별적 채용을 재개하고 있습니다. AI, 핀테크, 헬스케어 분야가 특히 주목받고 있습니다.',
      relevance: 82,
      keywords: ['스타트업', '투자', '채용', '테크'],
    },
  ];

  const keyInsights = [
    { text: 'AI/ML 기술 역량이 채용 시장의 핵심 경쟁력', type: 'positive' },
    { text: '대기업의 경력직 선호도 증가 추세', type: 'warning' },
    { text: '프로젝트 기반 실무 경험이 중요', type: 'positive' },
    { text: '산업 도메인 지식과 기술의 융합 필요', type: 'info' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-xl">산업 동향 분석</h2>
          <p className="text-sm text-slate-600">매일경제 빅데이터 기반 {data?.targetIndustry || 'IT'} 산업 트렌드</p>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mb-5 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h3 className="font-medium text-slate-900 mb-3">핵심 인사이트</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {keyInsights.map((insight, index) => (
            <div key={index} className="flex items-start gap-2">
              {insight.type === 'positive' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
              {insight.type === 'warning' && <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />}
              {insight.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />}
              <span className="text-sm text-slate-700">{insight.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* News Articles */}
      <div className="space-y-3">
        <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
          <Newspaper className="w-5 h-5" />
          관련 뉴스 분석 ({industryTrends.length}건)
        </h3>

        {industryTrends.map((trend, index) => (
          <div key={index} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 mb-1">{trend.title}</h4>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span>{trend.source}</span>
                  <span>•</span>
                  <span>{trend.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full">
                <span className="text-xs font-medium text-blue-700">관련도</span>
                <span className="font-bold text-blue-900">{trend.relevance}%</span>
              </div>
            </div>

            <p className="text-sm text-slate-700 mb-2 leading-relaxed">{trend.summary}</p>

            <div className="flex flex-wrap gap-2">
              {trend.keywords.map((keyword, kIndex) => (
                <span
                  key={kIndex}
                  className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                >
                  #{keyword}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* AI Analysis Summary */}
      <div className="mt-5 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h4 className="font-medium text-slate-900 mb-2">🤖 AI 종합 분석</h4>
        <p className="text-sm text-slate-700 leading-relaxed">
          현재 {data?.targetIndustry || 'IT'} 산업은 <strong>AI 기술 혁신</strong>을 중심으로 빠르게 변화하고 있습니다. 
          {data?.targetCompany || '목표 기업'}의 경우, 생성형 AI와 데이터 분석 역량을 갖춘 인재를 적극 채용 중이며, 
          특히 <strong>실무 프로젝트 경험</strong>과 <strong>최신 기술 스택</strong> 활용 능력을 중요하게 평가합니다. 
          귀하의 {data?.targetPosition || '목표 직무'} 지원 시, 이러한 트렌드에 맞춘 역량 강화가 필요합니다.
        </p>
      </div>
    </div>
  );
}