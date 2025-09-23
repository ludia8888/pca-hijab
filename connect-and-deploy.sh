#!/bin/bash

# AWS EC2 Instance Connect를 위한 가이드

echo "====================================="
echo "EC2 Instance Connect 접속 가이드"
echo "====================================="
echo ""
echo "1. AWS EC2 Console에서:"
echo "   - 인스턴스 i-07a1966aae519d0d8 선택"
echo "   - 상단의 'Connect' 버튼 클릭"
echo "   - 'EC2 Instance Connect' 탭 선택"
echo "   - 'Connect' 버튼 클릭"
echo ""
echo "2. 터미널이 열리면 아래 명령어를 복사해서 실행:"
echo ""
echo "====================================="
echo "복사할 명령어:"
echo "====================================="

cat << 'DEPLOY_SCRIPT'
# PCA-HIJAB 빠른 배포 스크립트

# 1. Docker가 이미 설치되어 있는지 확인
if ! command -v docker &> /dev/null; then
    echo "Docker 설치 중..."
    sudo yum update -y
    sudo yum install -y docker git
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
else
    echo "Docker가 이미 설치되어 있습니다."
fi

# 2. Docker Compose 설치
if [ ! -f /usr/local/bin/docker-compose ]; then
    echo "Docker Compose 설치 중..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo "Docker Compose가 이미 설치되어 있습니다."
fi

# 3. 메모리 확인 및 스왑 추가
echo "메모리 상태 확인..."
free -h

if [ ! -f /swapfile ]; then
    echo "스왑 메모리 추가 중 (t3.micro 최적화)..."
    sudo dd if=/dev/zero of=/swapfile bs=1G count=2
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab
fi

# 4. 프로젝트 다운로드
echo "프로젝트 다운로드 중..."
cd /home/ec2-user
rm -rf pca-hijab
git clone https://github.com/ludia8888/pca-hijab.git
cd pca-hijab

# 5. 환경 변수 설정
echo "환경 변수 설정 중..."
cat > .env << 'EOF'
# Database
POSTGRES_USER=pca_user
POSTGRES_PASSWORD=pca_secure_2025
POSTGRES_DB=pca_hijab

# Backend
NODE_ENV=production
PORT=5001
AI_API_URL=http://ai-api:8000
ADMIN_API_KEY=admin_key_2025
SESSION_SECRET=session_secret_2025
CORS_ORIGINS=http://13.209.22.8:3000,http://13.209.22.8

# Frontend
VITE_BACKEND_URL=http://13.209.22.8:5001
VITE_AI_API_URL=http://13.209.22.8:8000
EOF

# 6. Docker Compose 실행
echo "Docker 컨테이너 시작 중..."
sudo docker-compose up -d

# 7. 상태 확인
echo "배포 상태 확인 중..."
sleep 20
sudo docker-compose ps

echo ""
echo "====================================="
echo "✅ 배포 완료!"
echo "====================================="
echo "접속 주소:"
echo "- Frontend: http://13.209.22.8:3000"
echo "- Backend API: http://13.209.22.8:5001"
echo "- AI API: http://13.209.22.8:8000"
echo ""
echo "로그 확인: sudo docker-compose logs -f"
echo "====================================="
DEPLOY_SCRIPT

echo ""
echo "====================================="
echo "보안 그룹 설정 확인"
echo "====================================="
echo "AWS Console에서 보안 그룹에 다음 포트가 열려있는지 확인:"
echo "- 22 (SSH)"
echo "- 3000 (Frontend)"
echo "- 5001 (Backend API)"
echo "- 8000 (AI API)"