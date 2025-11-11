# PCA-HIJAB Information Architecture (IA)

**최종 업데이트**: 2025-02-16  
목적: 현재 구현된 화면 및 정보 구조를 디자이너/개발자가 동일하게 이해하도록 정리합니다.

## 1. 최상위 구조
```
PCA-HIJAB
│
├── 홈 & 랜딩 (/ , /landing)
│   ├── 서비스 소개, CTA
│   └── Instagram ID 입력 → 세션 생성
│
├── 퍼스널 컬러 플로우
│   ├── /diagnosis      # 사진 업로드
│   ├── /analyzing      # 단계별 진행 상황
│   ├── /result         # 분석 결과 + 추천 CTA
│   └── /completion     # 완료 안내, 카드 다운로드
│
├── 상품 영역
│   ├── /products       # 필터/검색
│   └── /products/:id   # 상세(이미지, 설명, Shopee 링크)
│
├── 콘텐츠 영역
│   └── /content/:slug  # HTML 기반 뷰어
│
├── 인증 & 계정
│   ├── /login, /signup, /verify-email
│   ├── /forgot-password, /reset-password
│   └── /mypage         # 저장/최근 상품 (현재 인증 비강제)
│
└── 관리자 (개발용)
    ├── /admin/dashboard
    └── /admin/recommendations/:id
```

## 2. 네비게이션 및 진입점
- 글로벌 헤더/푸터는 `frontend/src/components/navigation`에서 관리.
- 모바일 환경: 하단 탭(`MobileNav`)으로 주요 경로 접근.
- 진단 플로우는 홈/랜딩에서 CTA 클릭 시 `useAppStore.initSession()` 및 `/api/sessions` 호출을 통해 시작.

## 3. 화면별 콘텐츠 구성
### 3.1 홈(/)
- Hero 섹션: 분석 소개, CTA 버튼(`Get Started`)
- 추천 상품/콘텐츠 미리보기 (`HomePage.tsx`, `ContentAPI.getPopularContents`)

### 3.2 퍼스널 컬러 진단
| 단계 | 주요 요소 | 관련 파일 |
| --- | --- | --- |
| 사진 업로드 | 카메라/파일 업로드, 검증, 프라이버시 정보 | `UploadPage.tsx`, `components/camera`, `clientImageValidator.ts` |
| 분석 중 | 5단계 Progress, 캐릭터/말풍선(이미지 자리) | `AnalyzingPage.tsx`, `utils/constants.ts` |
| 결과 | 계절/톤, 색상 팔레트, 추천 버튼, 카드 미리보기 | `ResultPageV2.tsx`, `components/result/*` |
| 완료 | 요약 메시지, 카드 다운로드, 공유 | `CompletionPage.tsx` |

### 3.3 상품
- 목록: 카테고리 및 퍼스널 컬러 필터, 카드형 레이아웃 (`ProductsCatalogPage.tsx`)
- 상세: 썸네일/상세 이미지, 설명, 가격, Shopee 링크, 관련 상품 (`ProductDetailPage.tsx`)

### 3.4 콘텐츠
- `ContentDetailPage.tsx`에서 HTML 컨텐츠 렌더링 (DOMPurify 사용)
- 뷰 카운트/관련 콘텐츠 표시 (관련 콘텐츠 API는 TODO)

### 3.5 인증 & 마이페이지
- 인증 화면: Form + `AuthAPI` 호출. 에러 피드백 및 로딩 상태 제공.
- 마이페이지: 저장/최근 상품은 로컬 저장소 기반(`useAppStore`). 인증이 없더라도 접근 가능하므로 향후 보호 라우트 필요.

### 3.6 관리자
- 상품/콘텐츠 탭: 리스트 → 생성/수정 폼 (`components/admin`)
- 이미지 업로드: `/api/admin/upload/image(s)` 사용 → 업로드 파일은 서버 `uploads/`에 저장
- 추천 상세 페이지는 프로토타입 수준 (`AdminRecommendationDetail.tsx`)

## 4. 데이터 연동 요약
| 화면 | API | 비고 |
| --- | --- | --- |
| Upload/Analyzing/Result | `/api/sessions`, `/analyze`, `/api/recommendations` | 세션 ID 스토어에 저장 → 결과 업데이트 | 
| Products | `/api/products`, `/api/products/:id`, `/api/products/random` | 카테고리/톤 필터, 랜덤 추천 |
| Contents | `/api/contents`, `/api/contents/slug/:slug` | 인기/최신/카테고리, HTML 컨텐츠 |
| Auth | `/api/auth/*` | CSRF 토큰 필수, HttpOnly 쿠키 유지 |
| Admin | `/api/admin/*` (JWT + 관리자 롤) | `/admin/login`에서 인증 후 접근 가능, 감사 로그 적재 |

## 5. 예외/오류 시나리오
- 사진 검증 실패(형식/크기/얼굴 미검출) 시 사용자 안내 → 재업로드 유도
- 백엔드 CSRF 미제공 시 403 → Axios 인터셉터 자동 재시도
- 제품/콘텐츠 미존재 시 404 페이지로 안내
- 관리자 롤 미보유 시 403 (대시보드 접근 차단)

## 6. 반응형/접근성 체크
- Tailwind breakpoints(`sm`, `md`, `lg`) 기반 반응형. 핵심 CTA는 320px에서도 가독성 확보
- 버튼, 폼 컴포넌트는 최소 40px 터치 영역 유지
- Alt/ARIA 속성은 핵심 이미지에만 적용되어 있으며 추가 개선 여지 존재

## 7. 향후 개선 항목
1. 관리자 롤 세분화 및 감사 로그 뷰어 구현
2. `/api/contents/related/:id` 구현 및 UI 반영
3. 마이페이지 접근 제한(인증 필요) 및 서버 데이터 연동
4. 이미지 에셋(캐릭터/말풍선) 실제 파일 추가
5. 접근성 점검: 키보드 포커스 스타일, 스크린리더 지원 강화

---
IA는 실제 구현과 함께 유지되어야 합니다. 변경 사항 발생 시 라우트/컴포넌트/데이터 계약을 본 문서에 반영하세요.
