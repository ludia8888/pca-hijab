# CLAUDE.md - PCA-HIJAB 프로젝트 가이드

## 🎯 프로젝트 개요
- **프로젝트명**: 히잡 퍼스널 컬러 AI 진단 서비스 MVP
- **목표**: AI 퍼스널 컬러 진단을 통한 히잡 색상 추천
- **타겟**: 18-35세 히잡 착용 여성 (인스타그램 사용자)
- **핵심 가치**: 개인화된 색상 추천으로 구매 결정 지원

## 🛠 기술 스택
### Frontend
- React 18 + TypeScript
- Vite (빌드 도구)
- Tailwind CSS + CSS Modules
- Zustand (상태관리)
- React Query (서버 상태)
- React Router v6

### Backend
- 기존 API: ShowMeTheColor (FastAPI, 포트 8000)
- 새 API: Express.js 또는 FastAPI
- PostgreSQL
- AWS S3 또는 Cloudinary (이미지 저장)

## 📁 프로젝트 구조
```
pca-hijab/
├── frontend/          # React 애플리케이션
├── backend/           # 새 백엔드 API
├── ShowMeTheColor/    # 기존 AI API (수정 불필요)
└── docs/             # 문서
```

## 🚀 자주 사용하는 명령어

### Frontend
```bash
# 개발 서버 실행
cd frontend && npm run dev

# 빌드
cd frontend && npm run build

# 타입 체크
cd frontend && npm run typecheck

# 린트
cd frontend && npm run lint

# 테스트
cd frontend && npm test
```

### Backend (새 API)
```bash
# 개발 서버 실행
cd backend && npm run dev

# 프로덕션 실행
cd backend && npm start

# 테스트
cd backend && npm test
```

### ShowMeTheColor API
```bash
# API 실행
cd ShowMeTheColor/src && python api.py

# 또는
cd ShowMeTheColor/src && uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

## 📝 코딩 컨벤션

### 명명 규칙
- **컴포넌트**: PascalCase (예: `PersonalColorResult.tsx`)
- **함수/변수**: camelCase (예: `analyzeImage`, `isLoading`)
- **상수**: UPPER_SNAKE_CASE (예: `MAX_FILE_SIZE`)
- **타입/인터페이스**: PascalCase + 접미사 (예: `ButtonProps`, `UserData`)
- **파일명**: 컴포넌트는 PascalCase, 유틸은 camelCase

### 컴포넌트 구조
```typescript
// 1. imports
// 2. types/interfaces
// 3. component
// 4. styles (if needed)
// 5. exports
```

### Props 명명
- 이벤트 핸들러: `on` + 동작 (예: `onClick`, `onSubmit`)
- Boolean: `is/has/can` + 형용사 (예: `isLoading`, `hasError`)
- 자식 요소: `children`

## 🏗 아키텍처 패턴

### 상태 관리
1. **전역 상태** (Zustand): 사용자 세션, 진단 결과
2. **서버 상태** (React Query): API 데이터, 캐싱
3. **로컬 상태** (useState): UI 상태, 폼 입력

### 컴포넌트 설계
1. **Container/Presentational 패턴**: 로직과 UI 분리
2. **Compound Components**: 복잡한 컴포넌트 구성
3. **Custom Hooks**: 재사용 가능한 로직 추상화

### API 통합
```typescript
// services/api/personalColor.ts
class PersonalColorAPI {
  private baseURL = process.env.VITE_AI_API_URL || 'http://localhost:8000';
  
  async analyzeImage(file: File): Promise<PersonalColorResult> {
    // implementation
  }
}
```

## 🎨 디자인 시스템

### 색상
- Primary: `#FF6B6B` (코랄 핑크)
- Secondary: `#4ECDC4` (민트)
- Gray Scale: Gray 50-900
- Semantic: Success, Warning, Error, Info

### 반응형 브레이크포인트
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

### 터치 타겟
- 최소 크기: 44px × 44px
- 간격: 최소 8px

## 📱 모바일 최적화 체크리스트
- [ ] 터치 타겟 크기 확인 (44px)
- [ ] 이미지 lazy loading
- [ ] 폰트 preload
- [ ] 코드 스플리팅
- [ ] PWA 지원

## 🧪 테스트 전략
1. **단위 테스트**: Jest + React Testing Library
2. **통합 테스트**: API 연동 테스트
3. **E2E 테스트**: Cypress (선택적)
4. **성능 테스트**: Lighthouse CI

## 📊 성공 지표
### 기술적 지표
- 페이지 로드: < 3초
- AI 분석: < 30초
- Lighthouse 점수: > 90

### 비즈니스 지표
- 플로우 완료율: > 40%
- 추천 요청률: > 60%
- 공유율: > 20%

## 🚨 주요 리스크 및 대응
1. **AI API 지연**: 타임아웃 30초, 재시도 로직
2. **이미지 업로드 실패**: 클라이언트 압축, 10MB 제한
3. **모바일 성능**: 코드 스플리팅, 이미지 최적화

## 📌 중요 참고사항
- 기존 ShowMeTheColor API는 수정하지 않음
- 모바일 우선 설계 (Mobile First)
- 인스타그램 DM으로 추천 결과 발송
- 개인정보는 최소한으로 수집

## 🔗 주요 문서
- [개발 계획](./development_plan.md)
- [메인 기획문서](./hijab_personal_color_prd.md)
- [디자인 시스템](./design_system.md)
- [화면별 상세 기획](./screens_specification.md)
- [API 기술 문서](./API_TECHNICAL_DOCUMENTATION.md)

## 🐛 디버깅 팁
1. AI API 연결 실패 시: CORS 설정 확인
2. 이미지 업로드 실패 시: 파일 크기 및 형식 확인
3. 스타일 깨짐: Tailwind purge 설정 확인
## 🔧 Prompt: “Write Code with *Minimum* Bug Risk – 7-Step Engineering Playbook”

> **Context**  
> You are coding a new feature. Your top priority is to **reduce the probability of introducing bugs**. Apply the following evidence-based strategies, which combine *systemic thinking, practical tooling, and collaborative process*.

---

### 1 ️⃣  Design & Build in Small Pieces  *(Modularization + Single-Responsibility)*
- **Principle** High complexity ⇒ exponential bug risk. Cohesion↑ & Coupling↓ ⇒ errors↓.  
- **Rules** One function = one job, keep it ≤ 10 – 30 lines.  
  Layer complex flows (e.g., `handler → service → logic → utils`).

### 2 ️⃣  Write Tests First (TDD) or at Least Unit Tests
- **Evidence** Google’s 15-year study: higher coverage slashes maintenance cost.  
- **Do** For every core behavior add a test (`pytest`, `unittest`, `jest`, `vitest`).  
  Always test side-effects (DB, files).

### 3 ️⃣  Use Static Analysis (Lint + Type Check)
- **Why** Machines catch repetitive human mistakes instantly.  
- **Tools**  
  - *Python*: `mypy`, `ruff`, `flake8`  
  - *JS/TS*: `eslint`, `prettier`, `typescript --strict`  
  Auto-run in IDE (`.vscode/settings.json` or Cursor).

### 4 ️⃣  Commit Small & Often  *(Git + Branch Strategy)*
- Track history; use `git blame / bisect` to locate bugs fast.  
- Create feature-scoped branches (`feature/color-detection`).  
- Commit messages explain **why**, not just **what**.

### 5 ️⃣  Enforce Code Review / Rubber-Duck Routine
- Explaining code exposes hidden logic flaws.  
- Describe the flow to ChatGPT, a teammate, or an imaginary duck before merging.  
- Ask yourself: “Can I clearly justify this design?”

### 6 ️⃣  Prefer Logging over Ad-hoc Debugging  *(Observability)*
- Post-deploy debugging is harder than pre-deploy insight.  
- Set log levels (`INFO | DEBUG | ERROR`).  
- Log entry/exit of key paths & failure conditions  
  (*Python*: `logging`, *JS*: `winston`, `loglevel`).

### 7 ️⃣  Specification-Driven Coding (Explicit I/O Contracts)
- Define input → process → output **before** implementation.  
- Use type hints / interfaces to freeze those contracts (`Dict[str, Any]` → precise types).  
- Apply to APIs, models, DB schemas alike.

---

#### ✳️ Bonus – Use AI Tools, but Verify
Copilot, Cursor, ChatGPT = pattern engines ~70-80 % accurate.  
Double-check DB logic, async flows, edge cases.  
Always ask: “*Why did I choose this solution?*”
---
*이 문서는 Claude가 프로젝트를 더 잘 이해하고 도움을 줄 수 있도록 작성되었습니다.*