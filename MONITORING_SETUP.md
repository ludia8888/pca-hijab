# 🔍 외부 모니터링 & Keep-Alive 가이드

Render 무료 플랜은 15분간 트래픽이 없으면 서비스가 슬립 상태가 됩니다. 주기적으로 헬스 체크를 보내면 콜드 스타트를 줄이고 가용성을 높일 수 있습니다.

## 1. 모니터링 대상
| 서비스 | 엔드포인트 | 비고 |
| --- | --- | --- |
| Backend API | `https://pca-hijab-backend-unified.onrender.com/api/health` | DB 연결 여부를 포함한 JSON 응답 (`status: ok/degraded`) |
| AI API | `https://showmethecolor-api.onrender.com/health` | FastAPI 헬스 체크. 슬립 시 첫 응답까지 수 초 소요 |
| Frontend (선택) | `https://pca-hijab.vercel.app/` | 정적 사이트. 주기적 Ping은 필수 아님 (Vercel은 슬립 없음) |

## 2. 추천 무료 서비스
### UptimeRobot (권장)
- 5분 주기 모니터 50개 무료
- Backend / AI 각각 HTTP 모니터 등록 → 응답 코드 200 체크

### Better Uptime
- 3분 주기 최대 10개 모니터 무료, Alert History 제공

### Cron-job.org
- 단순 keep-alive용으로 사용 가능 (`*/5 * * * *`)

### Pingdom (무료 1개)
- 가장 중요한 엔드포인트 하나만 감시할 때 유용

## 3. GitHub Actions keep-alive 예시
`.github/workflows/keep-alive.yml`
```yaml
name: keep-services-alive

on:
  schedule:
    - cron: '*/10 * * * *'
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Backend health check
        run: |
          curl -fsS https://pca-hijab-backend-unified.onrender.com/api/health || true

      - name: AI API health check
        run: |
          curl -fsS https://showmethecolor-api.onrender.com/health || true
```
> Note: 실패 시 `true`로 종료해 워크플로 전체가 실패하지 않도록 합니다. 응답 시간이 길 경우 `--max-time` 옵션을 조정하세요.

## 4. 간단한 상태 페이지 만들기 (선택)
`frontend`에 API Route 혹은 Edge Function을 추가해 각 헬스 체크 응답을 집계할 수 있습니다. Next.js 앱 라우트 대신, 별도 서버리스 함수를 사용하거나 백엔드 `/api/debug/status`와 같은 엔드포인트를 추가하는 방식을 권장합니다.

## 5. 베스트 프랙티스
1. **주기 분산**: 서로 다른 서비스에서 다른 주기로 Ping하여 트래픽이 한 번에 몰리지 않게 합니다.
2. **타임아웃 추적**: 응답 시간이 5초 이상이면 콜드 스타트로 간주하고 알림을 설정합니다.
3. **알림 채널**: 이메일 외에 Slack/Webhook을 연결해 장애에 빠르게 대응합니다.
4. **로그 확인**: Render 대시보드 → Logs에서 모니터링 요청이 정상적으로 들어오는지 주기적으로 점검합니다.

## 6. 유료 플랜/대체 서비스 고려
- **Render Starter/Standard**: 슬립 없음, 리소스 고정 → 프로덕션 권장
- **Railway, Fly.io**: 사용량 기반 과금, 글로벌 리전, 빠른 콜드 스타트
- **Cloud Run**: 자동 스케일링 + 최소 인스턴스(유료) 설정으로 슬립 방지

## 7. 현재 구현 상태 메모
- 프론트엔드 코드(`frontend/src/utils/coldStartHandler.ts`, `preload.ts`)는 최초 진입 시 백엔드/AI API를 미리 호출해 콜드 스타트 영향을 줄이도록 설계되어 있습니다.
- 그럼에도 Render 무료 플랜에서는 외부 모니터링을 병행해야 안정적인 응답 시간을 확보할 수 있습니다.
