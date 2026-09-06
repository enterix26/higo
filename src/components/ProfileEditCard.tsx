import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { saveMemberOverride } from '../data/binaryTree';
import { 
  User, 
  Phone, 
  DollarSign, 
  FileText, 
  Save, 
  CheckCircle2, 
  ArrowUpRight, 
  Split, 
  BadgeCheck,
  Calendar,
  Fingerprint,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

interface ProfileEditCardProps {
  member: Member;
  onMemberUpdated: () => void;
}

export const ProfileEditCard: React.FC<ProfileEditCardProps> = ({ member, onMemberUpdated }) => {
  const [higoId, setHigoId] = useState(member.higoId ?? '');
  const [name, setName] = useState(member.name);
  const [phone, setPhone] = useState(member.phone);
  const [password, setPassword] = useState(member.password || '1234');
  const [confirmPassword, setConfirmPassword] = useState(member.password || '1234');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [sales, setSales] = useState(member.sales);
  const [memo, setMemo] = useState(member.memo);
  const [isSaved, setIsSaved] = useState(false);

  // Sync state when active member changes
  useEffect(() => {
    setHigoId(member.higoId ?? `higo_${member.id}`);
    setName(member.name);
    setPhone(member.phone);
    setPassword(member.password || '1234');
    setConfirmPassword(member.password || '1234');
    setShowPassword(false);
    setPasswordError('');
    setSales(member.sales);
    setMemo(member.memo);
    setIsSaved(false);
  }, [member]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!password.trim()) {
      setPasswordError('비밀번호를 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    saveMemberOverride(member.id, {
      higoId: higoId.trim() || `higo_${member.id}`,
      name: name.trim(),
      phone: phone.trim(),
      password: password.trim(),
      sales: Number(sales) || 0,
      memo: memo.trim(),
    });

    setIsSaved(true);
    onMemberUpdated();
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAddSales = (amount: number) => {
    setSales((prev) => Math.max(0, Number(prev || 0) + amount));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-800">Account Information (계정 정보 등록 및 수정)</h2>
            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
              {member.generation}대 계정
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            이름, 전화번호, 비밀번호, 매출, 메모를 등록하거나 수정할 수 있습니다.
          </p>
        </div>

        {/* Binary Position Badges */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 font-medium flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[11px]">추천인(상위): <strong className="font-mono text-indigo-700 font-bold">{member.sponsorId}</strong></span>
          </div>
          <div className="px-2.5 py-1 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-medium">
            위치: <strong className="font-semibold">{member.position === 'ROOT' ? '최상위' : member.position === 'LEFT' ? '좌측 라인' : '우측 라인'}</strong>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* 등록아이디 (Fixed identification) */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              등록아이디 (고유 ID)
            </label>
            <div className="relative">
              <input
                id="input-member-id"
                type="text"
                value={member.id}
                disabled
                className="w-full bg-slate-100 border border-slate-200 rounded px-3 py-2 text-xs font-mono font-bold text-slate-800 cursor-not-allowed"
              />
              <div className="absolute right-2.5 top-2">
                <span className="text-[10px] font-medium bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                  고정 등록
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">
              노드 번호 #{member.index} ({member.generation}대)
            </p>
          </div>

          {/* HiGoID (Customizable ID) */}
          <div>
            <label htmlFor="input-higoid" className="block text-xs font-bold text-slate-600 mb-1">
              HiGoID <span className="text-indigo-600">(커스텀 고유 식별자)</span>
            </label>
            <div className="relative">
              <input
                id="input-higoid"
                type="text"
                value={higoId}
                onChange={(e) => setHigoId(e.target.value)}
                placeholder="예: higo_top, higo_master01"
                className="w-full bg-white border border-slate-300 rounded pl-8 pr-3 py-2 text-xs font-mono font-bold text-indigo-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
              />
              <Fingerprint className="w-3.5 h-3.5 text-indigo-500 absolute left-2.5 top-2.5" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              로그인 및 산하 조회 시 등록ID 대신 HiGoID로도 접속 가능합니다.
            </p>
          </div>

          {/* 이름 */}
          <div>
            <label htmlFor="input-name" className="block text-xs font-bold text-slate-600 mb-1">
              이름 (Full Name) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="input-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="회원 이름 입력"
                required
                className="w-full bg-white border border-slate-300 rounded pl-8 pr-3 py-2 text-xs font-medium text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
              />
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* 전화번호 */}
          <div>
            <label htmlFor="input-phone" className="block text-xs font-bold text-slate-600 mb-1">
              전화번호 (Phone) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="input-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                required
                className="w-full bg-white border border-slate-300 rounded pl-8 pr-3 py-2 text-xs font-medium text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
              />
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* 로그인 비밀번호 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="input-password" className="block text-xs font-bold text-slate-600">
                로그인 비밀번호 (Password) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">초기값: 1234</span>
            </div>
            <div className="relative">
              <input
                id="input-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                placeholder="비밀번호 입력"
                required
                className="w-full bg-white border border-slate-300 rounded pl-8 pr-9 py-2 text-xs font-mono font-medium text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
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
            <p className="text-[10px] text-slate-400 mt-1">
              로그인 시 사용될 계정 접속 비밀번호입니다.
            </p>
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="input-confirm-password" className="block text-xs font-bold text-slate-600">
                비밀번호 확인 (Confirm) <span className="text-rose-500">*</span>
              </label>
              {password && confirmPassword && (
                password === confirmPassword ? (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                    ✓ 일치
                  </span>
                ) : (
                  <span className="text-[10px] text-rose-500 font-bold flex items-center gap-0.5">
                    ✕ 불일치
                  </span>
                )
              )}
            </div>
            <div className="relative">
              <input
                id="input-confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                placeholder="비밀번호 재입력"
                required
                className={`w-full bg-white border rounded pl-8 pr-3 py-2 text-xs font-mono font-medium text-slate-900 focus:outline-none transition-all ${
                  confirmPassword && password !== confirmPassword 
                    ? 'border-rose-400 focus:ring-1 focus:ring-rose-500' 
                    : 'border-slate-300 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              비밀번호 확인을 위해 한 번 더 입력해주세요.
            </p>
          </div>

          {/* 매출 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="input-sales" className="block text-xs font-bold text-slate-600">
                개인 매출액 (Sales Volume)
              </label>
              <span className="text-xs font-bold text-indigo-600 font-mono">
                {Number(sales || 0).toLocaleString()} 원
              </span>
            </div>
            <div className="relative">
              <input
                id="input-sales"
                type="number"
                min="0"
                step="10000"
                value={sales}
                onChange={(e) => setSales(Number(e.target.value))}
                placeholder="매출액 입력 (숫자)"
                className="w-full bg-white border border-slate-300 rounded pl-8 pr-3 py-2 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
              />
              <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
            {/* Quick add buttons */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <button
                type="button"
                onClick={() => handleAddSales(500000)}
                className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded font-medium transition-colors border border-slate-200"
              >
                +50만
              </button>
              <button
                type="button"
                onClick={() => handleAddSales(1000000)}
                className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded font-medium transition-colors border border-slate-200"
              >
                +100만
              </button>
              <button
                type="button"
                onClick={() => handleAddSales(5000000)}
                className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded font-medium transition-colors border border-slate-200"
              >
                +500만
              </button>
              <button
                type="button"
                onClick={() => setSales(0)}
                className="text-[10px] px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded font-medium transition-colors ml-auto border border-rose-100"
              >
                초기화
              </button>
            </div>
          </div>
        </div>

        {/* 메모 */}
        <div>
          <label htmlFor="input-memo" className="block text-xs font-bold text-slate-600 mb-1">
            메모 (Memo / Notes)
          </label>
          <div className="relative">
            <textarea
              id="input-memo"
              rows={2}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="회원 관리 특이사항, 직급, 비고를 입력하세요"
              className="w-full bg-white border border-slate-300 rounded pl-8 pr-3 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
            />
            <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Immediate Children preview */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <Split className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-700 text-xs">직속 하위 2개 아이디 배정:</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-sans">좌측:</span>
              {member.leftChildId ? (
                <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  {member.leftChildId}
                </span>
              ) : (
                <span className="text-slate-400 font-sans">배정 없음</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-sans">우측:</span>
              {member.rightChildId ? (
                <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  {member.rightChildId}
                </span>
              ) : (
                <span className="text-slate-400 font-sans">배정 없음</span>
              )}
            </div>
          </div>
        </div>

        {/* Validation Error Alert */}
        {passwordError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700 font-bold animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        {/* Submit button & feedback */}
        <div className="flex items-center justify-between pt-1">
          <div>
            {isSaved && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                정보가 성공적으로 저장되었습니다!
              </span>
            )}
          </div>

          <button
            id="btn-save-profile"
            type="submit"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-5 rounded transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Update Member Info (정보 저장/수정)</span>
          </button>
        </div>
      </form>
    </div>
  );
};
