import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { saveMemberOverride } from '../data/binaryTree';
import { 
  X, 
  User, 
  Phone, 
  DollarSign, 
  FileText, 
  Save, 
  CheckCircle, 
  LogIn, 
  GitFork,
  ArrowUpRight,
  Fingerprint,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

interface MemberDetailModalProps {
  member: Member | null;
  onClose: () => void;
  onMemberUpdated: () => void;
  onSwitchUser: (id: string) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  onClose,
  onMemberUpdated,
  onSwitchUser,
}) => {
  const [higoId, setHigoId] = useState(member?.higoId ?? '');
  const [name, setName] = useState(member?.name ?? '');
  const [phone, setPhone] = useState(member?.phone ?? '');
  const [password, setPassword] = useState(member?.password || '1234');
  const [showPassword, setShowPassword] = useState(false);
  const [sales, setSales] = useState(member?.sales ?? 0);
  const [memo, setMemo] = useState(member?.memo ?? '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (member) {
      setHigoId(member.higoId ?? `higo_${member.id}`);
      setName(member.name ?? '');
      setPhone(member.phone ?? '');
      setPassword(member.password || '1234');
      setShowPassword(false);
      setSales(member.sales ?? 0);
      setMemo(member.memo ?? '');
      setIsSaved(false);
    }
  }, [member]);

  if (!member) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMemberOverride(member.id, {
      higoId: higoId.trim() || `higo_${member.id}`,
      name: name.trim(),
      phone: phone.trim(),
      password: password.trim() || '1234',
      sales: Number(sales) || 0,
      memo: memo.trim(),
    });
    setIsSaved(true);
    onMemberUpdated();
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs font-mono">
              {member.id}
            </div>
            <div>
              <div className="text-xs font-bold flex items-center gap-2">
                <span>{member.name || member.id}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-mono font-bold">
                  {member.generation}대
                </span>
                {member.higoId && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-semibold border border-amber-500/30">
                    {member.higoId}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                추천인: {member.sponsorId} · 라인: {member.position === 'LEFT' ? '좌측' : member.position === 'RIGHT' ? '우측' : '루트'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-3.5">
          
          {/* Binary Lineage Info Box */}
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">추천인 (상위)</div>
              <div className="font-mono font-bold text-indigo-700 mt-0.5 text-xs">{member.sponsorId}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">직속 좌측</div>
              <div className="font-mono font-bold text-slate-800 mt-0.5 text-xs">{member.leftChildId || '없음'}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">직속 우측</div>
              <div className="font-mono font-bold text-slate-800 mt-0.5 text-xs">{member.rightChildId || '없음'}</div>
            </div>
          </div>

          {/* Form inputs */}
          <div className="space-y-3">
            {/* ID & HiGoID Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  등록아이디 (ID)
                </label>
                <input
                  type="text"
                  value={member.id}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded px-3 py-1.5 text-xs font-mono font-bold text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  HiGoID <span className="text-indigo-600">(커스텀 ID)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={higoId}
                    onChange={(e) => setHigoId(e.target.value)}
                    placeholder="예: higo_user01"
                    className="w-full bg-white border border-slate-300 rounded pl-8 pr-3 py-1.5 text-xs font-mono font-bold text-indigo-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  <Fingerprint className="w-3.5 h-3.5 text-indigo-500 absolute left-2.5 top-2" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  이름 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded pl-8 pr-3 py-1.5 text-xs font-medium text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  전화번호 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded pl-8 pr-3 py-1.5 text-xs font-medium text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                </div>
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-600">
                  비밀번호 (Password)
                </label>
                <span className="text-[10px] text-slate-400 font-mono">기본: 1234</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="계정 접속 비밀번호 입력"
                  required
                  className="w-full bg-white border border-slate-300 rounded pl-8 pr-9 py-1.5 text-xs font-mono font-medium text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  title={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-600">
                  매출액 (원)
                </label>
                <span className="text-xs font-bold text-indigo-700 font-mono">
                  {Number(sales || 0).toLocaleString()} 원
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={sales}
                  onChange={(e) => setSales(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded pl-8 pr-3 py-1.5 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                메모 (Notes)
              </label>
              <div className="relative">
                <textarea
                  rows={2}
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="특이사항 메모"
                  className="w-full bg-white border border-slate-300 rounded pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              </div>
            </div>
          </div>

          {/* Feedback & Actions */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              {isSaved && (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  저장되었습니다! (HiGoID 및 정보 갱신 완료)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  onSwitchUser(member.id);
                  onClose();
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                title="이 계정으로 로그인하여 산하 조회"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                <span>계정 전환</span>
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>저장 완료</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
