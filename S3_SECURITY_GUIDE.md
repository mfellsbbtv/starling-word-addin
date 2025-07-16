# 🔒 Secure S3 Hosting Guide for Word Add-in

This guide explains how to securely host your Word add-in on AWS S3 with access controls to ensure only authorized users can access it.

## 🎯 Security Options Overview

### Option 1: AWS WAF + CloudFront (Recommended)
**Best for: Enterprise environments with specific access requirements**

✅ **Advantages:**
- IP-based access control
- Geographic restrictions
- Rate limiting protection
- Office 365 User-Agent validation
- DDoS protection
- Detailed logging and monitoring

❌ **Considerations:**
- Additional AWS costs (~$5-20/month)
- More complex setup
- May require Office 365 admin coordination

### Option 2: Private S3 + Signed URLs
**Best for: Small teams with temporary access needs**

✅ **Advantages:**
- Very secure (no public access)
- Time-limited access
- Fine-grained control
- Lower costs

❌ **Considerations:**
- Requires custom authentication system
- URLs expire and need regeneration
- More complex manifest management

### Option 3: CloudFront + Custom Headers
**Best for: Medium security with Office 365 integration**

✅ **Advantages:**
- Moderate security
- Office 365 integration friendly
- Cost-effective
- Simple implementation

❌ **Considerations:**
- Headers can be spoofed
- Less secure than other options

## 🚀 Implementation Guide

### Step 1: Choose Your Security Level

#### High Security (WAF + IP Whitelist)
```bash
# Set these variables in terraform.tfvars
enable_access_control = true
enable_ip_whitelist = true
allowed_ip_ranges = [
  "203.0.113.0/24",    # Your office network
  "198.51.100.0/24"    # Remote office
]
```

#### Medium Security (Geographic + Rate Limiting)
```bash
# Set these variables in terraform.tfvars
enable_access_control = true
enable_geo_blocking = true
allowed_countries = ["US", "CA", "GB"]
api_rate_limit = 100
```

#### Basic Security (Rate Limiting Only)
```bash
# Set these variables in terraform.tfvars
enable_access_control = true
enable_ip_whitelist = false
enable_geo_blocking = false
api_rate_limit = 50
```

### Step 2: Deploy Infrastructure

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Create terraform.tfvars file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your settings
nano terraform.tfvars

# Plan deployment
terraform plan

# Deploy infrastructure
terraform apply
```

### Step 3: Upload Your Add-in Files

```bash
# Build your add-in (if using webpack)
npm run build

# Sync files to S3 (replace bucket name)
aws s3 sync ./dist/ s3://your-bucket-name/ --delete

# Or upload specific files
aws s3 cp taskpane-modular.html s3://your-bucket-name/
aws s3 cp manifest.xml s3://your-bucket-name/
aws s3 cp --recursive ./src/ s3://your-bucket-name/src/
aws s3 cp --recursive ./assets/ s3://your-bucket-name/assets/
```

### Step 4: Update Manifest File

Update your manifest.xml to use the CloudFront URL:

```xml
<SourceLocation DefaultValue="https://your-cloudfront-domain.cloudfront.net/taskpane-modular.html"/>
```

## 🔧 Configuration Examples

### Example 1: Corporate Environment
```hcl
# terraform.tfvars
enable_access_control = true
enable_ip_whitelist = true
allowed_ip_ranges = [
  "10.0.0.0/8",        # Internal corporate network
  "172.16.0.0/12",     # VPN range
  "192.168.1.0/24"     # Office WiFi
]
enable_geo_blocking = true
allowed_countries = ["US"]
api_rate_limit = 200
```

### Example 2: Multi-Region Company
```hcl
# terraform.tfvars
enable_access_control = true
enable_geo_blocking = true
allowed_countries = ["US", "CA", "GB", "AU", "DE"]
api_rate_limit = 500
enable_monitoring = true
```

### Example 3: Development Environment
```hcl
# terraform.tfvars
enable_access_control = false  # Open access for testing
enable_monitoring = true
cloudfront_price_class = "PriceClass_100"
```

## 🛡️ Security Best Practices

### 1. Network Security
- Use IP whitelisting for known office locations
- Implement geographic restrictions if applicable
- Enable rate limiting to prevent abuse

### 2. Monitoring & Alerting
- Enable CloudWatch monitoring
- Set up alerts for unusual access patterns
- Review WAF logs regularly

### 3. Access Management
- Rotate CloudFront URLs periodically
- Use custom domains with SSL certificates
- Implement proper CORS policies

### 4. Content Security
- Enable S3 encryption at rest
- Use CloudFront for SSL termination
- Implement proper cache headers

## 📊 Cost Estimation

### WAF + CloudFront (High Security)
- CloudFront: ~$1-5/month (depending on traffic)
- WAF: ~$5-15/month (rules + requests)
- S3: ~$1-3/month (storage + requests)
- **Total: ~$7-23/month**

### CloudFront Only (Medium Security)
- CloudFront: ~$1-5/month
- S3: ~$1-3/month
- **Total: ~$2-8/month**

## 🚨 Important Considerations

### Office 365 Compatibility
- Office 365 requires HTTPS for add-ins
- Some corporate firewalls may block CloudFront
- Test thoroughly in your Office 365 environment

### User Experience
- IP restrictions may block remote workers
- Geographic blocking affects international users
- Rate limiting may impact heavy users

### Maintenance
- IP ranges may need updates
- Monitor for false positives in WAF
- Keep security rules updated

## 📞 Next Steps

1. **Choose your security level** based on requirements
2. **Update terraform.tfvars** with your settings
3. **Deploy infrastructure** using Terraform
4. **Upload your add-in files** to S3
5. **Test access** from Office 365
6. **Monitor and adjust** security rules as needed

Would you like me to help you implement any specific security configuration?
