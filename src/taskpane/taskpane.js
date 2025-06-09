// RHEI AI Legal Assistant - Main Taskpane Module
// Modular architecture for better maintainability

// Import all modules and services
import { initializeTheme, updateStatus, clearResults, clearSuggestions, handleError } from '../shared/utils.js';
import { 
  generateContract, 
  analyzeContract, 
  handleAgreementTypeChange, 
  handleContentTypeChange 
} from './modules/event-handlers.js';

// Initialize the add-in
Office.onReady((info) => {
  console.log("Office.onReady called with info:", info);

  if (info.host === Office.HostApplication.Word) {
    console.log("RHEI AI Legal Assistant loaded successfully in Word");

    // Wait a moment for Word API to fully load, then check
    setTimeout(() => {
      checkWordAPIAndInitialize();
    }, 1000);

  } else {
    console.error("This add-in is designed for Microsoft Word only. Current host:", info.host);
    updateStatus("Error: This add-in requires Microsoft Word", "error");
  }
});

// Check Word API availability and initialize
function checkWordAPIAndInitialize() {
  console.log("Checking Word API availability...");
  console.log("typeof Word:", typeof Word);
  console.log("Office.context:", Office.context);
  console.log("Office.context.requirements:", Office.context.requirements);

  // Check if Word API is available
  if (typeof Word === 'undefined') {
    console.error("Word API not available - typeof Word is undefined");

    // Try to wait a bit longer and check again
    setTimeout(() => {
      console.log("Retrying Word API check...");
      if (typeof Word === 'undefined') {
        console.error("Word API still not available after retry");
        updateStatus("Error: Word API not available. Please ensure you're using Word Online or Word Desktop with add-in support.", "error");

        // Show diagnostic information
        showDiagnosticInfo();
        return;
      } else {
        console.log("Word API became available on retry");
        proceedWithInitialization();
      }
    }, 2000);

    return;
  }

  console.log("Word API is available");
  proceedWithInitialization();
}

// Proceed with normal initialization
function proceedWithInitialization() {
  console.log("Proceeding with add-in initialization...");

  // Initialize theme
  initializeTheme();

  // Set up event listeners
  setupEventListeners();

  // Initialize UI state
  initializeUI();

  console.log("Add-in initialization complete");
}

// Show diagnostic information for debugging
function showDiagnosticInfo() {
  const diagnosticInfo = {
    officeVersion: Office.context?.diagnostics?.version || "Unknown",
    platform: Office.context?.diagnostics?.platform || "Unknown",
    host: Office.context?.diagnostics?.host || "Unknown",
    wordApiAvailable: typeof Word !== 'undefined',
    officeJsLoaded: typeof Office !== 'undefined',
    requirements: Office.context?.requirements || "Not available"
  };

  console.log("Diagnostic Information:", diagnosticInfo);

  updateStatus(`Diagnostic: Office ${diagnosticInfo.officeVersion} on ${diagnosticInfo.platform}, Word API: ${diagnosticInfo.wordApiAvailable}`, "error");
}

// Set up all event listeners
function setupEventListeners() {
  // Contract generation events
  const generateBtn = document.getElementById("generate-contract");
  if (generateBtn) {
    generateBtn.addEventListener("click", generateContract);
  }

  // Contract analysis events
  const analyzeBtn = document.getElementById("analyze-contract");
  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", analyzeContract);
  }

  // Form change events
  const agreementTypeSelect = document.getElementById("agreement-type");
  if (agreementTypeSelect) {
    agreementTypeSelect.addEventListener("change", handleAgreementTypeChange);
  }

  const contentTypeSelect = document.getElementById("content-type");
  if (contentTypeSelect) {
    contentTypeSelect.addEventListener("change", handleContentTypeChange);
  }

  // Clear buttons
  const clearResultsBtn = document.getElementById("clear-results");
  if (clearResultsBtn) {
    clearResultsBtn.addEventListener("click", clearResults);
  }

  const clearSuggestionsBtn = document.getElementById("clear-suggestions");
  if (clearSuggestionsBtn) {
    clearSuggestionsBtn.addEventListener("click", clearSuggestions);
  }

  // Additional feature buttons
  const toggleTrackChangesBtn = document.getElementById("toggle-track-changes");
  if (toggleTrackChangesBtn) {
    toggleTrackChangesBtn.addEventListener("click", toggleTrackChanges);
  }

  const highlightRisksBtn = document.getElementById("highlight-risks");
  if (highlightRisksBtn) {
    highlightRisksBtn.addEventListener("click", highlightRisks);
  }

  const checkComplianceBtn = document.getElementById("check-compliance");
  if (checkComplianceBtn) {
    checkComplianceBtn.addEventListener("click", checkCompliance);
  }

  const suggestChangesBtn = document.getElementById("suggest-changes");
  if (suggestChangesBtn) {
    suggestChangesBtn.addEventListener("click", suggestChanges);
  }

  console.log("Event listeners set up successfully");
}

// Initialize UI state
function initializeUI() {
  // Hide dynamic sections initially
  const dynamicForm = document.getElementById("dynamic-form");
  const generateButtonGroup = document.getElementById("generate-button-group");
  const contentTypeGroup = document.getElementById("content-type-group");
  const resultsSection = document.getElementById("results-section");
  const suggestionsSection = document.getElementById("suggestions-section");
  const progressSection = document.getElementById("progress-section");

  if (dynamicForm) dynamicForm.style.display = "none";
  if (generateButtonGroup) generateButtonGroup.style.display = "none";
  if (contentTypeGroup) contentTypeGroup.style.display = "none";
  if (resultsSection) resultsSection.style.display = "none";
  if (suggestionsSection) suggestionsSection.style.display = "none";
  if (progressSection) progressSection.style.display = "none";

  // Set initial status
  updateStatus("Ready to generate or analyze contracts", "info");

  console.log("UI initialized successfully");
}

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  handleError(event.error);
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  handleError(event.reason);
});

// Placeholder functions for additional features
function toggleTrackChanges() {
  updateStatus("Toggling track changes...", "info");
  // Implementation will be added later
}

function highlightRisks() {
  updateStatus("Highlighting risks...", "info");
  // Implementation will be added later
}

function checkCompliance() {
  updateStatus("Checking compliance...", "info");
  // Implementation will be added later
}

function suggestChanges() {
  updateStatus("Applying suggested changes...", "info");
  // Implementation will be added later
}

console.log("RHEI AI Legal Assistant module loaded");
