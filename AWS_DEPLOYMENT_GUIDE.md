# AWS 배포 가이드

## 배포 옵션별 추천

### Option 1: EC2 (추천 - Docker Compose 사용)
전체 스택을 하나의 EC2 인스턴스에 배포

### Option 2: ECS + RDS
프로덕션 환경에 적합한 확장 가능한 구조

### Option 3: Elastic Beanstalk
간단한 배포를 원할 때

---

## Option 1: EC2 배포 (추천)

### 1. EC2 인스턴스 생성
```
- AMI: Amazon Linux 2023 또는 Ubuntu 22.04
- Instance Type: t3.medium (최소) 또는 t3.large (권장)
- Storage: 30GB 이상
- Security Group:
  - SSH (22): Your IP
  - HTTP (80): 0.0.0.0/0
  - HTTPS (443): 0.0.0.0/0
  - Backend (5001): 0.0.0.0/0
  - AI API (8000): 0.0.0.0/0
```

### 2. EC2 접속 및 환경 설정
```bash
# EC2 접속
ssh -i your-key.pem ec2-user@your-ec2-ip

# 시스템 업데이트
sudo yum update -y  # Amazon Linux
# 또는
sudo apt update && sudo apt upgrade -y  # Ubuntu

# Docker 설치
sudo yum install docker git -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 재접속 (docker 그룹 적용)
exit
ssh -i your-key.pem ec2-user@your-ec2-ip
```

### 3. 프로젝트 클론 및 환경 변수 설정
```bash
# 프로젝트 클론
git clone https://github.com/ludia8888/pca-hijab.git
cd pca-hijab

# 환경 변수 파일 생성
cp .env.docker .env
nano .env  # 환경 변수 수정
```

### 4. 환경 변수 설정 (.env)
```env
# Database
POSTGRES_USER=pca_user
POSTGRES_PASSWORD=your-very-secure-password-here
POSTGRES_DB=pca_hijab

# Backend
NODE_ENV=production
ADMIN_API_KEY=your-secure-admin-key
SESSION_SECRET=your-secure-session-secret
CORS_ORIGINS=https://your-domain.com,http://your-ec2-ip

# Frontend (EC2 Public IP 또는 도메인)
VITE_BACKEND_URL=http://your-ec2-ip:5001
VITE_AI_API_URL=http://your-ec2-ip:8000
```

### 5. Docker Compose 실행
```bash
# 프로덕션 모드로 실행
docker-compose -f docker-compose.prod.yml up -d

# 상태 확인
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

### 6. 도메인 연결 (선택사항)

#### Route 53 사용
1. Route 53에서 호스팅 영역 생성
2. A 레코드 추가 (EC2 Elastic IP 연결)
3. 네임서버를 도메인 등록업체에 등록

#### Nginx SSL 설정 (Let's Encrypt)
```bash
# Certbot 설치
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# SSL 인증서 발급
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# docker-compose.yml 수정하여 SSL 볼륨 마운트
```

---

## Option 2: ECS + RDS 배포

### 1. RDS PostgreSQL 생성
```
- Engine: PostgreSQL 15
- Instance Class: db.t3.micro (개발) / db.t3.small (프로덕션)
- Storage: 20GB
- Multi-AZ: 프로덕션에서는 Yes
- VPC Security Group: Backend에서만 접근 가능
```

### 2. ECR 레포지토리 생성
```bash
# AWS CLI 설정
aws configure

# ECR 레포지토리 생성
aws ecr create-repository --repository-name pca-hijab-backend
aws ecr create-repository --repository-name pca-hijab-ai
aws ecr create-repository --repository-name pca-hijab-frontend

# Docker 이미지 빌드 및 푸시
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com

# 각 서비스별로 빌드 및 푸시
docker build -t pca-hijab-backend ./backend
docker tag pca-hijab-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com/pca-hijab-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com/pca-hijab-backend:latest
```

### 3. ECS 클러스터 및 서비스 생성
- Fargate 또는 EC2 launch type 선택
- Task Definition 생성 (각 서비스별)
- Application Load Balancer 설정
- Auto Scaling 설정

### 4. CloudFront 설정 (프론트엔드)
- S3 버킷에 React 빌드 파일 업로드
- CloudFront Distribution 생성
- 도메인 연결

---

## Option 3: Elastic Beanstalk 배포

### 1. EB CLI 설치
```bash
pip install awsebcli
```

### 2. Elastic Beanstalk 초기화
```bash
cd backend
eb init -p "Docker" -r ap-northeast-2 pca-hijab-backend
eb create pca-hijab-env
```

### 3. 환경 변수 설정
```bash
eb setenv NODE_ENV=production ADMIN_API_KEY=your-key DATABASE_URL=your-rds-url
```

---

## 보안 체크리스트

### 1. 네트워크 보안
- [ ] Security Group 최소 권한 설정
- [ ] Private Subnet에 데이터베이스 배치
- [ ] VPC 적절히 구성

### 2. 데이터 보안
- [ ] RDS 암호화 활성화
- [ ] S3 버킷 정책 검토
- [ ] 백업 자동화 설정

### 3. 애플리케이션 보안
- [ ] HTTPS 인증서 설정
- [ ] 환경 변수 안전하게 관리 (AWS Secrets Manager)
- [ ] IAM 역할 최소 권한 원칙

### 4. 모니터링
- [ ] CloudWatch 알람 설정
- [ ] 로그 수집 설정
- [ ] 비용 알림 설정

---

## 비용 예상 (서울 리전)

### EC2 단일 인스턴스
- t3.medium: ~$40/월
- EBS 30GB: ~$3/월
- 데이터 전송: 사용량에 따라

### ECS + RDS
- Fargate: 사용량에 따라 (~$50-100/월)
- RDS db.t3.micro: ~$15/월
- ALB: ~$20/월
- 데이터 전송: 사용량에 따라

### 추가 서비스
- Route 53: ~$0.5/월 per hosted zone
- CloudFront: 사용량에 따라
- S3: 저장 용량에 따라

---

## 트러블슈팅

### 메모리 부족
```bash
# Swap 메모리 추가 (EC2)
sudo dd if=/dev/zero of=/swapfile bs=1G count=4
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab
```

### 디스크 공간 부족
```bash
# Docker 정리
docker system prune -a
docker volume prune
```

### 연결 문제
- Security Group 규칙 확인
- 도커 네트워크 확인
- 환경 변수의 URL 확인

---

## 배포 후 작업

1. **모니터링 설정**
   - CloudWatch Dashboard 생성
   - 알람 설정 (CPU, Memory, Disk)

2. **백업 설정**
   - RDS 자동 백업
   - EBS 스냅샷 스케줄

3. **스케일링 준비**
   - Auto Scaling Group 설정
   - Load Balancer 구성

4. **보안 강화**
   - WAF 규칙 설정
   - DDoS 보호 활성화