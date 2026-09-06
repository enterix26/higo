import React, { useState } from 'react';
import { Member } from '../types';
import { formatId, parseId, TOTAL_ACCOUNTS } from '../data/binaryTree';
import { 
  Network, 
  User, 
  LogOut, 
  Search, 
  ShieldCheck, 
  GitFork
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

    </header>
  );
};
