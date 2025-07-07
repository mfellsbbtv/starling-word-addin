// Debug script to track classList errors
// Add this to browser console to track where classList errors occur

console.log("🔍 ClassList Error Tracker Initialized");

// Override classList access to track errors
const originalGetElementById = document.getElementById;
document.getElementById = function(id) {
    const element = originalGetElementById.call(document, id);
    if (!element) {
        console.warn(`⚠️ Element with ID '${id}' not found`);
        // Create a stack trace to see where this was called from
        console.trace(`getElementById('${id}') returned null`);
    }
    return element;
};

// Track classList access
const originalClassListAdd = Element.prototype.classList.add;
const originalClassListRemove = Element.prototype.classList.remove;

Element.prototype.classList.add = function(...classes) {
    try {
        return originalClassListAdd.apply(this, classes);
    } catch (error) {
        console.error(`❌ Error adding classes ${classes} to element:`, this);
        console.trace("classList.add error");
        throw error;
    }
};

Element.prototype.classList.remove = function(...classes) {
    try {
        return originalClassListRemove.apply(this, classes);
    } catch (error) {
        console.error(`❌ Error removing classes ${classes} from element:`, this);
        console.trace("classList.remove error");
        throw error;
    }
};

// Track button loading calls
window.originalSetButtonLoading = window.setButtonLoading;
window.setButtonLoading = function(buttonId, isLoading) {
    console.log(`🔘 setButtonLoading called: ${buttonId}, loading: ${isLoading}`);
    const button = document.getElementById(buttonId);
    if (!button) {
        console.error(`❌ Button not found: ${buttonId}`);
        console.trace(`setButtonLoading('${buttonId}') - button not found`);
        return;
    }
    
    try {
        if (isLoading) {
            button.classList.add("loading");
            button.disabled = true;
        } else {
            button.classList.remove("loading");
            button.disabled = false;
        }
        console.log(`✅ setButtonLoading successful: ${buttonId}`);
    } catch (error) {
        console.error(`❌ setButtonLoading error for ${buttonId}:`, error);
        console.trace(`setButtonLoading error`);
        throw error;
    }
};

// Track updateStatus calls
window.originalUpdateStatus = window.updateStatus;
window.updateStatus = function(message, type = "info") {
    console.log(`📢 updateStatus called: ${message} (${type})`);
    const statusElement = document.getElementById("status-message");
    if (!statusElement) {
        console.error("❌ Status element not found");
        console.trace("updateStatus - status element not found");
        return;
    }
    
    try {
        statusElement.textContent = message;
        statusElement.className = `status-message ms-font-s ${type} slide-in`;
        
        if (type === "success") {
            statusElement.classList.add("success-animation");
            setTimeout(() => {
                statusElement.classList.remove("success-animation");
            }, 600);
        }
        console.log(`✅ updateStatus successful: ${message}`);
    } catch (error) {
        console.error(`❌ updateStatus error:`, error);
        console.trace("updateStatus error");
        throw error;
    }
};

// Monitor all DOM mutations
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    console.log(`➕ Element added: ${node.tagName}${node.id ? '#' + node.id : ''}${node.className ? '.' + node.className.split(' ').join('.') : ''}`);
                }
            });
            mutation.removedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    console.log(`➖ Element removed: ${node.tagName}${node.id ? '#' + node.id : ''}${node.className ? '.' + node.className.split(' ').join('.') : ''}`);
                }
            });
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Check current DOM state
console.log("📋 Current DOM State Check:");
const criticalElements = [
    'generate-contract',
    'analyze-contract',
    'status-message',
    'progress-section',
    'results-section',
    'suggestions-section'
];

criticalElements.forEach(id => {
    const element = document.getElementById(id);
    console.log(`${element ? '✅' : '❌'} ${id}: ${element ? 'Found' : 'Not found'}`);
});

// Global error handler specifically for classList errors
window.addEventListener('error', function(event) {
    if (event.error && event.error.message && event.error.message.includes('classList')) {
        console.error("🚨 CLASSLIST ERROR DETECTED:");
        console.error("Message:", event.error.message);
        console.error("Stack:", event.error.stack);
        console.error("Filename:", event.filename);
        console.error("Line:", event.lineno);
        console.error("Column:", event.colno);
        
        // Try to identify the problematic element
        console.log("🔍 Attempting to identify problematic element...");
        console.log("Current active element:", document.activeElement);
        console.log("Document ready state:", document.readyState);
        console.log("Body exists:", !!document.body);
    }
});

console.log("🎯 ClassList Error Tracker Ready - Now try generating a contract");
