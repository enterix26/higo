import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { formatId, parseId, TOTAL_ACCOUNTS } from '../data/binaryTree';
import { 
  Network, 
  User, 
  LogOut, 
  Search, 
  ShieldCheck, 
  GitFork,
  Globe,
  Server,
  Copy,
  Check,
  X
} from 'lucide-react';

interface NavbarProps {
  currentMember: Member | null;
  isAdmin: boolean;
  activeTab: 'overview' | 'tree' | 'table';
  setActiveTab: (tab: 'overview' | 'tree' | 'table') => void;
  onSwitchUser: (id: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMember,
  isAdmin,
  activeTab,
  setActiveTab,
  onSwitchUser,
  onLogout,
}) => {
  const [searchIdInput, setSearchIdInput] = useState('');
  const [searchError, setSearchError] = useState(false);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.ok ? setServerOnline(true) : setServerOnline(false))
      .catch(() => setServerOnline(false));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchIdInput.trim()) return;
    const parsed = parseId(searchIdInput);
    if (parsed !== null) {
      setSearchError(false);
      if (parsed === 0) {
        onSwitchUser('admin');
      } else {
        onSwitchUser(formatId(parsed));
      }
      setSearchIdInput('');
    } else {
      setSearchError(true);
      setTimeout(() => setSearchError(false), 2500);
    }
  };

  const getWebAccessUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(getWebAccessUrl());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const userInitials = isAdmin 
    ? 'AD' 
    : currentMember 
      ? (currentMember.name ? currentMember.name.slice(0, 2) : currentMember.id)
      : 'U';

  return (
    <header className="h-14 bg-[#1e293b] text-white flex items-center justify-between px-4 sm:px-6 shadow-md shrink-0 sticky top-0 z-40">
      
      {/* Brand & Logo matching High Density */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center font-bold text-lg text-white shadow-sm shrink-0">
          H
        </div>
        <div className="flex items-baseline gap-2">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            higo <span className="font-light opacity-80 text-slate-300 text-xs sm:text-sm">Network Manager</span>
          </h1>
          <span className="hidden lg:inline text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-400/30">
            바이너리 MLM
          </span>
        </div>
      </div>

      {/* Navigation Tabs (visible on mobile / medium, also synced with sidebar) */}
      <nav className="flex items-center gap-1 bg-slate-800/90 p-0.5 rounded-lg border border-slate-700 md:hidden">
        <button
          id="tab-btn-overview-mobile"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>개요</span>
        </button>
        <button
          id="tab-btn-tree-mobile"
          onClick={() => setActiveTab('tree')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
            activeTab === 'tree'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>조직도</span>
        </button>
        <button
          id="tab-btn-table-mobile"
          onClick={() => setActiveTab('table')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
            activeTab === 'table'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>회원조회</span>
        </button>
      </nav>

      {/* Right side controls: Search, Presets & User Profile Pill */}
      <div className="flex items-center gap-3 sm:gap-4 text-sm">
        
        {/* Quick ID jump search */}
        <form onSubmit={handleSearchSubmit} className="relative hidden xl:block">
          <input
            type="text"
            placeholder="계정/HiGoID (예: a02)"
            value={searchIdInput}
            onChange={(e) => {
              setSearchIdInput(e.target.value);
              if (searchError) setSearchError(false);
            }}
            className={`w-40 bg-slate-800 border rounded px-3 pl-8 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 ${
              searchError ? 'border-rose-500 focus:ring-rose-500 ring-1 ring-rose-500' : 'border-slate-700 focus:ring-indigo-500'
            }`}
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
        </form>

        {/* Server & Web Access Status Button */}
        <button
          id="btn-server-access-info"
          onClick={() => setIsServerModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition-colors"
          title="서버 접속 및 회원 공유 안내"
        >
          <span className={`w-2 h-2 rounded-full ${serverOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
          <Server className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline font-medium text-[11px]">서버 연동</span>
        </button>

        {/* User Info Label & Avatar (High Density styling) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex flex-col items-end leading-tight">
            {isAdmin ? (
              <>
                <span className="font-medium text-xs sm:text-sm text-slate-100 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  admin (Administrator)
                </span>
                <span className="text-[10px] opacity-70 text-indigo-300">Admin Dashboard</span>
              </>
            ) : currentMember ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-xs sm:text-sm text-slate-100">
                    {currentMember.id}
                  </span>
                  {currentMember.higoId && (
                    <span className="text-[10px] px-1 py-0.2 rounded bg-indigo-500/30 text-indigo-300 font-mono border border-indigo-400/30">
                      {currentMember.higoId}
                    </span>
                  )}
                  <span className="text-slate-300 text-xs">
                    ({currentMember.name || '회원'})
                  </span>
                </div>
                <span className="text-[10px] opacity-70 text-slate-400">
                  {currentMember.generation}대 · 추천: {currentMember.sponsorId}
                </span>
              </>
            ) : null}
          </div>

          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-700 border-2 border-indigo-400 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white uppercase">{userInitials}</span>
          </div>

          {/* Logout */}
          <button
            id="btn-logout"
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
            title="로그아웃"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Server Access & Sharing Info Modal */}
      {isServerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-5 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">서버 연결 및 웹 접속 안내</h3>
                  <p className="text-[11px] text-slate-400">실시간 데이터베이스 및 회원 개별 브라우저 접속</p>
                </div>
              </div>
              <button
                onClick={() => setIsServerModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Status */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80">
                <span className="text-slate-300 font-medium">서버 구동 상태:</span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {serverOnline ? '정상 운영 중 (Port 3000)' : '연결 확인 중'}
                </span>
              </div>

              {/* Web URL to share */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                  회원 브라우저 접속 웹 주소:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getWebAccessUrl()}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-indigo-300 font-mono select-all focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition-colors text-xs"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>복사됨!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>URL 복사</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  위 주소를 회원들에게 전달하면 각자 스마트폰 및 PC 브라우저로 접속할 수 있습니다.
                </p>
              </div>

              {/* How Members Use */}
              <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/40 text-slate-300 space-y-1.5">
                <div className="font-bold text-indigo-300 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>회원 개별 로그인 & 정보 관리 안내</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                  <li><strong>로그인:</strong> 부여받은 계정 ID(예: <span className="font-mono text-indigo-200">a01 ~ a10000</span>) 또는 등록된 <span className="text-indigo-200 font-bold">HiGoID</span>와 비밀번호(기본: <span className="font-mono">1234</span>) 입력</li>
                  <li><strong>정보 열람:</strong> 자신의 산하 바이너리 조직도, 좌/우측 인원 및 합계 매출 실시간 확인</li>
                  <li><strong>정보 수정:</strong> 상단 [개인정보 수정]에서 이름, 연락처, 비밀번호, 본인 매출, HiGoID를 직접 수정 가능</li>
                  <li><strong>실시간 동기화:</strong> 각 회원이 수정한 정보는 서버에 즉시 영구 저장되며, 다른 모든 회원과 관리자 화면에 실시간 반영됩니다.</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsServerModalOpen(false)}
                className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};
