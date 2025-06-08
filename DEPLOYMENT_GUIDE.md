# PCA-HIJAB 상세 배포 가이드

이 문서는 PCA-HIJAB 프로젝트를 처음부터 끝까지 배포하는 방법을 단계별로 설명합니다.

## 📋 목차
1. [사전 준비사항](#-사전-준비사항)
2. [GitHub 저장소 설정](#-github-저장소-설정)
3. [Frontend 배포 (Vercel)](#-frontend-배포-vercel)
4. [Backend 배포 (Render)](#-backend-배포-render)
5. [배포 후 설정](#-배포-후-설정)
6. [문제 해결](#-문제-해결)

## 🔧 사전 준비사항

### 필요한 계정
- [ ] GitHub 계정
- [ ] Vercel 계정 (GitHub로 로그인 가능)
- [ ] Render 계정 (GitHub로 로그인 가능)

### 로컬 환경 확인
```bash
# Node.js 버전 확인 (18.0.0 이상 필요)
node --version

# Git 설치 확인
git --version

# 프로젝트 빌드 테스트
cd frontend && npm run build
cd ../backend && npm run build
```

## 🐙 GitHub 저장소 설정

### 1. 새 저장소 생성
1. GitHub.com 접속
2. "New repository" 클릭
3. Repository name: `pca-hijab`
4. Public/Private 선택
5. "Create repository" 클릭

### 2. 로컬 프로젝트 연결
```bash
# 프로젝트 루트 디렉토리에서
cd /Users/sihyun/Desktop/pca-hijab

# Git 초기화 (이미 되어있다면 생략)
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "feat: Initial commit - PCA-HIJAB MVP"

# 원격 저장소 연결
git remote add origin https://github.com/YOUR_USERNAME/pca-hijab.git

# main 브랜치로 설정 및 푸시
git branch -M main
git push -u origin main
```

## 🚀 Frontend 배포 (Vercel)

### 1. Vercel 프로젝트 생성

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. "Add New..." → "Project" 클릭
3. "Import Git Repository" 선택
4. GitHub 계정 연결 (처음인 경우)
5. `pca-hijab` 저장소 선택 후 "Import" 클릭

### 2. 프로젝트 설정

**Framework Preset**: Vite 선택

**Root Directory**: `frontend` 입력

**Build and Output Settings**:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 3. 환경 변수 설정

"Environment Variables" 섹션에서 다음 변수 추가:

```
VITE_AI_API_URL=http://localhost:8000
VITE_API_BASE_URL=https://pca-hijab-backend.onrender.com/api
```

⚠️ **중요**: Backend가 먼저 배포되어 URL을 알고 있어야 합니다. 임시로 localhost를 사용하고 나중에 수정할 수 있습니다.

### 4. 배포 실행

1. "Deploy" 버튼 클릭
2. 배포 진행 상황 모니터링 (약 2-3분 소요)
3. 배포 완료 후 제공되는 URL 확인 (예: `https://pca-hijab.vercel.app`)

### 5. 도메인 설정 (선택사항)

1. Project Settings → Domains
2. 커스텀 도메인 추가 가능

## 🖥 Backend 배포 (Render)

### 1. Render 서비스 생성

1. [Render 대시보드](https://dashboard.render.com) 접속
2. "New +" → "Web Service" 클릭
3. "Build and deploy from a Git repository" 선택
4. "Connect GitHub" (처음인 경우)
5. `pca-hijab` 저장소 선택

### 2. 서비스 설정

**Name**: `pca-hijab-backend`

**Region**: Singapore (아시아 지역 선택)

**Branch**: `main`

**Root Directory**: `backend`

**Runtime**: Node

**Build Command**: 
```bash
npm install && npm run build
```

**Start Command**:
```bash
npm start
```

### 3. 환경 변수 설정

"Environment" 탭에서 다음 변수 추가:

```
NODE_ENV=production
PORT=10000
CLIENT_URL=https://pca-hijab.vercel.app
JWT_SECRET=your-super-secret-jwt-key-change-this
```

⚠️ **중요**: 
- `CLIENT_URL`은 Vercel에서 받은 Frontend URL로 설정
- `JWT_SECRET`은 반드시 강력한 랜덤 문자열로 변경

### 4. 배포 실행

1. "Create Web Service" 클릭
2. 첫 배포는 자동으로 시작됨 (약 5-10분 소요)
3. 배포 완료 후 제공되는 URL 확인 (예: `https://pca-hijab-backend.onrender.com`)

### 5. 헬스체크 확인

```bash
# Backend API 헬스체크
curl https://pca-hijab-backend.onrender.com/api/health
```

정상 응답:
```json
{
  "status": "ok",
  "service": "pca-hijab-backend",
  "timestamp": "2024-01-06T..."
}
```

## 🔄 배포 후 설정

### 1. Frontend 환경 변수 업데이트

1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
2. `VITE_API_BASE_URL` 값을 실제 Backend URL로 업데이트:
   ```
   VITE_API_BASE_URL=https://pca-hijab-backend.onrender.com/api
   ```
3. Redeploy 실행:
   - Deployments 탭 → 최신 배포 → "..." 메뉴 → "Redeploy"

### 2. CORS 확인

Backend가 Frontend URL을 허용하는지 확인:
- `backend/src/index.ts`의 CORS 설정 확인
- 필요시 `CLIENT_URL` 환경 변수 확인

### 3. 기능 테스트

1. **메인 플로우 테스트**:
   - 인스타그램 ID 입력
   - 이미지 업로드
   - AI 분석 (로컬 API 필요)
   - 추천 양식 제출

2. **API 엔드포인트 테스트**:
   ```bash
   # 세션 생성
   curl -X POST https://pca-hijab-backend.onrender.com/api/sessions \
     -H "Content-Type: application/json" \
     -d '{"instagramId": "test_user"}'
   ```

## 🐛 문제 해결

### Vercel 배포 실패

**증상**: Build 실패
```
Error: Cannot find module '@/components/...'
```

**해결방법**:
1. `tsconfig.json`의 paths 설정 확인
2. `vite.config.ts`의 alias 설정 확인
3. 모든 import 경로가 올바른지 확인

---

**증상**: 환경 변수 누락
```
ReferenceError: process is not defined
```

**해결방법**:
1. Vercel 환경 변수에 모든 `VITE_` 변수 추가
2. 변수명이 `VITE_`로 시작하는지 확인

### Render 배포 실패

**증상**: Build 실패
```
npm ERR! code ENOENT
```

**해결방법**:
1. Root Directory가 `backend`로 설정되었는지 확인
2. `package.json`이 backend 폴더에 있는지 확인

---

**증상**: 서버 시작 실패
```
Error: Cannot find module '/opt/render/project/src/dist/index.js'
```

**해결방법**:
1. Build Command에 `npm run build` 포함 확인
2. `tsconfig.json`의 outDir이 `./dist`인지 확인

### CORS 에러

**증상**: 
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**해결방법**:
1. Backend의 `CLIENT_URL` 환경 변수 확인
2. Frontend URL이 정확한지 확인 (https 포함)
3. 와일드카드 사용 시 보안 주의

## 📱 모바일 테스트

### 로컬 네트워크에서 테스트
```bash
# Frontend 개발 서버를 네트워크에 노출
cd frontend
npm run dev -- --host
```

### 실제 기기에서 테스트
1. 휴대폰과 컴퓨터가 같은 WiFi에 연결
2. 컴퓨터의 IP 주소로 접속 (예: `http://192.168.1.100:5173`)
3. 카메라 권한 허용

## 🔐 보안 체크리스트

- [ ] 모든 API 키가 환경 변수로 관리되는가?
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] JWT_SECRET이 강력한 값으로 설정되었는가?
- [ ] HTTPS가 적용되었는가? (Vercel/Render는 자동 적용)
- [ ] CORS가 적절히 설정되었는가?

## 🚀 자동 배포 설정

### GitHub Actions (선택사항)
`.github/workflows/deploy.yml` 파일 생성:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Trigger Vercel Deployment
      run: |
        curl -X POST ${{ secrets.VERCEL_DEPLOY_HOOK }}
```

### 배포 훅 설정
1. Vercel: Project Settings → Git → Deploy Hooks
2. Render: 자동으로 GitHub 푸시 시 배포

## 📞 지원

배포 중 문제가 발생하면:

1. **Vercel 지원**: https://vercel.com/support
2. **Render 지원**: https://render.com/docs
3. **프로젝트 이슈**: GitHub Issues 활용

---

마지막 업데이트: 2024년 1월 6일