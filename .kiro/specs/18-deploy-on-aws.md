# AWS App Runner Deployment

## Prerequisites

- AWS Account with credits
- AWS CLI configured
- Docker installed (for local testing)

## Environment Variables

Create `.env.production`:

```
NODE_ENV=production
PORT=8080

# Database
DATABASE_URL=postgresql://user:pass@aurora-cluster.region.rds.amazonaws.com:5432/ghostpipes

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# VAPID
VAPID_PUBLIC_KEY=BG3xfz...
VAPID_PRIVATE_KEY=9i8h7g...
VAPID_SUBJECT=mailto:admin@ghostpipes.com

# AWS
AWS_REGION=us-east-1

# CORS
CORS_ORIGIN=chrome-extension://your-extension-id,https://ghostpipes.com
```

## Dockerfile

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY knexfile.js ./

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start server
CMD ["node", "src/server.js"]
```

## .dockerignore

```
node_modules
.env
.env.*
*.log
.git
.gitignore
README.md
rest.http
```

## Database Setup (Aurora PostgreSQL)

### 1. Create Aurora Cluster

```bash
aws rds create-db-cluster \
  --db-cluster-identifier ghostpipes-cluster \
  --engine aurora-postgresql \
  --engine-version 15.3 \
  --master-username admin \
  --master-user-password YourStrongPassword \
  --database-name ghostpipes \
  --db-subnet-group-name default \
  --vpc-security-group-ids sg-xxxxx \
  --serverless-v2-scaling-configuration MinCapacity=0.5,MaxCapacity=1 \
  --engine-mode provisioned
```

### 2. Create Instance

```bash
aws rds create-db-instance \
  --db-instance-identifier ghostpipes-instance \
  --db-cluster-identifier ghostpipes-cluster \
  --db-instance-class db.serverless \
  --engine aurora-postgresql
```

### 3. Run Migrations

```bash
# Locally, after setting DATABASE_URL
npm run migrate
```

## App Runner Deployment

### 1. Build and Push Docker Image to ECR

#### Create ECR Repository

```bash
aws ecr create-repository \
  --repository-name ghostpipes-backend \
  --region us-east-1
```

#### Build and Push

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t ghostpipes-backend .

# Tag image
docker tag ghostpipes-backend:latest \
  123456789012.dkr.ecr.us-east-1.amazonaws.com/ghostpipes-backend:latest

# Push image
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/ghostpipes-backend:latest
```

### 2. Create App Runner Service

#### apprunner.yaml

```yaml
version: 1.0
runtime: nodejs22
build:
  commands:
    build:
      - npm ci --only=production
run:
  command: node src/server.js
  network:
    port: 8080
  env:
    - name: NODE_ENV
      value: production
    - name: PORT
      value: 8080
```

#### Create Service via AWS CLI

```bash
aws apprunner create-service \
  --service-name ghostpipes-backend \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "123456789012.dkr.ecr.us-east-1.amazonaws.com/ghostpipes-backend:latest",
      "ImageRepositoryType": "ECR",
      "ImageConfiguration": {
        "Port": "8080",
        "RuntimeEnvironmentVariables": {
          "NODE_ENV": "production",
          "DATABASE_URL": "postgresql://...",
          "JWT_SECRET": "...",
          "VAPID_PUBLIC_KEY": "...",
          "VAPID_PRIVATE_KEY": "...",
          "VAPID_SUBJECT": "mailto:admin@ghostpipes.com"
        }
      }
    },
    "AutoDeploymentsEnabled": true
  }' \
  --instance-configuration '{
    "Cpu": "1 vCPU",
    "Memory": "2 GB"
  }' \
  --health-check-configuration '{
    "Protocol": "HTTP",
    "Path": "/health",
    "Interval": 10,
    "Timeout": 5,
    "HealthyThreshold": 1,
    "UnhealthyThreshold": 5
  }'
```

### 3. Get Service URL

```bash
aws apprunner describe-service \
  --service-arn arn:aws:apprunner:us-east-1:123456789012:service/ghostpipes-backend/xxxxx \
  --query 'Service.ServiceUrl' \
  --output text
```

## Custom Domain (Optional)

### 1. Associate Domain

```bash
aws apprunner associate-custom-domain \
  --service-arn arn:aws:apprunner:us-east-1:123456789012:service/ghostpipes-backend/xxxxx \
  --domain-name api.ghostpipes.com
```

### 2. Add CNAME Record

Add CNAME record in your DNS:

```
api.ghostpipes.com CNAME xxxxx.us-east-1.awsapprunner.com
```

## Health Check Endpoint

```javascript
// src/app.js
fastify.get("/health", async (request, reply) => {
	try {
		// Check database connection
		await fastify.knex.raw("SELECT 1");

		return {
			status: "healthy",
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			database: "connected",
		};
	} catch (error) {
		reply.code(503);
		return {
			status: "unhealthy",
			timestamp: new Date().toISOString(),
			error: error.message,
		};
	}
});
```

## Monitoring

### CloudWatch Logs

- Automatically captured by App Runner
- View in AWS Console: CloudWatch > Log Groups > /aws/apprunner/ghostpipes-backend

### Metrics to Monitor

- Request count
- Error rate
- Response time
- Database connections
- Memory usage
- CPU usage

## CI/CD (Optional)

### GitHub Actions Deployment

```yaml
name: Deploy to App Runner

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to ECR
        run: |
          aws ecr get-login-password --region us-east-1 | \
          docker login --username AWS --password-stdin \
          123456789012.dkr.ecr.us-east-1.amazonaws.com

      - name: Build and push image
        run: |
          docker build -t ghostpipes-backend .
          docker tag ghostpipes-backend:latest \
            123456789012.dkr.ecr.us-east-1.amazonaws.com/ghostpipes-backend:latest
          docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/ghostpipes-backend:latest

      - name: Deploy to App Runner
        run: |
          aws apprunner start-deployment \
            --service-arn arn:aws:apprunner:us-east-1:123456789012:service/ghostpipes-backend/xxxxx
```

## Cost Optimization

- Use Aurora Serverless v2 with min capacity 0.5 ACU
- App Runner scales to zero when idle
- Set max instances limit to control costs
- Monitor usage in AWS Cost Explorer
