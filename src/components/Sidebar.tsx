import React from 'react';
import { LayoutDashboard, GitFork, Network, Layers, ShieldCheck } from 'lucide-react';
import { TOTAL_ACCOUNTS } from '../data/binaryTree';

interface SidebarProps {
  activeTab: 'overview' | 'tree' | 'table';
  setActiveTab: (tab: 'overview' | 'tree' | 'table') => void;
  isAdmin: boolean;
  currentMemberId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  currentMemberId,
}) => {
  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0">
      
      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
          Main Menu
        </div>

        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('overview')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-xs transition-colors ${
            activeTab === 'overview'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 ${activeTab === 'overview' ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span>Dashboard (개요)</span>
        </button>

        {/* Genealogy (Tree) */}
        <button
          onClick={() => setActiveTab('tree')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-xs transition-colors ${
            activeTab === 'tree'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <GitFork className={`w-4 h-4 ${activeTab === 'tree' ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span>Genealogy (조직도)</span>
        </button>

        {/* Sales Volume / Downline Table */}
        <button
          onClick={() => setActiveTab('table')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-xs transition-colors ${
            activeTab === 'table'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Network className={`w-4 h-4 ${activeTab === 'table' ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span>Sales Volume (명단)</span>
        </button>

        {/* System Details / Tree specs */}
        <div className="pt-4 mt-4 border-t border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
            Network Spec
          </div>
          <div className="px-2 space-y-1.5 text-[11px] text-slate-500 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">구조:</span>
              <span className="font-semibold text-slate-700">이진 트리(2k, 2k+1)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">최대 깊이:</span>
              <span className="font-semibold text-slate-700">14 Levels</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">추천 관계:</span>
              <span className="font-semibold text-indigo-600">직속 상위 노드</span>
            </div>
          </div>
        </div>
      </nav>

      {/* System Capacity Indicator matching High Density Theme */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-medium">System Capacity</span>
          <span className="font-mono text-[10px] text-indigo-600 font-bold">100%</span>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full mb-1 overflow-hidden">
          <div className="bg-indigo-500 h-1.5 rounded-full w-full" />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>{TOTAL_ACCOUNTS.toLocaleString()} Nodes Registered</span>
          <span>Max 16,384</span>
        </div>
      </div>

    </aside>
  );
};
