# Character Images for Analysis Steps

`frontend/src/pages/AnalyzingPage.tsx`와 `frontend/src/utils/constants.ts`에서 분석 단계별 캐릭터 이미지를 사용합니다. 현재 배포본에는 이미지가 없으므로 아래 가이드를 참고해 자산을 추가하세요.

## 필요한 파일명 (PNG/JPG)
- `detective-analyzing.png` – 얼굴 인식 단계
- `scientist-extracting.png` – 색상 추출 단계
- `wizard-converting.png` – 색공간 변환 단계
- `analyst-thinking.png` – 웜/쿨톤 판별 단계
- `artist-creating.png` – 최종 팔레트 생성 단계

## 디자인 가이드
- 히잡을 착용한 친근한 캐릭터, 300x300px 이상, 투명 배경 PNG 권장
- 서비스 주 색상(코랄/퍼플)과 조화되는 팔레트 사용
- 각 단계별로 소품이나 포즈를 달리해 스토리텔링 강화
- 말풍선 자산(`../speech-bubbles`)과 함께 노출됨

## 적용 방법
1. 위 파일명을 그대로 사용하여 이미지를 저장합니다.
2. 필요 시 `AnalyzingPage.tsx`의 경로(`/images/characters/...`)를 확인하세요.
3. 이미지 추가 후 `npm run build`로 경로가 올바른지 확인합니다.

※ 결과 페이지(`ResultPageV2.tsx`)에서도 동일 자산을 재사용할 수 있습니다.
