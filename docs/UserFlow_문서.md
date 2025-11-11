# PCA-HIJAB User Flow

**업데이트**: 2025-02-16  
목적: 구현된 화면 기준 사용자 여정을 정리하여 디자인/QA/개발이 동일한 플로우를 공유하도록 함.

## 1. 핵심 플로우: 퍼스널 컬러 진단
```
[홈/랜딩 진입]
    ↓ CTA 클릭
[세션 생성] (/api/sessions, optional auth)
    ↓
[사진 업로드 (/diagnosis)]
    ├─ 업로드 검증 실패 → 오류 메시지 → 재시도
    └─ 성공 → 분석 요청
    ↓
[분석 진행 (/analyzing)]
    ↓ AI API (/analyze)
[결과 확인 (/result)]
    ├─ 추천 요청 (세션 기반)
    ├─ 카드 다운로드/공유
    └─ 상품/콘텐츠 탐색 유도
    ↓
[완료 화면 (/completion)] → 홈 또는 상품으로 이동
```
- 관련 코드: `frontend/src/pages/UploadPage.tsx`, `AnalyzingPage.tsx`, `ResultPageV2.tsx`, `CompletionPage.tsx`
- 데이터 흐름: `useAppStore`(세션/이미지/결과) ↔ 백엔드 `/api/sessions` ↔ AI API `/analyze`

## 2. 인증 플로우
```
[회원가입]
    ↓ (CSRF 토큰 필수)
/api/auth/signup → 이메일 인증 필요
    ↓
[이메일 인증]
    ↓
[로그인 (/login)]
    ↓
마이페이지/추천 요청 시 자동 인증 확인
```
- 비밀번호 재설정: `/forgot-password` → 이메일 링크 → `/reset-password`
- `useAuthStore.checkAuth()`가 앱 진입 시 사용자 정보 확인

## 3. 상품 탐색 플로우
```
/ → /products → 필터 적용 → 상품 상세 → Shopee 링크 이동
      ├─ 저장하기 → 로컬 저장소 (Zustand)
      └─ 최근 본 상품 → 마이페이지에서 확인
```
- Admin이 `/api/admin/products`를 통해 상품을 관리 → 프론트 목록 즉시 반영

## 4. 콘텐츠 소비 플로우
```
홈 → 인기 콘텐츠 슬라이드 → /content/:slug
    ├─ HTML 컨텐츠 렌더링
    ├─ 조회수 증가
    └─ 관련 콘텐츠 (TODO: API 미구현)
```

## 5. 마이페이지 플로우 (현재 인증 비강제)
```
/mypage 접근 → 저장한 상품/최근 본 상품/퍼스널 컬러 결과 표시
    ├─ 저장 상품 삭제, 일괄 구매 링크 제공
    └─ 향후 기능(주문 내역 등)은 Placeholder
```
- 인증 미적용 상태이므로 추후 `ProtectedRoute` 적용 필요

## 6. 관리자 플로우 (개발용)
```
/admin/login → 관리자 인증 (이메일/비밀번호)
    └→ /admin/dashboard (롤 검증 통과 시)
        ├─ 상품 탭: 목록 → 생성/수정 폼 → 이미지 업로드 → 저장
        └─ 콘텐츠 탭: 목록 → 생성/수정 → 발행 상태 변경
```
- JWT 세션 + 관리자 롤이 없으면 `/admin/login`으로 리디렉션되고 감사 로그에 실패 이력이 남습니다.

## 7. 예외 흐름
| 상황 | 처리 |
| --- | --- |
| 업로드 이미지 조건 불충족 | 에러 메시지 + 재시도 안내 |
| AI 분석 실패 | 사용자에게 재시도 안내, 세션 유지 |
| 권한 오류(관리자) | 403 응답 → 관리자 로그인 또는 롤 승격 필요 |
| CSRF 토큰 누락 | Axios 인터셉터가 재요청, 실패 시 사용자에게 새로고침 안내 |

## 8. 향후 개선 사항
1. 마이페이지 접근 시 인증 강제 (로그인 후 리디렉션)
2. Related Contents API 구현 후 UI 연결
3. 관리자 롤 세분화 및 액션 로그 뷰어 구현
4. 결과 플로우 내 컨버전 트래킹 이벤트 명확화 (`frontend/src/utils/analytics.ts`)

---
User Flow 변경 시 `docs/IA_문서.md`, `docs/PRD_문서.md`와 함께 업데이트하세요.
