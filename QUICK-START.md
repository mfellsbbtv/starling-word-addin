# RHEI Word Add-in - Quick Start Guide

Get your Word add-in running on AWS in under 10 minutes!

## ⚡ **Super Quick Start**

```bash
# 1. Install tools (if not already installed)
# For Ubuntu/Debian:
sudo apt-get update && sudo apt-get install -y curl unzip
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install

# For macOS:
brew install terraform awscli

# 2. Configure AWS
aws configure
# Enter your AWS credentials and set region to us-east-1

# 3. Configure deployment
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
# Edit terraform.tfvars if needed (defaults work for most users)

# 4. Deploy!
./deploy.sh

# 5. Use the URLs from the output to update your manifest.xml
# 6. Upload manifest.xml to Office 365 admin center
```

## 🎯 **What You Get**

After running `./deploy.sh`, you'll have:

- ✅ **Global CDN**: Your Word add-in served via CloudFront
- ✅ **HTTPS Security**: Automatic SSL certificates
- ✅ **High Availability**: 99.99% uptime SLA
- ✅ **Cost Optimized**: Starting at ~$2/month
- ✅ **Production Ready**: Enterprise-grade infrastructure

## 📋 **Prerequisites Checklist**

- [ ] AWS Account created
- [ ] AWS CLI installed and configured
- [ ] Terraform installed
- [ ] Node.js 16+ installed
- [ ] Office 365 admin access (to upload manifest)

## 🔧 **Default Configuration**

The default `terraform.tfvars` creates:
- Frontend-only deployment (no backend API)
- S3 bucket for static hosting
- CloudFront distribution with global caching
- Automatic SSL certificate
- Monitoring and logging enabled

**Estimated cost**: $2-15/month depending on usage

## 🚀 **Next Steps**

1. **Test your deployment**: Open Word Online and load your add-in
2. **Customize**: Edit `terraform/terraform.tfvars` for your needs
3. **Add backend**: Set `enable_backend = true` for API features
4. **Custom domain**: Set `enable_custom_domain = true` and add your domain
5. **Monitor**: Check AWS CloudWatch for usage and performance

## 🆘 **Need Help?**

- **Deployment fails**: Check [Troubleshooting](README.md#troubleshooting)
- **AWS issues**: Verify credentials with `aws sts get-caller-identity`
- **Terraform errors**: Run `terraform validate` in the terraform directory
- **Word add-in issues**: Check browser console for CORS errors

## 📚 **Learn More**

- [Complete README](README.md) - Full documentation
- [AWS Deployment Guide](README-AWS-DEPLOYMENT.md) - Detailed instructions
- [Legal Matrix Integration](LEGAL-MATRIX-WORD-ADDIN-INTEGRATION.md) - Advanced features

---

**Ready to revolutionize your contract management? Run `./deploy.sh` now!** 🚀
