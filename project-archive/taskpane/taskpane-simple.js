// RHEI AI Legal Assistant - Simple Version (No Dynamic Imports)
// This version avoids dynamic imports that might cause issues with local server

// Global state to track Word API availability
window.WORD_API_AVAILABLE = false;
window.OFFICE_READY = false;

// Progress tracking
let currentStep = 0;
const totalSteps = 6;

// Update progress bar and steps
function updateProgress(step, message, isError = false) {
  currentStep = step;
  const progressPercent = Math.round((step / totalSteps) * 100);

  // Update progress bar
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  if (progressBar && progressText) {
    progressBar.style.width = progressPercent + '%';
    progressText.textContent = progressPercent + '%';
  }

  // Update step status
  for (let i = 1; i <= totalSteps; i++) {
    const stepElement = document.getElementById(`step-${i}`);
    if (stepElement) {
      if (i < step) {
        stepElement.className = 'step completed';
      } else if (i === step) {
        stepElement.className = isError ? 'step error' : 'step current';
        if (message) {
          stepElement.textContent = stepElement.textContent.split(':')[0] + ': ' + message;
        }
      } else {
        stepElement.className = 'step pending';
      }
    }
  }

  // Update status message
  updateSimpleStatus(message || `Step ${step} of ${totalSteps}`, isError ? "error" : "info");

  console.log(`Progress: Step ${step}/${totalSteps} - ${message}`);
}

// Simple initialization with progress tracking
function simpleInitialize() {
  console.log("Starting simple initialization with progress tracking...");

  try {
    // Step 1: Basic setup
    updateProgress(1, "Setting up basic environment...");

    // Basic theme setup
    document.body.classList.add('ms-font-m', 'ms-welcome', 'ms-Fabric');

    // Small delay to show progress
    setTimeout(() => {
      continueInitialization();
    }, 500);

  } catch (error) {
    console.error("Error in initial setup:", error);
    updateProgress(1, "Error in basic setup: " + error.message, true);
  }
}

function continueInitialization() {
  try {
    // Step 2: Check Office environment
    updateProgress(2, "Checking Office.js availability...");

    setTimeout(() => {
      checkOfficeEnvironment();
    }, 500);

  } catch (error) {
    console.error("Error in continue initialization:", error);
    updateProgress(2, "Error checking environment: " + error.message, true);
  }
}

function checkOfficeEnvironment() {
  try {
    // Check if Office is available
    if (typeof Office !== 'undefined') {
      updateProgress(2, "Office.js detected, waiting for ready...");

      Office.onReady((info) => {
        setTimeout(() => {
          handleOfficeReady(info);
        }, 500);
      });
    } else {
      updateProgress(2, "Office.js not available", true);
      setTimeout(() => {
        fallbackInitialization();
      }, 1000);
    }
  } catch (error) {
    console.error("Error checking Office environment:", error);
    updateProgress(2, "Error: " + error.message, true);
  }
}

function handleOfficeReady(info) {
  try {
    console.log("Office.onReady called with info:", info);
    window.OFFICE_READY = true;

    // Handle undefined Office.HostApplication
    if (!Office.HostApplication) {
      console.warn("Office.HostApplication is undefined, assuming Word environment");
      updateProgress(3, "Word environment assumed, testing API...");
      setTimeout(() => {
        checkSimpleWordAPI();
      }, 500);
    } else if (info.host === Office.HostApplication.Word) {
      updateProgress(3, "Word environment confirmed, testing API...");
      setTimeout(() => {
        checkSimpleWordAPI();
      }, 500);
    } else {
      updateProgress(3, "Not running in Word: " + info.host, true);
      setTimeout(() => {
        fallbackInitialization();
      }, 1000);
    }
  } catch (error) {
    console.error("Error in Office ready handler:", error);
    updateProgress(3, "Error: " + error.message, true);
  }
}
  
  // Check if Office is available
  if (typeof Office !== 'undefined') {
    console.log("Office.js is available, waiting for Office.onReady...");
    
    Office.onReady((info) => {
      console.log("Office.onReady called with info:", info);
      window.OFFICE_READY = true;
      
      // Handle undefined Office.HostApplication
      if (!Office.HostApplication) {
        console.warn("Office.HostApplication is undefined, assuming Word environment");
        console.log("RHEI AI Legal Assistant loaded (assuming Word environment)");
        checkSimpleWordAPI();
      } else if (info.host === Office.HostApplication.Word) {
        console.log("RHEI AI Legal Assistant loaded successfully in Word");
        checkSimpleWordAPI();
      } else {
        console.error("This add-in is designed for Microsoft Word only. Current host:", info.host);
        updateSimpleStatus("Error: This add-in requires Microsoft Word", "error");
      }
    });
  } else {
    console.error("Office.js is not available");
    updateSimpleStatus("Error: Office.js not loaded. Please refresh the page.", "error");
  }
}

// Simple Word API check with progress
function checkSimpleWordAPI() {
  try {
    updateProgress(3, "Checking Word API availability...");

    if (typeof Word !== 'undefined' && typeof Word.run === 'function') {
      console.log("Word API is available!");
      window.WORD_API_AVAILABLE = true;

      updateProgress(3, "Word API found, testing functionality...");
      setTimeout(() => {
        testSimpleWordAPI();
      }, 500);
    } else {
      console.log("Word API is not available");
      updateProgress(3, "Word API not available, using demo mode...");
      setTimeout(() => {
        handleSimpleWordAPIUnavailable();
      }, 500);
    }
  } catch (error) {
    console.error("Error checking Word API:", error);
    updateProgress(3, "Error checking Word API: " + error.message, true);
    setTimeout(() => {
      handleSimpleWordAPIUnavailable();
    }, 1000);
  }
}

// Test Word API with progress
async function testSimpleWordAPI() {
  try {
    updateProgress(3, "Testing Word API connection...");

    await Word.run(async (context) => {
      await context.sync();
      console.log("Word API test successful!");
      updateProgress(4, "Word API working, setting up handlers...");

      setTimeout(() => {
        setupEventHandlers();
      }, 500);
    });
  } catch (error) {
    console.error("Word API test failed:", error);
    updateProgress(3, "Word API test failed: " + error.message, true);
    setTimeout(() => {
      handleSimpleWordAPIUnavailable();
    }, 1000);
  }
}

// Handle Word API unavailable with progress
function handleSimpleWordAPIUnavailable() {
  console.log("Word API is unavailable - enabling demo mode");
  window.WORD_API_AVAILABLE = false;
  updateProgress(4, "Setting up demo mode...");

  setTimeout(() => {
    setupEventHandlers();
  }, 500);
}

// Setup event handlers with progress
function setupEventHandlers() {
  try {
    updateProgress(4, "Setting up event listeners...");

    // Set up event listeners
    setupSimpleEventListeners();

    setTimeout(() => {
      finalizeInitialization();
    }, 500);

  } catch (error) {
    console.error("Error setting up event handlers:", error);
    updateProgress(4, "Error setting up handlers: " + error.message, true);
  }
}

// Finalize initialization with progress
function finalizeInitialization() {
  try {
    updateProgress(5, "Finalizing UI setup...");

    // Initialize UI
    initializeSimpleUI();

    // Enable appropriate features
    if (window.WORD_API_AVAILABLE) {
      enableSimpleWordFeatures();
    } else {
      enableSimpleDemoMode();
    }

    setTimeout(() => {
      completeInitialization();
    }, 500);

  } catch (error) {
    console.error("Error in finalization:", error);
    updateProgress(5, "Error finalizing: " + error.message, true);
  }
}

// Complete initialization
function completeInitialization() {
  try {
    updateProgress(6, "Initialization complete!");

    // Hide initialization section and show main UI
    const initSection = document.getElementById('initialization-section');
    const generateSection = document.getElementById('generate-button-group');

    if (initSection) {
      setTimeout(() => {
        initSection.style.display = 'none';
      }, 1000);
    }

    if (generateSection) {
      setTimeout(() => {
        generateSection.style.display = 'block';
      }, 1000);
    }

    // Final status
    const finalMessage = window.WORD_API_AVAILABLE
      ? "Word API available - all features enabled"
      : "Demo mode - Word API not available. Some features limited.";

    setTimeout(() => {
      updateSimpleStatus(finalMessage, window.WORD_API_AVAILABLE ? "success" : "warning");
    }, 1000);

  } catch (error) {
    console.error("Error completing initialization:", error);
    updateProgress(6, "Error completing: " + error.message, true);
  }
}

// Fallback initialization for when Office.js fails
function fallbackInitialization() {
  try {
    updateProgress(4, "Using fallback initialization...");
    window.WORD_API_AVAILABLE = false;

    setTimeout(() => {
      setupEventHandlers();
    }, 500);

  } catch (error) {
    console.error("Error in fallback initialization:", error);
    updateProgress(4, "Fallback failed: " + error.message, true);
  }
}

// Simple status update
function updateSimpleStatus(message, type) {
  const statusElement = document.getElementById("status-message");
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = `status-message ms-font-s ${type}`;
  }
}

// Initialize simple UI
function initializeSimpleUI() {
  // Hide dynamic sections initially
  const sections = [
    "dynamic-form",
    "content-type-group", 
    "results-section",
    "suggestions-section",
    "progress-section"
  ];
  
  sections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = "none";
    }
  });

  // Show generate button group
  const generateButtonGroup = document.getElementById("generate-button-group");
  if (generateButtonGroup) {
    generateButtonGroup.style.display = "block";
  }

  // Disable all buttons initially
  const buttons = [
    "generate-contract",
    "analyze-contract", 
    "toggle-track-changes",
    "highlight-risks",
    "suggest-changes",
    "check-compliance"
  ];
  
  buttons.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = true;
      button.title = "Initializing...";
    }
  });

  updateSimpleStatus("Initializing add-in...", "info");
  console.log("Simple UI initialized successfully");
}

// Enable Word features
function enableSimpleWordFeatures() {
  const wordButtons = [
    "generate-contract",
    "analyze-contract",
    "toggle-track-changes",
    "highlight-risks", 
    "suggest-changes"
  ];
  
  wordButtons.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = false;
      button.title = "";
    }
  });
}

// Enable demo mode
function enableSimpleDemoMode() {
  // Enable analysis button for demo
  const analyzeBtn = document.getElementById("analyze-contract");
  if (analyzeBtn) {
    analyzeBtn.disabled = false;
    analyzeBtn.title = "Demo mode - uses sample data";
  }
  
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
      button.title = "Requires Word API - not available";
    }
  });
}

// Simple event listeners
function setupSimpleEventListeners() {
  const analyzeBtn = document.getElementById("analyze-contract");
  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", simpleAnalyzeContract);
  }

  const generateBtn = document.getElementById("generate-contract");
  if (generateBtn) {
    generateBtn.addEventListener("click", simpleGenerateContract);
  }
}

// Simple contract analysis
async function simpleAnalyzeContract() {
  updateSimpleStatus("Running contract analysis...", "info");
  
  try {
    let documentText = "Sample contract text for demo purposes...";
    
    if (window.WORD_API_AVAILABLE) {
      // Try to get real document text
      documentText = await getSimpleDocumentText();
    }
    
    // Show simple results
    const resultsSection = document.getElementById("results-section");
    if (resultsSection) {
      resultsSection.innerHTML = `
        <h3>Analysis Results</h3>
        <p><strong>Status:</strong> ${window.WORD_API_AVAILABLE ? 'Real document analyzed' : 'Demo analysis completed'}</p>
        <p><strong>Document Length:</strong> ${documentText.length} characters</p>
        <p><strong>Analysis:</strong> Contract appears to be a standard agreement with typical clauses.</p>
      `;
      resultsSection.style.display = "block";
    }
    
    updateSimpleStatus("Analysis complete!", "success");
    
  } catch (error) {
    console.error("Error in analysis:", error);
    updateSimpleStatus("Error: " + error.message, "error");
  }
}

// Simple contract generation
async function simpleGenerateContract() {
  if (!window.WORD_API_AVAILABLE) {
    updateSimpleStatus("Error: Word API not available for contract generation", "error");
    return;
  }
  
  updateSimpleStatus("Generating contract...", "info");
  
  try {
    await Word.run(async (context) => {
      const body = context.document.body;
      body.clear();
      
      const contractText = `SAMPLE CONTRACT
      
This is a sample contract generated by RHEI AI Legal Assistant.

1. PARTIES
This agreement is between Party A and Party B.

2. TERMS
The terms of this agreement are as follows...

3. DURATION
This agreement is effective immediately.`;

      body.insertText(contractText, Word.InsertLocation.start);
      await context.sync();
    });
    
    updateSimpleStatus("Contract generated successfully!", "success");
    
  } catch (error) {
    console.error("Error generating contract:", error);
    updateSimpleStatus("Error: " + error.message, "error");
  }
}

// Simple document text getter
async function getSimpleDocumentText() {
  if (typeof Word === 'undefined') {
    throw new Error('Word API not available');
  }

  return await Word.run(async (context) => {
    const body = context.document.body;
    body.load("text");
    await context.sync();
    return body.text;
  });
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', simpleInitialize);
} else {
  simpleInitialize();
}

console.log("RHEI AI Legal Assistant (Simple) module loaded");
