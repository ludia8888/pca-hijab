#!/bin/bash

# AWS EC2 인스턴스 생성 스크립트

# 변수 설정
SECURITY_GROUP_NAME="pca-hijab-sg"
VPC_ID="vpc-0fd2590480fbe18a5"
KEY_NAME="your-key-name"  # EC2 키페어 이름 설정 필요

# 1. 보안 그룹 생성
echo "Creating security group..."
SECURITY_GROUP_ID=$(aws ec2 create-security-group \
    --group-name "$SECURITY_GROUP_NAME" \
    --description "Security group for PCA-HIJAB application" \
    --vpc-id "$VPC_ID" \
    --query 'GroupId' \
    --output text)

echo "Security Group ID: $SECURITY_GROUP_ID"

# 2. 보안 그룹 규칙 추가
echo "Adding security group rules..."

# SSH (22)
aws ec2 authorize-security-group-ingress \
    --group-id "$SECURITY_GROUP_ID" \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0

# HTTP (80)
aws ec2 authorize-security-group-ingress \
    --group-id "$SECURITY_GROUP_ID" \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

# HTTPS (443)
aws ec2 authorize-security-group-ingress \
    --group-id "$SECURITY_GROUP_ID" \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0

# Frontend (3000)
aws ec2 authorize-security-group-ingress \
    --group-id "$SECURITY_GROUP_ID" \
    --protocol tcp \
    --port 3000 \
    --cidr 0.0.0.0/0

# Backend API (5001)
aws ec2 authorize-security-group-ingress \
    --group-id "$SECURITY_GROUP_ID" \
    --protocol tcp \
    --port 5001 \
    --cidr 0.0.0.0/0

# AI API (8000)
aws ec2 authorize-security-group-ingress \
    --group-id "$SECURITY_GROUP_ID" \
    --protocol tcp \
    --port 8000 \
    --cidr 0.0.0.0/0

# 3. EC2 인스턴스 생성
echo "Creating EC2 instance..."
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id "ami-077ad873396d76f6a" \
    --instance-type "t3.medium" \
    --key-name "$KEY_NAME" \
    --security-group-ids "$SECURITY_GROUP_ID" \
    --subnet-id "subnet-xxxxxxxx" \
    --associate-public-ip-address \
    --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":30,"VolumeType":"gp3"}}]' \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=pca-hijab-server}]" \
    --user-data file://user-data.sh \
    --query 'Instances[0].InstanceId' \
    --output text)

echo "Instance ID: $INSTANCE_ID"

# 4. 인스턴스가 실행될 때까지 대기
echo "Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID"

# 5. 퍼블릭 IP 가져오기
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids "$INSTANCE_ID" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

echo "Instance is running!"
echo "Public IP: $PUBLIC_IP"
echo "SSH: ssh -i $KEY_NAME.pem ec2-user@$PUBLIC_IP"