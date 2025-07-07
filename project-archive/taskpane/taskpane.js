// RHEI AI Legal Assistant - Main Taskpane Module
// Modular architecture for better maintainability

// Global state to track Word API availability
window.WORD_API_AVAILABLE = false;
window.OFFICE_READY = false;
window.WORD_API_READY = false;
window.INITIALIZATION_COMPLETE = false;

// NO IMPORTS AT TOP LEVEL - All imports will be dynamic to prevent Word API access during loading

// Safe initialization that doesn't depend on Word API immediately
async function safeInitialize() {
  console.log("Starting safe initialization...");

  try {
    // Dynamically import utilities
    const { initializeTheme, updateStatus } = await import('../shared/utils.js');

    // Initialize basic UI first
    initializeTheme();
    setupEventListeners();
    initializeBasicUI();

    // Check if Office is available
    if (typeof Office !== 'undefined') {
      console.log("Office.js is available, waiting for Office.onReady...");

      Office.onReady((info) => {
        console.log("Office.onReady called with info:", info);
        window.OFFICE_READY = true;

        // Check if Office.HostApplication is available
        if (typeof Office.HostApplication === 'undefined') {
          console.warn("Office.HostApplication is undefined, assuming Word environment");
          // Proceed with Word API check anyway
          checkWordAPIAvailabilityWithRetry();
        } else if (info.host === Office.HostApplication.Word) {
          console.log("RHEI AI Legal Assistant loaded successfully in Word");
          // Use enhanced Word API availability check with retry logic
          checkWordAPIAvailabilityWithRetry();
        } else {
          console.error("This add-in is designed for Microsoft Word only. Current host:", info.host);
          updateStatus("Error: This add-in requires Microsoft Word", "error");
        }
      });
    } else {
      console.error("Office.js is not available");
      updateStatus("Error: Office.js not loaded. Please refresh the page.", "error");
      initializeLimitedMode();
    }
  } catch (error) {
    console.error("Error during initialization:", error);
    // Fallback to basic initialization without imports
    basicInitialization();
  }
}

// Enhanced Word API availability check with retry logic and auto-fallback
function checkWordAPIAvailabilityWithRetry() {
  console.log("Starting enhanced Word API availability check...");

  let attempts = 0;
  const maxAttempts = 6; // 3 seconds total - faster fallback

  // Set up automatic fallback after 8 seconds total
  const autoFallbackTimeout = setTimeout(() => {
    console.log("Auto-fallback triggered - Word API test taking too long");
    clearInterval(checkInterval);
    handleWordAPIUnavailable();
  }, 8000);

  const checkInterval = setInterval(() => {
    attempts++;
    console.log(`Word API check attempt ${attempts}/${maxAttempts}`);

    try {
      if (typeof Word !== 'undefined' && typeof Word.run === 'function') {
        console.log("Word API is available!");
        clearInterval(checkInterval);
        clearTimeout(autoFallbackTimeout);
        window.WORD_API_AVAILABLE = true;
        window.WORD_API_READY = true;

        // Test Word API with a simple operation
        testWordAPIWithFallback();
        return;
      }

      // Check if we've reached max attempts
      if (attempts >= maxAttempts) {
        console.log("Word API not available after maximum attempts");
        clearInterval(checkInterval);
        clearTimeout(autoFallbackTimeout);
        handleWordAPIUnavailable();
        return;
      }

    } catch (error) {
      console.error(`Error checking Word API (attempt ${attempts}):`, error);
      if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        clearTimeout(autoFallbackTimeout);
        handleWordAPIUnavailable();
      }
    }
  }, 500); // Check every 500ms
}

// Test Word API with automatic fallback and skip button
async function testWordAPIWithFallback() {
  console.log("Testing Word API with automatic fallback...");

  // Show skip button after 4 seconds if test is still running
  const skipButtonTimeout = setTimeout(() => {
    showSkipTestButton();
  }, 4000);

  // Set up automatic fallback if test hangs
  const fallbackTimeout = setTimeout(() => {
    console.log("Word API test hanging - auto-falling back to demo mode");
    hideSkipTestButton();
    handleWordAPIUnavailable();
  }, 10000); // 10 second fallback

  try {
    await testWordAPI();
    clearTimeout(fallbackTimeout);
    clearTimeout(skipButtonTimeout);
    hideSkipTestButton();
  } catch (error) {
    clearTimeout(fallbackTimeout);
    clearTimeout(skipButtonTimeout);
    hideSkipTestButton();
    console.error("Word API test failed, falling back:", error);
    handleWordAPIUnavailable();
  }
}

// Show the skip test button
function showSkipTestButton() {
  console.log("Showing skip test button...");
  const skipSection = document.getElementById("skip-test-section");
  if (skipSection) {
    skipSection.style.display = "block";
  }
}

// Hide the skip test button
function hideSkipTestButton() {
  const skipSection = document.getElementById("skip-test-section");
  if (skipSection) {
    skipSection.style.display = "none";
  }
}

// Handle skip Word API test
async function skipWordAPITest() {
  console.log("User chose to skip Word API test");

  try {
    const { updateStatus } = await import('../shared/utils.js');
    updateStatus("Skipping Word API test - continuing in demo mode", "warning");
  } catch (error) {
    console.error("Error importing updateStatus:", error);
  }

  hideSkipTestButton();
  handleWordAPIUnavailable();
}

// Fallback to original check method
function checkWordAPIAvailability() {
  console.log("Checking Word API availability (fallback method)...");

  // Use a try-catch to safely check for Word API
  try {
    if (typeof Word !== 'undefined' && typeof Word.run === 'function') {
      console.log("Word API is available!");
      window.WORD_API_AVAILABLE = true;

      // Test Word API with a simple operation
      testWordAPI();
    } else {
      console.log("Word API is not available");
      handleWordAPIUnavailable();
    }
  } catch (error) {
    console.error("Error checking Word API:", error);
    handleWordAPIUnavailable();
  }
}

// Ultra-minimal and reliable Word API test
async function testWordAPI() {
  console.log("Testing Word API functionality with ultra-minimal test...");

  try {
    const { updateStatus } = await import('../shared/utils.js');
    updateStatus("Testing Word API connection...", "info");

    // Use the absolute minimal Word API test - just create a context
    const testPromise = new Promise((resolve, reject) => {
      try {
        Word.run(async (context) => {
          // Absolutely minimal test - just access context
          console.log("Word.run context created successfully");
          resolve(true);
        }).catch(reject);
      } catch (error) {
        reject(error);
      }
    });

    // Very short timeout for quick fallback
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Word API test timeout")), 3000);
    });

    await Promise.race([testPromise, timeoutPromise]);

    // If we get here, the test was successful
    console.log("Word API test completed successfully!");
    updateStatus("Word API available - all features enabled", "success");
    window.INITIALIZATION_COMPLETE = true;
    enableWordFeatures();

  } catch (error) {
    console.error("Word API test failed:", error);

    // Provide specific error information
    let errorMessage = "Word API test failed";
    if (error.message.includes("timeout")) {
      errorMessage = "Word API connection timeout";
    } else if (error.message.includes("InvalidApiCallInContext")) {
      errorMessage = "Word API context not ready";
    } else if (error.message.includes("permission")) {
      errorMessage = "Insufficient permissions for Word API";
    } else if (error.message.includes("GeneralException")) {
      errorMessage = "Word API general error";
    } else if (error.message.includes("ItemNotFound")) {
      errorMessage = "Word API item not found";
    }

    console.log(`Word API test failed: ${errorMessage}, switching to demo mode`);

    try {
      const { updateStatus } = await import('../shared/utils.js');
      updateStatus(errorMessage + " - switching to demo mode", "warning");
    } catch (importError) {
      console.error("Error importing updateStatus:", importError);
    }

    handleWordAPIUnavailable();
  }
}

// Handle case where Word API is unavailable
async function handleWordAPIUnavailable() {
  console.log("Word API is unavailable - enabling demo mode");
  window.WORD_API_AVAILABLE = false;

  try {
    const { updateStatus } = await import('../shared/utils.js');
    updateStatus("Demo mode - Word API not available. Some features limited.", "warning");
  } catch (error) {
    console.error("Error importing updateStatus:", error);
    // Fallback to basic status update
    const statusElement = document.getElementById("status-message");
    if (statusElement) {
      statusElement.textContent = "Demo mode - Word API not available. Some features limited.";
    }
  }

  enableDemoMode();
}

// Basic initialization without any imports (fallback)
function basicInitialization() {
  console.log("Running basic initialization fallback...");

  // Basic theme setup
  if (document.body) {
    document.body.classList.add('ms-font-m', 'ms-welcome', 'ms-Fabric');
  }

  // Basic UI setup
  const statusElement = document.getElementById("status-message");
  if (statusElement) {
    statusElement.textContent = "Add-in loaded in basic mode. Limited functionality available.";
  }

  // Disable all buttons except always-enabled ones
  const allButtons = document.querySelectorAll('button');
  const alwaysEnabledIds = ['test-word-api', 'show-diagnostics'];

  allButtons.forEach(button => {
    if (!alwaysEnabledIds.includes(button.id)) {
      button.disabled = true;
      button.title = "Feature not available in basic mode";
    }
  });

  // Explicitly enable always-enabled buttons
  alwaysEnabledIds.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = false;
      button.title = buttonId === 'test-word-api' ? "Test Word API functionality" : "Show diagnostic information";
    }
  });

  console.log("Basic initialization complete");
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeInitialize);
} else {
  safeInitialize();
}

// Enable Word-dependent features
function enableWordFeatures() {
  console.log("Enabling Word-dependent features...");

  // Enable all Word-dependent buttons
  const wordDependentButtons = [
    "generate-contract",
    "analyze-contract",
    "toggle-track-changes",
    "highlight-risks",
    "suggest-changes"
  ];

  wordDependentButtons.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = false;
      button.title = "";
    }
  });

  // Always enable diagnostic buttons
  const alwaysEnabledButtons = [
    "test-word-api"
  ];

  alwaysEnabledButtons.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = false;
      button.title = "Test Word API functionality";
    }
  });

  // Show generate button group
  const generateButtonGroup = document.getElementById("generate-button-group");
  if (generateButtonGroup) {
    generateButtonGroup.style.display = "block";
  }
}

// Enable demo mode (Word API not available)
function enableDemoMode() {
  console.log("Enabling demo mode...");

  // Enable only demo-compatible features
  const demoButtons = ["analyze-contract"]; // Analysis can work with demo data

  demoButtons.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = false;
      button.title = "Demo mode - uses sample data";
    }
  });

  // Disable Word-dependent buttons
  const wordOnlyButtons = [
    "generate-contract",
    "toggle-track-changes",
    "highlight-risks",
    "suggest-changes"
  ];

  wordOnlyButtons.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = true;
      button.title = "Requires Word API - not available in current environment";
    }
  });

  // Always enable diagnostic buttons even in demo mode
  const alwaysEnabledButtons = [
    "test-word-api"
  ];

  alwaysEnabledButtons.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = false;
      button.title = "Test Word API functionality";
    }
  });

  // Hide generate button group since it requires Word API
  const generateButtonGroup = document.getElementById("generate-button-group");
  if (generateButtonGroup) {
    generateButtonGroup.style.display = "none";
  }
}

// Initialize in limited mode when Word API is not available
async function initializeLimitedMode() {
  console.log("Initializing in limited mode without Word API");

  try {
    const { initializeTheme, updateStatus } = await import('../shared/utils.js');

    // Initialize theme and basic UI
    initializeTheme();
    setupEventListeners();
    initializeLimitedUI();

    updateStatus("Add-in loaded in limited mode. Some features may not be available.", "warning");
  } catch (error) {
    console.error("Error in limited mode initialization:", error);
    basicInitialization();
  }
}

// Enhanced diagnostic information for debugging Word API issues
async function showDiagnosticInfo() {
  try {
    // Use the comprehensive diagnostics from event-handlers
    const { showWordAPIDiagnostics } = await import('./modules/event-handlers.js');
    await showWordAPIDiagnostics();
    return;
  } catch (error) {
    console.error("Error loading comprehensive diagnostics, using fallback:", error);
  }

  // Fallback to original diagnostics
  showBasicDiagnosticInfo();
}

function showBasicDiagnosticInfo() {
  const diagnosticInfo = {
    // Office.js information
    officeVersion: Office?.context?.diagnostics?.version || "Unknown",
    platform: Office?.context?.diagnostics?.platform || "Unknown",
    host: Office?.context?.diagnostics?.host || "Unknown",
    officeJsLoaded: typeof Office !== 'undefined',
    hostApplicationAvailable: typeof Office?.HostApplication !== 'undefined',
    wordHostConstant: Office?.HostApplication?.Word || "Not available",

    // Word API information
    wordApiAvailable: typeof Word !== 'undefined',
    wordRunAvailable: typeof Word?.run === 'function',
    wordApiReady: window.WORD_API_READY || false,
    wordApiAvailableGlobal: window.WORD_API_AVAILABLE || false,

    // Environment information
    requirements: Office?.context?.requirements || "Not available",
    userAgent: navigator.userAgent || "Unknown",
    location: window.location.href,

    // Initialization state
    officeReady: window.OFFICE_READY || false,
    initializationComplete: window.INITIALIZATION_COMPLETE || false,

    // Browser and network
    isOnline: navigator.onLine,
    cookiesEnabled: navigator.cookieEnabled,
    language: navigator.language,

    // Timing information
    timestamp: new Date().toISOString()
  };

  console.log("Enhanced Diagnostic Information:", diagnosticInfo);

  const statusMessage = `Diagnostic - Office: ${diagnosticInfo.officeVersion}, Platform: ${diagnosticInfo.platform}, Word API: ${diagnosticInfo.wordApiAvailable ? 'Available' : 'Not Available'}, Ready: ${diagnosticInfo.wordApiReady}`;

  try {
    updateStatus(statusMessage, "info");
  } catch (error) {
    console.error("Error updating status:", error);
  }

  // Also display detailed diagnostic info in the UI
  displayDiagnosticInfo(diagnosticInfo);

  return diagnosticInfo;
}

// Enhanced diagnostic display with comprehensive information
function displayDiagnosticInfo(diagnosticInfo) {
  const statusElement = document.getElementById("status-message");
  if (statusElement) {
    statusElement.innerHTML = `
      <div class="diagnostic-info" style="text-align: left; font-size: 11px; line-height: 1.4;">
        <h4 style="margin: 0 0 10px 0; color: #0078d4;">Word API Diagnostic Information</h4>

        <div style="margin-bottom: 8px;">
          <strong>Office Environment:</strong><br>
          • Version: ${diagnosticInfo.officeVersion}<br>
          • Platform: ${diagnosticInfo.platform}<br>
          • Host: ${diagnosticInfo.host}<br>
          • HostApplication Available: ${diagnosticInfo.hostApplicationAvailable ? '✅ Yes' : '❌ No'}<br>
          • Word Host Constant: ${diagnosticInfo.wordHostConstant}<br>
          • Online: ${diagnosticInfo.isOnline ? 'Yes' : 'No'}
        </div>

        <div style="margin-bottom: 8px;">
          <strong>Word API Status:</strong><br>
          • Word Object: ${diagnosticInfo.wordApiAvailable ? '✅ Available' : '❌ Not Available'}<br>
          • Word.run Function: ${diagnosticInfo.wordRunAvailable ? '✅ Available' : '❌ Not Available'}<br>
          • API Ready: ${diagnosticInfo.wordApiReady ? '✅ Yes' : '❌ No'}<br>
          • Global Available: ${diagnosticInfo.wordApiAvailableGlobal ? '✅ Yes' : '❌ No'}
        </div>

        <div style="margin-bottom: 8px;">
          <strong>Initialization:</strong><br>
          • Office.js: ${diagnosticInfo.officeJsLoaded ? '✅ Loaded' : '❌ Not Loaded'}<br>
          • Office Ready: ${diagnosticInfo.officeReady ? '✅ Yes' : '❌ No'}<br>
          • Init Complete: ${diagnosticInfo.initializationComplete ? '✅ Yes' : '❌ No'}
        </div>

        <div style="margin-bottom: 8px;">
          <strong>Environment:</strong><br>
          • Browser: ${diagnosticInfo.userAgent.split(' ').slice(-2).join(' ')}<br>
          • Language: ${diagnosticInfo.language}<br>
          • Cookies: ${diagnosticInfo.cookiesEnabled ? 'Enabled' : 'Disabled'}
        </div>

        <div style="margin-top: 10px; padding: 8px; background: #f0f0f0; border-radius: 4px;">
          <strong>Troubleshooting:</strong><br>
          ${diagnosticInfo.wordApiAvailable ?
            '✅ Word API is available. If features aren\'t working, try refreshing.' :
            '❌ Word API not available. Try: 1) Refresh page, 2) Restart Word, 3) Check network connection'
          }
        </div>

        <div style="margin-top: 8px; font-size: 10px; color: #666;">
          Generated: ${diagnosticInfo.timestamp}
        </div>
      </div>
    `;
  }
}

// Set up all event listeners with safe handlers
function setupEventListeners() {
  // Contract generation events
  const generateBtn = document.getElementById("generate-contract");
  if (generateBtn) {
    generateBtn.addEventListener("click", safeGenerateSimpleContract);
  }

  // Contract analysis events
  const analyzeBtn = document.getElementById("analyze-contract");
  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", safeAnalyzeContract);
  }

  // Form change events
  const agreementTypeSelect = document.getElementById("agreement-type");
  if (agreementTypeSelect) {
    agreementTypeSelect.addEventListener("change", safeHandleAgreementTypeChange);
  }

  const contentTypeSelect = document.getElementById("content-type");
  if (contentTypeSelect) {
    contentTypeSelect.addEventListener("change", safeHandleContentTypeChange);
  }

  // Clear buttons
  const clearResultsBtn = document.getElementById("clear-results");
  if (clearResultsBtn) {
    clearResultsBtn.addEventListener("click", safeClearResults);
  }

  const clearSuggestionsBtn = document.getElementById("clear-suggestions");
  if (clearSuggestionsBtn) {
    clearSuggestionsBtn.addEventListener("click", safeClearSuggestions);
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

  // Add Test Word API button
  const testWordAPIBtn = document.getElementById("test-word-api");
  if (testWordAPIBtn) {
    testWordAPIBtn.addEventListener("click", safeTestWordAPI);
  }

  // Add diagnostic button if it exists
  const diagnosticBtn = document.getElementById("show-diagnostics");
  if (diagnosticBtn) {
    diagnosticBtn.addEventListener("click", showDiagnosticInfo);
  }

  // Add skip Word API test button if it exists
  const skipTestBtn = document.getElementById("skip-word-api-test");
  if (skipTestBtn) {
    skipTestBtn.addEventListener("click", skipWordAPITest);
  }

  console.log("Event listeners set up successfully");
}

// Initialize basic UI (before Word API check)
async function initializeBasicUI() {
  // Hide dynamic sections initially
  const dynamicForm = document.getElementById("dynamic-form");
  const generateButtonGroup = document.getElementById("generate-button-group");
  const contentTypeGroup = document.getElementById("content-type-group");
  const resultsSection = document.getElementById("results-section");
  const suggestionsSection = document.getElementById("suggestions-section");
  const progressSection = document.getElementById("progress-section");

  if (dynamicForm) dynamicForm.style.display = "none";
  if (generateButtonGroup) generateButtonGroup.style.display = "none"; // Hide until Word API check
  if (contentTypeGroup) contentTypeGroup.style.display = "none";
  if (resultsSection) resultsSection.style.display = "none";
  if (suggestionsSection) suggestionsSection.style.display = "none";
  if (progressSection) progressSection.style.display = "none";

  // Disable all buttons initially
  const allButtons = [
    "generate-contract",
    "analyze-contract",
    "toggle-track-changes",
    "highlight-risks",
    "suggest-changes",
    "check-compliance"
  ];

  // Always-enabled buttons (diagnostic tools)
  const alwaysEnabledButtons = [
    "test-word-api"
  ];

  allButtons.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = true;
      button.title = "Initializing...";
    }
  });

  // Enable always-enabled buttons (diagnostic tools)
  alwaysEnabledButtons.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = false;
      button.title = "Test Word API functionality";
    }
  });

  // Set initial status
  try {
    const { updateStatus } = await import('../shared/utils.js');
    updateStatus("Initializing add-in...", "info");
  } catch (error) {
    console.error("Error importing updateStatus:", error);
    const statusElement = document.getElementById("status-message");
    if (statusElement) {
      statusElement.textContent = "Initializing add-in...";
    }
  }

  console.log("Basic UI initialized successfully");
}

// Initialize UI in limited mode (when Word API is not available)
function initializeLimitedUI() {
  // Hide dynamic sections initially
  const dynamicForm = document.getElementById("dynamic-form");
  const generateButtonGroup = document.getElementById("generate-button-group");
  const contentTypeGroup = document.getElementById("content-type-group");
  const resultsSection = document.getElementById("results-section");
  const suggestionsSection = document.getElementById("suggestions-section");
  const progressSection = document.getElementById("progress-section");

  if (dynamicForm) dynamicForm.style.display = "none";
  if (generateButtonGroup) generateButtonGroup.style.display = "none"; // Hide generate button in limited mode
  if (contentTypeGroup) contentTypeGroup.style.display = "none";
  if (resultsSection) resultsSection.style.display = "none";
  if (suggestionsSection) suggestionsSection.style.display = "none";
  if (progressSection) progressSection.style.display = "none";

  // Disable Word-dependent buttons
  const wordDependentButtons = [
    "generate-contract",
    "analyze-contract",
    "toggle-track-changes",
    "highlight-risks",
    "suggest-changes"
  ];

  wordDependentButtons.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = true;
      button.title = "Word API not available - feature disabled";
    }
  });

  // Always enable diagnostic buttons even in limited mode
  const alwaysEnabledButtons = [
    "test-word-api"
  ];

  alwaysEnabledButtons.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = false;
      button.title = "Test Word API functionality";
    }
  });

  console.log("Limited UI initialized successfully");
}

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  safeHandleError(event.error);
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  safeHandleError(event.reason);
});

// Safe error handler that doesn't depend on imports
async function safeHandleError(error) {
  try {
    const { handleError } = await import('../shared/utils.js');
    handleError(error);
  } catch (importError) {
    console.error("Error importing handleError:", importError);
    // Fallback error handling
    const statusElement = document.getElementById("status-message");
    if (statusElement) {
      statusElement.textContent = `Error: ${error.message || error}`;
      statusElement.className = "status-message ms-font-s error";
    }
  }
}

// Safe clear functions
async function safeClearResults() {
  try {
    const { clearResults } = await import('../shared/utils.js');
    clearResults();
  } catch (error) {
    console.error("Error importing clearResults:", error);
    // Fallback clear
    const resultsSection = document.getElementById("results-section");
    if (resultsSection) {
      resultsSection.style.display = "none";
    }
  }
}

async function safeClearSuggestions() {
  try {
    const { clearSuggestions } = await import('../shared/utils.js');
    clearSuggestions();
  } catch (error) {
    console.error("Error importing clearSuggestions:", error);
    // Fallback clear
    const suggestionsSection = document.getElementById("suggestions-section");
    if (suggestionsSection) {
      suggestionsSection.style.display = "none";
    }
  }
}

// Safe wrapper functions that check Word API availability
async function safeGenerateSimpleContract() {
  if (!window.WORD_API_AVAILABLE) {
    try {
      const { updateStatus } = await import('../shared/utils.js');
      updateStatus("Error: Word API not available. Cannot generate contract.", "error");
    } catch (error) {
      console.error("Error importing updateStatus:", error);
    }
    return;
  }

  try {
    const { generateSimpleContractHandler } = await import('./modules/event-handlers.js');
    await generateSimpleContractHandler();
  } catch (error) {
    console.error("Error importing or calling generateSimpleContractHandler:", error);
    try {
      const { updateStatus } = await import('../shared/utils.js');
      updateStatus("Error: Failed to generate contract. " + error.message, "error");
    } catch (importError) {
      console.error("Error importing updateStatus:", importError);
    }
  }
}

async function safeGenerateContract() {
  if (!window.WORD_API_AVAILABLE) {
    try {
      const { updateStatus } = await import('../shared/utils.js');
      updateStatus("Error: Word API not available. Cannot generate contract.", "error");
    } catch (error) {
      console.error("Error importing updateStatus:", error);
    }
    return;
  }

  try {
    const { generateContract } = await import('./modules/event-handlers.js');
    await generateContract();
  } catch (error) {
    console.error("Error importing or calling generateContract:", error);
    try {
      const { updateStatus } = await import('../shared/utils.js');
      updateStatus("Error: Failed to generate contract. " + error.message, "error");
    } catch (importError) {
      console.error("Error importing updateStatus:", importError);
    }
  }
}

async function safeAnalyzeContract() {
  try {
    if (window.WORD_API_AVAILABLE) {
      // Use real Word API
      const { analyzeContract } = await import('./modules/event-handlers.js');
      await analyzeContract();
    } else {
      // Use demo mode
      await analyzeDemoContract();
    }
  } catch (error) {
    console.error("Error in contract analysis:", error);
    try {
      const { updateStatus } = await import('../shared/utils.js');
      updateStatus("Error: Failed to analyze contract. " + error.message, "error");
    } catch (importError) {
      console.error("Error importing updateStatus:", importError);
    }
  }
}

// Safe wrapper for Word API test
async function safeTestWordAPI() {
  try {
    const { testWordAPI } = await import('./modules/event-handlers.js');
    await testWordAPI();
  } catch (error) {
    console.error("Error in Word API test:", error);
    try {
      const { updateStatus } = await import('../shared/utils.js');
      updateStatus("Error: Failed to test Word API. " + error.message, "error");
    } catch (importError) {
      console.error("Error importing updateStatus:", importError);
    }
  }
}

async function safeHandleAgreementTypeChange(event) {
  try {
    const { handleAgreementTypeChange } = await import('./modules/event-handlers.js');
    handleAgreementTypeChange(event);
  } catch (error) {
    console.error("Error handling agreement type change:", error);
  }
}

async function safeHandleContentTypeChange(event) {
  try {
    const { handleContentTypeChange } = await import('./modules/event-handlers.js');
    handleContentTypeChange(event);
  } catch (error) {
    console.error("Error handling content type change:", error);
  }
}

// Demo contract analysis (when Word API is not available)
async function analyzeDemoContract() {
  try {
    const { updateStatus } = await import('../shared/utils.js');
    updateStatus("Running demo analysis with sample contract...", "info");

    try {
      // Import demo analysis functions
      const { generateDemoAnalysis, generateRiskAnalysis, generateChangeSuggestions } = await import('./services/contract-analyzer.js');
      const { displayCombinedAnalysisResults } = await import('./modules/ui-display.js');

      // Use sample contract text
      const sampleContract = `SAMPLE CONTENT MANAGEMENT AGREEMENT

This Content Management Agreement is entered into between Company A and Company B.

1. SCOPE OF SERVICES
The Manager will provide content management services including distribution and marketing.

2. COMPENSATION
Revenue will be split 80% to Artist and 20% to Manager.

3. TERM
This agreement is effective for 2 years from the date of signing.`;

      // Perform demo analysis
      const [analysisResult, riskAnalysis, changeSuggestions] = await Promise.all([
        generateDemoAnalysis(sampleContract),
        generateRiskAnalysis(sampleContract),
        generateChangeSuggestions(sampleContract)
      ]);

      // Generate executive summary
      const summaryResult = {
        title: "📊 Executive Summary (Demo)",
        overview: "This is a demo analysis using sample contract data. In real mode, this would analyze your actual Word document."
      };

      // Display results
      displayCombinedAnalysisResults(analysisResult, riskAnalysis, changeSuggestions, summaryResult);

      updateStatus("Demo analysis complete! This used sample data.", "success");

    } catch (error) {
      console.error("Error in demo analysis:", error);
      updateStatus("Error: Failed to run demo analysis. " + error.message, "error");
    }
  } catch (importError) {
    console.error("Error importing updateStatus:", importError);
    // Fallback status update
    const statusElement = document.getElementById("status-message");
    if (statusElement) {
      statusElement.textContent = "Error: Failed to run demo analysis.";
    }
  }
}

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
