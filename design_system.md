# 디자인 시스템

> **연관 문서**: [메인 기획문서](./main-prd.md) | [화면별 상세 기획서](./screens-specification.md) | [모바일 UX 가이드](./mobile-ux-guide.md)

---

## 🎨 색상 팔레트

### Primary Colors
```
Primary: #FF6B6B (코랄 핑크)
Primary Light: #FF8E8E  
Primary Dark: #E85555
```

### Secondary Colors
```
Secondary: #4ECDC4 (민트)
Secondary Light: #6ED7D0
Secondary Dark: #3BB8B0
```

### Neutral Colors
```
Gray 50: #F9FAFB
Gray 100: #F3F4F6
Gray 200: #E5E7EB
Gray 300: #D1D5DB
Gray 400: #9CA3AF
Gray 500: #6B7280
Gray 600: #4B5563
Gray 700: #374151
Gray 800: #1F2937
Gray 900: #111827
```

### Semantic Colors
```
Success: #10B981
Warning: #F59E0B
Error: #EF4444
Info: #3B82F6
```

### 색상 사용 가이드라인

**Primary Color 사용**
- 주요 CTA 버튼
- 로고 및 브랜드 요소
- 중요한 액션 아이템

**Secondary Color 사용**  
- 보조 버튼
- 아이콘 강조
- 진행률 표시

**Neutral Colors 사용**
- 텍스트 (Gray 700, 800, 900)
- 배경 (Gray 50, 100)
- 테두리 (Gray 200, 300)

---

## 📝 타이포그래피

### 폰트 패밀리
```
Primary: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif
Fallback: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif
```

### 텍스트 스케일

**Heading Styles**
```
H1: 32px, Bold (2rem)
H2: 24px, SemiBold (1.5rem)  
H3: 20px, SemiBold (1.25rem)
H4: 18px, Medium (1.125rem)
```

**Body Styles**
```
Body Large: 18px, Regular (1.125rem)
Body: 16px, Regular (1rem)
Body Small: 14px, Regular (0.875rem)
Caption: 12px, Regular (0.75rem)
```

### 행간 (Line Height)
```
H1-H4: 1.2-1.3
Body: 1.6
Caption: 1.4
```

### 자간 (Letter Spacing)
```
Headlines: -0.025em
Body: 0em
Small text: 0.025em
```

---

## 🔘 버튼 시스템

### Primary Button
```
Background: Linear gradient (135deg, #FF6B6B, #FF8E53)
Color: White
Padding: 16px 32px (모바일), 12px 24px (작은 버튼)
Border Radius: 12px
Font: 18px Medium (모바일), 16px Medium (데스크톱)
Shadow: 0 4px 12px rgba(255, 107, 107, 0.3)
```

**Hover State**
```
Transform: translateY(-2px)
Shadow: 0 6px 16px rgba(255, 107, 107, 0.4)
Transition: all 0.3s ease
```

### Secondary Button
```
Background: White
Color: #FF6B6B
Border: 2px solid #FF6B6B
Padding: 14px 30px (border 고려)
Border Radius: 12px
```

### Ghost Button
```
Background: Transparent
Color: #4B5563
Border: 1px solid #D1D5DB
Padding: 12px 24px
Border Radius: 8px
```

### Button States
```
Default: 기본 상태
Hover: 상승 효과 + 그림자 강화
Active: Transform scale(0.98)
Disabled: Opacity 0.5, cursor: not-allowed
Loading: 스피너 + 텍스트 변경
```

---

## 📦 카드 컴포넌트

### Base Card
```
Background: White
Border Radius: 16px
Padding: 24px
Shadow: 0 4px 24px rgba(0, 0, 0, 0.08)
Border: 1px solid #E5E7EB
```

### Interactive Card
```
Hover Transform: translateY(-4px)
Hover Shadow: 0 8px 32px rgba(0, 0, 0, 0.12)
Transition: all 0.3s ease
Cursor: pointer
```

### Content Card
```
Padding: 20px
Border Radius: 12px
Shadow: 0 2px 12px rgba(0, 0, 0, 0.06)
```

---

## 🎭 아이콘 시스템

### 아이콘 크기
```
Small: 16px × 16px
Medium: 24px × 24px  
Large: 32px × 32px
XLarge: 48px × 48px
```

### 아이콘 스타일
- 라인 스타일 우선 사용
- 2px 두께
- 모서리: rounded
- 중요한 액션: filled 스타일 허용

### 주요 아이콘 목록
```
Navigation: arrow-left, arrow-right, chevron-down
Actions: camera, upload, share, download, save
Status: check, x, alert-circle, info
Social: instagram, link, copy
UI: menu, close, search, filter
```

---

## 📐 레이아웃 & 간격

### Container
```
모바일: padding 16px, max-width 100%
태블릿: padding 24px, max-width 768px, center
데스크톱: padding 32px, max-width 1024px, center
```

### Spacing Scale
```
4px (0.25rem): xs
8px (0.5rem): sm  
12px (0.75rem): md
16px (1rem): lg
24px (1.5rem): xl
32px (2rem): 2xl
48px (3rem): 3xl
64px (4rem): 4xl
```

### Grid System
```
모바일: 1 column, 16px gutter
태블릿: 2-3 columns, 20px gutter  
데스크톱: 3-4 columns, 24px gutter
```

---

## 🎬 애니메이션 & 트랜지션

### Duration
```
Fast: 0.15s (hover, click feedback)
Normal: 0.3s (일반적인 상태 변경)
Slow: 0.6s (페이지 전환, 복잡한 애니메이션)
```

### Easing
```
Ease Out: cubic-bezier(0.25, 0.46, 0.45, 0.94) - 등장
Ease In: cubic-bezier(0.55, 0.055, 0.675, 0.19) - 사라짐  
Ease In Out: cubic-bezier(0.645, 0.045, 0.355, 1) - 중간 전환
```

### 공통 애니메이션

**페이드 인**
```
From: opacity 0, transform translateY(20px)
To: opacity 1, transform translateY(0)
Duration: 0.6s ease-out
```

**카드 호버**
```
Transform: translateY(-4px)
Shadow: 0 8px 32px rgba(0, 0, 0, 0.12)
Duration: 0.3s ease
```

**버튼 클릭**
```
Transform: scale(0.98)
Duration: 0.15s ease-in-out
```

**로딩 스피너**
```
Animation: rotate 360deg
Duration: 1s linear infinite
```

---

## 📊 진행률 표시

### Progress Bar
```
Height: 8px
Border Radius: 4px
Background: #E5E7EB
Fill: Linear gradient (#4ECDC4, #3BB8B0)
```

### Step Indicator
```
Circle Size: 32px
Active: #FF6B6B background, white number
Completed: #10B981 background, white checkmark  
Inactive: #E5E7EB background, #6B7280 number
```

---

## 🖼️ 이미지 & 미디어

### 이미지 비율
```
Square: 1:1 (프로필, 결과 카드)
Portrait: 3:4 (업로드된 얼굴 사진)
Landscape: 16:9 (예시 이미지, 배너)
```

### 이미지 스타일
```
Border Radius: 12px (일반), 16px (카드 내)
Object Fit: cover
Loading: 블러 효과에서 선명하게
```

### 컬러 팔레트 표시
```
Swatch Size: 40px × 40px (모바일), 48px × 48px (데스크톱)
Border: 2px solid white
Shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
Border Radius: 8px
```

---

## 📱 반응형 브레이크포인트

### Breakpoints
```
Mobile: 0px - 767px
Tablet: 768px - 1023px  
Desktop: 1024px+
```

### 반응형 원칙
1. **Mobile First**: 모바일 디자인을 기본으로 확장
2. **Content Priority**: 작은 화면에서 핵심 콘텐츠 우선 표시
3. **Touch Friendly**: 터치 인터랙션 최적화
4. **Performance**: 모바일 성능 최우선 고려

---

## 🎯 컴포넌트별 디자인 가이드

### Form Elements

**Input Field**
```
Height: 48px (모바일), 44px (데스크톱)
Padding: 12px 16px
Border: 1px solid #D1D5DB
Border Radius: 8px
Font: 16px Regular
```

**Focus State**
```
Border: 2px solid #FF6B6B
Outline: none
Shadow: 0 0 0 3px rgba(255, 107, 107, 0.1)
```

**Radio Button / Checkbox**
```
Size: 20px × 20px
Border: 2px solid #D1D5DB
Border Radius: 4px (checkbox), 50% (radio)
Active: #FF6B6B background
```

### Toast Messages
```
Background: #111827
Color: White
Padding: 12px 16px
Border Radius: 8px
Shadow: 0 4px 12px rgba(0, 0, 0, 0.3)
Position: fixed, bottom 20px, center
```

### Loading States
```
Skeleton: #E5E7EB background, subtle pulse animation
Spinner: 24px, #FF6B6B color, 1s rotation
Progress: 진행률 바 + 퍼센티지 텍스트
```

---

## 🔧 CSS 변수 정의

```css
:root {
  /* Colors */
  --color-primary: #FF6B6B;
  --color-primary-light: #FF8E8E;
  --color-primary-dark: #E85555;
  --color-secondary: #4ECDC4;
  --color-gray-50: #F9FAFB;
  --color-gray-900: #111827;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 0.75rem;
  --spacing-lg: 1rem;
  --spacing-xl: 1.5rem;
  --spacing-2xl: 2rem;
  
  /* Typography */
  --font-size-h1: 2rem;
  --font-size-body: 1rem;
  --line-height-heading: 1.2;
  --line-height-body: 1.6;
  
  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.6s ease-out;
}
```

---

## 🔗 연관 문서

- **화면별 적용**: [화면별 상세 기획서](./screens-specification.md)
- **모바일 최적화**: [모바일 UX 가이드](./mobile-ux-guide.md)
- **컴포넌트 구현**: [컴포넌트 구조](./component-structure.md)