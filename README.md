# 히잡 퍼스널 컬러 AI 진단 서비스

AI 기반 퍼스널 컬러 진단을 통해 사용자에게 최적화된 히잡 색상을 추천하는 MVP 서비스입니다.

## 🚀 프로젝트 개요

- **목표**: AI 퍼스널 컬러 진단을 통한 히잡 색상 추천
- **타겟**: 18-35세 히잡 착용 여성 (인스타그램 사용자)
- **핵심 가치**: 개인화된 색상 추천으로 구매 결정 지원

## 🛠 기술 스택

### Frontend
- React 18 + TypeScript
- Vite (빌드 도구)
- Tailwind CSS (스타일링)
- Zustand (상태관리)
- React Query (서버 상태)
- React Router v6 (라우팅)

### Backend (예정)
- Express.js 또는 FastAPI
- PostgreSQL
- AWS S3 또는 Cloudinary

### AI API
- ShowMeTheColor (기존 퍼스널 컬러 진단 엔진)
- FastAPI 기반
- Python + OpenCV + dlib

## 📱 주요 기능

1. **인스타그램 ID 수집**: DM 발송을 위한 사용자 식별
2. **AI 진단 연동**: 얼굴 사진 분석을 통한 퍼스널 컬러 진단
3. **히잡 추천 시스템**: 진단 결과 기반 맞춤 추천
4. **모바일 최적화**: 모든 기능이 모바일에서 원활하게 동작

## 🚦 개발 현황

### ✅ Sprint 1 완료 (2024.06.05)
- [x] 프로젝트 초기 설정
- [x] 디자인 시스템 구축
- [x] 기본 UI 컴포넌트
- [x] 인트로 페이지
- [x] 이미지 업로드 기능

### 🚧 Sprint 2 진행 예정
- [ ] AI API 연동
- [ ] 분석 진행 화면
- [ ] 결과 표시 페이지

## 🏃‍♂️ 시작하기

### 사전 요구사항
- Node.js 18+
- Python 3.9+ (AI API용)

### Frontend 설치 및 실행

```bash
# 프로젝트 클론
git clone [repository-url]
cd pca-hijab

# Frontend 의존성 설치
cd frontend
npm install

# 개발 서버 실행
npm run dev
```

### AI API 실행 (별도 터미널)

```bash
# ShowMeTheColor 디렉토리로 이동
cd ShowMeTheColor

# Python 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# API 서버 실행
cd src
python api.py
```

## 📂 프로젝트 구조

```
pca-hijab/
├── frontend/               # React 애플리케이션
│   ├── src/
│   │   ├── components/    # UI 컴포넌트
│   │   ├── pages/        # 페이지 컴포넌트
│   │   ├── store/        # 상태 관리
│   │   ├── services/     # API 통신
│   │   └── utils/        # 유틸리티
│   └── public/
├── backend/               # 백엔드 API (예정)
├── ShowMeTheColor/        # AI 진단 엔진
└── docs/                 # 프로젝트 문서
```

## 🧪 개발 명령어

```bash
# Frontend
npm run dev        # 개발 서버 실행
npm run build      # 프로덕션 빌드
npm run lint       # ESLint 실행
npm run typecheck  # TypeScript 타입 체크

# AI API
python api.py      # API 서버 실행
python main.py --image [path]  # 단일 이미지 테스트
```

## 📱 화면 구성

1. **인트로 페이지** (`/`): 인스타그램 ID 입력
2. **업로드 페이지** (`/upload`): 사진 업로드
3. **분석 페이지** (`/analyzing`): AI 분석 진행
4. **결과 페이지** (`/result`): 퍼스널 컬러 결과
5. **추천 페이지** (`/recommendation`): 히잡 추천 입력
6. **완료 페이지** (`/completion`): 서비스 완료

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 비공개 프로젝트입니다.

## 📞 문의

프로젝트 관련 문의사항은 이슈를 통해 남겨주세요.