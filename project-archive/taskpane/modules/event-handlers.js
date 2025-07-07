// Event Handlers Module
// NO STATIC IMPORTS - All imports will be dynamic to prevent Word API access during loading

// Dynamic imports will be used throughout this module to prevent early Word API access

// Simplified Contract Generation Event Handler
export async function generateSimpleContractHandler() {
  console.log("🚀 Starting simplified contract generation...");
  try {
    // Dynamic imports to prevent early Word API access
    const { updateStatus, showProgressSection, hideProgressSection, handleError, setButtonLoading } = await import('../../shared/utils.js');

    console.log("📋 Setting button loading state...");
    setButtonLoading("generate-contract", true);
    console.log("📊 Showing progress section...");
    showProgressSection("Generating contract...");
    console.log("📝 Updating status...");
    updateStatus("Preparing contract generation...", "info");

    // Get contract type selection
    const contractType = document.getElementById("contract-type")?.value;

    if (!contractType) {
      throw new Error("Please select a contract type before generating");
    }

    console.log("Contract type selected:", contractType);

    let contractText = "";

    // Generate contract based on type
    try {
      console.log("Generating contract from TSV data...");
      const { generateSimpleContract } = await import('../services/contract-generator.js');

      const result = await generateSimpleContract(contractType);

      if (result && result.contractText) {
        contractText = result.contractText;
        console.log("Successfully generated contract");
      } else {
        throw new Error("Contract generation returned empty result");
      }
    } catch (generationError) {
      console.error("Contract generation failed:", generationError.message);
      throw new Error(`Failed to generate contract: ${generationError.message}`);
    }

    if (!contractText) {
      throw new Error("Failed to generate contract text");
    }

    updateStatus("Inserting contract into document...", "info");

    // Insert contract into Word document
    await insertContractIntoDocument(contractText, {});

    // Success
    hideProgressSection();
    updateStatus(`${contractType === 'content-management' ? 'Content Management' : 'Data Pro'} contract generated successfully!`, "success");

    console.log("✅ Contract generation completed successfully");

  } catch (error) {
    console.error("🚨 Contract generation error:", error);
    console.error("Error stack:", error.stack);

    try {
      const { handleError } = await import('../../shared/utils.js');
      handleError(error);
    } catch (importError) {
      console.error("Error importing handleError:", importError);
      console.error("Original error:", error);

      // Fallback error display
      const statusElement = document.getElementById("status-message");
      if (statusElement) {
        statusElement.textContent = `Error: ${error.message}`;
        statusElement.className = "status-message ms-font-s error";
      }
    }
  } finally {
    try {
      const { setButtonLoading } = await import('../../shared/utils.js');
      setButtonLoading("generate-contract", false);
    } catch (importError) {
      console.error("Error importing setButtonLoading:", importError);

      // Fallback button reset
      const button = document.getElementById("generate-contract");
      if (button) {
        button.disabled = false;
        if (button.classList) {
          button.classList.remove("loading");
        }
      }
    }
  }
}

// Original Contract Generation Event Handler (kept for compatibility)
export async function generateContract() {
  console.log("🚀 Starting contract generation...");
  try {
    // Dynamic imports to prevent early Word API access
    const { updateStatus, showProgressSection, hideProgressSection, handleError, setButtonLoading } = await import('../../shared/utils.js');
    const { APIService } = await import('../../shared/api-service.js');
    const { API_CONFIG } = await import('../../shared/config.js');
    const { collectFormData, validateFormData } = await import('../services/contract-generator.js');
    const { displayContractResults } = await import('./ui-display.js');

    // Enhanced Word API availability check
    if (!window.WORD_API_AVAILABLE) {
      updateStatus("Word API not available. Running diagnostics...", "warning");

      // Run quick diagnostic
      if (typeof Word === 'undefined') {
        updateStatus("Error: Word API object not found. Please ensure you're running this in Microsoft Word and refresh the add-in.", "error");
      } else if (typeof Word.run !== 'function') {
        updateStatus("Error: Word.run function not available. Please refresh the add-in and try again.", "error");
      } else {
        updateStatus("Error: Word API initialization incomplete. Please wait a moment and try again.", "error");
      }

      // Show diagnostics automatically
      setTimeout(async () => {
        try {
          await showWordAPIDiagnostics();
        } catch (diagError) {
          console.error("Error showing diagnostics:", diagError);
        }
      }, 1000);

      return;
    }

    console.log("📋 Setting button loading state...");
    setButtonLoading("generate-contract", true);
    console.log("📊 Showing progress section...");
    showProgressSection("Generating contract...");
    console.log("📝 Updating status...");
    updateStatus("Preparing contract generation...", "info");

    // Initialize API service
    const apiService = new APIService(API_CONFIG);

    // Collect and validate form data
    const formData = collectFormData();

    if (!validateFormData(formData)) {
      throw new Error("Please fill in all required fields");
    }

    updateStatus("Generating contract content...", "info");

    // Try to use RHEI playbook system first, fallback to other methods
    let contractText;
    let generationMethod = "rhei_playbook";
    let generationResult;

    try {
      // Import the new RHEI playbook generation function
      const { generateContractWithPlaybook } = await import('../services/contract-generator.js');

      // Set up generation options for RHEI contract
      const generationOptions = {
        revenue_model: "baseline", // Use Ninja Tune baseline by default
        includeTableOfContents: true,
        includeSchedules: true,
        format: "WordReady" // Format optimized for Word insertion
      };

      console.log("Attempting contract generation with RHEI playbook system...");
      generationResult = await generateContractWithPlaybook(formData, generationOptions);

      if (generationResult.success) {
        contractText = generationResult.contract_text;
        console.log("Successfully generated contract using RHEI playbook system");
        updateStatus("Contract generated using RHEI playbook system...", "info");
      } else {
        throw new Error(generationResult.error || "RHEI playbook generation failed");
      }

    } catch (playbookError) {
      console.warn("RHEI playbook generation failed, falling back to AI system:", playbookError);
      generationMethod = "ai_fallback";

      try {
        // Fallback to AI prompt system
        const { generateContractWithAI } = await import('../services/contract-generator.js');

        const aiOptions = {
          playbook: "Custom",
          includeClauses: "1.1-9.5",
          format: "WordReady",
          companyName: "RHEI, Inc.",
          jurisdiction: "State of California",
          includeSchedules: true
        };

        generationResult = await generateContractWithAI(formData, aiOptions);

        if (generationResult.success) {
          contractText = generationResult.contract_text;
          updateStatus("Contract generated using AI system (fallback)...", "info");
        } else {
          throw new Error(generationResult.error || "AI generation failed");
        }
      } catch (aiError) {
        console.warn("AI generation failed, falling back to original playbook system:", aiError);
        generationMethod = "original_playbook_fallback";

        // Final fallback to original playbook system
        const { playbookService } = await import('../../shared/playbook-service.js');
        contractText = await playbookService.generateContract(
          formData.agreement_type || 'content-management',
          formData.content_type || 'music',
          formData.fields || formData
        );
        updateStatus("Contract generated using original playbook system (final fallback)...", "info");
      }
    }

    // Insert contract into Word document
    await insertContractIntoDocument(contractText, formData);

    // Create enhanced result object with generation method info
    const enhancedResult = generationResult || {
      success: true,
      contract_text: contractText,
      generation_method: generationMethod,
      form_data: formData,
      generated_at: new Date().toISOString()
    };

    // Ensure the enhanced result has the correct generation method
    enhancedResult.generation_method = generationMethod;

    // Display results
    displayContractResults(enhancedResult);

    const successMessage = getSuccessMessage(generationMethod);
    updateStatus(successMessage, "success");
    hideProgressSection();

  } catch (error) {
    console.error("🚨 Contract generation error:", error);
    console.error("Error stack:", error.stack);

    // Check if it's a classList error
    if (error.message && error.message.includes('classList')) {
      console.error("🔍 ClassList error detected - checking DOM state:");
      console.error("Document ready state:", document.readyState);
      console.error("Body exists:", !!document.body);
      console.error("Generate button exists:", !!document.getElementById("generate-contract"));
      console.error("Status message exists:", !!document.getElementById("status-message"));
    }

    try {
      const { handleError } = await import('../../shared/utils.js');
      handleError(error);
    } catch (importError) {
      console.error("Error importing handleError:", importError);
      console.error("Original error:", error);

      // Fallback error display
      const statusElement = document.getElementById("status-message");
      if (statusElement) {
        statusElement.textContent = `Error: ${error.message}`;
        statusElement.className = "status-message ms-font-s error";
      }
    }
  } finally {
    try {
      const { setButtonLoading } = await import('../../shared/utils.js');
      setButtonLoading("generate-contract", false);
    } catch (importError) {
      console.error("Error importing setButtonLoading:", importError);

      // Fallback button reset
      const button = document.getElementById("generate-contract");
      if (button) {
        button.disabled = false;
        if (button.classList) {
          button.classList.remove("loading");
        }
      }
    }
  }
}

// Helper function to get success message based on generation method
function getSuccessMessage(generationMethod) {
  switch (generationMethod) {
    case "rhei_playbook":
      return "Contract generated successfully using RHEI playbook system!";
    case "ai_fallback":
      return "Contract generated successfully using AI system (fallback)!";
    case "original_playbook_fallback":
      return "Contract generated successfully using original playbook system (fallback)!";
    default:
      return "Contract generated successfully!";
  }
}

// Word API Diagnostics
export async function showWordAPIDiagnostics() {
  try {
    const { updateStatus } = await import('../../shared/utils.js');

    console.log("Running Word API diagnostics...");

    let diagnosticInfo = "=== WORD API DIAGNOSTICS ===\n\n";

    // Check Office.js availability
    diagnosticInfo += `Office.js Available: ${typeof Office !== 'undefined'}\n`;
    if (typeof Office !== 'undefined') {
      diagnosticInfo += `Office.context Available: ${!!Office.context}\n`;
      if (Office.context) {
        diagnosticInfo += `Office Host: ${Office.context.host}\n`;
        diagnosticInfo += `Office Platform: ${Office.context.platform}\n`;
        diagnosticInfo += `Office Requirements: ${Office.context.requirements}\n`;
      }
    }

    // Check Word API availability
    diagnosticInfo += `\nWord API Available: ${typeof Word !== 'undefined'}\n`;
    if (typeof Word !== 'undefined') {
      diagnosticInfo += `Word.run Available: ${typeof Word.run === 'function'}\n`;
      diagnosticInfo += `Word.InsertLocation Available: ${typeof Word.InsertLocation !== 'undefined'}\n`;
    }

    // Check global state variables
    diagnosticInfo += `\nGlobal State:\n`;
    diagnosticInfo += `OFFICE_READY: ${window.OFFICE_READY}\n`;
    diagnosticInfo += `WORD_API_AVAILABLE: ${window.WORD_API_AVAILABLE}\n`;
    diagnosticInfo += `WORD_API_READY: ${window.WORD_API_READY}\n`;
    diagnosticInfo += `INITIALIZATION_COMPLETE: ${window.INITIALIZATION_COMPLETE}\n`;

    // Check browser environment
    diagnosticInfo += `\nBrowser Environment:\n`;
    diagnosticInfo += `User Agent: ${navigator.userAgent}\n`;
    diagnosticInfo += `URL: ${window.location.href}\n`;
    diagnosticInfo += `Protocol: ${window.location.protocol}\n`;

    // Test Word API if available
    if (typeof Word !== 'undefined' && typeof Word.run === 'function') {
      diagnosticInfo += `\nTesting Word API...\n`;
      try {
        await Word.run(async (context) => {
          diagnosticInfo += `Word.run executed successfully\n`;
          diagnosticInfo += `Context available: ${!!context}\n`;
          if (context && context.document) {
            diagnosticInfo += `Document context available: ${!!context.document}\n`;
          }
        });
        diagnosticInfo += `Word API test: PASSED\n`;
      } catch (error) {
        diagnosticInfo += `Word API test: FAILED - ${error.message}\n`;
      }
    }

    // Display diagnostics
    const resultsSection = document.getElementById("results-section");
    if (resultsSection) {
      resultsSection.innerHTML = `
        <div class="results-header">
          <h2>Word API Diagnostics</h2>
        </div>
        <div class="results-content">
          <pre style="white-space: pre-wrap; font-family: monospace; font-size: 12px; line-height: 1.4;">${diagnosticInfo}</pre>
        </div>
      `;
      resultsSection.style.display = "block";
    }

    updateStatus("Diagnostics complete - check results below", "info");

  } catch (error) {
    console.error("Error running diagnostics:", error);
    const { updateStatus } = await import('../../shared/utils.js');
    updateStatus(`Diagnostics error: ${error.message}`, "error");
  }
}

// Simple Word API test function
export async function testWordAPI() {
  try {
    const { updateStatus } = await import('../../shared/utils.js');

    updateStatus("Testing Word API...", "info");

    // Check basic availability
    if (typeof Word === 'undefined') {
      throw new Error("Word API object not found");
    }

    if (typeof Word.run !== 'function') {
      throw new Error("Word.run function not available");
    }

    // Test actual Word API call
    await Word.run(async (context) => {
      // Simple test - just access the document
      const document = context.document;
      document.load("saved");
      await context.sync();

      console.log("Word API test successful - document accessed");
    });

    updateStatus("Word API test successful! ✅", "success");
    window.WORD_API_AVAILABLE = true;
    window.WORD_API_READY = true;

  } catch (error) {
    console.error("Word API test failed:", error);
    const { updateStatus } = await import('../../shared/utils.js');
    updateStatus(`Word API test failed: ${error.message}`, "error");

    window.WORD_API_AVAILABLE = false;
    window.WORD_API_READY = false;
  }
}

// Contract Analysis Event Handlers
export async function analyzeContract() {
  try {
    // Dynamic imports to prevent early Word API access
    const { updateStatus, showProgressSection, hideProgressSection, handleError, setButtonLoading } = await import('../../shared/utils.js');
    const { contractReviewer } = await import('../services/contract-reviewer.js');
    const { displayContractReviewResults } = await import('./ui-display.js');

    setButtonLoading("analyze-contract", true);
    showProgressSection("Analyzing contract for compliance and acceptability...");

    let documentText;

    if (window.WORD_API_AVAILABLE) {
      // Use real Word document
      updateStatus("Reading document content...", "info");
      documentText = await getDocumentText();

      if (!documentText || documentText.trim().length < 50) {
        throw new Error("Document appears to be empty or too short to analyze. Please ensure you have contract content in the document.");
      }
    } else {
      // Use demo content
      updateStatus("Using demo contract for analysis...", "info");
      documentText = `SAMPLE CONTENT MANAGEMENT AGREEMENT

This Content Management Agreement is entered into between Company A and Company B.

1. SCOPE OF SERVICES
The Manager will provide content management services including distribution and marketing.

2. COMPENSATION
Revenue will be split 80% to Artist and 20% to Manager.

3. TERM
This agreement is effective for 2 years from the date of signing.

4. TERMINATION
Either party may terminate with 30 days notice.`;
    }

    updateStatus("Performing comprehensive contract review...", "info");

    // Determine contract type for playbook selection
    const agreementType = determineAgreementType(documentText);
    const contentType = determineContentType(documentText);

    updateStatus(`Analyzing ${agreementType} contract for ${contentType} content...`, "info");

    // Try Legal Matrix analysis first, fallback to playbook system
    let reviewResults;
    let analysisMethod = "legal_matrix";

    try {
      // Import Legal Matrix analysis function
      const { analyzeContractWithLegalMatrix } = await import('../services/contract-generator.js');

      // Get target party from UI (if available)
      const targetParty = getSelectedParty();

      console.log("Attempting Legal Matrix analysis...");
      const matrixResult = await analyzeContractWithLegalMatrix(documentText, targetParty);

      if (matrixResult.success) {
        // Convert Legal Matrix analysis to review results format
        reviewResults = convertLegalMatrixToReviewResults(matrixResult.analysis, agreementType, contentType);
        updateStatus("Contract analyzed using Legal Matrix...", "info");
      } else {
        throw new Error(matrixResult.error || "Legal Matrix analysis failed");
      }

    } catch (matrixError) {
      console.warn("Legal Matrix analysis failed, falling back to playbook system:", matrixError);
      analysisMethod = "playbook_fallback";

      // Fallback to original playbook system
      reviewResults = await contractReviewer.reviewContract(documentText, agreementType, contentType);
      updateStatus("Contract analyzed using playbook system (fallback)...", "info");
    }

    const statusMessage = window.WORD_API_AVAILABLE ?
      `Contract review complete! Status: ${reviewResults.acceptabilityStatus.status} (${analysisMethod})` :
      `Demo contract review complete! Status: ${reviewResults.acceptabilityStatus.status} (${analysisMethod})`;

    updateStatus(statusMessage, reviewResults.acceptabilityStatus.status === 'ready-for-legal' ? "success" : "warning");

    // Display comprehensive review results with analysis method indicator
    displayContractReviewResults(reviewResults, analysisMethod);

    hideProgressSection();

  } catch (error) {
    try {
      const { handleError } = await import('../../shared/utils.js');
      handleError(error);
    } catch (importError) {
      console.error("Error importing handleError:", importError);
      console.error("Original error:", error);
    }
  } finally {
    try {
      const { setButtonLoading } = await import('../../shared/utils.js');
      setButtonLoading("analyze-contract", false);
    } catch (importError) {
      console.error("Error importing setButtonLoading:", importError);
    }
  }
}

// Helper functions for contract type determination
function determineAgreementType(documentText) {
  const lowerText = documentText.toLowerCase();

  if (lowerText.includes('data license') || lowerText.includes('data licensing')) {
    return 'data-pro';
  } else if (lowerText.includes('content management') || lowerText.includes('management agreement')) {
    return 'content-management';
  } else if (lowerText.includes('licensing') || lowerText.includes('license agreement')) {
    return 'licensing';
  } else if (lowerText.includes('distribution') || lowerText.includes('distribution agreement')) {
    return 'distribution';
  } else if (lowerText.includes('talent') || lowerText.includes('talent agreement')) {
    return 'talent';
  }

  // Default to content management if unclear
  return 'content-management';
}

function determineContentType(documentText) {
  const lowerText = documentText.toLowerCase();

  if (lowerText.includes('music') || lowerText.includes('recording') || lowerText.includes('artist')) {
    return 'music';
  } else if (lowerText.includes('video') || lowerText.includes('content creator') || lowerText.includes('youtube')) {
    return 'non-music';
  }

  // Default to music if unclear
  return 'music';
}

// Contract Review Workflow Event Handlers
export async function applyAutomaticRevisions() {
  try {
    const { updateStatus } = await import('../../shared/utils.js');
    const { contractReviewer } = await import('../services/contract-reviewer.js');

    if (!window.currentReviewResults) {
      updateStatus("No review results available. Please run contract analysis first.", "error");
      return;
    }

    updateStatus("Applying automatic revisions...", "info");

    const revisionResults = await contractReviewer.applyRevisions(
      window.currentReviewResults.revisionPlan,
      true // auto-approve
    );

    updateStatus(`Applied ${revisionResults.applied.length} automatic revisions successfully!`, "success");

    // Re-run analysis to show updated status
    setTimeout(() => {
      analyzeContract();
    }, 1000);

  } catch (error) {
    const { handleError } = await import('../../shared/utils.js');
    handleError(error);
  }
}

export async function submitToLegal() {
  try {
    const { updateStatus } = await import('../../shared/utils.js');

    updateStatus("Preparing contract for legal review...", "info");

    // Simulate legal submission process
    await new Promise(resolve => setTimeout(resolve, 1500));

    updateStatus("Contract submitted to legal team for review!", "success");

    // Show success message with next steps
    const resultsContent = document.getElementById("results-content");
    resultsContent.innerHTML = `
      <div class="legal-submission-success">
        <h2>✅ Contract Submitted to Legal Review</h2>
        <div class="submission-details">
          <p><strong>Submission Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Status:</strong> Pending Legal Review</p>
          <p><strong>Reference ID:</strong> CR-${Date.now()}</p>
        </div>
        <div class="next-steps">
          <h3>What happens next:</h3>
          <ol>
            <li>Legal team will review the contract within 2-3 business days</li>
            <li>You'll receive feedback and any additional recommendations</li>
            <li>Final approval will be provided once review is complete</li>
          </ol>
        </div>
      </div>`;

  } catch (error) {
    const { handleError } = await import('../../shared/utils.js');
    handleError(error);
  }
}

export async function rerunAnalysis() {
  // Simply call the main analyze function again
  analyzeContract();
}

// Suggestion Application Event Handlers
export async function applySuggestion(suggestionIndex) {
  updateStatus(`Applying suggestion ${suggestionIndex + 1}...`, "info");
  
  try {
    // In a real implementation, this would apply the specific suggestion to the document
    // For demo purposes, we'll just show a success message
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing
    
    updateStatus(`Suggestion ${suggestionIndex + 1} applied successfully!`, "success");
    
    // Update the UI to show the suggestion as applied
    const suggestionCard = document.querySelectorAll('.suggestion-card')[suggestionIndex];
    if (suggestionCard && suggestionCard.classList) {
      suggestionCard.classList.add('applied');
      const applyBtn = suggestionCard.querySelector('.apply-suggestion-btn');
      if (applyBtn) {
        applyBtn.textContent = '✓ Applied';
        applyBtn.disabled = true;
      }
    }
    
  } catch (error) {
    handleError(error);
  }
}

export async function applyAllChanges() {
  setButtonLoading("apply-all-changes-btn", true);
  updateStatus("Applying all suggestions...", "info");
  
  try {
    // In a real implementation, this would apply all suggestions to the document
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
    
    updateStatus("All suggestions applied successfully!", "success");
    
    // Update UI to show all suggestions as applied
    const suggestionCards = document.querySelectorAll('.suggestion-card');
    suggestionCards.forEach(card => {
      if (card && card.classList) {
        card.classList.add('applied');
      }
      const applyBtn = card.querySelector('.apply-suggestion-btn');
      if (applyBtn) {
        applyBtn.textContent = '✓ Applied';
        applyBtn.disabled = true;
      }
    });
    
    // Hide the apply all button
    const applyAllBtn = document.getElementById("apply-all-changes-btn");
    if (applyAllBtn) {
      applyAllBtn.style.display = 'none';
    }
    
  } catch (error) {
    handleError(error);
  } finally {
    setButtonLoading("apply-all-changes-btn", false);
  }
}

export function dismissSuggestions() {
  clearSuggestions();
  updateStatus("Suggestions dismissed", "info");
}

// Enhanced Utility Functions with better error diagnostics
async function getDocumentText() {
  console.log("Attempting to read document text...");

  // Comprehensive Word API availability check with detailed diagnostics
  if (typeof Word === 'undefined') {
    console.error("Word API object not found");
    throw new Error('Word API not available. Please ensure you are running this add-in in Microsoft Word and that the Word API has loaded properly.');
  }

  // Additional check for Office.js initialization
  if (!Office || !Office.context) {
    console.error("Office.js context not available");
    throw new Error('Office.js not properly initialized. Please refresh the add-in.');
  }

  // Check if we're in a Word context (handle undefined Office.HostApplication)
  if (Office.HostApplication && Office.context.host !== Office.HostApplication.Word) {
    console.error("Not running in Word context:", Office.context.host);
    throw new Error('This add-in must be run in Microsoft Word.');
  }

  // Check if Word.run is available
  if (typeof Word.run !== 'function') {
    console.error("Word.run function not available");
    throw new Error('Word.run function not available. Please ensure Word API is properly loaded.');
  }

  try {
    console.log("Executing Word.run to read document...");

    // Add timeout to prevent hanging
    const readPromise = Word.run(async (context) => {
      const body = context.document.body;
      body.load("text");
      await context.sync();

      console.log("Document text read successfully, length:", body.text.length);
      return body.text;
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Document read timeout")), 15000);
    });

    return await Promise.race([readPromise, timeoutPromise]);

  } catch (error) {
    console.error("Error in Word.run:", error);

    // Provide more specific error messages
    if (error.message.includes("timeout")) {
      throw new Error(`Document read timeout - this may indicate a slow connection or large document`);
    } else if (error.message.includes("permission")) {
      throw new Error(`Permission denied - please ensure the add-in has document access permissions`);
    } else if (error.message.includes("context")) {
      throw new Error(`Word context error - please try refreshing the add-in`);
    } else {
      throw new Error(`Failed to read document: ${error.message}`);
    }
  }
}

async function insertContractIntoDocument(contractText, formData) {
  // Comprehensive Word API availability check
  if (typeof Word === 'undefined') {
    throw new Error('Word API not available. Please ensure you are running this add-in in Microsoft Word and that the Word API has loaded properly.');
  }

  // Additional check for Office.js initialization
  if (!Office || !Office.context) {
    throw new Error('Office.js not properly initialized. Please refresh the add-in.');
  }

  // Check if we're in a Word context (handle undefined Office.HostApplication)
  if (Office.HostApplication && Office.context.host !== Office.HostApplication.Word) {
    throw new Error('This add-in must be run in Microsoft Word.');
  }

  // Check if Word.run is available
  if (typeof Word.run !== 'function') {
    throw new Error('Word.run function not available. Please ensure Word API is properly loaded.');
  }

  console.log("Inserting contract into Word document...");
  console.log("Contract text length:", contractText.length);

  try {
    return await Word.run(async (context) => {
      const body = context.document.body;

      // Clear existing content
      body.clear();

      // Insert the contract text from playbook
      body.insertText(contractText, Word.InsertLocation.start);

      // Apply professional formatting
      await formatContractDocument(context, body);

      await context.sync();
    });
  } catch (error) {
    console.error("Error in Word.run during contract insertion:", error);
    throw new Error(`Failed to insert contract: ${error.message}`);
  }
}

async function formatContractDocument(context, body) {
  try {
    // Get the entire document range
    const range = body.getRange();

    // Set base font formatting
    range.font.name = "Calibri";
    range.font.size = 11;
    range.paragraphFormat.lineSpacing = 1.15;
    range.paragraphFormat.spaceAfter = 6;

    // Format the title (first paragraph)
    const paragraphs = body.paragraphs;
    paragraphs.load("items");
    await context.sync();

    if (paragraphs.items.length > 0) {
      const titleParagraph = paragraphs.items[0];
      titleParagraph.font.size = 16;
      titleParagraph.font.bold = true;
      titleParagraph.paragraphFormat.alignment = Word.Alignment.centered;
      titleParagraph.paragraphFormat.spaceAfter = 12;
    }

    // Format section headers (paragraphs that start with numbers or uppercase words)
    for (let i = 1; i < paragraphs.items.length; i++) {
      const paragraph = paragraphs.items[i];
      paragraph.load("text");
      await context.sync();

      const text = paragraph.text.trim();

      // Check if it's a section header (starts with number or is all caps)
      if (text.match(/^\d+\./) || (text.length > 0 && text === text.toUpperCase() && text.length < 50)) {
        paragraph.font.bold = true;
        paragraph.font.size = 12;
        paragraph.paragraphFormat.spaceBefore = 12;
        paragraph.paragraphFormat.spaceAfter = 6;
      }
    }

    // Set page margins
    const sections = context.document.sections;
    sections.load("items");
    await context.sync();

    if (sections.items.length > 0) {
      const section = sections.items[0];
      section.pageSetup.topMargin = 72;    // 1 inch
      section.pageSetup.bottomMargin = 72; // 1 inch
      section.pageSetup.leftMargin = 72;   // 1 inch
      section.pageSetup.rightMargin = 72;  // 1 inch
    }

  } catch (error) {
    console.warn("Error applying formatting:", error);
    // Continue without formatting if there's an error
  }
}

function generateContractContent(formData) {
  // Generate realistic contract content based on form data
  const templates = {
    'content-management': {
      'music': `MUSIC CONTENT MANAGEMENT AGREEMENT

This Music Content Management Agreement ("Agreement") is entered into on ${new Date().toLocaleDateString()} between ${formData.fields.entity_name || 'Starling Music Management LLC'}, a limited liability company ("Manager"), and ${formData.fields.content_creator || 'Artist Name'} ("Artist").

1. SCOPE OF SERVICES
Manager agrees to provide comprehensive music content management services including:
- Digital distribution across all major streaming platforms (Spotify, Apple Music, Amazon Music, etc.)
- Rights management and royalty collection
- Marketing and promotional campaigns
- Performance tracking and analytics
- Playlist pitching and promotion

2. REVENUE SHARING
Artist and Manager agree to the following revenue split:
- Artist: ${100 - (formData.fields.revenue_split || 20)}%
- Manager: ${formData.fields.revenue_split || 20}%

3. TERM AND TERRITORY
This Agreement shall remain in effect for ${formData.fields.term_length || '3 years'} and covers ${formData.fields.territory || 'Worldwide'}.

4. RIGHTS GRANTED
Artist grants Manager the right to manage ${formData.fields.music_rights || 'Master Rights'} for the specified territory and term.

5. ADVANCE
${formData.fields.advance_amount ? `Manager will provide an advance of $${formData.fields.advance_amount} upon execution of this Agreement.` : 'No advance payment is included in this Agreement.'}

6. TERMINATION
Either party may terminate this Agreement with ${formData.fields.termination_notice || '60'} days written notice.

7. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

MANAGER:                           ARTIST:

_________________________         _________________________
${formData.fields.entity_name || 'Starling Music Management LLC'}    ${formData.fields.content_creator || 'Artist Name'}

Date: _______________             Date: _______________`,

      'non-music': `CONTENT MANAGEMENT AGREEMENT

This Content Management Agreement ("Agreement") is entered into on ${new Date().toLocaleDateString()} between ${formData.fields.entity_name || 'Digital Content Partners'} ("Manager") and ${formData.fields.content_creator || 'Content Creator'} ("Creator").

1. CONTENT MANAGEMENT SERVICES
Manager will provide comprehensive content management including:
- ${formData.fields.content_type || 'Video Content'} optimization and strategy
- Platform management for ${formData.fields.platform_focus || 'YouTube'}
- Brand partnership facilitation
- Revenue optimization and analytics
- Content scheduling and distribution

2. COMPENSATION
Revenue sharing arrangement:
- Creator: ${100 - (formData.fields.revenue_split || 25)}%
- Manager: ${formData.fields.revenue_split || 25}%

3. TERM AND SCOPE
Duration: ${formData.fields.term_length || '2 years'}
Territory: ${formData.fields.territory || 'North America'}

4. CONTENT RIGHTS
Creator grants Manager limited rights to manage and distribute content on agreed platforms.

5. TERMINATION
Either party may terminate with ${formData.fields.termination_notice || '30'} days written notice.

6. GOVERNING LAW
This Agreement is governed by applicable state and federal laws.

SIGNATURES:

MANAGER:                           CREATOR:

_________________________         _________________________
${formData.fields.entity_name || 'Digital Content Partners'}      ${formData.fields.content_creator || 'Content Creator'}

Date: _______________             Date: _______________`
    }
  };

  const template = templates[formData.agreement_type]?.[formData.content_type];
  return template || 'Contract content would be generated here based on your selections.';
}

function generateExecutiveSummary(analysisResult, riskAnalysis, changeSuggestions) {
  const riskLevel = riskAnalysis.risk_score >= 80 ? 'Low' : 
                   riskAnalysis.risk_score >= 60 ? 'Medium' : 'High';
  
  return {
    title: "📊 Executive Summary",
    overview: `This ${analysisResult.contract_type.toLowerCase()} has been analyzed for compliance, risks, and improvement opportunities. The contract shows a ${riskLevel.toLowerCase()} risk profile with ${riskAnalysis.risks.length} identified areas for attention and ${changeSuggestions.suggestions.length} improvement suggestions.`
  };
}

// Export form change handlers - these will be dynamically imported when needed
export async function handleAgreementTypeChange(event) {
  const { handleAgreementTypeChange } = await import('../services/contract-generator.js');
  return handleAgreementTypeChange(event);
}

export async function handleContentTypeChange(event) {
  const { handleContentTypeChange } = await import('../services/contract-generator.js');
  return handleContentTypeChange(event);
}

// Export utility functions for global access
window.generateContract = generateContract;
window.analyzeContract = analyzeContract;
window.applySuggestion = applySuggestion;
window.applyAllChanges = applyAllChanges;
window.dismissSuggestions = dismissSuggestions;
window.handleAgreementTypeChange = handleAgreementTypeChange;
window.handleContentTypeChange = handleContentTypeChange;

// Export new contract review workflow functions
window.applyAutomaticRevisions = applyAutomaticRevisions;
window.submitToLegal = submitToLegal;
window.rerunAnalysis = rerunAnalysis;
window.reviewManualChanges = function() {
  alert("Manual review interface would open here for complex revisions that require human judgment.");
};
window.generateContractSummary = function() {
  alert("Contract summary generation would be implemented here.");
};
window.applyRevision = function(clauseId) {
  alert(`Apply revision for clause ${clauseId} would be implemented here.`);
};
window.reviewRevision = function(clauseId) {
  alert(`Review revision for clause ${clauseId} would be implemented here.`);
};
window.viewDetails = function(clauseId) {
  alert(`View detailed analysis for clause ${clauseId} would be implemented here.`);
};

// Dynamic utility functions that will be imported when needed
window.clearResults = async function() {
  const { clearResults } = await import('../../shared/utils.js');
  return clearResults();
};

window.clearSuggestions = async function() {
  const { clearSuggestions } = await import('../../shared/utils.js');
  return clearSuggestions();
};

// Legal Matrix Integration Helper Functions

/**
 * Get selected party from UI for Legal Matrix analysis
 */
function getSelectedParty() {
  // Check if there's a party selector in the UI
  const partySelector = document.getElementById('target-party-selector');
  if (partySelector && partySelector.value) {
    return partySelector.value;
  }

  // Default to null (analyze against all parties)
  return null;
}

/**
 * Convert Legal Matrix analysis results to review results format
 */
function convertLegalMatrixToReviewResults(matrixAnalysis, agreementType, contentType) {
  // Calculate overall acceptability status
  const acceptabilityStatus = calculateAcceptabilityStatus(matrixAnalysis);

  // Convert clause analysis to suggestions format
  const suggestions = convertClauseAnalysisToSuggestions(matrixAnalysis);

  // Create revision plan from unacceptable modifications
  const revisionPlan = createRevisionPlan(matrixAnalysis);

  return {
    acceptabilityStatus,
    suggestions,
    revisionPlan,
    analysisMethod: 'legal_matrix',
    targetParty: matrixAnalysis.targetParty,
    complianceScore: matrixAnalysis.complianceScore,
    overallAssessment: matrixAnalysis.overallAssessment,
    clauseAnalysis: matrixAnalysis.clauseAnalysis,
    missingClauses: matrixAnalysis.missingClauses,
    unacceptableModifications: matrixAnalysis.unacceptableModifications,
    partySpecificRecommendations: matrixAnalysis.partySpecificRecommendations || []
  };
}

/**
 * Calculate acceptability status from Legal Matrix analysis
 */
function calculateAcceptabilityStatus(matrixAnalysis) {
  const score = matrixAnalysis.complianceScore;
  const missingCount = matrixAnalysis.missingClauses?.length || 0;
  const unacceptableCount = matrixAnalysis.unacceptableModifications?.length || 0;

  let status, message, priority;

  if (score >= 90 && missingCount === 0 && unacceptableCount === 0) {
    status = 'ready-for-legal';
    message = 'Contract fully complies with Legal Matrix standards and is ready for legal review.';
    priority = 'low';
  } else if (score >= 80 && missingCount <= 1 && unacceptableCount <= 2) {
    status = 'minor-revisions';
    message = 'Contract requires minor adjustments to meet Legal Matrix standards.';
    priority = 'medium';
  } else if (score >= 60) {
    status = 'major-revisions';
    message = 'Contract needs significant modifications to align with Legal Matrix.';
    priority = 'high';
  } else {
    status = 'not-acceptable';
    message = 'Contract requires major revisions to meet Legal Matrix standards.';
    priority = 'critical';
  }

  return {
    status,
    message,
    priority,
    complianceScore: score,
    missingClauses: missingCount,
    unacceptableModifications: unacceptableCount
  };
}

/**
 * Convert clause analysis to suggestions format
 */
function convertClauseAnalysisToSuggestions(matrixAnalysis) {
  const suggestions = [];

  // Add suggestions for missing clauses
  if (matrixAnalysis.missingClauses) {
    matrixAnalysis.missingClauses.forEach(missing => {
      suggestions.push({
        type: 'missing-clause',
        severity: missing.severity,
        title: `Add ${missing.title}`,
        description: `Contract is missing clause ${missing.clauseKey}: ${missing.title}`,
        suggestion: missing.baselineContent,
        location: `Article ${missing.article}`,
        autoApplicable: true
      });
    });
  }

  // Add suggestions for unacceptable modifications
  if (matrixAnalysis.unacceptableModifications) {
    matrixAnalysis.unacceptableModifications.forEach(unacceptable => {
      suggestions.push({
        type: 'clause-revision',
        severity: 'medium',
        title: `Revise ${unacceptable.title}`,
        description: `Clause ${unacceptable.clauseKey} deviates from acceptable variations`,
        suggestion: unacceptable.recommendation,
        currentText: unacceptable.foundContent,
        suggestedText: unacceptable.baselineContent,
        location: `Clause ${unacceptable.clauseKey}`,
        autoApplicable: false
      });
    });
  }

  // Add party-specific recommendations
  if (matrixAnalysis.partySpecificRecommendations) {
    matrixAnalysis.partySpecificRecommendations.forEach(rec => {
      suggestions.push({
        type: 'party-specific',
        severity: rec.type === 'missing' ? 'high' : 'medium',
        title: rec.message,
        description: `Party-specific recommendation for ${matrixAnalysis.targetParty}`,
        suggestion: rec.suggestedContent,
        currentText: rec.currentContent,
        location: rec.clauseKey ? `Clause ${rec.clauseKey}` : 'General',
        autoApplicable: false
      });
    });
  }

  return suggestions;
}

/**
 * Create revision plan from Legal Matrix analysis
 */
function createRevisionPlan(matrixAnalysis) {
  const revisions = [];

  // Add revisions for missing clauses
  if (matrixAnalysis.missingClauses) {
    matrixAnalysis.missingClauses.forEach(missing => {
      revisions.push({
        type: 'add-clause',
        clauseKey: missing.clauseKey,
        title: missing.title,
        content: missing.baselineContent,
        location: `Article ${missing.article}`,
        priority: missing.severity,
        autoApplicable: true
      });
    });
  }

  // Add revisions for unacceptable modifications
  if (matrixAnalysis.unacceptableModifications) {
    matrixAnalysis.unacceptableModifications.forEach(unacceptable => {
      revisions.push({
        type: 'modify-clause',
        clauseKey: unacceptable.clauseKey,
        title: unacceptable.title,
        currentContent: unacceptable.foundContent,
        revisedContent: unacceptable.baselineContent,
        reason: unacceptable.recommendation,
        priority: 'medium',
        autoApplicable: false
      });
    });
  }

  return revisions;
}
