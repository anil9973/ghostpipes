#!/bin/bash
# GhostPipes AWS Infrastructure Setup
# This script provisions all AWS resources needed for the backend

set -e

# Configuration
PROJECT_NAME="ghostpipes"
REGION="us-east-1"
STAGE="prod"

echo "🦇 GhostPipes AWS Setup"
echo "======================="
echo "Region: $REGION"
echo "Stage: $STAGE"
echo ""

# ============================================
# 1. CREATE AURORA SERVERLESS V2 CLUSTER
# ============================================
echo "📊 Creating Aurora PostgreSQL Serverless v2 Cluster..."

DB_CLUSTER_ID="${PROJECT_NAME}-cluster-${STAGE}"
DB_SUBNET_GROUP="${PROJECT_NAME}-db-subnet-${STAGE}"
DB_SECURITY_GROUP="${PROJECT_NAME}-db-sg-${STAGE}"

# Create DB subnet group (requires VPC setup)
aws rds create-db-subnet-group \
  --db-subnet-group-name $DB_SUBNET_GROUP \
  --db-subnet-group-description "Subnet group for GhostPipes Aurora cluster" \
  --subnet-ids subnet-xxx subnet-yyy \
  --region $REGION

# Create security group for Aurora
VPC_ID=$(aws ec2 describe-vpcs --region $REGION --query 'Vpcs[0].VpcId' --output text)
SG_ID=$(aws ec2 create-security-group \
  --group-name $DB_SECURITY_GROUP \
  --description "Security group for GhostPipes Aurora" \
  --vpc-id $VPC_ID \
  --region $REGION \
  --query 'GroupId' \
  --output text)

# Allow PostgreSQL access from application security group
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 5432 \
  --source-group $APP_SECURITY_GROUP \
  --region $REGION

# Create Aurora Serverless v2 cluster
aws rds create-db-cluster \
  --db-cluster-identifier $DB_CLUSTER_ID \
  --engine aurora-postgresql \
  --engine-version 15.4 \
  --master-username postgres \
  --master-user-password "${DB_PASSWORD:-ChangeMe123!}" \
  --db-subnet-group-name $DB_SUBNET_GROUP \
  --vpc-security-group-ids $SG_ID \
  --serverless-v2-scaling-configuration MinCapacity=0.5,MaxCapacity=1 \
  --enable-http-endpoint \
  --backup-retention-period 7 \
  --region $REGION

# Create Aurora instance
aws rds create-db-instance \
  --db-instance-identifier "${DB_CLUSTER_ID}-instance-1" \
  --db-instance-class db.serverless \
  --engine aurora-postgresql \
  --db-cluster-identifier $DB_CLUSTER_ID \
  --region $REGION

echo "✅ Aurora cluster created: $DB_CLUSTER_ID"

# Wait for cluster to be available
echo "⏳ Waiting for cluster to be available (this may take 5-10 minutes)..."
aws rds wait db-cluster-available \
  --db-cluster-identifier $DB_CLUSTER_ID \
  --region $REGION

# Get cluster endpoint
DB_ENDPOINT=$(aws rds describe-db-clusters \
  --db-cluster-identifier $DB_CLUSTER_ID \
  --region $REGION \
  --query 'DBClusters[0].Endpoint' \
  --output text)

echo "✅ Database endpoint: $DB_ENDPOINT"

# ============================================
# 2. CREATE SNS TOPIC FOR WEBHOOK EVENTS
# ============================================
echo "📢 Creating SNS topic for webhook events..."

SNS_TOPIC_ARN=$(aws sns create-topic \
  --name "${PROJECT_NAME}-webhook-events-${STAGE}" \
  --region $REGION \
  --query 'TopicArn' \
  --output text)

echo "✅ SNS Topic created: $SNS_TOPIC_ARN"

# ============================================
# 3. CREATE SQS QUEUE FOR PIPELINE JOBS
# ============================================
echo "📬 Creating SQS queue for pipeline execution..."

SQS_QUEUE_URL=$(aws sqs create-queue \
  --queue-name "${PROJECT_NAME}-pipeline-jobs-${STAGE}" \
  --attributes VisibilityTimeout=300,MessageRetentionPeriod=86400 \
  --region $REGION \
  --query 'QueueUrl' \
  --output text)

echo "✅ SQS Queue created: $SQS_QUEUE_URL"

# ============================================
# 4. CREATE IAM ROLE FOR ELASTIC BEANSTALK
# ============================================
echo "🔐 Creating IAM role for application..."

ROLE_NAME="${PROJECT_NAME}-app-role-${STAGE}"

# Create IAM role
aws iam create-role \
  --role-name $ROLE_NAME \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ec2.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }' \
  --region $REGION

# Attach policies
aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier

aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess

aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/AmazonSNSFullAccess

aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/AmazonSQSFullAccess

# Create instance profile
aws iam create-instance-profile \
  --instance-profile-name "${ROLE_NAME}-profile"

aws iam add-role-to-instance-profile \
  --instance-profile-name "${ROLE_NAME}-profile" \
  --role-name $ROLE_NAME

echo "✅ IAM role created: $ROLE_NAME"

# ============================================
# 5. CREATE ELASTIC BEANSTALK APPLICATION
# ============================================
echo "🚀 Creating Elastic Beanstalk application..."

EB_APP_NAME="${PROJECT_NAME}-api"
EB_ENV_NAME="${PROJECT_NAME}-api-${STAGE}"

aws elasticbeanstalk create-application \
  --application-name $EB_APP_NAME \
  --description "GhostPipes Visual Automation API" \
  --region $REGION

# Create environment
aws elasticbeanstalk create-environment \
  --application-name $EB_APP_NAME \
  --environment-name $EB_ENV_NAME \
  --solution-stack-name "64bit Amazon Linux 2023 v6.1.0 running Node.js 20" \
  --tier Name=WebServer,Type=Standard \
  --option-settings \
    Namespace=aws:autoscaling:launchconfiguration,OptionName=IamInstanceProfile,Value="${ROLE_NAME}-profile" \
    Namespace=aws:elasticbeanstalk:environment,OptionName=EnvironmentType,Value=LoadBalanced \
    Namespace=aws:autoscaling:asg,OptionName=MinSize,Value=1 \
    Namespace=aws:autoscaling:asg,OptionName=MaxSize,Value=4 \
    Namespace=aws:elasticbeanstalk:environment:process:default,OptionName=HealthCheckPath,Value=/health \
  --region $REGION

echo "✅ Elastic Beanstalk environment created: $EB_ENV_NAME"

# ============================================
# 6. STORE SECRETS IN AWS SECRETS MANAGER
# ============================================
echo "🔒 Storing secrets in AWS Secrets Manager..."

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32)

aws secretsmanager create-secret \
  --name "${PROJECT_NAME}/${STAGE}/app-secrets" \
  --secret-string "{
    \"DB_HOST\": \"$DB_ENDPOINT\",
    \"DB_USER\": \"postgres\",
    \"DB_PASSWORD\": \"${DB_PASSWORD:-ChangeMe123!}\",
    \"DB_NAME\": \"ghostpipes\",
    \"JWT_SECRET\": \"$JWT_SECRET\",
    \"SNS_TOPIC_ARN\": \"$SNS_TOPIC_ARN\",
    \"SQS_QUEUE_URL\": \"$SQS_QUEUE_URL\"
  }" \
  --region $REGION

echo "✅ Secrets stored in Secrets Manager"

# ============================================
# 7. CONFIGURE ENVIRONMENT VARIABLES
# ============================================
echo "⚙️  Configuring Elastic Beanstalk environment variables..."

aws elasticbeanstalk update-environment \
  --environment-name $EB_ENV_NAME \
  --option-settings \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=NODE_ENV,Value=production \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=DB_HOST,Value=$DB_ENDPOINT \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=DB_PORT,Value=5432 \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=DB_NAME,Value=ghostpipes \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=DB_SSL,Value=true \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=AWS_REGION,Value=$REGION \
  --region $REGION

echo "✅ Environment variables configured"

# ============================================
# 8. SETUP DATABASE SCHEMA
# ============================================
echo "📋 Setting up database schema..."

# Install psql if not available
if ! command -v psql &> /dev/null; then
  echo "Installing PostgreSQL client..."
  sudo yum install -y postgresql15
fi

# Connect and run migrations
echo "Running database migrations..."
PGPASSWORD="${DB_PASSWORD:-ChangeMe123!}" psql \
  -h $DB_ENDPOINT \
  -U postgres \
  -d postgres \
  -f ../db/schema.sql

echo "✅ Database schema created"

# ============================================
# 9. GENERATE VAPID KEYS FOR WEB PUSH
# ============================================
echo "🔑 Generating VAPID keys for Web Push..."

npx web-push generate-vapid-keys --json > vapid-keys.json

VAPID_PUBLIC=$(cat vapid-keys.json | grep publicKey | cut -d'"' -f4)
VAPID_PRIVATE=$(cat vapid-keys.json | grep privateKey | cut -d'"' -f4)

# Update environment with VAPID keys
aws elasticbeanstalk update-environment \
  --environment-name $EB_ENV_NAME \
  --option-settings \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=VAPID_PUBLIC_KEY,Value=$VAPID_PUBLIC \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=VAPID_PRIVATE_KEY,Value=$VAPID_PRIVATE \
  --region $REGION

echo "✅ VAPID keys configured"
echo "📋 Public VAPID Key (add to extension): $VAPID_PUBLIC"

# ============================================
# 10. DEPLOY APPLICATION
# ============================================
echo "📦 Creating deployment package..."

cd ../
zip -r ghostpipes-api.zip . -x "*.git*" "node_modules/*" "*.env*"

# Create application version
aws elasticbeanstalk create-application-version \
  --application-name $EB_APP_NAME \
  --version-label v1.0.0 \
  --source-bundle S3Bucket="${PROJECT_NAME}-deployments",S3Key="ghostpipes-api.zip" \
  --region $REGION

# Deploy to environment
aws elasticbeanstalk update-environment \
  --environment-name $EB_ENV_NAME \
  --version-label v1.0.0 \
  --region $REGION

echo "✅ Application deployed"

# ============================================
# SUMMARY
# ============================================
echo ""
echo "🎉 AWS Infrastructure Setup Complete!"
echo "======================================"
echo ""
echo "📊 Aurora Cluster: $DB_CLUSTER_ID"
echo "   Endpoint: $DB_ENDPOINT"
echo ""
echo "🚀 Elastic Beanstalk: $EB_ENV_NAME"
echo "   URL: http://${EB_ENV_NAME}.elasticbeanstalk.com"
echo ""
echo "📢 SNS Topic: $SNS_TOPIC_ARN"
echo "📬 SQS Queue: $SQS_QUEUE_URL"
echo ""
echo "🔑 VAPID Public Key: $VAPID_PUBLIC"
echo ""
echo "Next Steps:"
echo "1. Update CORS_ORIGIN in .env with your extension ID"
echo "2. Test API: curl http://${EB_ENV_NAME}.elasticbeanstalk.com/health"
echo "3. Run database migrations if not auto-applied"
echo "4. Configure custom domain (optional)"
echo ""
echo "🎃 Ready for Kiroween Hackathon submission!"