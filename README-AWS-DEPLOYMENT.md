# RHEI Word Add-in AWS Deployment Guide

This guide provides comprehensive instructions for deploying the RHEI AI Legal Assistant Word add-in to AWS using Terraform.

## 🏗️ Architecture Overview

The Terraform configuration creates a scalable, secure infrastructure for hosting your Word add-in:

### **Static Frontend (Always Deployed)**
- **S3 Bucket**: Hosts the Word add-in static files (HTML, CSS, JS)
- **CloudFront CDN**: Global content delivery with HTTPS
- **Route53 DNS**: Custom domain support (optional)
- **ACM SSL Certificates**: Automatic SSL certificate management

### **Backend API (Optional)**
- **ECS Fargate**: Containerized FastAPI backend
- **Application Load Balancer**: HTTPS load balancing
- **RDS PostgreSQL**: Database for contract data
- **VPC**: Secure network isolation
- **Auto Scaling**: Automatic scaling based on demand

## 📋 Prerequisites

### Required Tools
```bash
# Install Terraform
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install

# Verify Node.js/npm (should already be installed)
node --version && npm --version
```

### AWS Configuration
```bash
# Configure AWS credentials
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and region
```

### Required AWS Permissions
Your AWS user/role needs these permissions:
- S3: Full access for bucket management
- CloudFront: Full access for CDN management
- Route53: Full access for DNS (if using custom domain)
- ACM: Full access for SSL certificates
- ECS: Full access (if deploying backend)
- RDS: Full access (if deploying database)
- VPC: Full access (if deploying backend)
- IAM: Full access for role creation

## 🚀 Quick Start Deployment

### 1. Configure Your Deployment
```bash
# Copy the example configuration
cp terraform/terraform.tfvars.example terraform/terraform.tfvars

# Edit the configuration file
nano terraform/terraform.tfvars
```

### 2. Deploy with the Automated Script
```bash
# Deploy everything (frontend only by default)
./deploy.sh

# Or deploy with backend enabled (edit terraform.tfvars first)
./deploy.sh

# Plan only (don't apply changes)
./deploy.sh --plan-only

# Skip building (if already built)
./deploy.sh --skip-build
```

### 3. Update Your Manifest
After deployment, update your `manifest.xml` with the new URLs provided in the output.

## ⚙️ Configuration Options

### Basic Configuration (terraform.tfvars)
```hcl
# Basic settings
aws_region   = "us-east-1"
project_name = "rhei-word-addin"
environment  = "prod"

# Frontend only (minimal cost)
enable_backend  = false
enable_database = false
enable_custom_domain = false

# Custom domain (optional)
enable_custom_domain = true
domain_name = "word-addin.yourcompany.com"
```

### Full Stack Configuration
```hcl
# Enable all features
enable_backend  = true
enable_database = true
enable_custom_domain = true

# Domain configuration
domain_name = "word-addin.yourcompany.com"
api_domain  = "api.word-addin.yourcompany.com"

# Backend sizing
ecs_cpu           = 512
ecs_memory        = 1024
ecs_desired_count = 2

# Database configuration
db_instance_class = "db.t3.small"
db_allocated_storage = 100
```

## 🔧 Manual Deployment Steps

If you prefer manual deployment or need more control:

### 1. Initialize Terraform
```bash
cd terraform
terraform init
terraform validate
```

### 2. Plan the Deployment
```bash
terraform plan -out=tfplan
```

### 3. Apply the Infrastructure
```bash
terraform apply tfplan
```

### 4. Build and Deploy Application
```bash
# Build the Word add-in
npm run build

# Get S3 bucket name
S3_BUCKET=$(terraform output -raw s3_bucket_name)

# Upload files
aws s3 sync ../dist/ s3://$S3_BUCKET/ --delete

# Invalidate CloudFront cache
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

## 📊 Cost Estimation

### Frontend Only (Minimal)
- **S3**: ~$1-5/month (depending on usage)
- **CloudFront**: ~$1-10/month (depending on traffic)
- **Route53**: ~$0.50/month per hosted zone (if using custom domain)
- **Total**: ~$2-15/month

### Full Stack (Backend + Database)
- **Frontend**: ~$2-15/month
- **ECS Fargate**: ~$15-50/month (depending on size and usage)
- **RDS**: ~$15-100/month (depending on instance size)
- **Load Balancer**: ~$20/month
- **NAT Gateway**: ~$45/month
- **Total**: ~$100-250/month

## 🔒 Security Features

### Built-in Security
- **HTTPS Everywhere**: All traffic encrypted with SSL/TLS
- **VPC Isolation**: Backend services in private subnets
- **Security Groups**: Restrictive firewall rules
- **IAM Roles**: Least privilege access
- **Secrets Management**: Database credentials in AWS Secrets Manager
- **Encryption**: S3 and RDS encryption at rest

### Office Add-in Security
- **CORS Configuration**: Properly configured for Office domains
- **Content Security Policy**: Implemented via CloudFront headers
- **Origin Validation**: Restricted to Office 365 domains

## 🔍 Monitoring and Logging

### CloudWatch Integration
- **Application Logs**: ECS task logs in CloudWatch
- **Database Logs**: RDS logs in CloudWatch
- **Access Logs**: S3 and CloudFront access logs
- **Metrics**: CPU, memory, and custom application metrics

### Alarms and Notifications
- **High CPU/Memory**: ECS and RDS monitoring
- **Error Rates**: CloudFront 4xx/5xx error monitoring
- **Certificate Expiry**: SSL certificate expiration alerts
- **Health Checks**: Application and database health monitoring

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy Word Add-in
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Build application
        run: npm run build
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }}/ --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

## 🛠️ Maintenance and Updates

### Application Updates
```bash
# Build new version
npm run build

# Deploy to S3
aws s3 sync dist/ s3://your-bucket-name/ --delete

# Invalidate cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Infrastructure Updates
```bash
# Update Terraform configuration
nano terraform/terraform.tfvars

# Plan and apply changes
cd terraform
terraform plan
terraform apply
```

### Database Maintenance
```bash
# Connect to database via bastion host
aws ssm start-session --target BASTION_INSTANCE_ID

# Or use RDS proxy for connection pooling
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Terraform Apply Fails
```bash
# Check AWS credentials
aws sts get-caller-identity

# Verify permissions
aws iam get-user

# Check Terraform state
terraform state list
```

#### 2. Word Add-in Not Loading
- Verify HTTPS URLs in manifest.xml
- Check CORS configuration in S3/CloudFront
- Validate manifest.xml format
- Check browser console for errors

#### 3. Backend API Issues
```bash
# Check ECS service status
aws ecs describe-services --cluster CLUSTER_NAME --services SERVICE_NAME

# View logs
aws logs tail /ecs/rhei-word-addin-prod-api --follow

# Check load balancer health
aws elbv2 describe-target-health --target-group-arn TARGET_GROUP_ARN
```

### Getting Help
1. Check CloudWatch logs for detailed error messages
2. Review Terraform state for resource status
3. Use AWS CLI to inspect resource configurations
4. Check the GitHub repository for known issues

## 📚 Additional Resources

- [Microsoft Office Add-ins Documentation](https://docs.microsoft.com/en-us/office/dev/add-ins/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Office Add-in Security Best Practices](https://docs.microsoft.com/en-us/office/dev/add-ins/concepts/privacy-and-security)

## 🤝 Support

For deployment issues or questions:
1. Check the troubleshooting section above
2. Review AWS CloudWatch logs
3. Consult the Terraform documentation
4. Contact your AWS support team for infrastructure issues
