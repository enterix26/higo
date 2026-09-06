import { Member, DownlineStats, DownlineMemberItem } from '../types';

export const TOTAL_ACCOUNTS = 10000;
const STORAGE_KEY = 'higo_member_overrides_v1';

/**
 * Format 1-based index to ID string:
 * 1 -> "a01", 2 -> "a02", ..., 9 -> "a09", 10 -> "a10", ..., 10000 -> "a10000"
 */
export function formatId(index: number): string {
  if (index <= 0) return 'admin';
  if (index < 10) return `a0${index}`;
  return `a${index}`;
}

/**
 * Parse ID string into 1-based index:
 * "a01" -> 1, "a02" -> 2, "a10" -> 10, "1" -> 1, "admin" -> 0
 * Also supports resolving by HiGoID!
 */
export function parseId(idStr: string): number | null {
  const clean = idStr.trim().toLowerCase();
  if (clean === 'admin') return 0;
  
  if (clean.startsWith('a')) {
    const num = parseInt(clean.slice(1), 10);
    if (!isNaN(num) && num >= 1 && num <= TOTAL_ACCOUNTS) {
      return num;
    }
  }
  
  const directNum = parseInt(clean, 10);
  if (!isNaN(directNum) && directNum >= 1 && directNum <= TOTAL_ACCOUNTS) {
    return directNum;
  }

  // Support lookup by HiGoID
  const byHigo = findIndexByHigoId(idStr);
  if (byHigo !== null) {
    return byHigo;
  }
  
  return null;
}

/**
 * Find member index by HiGoID
 */
export function findIndexByHigoId(higoId: string): number | null {
  const clean = higoId.trim().toLowerCase();
  if (!clean) return null;

  // 1. Check stored overrides first
  const overrides = getStoredOverrides();
  for (const [id, ovr] of Object.entries(overrides)) {
    if (ovr.higoId && ovr.higoId.trim().toLowerCase() === clean) {
      const idx = parseDirectRegisteredId(id);
      if (idx !== null) return idx;
    }
  }

  // 2. Check key leaders
  for (const [idxStr, leader] of Object.entries(KEY_LEADERS)) {
    if (leader.higoId && leader.higoId.toLowerCase() === clean) {
      return parseInt(idxStr, 10);
    }
  }

  // 3. Check default higo_a... format (e.g. higo_a01, higo_a100)
  if (clean.startsWith('higo_a')) {
    const sub = clean.replace('higo_', '');
    const num = parseDirectRegisteredId(sub);
    if (num !== null && num >= 1 && num <= TOTAL_ACCOUNTS) {
      return num;
    }
  }

  return null;
}

function parseDirectRegisteredId(str: string): number | null {
  const clean = str.trim().toLowerCase();
  if (clean.startsWith('a')) {
    const num = parseInt(clean.slice(1), 10);
    if (!isNaN(num) && num >= 1 && num <= TOTAL_ACCOUNTS) return num;
  }
  const directNum = parseInt(clean, 10);
  if (!isNaN(directNum) && directNum >= 1 && directNum <= TOTAL_ACCOUNTS) return directNum;
  return null;
}

/**
 * Get parent index:
 * Node 1 -> 0 (admin)
 * Node 2, 3 -> 1 (a01)
 * Node 4, 5 -> 2 (a02)
 * Node 6, 7 -> 3 (a03)
 */
export function getParentIndex(index: number): number {
  if (index <= 1) return 0;
  return Math.floor(index / 2);
}

/**
 * Generation (대수):
 * 1 -> 1대
 * 2, 3 -> 2대
 * 4, 5, 6, 7 -> 3대
 */
export function getGeneration(index: number): number {
  if (index <= 0) return 0;
  return Math.floor(Math.log2(index)) + 1;
}

// Initial realistic Korean surnames and given names generator for demo data
const SURNAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '전', '홍'];
const GIVEN_NAMES = ['민준', '서준', '도윤', '예준', '시우', '하준', '주원', '지호', '지후', '준서', '서연', '서윤', '지우', '서현', '하은', '하윤', '민서', '지아', '윤서', '채원', '태현', '동현', '승우', '진우', '성민', '상훈', '유진', '수빈', '다은', '혜원'];

const KEY_LEADERS: Record<number, { name: string; phone: string; sales: number; memo: string; higoId?: string }> = {
  1: { name: '강현우 (총괄)', phone: '010-3841-1001', sales: 0, memo: 'higo 최고 탑마스터 / 전국 총괄 네트워크', higoId: 'higo_top' },
  2: { name: '김태진 (좌측본부장)', phone: '010-5521-2002', sales: 0, memo: '좌측 1라인 총괄 리더 / 수도권 사업단', higoId: 'higo_left' },
  3: { name: '이서연 (우측본부장)', phone: '010-4492-3003', sales: 0, memo: '우측 2라인 총괄 리더 / 영남 사업단', higoId: 'higo_right' },
  4: { name: '박민규 (이사)', phone: '010-8812-4004', sales: 0, memo: '강남 센터장 / 직속 2대 육성', higoId: 'higo_gangnam' },
  5: { name: '최윤아 (이사)', phone: '010-7731-5005', sales: 0, memo: '인천 지사 리더', higoId: 'higo_incheon' },
  6: { name: '정도현 (이사)', phone: '010-6649-6006', sales: 0, memo: '부산 해운대 센터장', higoId: 'higo_busan' },
  7: { name: '한지민 (이사)', phone: '010-9923-7007', sales: 0, memo: '대구 수성 사업단', higoId: 'higo_daegu' },
  8: { name: '윤상혁', phone: '010-2213-8008', sales: 0, memo: '팀빌딩 전문 리더', higoId: 'higo_a08' },
  9: { name: '임수정', phone: '010-3341-9009', sales: 0, memo: '글로벌 라인 확장', higoId: 'higo_a09' },
  10: { name: '오세훈', phone: '010-4452-1010', sales: 0, memo: '월 매출 1억 목표', higoId: 'higo_a10' },
  11: { name: '신아라', phone: '010-5563-1011', sales: 0, memo: '온라인 마케팅 주력', higoId: 'higo_a11' },
  12: { name: '조광민', phone: '010-6674-1012', sales: 0, memo: '광주 전남 지사장', higoId: 'higo_a12' },
  13: { name: '송하늘', phone: '010-7785-1013', sales: 0, memo: '대전 충청 라인', higoId: 'higo_a13' },
  14: { name: '전우진', phone: '010-8896-1014', sales: 0, memo: '울산 경남 라인', higoId: 'higo_a14' },
  15: { name: '안유리', phone: '010-9907-1015', sales: 0, memo: '신규 에이전트 육성', higoId: 'higo_a15' },
};

function generateDeterministicInfo(index: number) {
  const defaultHigoId = `higo_${formatId(index)}`;
  if (KEY_LEADERS[index]) {
    return {
      ...KEY_LEADERS[index],
      higoId: KEY_LEADERS[index].higoId || defaultHigoId,
    };
  }
  
  const surname = SURNAMES[(index * 7 + 3) % SURNAMES.length];
  const givenName = GIVEN_NAMES[(index * 13 + 5) % GIVEN_NAMES.length];
  const name = `${surname}${givenName}`;
  
  const p1 = String(1000 + ((index * 37) % 9000)).padStart(4, '0');
  const p2 = String(1000 + ((index * 83) % 9000)).padStart(4, '0');
  const phone = `010-${p1}-${p2}`;
  
  // All personal sales initialized to 0
  const sales = 0;
  
  const memo = index <= 100 ? `${getGeneration(index)}대 에이전트 (${index % 2 === 0 ? '좌측라인' : '우측라인'})` : '';
  
  return { name, phone, sales, memo, higoId: defaultHigoId };
}

/**
 * In-memory map of overrides with server synchronization
 */
let cachedOverrides: Record<string, Partial<Member>> = {};

// Load initial overrides from localStorage if available
try {
  const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (raw) {
    cachedOverrides = JSON.parse(raw);
  }
} catch {
  cachedOverrides = {};
}

function getStoredOverrides(): Record<string, Partial<Member>> {
  return cachedOverrides;
}

/**
 * Fetch latest member overrides from server and update local cache
 */
export async function syncWithServer(): Promise<Record<string, Partial<Member>>> {
  try {
    const res = await fetch('/api/members/overrides');
    if (res.ok) {
      const serverData = await res.json();
      if (serverData && typeof serverData === 'object') {
        cachedOverrides = serverData;
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedOverrides));
          window.dispatchEvent(new CustomEvent('higo_data_synced', { detail: cachedOverrides }));
        }
        return cachedOverrides;
      }
    }
  } catch (err) {
    // If offline or dev mode starting, safely fallback to local cache
    console.warn('[DataSync] Using local cached overrides (server unreachable)', err);
  }
  return cachedOverrides;
}

// Initial sync and visibility sync
if (typeof window !== 'undefined') {
  syncWithServer();
  window.addEventListener('focus', () => {
    syncWithServer();
  });
}

export function saveMemberOverride(id: string, updates: Partial<Member>): void {
  try {
    const cleanId = id.toLowerCase();
    const current = {
      ...(cachedOverrides[cleanId] || {}),
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    cachedOverrides[cleanId] = current;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedOverrides));
      window.dispatchEvent(new CustomEvent('higo_data_updated', { detail: { id: cleanId, override: current } }));
    }

    // Send update to Express server in background
    fetch(`/api/members/${cleanId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch((err) => {
      console.warn('[DataSync] Failed to persist override to server', err);
    });
  } catch (e) {
    console.error('Failed to save override', e);
  }
}

export function resetAllOverrides(): void {
  try {
    cachedOverrides = {};
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('higo_data_synced', { detail: {} }));
    }

    // Reset on Express server
    fetch('/api/admin/reset-all', { method: 'POST' }).catch((err) => {
      console.warn('[DataSync] Failed to reset server overrides', err);
    });
  } catch (e) {
    console.error('Failed to reset overrides', e);
  }
}

/**
 * Reset all personal sales to 0 across all stored member overrides
 */
export function resetAllSales(): void {
  try {
    let modified = false;
    for (const key of Object.keys(cachedOverrides)) {
      if (cachedOverrides[key] && cachedOverrides[key].sales !== 0) {
        cachedOverrides[key].sales = 0;
        cachedOverrides[key].updatedAt = new Date().toISOString();
        modified = true;
      }
    }
    if (modified && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedOverrides));
      window.dispatchEvent(new CustomEvent('higo_data_synced', { detail: cachedOverrides }));
    }

    // Send reset to Express server
    fetch('/api/admin/reset-sales', { method: 'POST' }).catch((err) => {
      console.warn('[DataSync] Failed to reset server sales', err);
    });
  } catch (e) {
    console.error('Failed to reset sales', e);
  }
}

// Auto-run once to ensure all previous sales in existing browser storage are reset to 0
try {
  const SALES_ZERO_FLAG = 'higo_sales_zeroed_v1';
  if (typeof window !== 'undefined' && !localStorage.getItem(SALES_ZERO_FLAG)) {
    resetAllSales();
    localStorage.setItem(SALES_ZERO_FLAG, 'true');
  }
} catch {
  // safe ignore
}

/**
 * Generate or get a single member object with all binary links
 */
export function getMemberByIndex(index: number, overrides?: Record<string, Partial<Member>>): Member | null {
  if (index < 1 || index > TOTAL_ACCOUNTS) return null;
  
  const id = formatId(index);
  const pIndex = getParentIndex(index);
  const sponsorId = pIndex === 0 ? 'admin' : formatId(pIndex);
  
  const leftChildIdx = index * 2 <= TOTAL_ACCOUNTS ? index * 2 : null;
  const rightChildIdx = index * 2 + 1 <= TOTAL_ACCOUNTS ? index * 2 + 1 : null;
  
  const leftChildId = leftChildIdx ? formatId(leftChildIdx) : null;
  const rightChildId = rightChildIdx ? formatId(rightChildIdx) : null;
  
  const generation = getGeneration(index);
  const position = index === 1 ? 'ROOT' : (index % 2 === 0 ? 'LEFT' : 'RIGHT');
  
  const baseInfo = generateDeterministicInfo(index);
  const ovr = (overrides || getStoredOverrides())[id] || {};
  
  return {
    id,
    index,
    higoId: ovr.higoId !== undefined && ovr.higoId !== '' ? ovr.higoId : baseInfo.higoId,
    password: ovr.password !== undefined && ovr.password !== '' ? ovr.password : '1234',
    sponsorId,
    sponsorIndex: pIndex,
    leftChildId,
    rightChildId,
    leftChildIndex: leftChildIdx,
    rightChildIndex: rightChildIdx,
    generation,
    position,
    name: ovr.name !== undefined ? ovr.name : baseInfo.name,
    phone: ovr.phone !== undefined ? ovr.phone : baseInfo.phone,
    sales: ovr.sales !== undefined ? ovr.sales : baseInfo.sales,
    memo: ovr.memo !== undefined ? ovr.memo : baseInfo.memo,
    registeredAt: ovr.registeredAt || '2025-01-15',
    updatedAt: ovr.updatedAt,
  };
}

/**
 * Export all modified member data as a JSON string
 */
export function exportAllDataJSON(): string {
  const overrides = getStoredOverrides();
  return JSON.stringify(overrides, null, 2);
}

/**
 * Import modified member data from JSON string
 */
export function importAllDataJSON(jsonStr: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (typeof parsed !== 'object' || parsed === null) {
      return { success: false, count: 0, error: '유효한 JSON 객체 형식이 아닙니다.' };
    }
    const current = getStoredOverrides();
    const merged = { ...current, ...parsed };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return { success: true, count: Object.keys(parsed).length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'JSON 파싱 오류' };
  }
}

export function getMemberById(id: string): Member | null {
  const index = parseId(id);
  if (index === null || index === 0) return null;
  return getMemberByIndex(index);
}

/**
 * Get all descendant indices in binary tree.
 * Fast queue BFS: runs in <1ms even for thousands of nodes.
 */
export function getDownlineIndices(rootIndex: number, leg: 'LEFT' | 'RIGHT' | 'ALL'): number[] {
  if (rootIndex < 1 || rootIndex > TOTAL_ACCOUNTS) return [];
  
  const result: number[] = [];
  const queue: number[] = [];
  
  if (leg === 'LEFT') {
    const leftChild = rootIndex * 2;
    if (leftChild <= TOTAL_ACCOUNTS) queue.push(leftChild);
  } else if (leg === 'RIGHT') {
    const rightChild = rootIndex * 2 + 1;
    if (rightChild <= TOTAL_ACCOUNTS) queue.push(rightChild);
  } else {
    const leftChild = rootIndex * 2;
    const rightChild = rootIndex * 2 + 1;
    if (leftChild <= TOTAL_ACCOUNTS) queue.push(leftChild);
    if (rightChild <= TOTAL_ACCOUNTS) queue.push(rightChild);
  }
  
  while (queue.length > 0) {
    const curr = queue.shift()!;
    result.push(curr);
    
    const left = curr * 2;
    if (left <= TOTAL_ACCOUNTS) queue.push(left);
    
    const right = curr * 2 + 1;
    if (right <= TOTAL_ACCOUNTS) queue.push(right);
  }
  
  return result;
}

/**
 * Calculate Downline Statistics for a member (left vs right leg counts & sales)
 */
export function calculateDownlineStats(rootIndex: number): DownlineStats {
  const overrides = getStoredOverrides();
  
  const leftIndices = getDownlineIndices(rootIndex, 'LEFT');
  const rightIndices = getDownlineIndices(rootIndex, 'RIGHT');
  
  let leftSales = 0;
  for (const idx of leftIndices) {
    const m = getMemberByIndex(idx, overrides);
    if (m) leftSales += m.sales;
  }
  
  let rightSales = 0;
  for (const idx of rightIndices) {
    const m = getMemberByIndex(idx, overrides);
    if (m) rightSales += m.sales;
  }
  
  const directLeft = rootIndex * 2 <= TOTAL_ACCOUNTS ? getMemberByIndex(rootIndex * 2, overrides) : null;
  const directRight = rootIndex * 2 + 1 <= TOTAL_ACCOUNTS ? getMemberByIndex(rootIndex * 2 + 1, overrides) : null;
  
  return {
    leftCount: leftIndices.length,
    rightCount: rightIndices.length,
    totalCount: leftIndices.length + rightIndices.length,
    leftSales,
    rightSales,
    totalSales: leftSales + rightSales,
    directLeft,
    directRight,
  };
}

/**
 * Get detailed downline members with relative generation and leg positioning
 */
export function getDetailedDownlineMembers(
  rootIndex: number,
  legFilter: 'ALL' | 'LEFT' | 'RIGHT' = 'ALL'
): DownlineMemberItem[] {
  const overrides = getStoredOverrides();
  const rootMember = getMemberByIndex(rootIndex, overrides);
  if (!rootMember) return [];
  
  const rootGen = rootMember.generation;
  const leftIndices = new Set(getDownlineIndices(rootIndex, 'LEFT'));
  const rightIndices = new Set(getDownlineIndices(rootIndex, 'RIGHT'));
  
  let targetIndices: number[] = [];
  if (legFilter === 'LEFT') {
    targetIndices = Array.from(leftIndices);
  } else if (legFilter === 'RIGHT') {
    targetIndices = Array.from(rightIndices);
  } else {
    targetIndices = [...Array.from(leftIndices), ...Array.from(rightIndices)];
  }
  
  // Sort by index ascending (which also preserves tree generation order)
  targetIndices.sort((a, b) => a - b);
  
  return targetIndices.map((idx) => {
    const m = getMemberByIndex(idx, overrides)!;
    const isLeft = leftIndices.has(idx);
    
    // Quick subtree sales calculation for this member
    const subLeft = getDownlineIndices(idx, 'LEFT');
    const subRight = getDownlineIndices(idx, 'RIGHT');
    
    let leftSubSales = 0;
    for (const sIdx of subLeft) {
      const sm = getMemberByIndex(sIdx, overrides);
      if (sm) leftSubSales += sm.sales;
    }
    let rightSubSales = 0;
    for (const sIdx of subRight) {
      const sm = getMemberByIndex(sIdx, overrides);
      if (sm) rightSubSales += sm.sales;
    }
    
    return {
      ...m,
      relativeGeneration: m.generation - rootGen,
      relativeLeg: isLeft ? 'LEFT' : 'RIGHT',
      leftSubtreeSales: leftSubSales,
      rightSubtreeSales: rightSubSales,
    };
  });
}
