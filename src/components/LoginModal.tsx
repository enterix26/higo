import React, { useState } from 'react';
import { parseId, formatId, TOTAL_ACCOUNTS, getMemberByIndex, syncWithServer } from '../data/binaryTree';
import { 
  LogIn, 
  User, 
  KeyRound, 
  Eye, 
  EyeOff,
  Loader2
} from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (id: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [userIdInput, setUserIdInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmed = userIdInput.trim();
    if (!trimmed) {
      setErrorMsg('아이디를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Try server-side authentication
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: trimmed, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await syncWithServer();
          setIsLoading(false);
          onLoginSuccess(data.memberId);
          return;
        } else {
          setErrorMsg(data.error || '로그인에 실패했습니다.');
          setIsLoading(false);
          return;
        }
      } else if (res.status === 401 || res.status === 404 || res.status === 400) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || '아이디 또는 비밀번호가 일치하지 않습니다.');
        setIsLoading(false);
        return;
      }
    } catch {
      // Network or offline fallback: check locally
    }

    // 2. Client-side fallback authentication
    const parsed = parseId(trimmed);
    if (parsed === null) {
      setErrorMsg(`유효하지 않은 계정입니다. (a01 ~ a${TOTAL_ACCOUNTS} 또는 등록된 HiGoID)`);
      setIsLoading(false);
      return;
    }

    if (parsed === 0) {
      // admin login
      if (password !== 'admin' && password !== '1234') {
        setErrorMsg('관리자 비밀번호가 일치하지 않습니다. (기본: 1234 또는 admin)');
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      onLoginSuccess('admin');
    } else {
      const member = getMemberByIndex(parsed);
      const expectedPassword = member?.password || '1234';
      if (password !== expectedPassword) {
        setErrorMsg('비밀번호가 일치하지 않습니다.');
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      onLoginSuccess(formatId(parsed));
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col justify-center items-center px-4 py-10 font-sans">
      <div className="max-w-md w-full">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-500/20 mb-3">
            h
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">higo</h1>
          <p className="text-[11px] text-indigo-300 font-bold tracking-wider uppercase mt-1">
            Binary MLM Network Platform
          </p>
          <p className="text-xs text-slate-400 mt-1">
            바이너리 MLM 조직 관리 · 산하 좌/우 실적 대시보드
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-xl p-5 sm:p-6 shadow-xl border border-slate-200">
          <div className="mb-5 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Account Sign In</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              등록된 계정 아이디(예: a01 ~ a10000), 설정한 <strong className="text-indigo-600">HiGoID</strong>, 또는 관리자(admin)로 로그인하세요.
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 mb-4 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label htmlFor="login-id" className="block text-xs font-bold text-slate-600 mb-1">
                아이디 (등록 ID 또는 HiGoID)
              </label>
              <div className="relative">
                <input
                  id="login-id"
                  type="text"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  placeholder="예: a01, higo_top, a100, admin"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded pl-8 pr-3 py-2 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:bg-white transition-all font-mono"
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="login-pw" className="block text-xs font-bold text-slate-600">
                  비밀번호 (Password)
                </label>
                <span className="text-[10px] text-slate-400 font-mono">기본: 1234</span>
              </div>
              <div className="relative">
                <input
                  id="login-pw"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded pl-8 pr-9 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:bg-white transition-all font-mono"
                />
                <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  title={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all focus:ring-1 focus:ring-indigo-500 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>로그인 확인 중...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>로그인 및 정보 조회</span>
                </>
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
