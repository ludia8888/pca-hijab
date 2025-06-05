# 컴포넌트 구조

> **연관 문서**: [메인 기획문서](./main-prd.md) | [화면별 상세 기획서](./screens-specification.md) | [API 명세서](./API_TECHNICAL_DOCUMENTATION.md)

---

## 📁 컴포넌트 디렉토리 구조

```
src/
├── components/
│   ├── ui/                    # 기본 UI 컴포넌트
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── LoadingSpinner/
│   │   ├── ProgressBar/
│   │   └── Toast/
│   ├── forms/                 # 폼 관련 컴포넌트
│   │   ├── InstagramIdForm/
│   │   ├── ImageUpload/
│   │   ├── MultiStepForm/
│   │   └── RecommendationForm/
│   ├── analysis/              # 진단 관련 컴포넌트
│   │   ├── AnalysisProgress/
│   │   ├── ColorPalette/
│   │   ├── ResultDisplay/
│   │   └── SeasonBadge/
│   ├── layout/                # 레이아웃 컴포넌트
│   │   ├── Header/
│   │   ├── Navigation/
│   │   ├── Container/
│   │   └── PageLayout/
│   └── shared/                # 공통 컴포넌트
│       ├── ShareButton/
│       ├── BackButton/
│       ├── StepIndicator/
│       └── ImagePreview/
```

---

## 🔧 기본 UI 컴포넌트

### Button Component
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
}
```

**구현 포인트**
- variant별 스타일 분기
- loading 상태 시 스피너 표시
- disabled 상태 처리
- 터치 피드백 애니메이션

### Input Component
```typescript
interface InputProps {
  type: 'text' | 'email' | 'tel'
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  label?: string
  required?: boolean
  prefix?: string // @instagram 같은 접두사
}
```

**구현 포인트**
- 실시간 검증 및 에러 표시
- 포커스 상태 애니메이션
- 접근성 라벨링

### Card Component
```typescript
interface CardProps {
  children: React.ReactNode
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
  shadow?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}
```

### LoadingSpinner Component
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  label?: string
}
```

### ProgressBar Component
```typescript
interface ProgressBarProps {
  progress: number // 0-100
  showPercentage?: boolean
  color?: string
  height?: number
}
```

---

## 📋 폼 관련 컴포넌트

### InstagramIdForm Component
```typescript
interface InstagramIdFormProps {
  onSubmit: (instagramId: string) => void
  loading?: boolean
}

interface FormState {
  instagramId: string
  isValid: boolean
  error: string | null
}
```

**주요 기능**
- 인스타그램 ID 형식 검증
- 실시간 유효성 검사
- 제출 시 로딩 상태 관리

### ImageUpload Component
```typescript
interface ImageUploadProps {
  onUpload: (file: File, preview: string) => void
  onError: (error: string) => void
  maxFileSize?: number
  acceptedFormats?: string[]
}

interface UploadState {
  isDragging: boolean
  isUploading: boolean
  progress: number
  preview: string | null
  error: string | null
}
```

**주요 기능**
- 드래그 앤 드롭 지원
- 파일 형식 및 크기 검증
- 이미지 압축 및 리사이즈
- 업로드 진행률 표시
- 미리보기 생성

### MultiStepForm Component
```typescript
interface MultiStepFormProps {
  steps: FormStep[]
  onComplete: (data: FormData) => void
  onStepChange?: (step: number) => void
}

interface FormStep {
  id: string
  title: string
  component: React.ComponentType<StepProps>
  validation?: (data: any) => boolean
}

interface StepProps {
  data: any
  onChange: (data: any) => void
  onNext: () => void
  onPrev: () => void
  isValid: boolean
}
```

**주요 기능**
- 단계별 데이터 관리
- 뒤로가기 시 데이터 보존
- 진행률 계산 및 표시
- 각 단계별 검증

### RecommendationForm Component
```typescript
interface RecommendationFormProps {
  analysisResult: AnalysisResult
  onSubmit: (preferences: UserPreferences) => void
}

interface UserPreferences {
  material: 'summer' | 'winter' | 'allseason'
  transparency: 'opaque' | 'slight' | 'any'
  priceRange: 'under-10k' | '10k-20k' | 'premium'
  fitStyle: 'tight' | 'layer' | 'loose'
  colorPreference: string[]
  additionalNotes?: string
}
```

---

## 🎨 진단 관련 컴포넌트

### AnalysisProgress Component
```typescript
interface AnalysisProgressProps {
  onComplete: (result: AnalysisResult) => void
  imageUrl: string
}

interface AnalysisStep {
  id: string
  icon: string
  message: string
  progress: number
  duration: number
}
```

**주요 기능**
- 단계별 애니메이션 시퀀스
- AI API 호출 및 결과 처리
- 에러 상황 처리
- 교육 콘텐츠 표시

### ColorPalette Component
```typescript
interface ColorPaletteProps {
  colors: Color[]
  type: 'best' | 'worst'
  title: string
  description: string
}

interface Color {
  name: string
  hex: string
  rgb: [number, number, number]
}
```

**주요 기능**
- 컬러 스와치 시각화
- 호버 시 툴팁 표시
- 접근성 지원 (색상명 읽기)

### ResultDisplay Component
```typescript
interface ResultDisplayProps {
  result: AnalysisResult
  userImage: string
  onShare?: () => void
  onSave?: () => void
}

interface AnalysisResult {
  season: string
  subtype: string
  confidence: number
  bestColors: Color[]
  worstColors: Color[]
  description: string
}
```

**주요 기능**
- 진단 결과 종합 표시
- 사용자 이미지 오버레이
- 공유 및 저장 기능

### SeasonBadge Component
```typescript
interface SeasonBadgeProps {
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  subtype: string
  size?: 'sm' | 'md' | 'lg'
}
```

---

## 🧭 레이아웃 컴포넌트

### Header Component
```typescript
interface HeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
  actions?: React.ReactNode[]
}
```

### Navigation Component
```typescript
interface NavigationProps {
  currentStep: number
  totalSteps: number
  onStepClick?: (step: number) => void
  allowNavigation?: boolean
}
```

### Container Component
```typescript
interface ContainerProps {
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  padding?: boolean
  center?: boolean
}
```

### PageLayout Component
```typescript
interface PageLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}
```

---

## 🔄 공통 컴포넌트

### ShareButton Component
```typescript
interface ShareButtonProps {
  data: ShareData
  onShare?: (method: 'native' | 'clipboard') => void
  fallbackUrl?: string
}

interface ShareData {
  title: string
  text: string
  url: string
}
```

**주요 기능**
- 네이티브 공유 API 우선 사용
- 폴백: 클립보드 복사
- 공유 완료 피드백

### BackButton Component
```typescript
interface BackButtonProps {
  onClick?: () => void
  label?: string
}
```

### StepIndicator Component
```typescript
interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  completedSteps?: number[]
  labels?: string[]
}
```

### ImagePreview Component
```typescript
interface ImagePreviewProps {
  src: string
  alt: string
  onRemove?: () => void
  overlay?: React.ReactNode
  loading?: boolean
}
```

---

## 🎣 커스텀 훅

### useFormValidation
```typescript
interface ValidationRules {
  required?: boolean
  pattern?: RegExp
  minLength?: number
  maxLength?: number
  custom?: (value: any) => boolean | string
}

function useFormValidation<T>(
  initialValues: T,
  validationRules: Record<keyof T, ValidationRules>
) {
  // 폼 상태 관리
  // 실시간 검증
  // 에러 메시지 관리
}
```

### useImageUpload
```typescript
function useImageUpload(options: {
  maxFileSize?: number
  acceptedFormats?: string[]
  compression?: boolean
}) {
  // 파일 선택 처리
  // 이미지 압축
  // 업로드 진행률
  // 에러 처리
}
```

### useAnalysisFlow
```typescript
function useAnalysisFlow() {
  // 분석 단계 관리
  // API 호출
  // 에러 및 재시도 처리
  // 결과 캐싱
}
```

### useLocalStorage
```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  // 로컬 스토리지 읽기/쓰기
  // 타입 안정성
  // SSR 호환성
}
```

### useStepNavigation
```typescript
function useStepNavigation(totalSteps: number) {
  // 단계 이동 관리
  // 뒤로가기 처리
  // 진행률 계산
  // 상태 보존
}
```

---

## 📊 상태 관리

### 전역 상태 (Zustand)
```typescript
interface AppState {
  // 사용자 세션
  sessionId: string | null
  instagramId: string | null
  
  // 진단 데이터
  uploadedImage: string | null
  analysisResult: AnalysisResult | null
  
  // 추천 데이터
  recommendationPreferences: UserPreferences | null
  
  // UI 상태
  currentStep: number
  isLoading: boolean
  error: string | null
}

interface AppActions {
  setSessionData: (sessionId: string, instagramId: string) => void
  setUploadedImage: (imageUrl: string) => void
  setAnalysisResult: (result: AnalysisResult) => void
  setRecommendationPreferences: (preferences: UserPreferences) => void
  nextStep: () => void
  prevStep: () => void
  setError: (error: string | null) => void
  reset: () => void
}
```

### 로컬 상태 패턴
```typescript
// 컴포넌트별 로컬 상태
interface ComponentState {
  // UI 상태 (로딩, 에러, 폼 입력 등)
  // 임시 데이터
  // 애니메이션 상태
}

// 커스텀 훅으로 상태 로직 분리
function useComponentLogic() {
  const [state, setState] = useState<ComponentState>(initialState)
  
  // 상태 업데이트 로직
  // 사이드 이펙트 처리
  // 이벤트 핸들러
  
  return { state, actions }
}
```

---

## 🔧 컴포넌트 개발 가이드라인

### 파일 구조
```
ComponentName/
├── index.ts              # 배럴 익스포트
├── ComponentName.tsx     # 메인 컴포넌트
├── ComponentName.types.ts # 타입 정의
├── ComponentName.styles.ts # 스타일 (styled-components 사용 시)
├── ComponentName.test.tsx # 테스트
└── hooks/                # 컴포넌트 전용 훅
    └── useComponentLogic.ts
```

### 코딩 컨벤션
1. **Props Interface**: 컴포넌트명 + Props 접미사
2. **Event Handlers**: on + 동작 (onClick, onChange, onSubmit)
3. **Boolean Props**: is/has/can + 형용사 (isLoading, hasError, canEdit)
4. **Default Props**: 컴포넌트 내부에서 기본값 설정

### 성능 최적화
1. **React.memo**: props 변경 시에만 리렌더링
2. **useMemo**: 복잡한 계산 결과 메모이제이션
3. **useCallback**: 이벤트 핸들러 메모이제이션
4. **코드 스플리팅**: 큰 컴포넌트는 lazy loading

### 접근성 (a11y)
1. **시맨틱 HTML**: 적절한 HTML 태그 사용
2. **ARIA 속성**: 스크린 리더 지원
3. **키보드 네비게이션**: 탭 순서 및 키보드 이벤트
4. **색상 대비**: WCAG 기준 준수

---

## 🔗 연관 문서

- **API 연동**: [API 명세서](./api-specification.md)
- **디자인 적용**: [디자인 시스템](./design-system.md)
- **화면 구성**: [화면별 상세 기획서](./screens-specification.md)
- **개발 환경**: [개발 환경 설정](./development-setup.md)