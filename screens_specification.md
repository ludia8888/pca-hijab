# 화면별 상세 기획서

> **연관 문서**: [메인 기획문서](./main-prd.md) | [디자인 시스템](./design-system.md) | [컴포넌트 구조](./component-structure.md)

---

## 📱 전체 화면 구성

```
1. [인트로 + 인스타 ID 입력] → /
2. [사진 업로드] → /upload  
3. [분석 진행중] → /analyzing
4. [진단 결과] → /result
5. [히잡 추천 CTA] → /result#recommendation
6. [추천 입력폼] → /recommendation
7. [완료 안내] → /completion
```

---

## 1️⃣ 인트로 & 인스타그램 ID 입력 화면 (`/`)

### 🎯 화면 목적
- 서비스 가치 전달 및 사용자 신뢰 구축
- 추천 결과 전달을 위한 인스타그램 ID 수집
- 서비스 플로우에 대한 명확한 안내

### 📐 레이아웃 구성

**상단 헤더**
- 로고 + 서비스명 "히잡 컬러 진단 AI"
- 높이: 60px (모바일), 80px (데스크톱)

**메인 콘텐츠**
- 헤드라인: "AI가 당신 얼굴에 어울리는 히잡 색을 찾아드립니다"
- 서브 설명: 3-4줄 분량의 서비스 설명
- 예시 이미지 슬라이더: Before/After 사례 2-3장
- 인스타그램 ID 입력 필드
- 메인 CTA 버튼: "진단 시작하기"

**하단 안내**
- 개인정보 보호 관련 안내 메시지
- 높이: 80px

### 🔧 기능 요구사항

**입력 검증**
- 인스타그램 ID 형식 검증 (영문, 숫자, ., _ 허용)
- 실시간 유효성 검사 및 에러 메시지 표시
- 빈 값 또는 잘못된 형식 시 버튼 비활성화

**인터랙션**
- 입력 필드 포커스 시 테두리 색상 변경
- 버튼 호버/터치 시 상승 효과
- 예시 이미지 자동 슬라이더 (3초 간격)

**상태 관리**
- `instagramId`: 입력된 인스타그램 ID
- `isValid`: 입력값 유효성 상태
- `isLoading`: 다음 단계 진행 중 상태

---

## 2️⃣ 사진 업로드 화면 (`/upload`)

### 🎯 화면 목적
- 퍼스널 컬러 분석을 위한 사용자 얼굴 사진 수집
- 정확한 분석을 위한 촬영 가이드 제공
- 사용자 불안감 해소 및 개인정보 보호 안내

### 📐 레이아웃 구성

**상단 네비게이션**
- 뒤로가기 버튼
- 진행 단계 표시: "2/7 단계"

**메인 콘텐츠**
- 제목: "얼굴 사진을 업로드해주세요"
- 촬영 가이드 리스트 (4-5개 항목)
- 촬영 예시 이미지 (Good/Bad 비교)
- 파일 업로드 영역 (드래그 앤 드롭 지원)
- 업로드 버튼: "갤러리에서 선택" / "카메라로 촬영"

**하단 CTA**
- "분석 시작하기" 버튼 (사진 업로드 후 활성화)

### 🔧 기능 요구사항

**파일 업로드**
- 지원 형식: JPG, PNG, HEIC
- 최대 파일 크기: 10MB
- 자동 이미지 압축 (1024x1024 이하로 리사이즈)
- 업로드 진행률 표시

**이미지 검증**
- 얼굴 검출 API를 통한 유효성 확인
- 얼굴이 검출되지 않을 시 재업로드 요청
- 이미지 품질 검사 (너무 어둡거나 블러 체크)

**상태 관리**
- `selectedImage`: 선택된 이미지 파일
- `imagePreview`: 미리보기 URL
- `isUploading`: 업로드 진행 상태
- `uploadProgress`: 업로드 진행률
- `validationStatus`: 이미지 검증 결과

---

## 3️⃣ 분석 진행중 화면 (`/analyzing`)

### 🎯 화면 목적
- 사용자의 이탈 방지를 위한 몰입감 있는 대기 화면
- AI 분석 과정의 투명성 제공
- 브랜드 신뢰도 향상을 위한 전문성 어필

### 📐 레이아웃 구성

**상단**
- 진행 단계 표시: "3/7 단계"

**메인 콘텐츠**
- 중앙 애니메이션 영역 (로딩 스피너 + 아이콘)
- 현재 분석 단계 설명
- 진행률 바 (0-100%)
- 퍼스널 컬러 관련 교육 콘텐츠

### 🔧 기능 요구사항

**애니메이션 시퀀스** (각 5초씩)
1. "피부의 노란기를 분석 중입니다..." (20%)
2. "당신에게 어울리는 채도를 계산 중입니다..." (45%)
3. "명도 대비를 통해 전체 톤을 분석하고 있어요..." (70%)
4. "최적의 컬러 팔레트를 생성하고 있어요..." (90%)
5. "곧 결과를 확인할 수 있어요!" (100%)

**상태 관리**
- `currentStep`: 현재 분석 단계 (0-4)
- `progress`: 진행률 (0-100)
- `analysisResult`: AI API에서 받은 분석 결과

**API 연동**
- 기존 퍼스널 컬러 분석 API 호출
- 결과 수신 시 자동으로 다음 화면(`/result`)으로 이동
- 에러 발생 시 에러 화면 표시 및 재시도 옵션 제공

---

## 4️⃣ 진단 결과 화면 (`/result`)

### 🎯 화면 목적
- 퍼스널 컬러 진단 결과의 명확한 전달
- 사용자 만족도 극대화를 위한 개인화된 설명
- 다음 단계(히잡 추천)로의 자연스러운 유도

### 📐 레이아웃 구성

**상단 헤더**
- 공유 버튼, 저장 버튼
- 진행 단계: "4/7 단계"

**메인 콘텐츠**
- 완료 메시지: "분석이 완료되었어요!"
- 진단 결과: "당신은 **봄 웜톤 (Bright Spring)**"
- 사용자 사진 (컬러 오버레이 적용)
- 어울리는 컬러 섹션 (3개 컬러 + 설명)
- 피해야 할 컬러 섹션 (2개 컬러 + 설명)

**하단 CTA**
- "히잡 색상 추천받기" 버튼

### 🔧 기능 요구사항

**결과 데이터 구조**
- `season`: 계절톤 (Spring, Summer, Autumn, Winter)
- `subtype`: 세부 분류 (예: Bright Spring)
- `bestColors`: 추천 컬러 배열 (name, hex, rgb)
- `worstColors`: 피해야 할 컬러 배열
- `confidence`: 분석 신뢰도 (0-1)

**컬러 시각화**
- 각 컬러를 색상 팔레트로 시각적 표현
- 컬러명과 설명 텍스트 함께 표시
- 호버/터치 시 상세 정보 툴팁

**공유 기능**
- 네이티브 공유 API 사용 (모바일)
- 폴백: 클립보드 복사 기능
- 결과 이미지 생성 및 다운로드

---

## 5️⃣ 히잡 추천 CTA 화면 (`/result#recommendation`)

### 🎯 화면 목적
- 진단 결과에서 히잡 추천 서비스로의 자연스러운 전환
- 추천 서비스의 가치와 차별점 강조
- 사용자의 추가 참여 동기 부여

### 📐 레이아웃 구성

**메인 메시지**
- "이제 당신만을 위한 히잡 색상을 추천받아보세요!"

**가치 제안 섹션**
- 아이콘 + 텍스트 조합으로 3-4개 혜택 강조
- "퍼스널 컬러 진단 결과를 바탕으로 실제 구매 가능한 히잡 제품을 추천드려요"

**고려 요소 리스트**
- 당신의 피부톤과 조화
- 원하는 소재와 스타일
- 예산과 브랜드 선호도
- 계절과 용도

**DM 안내**
- "개인 맞춤 추천은 인스타그램 DM으로 보내드려요"

**CTA 버튼**
- "히잡 추천받기 (무료)"
- 예상 소요시간: "약 2-3분 소요"

### 🔧 기능 요구사항

**스크롤 애니메이션**
- Intersection Observer를 사용한 등장 애니메이션
- 순차적 요소 등장 효과

**버튼 인터랙션**
- 클릭 시 `/recommendation` 페이지로 이동
- 부드러운 페이지 전환 애니메이션

---

## 6️⃣ 히잡 추천 입력 폼 (`/recommendation`)

### 🎯 화면 목적
- 개인화된 히잡 추천을 위한 상세 정보 수집
- 사용자 친화적인 폼 인터페이스 제공
- 높은 완료율을 위한 단계별 진행

### 📐 레이아웃 구성

**상단 네비게이션**
- 뒤로가기 버튼
- 진행 단계: "6/7 단계"

**메인 콘텐츠**
- 질문 제목
- 선택 옵션들 (라디오 버튼 또는 체크박스)
- 진행률 바
- "다음 단계" 또는 "완료" 버튼

### 🔧 폼 구성 요소

**1단계: 히잡 소재**
- 여름용 (통기성 좋은)
- 겨울용 (두꺼운 소재)  
- 사계절용
- 선택 방식: 단일 선택 (라디오 버튼)

**2단계: 비침 여부**
- 비침 없는
- 살짝 비침
- 상관 없음
- 선택 방식: 단일 선택 (라디오 버튼)

**3단계: 희망 가격대**
- 1만원 이하
- 1-2만원  
- 3만원 이상 (프리미엄)
- 선택 방식: 단일 선택 (라디오 버튼)

**4단계: 착용감 스타일**
- 밀착형
- 레이어용
- 루즈핏
- 선택 방식: 단일 선택 (라디오 버튼)

**5단계: 색상 선호도**
- 뉴트럴
- 포인트
- 화사한
- 어두운
- 선택 방식: 다중 선택 (체크박스)

**6단계: 추가 요청사항 (선택)**
- 자유 텍스트 입력 (최대 200자)

### 🔧 기능 요구사항

**멀티스텝 폼 관리**
- 단계별 데이터 임시 저장
- 뒤로가기 시 이전 입력값 유지
- 각 단계 완료 시 자동 다음 단계 진행

**폼 검증**
- 필수 항목 미선택 시 버튼 비활성화
- 실시간 진행률 업데이트
- 에러 상태 표시

**상태 관리**
- `formData`: 전체 폼 데이터 객체
- `currentStep`: 현재 단계 (0-5)
- `isValid`: 현재 단계 유효성
- `isSubmitting`: 폼 제출 중 상태

---

## 7️⃣ 추천 신청 완료 화면 (`/completion`)

### 🎯 화면 목적
- 성공적인 서비스 완료 확인
- 다음 액션에 대한 명확한 안내
- 추가 참여 유도 및 바이럴 확산

### 📐 레이아웃 구성

**상단**
- 진행 단계: "7/7 단계"

**메인 콘텐츠**
- 완료 메시지: "완료되었어요!"
- 안내 메시지: "개인 맞춤 히잡 추천을 곧 인스타그램 DM으로 보내드릴게요"
- 사용자 인스타그램 ID 표시
- 발송 예정 시간: "24시간 이내 발송 예정"
- 추천 내용 미리보기: "개인 맞춤 추천 3-5개 + 구매 링크 포함"

**추가 액션 섹션**
- "기다리는 동안..." 제목
- "결과 이미지 저장하기" 버튼
- "친구에게 공유하기" 버튼
- "홈으로 돌아가기" 버튼

**하단 문의 안내**
- 고객지원 연락처 정보

### 🔧 기능 요구사항

**결과 이미지 생성**
- Canvas API를 사용한 결과 카드 생성
- 사용자 진단 결과 + 브랜딩 요소 포함
- PNG 형식으로 다운로드 제공

**공유 기능**
- 네이티브 공유 API (모바일)
- 클립보드 복사 (데스크톱)
- 추천 링크에 referral 파라미터 포함

**분석 트래킹**
- 완료 이벤트 기록
- 각 액션별 클릭 이벤트 추적
- 사용자 세션 완료 마킹

---

## 📱 공통 모바일 최적화 요구사항

### 터치 인터랙션
- 최소 터치 타겟 크기: 44px × 44px
- 버튼 간 최소 간격: 8px
- 터치 피드백 (ripple effect 또는 scale 애니메이션)

### 성능 최적화
- 이미지 지연 로딩 (Lazy Loading)
- 컴포넌트 코드 스플리팅
- 중요 리소스 우선 로딩

### 접근성
- 적절한 색상 대비 (WCAG 2.1 AA 기준)
- 스크린 리더 지원을 위한 의미론적 마크업
- 키보드 네비게이션 지원

---

## 🔗 연관 문서

- **디자인 상세사항**: [디자인 시스템](./design-system.md)
- **컴포넌트 구현**: [컴포넌트 구조](./component-structure.md)  
- **API 연동**: [API 명세서](./api-specification.md)
- **개발 환경**: [개발 환경 설정](./development-setup.md)