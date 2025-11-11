# Speech Bubble Images for Analysis Steps

분석 진행 UI에서 캐릭터와 함께 노출되는 말풍선 이미지입니다. 현재는 Tailwind 기반 CSS 말풍선을 사용하고 있으므로 실제 이미지를 준비하면 보다 일관된 아트 디렉션을 구현할 수 있습니다.

## 필요한 파일명 (PNG)
- `bubble-1.png` – 탐정 단계 메시지
- `bubble-2.png` – 과학자 단계 메시지
- `bubble-3.png` – 마법사 단계 메시지
- `bubble-4.png` – 분석가 단계 메시지
- `bubble-5.png` – 아티스트 단계 메시지

## 디자인 가이드
- 투명 배경 PNG, 400x300px 내외
- 말풍선 테두리는 서비스 컬러(#FF6B6B, #7C3AED 등)를 활용
- 각 단계의 캐릭터와 조화되는 작은 아이콘/장식 포함
- 텍스트 영역을 충분히 확보하여 다국어 텍스트도 수용 가능하도록 제작

## 적용 방법
1. 위 파일명으로 이미지를 저장한 뒤, `frontend/src/utils/constants.ts`의 `analysisSteps`에서 `bubbleImage` 경로를 추가합니다.
2. CSS 말풍선을 제거하려면 `AnalyzingPage.tsx`에서 관련 Tailwind 클래스를 정리합니다.
3. 이미지 적용 후 빌드하여 실제 디바이스에서 글꼴/크기가 잘 맞는지 확인합니다.

이미지 미삽입 상태에서도 기능은 동작하지만, 디자인 완성도를 위해 자산을 준비하는 것을 권장합니다.
