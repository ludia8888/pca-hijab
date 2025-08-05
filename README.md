# 🧕 PCA-HIJAB: AI 기반 퍼스널 컬러 분석 및 히잡 추천 서비스

AI를 활용하여 퍼스널 컬러 타입을 진단하고 개인에게 맞는 히잡 색상을 추천하는 모바일 최적화 웹 서비스입니다. 포괄적인 상품 카탈로그와 콘텐츠 관리 기능을 제공합니다.

## 🚀 라이브 데모
- **프로덕션 앱**: https://pca-hijab.vercel.app
- **백엔드 API**: https://pca-hijab-backend.onrender.com
- **AI API**: 현재 로컬 설정 필요 (클라우드 옵션은 배포 가이드 참조)

## 🎯 프로젝트 개요

### ✨ 주요 기능
- **AI 퍼스널 컬러 분석**: 얼굴 사진을 분석하여 봄/여름/가을/겨울 타입 진단
- **맞춤형 색상 추천**: 분석 결과를 바탕으로 어울리는 색상과 피해야 할 색상 제안
- **히잡 상품 카탈로그**: 색상, 카테고리, 퍼스널 컬러 매칭으로 상품 검색 및 필터링
- **콘텐츠 관리 시스템**: 히잡 스타일링과 색채 이론에 대한 블로그 포스트 및 가이드
- **사용자 인증**: 이메일 인증과 JWT 토큰을 통한 안전한 회원가입/로그인
- **개인화된 대시보드**: 분석 기록, 저장된 상품, 추천 내역 확인
- **관리자 패널**: 콘텐츠와 추천 관리를 위한 한국어 관리자 인터페이스
- **프라이버시 우선**: 사진은 즉시 분석 후 바로 삭제 - 저장하지 않음
- **아름다운 결과 카드**: 종합적인 뷰티 추천이 포함된 한국풍 디자인
- **모바일 우선 디자인**: PWA 기능을 갖춘 인스타그램 DM 쇼핑 플로우에 최적화
- **다국어 지원**: 현재 영어 지원 (관리자 패널은 한국어 UI)
- **빠른 분석**: 약 11초 내 완료되도록 최적화

### 기술 스택

#### 프론트엔드
- **프레임워크**: React 18 + TypeScript + Vite
- **스타일링**: Tailwind CSS + CSS Modules + 커스텀 디자인 시스템
- **상태 관리**: Zustand (persist 미들웨어 포함)
- **서버 상태**: React Query v5 (TanStack Query)
- **라우팅**: React Router v6 (lazy loading 지원)
- **리치 텍스트 에디터**: TipTap (콘텐츠 생성용)
- **분석**: Google Analytics 4 + Vercel Analytics
- **테스팅**: Vitest + React Testing Library + MSW
- **이미지 처리**: Browser Canvas API, HEIC to JPEG 변환
- **타이포그래피**: 프리미엄 디자인을 위한 Playfair Display + Noto Sans
- **아이콘**: 일관된 아이콘 시스템을 위한 Lucide React
- **성능**: 코드 스플리팅, lazy loading, 이미지 최적화

#### 백엔드
- **메인 API**: Express.js + TypeScript (포트 5001)
- **데이터베이스**: 이중 지원 - PostgreSQL (프로덕션) / In-memory (개발)
- **인증**: JWT (refresh token 포함), 쿠키 기반 세션
- **보안**: Helmet.js, CSRF 보호, rate limiting을 포함한 종합적인 보안
- **이메일 서비스**: 인증 및 비밀번호 재설정을 위한 Nodemailer
- **파일 업로드**: 이미지 검증 기능이 있는 Multer
- **검증**: 입력 살균을 위한 Express-validator
- **크론 작업**: 예약 작업을 위한 Node-cron

#### AI API
- **프레임워크**: Python FastAPI (ShowMeTheColor - 포트 8000)
- **얼굴 감지**: 68개 랜드마크를 사용하는 dlib
- **색상 분석**: K-means 클러스터링, Lab/HSV 색상 공간
- **이미지 처리**: OpenCV, MediaPipe, Pillow
- **과학 연산**: NumPy, SciPy, scikit-learn
- **서버**: Uvicorn ASGI 서버

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn
- Python 3.8+ (AI API용)
- PostgreSQL (선택사항, 프로덕션 설정용)

### 빠른 시작

```bash
# 저장소 복제
git clone https://github.com/[your-username]/pca-hijab.git
cd pca-hijab

# 모든 의존성 설치
npm install

# 모든 서비스 시작 (3개의 터미널 필요)
# 터미널 1: 프론트엔드 (http://localhost:5173)
cd frontend && npm run dev

# 터미널 2: 백엔드 API (http://localhost:5001)
cd backend && npm run dev

# 터미널 3: AI API (http://localhost:8000)
cd ShowMeTheColor/src && python api.py
```

### 상세 설정

#### 프론트엔드 설정
```bash
cd frontend
npm install

# 환경 변수 복사
cp .env.example .env

# 개발
npm run dev

# 프로덕션 빌드
npm run build
npm run preview

# 타입 체크 및 린팅
npm run typecheck
npm run lint
```

#### 백엔드 설정
```bash
cd backend
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 설정에 맞게 편집

# 핫 리로드로 개발
npm run dev

# 프로덕션
npm run build
npm start

# 테스트 실행
npm test
```

#### AI API 설정
```bash
cd ShowMeTheColor

# 가상 환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 서버 실행
cd src
python api.py
# 또는
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

## 🔧 환경 변수

### 프론트엔드 (.env)
```env
# API 설정
VITE_AI_API_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:5001/api

# 분석 (선택사항)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_VERCEL_ANALYTICS_ID=

# 기능 플래그
VITE_ENABLE_AUTH=true
VITE_ENABLE_PRODUCTS=true
VITE_ENABLE_CONTENT=true
```

### 백엔드 (.env)
```env
# 서버 설정
PORT=5001
NODE_ENV=development

# 데이터베이스 (선택사항 - 설정하지 않으면 in-memory 사용)
DATABASE_URL=postgresql://user:password@localhost:5432/pca_hijab

# 인증
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
COOKIE_SECRET=your-cookie-secret

# 이메일 서비스
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="PCA-HIJAB <noreply@pca-hijab.com>"

# 보안
ADMIN_API_KEY=your-secure-admin-api-key
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000

# 외부 서비스
CLIENT_URL=http://localhost:5173
```

## 📱 주요 기능 및 사용자 플로우

### 1. 인증 시스템
- **회원가입**: 이메일 인증 필수, 강력한 비밀번호 검증
- **로그인**: 리프레시 토큰을 포함한 JWT 기반 인증
- **비밀번호 재설정**: 안전한 토큰 기반 비밀번호 복구
- **세션 관리**: 자동 토큰 갱신, 안전한 로그아웃

### 2. 퍼스널 컬러 분석 플로우
- **사진 업로드**: 프라이버시 안내와 함께 갤러리 선택 또는 카메라 촬영
- **AI 분석**: 5단계 실시간 진행 상황 표시 (약 11초)
- **결과 표시**: 신뢰도 점수와 함께 계절 색상 진단
- **결과 카드**: 색상 팔레트와 추천이 포함된 다운로드 가능한 카드
- **소셜 공유**: 인스타그램, 왓츠앱 등에서 결과 공유

### 3. 상품 카탈로그
- **상품 검색**: 카테고리, 색상, 퍼스널 컬러 매칭으로 필터링
- **상품 상세**: 이미지, 설명, 가격, 색상 매칭 정보
- **상품 저장**: 좋아하는 아이템으로 위시리스트 구성
- **관리자 관리**: 상품 카탈로그 CRUD 작업

### 4. 콘텐츠 관리
- **블로그 포스트**: 히잡 스타일링 가이드, 색채 이론 기사
- **리치 텍스트 에디터**: 이미지를 포함한 매력적인 콘텐츠 생성
- **카테고리**: 주제별로 콘텐츠 구성
- **SEO 친화적**: slug 기반 URL, 메타 설명

### 5. 사용자 대시보드 (마이페이지)
- **프로필 관리**: 개인 정보 업데이트
- **분석 기록**: 과거 색상 분석 보기
- **저장된 상품**: 위시리스트 관리
- **추천**: 추천 요청 추적

### 6. 관리자 패널
- **한국어 UI**: 완전히 현지화된 관리자 인터페이스
- **사용자 관리**: 사용자 여정 및 분석 보기
- **추천 관리**: 요청 처리 및 추적
- **콘텐츠 에디터**: 블로그 포스트 생성 및 관리
- **상품 관리**: 상품 추가/수정/삭제

## 🏗 프로젝트 구조

```
pca-hijab/
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/      # 재사용 가능한 컴포넌트
│   │   │   ├── ui/         # 기본 UI 컴포넌트
│   │   │   ├── layout/     # 레이아웃 컴포넌트
│   │   │   ├── forms/      # 폼 컴포넌트
│   │   │   ├── products/   # 상품 컴포넌트
│   │   │   ├── auth/       # 인증 컴포넌트
│   │   │   ├── mypage/     # 사용자 대시보드
│   │   │   └── admin/      # 관리자 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── services/       # API 서비스
│   │   ├── store/          # Zustand 스토어
│   │   ├── hooks/          # 커스텀 React 훅
│   │   ├── utils/          # 유틸리티 함수
│   │   ├── design-system/  # 디자인 토큰 및 테마
│   │   └── types/          # TypeScript 정의
│   └── public/             # 정적 자산
│
├── backend/                # Express.js 백엔드
│   ├── src/
│   │   ├── routes/        # API 라우트
│   │   ├── middleware/    # Express 미들웨어
│   │   ├── services/      # 비즈니스 로직
│   │   ├── db/           # 데이터베이스 레이어
│   │   ├── types/        # TypeScript 타입
│   │   └── utils/        # 유틸리티
│   └── scripts/          # 데이터베이스 스크립트
│
├── ShowMeTheColor/       # Python AI API
│   ├── src/
│   │   ├── api.py       # FastAPI 서버
│   │   └── personal_color_analysis/  # AI 모듈
│   └── res/             # 리소스 파일
│
└── docs/                # 문서
```

## 🔒 보안 기능

### 인증 및 권한 부여
- 액세스/리프레시 토큰 패턴을 사용한 JWT 기반 인증
- 리프레시 토큰을 위한 안전한 쿠키 저장
- 신규 계정에 대한 이메일 인증
- 시간 제한이 있는 토큰으로 비밀번호 재설정
- 색상 분석을 위한 세션 기반 익명 액세스
- 리소스 소유권 확인

### API 보안
- 보안 헤더를 위한 Helmet.js
- 상태 변경 작업에 대한 CSRF 보호
- Rate limiting (인증: 5회/분, API: 100회/분)
- 입력 검증 및 살균
- SQL 인젝션 방지
- XSS 보호
- 화이트리스트 origin을 사용한 CORS

### 데이터 보호
- bcrypt로 비밀번호 해싱 (10 라운드)
- 로그에서 민감한 데이터 제외
- 안전한 랜덤 토큰 생성
- 프로덕션에서 HTTPS 강제
- 이미지 저장 안 함 - 분석 후 즉시 삭제

## 📊 API 문서

### 인증 엔드포인트
```typescript
// 사용자 등록
POST /api/auth/signup
Body: { email, password, name }

// 이메일 인증
GET /api/auth/verify-email?token=xxx

// 사용자 로그인
POST /api/auth/login
Body: { email, password }

// 토큰 갱신
POST /api/auth/refresh

// 로그아웃
POST /api/auth/logout

// 비밀번호 재설정 요청
POST /api/auth/forgot-password
Body: { email }

// 비밀번호 재설정
POST /api/auth/reset-password
Body: { token, newPassword }
```

### 세션 및 분석 엔드포인트
```typescript
// 세션 생성
POST /api/sessions
Body: { instagramId?: string }

// 세션 조회
GET /api/sessions/:sessionId

// 분석 결과로 세션 업데이트
PATCH /api/sessions/:sessionId
Body: { analysisResult, uploadedImageUrl }
```

### 상품 엔드포인트
```typescript
// 상품 목록 조회
GET /api/products?category=hijab&personalColor=spring

// ID로 상품 조회
GET /api/products/:id

// 관리자: 상품 생성
POST /api/products
Headers: { 'x-api-key': 'admin-key' }

// 관리자: 상품 수정
PUT /api/products/:id

// 관리자: 상품 삭제
DELETE /api/products/:id
```

### 콘텐츠 엔드포인트
```typescript
// 콘텐츠 목록 조회
GET /api/contents?category=guide&status=published

// Slug로 콘텐츠 조회
GET /api/contents/slug/:slug

// 관리자: 콘텐츠 생성
POST /api/contents

// 관리자: 콘텐츠 수정
PUT /api/contents/:id
```

## 🧪 테스팅

```bash
# 프론트엔드 테스트
cd frontend
npm test              # 테스트 실행
npm run test:ui      # UI와 함께
npm run test:coverage # 커버리지 리포트

# 백엔드 테스트
cd backend
npm test             # 모든 테스트 실행
npm run test:watch   # 감시 모드

# E2E 테스트
npm run test:e2e
```

## 📈 분석 및 모니터링

### 프론트엔드 분석
- 사용자 행동 추적을 위한 Google Analytics 4
- 성능 메트릭을 위한 Vercel Analytics
- 전환 퍼널을 위한 커스텀 이벤트 추적
- 상세 컨텍스트가 포함된 오류 추적

### 백엔드 모니터링
- 헬스 체크 엔드포인트
- 상관 ID가 포함된 요청 로깅
- 스택 추적이 포함된 오류 로깅
- 성능 메트릭
- 데이터베이스 연결 모니터링

## 🚀 배포

### 프론트엔드 (Vercel)
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# Vercel 대시보드에서 설정할 환경 변수
# VITE_AI_API_URL, VITE_API_BASE_URL 등
```

### 백엔드 (Render/Railway)
```bash
# PostgreSQL이 프로비저닝되었는지 확인
# 대시보드에서 환경 변수 설정
# GitHub 통합을 통해 배포
```

### AI API (Google Cloud Run)
```bash
# Docker 이미지 빌드
docker build -t pca-hijab-ai .

# Cloud Run에 배포
gcloud run deploy pca-hijab-ai --image pca-hijab-ai
```

## 🤝 기여하기

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'feat: 놀라운 기능 추가'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 열기

### 커밋 규칙
- `feat:` 새로운 기능
- `fix:` 버그 수정
- `docs:` 문서
- `style:` 코드 스타일
- `refactor:` 코드 리팩토링
- `test:` 테스팅
- `chore:` 유지보수

### 개발 워크플로우
1. 커밋 전 테스트 실행
2. TypeScript 오류 없음 확인
3. ESLint 규칙 준수
4. 필요시 문서 업데이트

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- **ShowMeTheColor**: 원본 AI 퍼스널 컬러 분석 엔진
- **디자인 영감**: 한국 뷰티 앱과 인스타그램 쇼핑 UX
- **오픈소스 라이브러리**: React, FastAPI, dlib, 그리고 놀라운 OSS 커뮤니티
- **타이포그래피**: Google Fonts (Playfair Display, Noto Sans)
- **아이콘**: Lucide React

## 📞 지원

- **문서**: [아키텍처 가이드](./ARCHITECTURE.md)
- **이슈**: [GitHub Issues](https://github.com/yourusername/pca-hijab/issues)
- **이메일**: support@pca-hijab.com

---

<p align="center">
  히잡을 착용하는 커뮤니티를 위해 ❤️로 만들었습니다
  <br>
  <strong>프라이버시 우선 • AI 기반 • 커뮤니티 중심</strong>
</p>