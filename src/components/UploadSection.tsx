import { useEffect, useRef, useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { createJob, getJob, getReport } from '../api';

interface UploadSectionProps {
  onAnalysisComplete: (data: any) => void;
  onAnalyzingChange?: (isAnalyzing: boolean, cancel?: () => void) => void;
  reconnectJobId?: string | null;
}

const INDUSTRY_OPTIONS = [
  '반도체', 'IT 서비스', 'AI 인공지능', '게임',
  '금융', '통신', '바이오 헬스케어', '자동차 모빌리티',
  '화학/소재', '에너지 환경', '유통 커머스', '콘텐츠 미디어',
  '건설 부동산', '방산', '제조업',
];

const PIPELINE_STEPS = [
  { step: 1, label: 'PDF 파싱', pct: 10 },
  { step: 2, label: '자소서 AI 분석', pct: 25 },
  { step: 3, label: '검색 쿼리 최적화', pct: 30 },
  { step: 4, label: '관련 뉴스 하이브리드 검색', pct: 55 },
  { step: 5, label: 'SWOT + 산업 연관성 분석', pct: 80 },
  { step: 6, label: '최종 면접 리포트 생성', pct: 100 },
];

const card: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '28px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
};

export function UploadSection({ onAnalysisComplete, onAnalyzingChange, reconnectJobId }: UploadSectionProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ targetIndustry: '', targetCompany: '', targetPosition: '', careerLevel: '신입' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const pollRef = useRef<number | null>(null);

  // 기록 탭에서 "진행상황 보기" 클릭 시 진행 중인 job에 재접속
  useEffect(() => {
    if (reconnectJobId) {
      const cancel = () => {
        stopPolling();
        setIsAnalyzing(false);
        onAnalyzingChange?.(false);
      };
      setIsAnalyzing(true);
      onAnalyzingChange?.(true, cancel);
      startPolling(reconnectJobId);
    }
  }, [reconnectJobId]);

  useEffect(() => {
    if (!isAnalyzing) {
      setElapsedSeconds(0);
      setProgressPct(0);
      return;
    }
    const timer = window.setInterval(() => setElapsedSeconds((p) => p + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isAnalyzing]);

  const stopPolling = () => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = (jobId: string) => {
    pollRef.current = window.setInterval(async () => {
      try {
        const job = await getJob(jobId);
        setProgressPct(job.progress_pct);

        if (job.status === 'completed' && job.report_id) {
          stopPolling();
          const report = await getReport(job.report_id);
          setIsAnalyzing(false);
          onAnalyzingChange?.(false);
          onAnalysisComplete({ ...report, apiResponse: report });
        } else if (job.status === 'failed') {
          stopPolling();
          setIsAnalyzing(false);
          onAnalyzingChange?.(false);
          setSubmitError(job.error_msg || '분석 중 오류가 발생했습니다.');
        }
      } catch {
        // 일시적 네트워크 오류는 무시하고 계속 폴링
      }
    }, 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setUploadedFile(file); setSubmitError(null); }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadedFile) { setSubmitError('PDF 파일을 먼저 업로드해주세요.'); return; }
    setSubmitError(null);

    const payload = new FormData();
    payload.append('file', uploadedFile);
    if (formData.targetIndustry.trim()) payload.append('industry', formData.targetIndustry.trim());
    if (formData.targetCompany.trim()) payload.append('company', formData.targetCompany.trim());
    if (formData.targetPosition.trim()) payload.append('job_title', formData.targetPosition.trim());
    payload.append('career_level', formData.careerLevel);

    const cancel = () => {
      stopPolling();
      setIsAnalyzing(false);
      onAnalyzingChange?.(false);
    };

    try {
      setIsAnalyzing(true);
      onAnalyzingChange?.(true, cancel);
      setProgressPct(10);

      const { job_id } = await createJob(payload);
      startPolling(job_id);
    } catch (error) {
      setIsAnalyzing(false);
      onAnalyzingChange?.(false);
      setSubmitError(error instanceof Error ? error.message : '분석 요청 중 오류가 발생했습니다.');
    }
  };

  // ---------------------------------------------------------------------------
  // 분석 진행 중 화면
  // ---------------------------------------------------------------------------
  if (isAnalyzing) {
    const currentStep = PIPELINE_STEPS.findLast((s) => progressPct >= s.pct) ?? PIPELINE_STEPS[0];
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
        <div style={{ ...card, width: '100%', maxWidth: '440px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Loader2 style={{ width: '20px', height: '20px', color: '#3182F6', flexShrink: 0 }} className="animate-spin" />
            <div>
              <p style={{ fontWeight: 700, color: '#191F28', fontSize: '15px' }}>AI 분석 리포트 생성 중</p>
              <p style={{ fontSize: '12px', color: '#8B95A1', marginTop: '2px' }}>분석이 끝나면 결과 화면으로 이동합니다</p>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1D4ED8' }}>{currentStep.label}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#3182F6' }}>{progressPct}%</span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '100px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, backgroundColor: '#3182F6', borderRadius: '100px', transition: 'width 0.6s ease' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {PIPELINE_STEPS.map(({ step, label, pct }) => {
              const isDone = progressPct >= pct;
              const isActive = progressPct >= (PIPELINE_STEPS[step - 2]?.pct ?? 0) && !isDone;
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isDone ? (
                    <CheckCircle2 style={{ width: '16px', height: '16px', color: '#22C55E', flexShrink: 0 }} />
                  ) : isActive ? (
                    <Loader2 style={{ width: '16px', height: '16px', color: '#3182F6', flexShrink: 0 }} className="animate-spin" />
                  ) : (
                    <span style={{ width: '16px', height: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'block' }} />
                    </span>
                  )}
                  <span style={{ fontSize: '13px', color: isDone ? '#CBD5E1' : isActive ? '#191F28' : '#CBD5E1', fontWeight: isActive ? 600 : 400, textDecoration: isDone ? 'line-through' : 'none' }}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#8B95A1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
              {uploadedFile?.name ?? '분석 진행 중'}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#3182F6' }}>{elapsedSeconds}초</span>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 업로드 폼
  // ---------------------------------------------------------------------------
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div style={card}>
        <p style={{ fontWeight: 700, fontSize: '16px', color: '#191F28', marginBottom: '20px' }}>자소서 PDF 업로드</p>
        <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" id="file-upload" />
        <label
          htmlFor="file-upload"
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            width: '100%', height: '140px', borderRadius: '12px',
            border: `2px dashed ${uploadedFile ? '#3182F6' : '#CBD5E1'}`,
            backgroundColor: uploadedFile ? '#EFF6FF' : '#F8FAFC',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          {uploadedFile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText style={{ width: '20px', height: '20px', color: '#3182F6' }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#3182F6' }}>{uploadedFile.name}</span>
            </div>
          ) : (
            <>
              <Upload style={{ width: '28px', height: '28px', color: '#94A3B8', marginBottom: '10px' }} />
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>PDF 파일을 선택하세요</p>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>최대 5MB</p>
            </>
          )}
        </label>
        <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#F0F9FF', borderRadius: '10px' }}>
          <p style={{ fontSize: '13px', color: '#0369A1', lineHeight: 1.6 }}>
            💡 자소서 PDF를 업로드하면 AI가 자동으로 분석하여 맞춤형 면접 전략을 제안합니다.
          </p>
        </div>
      </div>

      <div style={card}>
        <p style={{ fontWeight: 700, fontSize: '16px', color: '#191F28', marginBottom: '20px' }}>지원 정보 입력</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {submitError && (
            <div style={{ padding: '10px 14px', backgroundColor: '#FFF2F2', borderRadius: '8px', fontSize: '13px', color: '#DC2626', border: '1px solid #FECACA' }}>
              {submitError}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '10px' }}>희망 산업군</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {INDUSTRY_OPTIONS.map((industry) => {
                const isSel = formData.targetIndustry === industry;
                return (
                  <button key={industry} type="button"
                    onClick={() => setFormData({ ...formData, targetIndustry: isSel ? '' : industry })}
                    style={{
                      padding: '5px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 500,
                      border: `1px solid ${isSel ? '#3182F6' : '#E2E8F0'}`,
                      backgroundColor: isSel ? '#3182F6' : '#F8FAFC',
                      color: isSel ? '#ffffff' : '#64748B',
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
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', color: '#191F28', backgroundColor: '#FAFAFA', outline: 'none', boxSizing: 'border-box' }}
              placeholder="목록에 없으면 직접 입력"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>목표 기업</label>
            <input type="text" value={formData.targetCompany}
              onChange={(e) => setFormData({ ...formData, targetCompany: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', color: '#191F28', backgroundColor: '#FAFAFA', outline: 'none', boxSizing: 'border-box' }}
              placeholder="예: 삼성전자, 네이버"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>희망 직무</label>
            <input type="text" value={formData.targetPosition}
              onChange={(e) => setFormData({ ...formData, targetPosition: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', color: '#191F28', backgroundColor: '#FAFAFA', outline: 'none', boxSizing: 'border-box' }}
              placeholder="예: 소프트웨어 엔지니어, 데이터 분석가"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>지원 유형</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['신입', '경력'] as const).map((level) => {
                const isSel = formData.careerLevel === level;
                return (
                  <button key={level} type="button"
                    onClick={() => setFormData({ ...formData, careerLevel: level })}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                      border: `1.5px solid ${isSel ? '#2563EB' : '#E2E8F0'}`,
                      backgroundColor: isSel ? '#EFF6FF' : '#FAFAFA',
                      color: isSel ? '#2563EB' : '#94A3B8',
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
            disabled={!uploadedFile || isAnalyzing}
            style={{
              width: '100%', padding: '13px', borderRadius: '12px',
              fontSize: '14px', fontWeight: 700, color: '#ffffff',
              backgroundColor: uploadedFile && !isAnalyzing ? '#3182F6' : '#CBD5E1',
              border: 'none',
              cursor: uploadedFile && !isAnalyzing ? 'pointer' : 'not-allowed',
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
