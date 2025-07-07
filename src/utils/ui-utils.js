/**
 * UI Utilities Module
 * Common UI functions and DOM manipulation helpers
 */

export function updateStatus(message, type) {
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `status-message ${type || ''}`;
    }
    console.log(`Status: ${message}`);
}

export function showProgress(message) {
    const progressSection = document.getElementById('progress-section');
    const progressMessage = document.getElementById('progress-message');
    if (progressSection && progressMessage) {
        progressMessage.textContent = message;
        progressSection.style.display = 'block';
    }
}

export function hideProgress() {
    const progressSection = document.getElementById('progress-section');
    if (progressSection) {
        progressSection.style.display = 'none';
    }
}

export function showResults(content) {
    const resultsContent = document.getElementById('results-content');
    const resultsSection = document.getElementById('results-section');
    
    if (resultsContent && resultsSection) {
        resultsContent.innerHTML = content;
        resultsSection.style.display = 'block';
    }
}

export function hideResults() {
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.style.display = 'none';
    }
}

export function getFormData() {
    return {
        companyName: document.getElementById('company-name')?.value || 'RHEI Creations Inc.',
        companyAddress: document.getElementById('company-address')?.value || '600-777 Hornby St, Vancouver, BC, Canada, V6Z1S4',
        providerName: document.getElementById('provider-name')?.value || 'Provider Name, Inc.',
        providerAddress: document.getElementById('provider-address')?.value || 'Provider Address',
        effectiveDate: document.getElementById('effective-date')?.value || new Date().toLocaleDateString(),
        agreementTitle: document.getElementById('agreement-title')?.value || 'DIGITAL VIDEO SERVICES AGREEMENT'
    };
}

export function setFormDefaults() {
    // Set default effective date to today
    const effectiveDateInput = document.getElementById('effective-date');
    if (effectiveDateInput) {
        const today = new Date().toISOString().split('T')[0];
        effectiveDateInput.value = today;
    }
}

export function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

export function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

export function enableButton(buttonId, enabled = true) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = !enabled;
    }
}

export function setButtonLoading(buttonId, loading = true, originalText = null) {
    const button = document.getElementById(buttonId);
    if (button) {
        if (loading) {
            if (!button.dataset.originalText) {
                button.dataset.originalText = button.textContent;
            }
            button.textContent = '⏳ Processing...';
            button.disabled = true;
        } else {
            button.textContent = originalText || button.dataset.originalText || button.textContent;
            button.disabled = false;
            delete button.dataset.originalText;
        }
    }
}

export function createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

export function formatClauseText(text, type = 'default') {
    // Add line breaks for better readability
    let formattedText = text.replace(/\. /g, '.<br><br>');

    // Highlight key terms based on type
    if (type === 'legal') {
        const keyTerms = ['shall', 'must', 'may', 'will', 'agrees', 'represents', 'warrants'];
        keyTerms.forEach(term => {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            formattedText = formattedText.replace(regex, `<strong>${term}</strong>`);
        });
    }

    return formattedText;
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

export function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        return new Promise((resolve, reject) => {
            try {
                document.execCommand('copy');
                textArea.remove();
                resolve();
            } catch (error) {
                textArea.remove();
                reject(error);
            }
        });
    }
}

export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validateRequired(value) {
    return value && value.trim().length > 0;
}

export function validateForm(formData, requiredFields = []) {
    const errors = [];
    
    requiredFields.forEach(field => {
        if (!validateRequired(formData[field])) {
            errors.push(`${field} is required`);
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

export function showToast(message, type = 'info', duration = 3000) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Style the toast
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '4px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease'
    });
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    toast.style.backgroundColor = colors[type] || colors.info;
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}
