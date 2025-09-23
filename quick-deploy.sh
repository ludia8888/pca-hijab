#!/bin/bash

# EC2에 복사해서 실행할 스크립트

echo "🚀 PCA-HIJAB 배포 시작..."
echo "=============================="

# 1. 시스템 업데이트
echo "1️⃣ 시스템 업데이트 중..."
sudo yum update -y

# 2. Docker 설치
echo "2️⃣ Docker 설치 중..."
sudo yum install -y docker git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# 3. Docker Compose 설치
echo "3️⃣ Docker Compose 설치 중..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. 스왑 메모리 추가
echo "4️⃣ 스왑 메모리 추가 중..."
if [ ! -f /swapfile ]; then
    sudo dd if=/dev/zero of=/swapfile bs=1G count=2
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab
fi

# 5. 프로젝트 클론
echo "5️⃣ 프로젝트 다운로드 중..."
cd /home/ec2-user
rm -rf pca-hijab
git clone https://github.com/ludia8888/pca-hijab.git
cd pca-hijab

# 6. 환경 변수 설정
echo "6️⃣ 환경 변수 설정 중..."
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

cat > .env << EOF
# Database
POSTGRES_USER=pca_user
POSTGRES_PASSWORD=pca_secure_pass_2025
POSTGRES_DB=pca_hijab

# Backend
NODE_ENV=production
PORT=5001
AI_API_URL=http://ai-api:8000
ADMIN_API_KEY=admin_key_2025
SESSION_SECRET=session_secret_2025
CORS_ORIGINS=http://${PUBLIC_IP}:3000,http://${PUBLIC_IP},https://${PUBLIC_IP}

# Frontend
VITE_BACKEND_URL=http://${PUBLIC_IP}:5001
VITE_AI_API_URL=http://${PUBLIC_IP}:8000
EOF

# 7. Docker Compose 실행
echo "7️⃣ Docker 컨테이너 시작 중..."
sudo -u ec2-user /usr/local/bin/docker-compose up -d

# 8. 상태 확인
sleep 30
echo ""
echo "=============================="
echo "✅ 배포 완료!"
echo "=============================="
echo ""
sudo -u ec2-user /usr/local/bin/docker-compose ps
echo ""
echo "접속 URL:"
echo "- Frontend: http://${PUBLIC_IP}:3000"
echo "- Backend API: http://${PUBLIC_IP}:5001"
echo "- AI API: http://${PUBLIC_IP}:8000"
echo "- Admin Panel: http://${PUBLIC_IP}:3000/admin/login"
echo ""
echo "로그 확인: docker-compose logs -f"
echo "=============================="