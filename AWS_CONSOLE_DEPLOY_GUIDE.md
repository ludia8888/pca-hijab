# AWS Console을 통한 PCA-HIJAB 배포 가이드

현재 SSH 접속이 안 되고 있으므로 AWS Console을 통해 배포합니다.

## 1단계: 보안 그룹 설정

1. AWS EC2 Console 접속
2. 왼쪽 메뉴에서 "Security Groups" 클릭
3. 인스턴스의 보안 그룹 찾기 (sg-로 시작)
4. "Edit inbound rules" 클릭
5. 다음 규칙 추가:

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|---------|-------------|
| SSH | TCP | 22 | My IP | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 | Frontend |
| Custom TCP | TCP | 5001 | 0.0.0.0/0 | Backend API |
| Custom TCP | TCP | 8000 | 0.0.0.0/0 | AI API |

## 2단계: EC2 Connect를 통한 접속

1. EC2 Instances 페이지에서 인스턴스 선택
2. "Connect" 버튼 클릭
3. "EC2 Instance Connect" 탭 선택
4. "Connect" 클릭

## 3단계: 터미널에서 명령 실행

EC2 Instance Connect 터미널에서 다음 명령을 복사해서 실행:

```bash
# 1. 배포 스크립트 다운로드 및 실행
curl -o deploy.sh https://raw.githubusercontent.com/ludia8888/pca-hijab/main/quick-deploy.sh
chmod +x deploy.sh
./deploy.sh
```

또는 수동으로:

```bash
# 1. Docker 설치
sudo yum update -y
sudo yum install -y docker git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# 2. Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. 프로젝트 클론
cd ~
git clone https://github.com/ludia8888/pca-hijab.git
cd pca-hijab

# 4. 환경 변수 설정
PUBLIC_IP=13.209.22.8
cat > .env << EOF
POSTGRES_USER=pca_user
POSTGRES_PASSWORD=pca_pass_2025
POSTGRES_DB=pca_hijab
NODE_ENV=production
PORT=5001
AI_API_URL=http://ai-api:8000
ADMIN_API_KEY=admin_2025
SESSION_SECRET=session_2025
CORS_ORIGINS=http://${PUBLIC_IP}:3000
VITE_BACKEND_URL=http://${PUBLIC_IP}:5001
VITE_AI_API_URL=http://${PUBLIC_IP}:8000
EOF

# 5. Docker Compose 실행
sudo docker-compose up -d

# 6. 상태 확인
sudo docker-compose ps
```

## 4단계: 서비스 확인

배포 완료 후 접속:
- Frontend: http://13.209.22.8:3000
- Backend API: http://13.209.22.8:5001
- AI API: http://13.209.22.8:8000

## 문제 해결

### 메모리 부족 시:
```bash
# 스왑 메모리 추가
sudo dd if=/dev/zero of=/swapfile bs=1G count=2
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab
```

### 로그 확인:
```bash
sudo docker-compose logs -f
```

### 서비스 재시작:
```bash
sudo docker-compose restart
```