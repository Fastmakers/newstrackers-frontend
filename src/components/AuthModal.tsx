import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { login, register, setToken, UserInfo } from '../api';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: UserInfo, token: string) => void;
}

export function AuthModal({ onClose, onLogin }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#191F28',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#FAFAFA',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = mode === 'login'
        ? await login(email, password)
        : await register(email, nickname, password);
      setToken(result.access_token);
      onLogin(result.user, result.access_token);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // backdrop
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      {/* modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '28px',
          width: '100%',
          maxWidth: '380px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
        >
          <X style={{ width: '18px', height: '18px', color: '#9CA3AF' }} />
        </button>

        {/* 탭 */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '24px', backgroundColor: '#F3F4F6', borderRadius: '10px', padding: '3px' }}>
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); }}
              style={{
                flex: 1, padding: '8px', fontSize: '14px', fontWeight: 600,
                border: 'none', borderRadius: '8px', cursor: 'pointer',
                backgroundColor: mode === m ? '#fff' : 'transparent',
                color: mode === m ? '#111827' : '#9CA3AF',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {m === 'login' ? '로그인' : '회원가입'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div style={{ padding: '10px 14px', backgroundColor: '#FFF2F2', borderRadius: '8px', fontSize: '13px', color: '#DC2626', border: '1px solid #FECACA' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>이메일</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="name@example.com" />
          </div>

          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>닉네임</label>
              <input type="text" required value={nickname} onChange={(e) => setNickname(e.target.value)} style={inputStyle} placeholder="홍길동" />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>비밀번호</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} placeholder={mode === 'register' ? '6자 이상' : '••••••'} />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              fontSize: '14px', fontWeight: 700,
              color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              backgroundColor: loading ? '#CBD5E1' : '#3182F6',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              marginTop: '4px',
            }}
          >
            {loading && <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />}
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '가입하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
