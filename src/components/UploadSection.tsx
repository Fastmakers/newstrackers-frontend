import { useEffect, useState } from 'react';
import { Upload, FileText, User, Briefcase, Building2, Sparkles, Loader2 } from 'lucide-react';

interface UploadSectionProps {
  onAnalysisComplete: (data: any) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const INDUSTRY_OPTIONS = [
  '반도체',
  'AI 인공지능',
  '금융',
  '제조업',
  '바이오 헬스케어',
  '유통 커머스',
  '콘텐츠 미디어',
  '에너지 환경',
  '자동차 모빌리티',
  '건설 부동산',
  '방산',
];
const LOADING_STEPS = [
  'PDF 내용을 읽고 있습니다...',
  '핵심 경험과 스킬을 추출하고 있습니다...',
  '산업 뉴스 연관도를 분석하고 있습니다...',
  'SWOT와 최종 리포트를 생성하고 있습니다...',
];

export function UploadSection({ onAnalysisComplete }: UploadSectionProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    targetIndustry: '',
    targetCompany: '',
    targetPosition: '',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) {
      setLoadingStepIndex(0);
      setElapsedSeconds(0);
      return;
    }

    const stepTimer = window.setInterval(() => {
      setLoadingStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 3000);

    const elapsedTimer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      window.clearInterval(stepTimer);
      window.clearInterval(elapsedTimer);
    };
  }, [isAnalyzing]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setSubmitError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) {
      setSubmitError('PDF 파일을 먼저 업로드해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setSubmitError(null);

    try {
      const payload = new FormData();
      payload.append('file', uploadedFile);
      if (formData.targetIndustry.trim()) {
        payload.append('industry', formData.targetIndustry.trim());
      }
      if (formData.targetCompany.trim()) {
        payload.append('company', formData.targetCompany.trim());
      }
      if (formData.targetPosition.trim()) {
        payload.append('job_title', formData.targetPosition.trim());
      }
      payload.append('include_raw_news', 'true');

      const response = await fetch(`${API_BASE_URL}/api/v1/analysis/report`, {
        method: 'POST',
        body: payload,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `요청 실패 (${response.status})`);
      }

      const reportData = await response.json().catch(() => ({}));
      onAnalysisComplete({
        file: uploadedFile,
        ...formData,
        ...reportData,
        apiResponse: reportData,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '분석 요청 중 알 수 없는 오류가 발생했습니다.';
      setSubmitError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-2xl rounded-2xl border border-blue-100 bg-white shadow-xl p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">AI 분석 리포트 생성 중</h3>
              <p className="text-sm text-slate-600">분석이 끝나면 결과 화면으로 자동 이동합니다</p>
            </div>
          </div>

          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-blue-800 animate-pulse">
              {LOADING_STEPS[loadingStepIndex]}
            </p>
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            {LOADING_STEPS.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    index <= loadingStepIndex ? 'bg-blue-500' : 'bg-slate-300'
                  }`}
                />
                <span>{step}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">{uploadedFile?.name || 'PDF 파일'} 처리 중</span>
            <span className="font-semibold text-blue-700">{elapsedSeconds}초 경과</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Upload Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="font-bold text-slate-900 text-xl">자소서 업로드</h2>
        </div>

        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer bg-slate-50">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <Upload className="w-10 h-10 text-slate-400 mb-3" />
              {uploadedFile ? (
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">{uploadedFile.name}</span>
                </div>
              ) : (
                <>
                  <p className="font-medium text-slate-900 mb-1">PDF 파일을 업로드하세요</p>
                  <p className="text-sm text-slate-500">또는 클릭하여 파일 선택</p>
                </>
              )}
            </div>
          </label>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>💡 Tip:</strong> 자소서 PDF를 업로드하면 AI가 자동으로 분석하여 개선점을 제안합니다.
          </p>
        </div>
      </div>

      {/* Information Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="font-bold text-slate-900 text-xl">지원 정보 입력</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Briefcase className="w-4 h-4 inline mr-1" />
              희망 산업군
            </label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRY_OPTIONS.map((industry) => {
                const isSelected = formData.targetIndustry === industry;
                return (
                  <button
                    key={industry}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        targetIndustry: isSelected ? '' : industry,
                      })
                    }
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-blue-300 hover:text-blue-700'
                    }`}
                  >
                    {industry}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Building2 className="w-4 h-4 inline mr-1" />
              목표 기업
            </label>
            <input
              type="text"
              value={formData.targetCompany}
              onChange={(e) => setFormData({ ...formData, targetCompany: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 삼성전자, 네이버 등"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              희망 직무
            </label>
            <input
              type="text"
              value={formData.targetPosition}
              onChange={(e) => setFormData({ ...formData, targetPosition: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 소프트웨어 엔지니어, 데이터 분석가 등"
            />
          </div>

          <button
            type="submit"
            disabled={!uploadedFile || isAnalyzing}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            AI 분석 시작
          </button>
        </form>
      </div>
    </div>
  );
}
