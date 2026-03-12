import { User, ChevronDown, LogIn } from "lucide-react";
import { useAuthStore } from "../store/authStore";

interface HeaderProps {
  authPanelOpen: boolean;
  onLoginClick: () => void;
  userMenuOpen: boolean;
  onUserMenuClick: () => void;
}

export function Header({
  authPanelOpen,
  onLoginClick,
  userMenuOpen,
  onUserMenuClick,
}: HeaderProps) {
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm relative z-[60]">
      <div className="max-w-[1400px] mx-auto px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-slate-900 text-2xl">
              AI 취업 전략 대시보드
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              매일경제 빅데이터 × LangGraph 기반 분석
            </p>
          </div>
          {isAuthenticated ? (
            <button id="user-menu-btn" onClick={onUserMenuClick}>
              <div className="w-15 h-15 border-2 border-blue-600 rounded-full flex items-center justify-center bg-white">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              {/* <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
              /> */}
            </button>
          ) : (
            <button
              id="auth-login-btn"
              onClick={onLoginClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                authPanelOpen
                  ? "bg-blue-700 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <LogIn className="w-4 h-4" />
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
