import requests
import json

# API 엔드포인트
url = "http://localhost:8000/analyze"

# 테스트할 이미지 파일 (여기에 본인 사진 경로 입력)
# 예: image_path = "/Users/sihyun/Desktop/my_photo.jpg"
image_path = input("분석할 이미지 파일 경로를 입력하세요: ").strip()

try:
    # 파일 열기
    with open(image_path, 'rb') as f:
        files = {'file': ('test.jpg', f, 'image/jpeg')}
        params = {'debug': 'true'}
        
        # POST 요청 보내기
        response = requests.post(url, files=files, params=params)
        
        # 응답 출력
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {response.headers}")
        
        if response.status_code == 200:
            print("\n성공! 분석 결과:")
            result = response.json()
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print("\n에러 발생:")
            print(response.text)
            
except Exception as e:
    print(f"요청 중 에러 발생: {e}")