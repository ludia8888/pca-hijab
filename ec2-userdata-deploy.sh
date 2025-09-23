#!/bin/bash

# EC2 User Data를 통해 배포하는 스크립트
# AWS Console에서 직접 실행해야 합니다

cat << 'EOF'
====================================
EC2 User Data 배포 스크립트
====================================

AWS Console에서 다음 단계를 수행하세요:

1. EC2 콘솔로 이동
2. 인스턴스 선택 (i-07a1966aae519d0d8)
3. Actions > Instance settings > Edit user data
4. 아래 스크립트를 복사하여 붙여넣기
5. Save
6. 인스턴스 재시작

====================================
USER DATA 스크립트:
====================================

#!/bin/bash
# PCA-HIJAB 자동 배포 스크립트

# 로그 파일 설정
exec > >(tee -a /var/log/pca-hijab-deploy.log)
exec 2>&1

echo "Starting PCA-HIJAB deployment at $(date)"

# 1. 시스템 업데이트
yum update -y

# 2. Docker 설치
if ! command -v docker &> /dev/null; then
    yum install -y docker git
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ec2-user
fi

# 3. Docker Compose 설치
if [ ! -f /usr/local/bin/docker-compose ]; then
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 4. 스왑 메모리 설정 (t3.micro용)
if [ ! -f /swapfile ]; then
    dd if=/dev/zero of=/swapfile bs=1G count=2
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo "/swapfile none swap sw 0 0" >> /etc/fstab
fi

# 5. 프로젝트 배포
cd /home/ec2-user
rm -rf pca-hijab
sudo -u ec2-user git clone https://github.com/ludia8888/pca-hijab.git
cd pca-hijab

# 6. Public IP 가져오기
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# 7. 환경 변수 파일 생성
cat > .env << ENVEOF
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
ENVEOF

chown ec2-user:ec2-user .env

# 8. Docker Compose 실행
cd /home/ec2-user/pca-hijab
sudo -u ec2-user /usr/local/bin/docker-compose stop
sudo -u ec2-user /usr/local/bin/docker-compose up -d

echo "Deployment completed at $(date)"
echo "Services will be available at:"
echo "- Frontend: http://${PUBLIC_IP}:3000"
echo "- Backend API: http://${PUBLIC_IP}:5001"  
echo "- AI API: http://${PUBLIC_IP}:8000"

====================================

또한 보안 그룹에서 다음 포트를 열어주세요:
- 22 (SSH) - 현재 IP에서만
- 80 (HTTP)
- 443 (HTTPS)
- 3000 (Frontend)
- 5001 (Backend API)
- 8000 (AI API)

EOF