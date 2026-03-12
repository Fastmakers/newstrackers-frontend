/**
 * API 클라이언트
 *
 * 토큰은 localStorage('auth_token')에 저장한다.
 * 모든 인증 요청은 Authorization: Bearer <token> 헤더를 자동으로 붙인다.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ---------------------------------------------------------------------------
// 토큰 관리
// ---------------------------------------------------------------------------

export const getToken = (): string | null => localStorage.getItem('auth_token');
export const setToken = (token: string) => localStorage.setItem('auth_token', token);
export const clearToken = () => localStorage.removeItem('auth_token');

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ---------------------------------------------------------------------------
// 인증
// ---------------------------------------------------------------------------

export interface UserInfo {
  email: string;
  nickname: string;
}

export interface AuthResult {
  access_token: string;
  token_type: string;
  user: UserInfo;
}

export async function register(email: string, nickname: string, password: string): Promise<AuthResult> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, nickname, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `회원가입 실패 (${res.status})`);
  }
  return res.json();
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `로그인 실패 (${res.status})`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Job {
  job_id: string;
  status: JobStatus;
  current_step: number | null;
  step_label: string | null;
  step_detail: string | null;
  progress_pct: number;
  company: string | null;
  job_title: string | null;
  industry: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_msg: string | null;
  report_id: string | null;
}

export async function createJob(formData: FormData): Promise<{ job_id: string; status: string }> {
  const res = await fetch(`${API_BASE_URL}/api/v1/jobs`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `요청 실패 (${res.status})`);
  }
  return res.json();
}

export async function getJob(jobId: string): Promise<Job> {
  const res = await fetch(`${API_BASE_URL}/api/v1/jobs/${jobId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`job 조회 실패 (${res.status})`);
  return res.json();
}

export async function getJobs(): Promise<Job[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/jobs`, {
    headers: authHeaders(),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.jobs ?? [];
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export interface Report {
  report_id: string;
  job_id: string;
  resume_profile: any;
  matched_news: any[];
  matched_news_count: number;
  relevance_analysis: string;
  swot: any;
  final_report: string;
  created_at: string;
}

export async function getReport(reportId: string): Promise<Report> {
  const res = await fetch(`${API_BASE_URL}/api/v1/jobs/reports/${reportId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`리포트 조회 실패 (${res.status})`);
  return res.json();
}

export async function getReports(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/jobs/reports`, {
    headers: authHeaders(),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.reports ?? [];
}

// ---------------------------------------------------------------------------
// Job SSE 스트림
// ---------------------------------------------------------------------------

export interface ProgressEvent {
  type: 'progress';
  step: number;
  status: string;
  label: string;
  detail?: string;
  progress_pct: number;
}

export interface ResultEvent {
  type: 'result';
  data: any;
}

export interface ErrorEvent {
  type: 'error';
  message: string;
}

export type StreamEvent = ProgressEvent | ResultEvent | ErrorEvent;

/**
 * GET /api/v1/jobs/{jobId}/stream SSE 연결
 * 반환값은 AbortController — cancel() 으로 스트림 중단
 */
export function streamJob(
  jobId: string,
  onEvent: (e: StreamEvent) => void,
  onClose: () => void,
): AbortController {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/jobs/${jobId}/stream`, {
        headers: authHeaders(),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        onEvent({ type: 'error', message: `스트림 연결 실패 (${res.status})` });
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';
        for (const raw of events) {
          const line = raw.split('\n').find((l) => l.startsWith('data: '));
          if (!line) continue;
          try {
            const parsed: StreamEvent = JSON.parse(line.slice(6));
            onEvent(parsed);
            if (parsed.type === 'result' || parsed.type === 'error') {
              reader.cancel();
              return;
            }
          } catch {
            // JSON parse 실패 무시
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        onEvent({ type: 'error', message: err?.message ?? '스트림 오류' });
      }
    } finally {
      onClose();
    }
  })();

  return controller;
}
