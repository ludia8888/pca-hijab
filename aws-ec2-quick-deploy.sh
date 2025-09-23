#!/bin/bash

# PCA-HIJAB AWS EC2 배포 스크립트

# 1. 보안 그룹 생성 (이미 launch-wizard-1이 있다면 스킵)
echo "Creating security group..."
SECURITY_GROUP_ID=$(aws ec2 create-security-group \
    --group-name "pca-hijab-sg-$(date +%s)" \
    --description "Security group for PCA-HIJAB app" \
    --vpc-id "vpc-0fd2590480fbe18a5" \
    --query 'GroupId' \
    --output text 2>/dev/null)

# 보안 그룹이 이미 존재하면 기존 것 사용
if [ -z "$SECURITY_GROUP_ID" ]; then
    SECURITY_GROUP_ID="sg-preview-1"  # 제공하신 보안 그룹 ID
    echo "Using existing security group: $SECURITY_GROUP_ID"
else
    echo "Created new security group: $SECURITY_GROUP_ID"
fi

# 2. 보안 그룹 규칙 추가 (필요한 포트 모두 오픈)
echo "Adding security group rules..."

# SSH (22) - 이미 있을 수 있음
aws ec2 authorize-security-group-ingress \
    --group-id "$SECURITY_GROUP_ID" \
    --protocol tcp --port 22 --cidr 0.0.0.0/0 2>/dev/null

# HTTP (80)
aws ec2 authorize-security-group-ingress \
    --group-id "$SECURITY_GROUP_ID" \
    --protocol tcp --port 80 --cidr 0.0.0.0/0

# HTTPS (443)
aws ec2 authorize-security-group-ingress \
    --group-id "$SECURITY_GROUP_ID" \
    --protocol tcp --port 443 --cidr 0.0.0.0/0

# Frontend (3000)
aws ec2 authorize-security-group-ingress \
    --group-id "$SECURITY_GROUP_ID" \
    --protocol tcp --port 3000 --cidr 0.0.0.0/0

# Backend API (5001)
aws ec2 authorize-security-group-ingress \
    --group-id "$SECURITY_GROUP_ID" \
    --protocol tcp --port 5001 --cidr 0.0.0.0/0

# AI API (8000)
aws ec2 authorize-security-group-ingress \
    --group-id "$SECURITY_GROUP_ID" \
    --protocol tcp --port 8000 --cidr 0.0.0.0/0

# 3. User Data 스크립트 생성
cat > /tmp/pca-hijab-user-data.sh << 'EOF'
#!/bin/bash
# 로그 설정
exec > >(tee /var/log/user-data.log) 2>&1

# 시스템 업데이트
yum update -y

# Docker 설치
yum install -y docker git
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Docker Compose 설치
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-Linux-x86_64" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# 프로젝트 클론 및 설정
cd /home/ec2-user
sudo -u ec2-user git clone https://github.com/ludia8888/pca-hijab.git
cd pca-hijab

# 기본 환경 변수 설정
cat > .env << 'ENVFILE'
# Database
POSTGRES_USER=pca_user
POSTGRES_PASSWORD=pca_secure_password_2025
POSTGRES_DB=pca_hijab

# Backend
NODE_ENV=production
PORT=5001
ADMIN_API_KEY=admin_key_2025
SESSION_SECRET=session_secret_2025
CORS_ORIGINS=*

# AI API
AI_API_URL=http://ai-api:8000

# Frontend (나중에 Public IP로 교체 필요)
VITE_BACKEND_URL=http://localhost:5001
VITE_AI_API_URL=http://localhost:8000
ENVFILE

chown ec2-user:ec2-user .env

# Docker 준비 대기
sleep 10

# Docker Compose 실행 (백그라운드)
sudo -u ec2-user /usr/local/bin/docker-compose up -d

# 상태 메시지
echo "PCA-HIJAB deployment initiated. Check logs at /var/log/user-data.log"
EOF

# 4. EC2 인스턴스 생성 (수정된 버전)
echo "Creating EC2 instance..."
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id "ami-077ad873396d76f6a" \
    --instance-type "t3.medium" \
    --security-group-ids "$SECURITY_GROUP_ID" \
    --associate-public-ip-address \
    --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":30,"VolumeType":"gp3","DeleteOnTermination":true}}]' \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=pca-hijab-server}]' \
    --user-data file:///tmp/pca-hijab-user-data.sh \
    --metadata-options '{"HttpEndpoint":"enabled","HttpPutResponseHopLimit":2,"HttpTokens":"required"}' \
    --private-dns-name-options '{"HostnameType":"ip-name","EnableResourceNameDnsARecord":true,"EnableResourceNameDnsAAAARecord":false}' \
    --credit-specification '{"CpuCredits":"unlimited"}' \
    --count 1 \
    --query 'Instances[0].InstanceId' \
    --output text)

echo "Instance created: $INSTANCE_ID"

# 5. 인스턴스 실행 대기
echo "Waiting for instance to start..."
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID"

# 6. 퍼블릭 IP 가져오기
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids "$INSTANCE_ID" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

echo "========================================="
echo "✅ EC2 인스턴스가 생성되었습니다!"
echo "========================================="
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"
echo ""
echo "📌 다음 단계:"
echo "1. 약 5-10분 후 서비스가 시작됩니다"
echo "2. 브라우저에서 접속:"
echo "   - Frontend: http://$PUBLIC_IP:3000"
echo "   - Backend API: http://$PUBLIC_IP:5001"
echo "   - AI API: http://$PUBLIC_IP:8000"
echo ""
echo "3. SSH 접속 (키 파일이 있는 경우):"
echo "   ssh -i your-key.pem ec2-user@$PUBLIC_IP"
echo ""
echo "4. 로그 확인:"
echo "   ssh -i your-key.pem ec2-user@$PUBLIC_IP 'tail -f /var/log/user-data.log'"
echo "========================================="

# 환경 변수 업데이트 명령어 출력
echo ""
echo "🔧 환경 변수 업데이트가 필요한 경우:"
echo "ssh -i your-key.pem ec2-user@$PUBLIC_IP"
echo "cd /home/ec2-user/pca-hijab"
echo "nano .env"
echo "# VITE_BACKEND_URL과 VITE_AI_API_URL을 Public IP로 변경"
echo "docker-compose down && docker-compose up -d"