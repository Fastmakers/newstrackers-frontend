import { useEffect, useRef, useState } from "react";
import { User, ChevronDown } from "lucide-react";
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
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

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
    <div
      ref={panelRef}
      style={{ width: 360, borderRadius: 16, backgroundColor: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}
    >
      {/* Tab */}
      <div className="flex border-b border-slate-200 mx-1 mt-1">
        <button
          onClick={() => switchTab("login")}
          className="flex-1 py-3 text-sm font-medium transition-colors flex flex-col items-center gap-1"
        >
          <span
            className={
              tab === "login"
                ? "text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }
          >
            로그인
          </span>
          <span
            className={`h-0.5 w-8 rounded-full transition-colors ${tab === "login" ? "bg-blue-600" : "bg-transparent"}`}
          />
        </button>
        <div className="w-px bg-slate-200 my-2" />
        <button
          onClick={() => switchTab("register")}
          className="flex-1 py-3 text-sm font-medium transition-colors flex flex-col items-center gap-1"
        >
          <span
            className={
              tab === "register"
                ? "text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }
          >
            회원가입
          </span>
          <span
            className={`h-0.5 w-8 rounded-full transition-colors ${tab === "register" ? "bg-blue-600" : "bg-transparent"}`}
          />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
        {tab === "register" && (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              닉네임
            </label>
            <input
              type="text"
              required
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="닉네임 입력"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            이메일
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            비밀번호
            {tab === "register" && (
              <span className="text-slate-400 font-normal ml-1">
                (8자 이상)
              </span>
            )}
          </label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="비밀번호 입력"
          />
        </div>

        {tab === "register" && (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              비밀번호 확인
            </label>
            <input
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="비밀번호 재입력"
            />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed text-sm"
        >
          {loading ? "처리 중..." : tab === "login" ? "로그인" : "회원가입"}
        </button>

        <p className="text-center text-xs text-slate-500 pt-1 pb-6">
          {tab === "login" ? (
            <>
              계정이 없으신가요?{" "}
              <button
                type="button"
                onClick={() => switchTab("register")}
                className="text-blue-600  text-sm"
              >
                회원가입
              </button>
            </>
          ) : (
            <>
              이미 계정이 있으신가요?{" "}
              <button
                type="button"
                onClick={() => switchTab("login")}
                className="text-blue-600 text-sm"
              >
                로그인
              </button>
            </>
          )}
        </p>
      </form>
    </div>
    </div>
  );
}
