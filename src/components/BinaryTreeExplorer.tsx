import React, { useState } from 'react';
import { Member } from '../types';
import { getMemberByIndex, TOTAL_ACCOUNTS, formatId } from '../data/binaryTree';
import { 
  GitFork, 
  ChevronUp, 
  UserCheck, 
  DollarSign, 
  Phone, 
  ExternalLink,
  ChevronRight,
  Home,
  ZoomIn,
  Sparkles
} from 'lucide-react';

interface BinaryTreeExplorerProps {
  rootMember: Member;
  onSelectMemberForEdit: (member: Member) => void;
}

export const BinaryTreeExplorer: React.FC<BinaryTreeExplorerProps> = ({
  rootMember,
  onSelectMemberForEdit,
}) => {
  // Current view focus node (defaults to logged in user)
  const [focusIndex, setFocusIndex] = useState<number>(rootMember.index);
  const [historyStack, setHistoryStack] = useState<number[]>([rootMember.index]);

  const currentFocus = getMemberByIndex(focusIndex) || rootMember;

  // Level 1: Focus node
  // Level 2: Left (2k), Right (2k+1)
  // Level 3: 4 nodes: 4k, 4k+1, 4k+2, 4k+3
  const leftChildIdx = focusIndex * 2 <= TOTAL_ACCOUNTS ? focusIndex * 2 : null;
  const rightChildIdx = focusIndex * 2 + 1 <= TOTAL_ACCOUNTS ? focusIndex * 2 + 1 : null;

  const leftMember = leftChildIdx ? getMemberByIndex(leftChildIdx) : null;
  const rightMember = rightChildIdx ? getMemberByIndex(rightChildIdx) : null;

  const gcLeftLeftIdx = leftChildIdx && leftChildIdx * 2 <= TOTAL_ACCOUNTS ? leftChildIdx * 2 : null;
  const gcLeftRightIdx = leftChildIdx && leftChildIdx * 2 + 1 <= TOTAL_ACCOUNTS ? leftChildIdx * 2 + 1 : null;
  const gcRightLeftIdx = rightChildIdx && rightChildIdx * 2 <= TOTAL_ACCOUNTS ? rightChildIdx * 2 : null;
  const gcRightRightIdx = rightChildIdx && rightChildIdx * 2 + 1 <= TOTAL_ACCOUNTS ? rightChildIdx * 2 + 1 : null;

  const gcLeftLeft = gcLeftLeftIdx ? getMemberByIndex(gcLeftLeftIdx) : null;
  const gcLeftRight = gcLeftRightIdx ? getMemberByIndex(gcLeftRightIdx) : null;
  const gcRightLeft = gcRightLeftIdx ? getMemberByIndex(gcRightLeftIdx) : null;
  const gcRightRight = gcRightRightIdx ? getMemberByIndex(gcRightRightIdx) : null;

  const handleDrillDown = (idx: number) => {
    setFocusIndex(idx);
    setHistoryStack((prev) => [...prev, idx]);
  };

  const handleGoUp = () => {
    if (historyStack.length <= 1) return;
    const newStack = [...historyStack];
    newStack.pop();
    const parentIdx = newStack[newStack.length - 1];
    setHistoryStack(newStack);
    setFocusIndex(parentIdx);
  };

  const handleResetToUser = () => {
    setFocusIndex(rootMember.index);
    setHistoryStack([rootMember.index]);
  };

  const renderNodeCard = (
    m: Member | null, 
    idx: number | null, 
    label: string, 
    tagColor: 'blue' | 'emerald' | 'indigo' | 'slate'
  ) => {
    if (!idx || idx > TOTAL_ACCOUNTS) {
      return (
        <div className="w-full bg-slate-50/60 rounded-xl border border-dashed border-slate-200 p-3 text-center text-slate-400 text-xs">
          미배정 (계정 없음)
        </div>
      );
    }

    if (!m) return null;

    const isCurrentFocus = m.index === focusIndex;
    const colorClasses = {
      blue: 'border-indigo-200 bg-indigo-50 text-indigo-800',
      emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      indigo: 'border-indigo-400 bg-indigo-900/60 text-indigo-200',
      slate: 'border-slate-200 bg-slate-100 text-slate-700',
    }[tagColor];

    return (
      <div 
        className={`relative w-full rounded-lg border transition-all p-3 text-left shadow-sm ${
          isCurrentFocus 
            ? 'bg-[#1e293b] text-white border-2 border-indigo-400 shadow-md' 
            : 'bg-white border-slate-200 hover:border-indigo-300'
        }`}
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${colorClasses}`}>
            {label}
          </span>
          <span className={`text-[10px] font-mono font-bold ${isCurrentFocus ? 'text-indigo-300' : 'text-slate-400'}`}>
            {m.generation}대
          </span>
        </div>

        {/* ID and Name */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className={`text-xs sm:text-sm font-bold font-mono tracking-tight shrink-0 ${isCurrentFocus ? 'text-white' : 'text-slate-900'}`}>
              {m.id}
            </span>
            {m.higoId && (
              <span className={`text-[9px] font-mono px-1 py-0.2 rounded truncate max-w-[70px] ${
                isCurrentFocus ? 'bg-indigo-500/40 text-indigo-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {m.higoId}
              </span>
            )}
          </div>
          <span className={`text-xs font-semibold truncate max-w-[80px] shrink-0 ${isCurrentFocus ? 'text-slate-200' : 'text-slate-700'}`}>
            {m.name || '미등록'}
          </span>
        </div>

        {/* Phone & Sales */}
        <div className={`space-y-0.5 text-[10px] mb-2.5 font-mono ${isCurrentFocus ? 'text-slate-300' : 'text-slate-500'}`}>
          <div className="flex items-center justify-between">
            <span className={isCurrentFocus ? 'text-slate-400' : 'text-slate-400'}>매출:</span>
            <span className={`font-bold ${isCurrentFocus ? 'text-indigo-300' : 'text-indigo-700'}`}>
              {m.sales ? `${m.sales.toLocaleString()}원` : '0원'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={isCurrentFocus ? 'text-slate-400' : 'text-slate-400'}>연락처:</span>
            <span className="truncate max-w-[100px]">{m.phone}</span>
          </div>
        </div>

        {/* Actions */}
        <div className={`flex items-center gap-1.5 pt-2 border-t ${isCurrentFocus ? 'border-slate-700' : 'border-slate-100'}`}>
          <button
            onClick={() => onSelectMemberForEdit(m)}
            className={`flex-1 py-1 px-2 rounded text-[10px] font-semibold text-center transition-colors ${
              isCurrentFocus 
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-100' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            수정
          </button>
          {!isCurrentFocus && (
            <button
              onClick={() => handleDrillDown(m.index)}
              title="이 계정을 기준으로 하위 조직도 펼치기"
              className="py-1 px-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold flex items-center gap-1 transition-colors"
            >
              <span>하위</span>
              <ZoomIn className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      
      {/* Header & Breadcrumb Controller */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <GitFork className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">Binary Downline (Genealogy 바이너리 조직도)</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              계정당 좌/우 2개 분기 구조입니다. 노드를 클릭하여 하위 계정으로 계속 탐색할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {historyStack.length > 1 && (
              <button
                onClick={handleGoUp}
                className="flex items-center gap-1 px-3 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50 text-slate-700 font-medium transition-colors"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Zoom Out (상위이동)</span>
              </button>
            )}
            <button
              onClick={handleResetToUser}
              className="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 font-bold transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Full Tree (내 계정 {rootMember.id} 복귀)</span>
            </button>
          </div>
        </div>

        {/* Breadcrumb path */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100 overflow-x-auto text-xs">
          <span className="text-slate-400 text-[10px] font-bold uppercase shrink-0">Path:</span>
          {historyStack.map((idx, i) => {
            const m = getMemberByIndex(idx);
            const isLast = i === historyStack.length - 1;
            return (
              <React.Fragment key={idx}>
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                <button
                  onClick={() => {
                    setFocusIndex(idx);
                    setHistoryStack(historyStack.slice(0, i + 1));
                  }}
                  className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold shrink-0 ${
                    isLast 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {formatId(idx)} ({m?.name || '회원'})
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Tree Diagram Visualizer */}
      <div className="bg-slate-50/60 rounded-xl border border-slate-200 p-5 overflow-x-auto shadow-inner">
        <div className="min-w-[660px] flex flex-col items-center">
          
          {/* LEVEL 1: FOCUS NODE */}
          <div className="w-64">
            {renderNodeCard(
              currentFocus, 
              currentFocus.index, 
              `기준 계정 (추천: ${currentFocus.sponsorId})`, 
              'indigo'
            )}
          </div>

          {/* Line from Level 1 to Level 2 */}
          <div className="w-0.5 h-5 bg-slate-300 my-0.5" />
          <div className="w-1/2 h-0.5 bg-slate-300" />
          <div className="w-1/2 flex justify-between">
            <div className="w-0.5 h-5 bg-slate-300" />
            <div className="w-0.5 h-5 bg-slate-300" />
          </div>

          {/* LEVEL 2: LEFT CHILD & RIGHT CHILD */}
          <div className="grid grid-cols-2 gap-8 w-full max-w-2xl mt-0.5">
            {/* Direct Left */}
            <div>
              {renderNodeCard(leftMember, leftChildIdx, '좌측 직속 (1대)', 'blue')}
            </div>
            {/* Direct Right */}
            <div>
              {renderNodeCard(rightMember, rightChildIdx, '우측 직속 (1대)', 'emerald')}
            </div>
          </div>

          {/* Lines from Level 2 to Level 3 */}
          <div className="grid grid-cols-2 gap-8 w-full max-w-2xl my-0.5">
            {/* Left side connectors */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-5 bg-slate-300" />
              <div className="w-1/2 h-0.5 bg-slate-300" />
              <div className="w-1/2 flex justify-between">
                <div className="w-0.5 h-5 bg-slate-300" />
                <div className="w-0.5 h-5 bg-slate-300" />
              </div>
            </div>
            {/* Right side connectors */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-5 bg-slate-300" />
              <div className="w-1/2 h-0.5 bg-slate-300" />
              <div className="w-1/2 flex justify-between">
                <div className="w-0.5 h-5 bg-slate-300" />
                <div className="w-0.5 h-5 bg-slate-300" />
              </div>
            </div>
          </div>

          {/* LEVEL 3: 4 GRANDCHILDREN */}
          <div className="grid grid-cols-4 gap-3.5 w-full mt-0.5">
            <div>
              {renderNodeCard(gcLeftLeft, gcLeftLeftIdx, '좌-좌 (2대)', 'blue')}
            </div>
            <div>
              {renderNodeCard(gcLeftRight, gcLeftRightIdx, '좌-우 (2대)', 'blue')}
            </div>
            <div>
              {renderNodeCard(gcRightLeft, gcRightLeftIdx, '우-좌 (2대)', 'emerald')}
            </div>
            <div>
              {renderNodeCard(gcRightRight, gcRightRightIdx, '우-우 (2대)', 'emerald')}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
