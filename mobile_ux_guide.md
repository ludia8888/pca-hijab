# 모바일 UX 가이드

> **연관 문서**: [메인 기획문서](./main-prd.md) | [디자인 시스템](./design-system.md) | [화면별 상세 기획서](./screens-specification.md)

---

## 📱 모바일 우선 설계 원칙

### Core Principles
1. **Mobile First**: 모바일 디자인을 기본으로 하고 데스크톱으로 확장
2. **Touch Friendly**: 터치 인터랙션에 최적화된 UI 요소
3. **One-Handed Use**: 한 손으로 사용 가능한 레이아웃
4. **Performance Priority**: 모바일 네트워크와 성능 고려
5. **Context Aware**: 모바일 사용 컨텍스트에 맞는 UX

---

## 📐 반응형 브레이크포인트 & 레이아웃

### Breakpoints
```
Mobile: 320px - 767px (주요 타겟)
Tablet: 768px - 1023px  
Desktop: 1024px+
```

### 디바이스별 최적화

**Mobile (320px - 767px)**
- 단일 컬럼 레이아웃
- 네비게이션: 하단 고정 또는 햄버거 메뉴
- 콘텐츠 우선순위: 핵심 정보 먼저 표시
- 터치 타겟: 최소 44px × 44px

**Tablet (768px - 1023px)**
- 2-3 컬럼 그리드 레이아웃
- 사이드바 또는 모달 활용
- 터치와 마우스 인터랙션 모두 지원

**Desktop (1024px+)**
- 멀티 컬럼 레이아웃
- 호버 상태 및 키보드 네비게이션
- 더 많은 정보 밀도

---

## 👆 터치 인터랙션 가이드라인

### Touch Target 크기
```
Minimum: 44px × 44px (Apple HIG)
Recommended: 48px × 48px (Material Design)
Comfortable: 56px × 56px (큰 버튼)
```

### 터치 영역 간격
```
최소 간격: 8px
권장 간격: 12px
여유 간격: 16px
```

### 터치 피드백

**시각적 피드백**
- 버튼 터치 시: Scale 0.95 또는 배경색 변경
- 링크 터치 시: 텍스트 색상 변경
- 카드 터치 시: 그림자 증가 또는 상승 효과

**햅틱 피드백** (가능한 경우)
- 중요한 액션: 진동 피드백
- 에러 상황: 짧은 진동
- 성공 완료: 부드러운 진동

### 제스처 지원

**기본 제스처**
- 탭: 기본 선택 액션
- 롱 프레스: 컨텍스트 메뉴 (선택적)
- 스와이프: 페이지 전환 또는 삭제
- 핀치 줌: 이미지 확대 (필요 시)

**피해야 할 제스처**
- 더블 탭 (우연한 터치 방지)
- 복잡한 멀티 터치 제스처
- 작은 드래그 앤 드롭

---

## 📝 폼 최적화

### 입력 필드 설계
```
높이: 48px (모바일), 44px (태블릿+)
패딩: 12px 16px (세로) / 16px (가로)
보더: 1px solid (기본), 2px solid (포커스)
보더 반경: 8px
```

### 키보드 최적화

**Input Type 지정**
- `type="email"`: 이메일 키보드
- `type="tel"`: 숫자 키보드  
- `type="text"`: 기본 키보드
- `inputmode="numeric"`: 숫자 입력

**자동 완성 속성**
```html
<input 
  type="text" 
  autocomplete="username" 
  autocapitalize="none"
  autocorrect="off"
  spellcheck="false"
/>
```

### 모바일 폼 UX 패턴

**단일 입력 집중**
- 한 번에 하나의 입력 필드만 표시
- 다음/완료 버튼으로 진행
- 진행률 표시

**인라인 검증**
- 실시간 유효성 검사
- 에러 메시지는 필드 바로 아래 표시
- 성공 상태 시각적 표시

**스마트 기본값**
- 이전 입력값 기억
- 위치 기반 기본값 (필요 시)
- 일반적인 선택지 우선 표시

---

## 🖼️ 이미지 & 미디어 최적화

### 이미지 로딩 전략

**Lazy Loading**
```html
<img 
  src="placeholder.jpg" 
  data-src="actual-image.jpg" 
  loading="lazy"
  alt="설명"
/>
```

**Progressive Loading**
1. 저해상도 이미지 먼저 로딩
2. 고해상도 이미지로 점진적 교체
3. 블러 효과에서 선명하게 전환

**Responsive Images**
```html
<picture>
  <source media="(max-width: 767px)" srcset="mobile.jpg">
  <source media="(max-width: 1023px)" srcset="tablet.jpg">
  <img src="desktop.jpg" alt="설명">
</picture>
```

### 이미지 최적화 규칙

**파일 형식**
- WebP 우선 사용 (폴백: JPEG)
- PNG는 투명도 필요시만
- SVG는 아이콘과 로고

**파일 크기**
- 모바일: 최대 100KB per image
- 썸네일: 10-20KB
- 히어로 이미지: 150KB 이하

**비율 & 크기**
- 1:1 (프로필, 결과 카드)
- 3:4 (업로드 사진)
- 16:9 (배너, 예시 이미지)

---

## ⚡ 성능 최적화

### 로딩 성능

**Critical Rendering Path**
1. HTML 구조 우선 로딩
2. CSS Critical Path 인라인
3. 비필수 CSS/JS 지연 로딩
4. 이미지 및 폰트 최적화

**Bundle Splitting**
```javascript
// 페이지별 코드 스플리팅
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'))

// 컴포넌트별 스플리팅
const HeavyComponent = lazy(() => import('./components/HeavyComponent'))
```

**Resource Hints**
```html
<link rel="preconnect" href="https://api.hijabcolor.ai">
<link rel="dns-prefetch" href="https://s3.amazonaws.com">
<link rel="preload" href="/fonts/pretendard.woff2" as="font" type="font/woff2" crossorigin>
```

### 런타임 성능

**메모리 관리**
- 이미지 미리보기 URL 정리
- 이벤트 리스너 해제
- 타이머 및 애니메이션 정리

**네트워크 최적화**
- API 요청 배치 처리
- 결과 캐싱 (적절한 TTL)
- 이미지 압축 및 리사이즈

**배터리 효율성**
- 불필요한 애니메이션 최소화
- 백그라운드 작업 제한
- CPU 집약적 작업 최적화

---

## 🎭 애니메이션 & 마이크로인터랙션

### 모바일 애니메이션 원칙

**성능 고려사항**
- Transform과 Opacity만 애니메이션
- 60fps 유지 (16.67ms per frame)
- GPU 가속 활용 (transform3d, will-change)

**Duration & Easing**
```css
/* 빠른 피드백 */
.quick-feedback {
  transition: transform 0.15s ease-out;
}

/* 일반적인 전환 */
.normal-transition {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* 느린 강조 */
.emphasis {
  transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

### 핵심 마이크로인터랙션

**버튼 피드백**
```css
.button {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.button:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
```

**로딩 상태**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading {
  animation: pulse 1.5s ease-in-out infinite;
}
```

**페이지 전환**
```css
.page-enter {
  opacity: 0;
  transform: translateX(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: all 0.3s ease-out;
}
```

---

## 📲 네이티브 기능 활용

### 카메라 & 갤러리 접근
```html
<!-- 카메라만 -->
<input type="file" accept="image/*" capture="user">

<!-- 갤러리만 -->
<input type="file" accept="image/*">

<!-- 카메라 우선, 갤러리 허용 -->
<input type="file" accept="image/*" capture="environment">
```

### 위치 정보 (필요시)
```javascript
// 위치 기반 서비스 (선택적)
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    position => {
      // 위치 정보 활용
    },
    error => {
      // 에러 처리
    },
    { enableHighAccuracy: false, timeout: 10000 }
  )
}
```

### 공유 기능
```javascript
// Native Share API
if (navigator.share) {
  await navigator.share({
    title: '나의 퍼스널 컬러 결과',
    text: '히잡 색상 추천받기',
    url: window.location.href
  })
} else {
  // 폴백: 클립보드 복사
  await navigator.clipboard.writeText(shareUrl)
}
```

### PWA 기능
```javascript
// 홈 화면 추가 프롬프트
let deferredPrompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  // 설치 버튼 표시
})

// 오프라인 지원
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```

---

## 🔧 접근성 (Accessibility)

### 색상 & 대비
```
WCAG 2.1 AA 기준 준수
일반 텍스트: 4.5:1 이상
큰 텍스트 (18px+): 3:1 이상
```

### 터치 접근성
```
터치 타겟 크기: 최소 44px × 44px
터치 타겟 간격: 최소 8px
포커스 표시: 2px solid outline
```

### 스크린 리더 지원
```html
<!-- 의미론적 마크업 -->
<main role="main">
  <section aria-labelledby="upload-heading">
    <h2 id="upload-heading">사진 업로드</h2>
    <!-- 콘텐츠 -->
  </section>
</main>

<!-- ARIA 레이블 -->
<button aria-label="인스타그램 ID 입력 후 진단 시작">
  진단 시작하기
</button>

<!-- 상태 안내 -->
<div aria-live="polite" aria-atomic="true">
  분석이 80% 완료되었습니다.
</div>
```

### 키보드 네비게이션
```css
/* 포커스 표시 */
:focus-visible {
  outline: 2px solid #FF6B6B;
  outline-offset: 2px;
}

/* 스킵 링크 */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 6px;
}
```

---

## 🚨 에러 처리 & 사용자 피드백

### 에러 메시지 표시
```
명확성: 무엇이 잘못되었는지 명확히 설명
해결책: 사용자가 취할 수 있는 행동 제시
친근함: 기술적 용어 대신 일상 언어 사용
```

### 네트워크 에러 처리
```javascript
// 오프라인 감지
window.addEventListener('online', () => {
  showToast('인터넷 연결이 복구되었습니다.')
})

window.addEventListener('offline', () => {
  showToast('인터넷 연결을 확인해주세요.')
})

// 재시도 메커니즘
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
```

### 로딩 상태 관리
```
즉시 피드백: 버튼 클릭 시 즉시 로딩 상태 표시
진행률 표시: 장시간 작업 시 진행률 바 표시
예상 시간: 가능하면 완료 예상 시간 안내
취소 옵션: 긴 작업에는 취소 버튼 제공
```

---

## 📊 모바일 UX 측정 지표

### Core Web Vitals
```
LCP (Largest Contentful Paint): < 2.5초
FID (First Input Delay): < 100ms
CLS (Cumulative Layout Shift): < 0.1
```

### 사용자 경험 지표
```
페이지 로드 시간: < 3초
첫 번째 인터랙션: < 1초
폼 완료율: > 70%
이탈률: < 40%
```

### 모바일 특화 지표
```
터치 응답 시간: < 50ms
스크롤 성능: 60fps 유지
배터리 사용량: 최소화
데이터 사용량: 페이지당 < 2MB
```

---

## 🧪 모바일 테스트 전략

### 디바이스 테스트
```
Primary: iPhone 12/13/14, Galaxy S21/S22
Secondary: iPhone SE, Galaxy A 시리즈
Tablets: iPad, Galaxy Tab
```

### 브라우저 테스트
```
iOS: Safari (최신 2개 버전)
Android: Chrome (최신 2개 버전)
Samsung Internet (삼성 디바이스)
```

### 성능 테스트
```
Lighthouse Mobile 점수: > 90
WebPageTest: 3G 네트워크 조건
Chrome DevTools: CPU 4x slowdown
```

### 사용성 테스트
```
원핸드 사용성: 엄지 손가락으로만 조작
가독성: 실제 디바이스에서 텍스트 크기 확인
터치 정확도: 버튼 및 링크 터치 용이성
```

---

## 🔗 연관 문서

- **전체 기획**: [메인 기획문서](./main-prd.md)
- **디자인 적용**: [디자인 시스템](./design-system.md)
- **화면별 구현**: [화면별 상세 기획서](./screens-specification.md)
- **성능 최적화**: [기술 스택 & 아키텍처](./tech-architecture.md)