# 📧 Production Email Setup Guide

PCA-HIJAB는 회원가입 및 비밀번호 재설정 플로우에서 이메일 발송이 필수입니다. 기본 설정은 Resend API를 사용하며, 필요 시 SMTP로 대체할 수 있습니다.

## 1. Resend 설정 절차
1. [Resend](https://resend.com) 가입 후 이메일 인증
2. Dashboard → **API Keys** → `PCA-HIJAB Production` 등 이름으로 API Key 생성 (`re_`로 시작)
3. (권장) Dashboard → **Domains**에서 발신 도메인 추가 → DNS에 SPF/DKIM 레코드 등록 → 검증 완료 시 `EMAIL_FROM`을 해당 도메인으로 변경

## 2. Render 환경 변수 등록
```bash
EMAIL_ENABLED=true
RESEND_API_KEY=re_xxxxxxxxxxxxx      # Resend API Key (반드시 교체)
EMAIL_FROM="PCA-HIJAB <noreply@your-domain.com>"
EMAIL_FROM_NAME=PCA-HIJAB
CLIENT_URL=https://pca-hijab.vercel.app
# SMTP 사용 시 대체 변수
# SMTP_HOST=...
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=...
# SMTP_PASS=...
```
- 보안 관련 항목(`JWT_SECRET`, `JWT_REFRESH_SECRET` 등)은 `RENDER_ENV_SETUP.md`를 참고해 함께 설정하세요.
- 스크립트 `scripts/setup_render_env.py`는 샘플 키를 넣으므로 프로덕션에서는 반드시 교체해야 합니다.

## 3. 테스트 시나리오
1. `https://pca-hijab.vercel.app/signup`에서 테스트 계정 생성 → 인증 메일 수신 → 링크 클릭 후 로그인
2. `https://pca-hijab.vercel.app/forgot-password`에서 이메일 입력 → 재설정 메일 수신 → 새 비밀번호 설정
3. Render → Logs(`backend-api`)에서 오류 여부 확인

## 4. 모니터링 포인트
- Resend Dashboard → **Emails/Activity**에서 발송 성공·실패 확인
- Bounce/Complaint 발생 시 도메인 인증(SPF/DKIM)과 발신 주소를 점검
- 주기적으로 테스트 계정으로 실제 메일 수신 여부를 확인

## 5. 문제 해결 체크리스트
| 증상 | 점검 항목 |
| --- | --- |
| 이메일이 전송되지 않음 | `RESEND_API_KEY` 오타, Render 로그(네트워크/인증 오류), Resend 일일 한도(100통) 초과 |
| 스팸함으로 이동 | 발신 도메인 인증 여부, `EMAIL_FROM`이 실제 소유 도메인인지, 콘텐츠 내 스팸성 표현 제거 |
| 링크 클릭 시 404 | `CLIENT_URL`이 올바른지, 프론트 라우트(`VerifyEmailPage.tsx`, `ResetPasswordPage.tsx`)가 배포되어 있는지 확인 |

## 6. 무료 티어 & 비용
- Resend Free: 일 100통 / 월 3,000통 (신용카드 불필요)
- 초과 사용 시 유료 플랜 업그레이드 또는 SendGrid/Mailgun/SES 등 다른 SMTP 제공업체 고려

## 7. 대체 제공업체 예시
- **SendGrid**: `@sendgrid/mail` 설치 후 `SENDGRID_API_KEY` 설정
- **Mailgun / AWS SES / Gmail SMTP** 등은 SMTP 변수(`SMTP_HOST` 등)를 사용

## 8. 운영 수칙
- API Key, 비밀번호 등 비밀 값은 절대 Git에 커밋하지 않습니다.
- 이메일 콘텐츠 수정 시 `backend/src/services/emailService.ts` 내 템플릿과 URL도 함께 업데이트합니다.
- 정기적으로 테스트 계정으로 인증/재설정 플로우를 검증해 레그레션을 방지합니다.

---
마지막 업데이트: 2025-02-16
