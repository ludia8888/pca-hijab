# PCA-HIJAB Backend API

## 개요
히잡 퍼스널 컬러 추천 서비스의 백엔드 API입니다. 사용자의 Instagram ID와 추천 요청 데이터를 저장합니다.

## 주요 기능
- 세션 생성 및 Instagram ID 저장
- 사용자 선호도 및 퍼스널 컬러 결과 저장
- 추천 상태 관리 (pending, processing, completed)

## API 엔드포인트

### 세션 관리
- `POST /api/sessions` - 새 세션 생성
- `GET /api/sessions/:sessionId` - 세션 정보 조회

### 추천 관리
- `POST /api/recommendations` - 추천 요청 생성
- `GET /api/recommendations/:recommendationId` - 추천 상태 조회
- `GET /api/recommendations` - 모든 추천 조회 (관리자용)
- `PATCH /api/recommendations/:recommendationId/status` - 추천 상태 업데이트

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm start
```

## 환경 변수
`.env.example` 파일을 참고하여 `.env` 파일을 생성하세요.

## 데이터 저장
현재는 In-memory 저장소를 사용합니다. 서버 재시작 시 데이터가 초기화됩니다.
프로덕션에서는 PostgreSQL로 마이그레이션 예정입니다.