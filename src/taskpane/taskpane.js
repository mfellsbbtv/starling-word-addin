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
  if (info.host === Office.HostApplication.Word) {
    console.log("RHEI AI Legal Assistant loaded successfully");

    // Check if Word API is available
    if (typeof Word === 'undefined') {
      console.error("Word API not available");
      updateStatus("Error: Word API not available. Please refresh the add-in.", "error");
      return;
    }

    console.log("Word API is available");

    // Initialize theme
    initializeTheme();

    // Set up event listeners
    setupEventListeners();

    // Initialize UI state
    initializeUI();

    console.log("Add-in initialization complete");
  } else {
    console.error("This add-in is designed for Microsoft Word only");
    updateStatus("Error: This add-in requires Microsoft Word", "error");
  }
});

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
