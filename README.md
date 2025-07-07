# RHEI AI Legal Assistant

Microsoft Word add-in for contract generation and analysis using Legal Matrix TSV data.

## Quick Start

1. **Configure AWS credentials:**
   ```bash
   aws configure
   ```

2. **Configure deployment:**
   ```bash
   cp terraform/terraform.tfvars.example terraform/terraform.tfvars
   # Edit terraform.tfvars with your settings
   ```

3. **Deploy:**
   ```bash
   ./deploy.sh
   ```

4. **Update manifest.xml** with the CloudFront URL and upload to Office 365

## Features

- Contract generation from Legal Matrix baseline clauses
- Party-specific contract analysis using negotiation precedents
- Compliance scoring and recommendations
- TSV data integration with fallback to playbook system

## Architecture

**Frontend Only ($2-15/month):**
```
Users → CloudFront CDN → S3 Bucket → Word Add-in Files
```

**Full Stack ($100-250/month):**
```
Word Add-in → Load Balancer → ECS Fargate → RDS PostgreSQL
```

## Configuration

**Minimal (Frontend only):**
```hcl
enable_backend = false
enable_database = false
enable_custom_domain = false
```

**Production:**
```hcl
enable_backend = true
enable_database = true
domain_name = "word-addin.yourcompany.com"
```

## Development

```bash
npm install
npm start        # Local development
npm run build    # Production build
```

## Deployment Scripts

- `./deploy.sh` - Deploy to AWS
- `./destroy.sh` - Remove AWS resources
