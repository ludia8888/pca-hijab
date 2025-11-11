# ShowMeTheColor API Deployment Guide

## 1. 로컬 개발
```bash
cd ShowMeTheColor
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python src/api.py   # http://localhost:8000
```
- `api.py`는 dlib 기반 전체 파이프라인을 실행합니다. 설치가 어려운 환경에서는 `api_simple.py`를 사용할 수 있지만, Render 배포는 `api.py`를 기준으로 합니다.
- 허용 Origin 목록은 `src/api.py` 상단 `allowed_origins`에 정의되어 있습니다.

## 2. Render 배포
- Dockerfile: `ShowMeTheColor/Dockerfile.render`
- Start Command: `python src/api.py`
- 포트: `8000` (Render 환경 변수 `PORT` 자동 주입)
- 추가 볼륨: `./ShowMeTheColor/res` → `/app/res`

### Render 설정 절차
1. Render Dashboard → **New Web Service** → GitHub 저장소 선택 → Docker
2. Build Command: (자동) `pip install -r requirements.txt`
3. Start Command: `python src/api.py`
4. Environment Variables: `PORT=8000` (Render가 자동 설정하지만 명시하면 안전)
5. 배포 후 `https://showmethecolor-api.onrender.com/health`로 헬스 체크

## 3. CORS / Preflight 확인
```bash
# Preflight 요청
curl -X OPTIONS https://showmethecolor-api.onrender.com/analyze \
  -H "Origin: https://pca-hijab.vercel.app" \
  -H "Access-Control-Request-Method: POST"

# 실제 요청 예시
curl -X POST https://showmethecolor-api.onrender.com/analyze \
  -H "Origin: https://pca-hijab.vercel.app" \
  -F file=@sample.jpg
```
- 허용되지 않은 Origin은 FastAPI 미들웨어에서 차단됩니다. 필요 시 `allowed_origins` 목록을 업데이트하세요.

## 4. 문제 해결 체크리스트
| 증상 | 해결 방법 |
| --- | --- |
| `ModuleNotFoundError: dlib` | Render Dockerfile은 dlib 빌드 의존성을 설치합니다. 로컬에서 실패하면 `brew install dlib` 또는 `pip install dlib-bin` 사용 고려 |
| 504/콜드 스타트 지연 | Render Free 플랜은 슬립 → `MONITORING_SETUP.md` 참고하여 keep-alive 구성 |
| CORS 에러 | 요청 Origin이 허용 목록인지 확인, 필요 시 https 도메인 추가 |
| 메모리 초과 | Render Log에서 `OOM` 확인 후 Starter 플랜 이상으로 업그레이드 |

---
배포 후에는 `README.md`와 `MONITORING_SETUP.md`에 안내된 keep-alive 전략을 함께 적용해 콜드 스타트를 최소화하세요.
