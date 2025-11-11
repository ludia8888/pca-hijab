# Docker 배포 가이드

PCA-HIJAB 전체 스택(프론트엔드, 백엔드, AI API, PostgreSQL)을 Docker Compose로 실행할 수 있습니다. `docker-compose.yml`은 개발/테스트용, `docker-compose.prod.yml`은 사전 빌드된 이미지를 사용하는 프로덕션용입니다.

## 1. 구성 요소
- **frontend**: Nginx 컨테이너가 Vite 빌드 산출물을 서빙 (기본 포트 3000/80)
- **backend-api**: Express + TypeScript (포트 5001)
- **ai-api**: FastAPI(ShowMeTheColor) (포트 8000)
- **db**: PostgreSQL 15-alpine (포트 5432)

## 2. 사전 준비
```bash
cp .env.docker .env               # 필요 값으로 수정
npm --prefix frontend run build   # 프론트 빌드(환경변수 반영 필수)
```
프론트엔드 빌드에는 `VITE_API_BASE_URL`, `VITE_AI_API_URL` 등이 필요합니다. `.env.production` 혹은 `.env`를 작성한 뒤 `npm run build`를 실행하거나 Docker 빌드 ARG로 값을 주입하세요.

## 3. 실행 방법
- **개발 모드 (소스 빌드)**
  ```bash
  docker-compose up --build -d
  ```
- **프로덕션 모드 (미리 빌드된 이미지)**
  ```bash
  docker-compose -f docker-compose.prod.yml up -d
  ```

## 4. 자주 사용하는 명령어
```bash
docker-compose ps                         # 컨테이너 상태
docker-compose logs -f backend-api        # 백엔드 로그 보기
docker exec -it pca-hijab-db psql -U pca_user -d pca_hijab  # DB 접속

docker-compose restart backend-api        # 특정 서비스 재시작
docker-compose down                       # 서비스 종료
docker-compose down -v                    # 볼륨까지 제거
```

## 5. .env 템플릿
```env
# PostgreSQL
POSTGRES_USER=pca_user
POSTGRES_PASSWORD=change-me
POSTGRES_DB=pca_hijab

# backend-api
PORT=5001
NODE_ENV=production
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
CLIENT_URL=https://your-frontend-domain.com
JWT_SECRET=replace-with-32-char-secret
JWT_REFRESH_SECRET=replace-with-32-char-secret
EMAIL_ENABLED=true
RESEND_API_KEY=re_xxx   # 또는 SMTP_* 변수를 사용하세요
EMAIL_FROM="PCA-HIJAB <noreply@your-domain.com>"
CORS_ORIGINS=https://your-frontend-domain.com
ADMIN_SEED_EMAIL=admin@example.com      # 선택
ADMIN_SEED_PASSWORD=super-secure-pass   # 선택
ADMIN_SEED_NAME="Seed Admin"            # 선택

# frontend 빌드 시 사용
VITE_API_BASE_URL=https://api.your-domain.com/api
VITE_AI_API_URL=https://ai.your-domain.com
```
> `SESSION_SECRET`는 현재 코드에서 사용하지 않으므로 설정하지 않아도 됩니다.

## 6. 프로덕션 체크리스트
1. **보안**
   - HTTPS 인증서(Nginx) 적용 (`frontend/nginx.conf`, `ssl/` 참고)
   - 강력한 비밀번호/키 사용 및 `.env` 비공개 유지
   - 방화벽으로 80/443/5001/8000/5432 등 필요한 포트만 오픈
2. **백업**
   - PostgreSQL 볼륨(`postgres_data`) 정기 스냅샷
   - `uploads/` 폴더(관리자 업로드 이미지) 백업
3. **모니터링**
   - `/api/health`, `/health` Ping
   - `docker stats`로 리소스 사용량 확인
   - Render/UptimeRobot 등 외부 모니터링 서비스와 병행

## 7. 트러블슈팅 팁
- **DB 연결 실패**: DB 컨테이너 상태 확인 → `docker-compose logs db` → 백엔드 재시작
- **AI API OOM**: `docker stats`로 메모리 사용량 확인 후 Compose에서 리소스 제한 조정
- **프론트가 API에 연결되지 않을 때**: 빌드 시 반영된 `VITE_API_BASE_URL` 값 확인, 변경 시 `npm run build` 다시 실행
- **이미지 빌드 실패**: `docker-compose build --no-cache` 명령으로 캐시 제거 후 재빌드

---
컨테이너 구성을 환경에 맞게 조정해도 좋습니다. Render/Vercel 배포와 혼용할 때는 `RENDER_ENV_SETUP.md`, `MONITORING_SETUP.md`, `EMAIL_SETUP.md`와 값이 일치하는지 반드시 확인하세요.
