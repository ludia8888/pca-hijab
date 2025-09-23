#!/bin/bash
# EC2 User Data Script for PCA-HIJAB

# 로그 파일 설정
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

# 시스템 업데이트
yum update -y

# Docker 설치
yum install -y docker git
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Docker Compose 설치
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 프로젝트 클론
cd /home/ec2-user
sudo -u ec2-user git clone https://github.com/ludia8888/pca-hijab.git
cd pca-hijab

# 환경 변수 파일 생성 (기본값)
cat > .env << 'EOF'
# Database
POSTGRES_USER=pca_user
POSTGRES_PASSWORD=changethispassword123!
POSTGRES_DB=pca_hijab

# Backend
NODE_ENV=production
ADMIN_API_KEY=defaultAdminKey123
SESSION_SECRET=defaultSessionSecret123
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Frontend
VITE_BACKEND_URL=http://localhost:5001
VITE_AI_API_URL=http://localhost:8000
EOF

chown ec2-user:ec2-user .env

# Docker 서비스가 준비될 때까지 대기
sleep 10

# Docker Compose 실행
sudo -u ec2-user docker-compose up -d

echo "PCA-HIJAB deployment completed!"