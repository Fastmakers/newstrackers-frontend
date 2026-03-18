import { useEffect, useRef, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { createJob, getJob, getReport } from '../api';
import { useAuthStore } from '../store/authStore';
import type { StreamingState } from './StreamingReport';

interface UploadSectionProps {
  onAnalysisComplete: (data: any) => void;
  onAnalyzingChange?: (isAnalyzing: boolean, cancel?: () => void) => void;
  onStreamingStateChange?: (state: StreamingState | null, sid: string) => void;
}

const INDUSTRY_OPTIONS = [
  '반도체', 'IT 서비스', 'AI 인공지능', '게임',
  '금융', '통신', '바이오 헬스케어', '자동차 모빌리티',
  '화학/소재', '에너지 환경', '유통 커머스', '콘텐츠 미디어',
  '건설 부동산', '방산', '제조업',
];

const card: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '28px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
};

export function UploadSection({ onAnalysisComplete, onAnalyzingChange, onStreamingStateChange }: UploadSectionProps) {
  const { isAuthenticated } = useAuthStore();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ targetIndustry: '', targetCompany: '', targetPosition: '', careerLevel: '신입' });
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamState, setStreamState] = useState<StreamingState>({
    finalReportText: '', progressPct: 10, currentLabel: 'PDF 파싱 완료', elapsedSeconds: 0,
  });
  const timerRef = useRef<number | null>(null);

  const resetForm = () => {
    setUploadedFile(null);
    setSubmitError(null);
    setFormData({ targetIndustry: '', targetCompany: '', targetPosition: '', careerLevel: '신입' });
    // file input 초기화
    const input = document.getElementById('file-upload') as HTMLInputElement | null;
    if (input) input.value = '';
  };

  // 로그아웃 시 폼 초기화
  useEffect(() => {
    if (!isAuthenticated) resetForm();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isStreaming) {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      return;
    }
    timerRef.current = window.setInterval(
      () => setStreamState(prev => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 })),
      1000,
    );
    return () => { if (timerRef.current !== null) window.clearInterval(timerRef.current); };
  }, [isStreaming]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setUploadedFile(file); setSubmitError(null); }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAuthenticated) { setSubmitError('분석을 시작하려면 로그인이 필요합니다.'); return; }
    if (!uploadedFile) { setSubmitError('PDF 파일을 먼저 업로드해주세요.'); return; }
    setSubmitError(null);

    // 각 submission마다 독립적인 ID + cancelled 플래그 (closure)
    const sid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let cancelled = false;


    const payload = new FormData();
    payload.append('file', uploadedFile);
    if (formData.targetIndustry.trim()) payload.append('industry', formData.targetIndustry.trim());
    if (formData.targetCompany.trim()) payload.append('company', formData.targetCompany.trim());
    if (formData.targetPosition.trim()) payload.append('job_title', formData.targetPosition.trim());
    payload.append('career_level', formData.careerLevel);

    const cancel = () => {
      cancelled = true;
      setIsStreaming(false);
      onStreamingStateChange?.(null, sid);
      onAnalyzingChange?.(false);
    };

    const initialState: StreamingState = {
      finalReportText: '', progressPct: 10, currentLabel: 'PDF 파싱 완료',
      elapsedSeconds: 0, uploadedFileName: uploadedFile.name,
    };
    setIsStreaming(true);
    setStreamState(initialState);
    onStreamingStateChange?.(initialState, sid);
    onAnalyzingChange?.(true, cancel);
    resetForm();

    try {
      const { job_id } = await createJob(payload);

      while (!cancelled) {
        await new Promise<void>(r => setTimeout(r, 2500));
        if (cancelled) break;

        const job = await getJob(job_id);
        const pr = job.partial_result || {};

        // elapsedSeconds는 기존 값 유지 (timer가 별도 업데이트)
        setStreamState(prev => {
          const next: StreamingState = {
            resumeProfile: pr.resume_profile,
            matchedNews: pr.matched_news,
            swot: pr.swot,
            relevanceAnalysis: pr.relevance_analysis,
            finalReportText: pr.final_report || '',
            progressPct: Math.max(10, job.progress_pct),
            currentLabel: '분석 중...',
            uploadedFileName: uploadedFile.name,
            elapsedSeconds: prev.elapsedSeconds,
          };
          onStreamingStateChange?.(next, sid);
          return next;
        });

        if (job.status === 'completed' && job.report_id) {
          const report = await getReport(job.report_id);
          setIsStreaming(false);
          onStreamingStateChange?.(null, sid);
          onAnalyzingChange?.(false);
          onAnalysisComplete({ ...report, apiResponse: report });
          break;
        }

        if (job.status === 'failed') {
          throw new Error(job.error_msg || '분석 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      if (!cancelled) {
        setSubmitError(error instanceof Error ? error.message : '분석 요청 중 오류가 발생했습니다.');
      }
      setIsStreaming(false);
      onStreamingStateChange?.(null, sid);
      onAnalyzingChange?.(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 업로드 폼
  // ---------------------------------------------------------------------------
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div style={card}>
        <p style={{ fontWeight: 700, fontSize: '16px', color: '#2B2E34', marginBottom: '20px' }}>자소서 PDF 업로드</p>
        <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" id="file-upload" />
        <label
          htmlFor="file-upload"
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            width: '100%', height: '140px', borderRadius: '12px',
            border: `2px dashed ${uploadedFile ? '#FF7A00' : '#CBD5E1'}`,
            backgroundColor: uploadedFile ? '#FFF3E8' : '#F8FAFC',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          {uploadedFile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText style={{ width: '20px', height: '20px', color: '#FF7A00' }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#FF7A00' }}>{uploadedFile.name}</span>
            </div>
          ) : (
            <>
              <Upload style={{ width: '28px', height: '28px', color: '#616161', marginBottom: '10px' }} />
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#616161' }}>PDF 파일을 선택하세요</p>
              <p style={{ fontSize: '12px', color: '#616161', marginTop: '4px' }}>최대 5MB</p>
            </>
          )}
        </label>
        <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#FFF3E8', borderRadius: '10px' }}>
          <p style={{ fontSize: '13px', color: '#E56E00', lineHeight: 1.6 }}>
            💡 자소서 PDF를 업로드하면 AI가 자동으로 분석하여 맞춤형 면접 전략을 제안합니다.
          </p>
        </div>
      </div>

      <div style={card}>
        <p style={{ fontWeight: 700, fontSize: '16px', color: '#2B2E34', marginBottom: '20px' }}>지원 정보 입력</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {submitError && (
            <div style={{ padding: '10px 14px', backgroundColor: '#FFF2F2', borderRadius: '8px', fontSize: '13px', color: '#DC2626', border: '1px solid #FECACA' }}>
              {submitError}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#616161', marginBottom: '10px' }}>희망 산업군</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {INDUSTRY_OPTIONS.map((industry) => {
                const isSel = formData.targetIndustry === industry;
                return (
                  <button key={industry} type="button"
                    onClick={() => setFormData({ ...formData, targetIndustry: isSel ? '' : industry })}
                    style={{
                      padding: '5px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 500,
                      border: `1px solid ${isSel ? '#FF7A00' : '#E2E8F0'}`,
                      backgroundColor: isSel ? '#FF7A00' : '#F8FAFC',
                      color: isSel ? '#ffffff' : '#616161',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {industry}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={INDUSTRY_OPTIONS.includes(formData.targetIndustry) ? '' : formData.targetIndustry}
              onChange={(e) => setFormData({ ...formData, targetIndustry: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', color: '#2B2E34', backgroundColor: '#FAFAFA', outline: 'none', boxSizing: 'border-box' }}
              placeholder="목록에 없으면 직접 입력"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#616161', marginBottom: '8px' }}>목표 기업</label>
            <input type="text" value={formData.targetCompany}
              onChange={(e) => setFormData({ ...formData, targetCompany: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', color: '#2B2E34', backgroundColor: '#FAFAFA', outline: 'none', boxSizing: 'border-box' }}
              placeholder="예: 삼성전자, 네이버"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#616161', marginBottom: '8px' }}>희망 직무</label>
            <input type="text" value={formData.targetPosition}
              onChange={(e) => setFormData({ ...formData, targetPosition: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', color: '#2B2E34', backgroundColor: '#FAFAFA', outline: 'none', boxSizing: 'border-box' }}
              placeholder="예: 소프트웨어 엔지니어, 데이터 분석가"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#616161', marginBottom: '8px' }}>지원 유형</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['신입', '경력'] as const).map((level) => {
                const isSel = formData.careerLevel === level;
                return (
                  <button key={level} type="button"
                    onClick={() => setFormData({ ...formData, careerLevel: level })}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                      border: `1.5px solid ${isSel ? '#FF7A00' : '#E2E8F0'}`,
                      backgroundColor: isSel ? '#FFF3E8' : '#FAFAFA',
                      color: isSel ? '#FF7A00' : '#616161',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={!uploadedFile}
            style={{
              width: '100%', padding: '13px', borderRadius: '12px',
              fontSize: '14px', fontWeight: 700, color: '#ffffff',
              backgroundColor: uploadedFile ? '#FF7A00' : '#CBD5E1',
              border: 'none',
              cursor: uploadedFile ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.15s',
            }}
          >
            AI 분석 시작
          </button>
        </form>
      </div>
    </div>
  );
}
