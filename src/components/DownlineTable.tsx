import React, { useState, useMemo } from 'react';
import { Member, DownlineMemberItem } from '../types';
import { getDetailedDownlineMembers } from '../data/binaryTree';
import { 
  Search, 
  Filter, 
  Download, 
  Edit3, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  User,
  Users,
  Eye
} from 'lucide-react';

interface DownlineTableProps {
  rootMember: Member;
  initialLeg?: 'ALL' | 'LEFT' | 'RIGHT';
  onSelectMemberForEdit: (member: Member) => void;
}

export const DownlineTable: React.FC<DownlineTableProps> = ({
  rootMember,
  initialLeg = 'ALL',
  onSelectMemberForEdit,
}) => {
  const [legFilter, setLegFilter] = useState<'ALL' | 'LEFT' | 'RIGHT'>(initialLeg);
  const [searchTerm, setSearchTerm] = useState('');
  const [genFilter, setGenFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'index' | 'sales' | 'relativeGeneration'>('index');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Retrieve downline members
  const allMembers = useMemo(() => {
    return getDetailedDownlineMembers(rootMember.index, 'ALL');
  }, [rootMember.index]);

  // Counts
  const counts = useMemo(() => {
    let left = 0;
    let right = 0;
    for (const m of allMembers) {
      if (m.relativeLeg === 'LEFT') left++;
      else right++;
    }
    return { all: allMembers.length, left, right };
  }, [allMembers]);

  // Filtered and sorted members
  const filteredMembers = useMemo(() => {
    let list = allMembers;

    // Filter by leg
    if (legFilter !== 'ALL') {
      list = list.filter((m) => m.relativeLeg === legFilter);
    }

    // Filter by relative generation
    if (genFilter !== 'ALL') {
      const g = parseInt(genFilter, 10);
      list = list.filter((m) => m.relativeGeneration === g);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.id.toLowerCase().includes(q) ||
          (m.higoId && m.higoId.toLowerCase().includes(q)) ||
          m.name.toLowerCase().includes(q) ||
          m.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, '')) ||
          m.sponsorId.toLowerCase().includes(q) ||
          m.memo.toLowerCase().includes(q)
      );
    }

    // Sorting
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'sales') {
        cmp = a.sales - b.sales;
      } else if (sortField === 'relativeGeneration') {
        cmp = a.relativeGeneration - b.relativeGeneration;
      } else {
        cmp = a.index - b.index;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [allMembers, legFilter, genFilter, searchTerm, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const pagedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  const handleSort = (field: 'index' | 'sales' | 'relativeGeneration') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = ['등록아이디', '라인(좌/우)', '상대대수', '추천인', '이름', '전화번호', '개인매출(원)', '산하좌측매출', '산하우측매출', '메모'];
    const rows = filteredMembers.map((m) => [
      m.id,
      m.relativeLeg === 'LEFT' ? '좌측' : '우측',
      `${m.relativeGeneration}대`,
      m.sponsorId,
      `"${m.name.replace(/"/g, '""')}"`,
      m.phone,
      m.sales,
      m.leftSubtreeSales,
      m.rightSubtreeSales,
      `"${m.memo.replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `higo_${rootMember.id}_산하회원목록_${legFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Tab Navigation: All / Left / Right */}
      <div className="border-b border-slate-200 bg-slate-50/70 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-1.5">
            <button
              id="btn-filter-all"
              onClick={() => {
                setLegFilter('ALL');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                legFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-300'
              }`}
            >
              전체 산하 ({counts.all.toLocaleString()}명)
            </button>
            <button
              id="btn-filter-left"
              onClick={() => {
                setLegFilter('LEFT');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                legFilter === 'LEFT'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200'
              }`}
            >
              좌측 산하 ({counts.left.toLocaleString()}명)
            </button>
            <button
              id="btn-filter-right"
              onClick={() => {
                setLegFilter('RIGHT');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                legFilter === 'RIGHT'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              우측 산하 ({counts.right.toLocaleString()}명)
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV 내보내기</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-3 pt-3 border-t border-slate-200">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="등록아이디 (예: a04), 이름, 전화번호, 메모 검색..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-300 rounded pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          </div>

          {/* Generation filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap uppercase text-[10px]">Generation:</span>
            <select
              value={genFilter}
              onChange={(e) => {
                setGenFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">전체 세대</option>
              <option value="1">1대 (직속 산하)</option>
              <option value="2">2대</option>
              <option value="3">3대</option>
              <option value="4">4대</option>
              <option value="5">5대</option>
              <option value="6">6대 이상</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <th className="py-2.5 px-3.5 cursor-pointer select-none" onClick={() => handleSort('index')}>
                <div className="flex items-center gap-1">
                  <span>ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-indigo-700">HiGoID</th>
              <th className="py-2.5 px-3">Leg</th>
              <th className="py-2.5 px-3 cursor-pointer select-none" onClick={() => handleSort('relativeGeneration')}>
                <div className="flex items-center gap-1">
                  <span>Gen</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3">Sponsor</th>
              <th className="py-2.5 px-3.5">Name</th>
              <th className="py-2.5 px-3.5">Phone</th>
              <th className="py-2.5 px-3.5 text-right cursor-pointer select-none" onClick={() => handleSort('sales')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Personal Sales</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3.5 text-right">L / R Downline Sales</th>
              <th className="py-2.5 px-3.5">Notes</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pagedMembers.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Users className="w-7 h-7 text-slate-300" />
                    <p className="font-semibold text-slate-600 text-xs">일치하는 산하 회원이 없습니다.</p>
                    <p className="text-[11px] text-slate-400">검색어 또는 필터를 조정해 보세요.</p>
                  </div>
                </td>
              </tr>
            ) : (
              pagedMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/90 transition-colors">
                  
                  {/* 등록아이디 */}
                  <td className="py-2.5 px-3.5">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-xs">
                      {m.id}
                    </span>
                  </td>

                  {/* HiGoID */}
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                      {m.higoId || '-'}
                    </span>
                  </td>

                  {/* 라인 (좌/우) */}
                  <td className="py-2.5 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      m.relativeLeg === 'LEFT'
                        ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {m.relativeLeg === 'LEFT' ? '좌측' : '우측'}
                    </span>
                  </td>

                  {/* 대수 */}
                  <td className="py-2.5 px-3 font-semibold text-slate-600 font-mono text-xs">
                    {m.relativeGeneration}대
                  </td>

                  {/* 추천인 */}
                  <td className="py-2.5 px-3 font-mono text-xs text-slate-600">
                    <span className="text-indigo-600 font-bold hover:underline cursor-pointer">
                      {m.sponsorId}
                    </span>
                  </td>

                  {/* 이름 */}
                  <td className="py-2.5 px-3.5 font-bold text-slate-900">
                    {m.name || '미등록'}
                  </td>

                  {/* 전화번호 */}
                  <td className="py-2.5 px-3.5 font-mono text-slate-600 text-xs">
                    {m.phone}
                  </td>

                  {/* 개인 매출액 */}
                  <td className="py-2.5 px-3.5 text-right font-mono font-bold text-indigo-700 text-xs">
                    {m.sales ? `${m.sales.toLocaleString()}원` : '0원'}
                  </td>

                  {/* 산하 좌/우 매출 */}
                  <td className="py-2.5 px-3.5 text-right font-mono text-[11px]">
                    <div className="text-indigo-700">L: {m.leftSubtreeSales.toLocaleString()}</div>
                    <div className="text-emerald-700">R: {m.rightSubtreeSales.toLocaleString()}</div>
                  </td>

                  {/* 메모 */}
                  <td className="py-2.5 px-3.5 text-slate-500 max-w-[140px] truncate text-xs" title={m.memo}>
                    {m.memo || '-'}
                  </td>

                  {/* 액션 */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onSelectMemberForEdit(m)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-bold text-[11px] transition-colors border border-slate-200"
                    >
                      수정
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2.5 bg-slate-50/70 border-t border-slate-200 text-xs text-slate-600 gap-2">
        <div className="text-[11px]">
          총 <strong className="font-semibold text-slate-900">{filteredMembers.length.toLocaleString()}</strong>명 중{' '}
          {filteredMembers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
          {Math.min(currentPage * pageSize, filteredMembers.length)}명 표시
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-mono text-xs">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
