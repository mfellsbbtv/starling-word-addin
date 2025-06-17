#!/bin/bash

# RHEI Word Add-in Infrastructure Destruction Script
# This script safely destroys the AWS infrastructure created by Terraform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TERRAFORM_DIR="terraform"

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
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    # Check if Terraform directory exists
    if [ ! -d "$TERRAFORM_DIR" ]; then
        log_error "Terraform directory not found. Please run this script from the project root."
        exit 1
    fi
    
    log_success "All prerequisites met!"
}

backup_s3_content() {
    log_info "Checking for S3 content to backup..."
    
    cd "$TERRAFORM_DIR"
    
    # Check if Terraform state exists
    if [ ! -f "terraform.tfstate" ]; then
        log_warning "No Terraform state found. Skipping S3 backup."
        cd ..
        return
    fi
    
    # Get S3 bucket name from Terraform state
    S3_BUCKET=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")
    
    cd ..
    
    if [ -z "$S3_BUCKET" ]; then
        log_warning "Could not determine S3 bucket name. Skipping backup."
        return
    fi
    
    # Check if bucket exists and has content
    if aws s3 ls "s3://$S3_BUCKET" &> /dev/null; then
        log_info "Found S3 bucket: $S3_BUCKET"
        
        # Create backup directory
        BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        
        log_info "Backing up S3 content to $BACKUP_DIR..."
        aws s3 sync "s3://$S3_BUCKET/" "$BACKUP_DIR/"
        
        log_success "S3 content backed up to $BACKUP_DIR"
    else
        log_info "S3 bucket not found or empty. No backup needed."
    fi
}

empty_s3_bucket() {
    log_info "Emptying S3 bucket before destruction..."
    
    cd "$TERRAFORM_DIR"
    
    # Get S3 bucket name from Terraform state
    S3_BUCKET=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")
    
    cd ..
    
    if [ -z "$S3_BUCKET" ]; then
        log_warning "Could not determine S3 bucket name. Skipping S3 cleanup."
        return
    fi
    
    # Check if bucket exists
    if aws s3 ls "s3://$S3_BUCKET" &> /dev/null; then
        log_info "Emptying S3 bucket: $S3_BUCKET"
        
        # Delete all objects and versions
        aws s3 rm "s3://$S3_BUCKET" --recursive
        
        # Delete all object versions (if versioning is enabled)
        aws s3api list-object-versions --bucket "$S3_BUCKET" --query 'Versions[].{Key:Key,VersionId:VersionId}' --output text | while read key version; do
            if [ ! -z "$key" ] && [ ! -z "$version" ]; then
                aws s3api delete-object --bucket "$S3_BUCKET" --key "$key" --version-id "$version"
            fi
        done
        
        # Delete all delete markers
        aws s3api list-object-versions --bucket "$S3_BUCKET" --query 'DeleteMarkers[].{Key:Key,VersionId:VersionId}' --output text | while read key version; do
            if [ ! -z "$key" ] && [ ! -z "$version" ]; then
                aws s3api delete-object --bucket "$S3_BUCKET" --key "$key" --version-id "$version"
            fi
        done
        
        log_success "S3 bucket emptied successfully!"
    else
        log_info "S3 bucket not found. Skipping S3 cleanup."
    fi
}

show_resources_to_destroy() {
    log_info "Showing resources that will be destroyed..."
    
    cd "$TERRAFORM_DIR"
    
    # Show what will be destroyed
    terraform plan -destroy
    
    cd ..
}

destroy_infrastructure() {
    log_info "Destroying infrastructure with Terraform..."
    
    cd "$TERRAFORM_DIR"
    
    # Destroy the infrastructure
    terraform destroy -auto-approve
    
    log_success "Infrastructure destroyed successfully!"
    cd ..
}

cleanup_terraform_state() {
    log_info "Cleaning up Terraform state and temporary files..."
    
    cd "$TERRAFORM_DIR"
    
    # Remove Terraform state files (optional - comment out if you want to keep them)
    # rm -f terraform.tfstate*
    # rm -f .terraform.lock.hcl
    # rm -rf .terraform/
    
    # Remove plan files
    rm -f tfplan
    
    log_success "Terraform cleanup completed!"
    cd ..
}

show_destruction_summary() {
    log_info "Destruction completed! Summary:"
    
    echo ""
    echo "=== DESTRUCTION SUMMARY ==="
    echo "✅ S3 content backed up (if any)"
    echo "✅ S3 bucket emptied"
    echo "✅ AWS infrastructure destroyed"
    echo "✅ Temporary files cleaned up"
    echo ""
    echo "=== WHAT'S LEFT ==="
    echo "• Terraform state files (preserved for safety)"
    echo "• Local application files (dist/, src/, etc.)"
    echo "• Backup directory (if created)"
    echo ""
    echo "=== NEXT STEPS ==="
    echo "• Remove the Word add-in from Office 365 admin center"
    echo "• Update DNS records if using custom domain"
    echo "• Delete backup files when no longer needed"
    echo ""
}

# Main destruction function
main() {
    log_warning "RHEI Word Add-in Infrastructure Destruction"
    log_warning "This will permanently destroy all AWS resources created by Terraform!"
    
    # Parse command line arguments
    FORCE=false
    BACKUP=true
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --force)
                FORCE=true
                shift
                ;;
            --no-backup)
                BACKUP=false
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --force       Skip confirmation prompts"
                echo "  --no-backup   Skip S3 content backup"
                echo "  --help        Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run destruction steps
    check_prerequisites
    
    if [ "$FORCE" = false ]; then
        echo ""
        log_warning "This will destroy the following AWS resources:"
        echo "• S3 bucket and all contents"
        echo "• CloudFront distribution"
        echo "• Route53 hosted zone (if created)"
        echo "• SSL certificates"
        echo "• ECS cluster and services (if created)"
        echo "• RDS database (if created)"
        echo "• VPC and networking (if created)"
        echo "• All associated IAM roles and policies"
        echo ""
        log_error "THIS ACTION CANNOT BE UNDONE!"
        echo ""
        read -p "Are you absolutely sure you want to continue? Type 'yes' to confirm: " -r
        echo ""
        
        if [[ ! $REPLY == "yes" ]]; then
            log_info "Destruction cancelled."
            exit 0
        fi
    fi
    
    # Show what will be destroyed
    show_resources_to_destroy
    
    if [ "$FORCE" = false ]; then
        echo ""
        read -p "Proceed with destruction? (y/N): " -n 1 -r
        echo ""
        
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Destruction cancelled."
            exit 0
        fi
    fi
    
    # Backup S3 content if requested
    if [ "$BACKUP" = true ]; then
        backup_s3_content
    fi
    
    # Empty S3 bucket (required for successful destruction)
    empty_s3_bucket
    
    # Destroy infrastructure
    destroy_infrastructure
    
    # Cleanup
    cleanup_terraform_state
    
    # Show summary
    show_destruction_summary
    
    log_success "RHEI Word Add-in infrastructure destroyed successfully!"
}

# Run main function
main "$@"
