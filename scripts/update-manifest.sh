#!/bin/bash

# Update manifest.xml with new AWS URLs
# This script updates the manifest file with URLs from Terraform output

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TERRAFORM_DIR="terraform"
MANIFEST_FILE="manifest.xml"
BACKUP_SUFFIX=".backup-$(date +%Y%m%d-%H%M%S)"

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
    
    # Check if Terraform directory exists
    if [ ! -d "$TERRAFORM_DIR" ]; then
        log_error "Terraform directory not found. Please run this script from the project root."
        exit 1
    fi
    
    # Check if manifest file exists
    if [ ! -f "$MANIFEST_FILE" ]; then
        log_error "Manifest file not found: $MANIFEST_FILE"
        exit 1
    fi
    
    # Check if Terraform state exists
    if [ ! -f "$TERRAFORM_DIR/terraform.tfstate" ]; then
        log_error "Terraform state not found. Please deploy infrastructure first."
        exit 1
    fi
    
    log_success "All prerequisites met!"
}

get_terraform_outputs() {
    log_info "Getting URLs from Terraform output..."
    
    cd "$TERRAFORM_DIR"
    
    # Get the base URL
    BASE_URL=$(terraform output -raw word_addin_url 2>/dev/null || echo "")
    
    if [ -z "$BASE_URL" ]; then
        log_error "Could not get Word add-in URL from Terraform output"
        exit 1
    fi
    
    # Get manifest URLs
    TASKPANE_URL="${BASE_URL}/taskpane.html"
    COMMANDS_URL="${BASE_URL}/commands.html"
    ICON_16_URL="${BASE_URL}/assets/icon-16.png"
    ICON_32_URL="${BASE_URL}/assets/icon-32.png"
    ICON_80_URL="${BASE_URL}/assets/icon-80.png"
    
    cd ..
    
    log_info "Base URL: $BASE_URL"
    log_success "URLs retrieved successfully!"
}

backup_manifest() {
    log_info "Creating backup of manifest file..."
    
    cp "$MANIFEST_FILE" "${MANIFEST_FILE}${BACKUP_SUFFIX}"
    
    log_success "Backup created: ${MANIFEST_FILE}${BACKUP_SUFFIX}"
}

update_manifest() {
    log_info "Updating manifest.xml with new URLs..."
    
    # Create a temporary file for the updated manifest
    TEMP_MANIFEST="${MANIFEST_FILE}.tmp"
    
    # Update URLs in the manifest
    sed "s|https://mfellsbbtv\.github\.io/starling-word-addin|${BASE_URL}|g" "$MANIFEST_FILE" > "$TEMP_MANIFEST"
    
    # Check if any replacements were made
    if ! diff -q "$MANIFEST_FILE" "$TEMP_MANIFEST" > /dev/null; then
        mv "$TEMP_MANIFEST" "$MANIFEST_FILE"
        log_success "Manifest updated successfully!"
    else
        rm "$TEMP_MANIFEST"
        log_warning "No changes needed - manifest already uses the correct URLs"
    fi
}

validate_manifest() {
    log_info "Validating updated manifest..."
    
    # Check if the manifest contains the new URLs
    if grep -q "$BASE_URL" "$MANIFEST_FILE"; then
        log_success "Manifest validation passed!"
    else
        log_error "Manifest validation failed - URLs not found in manifest"
        exit 1
    fi
    
    # Check if manifest is valid XML (if xmllint is available)
    if command -v xmllint &> /dev/null; then
        if xmllint --noout "$MANIFEST_FILE" 2>/dev/null; then
            log_success "XML validation passed!"
        else
            log_warning "XML validation failed - please check manifest syntax"
        fi
    else
        log_info "xmllint not available - skipping XML validation"
    fi
}

show_summary() {
    log_info "Manifest update completed! Summary:"
    
    echo ""
    echo "=== UPDATED URLS ==="
    echo "Base URL: $BASE_URL"
    echo "Taskpane: $TASKPANE_URL"
    echo "Commands: $COMMANDS_URL"
    echo "Icon 16x16: $ICON_16_URL"
    echo "Icon 32x32: $ICON_32_URL"
    echo "Icon 80x80: $ICON_80_URL"
    echo ""
    echo "=== NEXT STEPS ==="
    echo "1. Review the updated manifest.xml file"
    echo "2. Upload manifest.xml to Office 365 admin center"
    echo "3. Deploy to your organization or test users"
    echo "4. Test the add-in in Word Online"
    echo ""
    echo "=== BACKUP ==="
    echo "Original manifest backed up to: ${MANIFEST_FILE}${BACKUP_SUFFIX}"
    echo ""
}

# Main function
main() {
    log_info "Starting manifest update process..."
    
    # Parse command line arguments
    FORCE=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --force)
                FORCE=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --force    Skip confirmation prompts"
                echo "  --help     Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run update steps
    check_prerequisites
    get_terraform_outputs
    
    if [ "$FORCE" = false ]; then
        echo ""
        log_warning "This will update your manifest.xml with new AWS URLs:"
        echo "Current base URL will be replaced with: $BASE_URL"
        echo ""
        read -p "Do you want to continue? (y/N): " -n 1 -r
        echo ""
        
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Update cancelled."
            exit 0
        fi
    fi
    
    backup_manifest
    update_manifest
    validate_manifest
    show_summary
    
    log_success "Manifest update completed successfully!"
}

# Run main function
main "$@"
