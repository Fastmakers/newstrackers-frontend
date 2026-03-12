import { useEffect, useRef, useState } from 'react';
import { Loader2, Clock, ChevronRight, RefreshCw, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getJob, getJobs, getReport, Job, Report } from '../api';
import { ResumeReview } from './ResumeReview';
import { IndustryAnalysis } from './IndustryAnalysis';
import { SwotAnalysis } from './SwotAnalysis';
import { FinalReportSummary } from './FinalReportSummary';

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
  padding: '24px 28px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
};

function StatusBadge({ status, progress }: { status: Job['status']; progress: number }) {
  const styles: Record<Job['status'], { bg: string; color: string; label: string }> = {
    pending:   { bg: '#FEF9C3', color: '#854D0E', label: '대기 중' },
    running:   { bg: '#DBEAFE', color: '#1D4ED8', label: `분석 중 ${progress}%` },
    completed: { bg: '#DCFCE7', color: '#15803D', label: '완료' },
    failed:    { bg: '#FEE2E2', color: '#B91C1C', label: '실패' },
  };
  const s = styles[status];
  return (
    <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function toKST(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function DetailHeader({ onBack, job, rightSlot }: { onBack: () => void; job: Job; rightSlot?: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#6B7280', padding: 0 }}
        >
          <ArrowLeft style={{ width: '15px', height: '15px' }} />
          분석 기록
        </button>
        <div style={{ width: '1px', height: '16px', backgroundColor: '#E5E7EB' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {[
            { label: '지원 기업', val: job.company },
            { label: '직무', val: job.job_title },
            { label: '산업', val: job.industry },
          ].filter(i => i.val).map(item => (
            <div key={item.label}>
              <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '1px', fontWeight: 500 }}>{item.label}</p>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{item.val}</p>
            </div>
          ))}
        </div>
      </div>
      {rightSlot}
    </div>
  );
}

export function JobHistory() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [progressJob, setProgressJob] = useState<Job | null>(null);
  const progressPollRef = useRef<number | null>(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getJobs();
      setJobs(data);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // 최초 로드 + 5초마다 자동 새로고침 (상세 뷰 볼 때는 중단)
  useEffect(() => {
    if (selectedReport || progressJob) return;
    load();
    const timer = window.setInterval(() => load(true), 5000);
    return () => window.clearInterval(timer);
  }, [selectedReport, progressJob]);

  // 진행상황 폴링
  const stopProgressPolling = () => {
    if (progressPollRef.current !== null) {
      window.clearInterval(progressPollRef.current);
      progressPollRef.current = null;
    }
  };

  const startProgressPolling = (job: Job) => {
    progressPollRef.current = window.setInterval(async () => {
      try {
        const updated = await getJob(job.job_id);
        setProgressJob(updated);

        if (updated.status === 'completed' && updated.report_id) {
          stopProgressPolling();
          const report = await getReport(updated.report_id);
          setProgressJob(null);
          setSelectedJob(updated);
          setSelectedReport(report);
        } else if (updated.status === 'failed') {
          stopProgressPolling();
          setProgressJob(null);
          load();
        }
      } catch {
        // 일시적 네트워크 오류 무시
      }
    }, 3000);
  };

  const handleViewProgress = (job: Job) => {
    setProgressJob(job);
    startProgressPolling(job);
  };

  const handleBackFromProgress = () => {
    stopProgressPolling();
    setProgressJob(null);
    load();
  };

  const handleView = async (job: Job) => {
    if (!job.report_id) return;
    setLoadingReport(job.job_id);
    try {
      const report = await getReport(job.report_id);
      setSelectedJob(job);
      setSelectedReport(report);
    } catch {
      alert('리포트를 불러오는 데 실패했습니다.');
    } finally {
      setLoadingReport(null);
    }
  };

  const handleBack = () => {
    setSelectedJob(null);
    setSelectedReport(null);
  };

  // 리포트 상세 뷰
  if (selectedReport && selectedJob) {
    const data = { ...selectedReport, apiResponse: selectedReport };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <DetailHeader onBack={handleBack} job={selectedJob} rightSlot={<span style={{ fontSize: '12px', color: '#9CA3AF' }}>{toKST(selectedReport.created_at)}</span>} />
        <ResumeReview data={data} />
        <IndustryAnalysis data={data} />
        <SwotAnalysis data={data} />
        <FinalReportSummary data={data} />
      </div>
    );
  }

  // 진행상황 인라인 뷰
  if (progressJob) {
    const pct = progressJob.progress_pct;
    const currentStep = PIPELINE_STEPS.findLast((s) => pct >= s.pct) ?? PIPELINE_STEPS[0];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <DetailHeader onBack={handleBackFromProgress} job={progressJob} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
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
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#3182F6' }}>{pct}%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#3182F6', borderRadius: '100px', transition: 'width 0.6s ease' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {PIPELINE_STEPS.map(({ step, label, pct: sPct }) => {
                const isDone = pct >= sPct;
                const isActive = pct >= (PIPELINE_STEPS[step - 2]?.pct ?? 0) && !isDone;
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
          </div>
        </div>
      </div>
    );
  }

  // 목록 뷰
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <Loader2 style={{ width: '24px', height: '24px', color: '#3182F6' }} className="animate-spin" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div style={{ ...card, textAlign: 'center', padding: '60px 28px', color: '#9CA3AF' }}>
        <Clock style={{ width: '32px', height: '32px', margin: '0 auto 12px', color: '#CBD5E1' }} />
        <p style={{ fontSize: '15px', fontWeight: 600, color: '#6B7280' }}>분석 기록이 없습니다</p>
        <p style={{ fontSize: '13px', marginTop: '6px' }}>자소서를 업로드해 첫 번째 분석을 시작해보세요.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>분석 기록 ({jobs.length}건)</p>
        <button onClick={() => load()} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#6B7280' }}>
          <RefreshCw style={{ width: '14px', height: '14px' }} />새로고침
        </button>
      </div>

      {jobs.map((job) => (
        <div key={job.job_id} style={{ ...card, padding: '18px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            {/* 좌측 정보 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <StatusBadge status={job.status} progress={job.progress_pct} />
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{toKST(job.created_at)}</span>
              </div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>
                {job.company || '기업 미입력'}
                {job.job_title && <span style={{ fontWeight: 400, color: '#6B7280', fontSize: '14px' }}> · {job.job_title}</span>}
              </p>
              {job.industry && <p style={{ fontSize: '12px', color: '#9CA3AF' }}>{job.industry}</p>}

              {/* 진행 중일 때 progress bar */}
              {job.status === 'running' && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#3B82F6', fontWeight: 600 }}>{job.progress_pct}%</span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: '#E2E8F0', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${job.progress_pct}%`, backgroundColor: '#3182F6', borderRadius: '100px', transition: 'width 0.5s' }} />
                  </div>
                </div>
              )}

              {job.status === 'failed' && job.error_msg && (
                <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '6px' }}>오류: {job.error_msg}</p>
              )}
            </div>

            {/* 우측 액션 버튼 */}
            <div style={{ flexShrink: 0 }}>
              {job.status === 'completed' && job.report_id && (
                <button
                  onClick={() => handleView(job)}
                  disabled={loadingReport === job.job_id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '8px 14px', borderRadius: '10px',
                    fontSize: '13px', fontWeight: 600,
                    color: '#3182F6', backgroundColor: '#EFF6FF',
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  {loadingReport === job.job_id
                    ? <Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" />
                    : <><ChevronRight style={{ width: '14px', height: '14px' }} />결과 보기</>
                  }
                </button>
              )}
              {job.status === 'running' && (
                <button
                  onClick={() => handleViewProgress(job)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '8px 14px', borderRadius: '10px',
                    fontSize: '13px', fontWeight: 600,
                    color: '#1D4ED8', backgroundColor: '#DBEAFE',
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  <Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" />
                  진행상황 보기
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
