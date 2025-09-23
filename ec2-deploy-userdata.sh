#!/bin/bash

# EC2 User Data 업데이트를 위한 스크립트
# AWS Console에서 실행해야 합니다

echo "====================================="
echo "EC2 자동 배포 설정"
echo "====================================="
echo ""
echo "AWS Console에서:"
echo "1. EC2 → 인스턴스 → i-07a1966aae519d0d8 선택"
echo "2. 인스턴스 상태 → 인스턴스 중지"
echo "3. 작업 → 인스턴스 설정 → 사용자 데이터 편집"
echo "4. 아래 스크립트 복사 후 붙여넣기"
echo "5. 저장 후 인스턴스 시작"
echo ""
echo "====================================="
echo "USER DATA 스크립트:"
echo "====================================="

cat << 'USERDATA'
#!/bin/bash

# 로그 설정
exec > >(tee -a /var/log/pca-deploy.log)
exec 2>&1

echo "PCA-HIJAB 자동 배포 시작: $(date)"

# Docker 설치
if ! command -v docker &> /dev/null; then
    yum update -y
    yum install -y docker git
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ec2-user
fi

# Docker Compose 설치
if [ ! -f /usr/local/bin/docker-compose ]; then
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 스왑 메모리 추가 (t3.micro)
if [ ! -f /swapfile ]; then
    dd if=/dev/zero of=/swapfile bs=1G count=2
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo "/swapfile none swap sw 0 0" >> /etc/fstab
fi

# 프로젝트 배포
cd /home/ec2-user
rm -rf pca-hijab
sudo -u ec2-user git clone https://github.com/ludia8888/pca-hijab.git
cd pca-hijab

# 환경 변수
cat > .env << 'EOF'
POSTGRES_USER=pca_user
POSTGRES_PASSWORD=pca_secure_2025
POSTGRES_DB=pca_hijab
NODE_ENV=production
PORT=5001
AI_API_URL=http://ai-api:8000
ADMIN_API_KEY=admin_key_2025
SESSION_SECRET=session_secret_2025
CORS_ORIGINS=http://13.209.22.8:3000,http://13.209.22.8
VITE_BACKEND_URL=http://13.209.22.8:5001
VITE_AI_API_URL=http://13.209.22.8:8000
EOF

chown ec2-user:ec2-user .env

# Docker Compose 실행
cd /home/ec2-user/pca-hijab
sudo -u ec2-user /usr/local/bin/docker-compose up -d

# 자동 시작 설정
cat > /etc/systemd/system/pca-hijab.service << 'SERVICE'
[Unit]
Description=PCA-HIJAB Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ec2-user/pca-hijab
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
User=ec2-user
Group=ec2-user

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable pca-hijab.service

echo "배포 완료: $(date)"
echo "서비스 URL:"
echo "- Frontend: http://13.209.22.8:3000"
echo "- Backend: http://13.209.22.8:5001"
echo "- AI API: http://13.209.22.8:8000"
USERDATA

echo ""
echo "====================================="
echo "또는 EC2 Instance Connect 사용:"
echo "====================================="
echo "1. Connect → EC2 Instance Connect → Connect"
echo "2. 터미널에서 실행:"
echo ""
echo "curl -fsSL https://raw.githubusercontent.com/ludia8888/pca-hijab/main/quick-deploy.sh | bash"
echo "====================================="