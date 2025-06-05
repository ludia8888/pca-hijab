# 🚀 히잡 퍼스널 컬러 AI 진단 서비스 - 개발 계획

## 📋 프로젝트 개요 분석

### 프로젝트 핵심 정보
- **목적**: AI 퍼스널 컬러 진단을 통한 히잡 색상 추천 MVP 서비스
- **타겟**: 18-35세 히잡 착용 여성, 인스타그램 활발 사용자
- **핵심 플로우**: 인스타 ID 입력 → 사진 업로드 → AI 진단 → 결과 확인 → 히잡 추천 신청 → DM 발송

### 기존 자산 활용
- **ShowMeTheColor API**: 퍼스널 컬러 진단 엔진 (FastAPI 기반, 이미 구현됨)
- **디자인 시스템**: 상세한 UI/UX 가이드라인 문서화 완료
- **화면 기획**: 7개 화면의 상세 스펙 문서화 완료

---

## 🎯 개발 목표 및 우선순위

### Phase 1: 핵심 기능 구현 (1-2주)
1. 프로젝트 초기 설정 및 기본 구조 구축
2. 메인 플로우 화면 구현 (7개 화면)
3. 기존 AI API 연동
4. 기본적인 모바일 최적화

### Phase 2: UX 최적화 (1주)
1. 로딩 애니메이션 및 트랜지션 구현
2. 터치 인터랙션 최적화
3. 이미지 업로드 성능 개선
4. 에러 처리 및 사용자 피드백

### Phase 3: 고급 기능 (1주)
1. 결과 공유 기능
2. 분석 트래킹 구현
3. 성능 모니터링
4. A/B 테스트 준비

---

## 🛠 기술 스택 결정

### Frontend
- **Framework**: React 18 + TypeScript
- **상태관리**: Zustand (전역), React Query (서버 상태)
- **스타일링**: Tailwind CSS + CSS Modules
- **라우팅**: React Router v6
- **빌드도구**: Vite

### Backend
- **기존 API**: ShowMeTheColor FastAPI (포트 8000)
- **새 API**: Express.js 또는 FastAPI (추천 데이터 관리)
- **데이터베이스**: PostgreSQL (사용자 데이터, 추천 기록)
- **파일 저장소**: AWS S3 또는 Cloudinary

### 인프라
- **호스팅**: Vercel (Frontend) + Railway/Render (Backend)
- **CDN**: Cloudflare
- **모니터링**: Sentry, Google Analytics

---

## 📁 프로젝트 구조

```
pca-hijab/
├── frontend/                 # React 애플리케이션
│   ├── src/
│   │   ├── components/      # 컴포넌트 (문서 기준)
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── hooks/          # 커스텀 훅
│   │   ├── store/          # Zustand 스토어
│   │   ├── services/       # API 클라이언트
│   │   ├── utils/          # 유틸리티 함수
│   │   ├── styles/         # 글로벌 스타일
│   │   └── types/          # TypeScript 타입
│   └── public/
├── backend/                 # 새로운 백엔드 API
│   ├── src/
│   │   ├── routes/         # API 라우트
│   │   ├── models/         # 데이터 모델
│   │   ├── services/       # 비즈니스 로직
│   │   └── utils/          # 유틸리티
│   └── tests/
├── ShowMeTheColor/         # 기존 AI API (수정 불필요)
└── docs/                   # 기존 문서들
```

---

## 📝 주요 개발 작업

### 1. 프로젝트 초기 설정
```bash
# Frontend 설정
npx create-vite@latest frontend --template react-ts
cd frontend
npm install react-router-dom zustand @tanstack/react-query axios
npm install -D tailwindcss postcss autoprefixer @types/react

# Backend 설정
mkdir backend
cd backend
npm init -y
npm install express cors dotenv helmet compression
npm install -D typescript @types/node @types/express nodemon
```

### 2. 핵심 컴포넌트 구현 우선순위

#### Phase 1 컴포넌트
1. **기본 UI 컴포넌트**
   - Button, Input, Card, LoadingSpinner
   - 디자인 시스템 문서 기준으로 구현

2. **페이지별 컴포넌트**
   - IntroPage: 인스타그램 ID 입력
   - UploadPage: 이미지 업로드
   - AnalyzingPage: 분석 진행 애니메이션
   - ResultPage: 진단 결과 표시
   - RecommendationPage: 추천 입력 폼
   - CompletionPage: 완료 화면

3. **폼 컴포넌트**
   - InstagramIdForm
   - ImageUpload (드래그앤드롭, 압축 포함)
   - MultiStepForm (추천 입력용)

### 3. API 통합

#### ShowMeTheColor API 연동
```typescript
// services/personalColorAPI.ts
interface PersonalColorResult {
  personal_color: string;
  personal_color_en: string;
  tone: string;
  tone_en: string;
  facial_colors: FacialColors;
}

class PersonalColorAPI {
  async analyzeImage(file: File): Promise<PersonalColorResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  }
}
```

#### 새 백엔드 API 엔드포인트
- `POST /api/sessions` - 세션 생성 (인스타 ID 저장)
- `POST /api/recommendations` - 추천 요청 저장
- `GET /api/health` - 헬스 체크

### 4. 모바일 최적화 구현

#### 반응형 디자인
```css
/* Tailwind Config */
module.exports = {
  theme: {
    screens: {
      'mobile': '320px',
      'tablet': '768px',
      'desktop': '1024px',
    }
  }
}
```

#### 터치 최적화
- 최소 44px 터치 타겟
- 터치 피드백 애니메이션
- 스와이프 제스처 (선택적)

### 5. 이미지 처리 최적화
```typescript
// utils/imageProcessor.ts
async function compressImage(file: File): Promise<File> {
  // 1024x1024 이하로 리사이즈
  // WebP 변환 (지원되는 경우)
  // 품질 80%로 압축
}
```

---

## 🧪 테스트 전략

### 단위 테스트
- Jest + React Testing Library
- 핵심 컴포넌트 및 유틸리티 함수

### 통합 테스트
- API 연동 테스트
- 전체 플로우 E2E 테스트 (Cypress)

### 성능 테스트
- Lighthouse CI
- 실제 디바이스 테스트

---

## 📊 성공 지표 측정

### 기술적 지표
- 페이지 로드 시간 < 3초
- AI 분석 시간 < 30초
- 모바일 Lighthouse 점수 > 90

### 비즈니스 지표
- 전체 플로우 완료율 > 40%
- 추천 요청률 > 60%
- 공유율 > 20%

---

## 🚦 리스크 및 대응 방안

### 기술적 리스크
1. **AI API 응답 지연**
   - 대응: 타임아웃 설정, 재시도 로직, 캐싱

2. **이미지 업로드 실패**
   - 대응: 클라이언트 압축, 청크 업로드, 에러 복구

3. **모바일 성능 이슈**
   - 대응: 코드 스플리팅, 이미지 최적화, 메모리 관리

### 비즈니스 리스크
1. **낮은 완료율**
   - 대응: 단계 축소, UX 개선, A/B 테스트

2. **부정확한 진단 결과**
   - 대응: 결과 검증, 사용자 피드백 수집

---

## 📅 개발 일정 (4주)

### Week 1: 기초 구축
- [ ] 프로젝트 설정 및 환경 구성
- [ ] 기본 UI 컴포넌트 구현
- [ ] 라우팅 및 페이지 구조 구현

### Week 2: 핵심 기능
- [ ] 이미지 업로드 구현
- [ ] AI API 연동
- [ ] 진단 결과 표시

### Week 3: 추천 시스템
- [ ] 멀티스텝 폼 구현
- [ ] 백엔드 API 구축
- [ ] 데이터베이스 연동

### Week 4: 최적화 및 배포
- [ ] 모바일 최적화
- [ ] 성능 튜닝
- [ ] 배포 및 모니터링 설정

---

## 🎯 즉시 시작 가능한 작업

### Day 1-2: 환경 설정
1. Frontend 프로젝트 생성 및 기본 설정
2. 디자인 시스템 기반 Tailwind 설정
3. 기본 라우팅 구조 구현

### Day 3-4: UI 컴포넌트
1. Button, Input, Card 컴포넌트 구현
2. 디자인 시스템 스타일 적용
3. Storybook 설정 (선택적)

### Day 5-7: 페이지 구현
1. 인트로 페이지 및 인스타 ID 폼
2. 이미지 업로드 페이지
3. 모바일 반응형 적용

---

## 🔗 참고 자료

- [메인 기획문서](./hijab_personal_color_prd.md)
- [API 기술 문서](./API_TECHNICAL_DOCUMENTATION.md)
- [디자인 시스템](./design_system.md)
- [모바일 UX 가이드](./mobile_ux_guide.md)
- [화면별 상세 기획](./screens_specification.md)
- [컴포넌트 구조](./component_structure.md)

---

이 개발 계획은 문서 분석을 바탕으로 작성되었으며, 실제 개발 진행 상황에 따라 조정될 수 있습니다.