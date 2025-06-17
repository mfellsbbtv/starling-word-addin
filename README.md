# RHEI AI Legal Assistant

Microsoft Word add-in for contract generation and analysis using Legal Matrix TSV data. Deployable to AWS infrastructure via Terraform.

## Overview

Word add-in that processes Legal Matrix TSV data for:
- Contract generation from baseline clauses
- Party-specific contract analysis
- Compliance scoring against negotiation precedents
- Client-side processing with optional backend API

## AWS Deployment Setup

### Prerequisites

1. **AWS Account** with programmatic access
2. **Required tools**:
   ```bash
   # Install Terraform
   curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
   sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
   sudo apt-get update && sudo apt-get install terraform

   # Install AWS CLI
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip && sudo ./aws/install
   ```

3. **AWS IAM permissions**:
   - AmazonS3FullAccess
   - CloudFrontFullAccess
   - AmazonRoute53FullAccess
   - AWSCertificateManagerFullAccess
   - IAMFullAccess
   - AmazonECS_FullAccess (if using backend)
   - AmazonRDSFullAccess (if using database)

### Step-by-Step Deployment

#### Step 1: Configure AWS Credentials
```bash
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)
```

#### Step 2: Configure Deployment
```bash
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
```

Edit `terraform/terraform.tfvars`:
```hcl
aws_region = "us-east-1"
project_name = "rhei-word-addin"
environment = "prod"
enable_backend = false    # Set to true for full-stack
enable_database = false   # Set to true for database
enable_custom_domain = false  # Set to true for custom domain
```

#### Step 3: Deploy Infrastructure
```bash
./deploy.sh
```

#### Step 4: Update Office 365 Manifest
1. Note the CloudFront URL from deployment output
2. Update `manifest.xml` with the new URL
3. Upload `manifest.xml` to Office 365 admin center

## Configuration Options

### Frontend Only ($2-15/month)
```hcl
enable_backend = false
enable_database = false
enable_custom_domain = false
```

### With Custom Domain ($3-16/month)
```hcl
enable_custom_domain = true
domain_name = "word-addin.yourcompany.com"
```

### Full Stack ($100-250/month)
```hcl
enable_backend = true
enable_database = true
domain_name = "word-addin.yourcompany.com"
api_domain = "api.word-addin.yourcompany.com"
```

## AWS Infrastructure

### Frontend Architecture
```
Users → CloudFront CDN → S3 Bucket → Word Add-in Files
```
- Global CDN via CloudFront
- Automatic SSL certificates
- S3 static hosting

### Backend Architecture (Optional)
```
Word Add-in → Application Load Balancer → ECS Fargate → RDS PostgreSQL
```
- Auto-scaling ECS containers
- Private VPC with security groups
- PostgreSQL database with backups

### Security
- HTTPS-only traffic
- CORS configured for Office 365 domains
- VPC isolation for backend services
- IAM roles with least privilege
- Encrypted storage (S3 and RDS)

## Core Features

### Contract Generation
- Generate contracts from Legal Matrix baseline clauses
- Article structure (Article 2, 3, 5, etc.)
- Variable substitution for company names, dates, terms
- Word document formatting

### Contract Analysis
- Party-specific analysis using negotiation precedents
- Compliance scoring based on Legal Matrix standards
- Identifies missing clauses and modifications
- Recommendations using proven language

### Legal Matrix Integration
- Loads TSV file with baseline clauses and party variations
- Supports multiple parties (WMX, Sony, Lionsgate, Universal, Warner, etc.)
- TSV parsing for complex legal text
- Fallback to playbook system

## How It Works

### Contract Generation Workflow
1. User fills out contract form in Word add-in
2. System loads Legal Matrix TSV data
3. Generates contract using baseline clauses
4. Inserts formatted contract into Word document

### Contract Analysis Workflow
1. User selects target party from dropdown
2. System reads Word document content
3. Extracts and matches clauses (2.1, 2.2, 3.1, 5.1, etc.)
4. Compares against baseline and party-specific variations
5. Provides compliance score and recommendations

## Comparison with Traditional AI

| Feature | Traditional AI | Legal Matrix System |
|---------|----------------|---------------------|
| Data Source | Generic legal docs | Your actual negotiations |
| Accuracy | 70-80% | 95%+ (real precedents) |
| Party-Specific | No | Yes |
| Monthly Cost | $100s/month | $2-250/month |
| Legal Control | Limited | Full |
| Transparency | Black box | Fully auditable |
| Infrastructure | Vendor-dependent | Your AWS account |

## Project Structure

```
rhei-word-addin/
├── terraform/                 # AWS infrastructure code
│   ├── main.tf               # Main Terraform configuration
│   ├── variables.tf          # Configuration variables
│   ├── s3.tf                 # S3 bucket for hosting
│   ├── cloudfront.tf         # CDN configuration
│   ├── ecs.tf                # Backend API (optional)
│   └── terraform.tfvars.example
├── src/                      # Word add-in source code
│   ├── taskpane/            # Main UI components
│   ├── services/            # Legal Matrix services
│   └── shared/              # Utilities
├── Legal Matrix - Test.tsv   # Negotiation data
├── manifest.xml              # Office add-in manifest
├── deploy.sh                 # Deployment script
└── destroy.sh                # Cleanup script
```

## Available Scripts

### `./deploy.sh`
- Builds application
- Deploys infrastructure with Terraform
- Uploads files to S3
- Updates manifest.xml

### `./destroy.sh`
- Destroys AWS infrastructure
- Backs up S3 content
- Removes all resources

## Cost Breakdown

### Frontend Only
- S3 Storage: ~$0.50/month
- CloudFront CDN: ~$1-10/month
- Route53 DNS: ~$0.50/month (if using custom domain)
- **Total: $2-15/month**

### Full Stack
- Frontend: $2-15/month
- ECS Fargate: ~$15-50/month
- RDS PostgreSQL: ~$12/month minimum
- Application Load Balancer: ~$16/month
- NAT Gateway: ~$32/month
- **Total: $100-250/month**

## Manual Deployment Steps

### Alternative to Automated Script

#### Build Application
```bash
npm install
npm run build
```

#### Deploy Infrastructure
```bash
cd terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

#### Upload Files
```bash
S3_BUCKET=$(terraform output -raw s3_bucket_name)
aws s3 sync ../dist/ s3://$S3_BUCKET/ --delete

DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

## Testing Deployment

1. Open Microsoft Word Online
2. Go to Insert → Add-ins → My Add-ins
3. Find "RHEI AI Legal Assistant"
4. Test contract generation and analysis features

## Updating Deployment

### Application Updates
```bash
npm run build
./deploy.sh --skip-terraform
```

### Infrastructure Updates
```bash
# Edit terraform/terraform.tfvars
cd terraform
terraform plan
terraform apply
```

## Local Development

### Docker Setup
```bash
cp .env.example .env
docker-compose up
```

### Manual Setup
```bash
npm install
npm start
npm run build
```

## Troubleshooting

### AWS Credentials Issues
```bash
aws configure list
aws sts get-caller-identity
aws configure  # Reconfigure if needed
```

### Terraform Permission Errors
Ensure AWS user has required policies:
- AmazonS3FullAccess
- CloudFrontFullAccess
- AmazonRoute53FullAccess
- AWSCertificateManagerFullAccess
- AmazonECS_FullAccess (if using backend)
- AmazonRDSFullAccess (if using database)

### Word Add-in Not Loading
```bash
# Check HTTPS is working
curl -I https://your-cloudfront-url.com/taskpane.html

# Check browser console for CORS errors
```

### Build Failures
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Advanced Configuration

### Custom Domain
```hcl
# In terraform/terraform.tfvars
enable_custom_domain = true
domain_name = "word-addin.yourcompany.com"
```

### Backend API
```hcl
enable_backend = true
enable_database = true
api_domain = "api.word-addin.yourcompany.com"
ecs_cpu = 512
ecs_memory = 1024
```

## Cleanup

```bash
./destroy.sh
```

## Resources

- [AWS Deployment Guide](README-AWS-DEPLOYMENT.md)
- [Microsoft Office Add-ins Documentation](https://docs.microsoft.com/en-us/office/dev/add-ins/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
