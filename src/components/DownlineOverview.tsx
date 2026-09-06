import React from 'react';
import { Member, DownlineStats } from '../types';
import { 
  Users, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle, 
  Award, 
  Scale, 
  DollarSign,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

interface DownlineOverviewProps {
  member: Member;
  stats: DownlineStats;
  onSelectLegTab: (leg: 'ALL' | 'LEFT' | 'RIGHT') => void;
  onNavigateToMember: (id: string) => void;
}

export const DownlineOverview: React.FC<DownlineOverviewProps> = ({
  member,
  stats,
  onSelectLegTab,
  onNavigateToMember,
}) => {
  const isLeftGreater = stats.leftSales >= stats.rightSales;
  const isRightGreater = stats.rightSales > stats.leftSales;
  const totalSalesCombined = stats.leftSales + stats.rightSales;
  
  const leftPercent = totalSalesCombined > 0 
    ? Math.round((stats.leftSales / totalSalesCombined) * 100) 
    : 50;
  const rightPercent = 100 - leftPercent;

  // Binary matching bonus example (10% of lesser leg)
  const lesserLegSales = Math.min(stats.leftSales, stats.rightSales);
  const estimatedBonus = Math.floor(lesserLegSales * 0.10);

  return (
    <div className="space-y-5">
      
      {/* Top Banner: Total Downline Summary in High Density Slate-800 Theme */}
      <div className="bg-[#1e293b] rounded-xl text-white p-4 sm:p-5 shadow-sm border border-slate-700/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-400/30 uppercase tracking-wider">
                산하 조직 현황
              </span>
              <span className="text-xs text-slate-300">기준 계정: <strong className="font-mono text-white">{member.id}</strong> ({member.name})</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1 tracking-tight">
              산하 좌·우측 네트워크 실적 대시보드
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
              기준 계정({member.id})의 직속 2개 라인(좌측/우측) 및 산하 전체 회원의 인원수, 매출 현황 및 실적 밸런스를 확인합니다.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-900/90 p-3 rounded-lg border border-slate-700/60">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">산하 총 회원</div>
              <div className="text-base sm:text-lg font-bold text-white font-mono mt-0.5">
                {stats.totalCount.toLocaleString()} <span className="text-xs font-normal text-slate-400">명</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">산하 총 매출</div>
              <div className="text-base sm:text-lg font-bold text-indigo-300 font-mono mt-0.5">
                {stats.totalSales.toLocaleString()} <span className="text-xs font-normal text-slate-400">원</span>
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-[10px] uppercase font-bold text-slate-400">소실적 후원수당(10%)</div>
              <div className="text-base sm:text-lg font-bold text-amber-300 font-mono mt-0.5">
                {estimatedBonus.toLocaleString()} <span className="text-xs font-normal text-slate-400">원</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Column: Left Leg vs Right Leg */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* LEFT LEG CARD */}
        <div className={`bg-white rounded-xl border transition-all p-4 sm:p-5 shadow-sm ${
          isLeftGreater ? 'border-indigo-400' : 'border-slate-200'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                좌
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">산하 좌측 회원 정보</h3>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Left Leg Organization</p>
              </div>
            </div>

            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
              isLeftGreater
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {isLeftGreater ? '⭐ 대실적 라인' : '소실적 라인'}
            </span>
          </div>

          {/* Direct Left Child Info */}
          <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 mb-3">
            <div className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
              1대 직속 좌측 계정 (추천: {member.id})
            </div>
            {stats.directLeft ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 text-xs">
                    {stats.directLeft.id}
                  </span>
                  <span className="font-bold text-slate-800 text-xs">{stats.directLeft.name}</span>
                  <span className="text-xs text-slate-500">({stats.directLeft.phone})</span>
                </div>
                <button
                  onClick={() => onNavigateToMember(stats.directLeft!.id)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 hover:underline"
                >
                  <span>이동</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-400">직속 좌측 배정 계정이 없습니다 (최대 한도 초과)</div>
            )}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase mb-1">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>좌측 산하 총 회원</span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-900">
                {stats.leftCount.toLocaleString()} <span className="text-xs font-normal text-slate-500">명</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                <span>좌측 산하 총 매출</span>
              </div>
              <div className="text-lg font-bold font-mono text-indigo-700">
                {stats.leftSales.toLocaleString()} <span className="text-xs font-normal text-slate-500">원</span>
              </div>
            </div>
          </div>

          {/* Action to View Left Leg Members */}
          <button
            id="btn-view-left-downline"
            onClick={() => onSelectLegTab('LEFT')}
            className="w-full py-2 px-3 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-indigo-200"
          >
            <span>좌측 산하 회원 상세 명단 ({stats.leftCount.toLocaleString()}명)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* RIGHT LEG CARD */}
        <div className={`bg-white rounded-xl border transition-all p-4 sm:p-5 shadow-sm ${
          isRightGreater ? 'border-emerald-500' : 'border-slate-200'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                우
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">산하 우측 회원 정보</h3>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Right Leg Organization</p>
              </div>
            </div>

            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
              isRightGreater
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {isRightGreater ? '⭐ 대실적 라인' : '소실적 라인'}
            </span>
          </div>

          {/* Direct Right Child Info */}
          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 mb-3">
            <div className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider mb-1">
              1대 직속 우측 계정 (추천: {member.id})
            </div>
            {stats.directRight ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 text-xs">
                    {stats.directRight.id}
                  </span>
                  <span className="font-bold text-slate-800 text-xs">{stats.directRight.name}</span>
                  <span className="text-xs text-slate-500">({stats.directRight.phone})</span>
                </div>
                <button
                  onClick={() => onNavigateToMember(stats.directRight!.id)}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5 hover:underline"
                >
                  <span>이동</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-400">직속 우측 배정 계정이 없습니다 (최대 한도 초과)</div>
            )}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase mb-1">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>우측 산하 총 회원</span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-900">
                {stats.rightCount.toLocaleString()} <span className="text-xs font-normal text-slate-500">명</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>우측 산하 총 매출</span>
              </div>
              <div className="text-lg font-bold font-mono text-emerald-700">
                {stats.rightSales.toLocaleString()} <span className="text-xs font-normal text-slate-500">원</span>
              </div>
            </div>
          </div>

          {/* Action to View Right Leg Members */}
          <button
            id="btn-view-right-downline"
            onClick={() => onSelectLegTab('RIGHT')}
            className="w-full py-2 px-3 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
          >
            <span>우측 산하 회원 상세 명단 ({stats.rightCount.toLocaleString()}명)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Binary Volume Balance Progress Bar in High Density layout */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-slate-700" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">좌·우 바이너리 매출 실적 밸런스</span>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-600">
            좌측 {leftPercent}% : 우측 {rightPercent}%
          </span>
        </div>

        {/* Bar */}
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <div 
            className="bg-indigo-600 h-full transition-all duration-500" 
            style={{ width: `${leftPercent}%` }}
            title={`좌측 매출: ${stats.leftSales.toLocaleString()}원 (${leftPercent}%)`}
          />
          <div 
            className="bg-emerald-500 h-full transition-all duration-500" 
            style={{ width: `${rightPercent}%` }}
            title={`우측 매출: ${stats.rightSales.toLocaleString()}원 (${rightPercent}%)`}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 mt-2 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
            <span>좌측 실적: {stats.leftSales.toLocaleString()} 원 ({leftPercent}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>우측 실적: {stats.rightSales.toLocaleString()} 원 ({rightPercent}%)</span>
          </div>
        </div>

        {/* Explanation footnote */}
        <div className="mt-3 p-2.5 bg-slate-50 rounded-lg flex items-start gap-2 text-xs text-slate-600 border border-slate-100">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <span>
            바이너리 보상 정책은 좌·우 소실적(Lesser Leg)을 기준으로 후원수당이 정산됩니다. 
            현재 소실적 기준 정산 대상 매출액은 <strong className="text-slate-900 font-bold">{lesserLegSales.toLocaleString()} 원</strong>입니다.
          </span>
        </div>
      </div>

    </div>
  );
};
