# Personal Color Analysis API

퍼스널 컬러 진단 AI 웹서비스를 위한 REST API

## 설치 방법

1. 필요한 패키지 설치:
```bash
pip install -r requirements.txt
```

2. dlib 얼굴 인식 모델 파일이 `res/shape_predictor_68_face_landmarks.dat` 경로에 있는지 확인

## API 실행

```bash
cd src
python api.py
```

또는 uvicorn으로 직접 실행:
```bash
cd src
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

## API 엔드포인트

### 1. 헬스 체크
- **GET** `/health`
- API 상태 확인

### 2. 퍼스널 컬러 분석
- **POST** `/analyze`
- 이미지를 업로드하여 퍼스널 컬러 분석
- Content-Type: multipart/form-data
- 파라미터: file (이미지 파일)

#### 요청 예시:
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_image.jpg"
```

#### 응답 예시:
```json
{
  "personal_color": "봄 웜톤",
  "personal_color_en": "spring",
  "tone": "웜톤",
  "tone_en": "warm",
  "details": {
    "warm_confidence": 0.85,
    "season_confidence": 0.78,
    "is_warm": true,
    "season_value": 0
  },
  "facial_colors": {
    "left_cheek": [
      {
        "rgb": [230, 195, 170],
        "lab": [80.5, 12.3, 18.7],
        "hsv": [25.0, 26.1, 90.2]
      }
    ],
    "right_cheek": [...],
    "left_eyebrow": [...],
    "right_eyebrow": [...],
    "left_eye": [...],
    "right_eye": [...]
  },
  "confidence": 0.815
}
```

## 에러 응답

### 400 Bad Request
- 이미지 파일이 아닌 경우
- 이미지를 읽을 수 없는 경우
- 얼굴을 찾을 수 없는 경우
- 얼굴 특징점을 찾을 수 없는 경우

### 500 Internal Server Error
- 분석 중 예상치 못한 오류 발생

## API 문서

FastAPI의 자동 문서 생성 기능을 통해 다음 URL에서 API 문서를 확인할 수 있습니다:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc