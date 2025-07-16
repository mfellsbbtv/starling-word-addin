#!/bin/bash

# 🔒 Secure S3 Deployment Script for RHEI Word Add-in
# This script helps deploy your Word add-in to AWS S3 with security controls

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists terraform; then
        print_error "Terraform is not installed. Please install Terraform first."
        exit 1
    fi
    
    if ! command_exists aws; then
        print_error "AWS CLI is not installed. Please install AWS CLI first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
}

# Function to show security options
show_security_options() {
    echo ""
    echo "🔒 Security Configuration Options:"
    echo ""
    echo "1. High Security (IP Whitelist + Geographic + Rate Limiting)"
    echo "   - Best for: Corporate environments with known IP ranges"
    echo "   - Cost: ~$15-25/month"
    echo ""
    echo "2. Medium Security (Geographic + Rate Limiting)"
    echo "   - Best for: Multi-location companies"
    echo "   - Cost: ~$7-15/month"
    echo ""
    echo "3. Basic Security (Rate Limiting Only)"
    echo "   - Best for: General protection"
    echo "   - Cost: ~$5-10/month"
    echo ""
    echo "4. No Security (Open Access)"
    echo "   - Best for: Development/testing"
    echo "   - Cost: ~$2-5/month"
    echo ""
}

# Function to configure security
configure_security() {
    show_security_options
    
    while true; do
        read -p "Choose security level (1-4): " choice
        case $choice in
            1)
                SECURITY_LEVEL="high"
                break
                ;;
            2)
                SECURITY_LEVEL="medium"
                break
                ;;
            3)
                SECURITY_LEVEL="basic"
                break
                ;;
            4)
                SECURITY_LEVEL="none"
                break
                ;;
            *)
                print_error "Invalid choice. Please enter 1, 2, 3, or 4."
                ;;
        esac
    done
    
    print_status "Selected security level: $SECURITY_LEVEL"
}

# Function to create terraform.tfvars
create_tfvars() {
    print_status "Creating terraform.tfvars file..."
    
    cd terraform
    
    if [ ! -f terraform.tfvars ]; then
        cp terraform.tfvars.example terraform.tfvars
        print_success "Created terraform.tfvars from example"
    else
        print_warning "terraform.tfvars already exists, backing up..."
        cp terraform.tfvars terraform.tfvars.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    # Configure based on security level
    case $SECURITY_LEVEL in
        "high")
            print_status "Configuring high security settings..."
            sed -i 's/enable_access_control = false/enable_access_control = true/' terraform.tfvars
            sed -i 's/enable_ip_whitelist = false/enable_ip_whitelist = true/' terraform.tfvars
            sed -i 's/enable_geo_blocking = false/enable_geo_blocking = true/' terraform.tfvars
            sed -i 's/api_rate_limit        = 100/api_rate_limit        = 50/' terraform.tfvars
            
            print_warning "Please edit terraform.tfvars to add your IP ranges:"
            print_warning "  - Uncomment and set allowed_ip_ranges"
            print_warning "  - Adjust allowed_countries as needed"
            ;;
        "medium")
            print_status "Configuring medium security settings..."
            sed -i 's/enable_access_control = false/enable_access_control = true/' terraform.tfvars
            sed -i 's/enable_geo_blocking = false/enable_geo_blocking = true/' terraform.tfvars
            sed -i 's/api_rate_limit        = 100/api_rate_limit        = 100/' terraform.tfvars
            ;;
        "basic")
            print_status "Configuring basic security settings..."
            sed -i 's/enable_access_control = false/enable_access_control = true/' terraform.tfvars
            sed -i 's/api_rate_limit        = 100/api_rate_limit        = 200/' terraform.tfvars
            ;;
        "none")
            print_status "Configuring no security (development mode)..."
            sed -i 's/enable_access_control = true/enable_access_control = false/' terraform.tfvars
            ;;
    esac
    
    cd ..
}

# Function to deploy infrastructure
deploy_infrastructure() {
    print_status "Deploying AWS infrastructure..."
    
    cd terraform
    
    # Initialize Terraform
    print_status "Initializing Terraform..."
    terraform init
    
    # Plan deployment
    print_status "Planning deployment..."
    terraform plan -out=tfplan
    
    # Ask for confirmation
    echo ""
    read -p "Do you want to apply these changes? (y/N): " confirm
    if [[ $confirm =~ ^[Yy]$ ]]; then
        print_status "Applying Terraform configuration..."
        terraform apply tfplan
        print_success "Infrastructure deployed successfully!"
    else
        print_warning "Deployment cancelled."
        exit 0
    fi
    
    cd ..
}

# Function to upload files
upload_files() {
    print_status "Uploading Word add-in files to S3..."
    
    # Get bucket name from Terraform output
    cd terraform
    BUCKET_NAME=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")
    CLOUDFRONT_URL=$(terraform output -raw cloudfront_domain_name 2>/dev/null || echo "")
    cd ..
    
    if [ -z "$BUCKET_NAME" ]; then
        print_error "Could not get S3 bucket name from Terraform output"
        exit 1
    fi
    
    print_status "Uploading to bucket: $BUCKET_NAME"
    
    # Upload main files
    aws s3 cp taskpane-modular.html s3://$BUCKET_NAME/ --content-type "text/html"
    aws s3 cp manifest.xml s3://$BUCKET_NAME/ --content-type "application/xml"
    
    # Upload directories
    if [ -d "src" ]; then
        aws s3 sync src/ s3://$BUCKET_NAME/src/ --delete
    fi
    
    if [ -d "assets" ]; then
        aws s3 sync assets/ s3://$BUCKET_NAME/assets/ --delete
    fi
    
    if [ -d "playbooks" ]; then
        aws s3 sync playbooks/ s3://$BUCKET_NAME/playbooks/ --delete
    fi
    
    print_success "Files uploaded successfully!"
    
    if [ ! -z "$CLOUDFRONT_URL" ]; then
        print_success "Your Word add-in is available at: https://$CLOUDFRONT_URL"
        print_status "Update your manifest.xml to use this URL for production"
    fi
}

# Function to show next steps
show_next_steps() {
    echo ""
    echo "🎉 Deployment Complete!"
    echo ""
    echo "Next Steps:"
    echo "1. Update your manifest.xml with the CloudFront URL"
    echo "2. Test the add-in in Word Online"
    echo "3. Monitor access logs in CloudWatch"
    echo "4. Adjust security settings as needed"
    echo ""
    echo "Useful Commands:"
    echo "  - View outputs: cd terraform && terraform output"
    echo "  - Update files: aws s3 sync ./src/ s3://\$BUCKET_NAME/src/"
    echo "  - View logs: aws logs describe-log-groups --log-group-name-prefix '/aws/wafv2/'"
    echo ""
}

# Main execution
main() {
    echo "🔒 RHEI Word Add-in Secure Deployment"
    echo "====================================="
    
    check_prerequisites
    configure_security
    create_tfvars
    
    echo ""
    read -p "Do you want to deploy the infrastructure now? (y/N): " deploy_now
    if [[ $deploy_now =~ ^[Yy]$ ]]; then
        deploy_infrastructure
        
        echo ""
        read -p "Do you want to upload the add-in files now? (y/N): " upload_now
        if [[ $upload_now =~ ^[Yy]$ ]]; then
            upload_files
        fi
        
        show_next_steps
    else
        print_status "Infrastructure deployment skipped."
        print_status "You can deploy later by running: cd terraform && terraform apply"
    fi
}

# Run main function
main "$@"
