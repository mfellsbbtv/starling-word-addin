# Terraform Infrastructure for RHEI Word Add-in

This directory contains the Terraform configuration for deploying the RHEI Word Add-in to AWS.

## 📁 **File Structure**

```
terraform/
├── main.tf                    # Main configuration and providers
├── variables.tf               # Input variables and their descriptions
├── outputs.tf                 # Output values after deployment
├── s3.tf                     # S3 bucket for static hosting
├── cloudfront.tf             # CloudFront CDN configuration
├── route53.tf                # DNS management (optional)
├── acm.tf                    # SSL certificate management
├── vpc.tf                    # VPC and networking (optional)
├── ecs.tf                    # ECS for backend API (optional)
├── rds.tf                    # PostgreSQL database (optional)
├── iam.tf                    # IAM roles and policies
├── security-groups.tf        # Security groups and network ACLs
└── terraform.tfvars.example  # Example configuration file
```

## 🚀 **Quick Deployment**

```bash
# 1. Copy example configuration
cp terraform.tfvars.example terraform.tfvars

# 2. Edit configuration (optional - defaults work for most users)
nano terraform.tfvars

# 3. Initialize and deploy
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

## ⚙️ **Configuration Options**

### **Minimal Configuration** (Frontend Only)
```hcl
aws_region = "us-east-1"
project_name = "rhei-word-addin"
environment = "prod"
enable_backend = false
enable_database = false
enable_custom_domain = false
```

### **Full Stack Configuration**
```hcl
aws_region = "us-east-1"
project_name = "rhei-word-addin"
environment = "prod"
enable_backend = true
enable_database = true
enable_custom_domain = true
domain_name = "word-addin.yourcompany.com"
api_domain = "api.word-addin.yourcompany.com"
```

## 📊 **Resource Overview**

### **Always Created** (Frontend)
- **S3 Bucket**: Static file hosting with versioning
- **CloudFront Distribution**: Global CDN with security headers
- **IAM Roles**: Secure access policies
- **CloudWatch Logs**: Monitoring and logging

### **Optional Resources** (Backend)
- **VPC**: Isolated network with public/private subnets
- **ECS Cluster**: Fargate containers for API
- **Application Load Balancer**: HTTPS load balancing
- **RDS PostgreSQL**: Managed database with backups
- **Route53**: DNS management for custom domains
- **ACM Certificates**: Automatic SSL certificate management

## 💰 **Cost Estimation**

### **Frontend Only**
- S3: ~$0.50/month
- CloudFront: ~$1-10/month
- Route53: ~$0.50/month (if using custom domain)
- **Total**: ~$2-15/month

### **Full Stack**
- Frontend: ~$2-15/month
- ECS Fargate: ~$15-50/month
- RDS: ~$15-100/month
- Load Balancer: ~$20/month
- NAT Gateway: ~$45/month
- **Total**: ~$100-250/month

## 🔒 **Security Features**

- **Encryption**: All data encrypted at rest and in transit
- **Network Isolation**: VPC with private subnets for backend
- **Access Control**: IAM roles with least privilege
- **Security Groups**: Restrictive firewall rules
- **HTTPS Only**: Automatic SSL certificate management
- **CORS**: Properly configured for Office 365 domains

## 📈 **Scaling and Performance**

- **Auto Scaling**: ECS services scale based on CPU/memory
- **Global CDN**: CloudFront edge locations worldwide
- **Database Scaling**: RDS with read replicas for production
- **Caching**: Multiple layers of caching for optimal performance

## 🔧 **Customization**

### **Environment Variables**
All configuration is done through `terraform.tfvars`. Key variables:

- `aws_region`: AWS region for deployment
- `project_name`: Prefix for all resource names
- `environment`: Environment name (dev, staging, prod)
- `enable_backend`: Deploy backend API infrastructure
- `enable_database`: Deploy RDS PostgreSQL database
- `enable_custom_domain`: Use custom domain with Route53

### **Resource Sizing**
Adjust resource sizes based on your needs:

```hcl
# ECS Configuration
ecs_cpu = 512              # 256, 512, 1024, 2048, 4096
ecs_memory = 1024          # Must be compatible with CPU
ecs_desired_count = 2      # Number of containers

# Database Configuration
db_instance_class = "db.t3.small"  # Instance size
db_allocated_storage = 100         # Storage in GB
```

## 🔄 **State Management**

Terraform state is stored locally by default. For production, consider:

1. **Remote State**: Store state in S3 with DynamoDB locking
2. **State Encryption**: Encrypt state files
3. **Access Control**: Restrict state file access

Example remote state configuration:
```hcl
terraform {
  backend "s3" {
    bucket = "your-terraform-state-bucket"
    key    = "rhei-word-addin/terraform.tfstate"
    region = "us-east-1"
    encrypt = true
    dynamodb_table = "terraform-locks"
  }
}
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Permission Errors**: Ensure AWS user has required policies
2. **Resource Conflicts**: Check for existing resources with same names
3. **Validation Errors**: Run `terraform validate` to check syntax
4. **State Issues**: Use `terraform refresh` to sync state

### **Useful Commands**

```bash
# Validate configuration
terraform validate

# Plan changes
terraform plan

# Show current state
terraform show

# List resources
terraform state list

# Import existing resource
terraform import aws_s3_bucket.example bucket-name

# Destroy specific resource
terraform destroy -target=aws_s3_bucket.example
```

## 📚 **Additional Resources**

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)

## 🤝 **Contributing**

When modifying the Terraform configuration:

1. **Test Changes**: Always run `terraform plan` first
2. **Document Variables**: Add descriptions to new variables
3. **Follow Conventions**: Use consistent naming and tagging
4. **Security First**: Follow AWS security best practices
5. **Cost Awareness**: Consider cost implications of changes

---

**Need help?** Check the main [README](../README.md) or [AWS Deployment Guide](../README-AWS-DEPLOYMENT.md) for detailed instructions.
