import { useState } from 'react';
import { UploadSection } from './components/UploadSection';
import { IndustryAnalysis } from './components/IndustryAnalysis';
import { ResumeReview } from './components/ResumeReview';
import { SwotAnalysis } from './components/SwotAnalysis';
import { FileText, TrendingUp, Edit3, Target } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'analysis'>('upload');
  const [analysisData, setAnalysisData] = useState<any>(null);

  const handleAnalysisComplete = (data: any) => {
    setAnalysisData(data);
    setActiveTab('analysis');
  };

  const tabs = [
    { id: 'upload', label: '자소서 업로드', icon: FileText },
    { id: 'analysis', label: '분석 결과', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-slate-900 text-2xl">AI 취업 전략 대시보드</h1>
              <p className="text-sm text-slate-600 mt-1">매일경제 빅데이터 × LangGraph 기반 분석</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-900">AI 분석 준비 완료</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-[1400px] mx-auto px-8 mt-6">
        <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-8 py-6">
        {activeTab === 'upload' ? (
          <UploadSection onAnalysisComplete={handleAnalysisComplete} />
        ) : (
          <div className="space-y-5">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">분석 완료</p>
                    <p className="font-bold text-slate-900 text-xl">산업 동향</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Edit3 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">첨삭 완료</p>
                    <p className="font-bold text-slate-900 text-xl">자소서 리뷰</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">전략 수립</p>
                    <p className="font-bold text-slate-900 text-xl">SWOT 분석</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Sections */}
            <IndustryAnalysis data={analysisData} />
            <ResumeReview data={analysisData} />
            <SwotAnalysis data={analysisData} />
          </div>
        )}
      </main>
    </div>
  );
}