import { useState } from 'react';
import { Upload, FileText, User, Briefcase, Building2, Sparkles } from 'lucide-react';

interface UploadSectionProps {
  onAnalysisComplete: (data: any) => void;
}

export function UploadSection({ onAnalysisComplete }: UploadSectionProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetIndustry: '',
    targetCompany: '',
    targetPosition: '',
    experience: '',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      onAnalysisComplete({
        file: uploadedFile,
        ...formData,
      });
      setIsAnalyzing(false);
    }, 2000);
  };

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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              이름
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="홍길동"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Briefcase className="w-4 h-4 inline mr-1" />
              희망 산업군
            </label>
            <input
              type="text"
              value={formData.targetIndustry}
              onChange={(e) => setFormData({ ...formData, targetIndustry: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: IT, 금융, 제조업 등"
              required
            />
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
              required
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              경력 사항
            </label>
            <textarea
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
              placeholder="주요 경력, 프로젝트, 기술 스택 등을 간략히 입력해주세요"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!uploadedFile || isAnalyzing}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                AI 분석 중...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                AI 분석 시작
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}