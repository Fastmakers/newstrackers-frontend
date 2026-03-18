/**
 * API 클라이언트
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ---------------------------------------------------------------------------
// 토큰 관리
// ---------------------------------------------------------------------------

import { useAuthStore } from './store/authStore';

export const getToken = (): string | null => useAuthStore.getState().token;
export const clearToken = () => useAuthStore.getState().logout();

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
  progress_pct: number;
  retry_count: number;
  company: string | null;
  job_title: string | null;
  industry: string | null;
  career_level: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_msg: string | null;
  report_id: string | null;
  partial_result?: {
    resume_profile?: any;
    matched_news?: any[];
    swot?: any;
    relevance_analysis?: string;
    final_report?: string;
  };
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

