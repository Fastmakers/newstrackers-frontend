import { useEffect, useRef, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { streamAnalysis } from '../api';
import { StreamingReport } from './StreamingReport';
import type { StreamingState } from './StreamingReport';

interface UploadSectionProps {
  onAnalysisComplete: (data: any) => void;
  onAnalyzingChange?: (isAnalyzing: boolean, cancel?: () => void) => void;
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

const STEP_PROGRESS: Record<string, number> = {
  '2-done': 25, '3-done': 30, '4-done': 55, '5-done': 80, '6-start': 82, '6-done': 100,
};

export function UploadSection({ onAnalysisComplete, onAnalyzingChange }: UploadSectionProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ targetIndustry: '', targetCompany: '', targetPosition: '', careerLevel: '신입' });
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamState, setStreamState] = useState<StreamingState>({
    finalReportText: '', progressPct: 10, currentLabel: 'PDF 파싱 완료', elapsedSeconds: 0,
  });
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isStreaming) {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      return;
    }
    setStreamState(prev => ({ ...prev, elapsedSeconds: 0 }));
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
    if (!uploadedFile) { setSubmitError('PDF 파일을 먼저 업로드해주세요.'); return; }
    setSubmitError(null);

    const payload = new FormData();
    payload.append('file', uploadedFile);
    if (formData.targetIndustry.trim()) payload.append('industry', formData.targetIndustry.trim());
    if (formData.targetCompany.trim()) payload.append('company', formData.targetCompany.trim());
    if (formData.targetPosition.trim()) payload.append('job_title', formData.targetPosition.trim());
    payload.append('career_level', formData.careerLevel);

    const controller = new AbortController();
    abortRef.current = controller;

    const cancel = () => {
      controller.abort();
      setIsStreaming(false);
      onAnalyzingChange?.(false);
    };

    setIsStreaming(true);
    setStreamState({ finalReportText: '', progressPct: 10, currentLabel: 'PDF 파싱 완료', elapsedSeconds: 0, uploadedFileName: uploadedFile.name });
    onAnalyzingChange?.(true, cancel);

    try {
      await streamAnalysis(payload, (event) => {
        if (event.type === 'progress') {
          const pct = STEP_PROGRESS[`${event.step}-${event.status}`];
          setStreamState(prev => ({
            ...prev,
            ...(pct !== undefined ? { progressPct: Math.max(prev.progressPct, pct) } : {}),
            currentLabel: event.label,
          }));
        } else if (event.type === 'partial') {
          if (event.field === 'resume_profile') {
            setStreamState(prev => ({ ...prev, resumeProfile: event.data }));
          } else if (event.field === 'matched_news') {
            setStreamState(prev => ({ ...prev, matchedNews: event.data }));
          } else if (event.field === 'swot') {
            setStreamState(prev => ({ ...prev, swot: event.data }));
          } else if (event.field === 'relevance_analysis') {
            setStreamState(prev => ({ ...prev, relevanceAnalysis: event.data }));
          }
        } else if (event.type === 'token') {
          setStreamState(prev => ({ ...prev, finalReportText: prev.finalReportText + event.token }));
        } else if (event.type === 'result') {
          setIsStreaming(false);
          onAnalyzingChange?.(false);
          onAnalysisComplete({ ...event.data, apiResponse: event.data });
        } else if (event.type === 'error') {
          setIsStreaming(false);
          onAnalyzingChange?.(false);
          setSubmitError(event.message);
        }
      }, controller.signal);
    } catch (error) {
      if (!controller.signal.aborted) {
        setSubmitError(error instanceof Error ? error.message : '분석 요청 중 오류가 발생했습니다.');
      }
      setIsStreaming(false);
      onAnalyzingChange?.(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 스트리밍 진행 중 화면 — 단계별 결과 등장
  // ---------------------------------------------------------------------------
  if (isStreaming) {
    return <StreamingReport {...streamState} />;
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
