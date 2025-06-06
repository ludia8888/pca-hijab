# PCA-HIJAB Frontend

React + TypeScript + Vite 기반의 모바일 최적화 웹 애플리케이션입니다.

## 🛠 기술 스택

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Code Quality**: ESLint, Prettier

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

기본적으로 http://localhost:3000 에서 실행됩니다.

### 프로덕션 빌드

```bash
npm run build
```

빌드 결과물은 `dist` 폴더에 생성됩니다.

## 📁 프로젝트 구조

```
src/
├── components/         # 재사용 가능한 컴포넌트
│   ├── ui/            # 기본 UI 컴포넌트 (Button, Card 등)
│   ├── layout/        # 레이아웃 컴포넌트 (Header, PageLayout 등)
│   └── forms/         # 폼 관련 컴포넌트 (ImageUpload 등)
├── pages/             # 라우트별 페이지 컴포넌트
├── services/          # API 통신 로직
├── store/             # Zustand 상태 관리
├── utils/             # 유틸리티 함수
├── types/             # TypeScript 타입 정의
└── styles/            # 전역 스타일
```

## 🔧 주요 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# TypeScript 타입 체크
npm run typecheck

# ESLint 실행
npm run lint

# 코드 포맷팅
npm run format
```

## 🎨 디자인 시스템

### 색상

- Primary: `#FF6B6B` (코랄 핑크)
- Secondary: `#4ECDC4` (민트)
- Success: `#10B981`
- Error: `#EF4444`
- Gray Scale: `gray-50` ~ `gray-900`

### 타이포그래피

- Font: Pretendard
- Sizes: `text-xs` ~ `text-h1`
- Weights: `font-normal`, `font-medium`, `font-semibold`, `font-bold`

### 간격

- `spacing-xs`: 0.25rem
- `spacing-sm`: 0.5rem
- `spacing-md`: 0.75rem
- `spacing-lg`: 1rem
- `spacing-xl`: 1.5rem
- `spacing-2xl`: 2rem

## 🔐 환경 변수

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_IMAGE_COMPRESSION_QUALITY=0.8
VITE_MAX_IMAGE_SIZE=5242880
```

## 📱 모바일 최적화

- 터치 타겟 최소 크기: 44px × 44px
- 안전 영역 패딩 적용
- 스크롤 성능 최적화
- 이미지 지연 로딩

## 🧪 코드 품질

### ESLint 설정

TypeScript 및 React 권장 규칙을 사용합니다. 커스텀 규칙은 `eslint.config.js`에서 확인하세요.

### TypeScript 설정

Strict 모드가 활성화되어 있습니다. 타입 안정성을 위해 `any` 사용을 최소화하세요.

## 🤝 개발 가이드

### 컴포넌트 작성

```tsx
// 함수형 컴포넌트와 TypeScript 사용
const MyComponent = ({ prop }: MyComponentProps): JSX.Element => {
  return <div>{prop}</div>;
};
```

### 상태 관리

```tsx
// Zustand store 사용 예시
const { data, setData } = useAppStore();
```

### API 호출

```tsx
// services/api 사용
const result = await analyzeImage(file);
```

## 🚨 주의사항

- `node_modules`와 `dist` 폴더는 커밋하지 마세요
- 환경 변수는 `.env.example`을 참고하여 설정하세요
- 커밋 전 `npm run lint`와 `npm run typecheck`를 실행하세요