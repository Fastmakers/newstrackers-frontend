import { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { UploadSection } from './components/UploadSection';
import { IndustryAnalysis } from './components/IndustryAnalysis';
import { ResumeReview } from './components/ResumeReview';
import { SwotAnalysis } from './components/SwotAnalysis';
import { FinalReportSummary } from './components/FinalReportSummary';
import { FileText, TrendingUp, Edit3, Target, Download } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'analysis'>('upload');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const reportExportRef = useRef<HTMLDivElement | null>(null);

  const handleAnalysisComplete = (data: any) => {
    setAnalysisData(data);
    setActiveTab('analysis');
  };

  const tabs = [
    { id: 'upload', label: '자소서 업로드', icon: FileText },
    { id: 'analysis', label: '분석 결과', icon: TrendingUp },
  ];

  const apiResponse = analysisData?.apiResponse ?? analysisData ?? {};
  const resumeProfile = apiResponse.resume_profile ?? {};

  const makeSafeFileName = (value: string) =>
    value
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-가-힣]/g, '')
      .slice(0, 40) || 'analysis-report';

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    if (!reportExportRef.current) return;
    const target = reportExportRef.current;

    try {
      setIsExportingPdf(true);
      const dataUrl = await toPng(target, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = dataUrl;
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = 10;
      const pageWidth = 210 - margin * 2;
      const pageHeight = 297 - margin * 2;
      const imageWidth = image.width;
      const imageHeight = image.height;
      const renderedHeight = (imageHeight * pageWidth) / imageWidth;

      let heightLeft = renderedHeight;
      let position = margin;
      pdf.addImage(dataUrl, 'PNG', margin, position, pageWidth, renderedHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - renderedHeight + margin;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', margin, position, pageWidth, renderedHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const dateLabel = new Date().toISOString().slice(0, 10);
      const company = makeSafeFileName(resumeProfile.company || 'company');
      const jobTitleSlug = makeSafeFileName(resumeProfile.job_title || 'position');
      const fileName = `${dateLabel}-${company}-${jobTitleSlug}-ui-report.pdf`;
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      window.alert('PDF 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      console.error(error);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportJson = () => {
    const now = new Date();
    const dateLabel = now.toISOString().slice(0, 10);
    const company = makeSafeFileName(resumeProfile.company || 'company');
    const json = JSON.stringify(apiResponse, null, 2);

    downloadFile(json, `${dateLabel}-${company}-full-report.json`, 'application/json');
  };

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
        <div className="flex items-center gap-3">
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
          {activeTab === 'analysis' && analysisData && (
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700"
              >
                <Download className="h-4 w-4" />
                {isExportingPdf ? 'PDF 생성 중...' : 'UI 리포트(.pdf)'}
              </button>
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700"
              >
                <Download className="h-4 w-4" />
                원본(.json)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-8 py-6">
        {activeTab === 'upload' ? (
          <UploadSection onAnalysisComplete={handleAnalysisComplete} />
        ) : (
          <div className="space-y-5" ref={reportExportRef} id="report-export-root">
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
            <ResumeReview data={analysisData} />
            <IndustryAnalysis data={analysisData} />
            <SwotAnalysis data={analysisData} />
            <FinalReportSummary data={analysisData} />
          </div>
        )}
      </main>
    </div>
  );
}
