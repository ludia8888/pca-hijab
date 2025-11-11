# 🚀 Render Environment Variables Setup

Render 백엔드 서비스(`pca-hijab-backend`)에 아래 환경 변수를 등록해야 프로덕션 기능이 정상 동작합니다. 예시 값은 반드시 교체하세요.

## 필수 변수
```bash
# Server
NODE_ENV=production
PORT=5001
CLIENT_URL=https://pca-hijab.vercel.app,https://noorai-ashy.vercel.app  # 여러 도메인일 경우 콤마로 구분

# Security
JWT_SECRET=<32자 이상 랜덤 문자열>
JWT_REFRESH_SECRET=<32자 이상 랜덤 문자열>

# Database
DATABASE_URL=postgresql://user:password@host:5432/pca_hijab

# Email (Resend or SMTP 중 택1)
EMAIL_ENABLED=true
RESEND_API_KEY=<re_xxx 값>              # Resend 사용 시
EMAIL_FROM="PCA-HIJAB <noreply@domain>"
# SMTP 사용 시: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, EMAIL_FROM_NAME

# 기타
ENABLE_TOKEN_CLEANUP=false    # PostgreSQL 사용 + 스케줄링 필요 시 true
USE_AUTH_STUB=false           # 개발 편의용 stub는 프로덕션에서 false 유지
ADMIN_SEED_EMAIL=            # (선택) 자동 부팅용 관리자 계정
ADMIN_SEED_PASSWORD=         # (선택) 위 계정 비밀번호
ADMIN_SEED_NAME="Seed Admin" # (선택)
```
> `CORS_ORIGINS`는 코드 내 화이트리스트가 정의되어 있으므로 필요 시 추가할 수 있습니다. `SESSION_SECRET`는 사용하지 않습니다.

## 입력 방법
1. [Render Dashboard](https://dashboard.render.com) → 서비스 선택 → **Environment** 탭 이동  
2. **Add Environment Variable** 클릭 후 Key/Value 입력 (여러 도메인은 콤마 구분)  
3. 저장 시 자동으로 재배포가 진행됩니다. 재배포를 원치 않으면 **Add Secret File** 기능을 고려하세요.

## 안전한 시크릿 생성
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```
`ADMIN_SEED_EMAIL/PASSWORD`를 지정하면 배포 시 자동으로 해당 이메일 계정이 생성(또는 admin 롤로 승격)되어 초기 로그인에 활용할 수 있습니다.

## 설정 확인 체크리스트
1. `https://pca-hijab-backend-unified.onrender.com/api/health` 응답 확인 (`status: ok`)
2. 회원가입/인증/로그인 플로우 테스트  
3. 비밀번호 재설정 이메일 수신 확인  
4. CORS 오류 여부(브라우저 콘솔) 확인

## 참고 & 주의 사항
- 스크립트 `scripts/setup_render_env.py` / `scripts/setup-render-env.sh`는 샘플 값을 주입하므로 실서비스 전 반드시 바꿔 주세요.
- `.env` 파일은 Git에 절대 커밋하지 않습니다. Render 환경 탭에서 직접 수동 입력 또는 Secret File 사용을 권장합니다.
- Render의 Free 플랜은 슬립 상태가 발생하므로 `MONITORING_SETUP.md` 기반 외부 ping을 병행하세요.

---
Last updated: 2025-02-16
