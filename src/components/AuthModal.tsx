import { useEffect, useRef, useState } from "react";
import { loginUser, registerUser } from "../api/auth";
import { useAuthStore } from "../store/authStore";

type Tab = "login" | "register";

interface AuthPanelProps {
  onClose: () => void;
}

interface UserMenuPanelProps {
  onClose: () => void;
}

function useBtnPosition(btnId: string) {
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);

  const update = () => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setPos({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  };

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return pos;
}

export function UserMenuPanel({ onClose }: UserMenuPanelProps) {
  const { user, logout } = useAuthStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const pos = useBtnPosition("user-menu-btn");

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const btn = document.getElementById("user-menu-btn");
      if (btn && btn.contains(e.target as Node)) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleMouseDown);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [onClose]);

  if (!pos) return null;

  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        top: pos.top,
        right: pos.right,
        width: 176,
        zIndex: 50,
      }}
      className="bg-white rounded-xl shadow-lg border border-slate-200 py-1"
    >
      <div className="px-4 py-2.5 border-b border-slate-100">
        <p className="text-sm font-semibold text-slate-900">
          {user?.nickname}님
        </p>
        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
      </div>
      <button
        onClick={onClose}
        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
      >
        환경설정
      </button>
      <button
        onClick={() => {
          onClose();
          logout();
        }}
        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
      >
        로그아웃
      </button>
    </div>
  );
}

export function AuthPanel({ onClose }: AuthPanelProps) {
  const { setAuth } = useAuthStore();
  const [tab, setTab] = useState<Tab>("login");
  const [form, setForm] = useState({
    email: "",
    nickname: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const pos = useBtnPosition("auth-login-btn");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleMouseDown = (e: MouseEvent) => {
      const btn = document.getElementById("auth-login-btn");
      if (btn && btn.contains(e.target as Node)) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleMouseDown);
    }, 0);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [onClose]);

  const switchTab = (t: Tab) => {
    setTab(t);
    setError(null);
    setForm({ email: "", nickname: "", password: "", confirmPassword: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (tab === "register") {
      if (form.password.length < 8) {
        setError("비밀번호는 8자 이상이어야 합니다.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("비밀번호가 일치하지 않습니다.");
        return;
      }
    }

    setLoading(true);
    try {
      const res =
        tab === "login"
          ? await loginUser({ email: form.email, password: form.password })
          : await registerUser(form);
      setAuth(res.access_token, res.user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "요청 실패");
    } finally {
      setLoading(false);
    }
  };

  if (!pos) return null;

  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        top: pos.top,
        right: pos.right,
        width: 360,
        borderRadius: 16,
        backgroundColor: "#fff",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        overflow: "hidden",
        zIndex: 50,
      }}
    >
      {/* Tab */}
      <div style={{ display: "flex", borderBottom: "1px solid #E5E7EB", margin: "4px 4px 0" }}>
        {(["login", "register"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchTab(t)}
            style={{
              flex: 1,
              padding: "12px 0",
              fontSize: "14px",
              fontWeight: 500,
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              color: tab === t ? "#FF7A00" : "#9CA3AF",
              transition: "color 0.15s",
            }}
          >
            {t === "login" ? "로그인" : "회원가입"}
            <span style={{
              height: "2px",
              width: "32px",
              borderRadius: "100px",
              backgroundColor: tab === t ? "#FF7A00" : "transparent",
              transition: "background-color 0.15s",
            }} />
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {tab === "register" && (
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#616161", marginBottom: "6px" }}>
              닉네임
            </label>
            <input
              type="text"
              required
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#FF7A00")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")}
              placeholder="닉네임 입력"
            />
          </div>
        )}

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#616161", marginBottom: "6px" }}>
            이메일
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{ width: "100%", padding: "9px 12px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#FF7A00")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")}
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#616161", marginBottom: "6px" }}>
            비밀번호{tab === "register" && <span style={{ fontWeight: 400, color: "#9CA3AF", marginLeft: "4px" }}>(8자 이상)</span>}
          </label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{ width: "100%", padding: "9px 12px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#FF7A00")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")}
            placeholder="비밀번호 입력"
          />
        </div>

        {tab === "register" && (
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#616161", marginBottom: "6px" }}>
              비밀번호 확인
            </label>
            <input
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#FF7A00")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")}
              placeholder="비밀번호 재입력"
            />
          </div>
        )}

        {error && (
          <div style={{ borderRadius: "8px", border: "1px solid #FECACA", backgroundColor: "#FEF2F2", padding: "8px 12px", fontSize: "12px", color: "#DC2626" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 700,
            color: "#ffffff",
            backgroundColor: loading ? "#CBD5E1" : "#FF7A00",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.15s",
          }}
        >
          {loading ? "처리 중..." : tab === "login" ? "로그인" : "회원가입"}
        </button>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#9CA3AF", paddingBottom: "8px" }}>
          {tab === "login" ? (
            <>
              계정이 없으신가요?{" "}
              <button type="button" onClick={() => switchTab("register")} style={{ color: "#FF7A00", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: "13px" }}>
                회원가입
              </button>
            </>
          ) : (
            <>
              이미 계정이 있으신가요?{" "}
              <button type="button" onClick={() => switchTab("login")} style={{ color: "#FF7A00", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: "13px" }}>
                로그인
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
