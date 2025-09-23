# EC2 배포 상태

## 🚀 배포 진행 상황

### ✅ 완료된 작업
1. **EC2 인스턴스 생성**: i-07a1966aae519d0d8 (13.209.22.8)
2. **보안 그룹 설정**: 포트 3000, 5001, 8000 오픈
3. **Docker & Docker Compose 설치**: 성공
4. **프로젝트 클론**: GitHub에서 다운로드 완료
5. **환경 변수 설정**: .env 파일 생성 완료
6. **스왑 메모리 추가**: 2GB 추가 (t3.micro 메모리 부족 해결)
7. **Docker 이미지 빌드**: 진행 중...

### 🔄 현재 상태
- Docker 이미지 빌드가 진행 중입니다 (약 10-15분 소요)
- t3.micro 인스턴스의 제한된 리소스로 인해 시간이 걸리고 있습니다

### 📋 다음 단계

1. **상태 확인** (몇 분 후):
```bash
ssh -i /Users/isihyeon/Downloads/keypair.pem ec2-user@13.209.22.8
cd pca-hijab
sudo docker-compose ps
```

2. **서비스가 실행 중이면 접속**:
- Frontend: http://13.209.22.8:3000
- Backend API: http://13.209.22.8:5001
- AI API: http://13.209.22.8:8000

3. **문제 해결**:

### 로그 확인
```bash
sudo docker-compose logs -f
```

### 서비스 재시작
```bash
sudo docker-compose down
sudo docker-compose up -d
```

### 리소스 확인
```bash
free -h
df -h
docker stats
```

## ⚠️ 알려진 이슈

1. **메모리 부족**: t3.micro는 1GB RAM만 제공
   - 해결: 2GB 스왑 메모리 추가됨
   - 권장: t3.small 이상으로 업그레이드

2. **빌드 시간**: 첫 빌드는 15-20분 소요될 수 있음
   - AI API (mediapipe, opencv 설치)
   - Frontend (node_modules)

3. **디스크 공간**: 8GB 중 약 50% 사용 중
   - 주기적인 Docker 정리 필요: `docker system prune -a`

## 🎯 성공 지표

모든 서비스가 "Up" 상태여야 함:
```
NAME                    IMAGE                    STATUS
pca-hijab-db-1         postgres:15-alpine       Up
pca-hijab-backend-1    pca-hijab-backend        Up
pca-hijab-ai-api-1     pca-hijab-ai-api        Up
pca-hijab-frontend-1   pca-hijab-frontend      Up
```

## 📞 추가 지원

배포가 완료되지 않으면:
1. EC2 인스턴스 타입을 t3.small로 업그레이드
2. 또는 ECS/Fargate 같은 관리형 서비스 고려
3. 또는 각 서비스를 별도로 배포 (Vercel + Render 등)