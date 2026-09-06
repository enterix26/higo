# higo - 바이너리 MLM 조직 관리 및 실적 조회 플랫폼

> 바이너리 MLM 조직 관리 및 산하 좌/우측 회원 정보·실시간 매출 조회 시스템입니다.

---

## 🌟 주요 기능

- **10,000명 바이너리 추천 계보 트리**: 1대(`a01`)부터 최대 14대까지 완벽하게 정렬된 2진 트리 구조
- **산하 좌/우 실시간 계산**:
  - 좌측 산하 인원수 및 합계 매출
  - 우측 산하 인원수 및 합계 매출
  - 10,000개 전체 계정 즉시 탐색 및 가상화 렌더링
- **개별 회원 웹 접속 & 정보 관리**:
  - 각 회원이 웹 브라우저에서 직접 로그인
  - 이름, 연락처, 비밀번호, 본인 개인매출, 커스텀 **HiGoID** 직접 열람 및 수정
  - 회원 정보 수정 시 서버/로컬 스토리지 실시간 양방향 동기화
- **관리자(admin) 총괄 관리**:
  - 전체 조직도 탐색 및 임의 계정 조회
  - 전체 회원 개인매출 0원 일괄 초기화
  - 회원 정보 수정 내역 총괄 관리
- **반응형 인터페이스**:
  - 모바일, 태블릿, 데스크톱 브라우저 완벽 대응
  - 고밀도 정보 카드, 직관적인 계보 트리 뷰, 산하 목록 테이블 뷰 제공

---

## 🚀 빠른 시작 (Getting Started)

### 1. 저장소 클론 및 패키지 설치

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

### 3. 프로덕션 빌드 및 실행

```bash
# 빌드 (클라이언트 + 백엔드 번들링)
npm run build

# 서버 시작
npm start
```

---

## 🔑 기본 접속 계정 안내

| 구분 | 아이디 (ID) | 비밀번호 (Password) | 비고 |
| :--- | :--- | :--- | :--- |
| **관리자 (Admin)** | `admin` | `1234` 또는 `admin` | 전체 회원 총괄 및 매출 초기화 가능 |
| **1대 루트 회원** | `a01` | `1234` | 최상위 루트 (강현우) |
| **2대 좌측 본부** | `a02` | `1234` | a01의 좌측 직계 (김태진) |
| **2대 우측 본부** | `a03` | `1234` | a01의 우측 직계 (이서연) |
| **일반 회원** | `a01` ~ `a10000` | `1234` | 각 회원이 설정한 `HiGoID`로도 로그인 가능 |

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide React
- **Backend**: Node.js, Express (REST API)
- **Build & Dev Tooling**: Vite 6, tsx, esbuild
- **Deployment**: Vercel, Cloud Run, Render, Docker 등 지원

---

## ☁️ 배포 안내 (Deployment)

### Vercel 배포
1. GitHub 저장소에 코드를 Push합니다.
2. [Vercel](https://vercel.com)에 로그인한 뒤 **Add New Project**에서 해당 저장소를 Import합니다.
3. Framework Preset은 **Vite**로 자동 감지되며, Build Command(`npm run build`)와 Output Directory(`dist`)를 기본값으로 두고 **Deploy**를 클릭합니다.
4. 배포가 완료되면 부여된 Vercel 도메인으로 즉시 웹 접속이 가능합니다.

### Node.js / Docker / Cloud Run 배포
- Node.js 환경에서 `npm run build` 후 `npm start`를 실행하면 포트 3000에서 Express 서버와 프론트엔드가 동시에 서비스됩니다.

---

## 📄 라이선스
MIT License
