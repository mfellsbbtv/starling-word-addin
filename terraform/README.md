# Terraform Infrastructure

AWS infrastructure configuration for the RHEI Word Add-in.

## Quick Deploy

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars as needed
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

## Configuration

**Frontend Only ($2-15/month):**
```hcl
enable_backend = false
enable_database = false
enable_custom_domain = false
```

**Full Stack ($100-250/month):**
```hcl
enable_backend = true
enable_database = true
domain_name = "word-addin.yourcompany.com"
```

## Resources Created

**Always:**
- S3 bucket for static hosting
- CloudFront CDN
- IAM roles

**Optional (if backend enabled):**
- VPC with public/private subnets
- ECS Fargate cluster
- Application Load Balancer
- RDS PostgreSQL database
- Route53 DNS (if custom domain)
