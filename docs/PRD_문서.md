# PCA-HIJAB Product Requirements Document (PRD)

**버전**: 3.1  
**최종 업데이트**: 2025-02-16  
**목적**: 현재 구현된 기능을 기반으로 한 제품 요구사항 정리 (디자인/개발 공통 레퍼런스)

## 1. 제품 개요
- **서비스 목표**: 얼굴 사진으로 계절 퍼스널 컬러를 진단하고, 어울리는 히잡/뷰티 제품과 콘텐츠를 제공하며, 관리자 큐레이션을 통해 추천을 완성한다.
- **대상 사용자**: 18~35세, 히잡 착용자, Instagram 적극 활용, 모바일 사용 비중 높음.
- **핵심 가치**: 빠른 AI 분석(약 10초 내), 시각적으로 매력적인 결과 카드, 쇼핑/콘텐츠 경험까지 연계.

## 2. 사용자 시나리오
1. **새 사용자**: 홈 → 랜딩에서 Instagram ID 입력 → 사진 업로드 → 분석 결과 확인 → 추천/콘텐츠 탐색 → 공유
2. **재방문 사용자**: 마이페이지에서 저장/최근 상품 확인 → 분석 재진행 또는 상품 구매
3. **관리자**: 상품/콘텐츠 CRUD → 추천 상태 업데이트 → 이미지 업로드

## 3. 주요 기능 요구사항
### 3.1 퍼스널 컬러 분석
- 업로드 파일: JPG/PNG/HEIC (최대 10MB), 얼굴 인식 실패 시 오류 안내
- 분석 단계: 5단계 진행 UI, 캐릭터/말풍선 안내 (이미지 추가 예정)
- 결과: 퍼스널 컬러(봄/여름/가을/겨울) + 추천 색상 팔레트 + Confidence
- 결과 카드: 1080x1350 이미지 생성, 다운로드/공유 제공 (`generateResultCard`)

### 3.2 추천/세션 관리
- 세션: Instagram ID 또는 익명, `/api/sessions`로 생성 (optional auth)
- 추천 요청: `/api/recommendations`, 세션 소유권 검증 → 상태(`pending/processing/completed`) 업데이트 가능
- 관리자: `/api/admin/recommendations/:id/status`로 상태 변경

### 3.3 상품 카탈로그
- 카테고리: hijab, lens, lip, eyeshadow (코드상 tint 예약)
- 필터: 카테고리/퍼스널 컬러 (쿼리 파라미터)
- 상세 정보: 이미지, 설명, 가격, Shopee 링크, 추천 색상 태그
- 저장/최근 보기: 로컬 저장소 기반 (`useAppStore`)

### 3.4 콘텐츠
- 카테고리: beauty_tips, hijab_styling, color_guide, trend, tutorial
- 인기/최신/카테고리별 목록, slug 기반 상세 페이지
- HTML 콘텐츠 렌더링 및 뷰 카운트 증가
- 관련 콘텐츠 API는 미구현(TODO)

### 3.5 인증 & 이메일
- 회원가입: 이메일, 비밀번호(강도 검사), 이름 → 이메일 인증 필요
- 로그인: JWT access/refresh, HttpOnly 쿠키
- 비밀번호 재설정: 이메일 발송 → 토큰 검증 → 새 비밀번호 설정
- 이메일 발송: Resend API / SMTP (환경 변수 기반)

### 3.6 마이페이지
- 퍼스널 컬러 결과, 저장/최근 본 상품 섹션
- 현재 인증 우회 상태(향후 보호 라우트 적용 예정)

### 3.7 관리자 기능
- 상품/콘텐츠 CRUD, 이미지 업로드 (`/api/admin/upload/image(s)`)
- JWT 기반 관리자 인증 필요 (`/admin/login`), 프론트에서 `useAuthStore`로 세션 유지 및 롤 확인

## 4. 비기능 요구사항
- **성능**: 주요 화면 LCP 3초 이내, 분석 API 응답 10초 이내 유지
- **보안**: Helmet CSP, CSRF, JWT, Rate limiting 활성화. 관리자 롤·세션 탈취 모니터링 필요
- **프라이버시**: 업로드 이미지는 분석 후 즉시 삭제 (스토리지 보관 없음)
- **가용성**: Render Free 플랜은 슬립되므로 `MONITORING_SETUP.md` 기반 keep-alive 적용 권장

## 5. 데이터 계약
- `backend/src/types/index.ts` 참고. 주요 엔티티:
  - `Session`: id, instagramId?, analysisResult?, timestamps
  - `Recommendation`: sessionId, userPreferences, status
  - `Product`: category, personalColors[], isActive, price, images
  - `Content`: slug, category, status(`draft/published`), viewCount
  - `User`: email, passwordHash, verification/reset 토큰

## 6. 테스트 & 검증
- 프론트엔드: Vitest + Testing Library (`frontend/src/test/*`)
- 백엔드: 현재 수동 테스트 위주 (자동화 테스트 TODO)
- E2E: Cypress/Happydom 기반 준비 필요 (현재 미구현)

## 7. 알려진 갭 & 개선 계획
1. 관리자 인증 흐름 안정화 (이메일/비밀번호 로그인 + 롤 기반 접근 제어)
2. `/api/contents/related/:id` 구현 및 UI 노출
3. 마이페이지를 인증 사용자 전용으로 전환, 서버 데이터 연동
4. 결과 화면의 캐릭터/말풍선 이미지 실제 자산 추가
5. 백엔드 테스트 케이스 및 CI 구축
6. TanStack Query를 활용한 API 응답 캐싱/상태 관리 개선

---
PRD는 코드/디자인 변경 시 함께 업데이트해야 합니다. 추가 요구사항이 생기면 본 문서와 `docs/IA_문서.md`, `docs/UserFlow_문서.md`를 동기화하세요.
