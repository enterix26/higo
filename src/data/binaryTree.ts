import { Member, DownlineStats, DownlineMemberItem } from '../types';
import { collection, doc, setDoc, getDocs, onSnapshot, writeBatch, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

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

const KEY_LEADERS: Record<number, { name: string; phone: string; sales: number; memo: string; higoId?: string }> = {};

function generateDeterministicInfo(index: number) {
  const defaultHigoId = `higo_${formatId(index)}`;
  return {
    name: '',
    phone: '',
    sales: 0,
    memo: '',
    higoId: defaultHigoId,
  };
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
 * Fetch latest member overrides from Firestore cloud database
 */
export async function syncWithFirestore(): Promise<Record<string, Partial<Member>>> {
  try {
    const snap = await getDocs(collection(db, 'members'));
    let changed = false;
    snap.forEach((d) => {
      const id = d.id.toLowerCase();
      const data = d.data() as Partial<Member>;
      cachedOverrides[id] = {
        ...(cachedOverrides[id] || {}),
        ...data,
      };
      changed = true;
    });

    if (changed && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedOverrides));
      window.dispatchEvent(new CustomEvent('higo_data_synced', { detail: cachedOverrides }));
    }
  } catch (err) {
    console.warn('[Firestore] Failed to sync with cloud database:', err);
  }
  return cachedOverrides;
}

let isFirestoreListenerAttached = false;
export function initFirestoreRealtimeSync(): void {
  if (typeof window === 'undefined' || isFirestoreListenerAttached) return;
  try {
    isFirestoreListenerAttached = true;
    onSnapshot(
      collection(db, 'members'),
      (snapshot) => {
        let changed = false;
        snapshot.docChanges().forEach((change) => {
          const id = change.doc.id.toLowerCase();
          if (change.type === 'removed') {
            if (cachedOverrides[id]) {
              delete cachedOverrides[id];
              changed = true;
            }
          } else {
            const data = change.doc.data() as Partial<Member>;
            cachedOverrides[id] = {
              ...(cachedOverrides[id] || {}),
              ...data,
            };
            changed = true;
          }
        });

        if (changed) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedOverrides));
          window.dispatchEvent(new CustomEvent('higo_data_synced', { detail: cachedOverrides }));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'members');
      }
    );
  } catch (err) {
    console.warn('[Firestore] Failed to attach real-time listener:', err);
  }
}

/**
 * Fetch latest member overrides from server and update local cache
 */
export async function syncWithServer(): Promise<Record<string, Partial<Member>>> {
  try {
    // 1. Primary: sync with Firebase Firestore cloud database
    await syncWithFirestore();

    // 2. Secondary: sync with local Express server if running
    const res = await fetch('/api/members/overrides');
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const serverData = await res.json();
      if (serverData && typeof serverData === 'object') {
        cachedOverrides = {
          ...cachedOverrides,
          ...serverData,
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedOverrides));
          window.dispatchEvent(new CustomEvent('higo_data_synced', { detail: cachedOverrides }));
        }
        return cachedOverrides;
      }
    }
  } catch (err) {
    // Safely fallback to cached overrides
    console.warn('[DataSync] Using local/Firestore cached overrides', err);
  }
  return cachedOverrides;
}

// Initial sync and visibility sync
if (typeof window !== 'undefined') {
  syncWithFirestore();
  initFirestoreRealtimeSync();
  syncWithServer();
  window.addEventListener('focus', () => {
    syncWithFirestore();
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

    // 1. Save directly to Firebase Firestore
    try {
      const firestorePayload: Record<string, unknown> = {
        memberId: cleanId,
        updatedAt: current.updatedAt,
      };
      if (current.name !== undefined) firestorePayload.name = current.name;
      if (current.phone !== undefined) firestorePayload.phone = current.phone;
      if (current.password !== undefined) firestorePayload.password = current.password;
      if (current.sales !== undefined) firestorePayload.sales = Number(current.sales) || 0;
      if (current.higoId !== undefined) firestorePayload.higoId = current.higoId;
      if (current.memo !== undefined) firestorePayload.memo = current.memo;

      setDoc(doc(db, 'members', cleanId), firestorePayload, { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `members/${cleanId}`);
      });
    } catch (fsErr) {
      console.warn('[Firestore] Error initiating save to Firestore:', fsErr);
    }

    // 2. Also send update to Express server in background
    fetch(`/api/members/${cleanId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch((err) => {
      console.warn('[DataSync] Failed to persist override to Express server', err);
    });
  } catch (e) {
    console.error('Failed to save override', e);
  }
}

export function resetAllOverrides(): void {
  try {
    const keys = Object.keys(cachedOverrides);
    cachedOverrides = {};
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('higo_data_synced', { detail: {} }));
    }

    // Delete in Firestore
    try {
      const batch = writeBatch(db);
      for (const k of keys) {
        batch.delete(doc(db, 'members', k));
      }
      batch.commit().catch((err) => {
        console.warn('[Firestore] Batch delete error:', err);
      });
    } catch (fsErr) {
      console.warn('[Firestore] Error batch deleting from Firestore:', fsErr);
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
    const batch = writeBatch(db);
    let batchCount = 0;

    for (const key of Object.keys(cachedOverrides)) {
      if (cachedOverrides[key] && cachedOverrides[key].sales !== 0) {
        cachedOverrides[key].sales = 0;
        cachedOverrides[key].updatedAt = new Date().toISOString();
        modified = true;

        batch.set(doc(db, 'members', key), { sales: 0, updatedAt: new Date().toISOString() }, { merge: true });
        batchCount++;
      }
    }
    if (modified && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedOverrides));
      window.dispatchEvent(new CustomEvent('higo_data_synced', { detail: cachedOverrides }));
    }

    if (batchCount > 0) {
      batch.commit().catch((err) => {
        console.warn('[Firestore] Batch reset sales error:', err);
      });
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
