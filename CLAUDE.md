# CLAUDE.md - PCA-HIJAB Project Guide

## 1. 프로젝트 개요
- **Name**: PCA-HIJAB (Personal Color Analysis for Hijab)
- **Goal**: 얼굴 사진 기반 퍼스널 컬러 분석 + 히잡/뷰티 추천
- **Version**: 3.1 (업데이트 2025-02-16)
- **Live Demo**: https://pca-hijab.vercel.app
- **Backend API**: https://pca-hijab-backend-unified.onrender.com
- **AI API**: https://showmethecolor-api.onrender.com (Render Free, 콜드 스타트 있음)

## 2. 기술 스택 & 실행 요약
### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS, Zustand(persist), TanStack Query v5, React Router v6
- TipTap 에디터, Vitest + Testing Library + MSW
- 진입점: `frontend/src/main.tsx`, 라우팅: `frontend/src/routes/index.tsx`

### Backend
- Express.js + TypeScript
- 보안: Helmet, CORS 화이트리스트, CSRF, JWT(access/refresh)
- DB: PostgreSQL(프로덕션) / 인메모리(개발)
- 주요 라우트: `backend/src/routes/*.ts`

### AI API
- FastAPI (`ShowMeTheColor/src/api.py`), 얼굴 색상 분석 로직은 `personal_color_analysis/personal_color.py`

### 로컬 실행 명령
```bash
# Frontend
yarn --cwd frontend dev  # 또는 npm run dev

# Backend
npm --prefix backend run dev

# AI API
python ShowMeTheColor/src/api.py
```

## 3. 디렉터리 구조 핵심
```
frontend/
  src/
    routes/              # SPA 라우트 정의
    pages/               # 페이지 단위 컴포넌트
    services/api/        # Axios 래퍼, CSRF 처리 포함
    store/               # Zustand 스토어(useAppStore/useAuthStore)
    utils/               # 결과 카드/프리로딩 등 유틸리티
backend/
  src/
    index.ts             # Express 엔트리
    routes/              # auth/sessions/recommendations/products/contents/admin/debug
    middleware/          # auth, csrf, rateLimiter, validation 등
    db/                  # InMemory ↔ PostgreSQL 어댑터
    services/            # emailService, tokenCleanupService
ShowMeTheColor/
  src/api.py             # FastAPI 엔드포인트
  src/personal_color_analysis/personal_color.py
```

## 4. 핵심 기능 요약
- 사진 업로드 → `/api/sessions` 생성 → AI API `/analyze` 호출 → 결과 저장 → Result Page에서 카드 생성 (`frontend/src/utils/resultCardGeneratorV3.ts`).
- 추천 요청(`/api/recommendations`)은 세션 소유권을 검증하고, 관리자 대시보드에서 상태를 변경.
- 관리자 프론트는 `/admin/login` 인증 후 `ProtectedAdminRoute`로 롤을 검증합니다. 롤 관리 전략과 감사 로그 점검 절차를 운영 문서에 포함하세요.
- 이메일 인증 및 비밀번호 재설정은 `backend/src/routes/auth.ts` + `emailService.ts`로 구현. Resend API 키 필요.

## 5. 환경 변수 체크리스트
```env
# frontend
VITE_API_BASE_URL=https://pca-hijab-backend-unified.onrender.com/api
VITE_AI_API_URL=https://showmethecolor-api.onrender.com

# backend
NODE_ENV=production
PORT=5001
CLIENT_URL=https://pca-hijab.vercel.app
DATABASE_URL=postgresql://...
JWT_SECRET=<32+ chars>
JWT_REFRESH_SECRET=<32+ chars>
EMAIL_ENABLED=true
RESEND_API_KEY=re_...
EMAIL_FROM="PCA-HIJAB <noreply@domain>"
ENABLE_TOKEN_CLEANUP=false  # 필요 시 true로 전환
USE_AUTH_STUB=false         # 개발용 stub는 프로덕션에서 사용 금지
```

## 6. 주의/리스크 포인트
1. **관리자 인증 정책**: `/admin/login`이 JWT/롤 기반으로 전환되었으므로 운영 계정 롤 관리 프로세스를 문서화해야 합니다.
2. **토큰 클린업 비활성화**: `tokenCleanupService` 스케줄러는 기본적으로 꺼져 있음. PostgreSQL 사용 시 `ENABLE_TOKEN_CLEANUP=true`와 스키마 필드 확인.
3. **Related Contents API 미구현**: 프론트는 `/api/contents/related/:id` 호출, 백엔드에 라우트 없음 → TODO.
4. **이미지 자산 부재**: `frontend/public/images/characters` 등은 README만 있음. 실제 일러스트 추가 필요.
5. **CSP 설정**: Helmet에서 외부 스크립트를 금지하고 있으므로 추가 리소스 사용 시 `backend/src/index.ts` 수정 필요.

## 7. 테스트 & 품질
- Frontend: `npm --prefix frontend run test`, `lint`, `typecheck`
- Backend: `npm --prefix backend run lint`, `typecheck` (현재 자동화 테스트 없음)
- Docker: `docker-compose up --build -d`

## 8. 문서 & 레퍼런스
- 전체 개요: `README.md`
- 아키텍처 상세: `ARCHITECTURE.md`
- 제품/디자인 명세: `docs/PRD_문서.md`, `docs/DESIGN_IMPLEMENTATION_REPORT.md`
- 운영 가이드: `DOCKER_DEPLOYMENT.md`, `RENDER_ENV_SETUP.md`, `MONITORING_SETUP.md`, `EMAIL_SETUP.md`

---
**Communication reminder**: 모든 커뮤니케이션/PR/커밋 메시지는 한국어로 작성하고, 의사결정은 3줄 내로 요약 + 참고 문서 링크를 포함합니다.
