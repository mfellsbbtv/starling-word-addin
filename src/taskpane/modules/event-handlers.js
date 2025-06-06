// Event Handlers Module
import { APIService } from '../../shared/api-service.js';
import { API_CONFIG } from '../../shared/config.js';
import { updateStatus, showProgressSection, hideProgressSection, handleError, setButtonLoading, clearResults, clearSuggestions } from '../../shared/utils.js';
import { generateDemoAnalysis, generateRiskAnalysis, generateChangeSuggestions } from '../services/contract-analyzer.js';
import { handleAgreementTypeChange, handleContentTypeChange, collectFormData, validateFormData, updateContractPreview } from '../services/contract-generator.js';
import { displayCombinedAnalysisResults, displayContractResults } from './ui-display.js';

// Initialize API service
const apiService = new APIService(API_CONFIG);

// Contract Generation Event Handlers
export async function generateContract() {
  setButtonLoading("generate-contract-btn", true);
  showProgressSection("Generating contract...");
  updateStatus("Preparing contract generation...", "info");

  try {
    // Collect and validate form data
    const formData = collectFormData();
    
    if (!validateFormData(formData)) {
      throw new Error("Please fill in all required fields");
    }

    updateStatus("Generating contract content...", "info");

    // Generate contract using API service
    const result = await apiService.generateContract(formData);

    // Insert contract into Word document
    await insertContractIntoDocument(result, formData);

    // Display results
    displayContractResults(result);
    
    updateStatus("Contract generated successfully!", "success");
    hideProgressSection();

  } catch (error) {
    handleError(error);
  } finally {
    setButtonLoading("generate-contract-btn", false);
  }
}

// Contract Analysis Event Handlers
export async function analyzeContract() {
  setButtonLoading("analyze-contract-btn", true);
  showProgressSection("Analyzing contract...");
  updateStatus("Reading document content...", "info");

  try {
    // Get document text
    const documentText = await getDocumentText();
    
    if (!documentText || documentText.trim().length < 50) {
      throw new Error("Document appears to be empty or too short to analyze. Please ensure you have contract content in the document.");
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

    updateStatus("Analysis complete!", "success");

    // Display combined results
    displayCombinedAnalysisResults(analysisResult, riskAnalysis, changeSuggestions, summaryResult);
    
    hideProgressSection();

  } catch (error) {
    handleError(error);
  } finally {
    setButtonLoading("analyze-contract-btn", false);
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

// Utility Functions
async function getDocumentText() {
  // Ensure Word API is available
  if (typeof Word === 'undefined') {
    throw new Error('Word API not available. Please ensure you are running this add-in in Microsoft Word.');
  }

  // Additional check for Office.js initialization
  if (!Office.context || !Office.context.document) {
    throw new Error('Office.js not properly initialized. Please refresh the add-in.');
  }

  return await Word.run(async (context) => {
    const body = context.document.body;
    body.load("text");
    await context.sync();
    return body.text;
  });
}

async function insertContractIntoDocument(result, formData) {
  // Ensure Word API is available
  if (typeof Word === 'undefined') {
    throw new Error('Word API not available. Please ensure you are running this add-in in Microsoft Word.');
  }

  // Additional check for Office.js initialization
  if (!Office.context || !Office.context.document) {
    throw new Error('Office.js not properly initialized. Please refresh the add-in.');
  }

  return await Word.run(async (context) => {
    const body = context.document.body;
    
    // Clear existing content
    body.clear();
    
    // Generate contract content based on form data
    const contractContent = generateContractContent(formData);
    
    // Insert the contract
    body.insertText(contractContent, Word.InsertLocation.start);
    
    // Apply formatting
    const range = body.getRange();
    range.font.name = "Calibri";
    range.font.size = 11;
    
    await context.sync();
  });
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

// Export form change handlers
export { handleAgreementTypeChange, handleContentTypeChange };

// Export utility functions for global access
window.generateContract = generateContract;
window.analyzeContract = analyzeContract;
window.applySuggestion = applySuggestion;
window.applyAllChanges = applyAllChanges;
window.dismissSuggestions = dismissSuggestions;
window.clearResults = clearResults;
window.clearSuggestions = clearSuggestions;
window.handleAgreementTypeChange = handleAgreementTypeChange;
window.handleContentTypeChange = handleContentTypeChange;
