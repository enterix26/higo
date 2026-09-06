import React, { useState, useEffect, useCallback } from 'react';
import { Member, DownlineStats } from './types';
import { 
  getMemberById, 
  getMemberByIndex, 
  calculateDownlineStats, 
  TOTAL_ACCOUNTS,
  formatId
} from './data/binaryTree';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { ProfileEditCard } from './components/ProfileEditCard';
import { DownlineOverview } from './components/DownlineOverview';
import { BinaryTreeExplorer } from './components/BinaryTreeExplorer';
import { DownlineTable } from './components/DownlineTable';
import { MemberDetailModal } from './components/MemberDetailModal';
import { AdminTools } from './components/AdminTools';

export default function App() {
  const [currentUserId, setCurrentUserId] = useState<string | null>('a01');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tree' | 'table'>('overview');
  const [tableLegFilter, setTableLegFilter] = useState<'ALL' | 'LEFT' | 'RIGHT'>('ALL');
  
  // Active member data
  const [currentMember, setCurrentMember] = useState<Member | null>(() => getMemberById('a01'));
  const [downlineStats, setDownlineStats] = useState<DownlineStats | null>(() => calculateDownlineStats(1));
  
  // Modal for editing any clicked member
  const [inspectingMember, setInspectingMember] = useState<Member | null>(null);

  // Refresh current member and stats
  const refreshMemberData = useCallback(() => {
    if (!currentUserId) {
      setCurrentMember(null);
      setDownlineStats(null);
      return;
    }

    if (currentUserId === 'admin') {
      setIsAdmin(true);
      // For admin view, focus on top root a01 by default
      const rootM = getMemberByIndex(1);
      if (rootM) {
        setCurrentMember(rootM);
        setDownlineStats(calculateDownlineStats(rootM.index));
      }
      return;
    }

    setIsAdmin(false);
    const m = getMemberById(currentUserId);
    if (m) {
      setCurrentMember(m);
      setDownlineStats(calculateDownlineStats(m.index));
    }
  }, [currentUserId]);

  useEffect(() => {
    refreshMemberData();
  }, [refreshMemberData]);

  const handleLoginSuccess = (id: string) => {
    if (id === 'admin') {
      setIsAdmin(true);
      setCurrentUserId('admin');
    } else {
      setIsAdmin(false);
      setCurrentUserId(id);
    }
    setActiveTab('overview');
  };

  const handleSwitchUser = (id: string) => {
    if (id === 'admin') {
      setIsAdmin(true);
      setCurrentUserId('admin');
    } else {
      setCurrentUserId(id);
    }
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    setIsAdmin(false);
    setCurrentMember(null);
    setDownlineStats(null);
  };

  const handleSelectLegFromOverview = (leg: 'ALL' | 'LEFT' | 'RIGHT') => {
    setTableLegFilter(leg);
    setActiveTab('table');
  };

  // If not logged in, show Login Screen
  if (!currentUserId) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      
      {/* Navigation Header */}
      <Navbar
        currentMember={currentMember}
        isAdmin={isAdmin}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Admin Tools Banner if admin logged in */}
        {isAdmin && (
          <AdminTools
            onSwitchUser={handleSwitchUser}
            onRefresh={refreshMemberData}
          />
        )}

        {/* Current Member context info */}
        {currentMember && downlineStats && (
          <>
            {/* TAB 1: OVERVIEW & PROFILE REGISTRATION / EDIT */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Profile Edit Card as requested by user:
                    "등록된 계정은 로그인하여 정보(이름,전화번호,등록아이디,매출,메모)를 등록/수정하고" */}
                <ProfileEditCard
                  member={currentMember}
                  onMemberUpdated={refreshMemberData}
                />

                {/* Downline Left / Right stats & comparison:
                    "로그인(계정)하여 산하 좌/우측 회원정보 조회가능하게 구현" */}
                <DownlineOverview
                  member={currentMember}
                  stats={downlineStats}
                  onSelectLegTab={handleSelectLegFromOverview}
                  onNavigateToMember={handleSwitchUser}
                />
              </div>
            )}

            {/* TAB 2: BINARY TREE EXPLORER */}
            {activeTab === 'tree' && (
              <BinaryTreeExplorer
                rootMember={currentMember}
                onSelectMemberForEdit={(m) => setInspectingMember(m)}
              />
            )}

            {/* TAB 3: DOWNLINE TABLE INQUIRY (LEFT / RIGHT / ALL) */}
            {activeTab === 'table' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">산하 회원 정보 상세 조회</h2>
                    <p className="text-xs text-slate-500">
                      계정 <strong className="font-mono text-blue-600">{currentMember.id}</strong> 기준 좌측 및 우측 산하 조직 명단을 조회합니다.
                    </p>
                  </div>
                </div>

                <DownlineTable
                  rootMember={currentMember}
                  initialLeg={tableLegFilter}
                  onSelectMemberForEdit={(m) => setInspectingMember(m)}
                />
              </div>
            )}
          </>
        )}

      </main>

      {/* Inspect & Edit Modal for any member clicked in Tree or Table */}
      {inspectingMember && (
        <MemberDetailModal
          member={inspectingMember}
          onClose={() => setInspectingMember(null)}
          onMemberUpdated={() => {
            refreshMemberData();
            if (inspectingMember) {
              setInspectingMember(getMemberById(inspectingMember.id));
            }
          }}
          onSwitchUser={handleSwitchUser}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-800">higo</span>
            <span>· 바이너리 MLM 마케팅 플랫폼</span>
            <span className="text-slate-300">|</span>
            <span>10,000개 계정 자동 생성 시스템</span>
          </div>
          <div className="text-[11px] text-slate-400">
            추천인: 직속 상위 아이디 연결 · 계정당 2개 분기 (좌/우 바이너리)
          </div>
        </div>
      </footer>

    </div>
  );
}
