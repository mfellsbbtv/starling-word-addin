#!/bin/bash

# AWS Setup Script for RHEI Word Add-in
# This script helps set up AWS credentials and required tools

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get &> /dev/null; then
            OS="ubuntu"
        elif command -v yum &> /dev/null; then
            OS="centos"
        else
            OS="linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
    else
        OS="unknown"
    fi
    
    log_info "Detected OS: $OS"
}

install_terraform() {
    log_info "Installing Terraform..."
    
    case $OS in
        ubuntu)
            curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
            sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
            sudo apt-get update && sudo apt-get install terraform
            ;;
        centos)
            sudo yum install -y yum-utils
            sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/RHEL/hashicorp.repo
            sudo yum -y install terraform
            ;;
        macos)
            if command -v brew &> /dev/null; then
                brew install terraform
            else
                log_error "Homebrew not found. Please install Homebrew first: https://brew.sh/"
                exit 1
            fi
            ;;
        windows)
            log_warning "Please install Terraform manually from: https://www.terraform.io/downloads.html"
            log_warning "Or use Chocolatey: choco install terraform"
            ;;
        *)
            log_warning "Please install Terraform manually from: https://www.terraform.io/downloads.html"
            ;;
    esac
    
    # Verify installation
    if command -v terraform &> /dev/null; then
        TERRAFORM_VERSION=$(terraform version | head -n1)
        log_success "Terraform installed: $TERRAFORM_VERSION"
    else
        log_error "Terraform installation failed"
        exit 1
    fi
}

install_aws_cli() {
    log_info "Installing AWS CLI..."
    
    case $OS in
        ubuntu|linux)
            curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
            unzip awscliv2.zip
            sudo ./aws/install
            rm -rf aws awscliv2.zip
            ;;
        centos)
            curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
            unzip awscliv2.zip
            sudo ./aws/install
            rm -rf aws awscliv2.zip
            ;;
        macos)
            if command -v brew &> /dev/null; then
                brew install awscli
            else
                curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
                sudo installer -pkg AWSCLIV2.pkg -target /
                rm AWSCLIV2.pkg
            fi
            ;;
        windows)
            log_warning "Please install AWS CLI manually from: https://aws.amazon.com/cli/"
            log_warning "Or use Chocolatey: choco install awscli"
            ;;
        *)
            log_warning "Please install AWS CLI manually from: https://aws.amazon.com/cli/"
            ;;
    esac
    
    # Verify installation
    if command -v aws &> /dev/null; then
        AWS_VERSION=$(aws --version)
        log_success "AWS CLI installed: $AWS_VERSION"
    else
        log_error "AWS CLI installation failed"
        exit 1
    fi
}

check_node() {
    log_info "Checking Node.js installation..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        NPM_VERSION=$(npm --version)
        log_success "Node.js found: $NODE_VERSION"
        log_success "npm found: $NPM_VERSION"
        
        # Check if version is 16 or higher
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 16 ]; then
            log_warning "Node.js version $NODE_VERSION detected. Version 16+ recommended."
            log_info "Consider updating Node.js: https://nodejs.org/"
        fi
    else
        log_error "Node.js not found. Please install Node.js 16+ from: https://nodejs.org/"
        exit 1
    fi
}

setup_aws_credentials() {
    log_info "Setting up AWS credentials..."
    
    # Check if AWS CLI is configured
    if aws sts get-caller-identity &> /dev/null; then
        log_success "AWS credentials already configured!"
        
        # Show current configuration
        echo ""
        log_info "Current AWS configuration:"
        aws configure list
        echo ""
        
        read -p "Do you want to reconfigure AWS credentials? (y/N): " -n 1 -r
        echo ""
        
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return
        fi
    fi
    
    echo ""
    log_info "AWS Credential Setup"
    log_warning "You'll need your AWS Access Key ID and Secret Access Key"
    log_info "If you don't have these, create them in the AWS Console:"
    log_info "1. Go to IAM → Users → Your User → Security credentials"
    log_info "2. Click 'Create access key'"
    log_info "3. Download and save the credentials securely"
    echo ""
    
    read -p "Do you have your AWS credentials ready? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Please get your AWS credentials first, then run this script again."
        exit 0
    fi
    
    # Configure AWS CLI
    log_info "Configuring AWS CLI..."
    aws configure
    
    # Test the configuration
    log_info "Testing AWS connection..."
    if aws sts get-caller-identity &> /dev/null; then
        log_success "AWS credentials configured successfully!"
        
        # Show account info
        echo ""
        log_info "AWS Account Information:"
        aws sts get-caller-identity
        echo ""
    else
        log_error "AWS credential test failed. Please check your credentials."
        exit 1
    fi
}

check_permissions() {
    log_info "Checking AWS permissions..."
    
    # Test basic permissions
    PERMISSIONS_OK=true
    
    # Test S3 permissions
    if aws s3 ls &> /dev/null; then
        log_success "S3 permissions: OK"
    else
        log_error "S3 permissions: FAILED"
        PERMISSIONS_OK=false
    fi
    
    # Test CloudFront permissions (list distributions)
    if aws cloudfront list-distributions &> /dev/null; then
        log_success "CloudFront permissions: OK"
    else
        log_error "CloudFront permissions: FAILED"
        PERMISSIONS_OK=false
    fi
    
    # Test IAM permissions (list roles)
    if aws iam list-roles --max-items 1 &> /dev/null; then
        log_success "IAM permissions: OK"
    else
        log_error "IAM permissions: FAILED"
        PERMISSIONS_OK=false
    fi
    
    if [ "$PERMISSIONS_OK" = false ]; then
        echo ""
        log_error "Some AWS permissions are missing!"
        log_info "Your AWS user needs these policies:"
        echo "  - AmazonS3FullAccess"
        echo "  - CloudFrontFullAccess"
        echo "  - AmazonRoute53FullAccess"
        echo "  - AWSCertificateManagerFullAccess"
        echo "  - IAMFullAccess"
        echo "  - AmazonECS_FullAccess (if using backend)"
        echo "  - AmazonRDSFullAccess (if using database)"
        echo ""
        log_info "Please add these policies in the AWS Console and try again."
        exit 1
    else
        log_success "All required AWS permissions are available!"
    fi
}

create_terraform_config() {
    log_info "Creating Terraform configuration..."
    
    if [ -f "terraform/terraform.tfvars" ]; then
        log_warning "terraform.tfvars already exists"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo ""
        
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Keeping existing terraform.tfvars"
            return
        fi
    fi
    
    # Get AWS region
    CURRENT_REGION=$(aws configure get region)
    if [ -z "$CURRENT_REGION" ]; then
        CURRENT_REGION="us-east-1"
    fi
    
    echo ""
    log_info "Creating terraform.tfvars with recommended settings..."
    
    cat > terraform/terraform.tfvars << EOF
# RHEI Word Add-in Terraform Configuration
# Generated by setup-aws.sh on $(date)

# Basic Configuration
aws_region = "$CURRENT_REGION"
project_name = "rhei-word-addin"
environment = "prod"
owner = "$(whoami)"

# Frontend Only (recommended for first deployment)
enable_backend = false
enable_database = false
enable_custom_domain = false

# Monitoring and Security
enable_monitoring = true
log_retention_days = 30
enable_deletion_protection = true

# Cost Optimization
cloudfront_price_class = "PriceClass_100"
enable_s3_versioning = true

# Uncomment and configure these for custom domain:
# enable_custom_domain = true
# domain_name = "word-addin.yourcompany.com"

# Uncomment and configure these for backend API:
# enable_backend = true
# enable_database = true
# api_domain = "api.word-addin.yourcompany.com"
# ecs_cpu = 256
# ecs_memory = 512
# db_instance_class = "db.t3.micro"
EOF
    
    log_success "terraform.tfvars created successfully!"
    log_info "You can edit terraform/terraform.tfvars to customize your deployment"
}

show_next_steps() {
    echo ""
    log_success "AWS setup completed successfully!"
    echo ""
    echo "=== NEXT STEPS ==="
    echo "1. Review and customize terraform/terraform.tfvars if needed"
    echo "2. Deploy your Word add-in: ./deploy.sh"
    echo "3. Update manifest.xml with the deployment URLs"
    echo "4. Upload manifest.xml to Office 365 admin center"
    echo ""
    echo "=== QUICK DEPLOYMENT ==="
    echo "Run this command to deploy with default settings:"
    echo "  ./deploy.sh"
    echo ""
    echo "=== ESTIMATED COSTS ==="
    echo "Frontend only: ~\$2-15/month"
    echo "With backend: ~\$100-250/month"
    echo ""
    echo "=== DOCUMENTATION ==="
    echo "- Quick Start: QUICK-START.md"
    echo "- Full Guide: README.md"
    echo "- AWS Details: README-AWS-DEPLOYMENT.md"
    echo ""
}

# Main function
main() {
    log_info "RHEI Word Add-in AWS Setup"
    echo ""
    
    # Detect operating system
    detect_os
    
    # Check if tools are already installed
    if ! command -v terraform &> /dev/null; then
        install_terraform
    else
        TERRAFORM_VERSION=$(terraform version | head -n1)
        log_success "Terraform already installed: $TERRAFORM_VERSION"
    fi
    
    if ! command -v aws &> /dev/null; then
        install_aws_cli
    else
        AWS_VERSION=$(aws --version)
        log_success "AWS CLI already installed: $AWS_VERSION"
    fi
    
    # Check Node.js
    check_node
    
    # Setup AWS credentials
    setup_aws_credentials
    
    # Check permissions
    check_permissions
    
    # Create Terraform configuration
    create_terraform_config
    
    # Show next steps
    show_next_steps
}

# Run main function
main "$@"
