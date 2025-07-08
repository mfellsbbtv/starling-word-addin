/**
 * Main Application Entry Point
 * Initializes the RHEI AI Legal Assistant Word Add-in
 */

import { initializeOffice, showDiagnostics } from './core/office-init.js';
import { generateContract } from './services/contract-generator.js';
import { updateStatus, setFormDefaults, showModal, hideModal } from './utils/ui-utils.js';
import { initializeClauseReplacement } from './features/clause-replacement.js';

// Global state
let isInitialized = false;

// Initialize the application
function initializeApp() {
    console.log("🚀 Initializing RHEI AI Legal Assistant...");
    
    if (isInitialized) {
        console.log("App already initialized");
        return;
    }
    
    try {
        // Set up form defaults
        setFormDefaults();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize Office.js
        initializeOffice();

        // Initialize clause replacement functionality
        initializeClauseReplacement();

        isInitialized = true;
        console.log("✅ App initialization completed");
        
    } catch (error) {
        console.error("❌ App initialization failed:", error);
        updateStatus("Initialization failed: " + error.message, "error");
    }
}

// Set up all event listeners
function setupEventListeners() {
    console.log("Setting up event listeners...");
    
    // Contract generation
    const generateBtn = document.getElementById('generate-contract');
    if (generateBtn) {
        console.log("🎯 Setting up event listener for generate-contract button");
        generateBtn.addEventListener('click', handleGenerateContract);
        console.log("✅ Event listener added to generate-contract button");
    }
    
    // Contract analysis
    const analyzeBtn = document.getElementById('analyze-contract');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', handleAnalyzeContract);
    }
    
    // Debug tools
    const testWordApiBtn = document.getElementById('test-word-api');
    if (testWordApiBtn) {
        testWordApiBtn.addEventListener('click', handleTestWordApi);
    }
    
    const showDiagnosticsBtn = document.getElementById('show-diagnostics');
    if (showDiagnosticsBtn) {
        showDiagnosticsBtn.addEventListener('click', handleShowDiagnostics);
    }
    
    const testContractBtn = document.getElementById('test-contract-generation');
    if (testContractBtn) {
        testContractBtn.addEventListener('click', handleTestContractGeneration);
    }
    
    const testClauseBtn = document.getElementById('test-clause-replacement');
    if (testClauseBtn) {
        testClauseBtn.addEventListener('click', handleTestClauseReplacement);
    }
    
    // Contract type change
    const contractTypeSelect = document.getElementById('contract-type-select');
    if (contractTypeSelect) {
        contractTypeSelect.addEventListener('change', handleContractTypeChange);
    }
    
    // Modal close handlers
    setupModalHandlers();
    
    console.log("✅ Event listeners setup completed");
}

// Event Handlers
async function handleGenerateContract() {
    console.log("🔥 Generate contract button clicked!");
    try {
        await generateContract();
    } catch (error) {
        console.error("Error in generate contract handler:", error);
        updateStatus("Error generating contract: " + error.message, "error");
    }
}

async function handleAnalyzeContract() {
    console.log("🔍 Analyze contract button clicked!");
    updateStatus("Contract analysis feature coming soon...", "info");
    
    // TODO: Implement contract analysis
    // This would analyze the current document for clause compliance
}

async function handleTestWordApi() {
    console.log("🧪 Testing Word API...");
    
    if (typeof Word !== 'undefined' && typeof Word.run === 'function') {
        try {
            await Word.run(async (context) => {
                const body = context.document.body;
                body.insertText("Word API test successful! " + new Date().toLocaleTimeString(), Word.InsertLocation.end);
                await context.sync();
            });
            updateStatus("Word API test successful!", "success");
        } catch (error) {
            console.error("Word API test failed:", error);
            updateStatus("Word API test failed: " + error.message, "error");
        }
    } else {
        updateStatus("Word API not available", "warning");
    }
}

function handleShowDiagnostics() {
    console.log("📊 Showing diagnostics...");
    const diagnostics = showDiagnostics();
    
    // Show detailed diagnostics in console
    console.table(diagnostics);
}

async function handleTestContractGeneration() {
    console.log("🧪 Testing contract generation...");
    updateStatus("Testing contract generation...", "info");
    
    try {
        // Test with content-management type
        const { generateContractFromTSV } = await import('./services/contract-generator.js');
        const result = await generateContractFromTSV('content-management');
        
        if (result.success) {
            updateStatus("Contract generation test successful!", "success");
            console.log("Test result:", result);
        } else {
            updateStatus("Contract generation test failed: " + result.error, "error");
        }
    } catch (error) {
        console.error("Contract generation test error:", error);
        updateStatus("Contract generation test error: " + error.message, "error");
    }
}

async function handleTestClauseReplacement() {
    console.log("🧪 Testing clause replacement...");
    updateStatus("Testing clause replacement functionality...", "info");

    try {
        // Test Word API first
        const { debugWordAPI } = await import('./features/clause-replacement.js');
        const wordApiWorking = await debugWordAPI();

        // Test Legal Matrix loading
        const { legalMatrixService } = await import('./services/legal-matrix-service.js');
        await legalMatrixService.loadLegalMatrix();

        const clauseNumbers = legalMatrixService.getAvailableClauseNumbers();
        console.log(`Loaded ${clauseNumbers.length} clauses from Legal Matrix`);

        if (clauseNumbers.length > 0) {
            const testClause = legalMatrixService.getClause(clauseNumbers[0]);
            console.log("Sample clause:", testClause);

            const wordStatus = wordApiWorking ? "Word API: ✅ Working" : "Word API: ❌ Not Available";
            updateStatus(`Clause replacement test: ${clauseNumbers.length} clauses loaded. ${wordStatus}`,
                        wordApiWorking ? "success" : "warning");
        } else {
            updateStatus("No clauses found in Legal Matrix", "warning");
        }
    } catch (error) {
        console.error("Clause replacement test error:", error);
        updateStatus("Clause replacement test failed: " + error.message, "error");
    }
}

function handleContractTypeChange(event) {
    const selectedType = event.target.value;
    console.log("Contract type changed to:", selectedType);
    updateStatus(`Selected contract type: ${selectedType}`, "info");
    
    // Update form fields based on contract type if needed
    updateFormForContractType(selectedType);
}

function updateFormForContractType(contractType) {
    // Update agreement title based on contract type
    const agreementTitleInput = document.getElementById('agreement-title');
    if (agreementTitleInput) {
        if (contractType === 'content-management') {
            agreementTitleInput.value = 'DIGITAL VIDEO SERVICES AGREEMENT';
        } else if (contractType === 'data-pro') {
            agreementTitleInput.value = 'DATA LICENSE AGREEMENT';
        }
    }
}

// Modal handlers
function setupModalHandlers() {
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            hideModal(event.target.id);
        }
    });
    
    // Close modals with Escape key
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal.show');
            openModals.forEach(modal => {
                hideModal(modal.id);
            });
        }
    });
}

// Global modal functions (for onclick handlers in HTML)
window.closeReplacementModal = () => hideModal('replacement-modal');
window.closePreviewModal = () => hideModal('preview-modal');
window.previewReplacement = () => console.log("Preview replacement - coming soon");
window.applyReplacement = () => console.log("Apply replacement - coming soon");
window.confirmReplacement = () => console.log("Confirm replacement - coming soon");

// Error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    updateStatus("An error occurred. Check console for details.", "error");
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    updateStatus("An error occurred. Check console for details.", "error");
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Also initialize on window load as backup
window.addEventListener('load', () => {
    if (!isInitialized) {
        console.log("Backup initialization triggered");
        setTimeout(initializeApp, 1000);
    }
});

console.log("📱 Main application module loaded");
