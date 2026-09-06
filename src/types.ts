export type LegPosition = 'ROOT' | 'LEFT' | 'RIGHT';

export interface Member {
  id: string;             // e.g. "a01", "a02", ..., "a10000"
  index: number;          // 1 to 10000
  sponsorId: string;      // "admin" for 1, or parent ID
  sponsorIndex: number;   // 0 for admin, or parent index
  leftChildId: string | null;  // e.g. "a02" if <= 10000
  rightChildId: string | null; // e.g. "a03" if <= 10000
  leftChildIndex: number | null;
  rightChildIndex: number | null;
  generation: number;     // 1대, 2대, 3대...
  position: LegPosition; // ROOT, LEFT, RIGHT
  
  // Editable fields as requested
  higoId?: string;        // HiGoID (사용자 고유 HiGo 아이디)
  password?: string;      // 비밀번호 (기본: 1234)
  name: string;           // 이름
  phone: string;          // 전화번호
  sales: number;          // 매출 (KRW)
  memo: string;           // 메모
  
  // Metadata
  registeredAt: string;   // 가입/등록일
  updatedAt?: string;     // 최근 수정일
}

export interface DownlineStats {
  leftCount: number;
  rightCount: number;
  totalCount: number;
  leftSales: number;
  rightSales: number;
  totalSales: number;
  directLeft: Member | null;
  directRight: Member | null;
}

export interface DownlineMemberItem extends Member {
  relativeGeneration: number; // Logged-in user is 0대, direct child is 1대...
  relativeLeg: 'LEFT' | 'RIGHT'; // Whether member is in user's Left or Right subtree
  leftSubtreeSales: number;
  rightSubtreeSales: number;
}
