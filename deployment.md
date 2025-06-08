# PCA-HIJAB 배포 가이드

## 🚀 배포 아키텍처

- **Frontend**: Vercel
- **Backend API**: Render (Free tier)
- **AI API**: 로컬 환경에서만 실행 (ShowMeTheColor)

## 📋 배포 준비사항

### 1. Frontend (Vercel)

1. **GitHub 저장소 연결**
   - Vercel 대시보드에서 "New Project" 클릭
   - GitHub 저장소 선택
   - Framework Preset: Vite 선택
   - Root Directory: `frontend` 설정

2. **환경 변수 설정**
   ```
   VITE_AI_API_URL=http://localhost:8000
   VITE_API_BASE_URL=https://pca-hijab-backend.onrender.com/api
   ```

3. **빌드 설정**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 2. Backend API (Render)

1. **GitHub 저장소 연결**
   - Render 대시보드에서 "New Web Service" 클릭
   - GitHub 저장소 연결
   - Root Directory: `backend` 설정

2. **환경 변수 설정**
   ```
   NODE_ENV=production
   PORT=10000
   CLIENT_URL=https://pca-hijab.vercel.app
   JWT_SECRET=[생성된 시크릿 키]
   ```

3. **빌드 및 시작 명령어**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

### 3. AI API (ShowMeTheColor)

현재 AI API는 로컬에서만 실행됩니다. 프로덕션 배포를 위해서는:

1. **옵션 1**: Google Cloud Run 또는 AWS ECS 사용
2. **옵션 2**: Heroku Python 지원 사용
3. **옵션 3**: 별도의 VPS에 Docker로 배포

## 🔧 배포 명령어

### Frontend 배포
```bash
cd frontend
npm run build
vercel --prod
```

### Backend 배포
```bash
cd backend
git add .
git commit -m "Deploy backend"
git push origin main
# Render가 자동으로 배포
```

## 🔍 배포 후 확인사항

1. **CORS 설정 확인**
   - Backend에서 Frontend URL 허용
   - AI API에서 Frontend URL 허용

2. **API 엔드포인트 테스트**
   - `/api/health` - 헬스체크
   - `/api/sessions` - 세션 생성
   - `/api/recommendations` - 추천 요청

3. **이미지 업로드 테스트**
   - 파일 크기 제한 확인
   - HEIC 변환 기능 확인

## 🚨 문제 해결

### Frontend 빌드 실패
- TypeScript 에러 확인: `npm run typecheck`
- 환경 변수 누락 확인
- Node 버전 확인 (18+)

### Backend 시작 실패
- 포트 충돌 확인
- 환경 변수 설정 확인
- 빌드 아티팩트 확인: `dist/` 폴더

### CORS 에러
- Backend CORS 설정에서 Frontend URL 추가
- 와일드카드(*) 사용 지양

## 📊 모니터링

### Frontend (Vercel)
- Vercel Analytics 활용
- Web Vitals 모니터링
- 에러 추적

### Backend (Render)
- Render 대시보드 로그 확인
- 메모리/CPU 사용량 모니터링
- 응답 시간 추적

## 🔐 보안 체크리스트

- [ ] 환경 변수에 민감한 정보 포함 여부 확인
- [ ] API 키 노출 방지
- [ ] HTTPS 적용 확인
- [ ] Rate limiting 설정
- [ ] 입력 값 검증

## 📈 성능 최적화

### Frontend
- 이미지 lazy loading
- 코드 스플리팅
- CSS/JS 압축
- CDN 활용

### Backend
- 응답 압축 (gzip)
- 캐싱 전략
- 데이터베이스 인덱싱
- 연결 풀링

## 🔄 업데이트 프로세스

1. 개발 환경에서 테스트
2. 스테이징 환경 배포 (선택사항)
3. 프로덕션 배포
4. 배포 후 모니터링

## 📞 지원 연락처

배포 관련 문제 발생 시:
- Email: support@hijabcolor.com
- GitHub Issues: [저장소 이슈 페이지]