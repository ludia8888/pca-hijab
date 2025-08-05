# PCA-HIJAB 기술 아키텍처 문서

**최종 수정일**: 2025-01-31  
**버전**: 3.0

## 목차

1. [시스템 개요](#시스템-개요)
2. [아키텍처 다이어그램](#아키텍처-다이어그램)
3. [컴포넌트 아키텍처](#컴포넌트-아키텍처)
4. [보안 아키텍처](#보안-아키텍처)
5. [데이터베이스 스키마](#데이터베이스-스키마)
6. [API 아키텍처](#api-아키텍처)
7. [프론트엔드 아키텍처](#프론트엔드-아키텍처)
8. [인증 플로우](#인증-플로우)
9. [배포 아키텍처](#배포-아키텍처)
10. [성능 최적화](#성능-최적화)
11. [모니터링 및 관찰성](#모니터링-및-관찰성)
12. [개발 가이드라인](#개발-가이드라인)

---

## 시스템 개요

PCA-HIJAB은 세 가지 주요 컴포넌트로 구성된 마이크로서비스 기반 아키텍처입니다:

1. **프론트엔드 애플리케이션**: PWA 기능을 갖춘 React SPA
2. **백엔드 API**: JWT 인증을 사용하는 Express.js REST API
3. **AI 서비스**: 퍼스널 컬러 분석을 위한 Python FastAPI

### 설계 원칙

- **프라이버시 우선**: 사용자 사진의 영구 저장 없음
- **모바일 최적화**: 터치 친화적, 반응형 디자인
- **확장 가능**: 독립적 확장이 가능한 마이크로서비스 아키텍처
- **보안**: 다층 보안, JWT 인증
- **성능**: 3초 미만 페이지 로드, 11초 AI 분석

## 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              클라이언트 레이어                               │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │   브라우저    │  │ 모바일 PWA   │  │   iOS 앱    │  │ Android 앱   │  │
│  │  (React)    │  │   (React)   │  │  (향후)     │  │   (향후)     │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘  │
└─────────┴─────────────────┴─────────────────┴───────────────┴──────────┘
          │                                                      │
          ▼                                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            CDN 레이어 (Vercel)                           │
├─────────────────────────────────────────────────────────────────────────┤
│         정적 자산 • 엣지 함수 • 분석 • 캐싱                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           API 게이트웨이 레이어                             │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │ Rate Limiter  │  │   CORS       │  │   인증        │                │
│  └───────────────┘  └──────────────┘  └──────────────┘                │
└─────────────────────────────────────────────────────────────────────────┘
          │                           │                          │
          ▼                           ▼                          ▼
┌──────────────────┐      ┌────────────────────┐      ┌─────────────────┐
│   백엔드 API      │      │     AI 서비스        │      │  관리자 서비스    │
│  (Express.js)    │      │    (FastAPI)       │      │  (Express.js)   │
│                  │      │                    │      │                 │
│ • 세션           │      │ • 얼굴 감지        │      │ • 사용자 관리     │
│ • 인증           │      │ • 색상 분석        │      │ • 콘텐츠 CMS     │
│ • 상품           │      │ • ML 모델          │      │ • 분석           │
│ • 콘텐츠         │      │                    │      │                 │
└────────┬─────────┘      └────────────────────┘      └────────┬────────┘
         │                                                      │
         ▼                                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           데이터 레이어                                     │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ PostgreSQL  │  │    Redis     │  │   S3/CDN     │  │  Analytics │ │
│  │  (주 DB)    │  │   (캐시)      │  │  (자산)       │  │    (GA4)   │ │
│  └─────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## 컴포넌트 아키텍처

### 프론트엔드 (React + TypeScript)

```
frontend/
├── src/
│   ├── components/           # 재사용 가능한 UI 컴포넌트
│   │   ├── ui/              # 기본 컴포넌트 (Button, Card 등)
│   │   ├── layout/          # 레이아웃 컴포넌트
│   │   ├── forms/           # 폼 컴포넌트
│   │   ├── products/        # 상품 관련 컴포넌트
│   │   ├── auth/            # 인증 컴포넌트
│   │   ├── mypage/          # 사용자 대시보드 컴포넌트
│   │   └── admin/           # 관리자 패널 컴포넌트
│   │
│   ├── pages/               # 라우트 기반 페이지 컴포넌트
│   │   ├── HomePage.tsx
│   │   ├── UploadPage.tsx
│   │   ├── AnalyzingPage.tsx
│   │   ├── ResultPage.tsx
│   │   └── admin/
│   │
│   ├── services/            # API 통합 레이어
│   │   ├── api/
│   │   │   ├── client.ts    # Axios 인스턴스
│   │   │   ├── auth.ts      # 인증 엔드포인트
│   │   │   ├── session.ts   # 세션 엔드포인트
│   │   │   └── products.ts  # 상품 엔드포인트
│   │   └── analytics.ts     # 분석 서비스
│   │
│   ├── store/               # 상태 관리 (Zustand)
│   │   ├── useAppStore.ts   # 전역 앱 상태
│   │   ├── useAuthStore.ts  # 인증 상태
│   │   └── useAdminStore.ts # 관리자 상태
│   │
│   ├── hooks/               # 커스텀 React 훅
│   │   ├── useAuth.ts
│   │   ├── useAnalysis.ts
│   │   └── useProducts.ts
│   │
│   ├── utils/               # 유틸리티 함수
│   │   ├── validation.ts
│   │   ├── imageProcessor.ts
│   │   └── sessionHelper.ts
│   │
│   └── design-system/       # 디자인 토큰 및 테마
│       ├── colors.ts
│       ├── typography.ts
│       └── spacing.ts
```

### 백엔드 API (Express.js + TypeScript)

```
backend/
├── src/
│   ├── routes/              # API 라우트 핸들러
│   │   ├── auth.ts          # 인증 라우트
│   │   ├── sessions.ts      # 세션 관리
│   │   ├── products.ts      # 상품 CRUD
│   │   ├── contents.ts      # 콘텐츠 관리
│   │   └── admin.ts         # 관리자 작업
│   │
│   ├── middleware/          # Express 미들웨어
│   │   ├── auth.ts          # JWT 검증
│   │   ├── authorization.ts # 리소스 소유권
│   │   ├── rateLimiter.ts   # Rate limiting
│   │   ├── validation.ts    # 입력 검증
│   │   └── errorHandler.ts  # 오류 처리
│   │
│   ├── services/            # 비즈니스 로직
│   │   ├── authService.ts   # 인증 작업
│   │   ├── emailService.ts  # 이메일 전송
│   │   └── analyticsService.ts
│   │
│   ├── db/                  # 데이터베이스 레이어
│   │   ├── index.ts         # DB 인터페이스
│   │   ├── postgres.ts      # PostgreSQL 클라이언트
│   │   └── migrations/      # 스키마 마이그레이션
│   │
│   └── utils/               # 유틸리티
│       ├── crypto.ts        # 암호화 헬퍼
│       ├── logging.ts       # 보안 로깅
│       └── validation.ts    # 검증기
```

### AI 서비스 (Python FastAPI)

```
ShowMeTheColor/
├── src/
│   ├── api.py               # FastAPI 애플리케이션
│   ├── personal_color_analysis/
│   │   ├── __init__.py
│   │   ├── face_detector.py # 얼굴 감지
│   │   ├── color_extractor.py # 색상 분석
│   │   ├── season_classifier.py # 계절 분류
│   │   └── models/          # ML 모델
│   └── utils/
│       ├── image_processor.py
│       └── color_converter.py
```

## 보안 아키텍처

### 다층 보안 모델

```
┌─────────────────────────────────────────────────────────────┐
│                    네트워크 보안                               │
├─────────────────────────────────────────────────────────────┤
│ • HTTPS 강제 (TLS 1.3)                                      │
│ • 보안 헤더 (Helmet.js)                                     │
│ • CORS 화이트리스트                                         │
│ • DDoS 보호 (Cloudflare/Vercel)                           │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  애플리케이션 보안                              │
├─────────────────────────────────────────────────────────────┤
│ • JWT 인증 (access + refresh 토큰)                         │
│ • CSRF 보호                                                │
│ • Rate limiting (인증 5회/분, API 100회/분)                 │
│ • 입력 검증 및 살균                                         │
│ • SQL 인젝션 방지                                          │
│ • XSS 보호                                                 │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     데이터 보안                               │
├─────────────────────────────────────────────────────────────┤
│ • Bcrypt 비밀번호 해싱 (10 라운드)                          │
│ • 안전한 토큰 생성                                          │
│ • 민감한 데이터 암호화                                       │
│ • 이미지 저장 안 함 정책                                     │
│ • 보안 로깅 (PII 없음)                                      │
└─────────────────────────────────────────────────────────────┘
```

### 보안 헤더 설정

```typescript
// Helmet.js 설정
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "www.googletagmanager.com"],
      connectSrc: ["'self'", "https://api.pca-hijab.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

## 데이터베이스 스키마

### 엔티티 관계 다이어그램

```sql
-- 사용자 테이블
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    email_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    personal_color_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 세션 테이블
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    instagram_id VARCHAR(255),
    uploaded_image_url TEXT,
    analysis_result JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 추천 테이블
CREATE TABLE recommendations (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) REFERENCES sessions(id),
    user_id UUID REFERENCES users(id),
    instagram_id VARCHAR(255) NOT NULL,
    personal_color_result JSONB NOT NULL,
    preferences JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 상품 테이블
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50),
    colors JSONB NOT NULL,
    personal_colors TEXT[] NOT NULL,
    images JSONB NOT NULL,
    tags TEXT[],
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 콘텐츠 테이블
CREATE TABLE contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category VARCHAR(50) NOT NULL,
    tags TEXT[],
    author_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'draft',
    featured_image VARCHAR(255),
    view_count INTEGER DEFAULT 0,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 리프레시 토큰 테이블
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 성능을 위한 인덱스
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_recommendations_status ON recommendations(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_personal_colors ON products USING GIN(personal_colors);
CREATE INDEX idx_contents_slug ON contents(slug);
CREATE INDEX idx_contents_status ON contents(status);
```

## API 아키텍처

### RESTful API 설계

```yaml
# API 구조
/api
  /auth
    POST   /signup          # 사용자 등록
    GET    /verify-email    # 이메일 인증
    POST   /login           # 사용자 로그인
    POST   /refresh         # 액세스 토큰 갱신
    POST   /logout          # 사용자 로그아웃
    POST   /forgot-password # 비밀번호 재설정 요청
    POST   /reset-password  # 비밀번호 재설정

  /sessions
    POST   /                # 세션 생성
    GET    /:id             # 세션 상세 조회
    PATCH  /:id             # 세션 업데이트

  /recommendations
    POST   /                # 추천 생성
    GET    /:id             # 추천 조회
    GET    /                # 사용자 추천 목록

  /products
    GET    /                # 상품 목록 (필터 포함)
    GET    /:id             # 상품 상세 조회
    POST   /                # 상품 생성 (관리자)
    PUT    /:id             # 상품 수정 (관리자)
    DELETE /:id             # 상품 삭제 (관리자)

  /contents
    GET    /                # 콘텐츠 목록
    GET    /slug/:slug      # Slug로 콘텐츠 조회
    POST   /                # 콘텐츠 생성 (관리자)
    PUT    /:id             # 콘텐츠 수정 (관리자)
    DELETE /:id             # 콘텐츠 삭제 (관리자)

  /admin
    GET    /statistics      # 대시보드 통계
    GET    /users           # 사용자 관리
    GET    /recommendations # 추천 대기열
```

### API 응답 형식

```typescript
// 성공 응답
{
  "success": true,
  "data": T,
  "message": string,
  "metadata": {
    "timestamp": string,
    "version": string
  }
}

// 오류 응답
{
  "success": false,
  "error": {
    "code": string,
    "message": string,
    "details": any
  },
  "metadata": {
    "timestamp": string,
    "requestId": string
  }
}
```

## 프론트엔드 아키텍처

### 상태 관리 패턴

```typescript
// Zustand 스토어 구조
interface AppState {
  // 사용자 상태
  user: User | null;
  isAuthenticated: boolean;
  
  // 세션 상태
  sessionId: string | null;
  analysisResult: PersonalColorResult | null;
  
  // UI 상태
  isLoading: boolean;
  error: Error | null;
  
  // 액션
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// 서버 상태를 위한 React Query
const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => ProductAPI.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5분
  });
};
```

### 컴포넌트 설계 패턴

```typescript
// 복합 컴포넌트 패턴
const Card = ({ children }) => <div className="card">{children}</div>;
Card.Header = ({ children }) => <div className="card-header">{children}</div>;
Card.Body = ({ children }) => <div className="card-body">{children}</div>;
Card.Footer = ({ children }) => <div className="card-footer">{children}</div>;

// 커스텀 훅 패턴
const useAuth = () => {
  const { user, login, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (error) {
      toast.error('로그인 실패');
    }
  };
  
  return { user, handleLogin, logout };
};
```

## 인증 플로우

### JWT 토큰 플로우

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│ 클라이언트 │      │   API    │      │   인증    │      │    DB    │
└────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘
     │                  │                  │                  │
     │  POST /login     │                  │                  │
     │─────────────────►│                  │                  │
     │                  │  검증            │                  │
     │                  │─────────────────►│                  │
     │                  │                  │  비밀번호 확인    │
     │                  │                  │─────────────────►│
     │                  │                  │                  │
     │                  │                  │◄─────────────────│
     │                  │  토큰 생성        │                  │
     │                  │◄─────────────────│                  │
     │  Access + Refresh│                  │                  │
     │◄─────────────────│                  │                  │
     │                  │                  │                  │
     │  API 요청        │                  │                  │
     │─────────────────►│                  │                  │
     │  + Access 토큰   │  토큰 검증        │                  │
     │                  │─────────────────►│                  │
     │                  │                  │                  │
     │                  │◄─────────────────│                  │
     │  응답            │                  │                  │
     │◄─────────────────│                  │                  │
     │                  │                  │                  │
     │  토큰 만료        │                  │                  │
     │─────────────────►│                  │                  │
     │                  │  401 Unauthorized│                  │
     │◄─────────────────│                  │                  │
     │                  │                  │                  │
     │  POST /refresh   │                  │                  │
     │─────────────────►│                  │                  │
     │  + Refresh 토큰  │  리프레시 검증    │                  │
     │                  │─────────────────►│                  │
     │                  │                  │  유효성 확인      │
     │                  │                  │─────────────────►│
     │                  │                  │                  │
     │                  │                  │◄─────────────────│
     │                  │  새 토큰          │                  │
     │                  │◄─────────────────│                  │
     │  새 Access 토큰   │                  │                  │
     │◄─────────────────│                  │                  │
```

## 배포 아키텍처

### 프로덕션 인프라

```yaml
# 프론트엔드 배포 (Vercel)
Frontend:
  Platform: Vercel
  Region: 글로벌 엣지 네트워크
  Features:
    - 자동 HTTPS
    - 엣지 캐싱
    - 이미지 최적화
    - 분석
    - Web Vitals 모니터링
  Environment:
    - 프로덕션 브랜치: main
    - 프리뷰 배포: PR
    - 커스텀 도메인: pca-hijab.com

# 백엔드 배포 (Render)
Backend:
  Platform: Render
  Region: US-East (버지니아)
  Type: 웹 서비스
  Features:
    - 자동 확장
    - 헬스 체크
    - 무중단 배포
    - 영구 디스크
  Resources:
    - RAM: 512MB - 2GB
    - CPU: 공유 - 전용
    - 데이터베이스: PostgreSQL 14

# AI 서비스 배포 (Google Cloud Run)
AI_Service:
  Platform: Google Cloud Run
  Region: us-central1
  Features:
    - 서버리스 확장
    - 사용량 기반 과금
    - 컨테이너 기반
    - GPU 지원 (선택사항)
  Configuration:
    - 메모리: 2GB
    - CPU: 2 vCPU
    - 타임아웃: 60초
    - 최대 인스턴스: 100
```

### CI/CD 파이프라인

```yaml
# GitHub Actions 워크플로우
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run typecheck

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

## 성능 최적화

### 프론트엔드 최적화

```typescript
// 1. 코드 스플리팅
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// 2. 이미지 최적화
const OptimizedImage = ({ src, alt, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <>
      {!loaded && <Skeleton />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        {...props}
      />
    </>
  );
};

// 3. 메모이제이션
const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => 
    heavyProcessing(data), [data]
  );
  
  return <div>{processedData}</div>;
});

// 4. 리스트를 위한 가상 스크롤링
const ProductList = ({ products }) => {
  return (
    <VirtualList
      height={600}
      itemCount={products.length}
      itemSize={120}
      renderItem={({ index, style }) => (
        <ProductCard 
          product={products[index]} 
          style={style} 
        />
      )}
    />
  );
};
```

### 백엔드 최적화

```typescript
// 1. 데이터베이스 쿼리 최적화
const getProductsOptimized = async (filters) => {
  const query = db
    .select('products')
    .join('categories', 'products.category_id', 'categories.id')
    .where('products.is_active', true);
    
  // 인덱스 사용
  if (filters.category) {
    query.where('categories.slug', filters.category);
  }
  
  // 페이지네이션
  const { page = 1, limit = 20 } = filters;
  query.limit(limit).offset((page - 1) * limit);
  
  return query;
};

// 2. 캐싱 전략
const getCachedProducts = async (filters) => {
  const cacheKey = `products:${JSON.stringify(filters)}`;
  
  // Redis 캐시 확인
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // 데이터베이스에서 가져오기
  const products = await getProductsOptimized(filters);
  
  // 5분간 캐시
  await redis.setex(cacheKey, 300, JSON.stringify(products));
  
  return products;
};

// 3. 요청 배치 처리
const batchProcessor = new DataLoader(async (ids) => {
  const products = await db
    .select('*')
    .from('products')
    .whereIn('id', ids);
    
  return ids.map(id => 
    products.find(p => p.id === id)
  );
});
```

## 모니터링 및 관찰성

### 로깅 전략

```typescript
// 구조화된 로깅
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  const requestId = uuidv4();
  req.requestId = requestId;
  
  logger.info('요청 수신', {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  res.on('finish', () => {
    logger.info('요청 완료', {
      requestId,
      statusCode: res.statusCode,
      duration: Date.now() - req.startTime
    });
  });
  
  next();
});
```

### 메트릭 수집

```typescript
// Prometheus 메트릭
const promClient = require('prom-client');
const register = new promClient.Registry();

// HTTP 요청 지속시간
const httpDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP 요청 지속시간 (초)',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

register.registerMetric(httpDuration);

// AI 분석 지속시간
const aiAnalysisDuration = new promClient.Histogram({
  name: 'ai_analysis_duration_seconds',
  help: 'AI 분석 지속시간 (초)',
  buckets: [5, 10, 15, 20, 30]
});

register.registerMetric(aiAnalysisDuration);
```

### 오류 추적

```typescript
// Sentry 통합
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
  ],
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // 민감한 데이터 제거
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    return event;
  }
});
```

## 개발 가이드라인

### 코드 스타일 가이드

```typescript
// 1. TypeScript strict 모드 사용
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}

// 2. 함수형 컴포넌트 선호
const Component: FC<Props> = ({ prop1, prop2 }) => {
  return <div>{prop1}</div>;
};

// 3. 적절한 에러 바운더리 사용
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('React 에러 바운더리', { error, info });
  }
}

// 4. 적절한 로딩 상태 구현
const DataComponent = () => {
  const { data, isLoading, error } = useQuery();
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <EmptyState />;
  
  return <DataDisplay data={data} />;
};
```

### 테스팅 전략

```typescript
// 단위 테스트 예제
describe('AuthService', () => {
  it('비밀번호를 올바르게 해싱해야 함', async () => {
    const password = 'testPassword123';
    const hash = await authService.hashPassword(password);
    
    expect(hash).not.toBe(password);
    expect(await bcrypt.compare(password, hash)).toBe(true);
  });
});

// 통합 테스트 예제
describe('POST /api/auth/login', () => {
  it('유효한 자격 증명에 대해 토큰을 반환해야 함', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
      
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });
});

// E2E 테스트 예제
test('전체 사용자 여정', async ({ page }) => {
  await page.goto('/');
  await page.click('text=시작하기');
  await page.fill('input[name=email]', 'test@example.com');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL('/dashboard');
});
```

### 보안 모범 사례

1. **사용자 입력을 절대 신뢰하지 않기** - 항상 검증하고 살균하기
2. **매개변수화된 쿼리 사용** - SQL 인젝션 방지
3. **적절한 CORS 구현** - 허용된 origin 화이트리스트
4. **민감한 데이터 보호** - 저장 및 전송 시 암호화
5. **정기적인 보안 감사** - `npm audit` 및 의존성 스캐닝 사용
6. **Rate limiting 구현** - 무차별 대입 공격 방지
7. **보안 헤더 사용** - Helmet.js 설정
8. **보안 이벤트 로깅** - 실패한 인증 시도 추적

---

## 결론

이 아키텍처 문서는 PCA-HIJAB 시스템에 대한 포괄적인 개요를 제공합니다. 시스템이 발전하고 새로운 패턴이 등장함에 따라 업데이트되어야 합니다. 구체적인 구현 세부사항은 코드베이스와 인라인 문서를 참조하세요.

**질문이나 설명이 필요한 경우 개발팀에 문의하세요.**