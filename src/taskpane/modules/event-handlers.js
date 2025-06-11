// Event Handlers Module
// NO STATIC IMPORTS - All imports will be dynamic to prevent Word API access during loading

// Dynamic imports will be used throughout this module to prevent early Word API access

// Contract Generation Event Handlers
export async function generateContract() {
  try {
    // Dynamic imports to prevent early Word API access
    const { updateStatus, showProgressSection, hideProgressSection, handleError, setButtonLoading } = await import('../../shared/utils.js');
    const { APIService } = await import('../../shared/api-service.js');
    const { API_CONFIG } = await import('../../shared/config.js');
    const { collectFormData, validateFormData } = await import('../services/contract-generator.js');
    const { displayContractResults } = await import('./ui-display.js');

    // Check if Word API is available
    if (!window.WORD_API_AVAILABLE) {
      updateStatus("Error: Word API not available. Cannot generate contract in current environment.", "error");
      return;
    }

    setButtonLoading("generate-contract-btn", true);
    showProgressSection("Generating contract...");
    updateStatus("Preparing contract generation...", "info");

    // Initialize API service
    const apiService = new APIService(API_CONFIG);

    // Collect and validate form data
    const formData = collectFormData();

    if (!validateFormData(formData)) {
      throw new Error("Please fill in all required fields");
    }

    updateStatus("Generating contract content...", "info");

    // Generate contract using playbook system
    const { playbookService } = await import('../../shared/playbook-service.js');
    const contractText = await playbookService.generateContract(
      formData.agreement_type || 'content-management',
      formData.content_type || 'music',
      formData.fields || formData
    );

    // Insert contract into Word document
    await insertContractIntoDocument(contractText, formData);

    // Display results
    displayContractResults(result);

    updateStatus("Contract generated successfully!", "success");
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
      setButtonLoading("generate-contract-btn", false);
    } catch (importError) {
      console.error("Error importing setButtonLoading:", importError);
    }
  }
}

// Contract Analysis Event Handlers
export async function analyzeContract() {
  try {
    // Dynamic imports to prevent early Word API access
    const { updateStatus, showProgressSection, hideProgressSection, handleError, setButtonLoading } = await import('../../shared/utils.js');
    const { generateDemoAnalysis, generateRiskAnalysis, generateChangeSuggestions } = await import('../services/contract-analyzer.js');
    const { displayCombinedAnalysisResults, displayStructuredAnalysisResults } = await import('./ui-display.js');

    setButtonLoading("analyze-contract-btn", true);
    showProgressSection("Analyzing contract...");

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

    updateStatus("Performing contract analysis...", "info");

    // Perform comprehensive analysis
    const [analysisResult, riskAnalysis, changeSuggestions] = await Promise.all([
      generateDemoAnalysis(documentText),
      generateRiskAnalysis(documentText),
      generateChangeSuggestions(documentText)
    ]);

    // Generate executive summary
    const summaryResult = generateExecutiveSummary(analysisResult, riskAnalysis, changeSuggestions);

    const statusMessage = window.WORD_API_AVAILABLE ? "Analysis complete!" : "Demo analysis complete!";
    updateStatus(statusMessage, "success");

    // Check if we have structured analysis and display accordingly
    if (analysisResult.structured_analysis) {
      console.log("Displaying structured analysis results using new AI prompt format");
      displayStructuredAnalysisResults(analysisResult);
    } else {
      console.log("Displaying legacy analysis results");
      displayCombinedAnalysisResults(analysisResult, riskAnalysis, changeSuggestions, summaryResult);
    }

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
      setButtonLoading("analyze-contract-btn", false);
    } catch (importError) {
      console.error("Error importing setButtonLoading:", importError);
    }
  }
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
    if (suggestionCard) {
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
      card.classList.add('applied');
      const applyBtn = card.querySelector('.apply-suggestion-btn');
      if (applyBtn) {
        applyBtn.textContent = '✓ Applied';
        applyBtn.disabled = true;
      }
    });
    
    // Hide the apply all button
    document.getElementById("apply-all-changes-btn").style.display = 'none';
    
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

  // Check if we're in a Word context
  if (Office.context.host !== Office.HostApplication.Word) {
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

  // Check if we're in a Word context
  if (Office.context.host !== Office.HostApplication.Word) {
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

// Dynamic utility functions that will be imported when needed
window.clearResults = async function() {
  const { clearResults } = await import('../../shared/utils.js');
  return clearResults();
};

window.clearSuggestions = async function() {
  const { clearSuggestions } = await import('../../shared/utils.js');
  return clearSuggestions();
};
