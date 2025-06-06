# 🧕 PCA-HIJAB: AI 기반 퍼스널 컬러 진단 및 히잡 추천 서비스

AI를 활용하여 사용자의 퍼스널 컬러를 진단하고, 개인에게 맞는 히잡 색상을 추천하는 모바일 최적화 웹 서비스입니다.

## 🎯 프로젝트 개요

### 주요 기능
- **AI 퍼스널 컬러 진단**: 사용자의 얼굴 사진을 분석하여 봄/여름/가을/겨울 타입 진단
- **맞춤 색상 추천**: 진단 결과에 따른 어울리는 색상과 피해야 할 색상 제시
- **히잡 추천 시스템**: 개인 선호도를 반영한 맞춤형 히잡 추천
- **모바일 최적화**: 모바일 환경에 최적화된 UI/UX

### 기술 스택
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **State Management**: Zustand with persist
- **Backend Integration**: Python FastAPI (AI 분석 서버)
- **Image Processing**: Browser Canvas API, HEIC 지원
- **Mobile Features**: PWA ready, Camera API integration

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn
- Python 3.8+ (백엔드 서버용)

### 프론트엔드 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/yourusername/pca-hijab.git
cd pca-hijab

# 프론트엔드 디렉토리로 이동
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```

### 백엔드 설치 및 실행

```bash
# 백엔드 디렉토리로 이동
cd ShowMeTheColor

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 서버 실행 (http://localhost:8000)
cd src
python api.py
```

## 📱 주요 화면 및 플로우

### 1. 인트로 화면 (`/`)
- 서비스 소개 및 인스타그램 ID 입력
- 개인정보 수집 동의

### 2. 사진 업로드 (`/upload`)
- 갤러리 선택 또는 카메라 촬영
- HEIC 포맷 지원
- 이미지 자동 압축

### 3. AI 분석 (`/analyzing`)
- 실시간 진행 상태 표시
- 5단계 분석 애니메이션

### 4. 결과 화면 (`/result`)
- 퍼스널 컬러 타입 (봄/여름/가을/겨울)
- 추천 색상 팔레트 (4x1 그리드)
- 피해야 할 색상
- 결과 공유 기능

### 5. 히잡 추천 (`/recommendation`)
- 선호 스타일 선택
- 가격대 설정
- 소재 및 착용 상황 선택
- 추가 요청사항

### 6. 완료 화면 (`/completion`)
- DM 발송 안내
- 결과 저장 및 공유

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# TypeScript 타입 체크
npm run typecheck

# ESLint 실행
npm run lint

# 코드 포맷팅
npm run format

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 🏗 프로젝트 구조

```
pca-hijab/
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/      # 재사용 컴포넌트
│   │   │   ├── ui/         # 기본 UI 컴포넌트
│   │   │   ├── layout/     # 레이아웃 컴포넌트
│   │   │   └── forms/      # 폼 관련 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── services/       # API 서비스
│   │   ├── store/          # Zustand 전역 상태
│   │   ├── utils/          # 유틸리티 함수
│   │   └── types/          # TypeScript 타입 정의
│   └── public/             # 정적 파일
│
├── ShowMeTheColor/         # Python 백엔드
│   ├── src/
│   │   ├── api.py         # FastAPI 서버
│   │   └── personal_color_analysis/  # AI 분석 모듈
│   └── res/               # 리소스 파일
│
└── docs/                   # 프로젝트 문서
```

## 🔒 환경 변수 설정

### Frontend (.env)
```env
# API 설정
VITE_API_BASE_URL=http://localhost:8000

# 이미지 설정
VITE_IMAGE_COMPRESSION_QUALITY=0.8
VITE_MAX_IMAGE_SIZE=5242880  # 5MB

# 개발 설정
VITE_ENABLE_MOCK=false
```

### Backend
백엔드 환경 변수는 `ShowMeTheColor/README.md`를 참조하세요.

## 📊 API 엔드포인트

### 퍼스널 컬러 분석
- `POST /api/analyze` - 이미지 업로드 및 분석
- `GET /api/health` - 서버 상태 확인

### 추천 시스템
- `POST /api/recommendations` - 히잡 추천 요청
- `GET /api/recommendations/{id}/status` - 추천 상태 조회

## 🚦 개발 현황

### ✅ 완료된 기능
- [x] 프로젝트 초기 설정 및 디자인 시스템
- [x] 전체 페이지 플로우 구현
- [x] AI API 연동 및 분석 기능
- [x] 모바일 카메라 및 HEIC 지원
- [x] 결과 공유 및 저장 기능
- [x] 맞춤 추천 입력 폼

### 🚧 개발 예정

#### 1. 추천 시스템 백엔드 구현
현재 추천 요청은 Mock 응답만 반환합니다. 실제 구현 필요:
- [ ] PostgreSQL 데이터베이스 설계 (사용자, 분석 결과, 추천 내역)
- [ ] 추천 요청 저장 및 관리 API
- [ ] 관리자용 대시보드 (추천 요청 확인 및 DM 발송 관리)
- [ ] 히잡 제품 데이터베이스 구축

#### 2. 결과 이미지 생성 기능
"결과 이미지 저장하기" 버튼의 실제 구현:
- [ ] Canvas API를 이용한 결과 카드 생성
- [ ] 사용자 사진 + 퍼스널 컬러 결과 + 브랜딩 요소 합성
- [ ] PNG 파일로 다운로드 제공
- [ ] SNS 공유용 메타데이터 포함

#### 3. PWA (Progressive Web App) 설정
모바일 앱처럼 동작하도록:
- [ ] Service Worker 구현
- [ ] 오프라인 시 기본 페이지 제공
- [ ] 홈 화면 추가 기능
- [ ] Push 알림 (DM 발송 완료 알림)

#### 4. 분석 결과 캐싱
동일한 이미지 재분석 방지:
- [ ] IndexedDB를 이용한 로컬 캐싱
- [ ] 이미지 해시 기반 중복 체크
- [ ] Redis를 이용한 서버 사이드 캐싱
- [ ] 캐시 만료 정책 구현

#### 5. A/B 테스트 인프라
사용자 행동 분석 및 최적화:
- [ ] Google Analytics 4 또는 Mixpanel 연동
- [ ] 사용자 행동 이벤트 트래킹
- [ ] Feature Flag 시스템 구현
- [ ] 전환율 측정 (완료율, 추천 요청률)

## 🧪 테스트

```bash
# 단위 테스트 실행
npm run test

# 테스트 커버리지
npm run test:coverage

# E2E 테스트
npm run test:e2e
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 커밋 메시지 컨벤션
- `feat:` 새로운 기능 추가
- `fix:` 버그 수정
- `docs:` 문서 수정
- `style:` 코드 포맷팅, 세미콜론 누락 등
- `refactor:` 코드 리팩토링
- `test:` 테스트 추가
- `chore:` 빌드 업무 수정, 패키지 매니저 수정 등

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

- 이메일: support@hijabcolor.com
- 이슈 트래커: [GitHub Issues](https://github.com/yourusername/pca-hijab/issues)

## 🙏 감사의 말

- AI 퍼스널 컬러 분석 엔진 제공: ShowMeTheColor 팀
- UI/UX 디자인 영감: 현대적인 모바일 디자인 트렌드
- 오픈소스 커뮤니티의 훌륭한 라이브러리들