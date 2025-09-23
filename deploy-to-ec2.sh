#!/bin/bash

# EC2 정보
EC2_PUBLIC_IP="13.209.22.8"
KEY_FILE="/Users/isihyeon/Downloads/keypair.pem"

echo "🚀 PCA-HIJAB EC2 배포 시작"
echo "=================================="

# 1. 보안 그룹에 필요한 포트 추가
echo "1️⃣ 보안 그룹 포트 오픈 중..."

# 현재 인스턴스의 보안 그룹 ID 가져오기
SECURITY_GROUP_ID=$(aws ec2 describe-instances \
    --instance-ids i-07a1966aae519d0d8 \
    --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
    --output text)

echo "보안 그룹 ID: $SECURITY_GROUP_ID"

# 필요한 포트들 오픈
aws ec2 authorize-security-group-ingress --group-id "$SECURITY_GROUP_ID" --protocol tcp --port 80 --cidr 0.0.0.0/0 2>/dev/null
aws ec2 authorize-security-group-ingress --group-id "$SECURITY_GROUP_ID" --protocol tcp --port 443 --cidr 0.0.0.0/0 2>/dev/null
aws ec2 authorize-security-group-ingress --group-id "$SECURITY_GROUP_ID" --protocol tcp --port 3000 --cidr 0.0.0.0/0 2>/dev/null
aws ec2 authorize-security-group-ingress --group-id "$SECURITY_GROUP_ID" --protocol tcp --port 5001 --cidr 0.0.0.0/0 2>/dev/null
aws ec2 authorize-security-group-ingress --group-id "$SECURITY_GROUP_ID" --protocol tcp --port 8000 --cidr 0.0.0.0/0 2>/dev/null

echo "✅ 포트 오픈 완료 (22, 80, 443, 3000, 5001, 8000)"

# 2. 설치 스크립트 생성
cat > setup-pca-hijab.sh << 'EOF'
#!/bin/bash

# 로그 설정
exec > >(tee -a /home/ec2-user/setup.log)
exec 2>&1

echo "Starting PCA-HIJAB setup at $(date)"

# 시스템 업데이트
echo "Updating system..."
sudo yum update -y

# Docker 설치
echo "Installing Docker..."
sudo yum install -y docker git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Docker Compose 설치
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 메모리 스왑 추가 (t3.micro는 메모리가 적음)
echo "Adding swap memory..."
sudo dd if=/dev/zero of=/swapfile bs=1G count=2
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab

# 프로젝트 클론
echo "Cloning project..."
cd /home/ec2-user
rm -rf pca-hijab
git clone https://github.com/ludia8888/pca-hijab.git
cd pca-hijab

# 환경 변수 설정
echo "Setting up environment variables..."
cat > .env << ENVFILE
# Database
POSTGRES_USER=pca_user
POSTGRES_PASSWORD=pca_secure_password_2025
POSTGRES_DB=pca_hijab

# Backend
NODE_ENV=production
PORT=5001
AI_API_URL=http://ai-api:8000
ADMIN_API_KEY=admin_key_2025
SESSION_SECRET=session_secret_2025
CORS_ORIGINS=http://$EC2_PUBLIC_IP:3000,http://$EC2_PUBLIC_IP,https://$EC2_PUBLIC_IP

# Frontend
VITE_BACKEND_URL=http://$EC2_PUBLIC_IP:5001
VITE_AI_API_URL=http://$EC2_PUBLIC_IP:8000
ENVFILE

# Docker 그룹 적용을 위해 새 셸에서 실행
echo "Starting Docker Compose..."
sg docker -c "docker-compose up -d"

echo "Setup completed at $(date)"
echo "Waiting for services to start..."
sleep 30

# 서비스 상태 확인
sg docker -c "docker-compose ps"

echo "=================================="
echo "✅ 배포 완료!"
echo "Frontend: http://$EC2_PUBLIC_IP:3000"
echo "Backend API: http://$EC2_PUBLIC_IP:5001"
echo "AI API: http://$EC2_PUBLIC_IP:8000"
echo "=================================="
EOF

# 3. EC2에 스크립트 복사 및 실행
echo ""
echo "2️⃣ EC2에 연결하여 설치 중..."
echo "키 파일 경로를 확인하세요: $KEY_FILE"
echo ""

# 키 파일 권한 설정
chmod 400 $KEY_FILE 2>/dev/null

# 스크립트 복사 및 실행
scp -o StrictHostKeyChecking=no -i $KEY_FILE setup-pca-hijab.sh ec2-user@$EC2_PUBLIC_IP:~/
ssh -o StrictHostKeyChecking=no -i $KEY_FILE ec2-user@$EC2_PUBLIC_IP "chmod +x setup-pca-hijab.sh && export EC2_PUBLIC_IP=$EC2_PUBLIC_IP && ./setup-pca-hijab.sh"

echo ""
echo "=================================="
echo "🎉 배포 프로세스 완료!"
echo "=================================="
echo ""
echo "📌 접속 정보:"
echo "- Frontend: http://$EC2_PUBLIC_IP:3000"
echo "- Backend API: http://$EC2_PUBLIC_IP:5001"
echo "- AI API: http://$EC2_PUBLIC_IP:8000"
echo "- Admin Panel: http://$EC2_PUBLIC_IP:3000/admin"
echo ""
echo "📌 SSH 접속:"
echo "ssh -i $KEY_FILE ec2-user@$EC2_PUBLIC_IP"
echo ""
echo "📌 로그 확인:"
echo "ssh -i $KEY_FILE ec2-user@$EC2_PUBLIC_IP 'cd pca-hijab && docker-compose logs -f'"
echo ""
echo "⚠️  주의: t3.micro는 메모리가 적어서 초기 로딩이 느릴 수 있습니다."
echo "=================================="