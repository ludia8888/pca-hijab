# 🚀 Render 환경 변수 빠르게 설정하기

`scripts/setup_render_env.py`와 `scripts/setup-render-env.sh`는 Render 백엔드 서비스에 이메일 관련 환경 변수를 일괄 등록하고 자동 재배포를 트리거합니다. 프로덕션 사용 전에 값(특히 API Key, From 주소)을 꼭 갱신하세요.

## 0. 사전 준비
- Python 3.8 이상
- `requests` 라이브러리 (없다면 `pip install requests`)
- Render API Key (`https://dashboard.render.com/account/api-keys`)
- Render 서비스 ID (`https://dashboard.render.com/web/srv-xxxxx` URL의 `srv-xxxxx`)

```bash
cd /Users/isihyeon/Desktop/pca-hijab
pip install --user requests  # 필요 시
```

## 옵션 1. 대화형 Python 스크립트 (권장)
```bash
python3 scripts/setup_render_env.py
```
실행 후 API Key, Service ID를 입력하면 아래 변수를 설정합니다.

## 옵션 2. 쉘 스크립트로 한 번에 실행
```bash
./scripts/setup-render-env.sh YOUR_API_KEY YOUR_SERVICE_ID
```
둘 다 Render REST API `PATCH /v1/services/{id}/env-vars`를 호출합니다.

## 기본 값 (필요 시 수정)
- `EMAIL_ENABLED=true`
- `RESEND_API_KEY=re_PspAYXmP_37xPU2MiBMZFiCD2yqwEL1XK` (반드시 고유 키로 교체)
- `CLIENT_URL=https://pca-hijab.vercel.app`
- `EMAIL_FROM="PCA-HIJAB <onboarding@resend.dev>"`

값을 바꾸려면 `scripts/setup_render_env.py`와 `scripts/setup-render-env.sh` 내부의 상수를 수정하세요.

## 실행 이후 체크리스트
1. Render에서 자동 재배포가 끝날 때까지 2~3분 대기
2. https://pca-hijab.vercel.app/signup 에서 회원가입 테스트
3. 인증 메일 도착 여부 확인
4. Render → Logs에서 에러 없는지 점검

> ⚠️ 샘플 키/도메인은 보안을 위해 반드시 교체해야 합니다. 스크립트 실행 내역은 `Render Dashboard → Audit Logs`에서 확인 가능합니다.

---
**한 번만 세팅해두면 재배포 없이 손쉽게 이메일 환경을 맞출 수 있습니다.** 🎯
