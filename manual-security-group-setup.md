# 보안 그룹 설정 가이드

## AWS Console에서 수동으로 포트 열기

1. **EC2 Console 접속**
   - https://console.aws.amazon.com/ec2/
   - 리전: Asia Pacific (Seoul) ap-northeast-2

2. **인스턴스 선택**
   - 인스턴스 ID: i-07a1966aae519d0d8
   - 인스턴스 선택 후 아래 "보안" 탭 클릭

3. **보안 그룹 편집**
   - 보안 그룹 이름 클릭
   - "인바운드 규칙 편집" 버튼 클릭

4. **다음 규칙 추가**
   
   | 유형 | 프로토콜 | 포트 범위 | 소스 | 설명 |
   |------|---------|----------|------|------|
   | 사용자 지정 TCP | TCP | 3000 | 0.0.0.0/0 | PCA-HIJAB Frontend |
   | 사용자 지정 TCP | TCP | 5001 | 0.0.0.0/0 | PCA-HIJAB Backend API |
   | 사용자 지정 TCP | TCP | 8000 | 0.0.0.0/0 | PCA-HIJAB AI API |

5. **규칙 저장**

## 포트가 열린 후 배포 진행

1. **EC2 Instance Connect로 접속**
   - 인스턴스 선택
   - "Connect" 버튼 클릭
   - "EC2 Instance Connect" 탭
   - "Connect" 클릭

2. **배포 스크립트 실행**
   터미널에 다음 복사&붙여넣기:

```bash
# 간단한 한 줄 배포
curl -s https://raw.githubusercontent.com/ludia8888/pca-hijab/main/quick-deploy.sh | bash
```

또는 수동으로:

```bash
# Git 클론
cd ~
git clone https://github.com/ludia8888/pca-hijab.git
cd pca-hijab

# 환경 변수 설정
cat > .env << 'EOF'
POSTGRES_USER=pca_user
POSTGRES_PASSWORD=pca_secure_2025
POSTGRES_DB=pca_hijab
NODE_ENV=production
PORT=5001
AI_API_URL=http://ai-api:8000
ADMIN_API_KEY=admin_key_2025
SESSION_SECRET=session_secret_2025
CORS_ORIGINS=http://13.209.22.8:3000
VITE_BACKEND_URL=http://13.209.22.8:5001
VITE_AI_API_URL=http://13.209.22.8:8000
EOF

# Docker Compose 실행
sudo docker-compose up -d
```

3. **서비스 확인**
   - Frontend: http://13.209.22.8:3000
   - Backend API: http://13.209.22.8:5001
   - AI API: http://13.209.22.8:8000