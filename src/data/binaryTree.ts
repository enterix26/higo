import { BinaryNode, MemberData, OrganizationStats } from '../types';
import { collection, doc, setDoc, getDocs, onSnapshot, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const TOTAL_NODES = 10000;

// 로컬 스토리지 캐시 키
const OVERRIDES_KEY = 'higo_member_overrides_v1';

// 노드 인덱스 -> a01, a02 ... a10000
export function indexToId(index: number): string {
  if (index <= 0) return 'admin';
  if (index < 10) return `a0${index}`;
  return `a${index}`;
}

// 아이디 또는 번호 -> 노드 인덱스 파싱
export function idToIndex(id: string): number | null {
  const clean = id.trim().toLowerCase();
  if (clean === 'admin') return 0;
  if (clean.startsWith('a')) {
    const num = parseInt(clean.slice(1), 10);
    if (!isNaN(num) && num >= 1 && num <= TOTAL_NODES) {
      return num;
    }
  }
  const directNum = parseInt(clean, 10);
  if (!isNaN(directNum) && directNum >= 1 && directNum <= TOTAL_NODES) {
    return directNum;
  }
  // HiGoID로 찾기
  const byHigo = findIndexByHigoId(id);
  if (byHigo !== null) return byHigo;

  return null;
}

// HiGoID로 인덱스 역추적
export function findIndexByHigoId(higoId: string): number | null {
  const clean = higoId.trim().toLowerCase();
  if (!clean) return null;
  // 오버라이드 먼저 검색
  for (const [id, data] of Object.entries(memberOverrides)) {
    if (data.higoId && data.higoId.toLowerCase() === clean) {
      const idx = idToIndex(id);
      if (idx !== null) return idx;
    }
  }
  // 기본 규칙 매칭
  if (clean.startsWith('higo_')) {
    const part = clean.slice(5);
    return idToIndex(part);
  }
  return null;
}

// 부모 인덱스 계산 (이진트리 공식: Math.floor(i / 2))
export function getParentIndex(index: number): number | null {
  if (index <= 1) return null;
  return Math.floor(index / 2);
}

// 좌측 자식 인덱스 (이진트리 공식: 2 * i)
export function getLeftChildIndex(index: number): number | null {
  const left = index * 2;
  return left <= TOTAL_NODES ? left : null;
}

// 우측 자식 인덱스 (이진트리 공식: 2 * i + 1)
export function getRightChildIndex(index: number): number | null {
  const right = index * 2 + 1;
  return right <= TOTAL_NODES ? right : null;
}

// 좌측인지 우측인지 판별 ('left' | 'right' | null)
export function getBranchDirection(index: number): 'left' | 'right' | null {
  if (index <= 1) return null;
  return index % 2 === 0 ? 'left' : 'right';
}

// 세대(Depth) 계산: 루트(1) = 1세대
export function getGeneration(index: number): number {
  if (index <= 0) return 0;
  return Math.floor(Math.log2(index)) + 1;
}

// 특정 노드의 조상 경로 배열 (루트부터 자기자신까지)
export function getAncestorPath(index: number): number[] {
  const path: number[] = [];
  let curr: number | null = index;
  while (curr !== null && curr >= 1) {
    path.unshift(curr);
    curr = getParentIndex(curr);
  }
  return path;
}

// 특정 세대의 시작 인덱스와 끝 인덱스 반환
export function getGenerationRange(gen: number): { start: number; end: number } {
  const start = Math.pow(2, gen - 1);
  const end = Math.min(Math.pow(2, gen) - 1, TOTAL_NODES);
  return { start, end };
}

// 더미 리더 제거 (완전 빈 상태)
const KEY_LEADERS: Record<number, { name: string; title: string; phone: string; higoId: string }> = {};

// 모든 회원을 미등록(빈 상태)으로 초기화
function generateDeterministicInfo(index: number) {
  const idStr = index < 10 ? `a0${index}` : `a${index}`;
  return {
    name: '',
    phone: '',
    higoId: `higo_${idStr}`,
  };
}

// 메모리 오버라이드 캐시
let memberOverrides: Record<string, Partial<MemberData>> = {};

// 로컬 스토리지에서 오버라이드 로드
export function loadOverridesFromStorage(): void {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    if (raw) {
      memberOverrides = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load overrides from localStorage', e);
  }
}

// 로컬 스토리지에 저장
function saveOverridesToStorage(): void {
  try {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(memberOverrides));
  } catch (e) {
    console.error('Failed to save overrides to localStorage', e);
  }
}

// Firebase Firestore 실시간 동기화 리스너 등록
let unsubscribeFirestore: (() => void) | null = null;

export function initFirebaseSync(onUpdate?: () => void): () => void {
  // 로컬 캐시 먼저 로드
  loadOverridesFromStorage();

  try {
    const membersRef = collection(db, 'members');
    
    unsubscribeFirestore = onSnapshot(membersRef, (snapshot) => {
      let hasChanges = false;
      
      snapshot.docChanges().forEach((change) => {
        const docId = change.doc.id;
        if (change.type === 'added' || change.type === 'modified') {
          const remoteData = change.doc.data() as Partial<MemberData>;
          memberOverrides[docId] = {
            ...(memberOverrides[docId] || {}),
            ...remoteData,
          };
          hasChanges = true;
        } else if (change.type === 'removed') {
          delete memberOverrides[docId];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        saveOverridesToStorage();
        if (onUpdate) {
          onUpdate();
        }
      }
    }, (error) => {
      console.warn('Firestore onSnapshot subscription failed (offline or permission):', error);
    });

    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  } catch (e) {
    console.warn('Firebase sync initialization failed:', e);
    return () => {};
  }
}

// 단일 회원 정보 저장 (Firestore + LocalStorage)
export async function saveMemberToFirestore(id: string, data: Partial<MemberData>): Promise<void> {
  const cleanId = id.trim().toLowerCase();
  
  // 로컬 즉시 반영
  memberOverrides[cleanId] = {
    ...(memberOverrides[cleanId] || {}),
    ...data,
  };
  saveOverridesToStorage();

  // Firestore 비동기 저장
  try {
    const firestorePayload: Record<string, any> = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    // undefined 값 제거
    Object.keys(firestorePayload).forEach(key => {
      if (firestorePayload[key] === undefined) {
        delete firestorePayload[key];
      }
    });

    await setDoc(doc(db, 'members', cleanId), firestorePayload, { merge: true });
  } catch (e) {
    console.warn('Failed to save member to Firestore, cached locally:', e);
  }
}

// 단일 회원 정보 가져오기 (오버라이드 우선)
export function getMemberData(index: number): MemberData {
  const id = indexToId(index);
  const gen = getGeneration(index);
  const baseInfo = generateDeterministicInfo(index);
  const override = memberOverrides[id] || {};

  return {
    id,
    index,
    name: override.name !== undefined ? override.name : baseInfo.name,
    higoId: override.higoId !== undefined ? override.higoId : baseInfo.higoId,
    phone: override.phone !== undefined ? override.phone : baseInfo.phone,
    sales: override.sales !== undefined ? override.sales : 0,
    generation: gen,
    title: override.title !== undefined ? override.title : (KEY_LEADERS[index]?.title || `${gen}대 회원`),
    status: override.status !== undefined ? override.status : 'active',
    password: override.password !== undefined ? override.password : '1234',
    memo: override.memo !== undefined ? override.memo : '',
    joinDate: override.joinDate || `2024-01-${String((index % 28) + 1).padStart(2, '0')}`,
    parentId: getParentIndex(index) ? indexToId(getParentIndex(index)!) : null,
    leftChildId: getLeftChildIndex(index) ? indexToId(getLeftChildIndex(index)!) : null,
    rightChildId: getRightChildIndex(index) ? indexToId(getRightChildIndex(index)!) : null,
  };
}

// 단일 회원 오버라이드 업데이트 (편의 함수)
export function updateMemberData(id: string, updates: Partial<MemberData>): MemberData | null {
  const idx = idToIndex(id);
  if (idx === null) return null;
  
  saveMemberToFirestore(id, updates);
  return getMemberData(idx);
}

// 하위 서브트리 노드 인덱스 목록 추출 (DFS / BFS)
export function getSubtreeIndices(rootIndex: number, maxCount: number = 20000): number[] {
  const result: number[] = [];
  const queue: number[] = [rootIndex];
  
  while (queue.length > 0 && result.length < maxCount) {
    const current = queue.shift()!;
    result.push(current);
    
    const left = getLeftChildIndex(current);
    const right = getRightChildIndex(current);
    
    if (left !== null && left <= TOTAL_NODES) queue.push(left);
    if (right !== null && right <= TOTAL_NODES) queue.push(right);
  }
  
  return result;
}

// 특정 노드의 좌/우 라인 조직 통계 계산
export function getOrganizationStats(rootIndex: number): OrganizationStats {
  const leftChild = getLeftChildIndex(rootIndex);
  const rightChild = getRightChildIndex(rootIndex);

  let leftCount = 0;
  let rightCount = 0;
  let leftSales = 0;
  let rightSales = 0;
  let leftActive = 0;
  let rightActive = 0;

  if (leftChild !== null) {
    const leftNodes = getSubtreeIndices(leftChild);
    leftCount = leftNodes.length;
    for (const idx of leftNodes) {
      const mem = getMemberData(idx);
      leftSales += mem.sales;
      if (mem.status === 'active') leftActive++;
    }
  }

  if (rightChild !== null) {
    const rightNodes = getSubtreeIndices(rightChild);
    rightCount = rightNodes.length;
    for (const idx of rightNodes) {
      const mem = getMemberData(idx);
      rightSales += mem.sales;
      if (mem.status === 'active') rightActive++;
    }
  }

  return {
    leftCount,
    rightCount,
    totalCount: leftCount + rightCount + 1,
    leftSales,
    rightSales,
    totalSales: leftSales + rightSales + (getMemberData(rootIndex).sales || 0),
    leftActiveCount: leftActive,
    rightActiveCount: rightActive,
  };
}

// 뷰포트용 트리 노드 구조 반환 (지정 깊이만큼만 반환)
export function buildBinaryTree(rootIndex: number, depth: number = 4): BinaryNode | null {
  if (rootIndex <= 0 || rootIndex > TOTAL_NODES) return null;

  function buildNode(currIndex: number, currentDepth: number): BinaryNode {
    const memData = getMemberData(currIndex);
    const leftIdx = getLeftChildIndex(currIndex);
    const rightIdx = getRightChildIndex(currIndex);

    let leftNode: BinaryNode | null = null;
    let rightNode: BinaryNode | null = null;

    if (currentDepth < depth) {
      if (leftIdx !== null) {
        leftNode = buildNode(leftIdx, currentDepth + 1);
      }
      if (rightIdx !== null) {
        rightNode = buildNode(rightIdx, currentDepth + 1);
      }
    }

    return {
      index: currIndex,
      id: memData.id,
      name: memData.name,
      higoId: memData.higoId,
      phone: memData.phone,
      sales: memData.sales,
      generation: memData.generation,
      status: memData.status,
      title: memData.title,
      left: leftNode,
      right: rightNode,
    };
  }

  return buildNode(rootIndex, 1);
}

// 검색 함수 (이름, 아이디, HiGoID, 전화번호)
export function searchMembers(query: string, limit: number = 20): MemberData[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  const results: MemberData[] = [];
  
  // 1. 직접 ID 매칭
  const exactIndex = idToIndex(clean);
  if (exactIndex !== null) {
    results.push(getMemberData(exactIndex));
  }

  // 2. 오버라이드된 데이터 먼저 검색
  for (const [id, data] of Object.entries(memberOverrides)) {
    const idx = idToIndex(id);
    if (idx === null || idx === exactIndex) continue;
    
    const m = getMemberData(idx);
    if (
      m.name.toLowerCase().includes(clean) ||
      m.higoId.toLowerCase().includes(clean) ||
      m.phone.replace(/[^0-9]/g, '').includes(clean.replace(/[^0-9]/g, ''))
    ) {
      results.push(m);
      if (results.length >= limit) return results;
    }
  }

  // 3. 전체 인덱스 순회 검색
  for (let i = 1; i <= TOTAL_NODES; i++) {
    if (i === exactIndex) continue;
    const m = getMemberData(i);
    if (
      m.name.toLowerCase().includes(clean) ||
      m.higoId.toLowerCase().includes(clean) ||
      m.phone.replace(/[^0-9]/g, '').includes(clean.replace(/[^0-9]/g, ''))
    ) {
      results.push(m);
      if (results.length >= limit) break;
    }
  }

  return results;
}

// 전체 오버라이드 초기화 (관리자용)
export async function resetAllOverrides(): Promise<void> {
  memberOverrides = {};
  localStorage.removeItem(OVERRIDES_KEY);

  try {
    const snap = await getDocs(collection(db, 'members'));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
  } catch (e) {
    console.warn('Failed to clear firestore members collection:', e);
  }
}
