// Configuration - following augment-guidelines: environment-specific URLs
const API_CONFIG = {
  baseUrl: process.env.NODE_ENV === 'production'
    ? 'https://starling.yourdomain.com/api/v1'  // Update with your production domain
    : 'http://localhost:8000/api/v1',  // Local development API
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer dev-token'  // TODO: Implement proper auth
  }
};

// Form field definitions for different agreement types
const FORM_TEMPLATES = {
  'content-management': {
    'music': [
      { name: 'entity_name', label: 'Entity Name', type: 'text', required: true, description: 'Name of the contracting entity' },
      { name: 'content_creator', label: 'Content Creator', type: 'text', required: true, description: 'Name of the content creator/artist' },
      { name: 'scope_description', label: 'Scope of Work', type: 'textarea', required: true, description: 'Detailed description of content management services' },
      { name: 'revenue_split', label: 'Revenue Split (%)', type: 'number', required: true, description: 'Percentage split for revenue sharing' },
      { name: 'term_length', label: 'Contract Term', type: 'select', required: true, options: ['1 year', '2 years', '3 years', '5 years'], description: 'Duration of the agreement' },
      { name: 'territory', label: 'Territory', type: 'select', required: true, options: ['Worldwide', 'North America', 'United States', 'Canada', 'Other'], description: 'Geographic scope of the agreement' },
      { name: 'music_rights', label: 'Music Rights', type: 'select', required: true, options: ['Master Rights', 'Publishing Rights', 'Both', 'Synchronization Only'], description: 'Type of music rights being managed' },
      { name: 'advance_amount', label: 'Advance Amount ($)', type: 'number', required: false, description: 'Initial advance payment (if applicable)' },
      { name: 'termination_notice', label: 'Termination Notice (days)', type: 'number', required: true, description: 'Notice period required for termination' }
    ],
    'non-music': [
      { name: 'entity_name', label: 'Entity Name', type: 'text', required: true, description: 'Name of the contracting entity' },
      { name: 'content_creator', label: 'Content Creator', type: 'text', required: true, description: 'Name of the content creator' },
      { name: 'scope_description', label: 'Scope of Work', type: 'textarea', required: true, description: 'Detailed description of content management services' },
      { name: 'revenue_split', label: 'Revenue Split (%)', type: 'number', required: true, description: 'Percentage split for revenue sharing' },
      { name: 'term_length', label: 'Contract Term', type: 'select', required: true, options: ['1 year', '2 years', '3 years', '5 years'], description: 'Duration of the agreement' },
      { name: 'territory', label: 'Territory', type: 'select', required: true, options: ['Worldwide', 'North America', 'United States', 'Canada', 'Other'], description: 'Geographic scope of the agreement' },
      { name: 'content_type', label: 'Content Type', type: 'select', required: true, options: ['Video Content', 'Podcast', 'Written Content', 'Social Media', 'Mixed Media'], description: 'Type of content being managed' },
      { name: 'platform_focus', label: 'Platform Focus', type: 'select', required: true, options: ['YouTube', 'TikTok', 'Instagram', 'Multi-Platform', 'Other'], description: 'Primary platform for content distribution' },
      { name: 'termination_notice', label: 'Termination Notice (days)', type: 'number', required: true, description: 'Notice period required for termination' }
    ],
    'both': [
      { name: 'entity_name', label: 'Entity Name', type: 'text', required: true, description: 'Name of the contracting entity' },
      { name: 'content_creator', label: 'Content Creator', type: 'text', required: true, description: 'Name of the content creator/artist' },
      { name: 'scope_description', label: 'Scope of Work', type: 'textarea', required: true, description: 'Detailed description of content management services' },
      { name: 'revenue_split_music', label: 'Music Revenue Split (%)', type: 'number', required: true, description: 'Percentage split for music revenue' },
      { name: 'revenue_split_content', label: 'Content Revenue Split (%)', type: 'number', required: true, description: 'Percentage split for non-music content revenue' },
      { name: 'term_length', label: 'Contract Term', type: 'select', required: true, options: ['1 year', '2 years', '3 years', '5 years'], description: 'Duration of the agreement' },
      { name: 'territory', label: 'Territory', type: 'select', required: true, options: ['Worldwide', 'North America', 'United States', 'Canada', 'Other'], description: 'Geographic scope of the agreement' },
      { name: 'music_rights', label: 'Music Rights', type: 'select', required: true, options: ['Master Rights', 'Publishing Rights', 'Both', 'Synchronization Only'], description: 'Type of music rights being managed' },
      { name: 'content_platforms', label: 'Content Platforms', type: 'select', required: true, options: ['YouTube', 'TikTok', 'Instagram', 'Multi-Platform', 'Other'], description: 'Primary platforms for content distribution' },
      { name: 'termination_notice', label: 'Termination Notice (days)', type: 'number', required: true, description: 'Notice period required for termination' }
    ]
  }
};

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    // Initialize event handlers
    document.getElementById("agreement-type").onchange = handleAgreementTypeChange;
    document.getElementById("content-type").onchange = handleContentTypeChange;
    document.getElementById("generate-contract").onclick = generateContract;
    
    // Existing analysis handlers
    document.getElementById("analyze-contract").onclick = analyzeContract;
    document.getElementById("generate-summary").onclick = generateSummary;
    document.getElementById("highlight-risks").onclick = highlightRisks;
    document.getElementById("suggest-changes").onclick = suggestChanges;
    document.getElementById("check-compliance").onclick = checkCompliance;

    // Set status as ready
    updateStatus("Ready to generate or analyze contracts", "info");
  }
});

// Handle agreement type selection
function handleAgreementTypeChange() {
  const agreementType = document.getElementById("agreement-type").value;
  const contentTypeGroup = document.getElementById("content-type-group");
  const dynamicForm = document.getElementById("dynamic-form");
  const generateButtonGroup = document.getElementById("generate-button-group");
  
  if (agreementType) {
    contentTypeGroup.style.display = "block";
    // Reset content type selection
    document.getElementById("content-type").value = "";
    dynamicForm.style.display = "none";
    generateButtonGroup.style.display = "none";
  } else {
    contentTypeGroup.style.display = "none";
    dynamicForm.style.display = "none";
    generateButtonGroup.style.display = "none";
  }
}

// Handle content type selection
function handleContentTypeChange() {
  const agreementType = document.getElementById("agreement-type").value;
  const contentType = document.getElementById("content-type").value;
  const dynamicForm = document.getElementById("dynamic-form");
  const generateButtonGroup = document.getElementById("generate-button-group");
  
  if (agreementType && contentType) {
    generateDynamicForm(agreementType, contentType);
    dynamicForm.style.display = "block";
    generateButtonGroup.style.display = "block";
  } else {
    dynamicForm.style.display = "none";
    generateButtonGroup.style.display = "none";
  }
}

// Generate dynamic form based on selections
function generateDynamicForm(agreementType, contentType) {
  const dynamicForm = document.getElementById("dynamic-form");
  const template = FORM_TEMPLATES[agreementType]?.[contentType];
  
  if (!template) {
    dynamicForm.innerHTML = '<p class="ms-font-s">Form template not available for this combination.</p>';
    return;
  }
  
  let formHTML = '<h3 class="ms-font-l">Contract Details</h3>';
  
  template.forEach(field => {
    const requiredClass = field.required ? 'required-field' : '';
    const requiredAttr = field.required ? 'required' : '';
    
    formHTML += `<div class="form-field ${requiredClass}">`;
    formHTML += `<label for="${field.name}">${field.label}:</label>`;
    
    if (field.type === 'textarea') {
      formHTML += `<textarea id="${field.name}" name="${field.name}" ${requiredAttr} placeholder="Enter ${field.label.toLowerCase()}"></textarea>`;
    } else if (field.type === 'select') {
      formHTML += `<select id="${field.name}" name="${field.name}" ${requiredAttr}>`;
      formHTML += `<option value="">Select ${field.label}</option>`;
      field.options.forEach(option => {
        formHTML += `<option value="${option}">${option}</option>`;
      });
      formHTML += `</select>`;
    } else {
      const inputType = field.type === 'number' ? 'number' : 'text';
      formHTML += `<input type="${inputType}" id="${field.name}" name="${field.name}" ${requiredAttr} placeholder="Enter ${field.label.toLowerCase()}">`;
    }
    
    if (field.description) {
      formHTML += `<div class="field-description">${field.description}</div>`;
    }
    
    formHTML += `</div>`;
  });
  
  dynamicForm.innerHTML = formHTML;
}

// Generate contract based on form data
async function generateContract() {
  updateStatus("Generating contract...", "info");
  showProgressSection("Collecting form data...");

  try {
    // Collect form data
    const formData = collectFormData();
    
    if (!validateFormData(formData)) {
      throw new Error("Please fill in all required fields");
    }

    showProgressSection("Generating contract with AI...");

    // Call the API to generate contract
    const contractResult = await callContractGenerationAPI(formData);

    // Insert contract into Word document
    await insertContractIntoWord(contractResult.contract_text);

    updateStatus("Contract generated successfully!", "success");
    hideProgressSection();

  } catch (error) {
    handleError(error);
  }
}

// Collect form data
function collectFormData() {
  const agreementType = document.getElementById("agreement-type").value;
  const contentType = document.getElementById("content-type").value;
  const dynamicForm = document.getElementById("dynamic-form");
  
  const formData = {
    agreement_type: agreementType,
    content_type: contentType,
    fields: {}
  };
  
  // Collect all form field values
  const inputs = dynamicForm.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    if (input.name) {
      formData.fields[input.name] = input.value;
    }
  });
  
  return formData;
}

// Validate form data
function validateFormData(formData) {
  const template = FORM_TEMPLATES[formData.agreement_type]?.[formData.content_type];
  if (!template) return false;
  
  for (const field of template) {
    if (field.required && (!formData.fields[field.name] || formData.fields[field.name].trim() === '')) {
      updateStatus(`Please fill in the required field: ${field.label}`, "error");
      return false;
    }
  }
  
  return true;
}

// Call contract generation API
async function callContractGenerationAPI(formData) {
  const response = await fetch(`${API_CONFIG.baseUrl}/generate-contract`, {
    method: 'POST',
    headers: API_CONFIG.headers,
    body: JSON.stringify(formData)
  });

  if (!response.ok) {
    throw new Error(`Contract generation failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Insert generated contract into Word document
async function insertContractIntoWord(contractText) {
  await Word.run(async (context) => {
    // Clear existing content
    const body = context.document.body;
    body.clear();
    
    // Insert the generated contract
    body.insertText(contractText, Word.InsertLocation.start);
    
    // Format the document
    const range = body.getRange();
    range.font.name = "Calibri";
    range.font.size = 11;
    range.paragraphFormat.lineSpacing = 1.15;
    
    await context.sync();
  });
}

// Helper functions
function updateStatus(message, type = "info") {
  const statusElement = document.getElementById("status-message");
  statusElement.textContent = message;
  statusElement.className = `status-message ms-font-s ${type}`;
}

function showProgressSection(message) {
  document.getElementById("progress-section").style.display = "block";
  document.getElementById("progress-text").textContent = message;
  simulateProgress();
}

function hideProgressSection() {
  document.getElementById("progress-section").style.display = "none";
}

function simulateProgress() {
  let width = 0;
  const progressFill = document.getElementById("progress-fill");
  const interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
    } else {
      width += 5;
      progressFill.style.width = width + "%";
    }
  }, 100);
}

function handleError(error) {
  console.error(error);
  updateStatus(`Error: ${error.message}`, "error");
  hideProgressSection();
}

// Existing functions (keeping for backward compatibility)
async function analyzeContract() {
  updateStatus("Analyzing contract...", "info");
  showProgressSection("Extracting document content...");

  try {
    const documentText = await Word.run(async (context) => {
      const body = context.document.body;
      body.load("text");
      await context.sync();
      return body.text;
    });

    if (!documentText || documentText.trim().length === 0) {
      throw new Error("No content found in document");
    }

    showProgressSection("Sending to AI for analysis...");
    const analysisResult = await callAnalysisAPI(documentText);
    displayAnalysisResults(analysisResult);
    updateStatus("Analysis complete", "success");
    hideProgressSection();

  } catch (error) {
    handleError(error);
  }
}

async function callAnalysisAPI(content) {
  const response = await fetch(`${API_CONFIG.baseUrl}/analyze`, {
    method: 'POST',
    headers: API_CONFIG.headers,
    body: JSON.stringify({
      content: content,
      analysis_type: 'comprehensive'
    })
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

function displayAnalysisResults(result) {
  const resultsSection = document.getElementById("results-section");
  const resultsContent = document.getElementById("results-content");

  let html = `
    <div class="analysis-summary">
      <h3>Analysis Summary</h3>
      <p>${result.summary}</p>
      <p><strong>Compliance Score:</strong> ${result.compliance_score}/100</p>
    </div>`;

  resultsSection.style.display = "block";
  resultsContent.innerHTML = html;
}

// Placeholder functions for other buttons
function generateSummary() {
  updateStatus("Generating summary...", "info");
}

function highlightRisks() {
  updateStatus("Highlighting risks...", "info");
}

function suggestChanges() {
  updateStatus("Suggesting changes...", "info");
}

function checkCompliance() {
  updateStatus("Checking compliance...", "info");
}
