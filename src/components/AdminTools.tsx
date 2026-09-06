import React, { useState } from 'react';
import { 
  TOTAL_ACCOUNTS, 
  resetAllOverrides, 
  resetAllSales,
  formatId, 
  parseId, 
  getMemberByIndex,
  exportAllDataJSON,
  importAllDataJSON
} from '../data/binaryTree';
import { 
  ShieldCheck, 
  RotateCcw, 
  Download, 
  Search, 
  Users, 
  DollarSign, 
  Layers, 
  ArrowRight, 
  AlertTriangle,
  UploadCloud,
  FileCode,
  Share2,
  Check,
  Copy,
  ExternalLink,
  Globe,
  X
} from 'lucide-react';

interface AdminToolsProps {
  onSwitchUser: (id: string) => void;
  onRefresh: () => void;
}

export const AdminTools: React.FC<AdminToolsProps> = ({ onSwitchUser, onRefresh }) => {
  const [quickJumpId, setQuickJumpId] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSalesResetConfirmOpen, setIsSalesResetConfirmOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  
  // JSON sync state
  const [jsonText, setJsonText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const showStatus = (text: string, isError = false) => {
    setStatusMessage({ text, isError });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickJumpId.trim()) return;
    const parsed = parseId(quickJumpId);
    if (parsed !== null && parsed >= 0 && parsed <= TOTAL_ACCOUNTS) {
      if (parsed === 0) {
        onSwitchUser('admin');
      } else {
        onSwitchUser(formatId(parsed));
      }
      setQuickJumpId('');
    } else {
      showStatus(`유효한 아이디를 입력하세요 (예: a01 ~ a${TOTAL_ACCOUNTS}, 또는 설정한 HiGoID)`, true);
    }
  };

  const handleReset = () => {
    resetAllOverrides();
    setIsResetConfirmOpen(false);
    onRefresh();
    showStatus('모든 계정의 수정된 정보가 초기값으로 리셋되었습니다.');
  };

  const handleResetSales = () => {
    resetAllSales();
    setIsSalesResetConfirmOpen(false);
    onRefresh();
    showStatus('모든 회원의 개인매출이 0원으로 초기화되었습니다.');
  };

  const handleExportFullNetwork = () => {
    const headers = ['등록아이디', 'HiGoID', '세대(대수)', '추천인', '이름', '전화번호', '개인매출(원)', '직속좌측', '직속우측', '메모'];
    const rows: string[][] = [];
    
    for (let i = 1; i <= TOTAL_ACCOUNTS; i++) {
      const m = getMemberByIndex(i);
      if (m) {
        rows.push([
          m.id,
          m.higoId || '',
          `${m.generation}대`,
          m.sponsorId,
          `"${m.name.replace(/"/g, '""')}"`,
          m.phone,
          String(m.sales),
          m.leftChildId || '',
          m.rightChildId || '',
          `"${m.memo.replace(/"/g, '""')}"`,
        ]);
      }
    }

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `higo_전체_10000계정_조직도데이터.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showStatus('10,000계정 CSV 파일 다운로드가 완료되었습니다.');
  };

  const handleOpenSyncModal = () => {
    setJsonText(exportAllDataJSON());
    setIsSyncModalOpen(true);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `higo_member_data_backup.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJson = () => {
    if (!jsonText.trim()) {
      showStatus('가져올 JSON 데이터를 입력해주세요.', true);
      return;
    }
    const res = importAllDataJSON(jsonText);
    if (res.success) {
      onRefresh();
      setIsSyncModalOpen(false);
      showStatus(`총 ${res.count}개 계정 데이터가 성공적으로 동기화/적용되었습니다!`);
    } else {
      showStatus(`가져오기 실패: ${res.error}`, true);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-slate-800 shadow-sm relative">
      
      {/* Toast Notification */}
      {statusMessage && (
        <div className={`mb-3 p-2.5 rounded-lg text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in ${
          statusMessage.isError ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
        }`}>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-sm text-xs font-bold shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">admin 최고 관리자 마스터 패널</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold font-mono">
                10,000 NODES
              </span>
            </div>
            <p className="text-[11px] text-amber-800/80 mt-0.5">
              사전 등록된 전체 10,000개 바이너리 계정의 정보를 통합 관리하고 다른 PC/브라우저 동기화 및 Vercel/GitHub 배포를 지원합니다.
            </p>
          </div>
        </div>

        {/* Jump & Action tools */}
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleJump} className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="계정/HiGoID 이동 (예: a04, higo_top)"
              value={quickJumpId}
              onChange={(e) => setQuickJumpId(e.target.value)}
              className="bg-white border border-amber-300 rounded px-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono w-44"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded transition-colors flex items-center gap-1 shadow-sm"
            >
              <span>조회</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </form>

          {/* Cross-device JSON Sync Button */}
          <button
            onClick={handleOpenSyncModal}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-indigo-50 border border-indigo-200 rounded text-xs font-semibold text-indigo-700 shadow-2xs transition-colors"
            title="다른 브라우저/PC 데이터 동기화 백업"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>기기 간 데이터 동기화</span>
          </button>

          {/* GitHub / Vercel Deploy Guide */}
          <button
            onClick={() => setIsDeployGuideOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs font-semibold text-slate-800 shadow-2xs transition-colors"
            title="GitHub 및 Vercel 배포 가이드"
          >
            <Globe className="w-3.5 h-3.5 text-slate-700" />
            <span>GitHub / Vercel 배포</span>
          </button>

          <button
            onClick={handleExportFullNetwork}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded text-xs font-semibold text-amber-900 shadow-2xs transition-colors"
            title="10,000개 전체 계정 데이터 CSV 다운로드"
          >
            <Download className="w-3.5 h-3.5 text-amber-700" />
            <span>10,000 계정 CSV</span>
          </button>

          <button
            onClick={() => setIsSalesResetConfirmOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded text-xs font-semibold text-amber-800 transition-colors"
            title="모든 회원의 개인매출을 0원으로 초기화"
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-600" />
            <span>매출 0원 초기화</span>
          </button>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded text-xs font-semibold text-rose-700 transition-colors"
            title="수정된 모든 회원 정보(HiGoID, 이름, 연락처 등) 초기화"
          >
            <RotateCcw className="w-3 h-3 text-rose-600" />
            <span>데이터 전체 리셋</span>
          </button>
        </div>
      </div>

      {/* Sales Reset Confirmation dialog */}
      {isSalesResetConfirmOpen && (
        <div className="mt-3 p-3 bg-white rounded-lg border border-amber-300 flex items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>모든 회원의 <strong>개인매출을 0원으로 초기화</strong>하시겠습니까? (이름, 연락처, 비밀번호, HiGoID는 유지됩니다)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSalesResetConfirmOpen(false)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium text-xs"
            >
              취소
            </button>
            <button
              onClick={handleResetSales}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-xs shadow-2xs"
            >
              매출 0원 초기화 실행
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation dialog */}
      {isResetConfirmOpen && (
        <div className="mt-3 p-3 bg-white rounded-lg border border-rose-200 flex items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>정말 모든 회원의 등록/수정된 정보(HiGoID, 이름, 연락처, 매출 등)를 초기 기본값으로 리셋하시겠습니까?</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsResetConfirmOpen(false)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium text-xs"
            >
              취소
            </button>
            <button
              onClick={handleReset}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-xs"
            >
              초기화 확인
            </button>
          </div>
        </div>
      )}

      {/* Cross-Device Data Sync Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-left">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs sm:text-sm font-bold">다중 기기 / 브라우저 데이터 동기화 (Data Sync)</h3>
              </div>
              <button
                onClick={() => setIsSyncModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5 text-xs text-slate-700">
              <p className="text-slate-600 leading-relaxed">
                현재 브라우저에서 수정한 회원 정보(HiGoID, 이름, 연락처, 매출, 메모)를 다른 PC나 브라우저로 내보내거나 가져올 수 있습니다.
              </p>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">JSON 데이터 백업/동기화 코드</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyJson}
                      className="text-[11px] flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? '복사됨!' : '클립보드 복사'}</span>
                    </button>
                    <button
                      onClick={handleDownloadJson}
                      className="text-[11px] flex items-center gap-1 text-slate-600 hover:text-slate-800 font-semibold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>파일 저장</span>
                    </button>
                  </div>
                </div>

                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  rows={8}
                  placeholder="동기화할 JSON 데이터를 여기에 붙여넣으세요..."
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg space-y-1 text-[11px] text-indigo-900">
                <p className="font-bold flex items-center gap-1">
                  💡 다른 PC나 브라우저에서 동기화하는 방법:
                </p>
                <p>1. 이 창에서 <strong>[클립보드 복사]</strong> 또는 <strong>[파일 저장]</strong>을 클릭합니다.</p>
                <p>2. 다른 PC/스마트폰 브라우저에서 higo 플랫폼에 접속합니다.</p>
                <p>3. 관리자 패널의 <strong>[기기 간 데이터 동기화]</strong> 창을 열고 붙여넣은 뒤 <strong>[데이터 적용하기]</strong>를 누르면 동일하게 즉시 반영됩니다.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsSyncModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  닫기
                </button>
                <button
                  onClick={handleImportJson}
                  className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>데이터 적용하기 (Import)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deployment Guide Modal */}
      {isDeployGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-left">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs sm:text-sm font-bold">GitHub & Vercel 배포 및 접속 가이드</h3>
              </div>
              <button
                onClick={() => setIsDeployGuideOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5 text-xs text-slate-700 max-h-[80vh] overflow-y-auto">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>GitHub 저장소 업로드</span>
                </h4>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded font-mono text-[11px] text-slate-800 space-y-1">
                  <p>git init</p>
                  <p>git add .</p>
                  <p>git commit -m "feat: higo 10,000 binary MLM platform"</p>
                  <p>git branch -M main</p>
                  <p>git remote add origin &lt;내 깃허브 저장소 URL&gt;</p>
                  <p>git push -u origin main</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Vercel 1-클릭 배포 (호스팅)</span>
                </h4>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700 space-y-1">
                  <p>1. <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold underline">vercel.com</a> 접속 후 GitHub 계정으로 로그인합니다.</p>
                  <p>2. <strong>"Add New Project"</strong> → 위 GitHub 저장소를 선택(Import)합니다.</p>
                  <p>3. Framework Preset은 <strong>Vite</strong>로 자동 감지되며, <strong>Deploy</strong> 버튼을 누르면 약 30초 만에 공용 URL이 생성됩니다.</p>
                  <p className="text-emerald-700 font-semibold">✓ vercel.json 라우팅 설정이 이미 프로젝트에 구성되어 있어 SPA 새로고침도 완벽 지원됩니다.</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>다른 PC/브라우저 접속 시</span>
                </h4>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700 space-y-1">
                  <p>• 배포된 URL을 통해 전 세계 누구나 각자의 브라우저/PC/스마트폰에서 접속할 수 있습니다.</p>
                  <p>• 전체 10,000개 바이너리 계정(a01~a10000, 1대~14대) 및 직속 추천 계보 공식은 알고리즘 기반으로 모든 기기에서 동일하게 작동합니다.</p>
                  <p>• 계정 정보 수정 내역은 관리자 패널의 <strong>[기기 간 데이터 동기화]</strong>로 언제든 상호 동기화 및 백업할 수 있습니다.</p>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsDeployGuideOpen(false)}
                  className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  확인 완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
