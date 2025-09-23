# Docker 배포 가이드

## 전체 스택 Docker 구성

PCA-HIJAB 프로젝트의 모든 서비스를 Docker로 배포할 수 있습니다.

### 서비스 구성
- **PostgreSQL**: 데이터베이스 (Port 5432)
- **Backend API**: Express.js 백엔드 (Port 5001)
- **AI API**: FastAPI 인공지능 서비스 (Port 8000)
- **Frontend**: React 프론트엔드 (Port 3000/80)

### 시작하기

1. **환경 변수 설정**
   ```bash
   cp .env.docker .env
   # .env 파일을 열어서 필요한 값들을 수정하세요
   ```

2. **개발 환경에서 실행**
   ```bash
   docker-compose up -d
   ```

3. **프로덕션 환경에서 실행**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### 유용한 명령어

**서비스 상태 확인:**
```bash
docker-compose ps
```

**로그 확인:**
```bash
docker-compose logs -f backend-api
docker-compose logs -f ai-api
docker-compose logs -f db
```

**데이터베이스 접속:**
```bash
docker exec -it pca-hijab-db psql -U pca_user -d pca_hijab
```

**서비스 재시작:**
```bash
docker-compose restart backend-api
```

**전체 종료:**
```bash
docker-compose down
```

**데이터 포함 전체 삭제:**
```bash
docker-compose down -v
```

### 환경 변수 설정

`.env.docker` 파일을 참고하여 다음 환경 변수를 설정하세요:

```env
# 데이터베이스
POSTGRES_USER=pca_user
POSTGRES_PASSWORD=your-secure-password-here
POSTGRES_DB=pca_hijab

# 백엔드
ADMIN_API_KEY=your-admin-api-key
SESSION_SECRET=your-session-secret
CORS_ORIGINS=https://your-domain.com

# 프론트엔드 (프로덕션)
VITE_BACKEND_URL=https://api.your-domain.com
VITE_AI_API_URL=https://ai.your-domain.com
```

### 프로덕션 배포 시 주의사항

1. **보안**
   - 강력한 비밀번호 사용
   - HTTPS 인증서 설정 (nginx/ssl 폴더)
   - 방화벽 규칙 설정

2. **백업**
   - PostgreSQL 데이터 정기 백업
   - Docker 볼륨 백업

3. **모니터링**
   - 헬스체크 엔드포인트 모니터링
   - 로그 수집 및 분석

### 트러블슈팅

**데이터베이스 연결 실패:**
```bash
# 데이터베이스가 준비될 때까지 기다리기
docker-compose logs db
# 백엔드 재시작
docker-compose restart backend-api
```

**AI API 메모리 부족:**
```bash
# Docker 리소스 제한 확인
docker stats
# 필요시 docker-compose.yml에서 리소스 제한 추가
```

**이미지 빌드 실패:**
```bash
# 캐시 없이 다시 빌드
docker-compose build --no-cache
```