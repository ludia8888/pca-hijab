# PCA-HIJAB EC2 수동 배포 가이드

EC2 인스턴스: 13.209.22.8 (i-07a1966aae519d0d8)

## 1단계: 보안 그룹 포트 열기

AWS Console에서 또는 AWS CLI로 다음 포트를 열어주세요:

```bash
# 보안 그룹 ID 확인
SECURITY_GROUP_ID=$(aws ec2 describe-instances --instance-ids i-07a1966aae519d0d8 --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' --output text)

# 포트 열기
aws ec2 authorize-security-group-ingress --group-id "$SECURITY_GROUP_ID" --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id "$SECURITY_GROUP_ID" --protocol tcp --port 443 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id "$SECURITY_GROUP_ID" --protocol tcp --port 3000 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id "$SECURITY_GROUP_ID" --protocol tcp --port 5001 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id "$SECURITY_GROUP_ID" --protocol tcp --port 8000 --cidr 0.0.0.0/0
```

## 2단계: EC2 SSH 접속

```bash
ssh -i /Users/isihyeon/Downloads/keypair.pem ec2-user@13.209.22.8
```

## 3단계: EC2에서 설치 명령 실행

SSH 접속 후 다음 명령들을 순서대로 실행:

### 3.1 시스템 업데이트 및 Docker 설치
```bash
# 시스템 업데이트
sudo yum update -y

# Docker 설치
sudo yum install -y docker git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3.2 메모리 스왑 추가 (t3.micro 용)
```bash
# 2GB 스왑 파일 생성
sudo dd if=/dev/zero of=/swapfile bs=1G count=2
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab
```

### 3.3 재접속 (Docker 그룹 적용)
```bash
exit
```

다시 접속:
```bash
ssh -i /Users/isihyeon/Downloads/keypair.pem ec2-user@13.209.22.8
```

### 3.4 프로젝트 클론 및 환경 설정
```bash
# 프로젝트 클론
git clone https://github.com/ludia8888/pca-hijab.git
cd pca-hijab

# 환경 변수 파일 생성
cat > .env << 'EOF'
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
CORS_ORIGINS=http://13.209.22.8:3000,http://13.209.22.8,https://13.209.22.8

# Frontend
VITE_BACKEND_URL=http://13.209.22.8:5001
VITE_AI_API_URL=http://13.209.22.8:8000
EOF
```

### 3.5 Docker Compose 실행
```bash
# 백그라운드에서 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

## 4단계: 서비스 확인

약 5-10분 후 다음 URL로 접속:

- Frontend: http://13.209.22.8:3000
- Backend API: http://13.209.22.8:5001
- AI API: http://13.209.22.8:8000
- Admin Panel: http://13.209.22.8:3000/admin/login

## 문제 해결

### Docker 명령이 권한 문제로 실행 안 될 때:
```bash
sudo docker-compose up -d
```

### 서비스 재시작:
```bash
docker-compose down
docker-compose up -d
```

### 로그 확인:
```bash
docker-compose logs backend-api
docker-compose logs ai-api
docker-compose logs db
```

### 리소스 확인:
```bash
docker stats
free -h
df -h
```