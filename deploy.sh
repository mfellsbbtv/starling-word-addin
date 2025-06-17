#!/bin/bash

# RHEI Word Add-in Deployment Script
# This script deploys the Word add-in to AWS using Terraform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TERRAFORM_DIR="terraform"
BUILD_DIR="dist"
MANIFEST_FILE="manifest.xml"

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

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Terraform is installed
    if ! command -v terraform &> /dev/null; then
        log_error "Terraform is not installed. Please install Terraform first."
        exit 1
    fi
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install AWS CLI first."
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v npm &> /dev/null; then
        log_error "Node.js/npm is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    log_success "All prerequisites met!"
}

build_application() {
    log_info "Building Word add-in application..."
    
    # Install dependencies
    if [ ! -d "node_modules" ]; then
        log_info "Installing npm dependencies..."
        npm install
    fi
    
    # Build the application
    log_info "Building application for production..."
    npm run build
    
    if [ ! -d "$BUILD_DIR" ]; then
        log_error "Build failed - $BUILD_DIR directory not found"
        exit 1
    fi
    
    log_success "Application built successfully!"
}

init_terraform() {
    log_info "Initializing Terraform..."
    
    cd "$TERRAFORM_DIR"
    
    # Initialize Terraform
    terraform init
    
    # Validate Terraform configuration
    terraform validate
    
    log_success "Terraform initialized and validated!"
    cd ..
}

plan_terraform() {
    log_info "Planning Terraform deployment..."
    
    cd "$TERRAFORM_DIR"
    
    # Check if terraform.tfvars exists
    if [ ! -f "terraform.tfvars" ]; then
        log_warning "terraform.tfvars not found. Please copy terraform.tfvars.example to terraform.tfvars and customize it."
        log_info "Creating terraform.tfvars from example..."
        cp terraform.tfvars.example terraform.tfvars
        log_warning "Please edit terraform.tfvars with your configuration before continuing."
        exit 1
    fi
    
    # Plan the deployment
    terraform plan -out=tfplan
    
    log_success "Terraform plan completed!"
    cd ..
}

apply_terraform() {
    log_info "Applying Terraform configuration..."
    
    cd "$TERRAFORM_DIR"
    
    # Apply the plan
    terraform apply tfplan
    
    log_success "Infrastructure deployed successfully!"
    cd ..
}

deploy_application() {
    log_info "Deploying application to S3..."
    
    cd "$TERRAFORM_DIR"
    
    # Get S3 bucket name from Terraform output
    S3_BUCKET=$(terraform output -raw s3_bucket_name)
    CLOUDFRONT_DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
    
    cd ..
    
    if [ -z "$S3_BUCKET" ]; then
        log_error "Could not get S3 bucket name from Terraform output"
        exit 1
    fi
    
    log_info "Uploading files to S3 bucket: $S3_BUCKET"
    
    # Sync files to S3
    aws s3 sync "$BUILD_DIR/" "s3://$S3_BUCKET/" --delete --cache-control "max-age=31536000" --exclude "*.html" --exclude "*.xml"
    
    # Upload HTML and XML files with no cache
    aws s3 sync "$BUILD_DIR/" "s3://$S3_BUCKET/" --delete --cache-control "no-cache" --include "*.html" --include "*.xml"
    
    log_success "Files uploaded to S3!"
    
    # Invalidate CloudFront cache
    if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
        log_info "Invalidating CloudFront cache..."
        aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" --paths "/*"
        log_success "CloudFront cache invalidated!"
    fi
}

update_manifest() {
    log_info "Updating manifest.xml with new URLs..."

    # Use the dedicated manifest update script
    if [ -f "scripts/update-manifest.sh" ]; then
        ./scripts/update-manifest.sh --force
    else
        # Fallback to inline update
        cd "$TERRAFORM_DIR"

        # Get URLs from Terraform output
        WORD_ADDIN_URL=$(terraform output -raw word_addin_url)

        cd ..

        if [ -z "$WORD_ADDIN_URL" ]; then
            log_error "Could not get Word add-in URL from Terraform output"
            exit 1
        fi

        log_info "Word add-in URL: $WORD_ADDIN_URL"

        # Create updated manifest
        if [ -f "$MANIFEST_FILE" ]; then
            # Backup original manifest
            cp "$MANIFEST_FILE" "${MANIFEST_FILE}.backup"

            # Update URLs in manifest
            sed -i.tmp "s|https://mfellsbbtv.github.io/starling-word-addin|$WORD_ADDIN_URL|g" "$MANIFEST_FILE"
            rm "${MANIFEST_FILE}.tmp"

            log_success "Manifest updated with new URLs!"
            log_info "Please upload the updated $MANIFEST_FILE to your Office 365 admin center."
        else
            log_warning "Manifest file not found. Please update your manifest manually with the new URL: $WORD_ADDIN_URL"
        fi
    fi
}

show_deployment_info() {
    log_info "Deployment completed! Here's your deployment information:"
    
    cd "$TERRAFORM_DIR"
    
    echo ""
    echo "=== DEPLOYMENT INFORMATION ==="
    terraform output deployment_instructions
    echo ""
    
    echo "=== MANIFEST URLS ==="
    terraform output manifest_urls
    echo ""
    
    cd ..
}

cleanup() {
    log_info "Cleaning up temporary files..."
    
    cd "$TERRAFORM_DIR"
    rm -f tfplan
    cd ..
    
    log_success "Cleanup completed!"
}

# Main deployment function
main() {
    log_info "Starting RHEI Word Add-in deployment..."
    
    # Parse command line arguments
    SKIP_BUILD=false
    PLAN_ONLY=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --plan-only)
                PLAN_ONLY=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --skip-build    Skip building the application"
                echo "  --plan-only     Only run terraform plan, don't apply"
                echo "  --help          Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run deployment steps
    check_prerequisites
    
    if [ "$SKIP_BUILD" = false ]; then
        build_application
    fi
    
    init_terraform
    plan_terraform
    
    if [ "$PLAN_ONLY" = true ]; then
        log_info "Plan-only mode. Exiting without applying changes."
        exit 0
    fi
    
    # Confirm before applying
    echo ""
    log_warning "This will deploy infrastructure to AWS and may incur costs."
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled."
        exit 0
    fi
    
    apply_terraform
    deploy_application
    update_manifest
    show_deployment_info
    cleanup
    
    log_success "RHEI Word Add-in deployed successfully!"
}

# Run main function
main "$@"
