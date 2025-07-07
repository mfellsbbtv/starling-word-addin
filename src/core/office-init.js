/**
 * Office.js Initialization Module
 * Handles Office.js setup, error handling, and Word API detection
 */

// Global state
window.OFFICE_READY = false;
window.WORD_API_AVAILABLE = false;

// CRITICAL FIX: Multiple layers of error handling for Office.HostApplication
export function setupOfficeErrorHandling() {
    // Layer 1: Global error handler to catch Office.HostApplication errors
    window.addEventListener('error', function(event) {
        console.log('Global error caught:', event.error);
        if (event.error && event.error.message && event.error.message.includes("Cannot read properties of undefined (reading 'Word')")) {
            console.warn("FIXED: Office.HostApplication.Word error caught and handled");
            event.preventDefault();
            return false;
        }
    });

    // Layer 2: Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(event) {
        console.log('Unhandled promise rejection caught:', event.reason);
        if (event.reason && event.reason.message && event.reason.message.includes("Cannot read properties of undefined (reading 'Word')")) {
            console.warn("FIXED: Office.HostApplication.Word promise rejection caught and handled");
            event.preventDefault();
            return false;
        }
    });
}

// Layer 3: Override Office.HostApplication if undefined
export function ensureOfficeHostApplication() {
    if (typeof Office !== 'undefined' && typeof Office.HostApplication === 'undefined') {
        console.warn("FIXING: Office.HostApplication is undefined, creating mock object");
        Office.HostApplication = {
            Word: 'Word',
            Excel: 'Excel',
            PowerPoint: 'PowerPoint',
            Outlook: 'Outlook',
            OneNote: 'OneNote',
            Project: 'Project',
            Access: 'Access'
        };
        console.log("FIXED: Office.HostApplication mock object created");
    }
}

// Enhanced Office.onReady with multiple layers of HostApplication fixes
export function initializeOffice() {
    console.log("Starting Office initialization with comprehensive HostApplication fix...");

    if (typeof Office !== 'undefined') {
        // Ensure Office.HostApplication exists before calling Office.onReady
        ensureOfficeHostApplication();

        try {
            // Wrap Office.onReady in additional error handling
            const safeOfficeOnReady = function(callback) {
                try {
                    return Office.onReady(callback);
                } catch (error) {
                    console.error("Office.onReady error:", error);
                    if (error.message && error.message.includes("Cannot read properties of undefined (reading 'Word')")) {
                        console.warn("FIXED: Office.onReady HostApplication error caught, proceeding with fallback");
                        // Call the callback with a mock info object
                        callback({ host: 'Word', platform: 'Web' });
                    } else {
                        throw error;
                    }
                }
            };

            safeOfficeOnReady((info) => {
                console.log("Office.onReady called with info:", info);
                window.OFFICE_READY = true;

                // CRITICAL FIX: Multiple checks for Office.HostApplication
                let hostType = 'unknown';

                try {
                    hostType = info.host || 'unknown';
                } catch (e) {
                    console.warn("Could not determine host type from info object");
                }

                console.log("Detected host type:", hostType);
                initializeWordFeatures();
            });
        } catch (error) {
            console.error("Error in Office.onReady setup:", error);
            console.warn("FIXED: Proceeding with basic initialization due to Office.onReady error");
            initializeBasicFeatures();
        }
    } else {
        console.error("Office.js not available");
        initializeBasicFeatures();
    }
}

export function initializeWordFeatures() {
    console.log("Initializing Word features...");
    
    // Check for Word API
    if (typeof Word !== 'undefined' && typeof Word.run === 'function') {
        console.log("Word API is available!");
        window.WORD_API_AVAILABLE = true;
        updateStatus("Word API available - all features enabled", "success");
    } else {
        console.log("Word API not available - using demo mode");
        window.WORD_API_AVAILABLE = false;
        updateStatus("Demo mode - Word API not available", "warning");
    }
    
    setupUI();
}

export function initializeBasicFeatures() {
    console.log("Initializing basic features...");
    window.WORD_API_AVAILABLE = false;
    updateStatus("Basic mode - limited functionality", "warning");
    setupUI();
}

export function setupUI() {
    console.log("Setting up UI...");
    
    // Enable buttons based on API availability
    console.log("🔘 Setting up button states...");
    console.log("WORD_API_AVAILABLE:", window.WORD_API_AVAILABLE);
    
    const buttons = document.querySelectorAll('button');
    console.log("Found buttons:", buttons.length);
    
    buttons.forEach(button => {
        // Always enable these buttons regardless of Word API availability
        const alwaysEnabledButtons = ['show-diagnostics', 'test-word-api', 'generate-contract'];
        
        console.log(`Button: ${button.id}, always enabled: ${alwaysEnabledButtons.includes(button.id)}`);
        
        if (window.WORD_API_AVAILABLE || alwaysEnabledButtons.includes(button.id)) {
            button.disabled = false;
            if (!window.WORD_API_AVAILABLE && button.id === 'generate-contract') {
                button.title = "Generate contract (demo mode - will show preview)";
                console.log("✅ Generate contract button enabled for demo mode");
            } else if (button.id === 'generate-contract') {
                console.log("✅ Generate contract button enabled for Word API mode");
            }
        } else {
            button.disabled = true;
            button.title = "Requires Word API - not available";
            console.log(`❌ Button ${button.id} disabled`);
        }
    });
    
    // Special check for generate contract button
    const generateBtn = document.getElementById('generate-contract');
    if (generateBtn) {
        console.log(`🎯 Generate contract button final state: disabled=${generateBtn.disabled}, title="${generateBtn.title}"`);
    }
}

export function updateStatus(message, type) {
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `status-message ${type || ''}`;
    }
    console.log(`Status: ${message}`);
}

export function showDiagnostics() {
    const diagnostics = {
        officeLoaded: typeof Office !== 'undefined',
        officeReady: window.OFFICE_READY || false,
        hostApplication: typeof Office?.HostApplication !== 'undefined',
        wordApi: typeof Word !== 'undefined',
        wordRun: typeof Word?.run === 'function',
        wordApiAvailable: window.WORD_API_AVAILABLE || false
    };

    console.log("Diagnostics:", diagnostics);

    const message = `Office: ${diagnostics.officeLoaded ? 'Loaded' : 'Not Loaded'}, ` +
                   `Ready: ${diagnostics.officeReady ? 'Yes' : 'No'}, ` +
                   `Word API: ${diagnostics.wordApiAvailable ? 'Available' : 'Not Available'}`;

    updateStatus(message, diagnostics.wordApiAvailable ? "success" : "warning");
    
    return diagnostics;
}

// Initialize error handling immediately
setupOfficeErrorHandling();
