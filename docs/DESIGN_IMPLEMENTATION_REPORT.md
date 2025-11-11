# PCA-HIJAB 서비스 구현 현황 보고서

**최종 업데이트**: 2025-02-16  
**본 문서는 실제 코드 구현과 1:1로 매핑되는 핸드오프 자료입니다.**

## 1. 서비스 개요
- **제품명**: PCA-HIJAB (Personal Color Analysis for Hijab)
- **핵심 가치**: 사진 기반 퍼스널 컬러 분석 → 히잡/뷰티 추천 → 관리자 큐레이션 파이프라인
- **플랫폼**: React SPA (Vite) + Express API + FastAPI AI 엔진
- **주요 링크**: 프론트 https://pca-hijab.vercel.app · 백엔드 https://pca-hijab-backend-unified.onrender.com · AI https://showmethecolor-api.onrender.com

## 2. 정보 구조 & 주요 플로우
| 영역 | 경로 | 참고 파일 |
| --- | --- | --- |
| 퍼스널 컬러 플로우 | `/landing → /diagnosis → /analyzing → /result → /completion` | `frontend/src/pages/HIGLandingPage.tsx`, `UploadPage.tsx`, `AnalyzingPage.tsx`, `ResultPageV2.tsx`, `CompletionPage.tsx` |
| 상품 탐색 | `/products`, `/products/:id` | `ProductsCatalogPage.tsx`, `ProductDetailPage.tsx` |
| 콘텐츠 | `/content/:slug` | `ContentDetailPage.tsx` + `frontend/src/services/api/contents.ts` |
| 인증 | `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email` | 각 페이지 및 `frontend/src/services/api/auth.ts` |
| 마이페이지 | `/mypage` (현재 인증 미적용) | `MyPage.tsx`, `components/mypage/*`, `useAppStore.ts` |
| 관리자 | `/admin/dashboard`, `/admin/recommendations/:id` | `frontend/src/pages/admin/*.tsx`, `frontend/src/components/admin/*` |

> `frontend/src/routes/index.tsx`에서 전체 라우팅과 Lazy 로딩 구성을 확인할 수 있습니다.

## 3. 페이지별 구현 상세
### 3.1 퍼스널 컬러 진단 플로우
1. **세션 생성**: `HIGLandingPage`에서 Instagram ID 입력 → `useAppStore.initSession()` 또는 `/api/sessions`(`backend/src/routes/sessions.ts`) 호출로 세션 생성
2. **사진 업로드**: `UploadPage` → 카메라/파일 업로드(`frontend/src/components/camera/*`, `clientImageValidator.ts`)
3. **분석 진행**: `AnalyzingPage` Progress 단계(`frontend/src/utils/constants.ts`), AI API `/analyze` 호출(`frontend/src/services/api/personalColor.ts`)
4. **결과 카드**: `ResultPageV2` / `CompletionPage` → `generateResultCard` (`frontend/src/utils/resultCardGeneratorV3.ts`), 저장/공유 기능 제공
5. **추천 요청**: `frontend/src/services/api/recommendation.ts` → `/api/recommendations` (세션 소유권 검증, `backend/src/routes/recommendations.ts`)

### 3.2 상품/콘텐츠 영역
- 상품 목록은 `/api/products` → `ProductAPI.getProducts` (`frontend/src/services/api/products.ts`)
- 상세 페이지는 `/api/products/:id` 응답을 기반으로 `ProductDetailPage` 렌더링, 관련 제품은 `getRecommendedProducts` 사용
- 콘텐츠는 `/api/contents`, `/api/contents/slug/:slug`를 통해 HTML 컨텐츠 렌더링 (`DOMPurify` 이용)

### 3.3 인증 & 계정 관리
- 회원가입/로그인은 `frontend/src/store/useAuthStore.ts`에서 상태를 관리하고 `AuthAPI`를 통해 `/api/auth/*` 라우트를 호출
- 이메일 인증/비밀번호 재설정 로직은 백엔드 `auth.ts` + `emailService.ts`, Resend API가 필요
- CSRF 토큰은 `frontend/src/services/api/csrf.ts`에서 `/api/csrf-token`을 받아 Axios 인터셉터로 자동 첨부

### 3.4 마이페이지
- `MyPage.tsx`는 저장/최근 본 상품을 `useAppStore` 로컬 스토리지에 기반해 렌더링 (`SavedProducts`, `ViewedProducts` 컴포넌트)
- 현재 인증을 강제하지 않으며, 추후 `ProtectedRoute`를 사용해 제한하도록 TODO 남김

### 3.5 관리자 대시보드
- `AdminDashboard.tsx`는 상품/콘텐츠 탭으로 구성, 폼 컴포넌트는 `frontend/src/components/admin`에 분리
- `/admin/login`에서 이메일/비밀번호로 로그인하면 `useAuthStore`가 JWT 세션을 유지하고, `ProtectedAdminRoute`가 관리자 롤(`admin`, `content_manager`)을 검증
- 백엔드 `/api/admin/*` 라우트는 `authenticateAdmin`에서 JWT + 롤을 확인하고 `admin_actions` 테이블에 감사 로그를 적재

## 4. 디자인 & 컴포넌트 구현
- 시스템 폰트 기반 + Tailwind 유틸리티, 컬러 토큰은 `frontend/src/design-system/tokens.ts`
- 공통 UI: `frontend/src/components/ui` (Button, Card, Text, Input 등)
- 레이아웃: `PageLayout`, `RootLayout`, `MobileNav` 등 (`frontend/src/components/layout`)
- 애니메이션: Tailwind `animate-` 클래스와 `framer-motion` 일부 사용 (예: Result Page 효과)
- 이미지 자산: `frontend/public/images` (일부 캐릭터/말풍선 이미지는 미배치 → README 참고)

## 5. 인터랙션 & 상태 동기화
- **글로벌 상태**: `useAppStore`(세션/업로드/저장), `useAuthStore`(사용자/관리자 인증), `useAdminStore`(상품/콘텐츠 필터·폼 상태)
- **Server State**: TanStack Query는 도입되어 있지만 현재 대부분 직접 Axios 호출 후 수동 상태 업데이트 (추후 Query 적용 여지 있음)
- **에러 처리**: `frontend/src/components/ErrorBoundary` 및 `retryChunkLoad`로 코드 스플리팅 실패 대응
- **분석 선로딩**: `frontend/src/utils/preload.ts`, `coldStartHandler.ts`로 초기 로드 시 백엔드/AI API를 미리 호출

## 6. 예외 처리 & 오류 화면
- 공통 오류 페이지: `frontend/src/components/error/*`
- 백엔드 `AppError` 클래스(`backend/src/middleware/errorHandler.ts`)로 상태 코드/메시지 통일
- CSRF 토큰 누락 시 403 응답 → 프론트 Axios 인터셉터가 자동 재시도 (`csrf.ts`)
- 이미지 분석 실패 시 AI API에서 400 반환, 프론트는 재업로드 안내 표시(`UploadPage`)

## 7. 접근성 & 반응형 현황
- Tailwind breakpoints 기반 반응형 (모바일 우선)
- 버튼/입력 최소 터치 영역 40px 이상 유지
- Alt 텍스트/ARIA는 핵심 요소에만 적용되어 있어 추가 개선 여지 존재
- 다크 모드 미지원

## 8. TODO & 리스크 로그
| 항목 | 상세 | 관련 코드 |
| --- | --- | --- |
| 관리자 인증 | 이메일/비밀번호 로그인 + 롤 검증 도입 완료. 향후 세분화된 롤(뷰어/에디터) 정책 정의 필요 | `frontend/src/pages/admin/AdminLoginPage.tsx`, `ProtectedAdminRoute.tsx`, `backend/src/middleware/auth.ts` |
| Related Contents API | 프론트에서 `/api/contents/related` 호출하나 백엔드 미구현 | `ContentDetailPage.tsx`, `backend/src/routes/contents.ts` |
| 토큰 클린업 | 스케줄러 비활성화 상태, PostgreSQL 사용 시 활성화 필요 | `backend/src/services/tokenCleanupService.ts` |
| 이미지 자산 | 캐릭터/말풍선 이미지 없음 → 디자인과 이격 | `frontend/public/images/*` |
| 테스트 | 백엔드 단위 테스트 미구현 | `backend/` |

## 9. 참고 문서
- `README.md`: 전체 프로젝트 개요, 로컬 실행 방법
- `ARCHITECTURE.md`: 시스템 레이어 및 보안 구조
- `docs/PRD_문서.md`, `docs/IA_문서.md`, `docs/UserFlow_문서.md`: 제품 요구사항/IA/User Flow
- `DOCKER_DEPLOYMENT.md`, `MONITORING_SETUP.md`, `EMAIL_SETUP.md`: 운영 및 배포 가이드

---
해당 보고서는 소스 코드 기준으로 업데이트되었으며, 추가 변경 사항 발생 시 문서와 코드를 함께 갱신해 주세요.
