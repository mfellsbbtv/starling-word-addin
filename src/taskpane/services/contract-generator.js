// Contract Generation Service
import { updateStatus, showProgressSection, hideProgressSection, handleError } from '../../shared/utils.js';

// Form field definitions for different agreement types
export const FORM_TEMPLATES = {
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
  },
  'data-pro': {
    'general': [
      { name: 'licensor_name', label: 'Licensor Legal Name', type: 'text', required: true, description: 'Legal name of the Licensor entity' },
      { name: 'licensor_entity_type', label: 'Entity Type', type: 'select', required: true, options: ['Corporation', 'LLC', 'Partnership', 'Individual', 'Other'], description: 'Type of legal entity for the Licensor' },
      { name: 'licensor_street', label: 'Street Address', type: 'text', required: true, description: 'Street address of the Licensor' },
      { name: 'licensor_city', label: 'City', type: 'text', required: true, description: 'City where the Licensor is located' },
      { name: 'licensor_state', label: 'State/Province', type: 'text', required: true, description: 'State or province where the Licensor is located' },
      { name: 'licensor_country', label: 'Country', type: 'select', required: true, options: ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Israel', 'Cyprus', 'Other'], description: 'Country where the Licensor is located' },
      { name: 'licensor_postal', label: 'Postal/Zip Code', type: 'text', required: true, description: 'Postal or zip code' },
      { name: 'licensor_email', label: 'Email Address', type: 'email', required: true, description: 'Primary email address for the Licensor' },
      { name: 'licensor_phone', label: 'Phone Number', type: 'text', required: true, description: 'Phone number including area code' },
      { name: 'licensor_signatory_name', label: 'Signatory Name', type: 'text', required: true, description: 'Full name of the person authorized to sign' },
      { name: 'licensor_signatory_title', label: 'Signatory Title', type: 'text', required: true, description: 'Title or position of the authorized signatory' },
      { name: 'content_type', label: 'Content Type', type: 'select', required: true, options: ['Video Content', 'Audio Content', 'Mixed Audio/Video Content', 'Other Media Content'], description: 'Type of content being licensed' },
      { name: 'content_description', label: 'Content Description', type: 'textarea', required: true, description: 'Brief description of the content being licensed' },
      { name: 'content_volume', label: 'Estimated Content Volume', type: 'select', required: true, options: ['Small (< 100 hours)', 'Medium (100-1000 hours)', 'Large (1000+ hours)', 'Ongoing/Continuous'], description: 'Estimated volume of content to be licensed' },
      { name: 'effective_date', label: 'Effective Date', type: 'date', required: true, description: 'Date when the agreement becomes effective' },
      { name: 'license_scope', label: 'License Scope', type: 'select', required: true, options: ['AI/ML Training Only', 'Research and Development', 'Full AI Development and Sublicensing', 'Custom Scope'], description: 'Scope of the license being granted' }
    ]
  }
};

// Handle agreement type selection
export function handleAgreementTypeChange() {
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
export function handleContentTypeChange() {
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
export function generateDynamicForm(agreementType, contentType) {
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

// Update contract preview with next contract details
export function updateContractPreview() {
  const previewData = getNextContractPreview();

  document.getElementById("preview-type").textContent = previewData.type;
  document.getElementById("preview-parties").textContent = previewData.parties;
  document.getElementById("preview-scope").textContent = previewData.scope;
}

// Get preview data for the next contract to be generated
function getNextContractPreview() {
  const previews = [
    {
      type: "Music Content Management Agreement",
      parties: "Starling Music Management & Alex Rivera",
      scope: "Digital distribution, rights management, and marketing"
    },
    {
      type: "Video Content Management Agreement",
      parties: "Digital Content Partners & Jordan Smith",
      scope: "YouTube optimization and brand partnerships"
    },
    {
      type: "Music Licensing Agreement",
      parties: "Harmony Licensing Group & Taylor Music Productions",
      scope: "Synchronization rights for film and television"
    }
  ];

  // Return a random preview to match the random contract generation
  return previews[Math.floor(Math.random() * previews.length)];
}

// Collect form data from the UI
export function collectFormData() {
  const agreementType = document.getElementById("agreement-type")?.value || "content-management";
  const contentType = document.getElementById("content-type")?.value || "music";

  // Collect RHEI-specific form fields from the UI
  const rheiFields = {
    provider_name: document.getElementById("provider-name")?.value || "Provider Name Ltd.",
    provider_address: document.getElementById("provider-address")?.value || "123 Provider Street, City, State, Country",
    provider_entity_type: "an incorporated company", // Default for now
    effective_date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    term_length: "2 years",
    territory: "worldwide",
    governing_law: "British Columbia, Canada",
    revenue_model: document.getElementById("revenue-model")?.value || "baseline"
  };

  // Collect any additional dynamic form fields
  const dynamicFields = {};
  const formInputs = document.querySelectorAll("#dynamic-form input, #dynamic-form select, #dynamic-form textarea");

  formInputs.forEach(input => {
    if (input.name) {
      dynamicFields[input.name] = input.value;
    }
  });

  // Merge RHEI fields with dynamic fields (RHEI fields take precedence)
  const allFields = { ...dynamicFields, ...rheiFields };

  return {
    agreement_type: agreementType,
    content_type: contentType,
    fields: allFields,
    timestamp: new Date().toISOString()
  };
}

// Validate form data - simplified for demo
export function validateFormData(formData) {
  // Since we're using default demo values, validation always passes
  return true;
}

// Generate contract using Excel-based training data (Legal Matrix disabled for browser compatibility)
export async function generateContractWithExcel(formData, generationOptions = {}) {
  console.log("Using Excel training data for contract generation...");

  try {
    // Skip Legal Matrix generation (disabled for browser compatibility)
    console.log("Legal Matrix generation disabled, using Excel training...");

    // Import Excel services dynamically
    const { excelTrainingService } = await import('../../services/excel-training-service.js');
    const { excelIntegrationService } = await import('../../services/excel-integration-service.js');

    // Check if Excel training data is available
    if (!excelTrainingService.trainingData.has('templates')) {
      console.log("No Excel training data available, loading demo data...");

      // Load demo Excel structure for testing
      const demoData = excelIntegrationService.getDemoExcelStructure();
      const structuredData = excelIntegrationService.validateAndStructureData(demoData);
      await excelTrainingService.loadExcelTrainingData(structuredData);
    }

    // Generate contract using Excel templates
    const contractText = await excelTrainingService.generateContractFromExcel(
      formData.agreement_type || 'content-management',
      formData.content_type || 'music',
      formData.fields || formData
    );

    return {
      success: true,
      contract_text: contractText,
      generation_method: "excel_training_fallback",
      training_source: "excel",
      metadata: {
        agreement_type: formData.agreement_type,
        content_type: formData.content_type,
        generated_at: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error("Contract generation failed:", error);
    return {
      success: false,
      error: error.message,
      generation_method: "all_methods_failed"
    };
  }
}

// Generate contract using Legal Matrix baseline clauses - DISABLED for browser compatibility
export async function generateContractWithLegalMatrix(formData, generationOptions = {}) {
  console.log("Legal Matrix generation disabled for browser compatibility");

  return {
    success: false,
    error: "Legal Matrix generation disabled for browser compatibility",
    generation_method: "legal_matrix_disabled"
  };
}

// Analyze contract using Legal Matrix - DISABLED for browser compatibility
export async function analyzeContractWithLegalMatrix(contractText, targetParty = null, options = {}) {
  console.log("Legal Matrix analysis disabled for browser compatibility");

  return {
    success: false,
    error: "Legal Matrix analysis disabled for browser compatibility",
    analysis_method: "legal_matrix_disabled"
  };
}

// Generate demo Legal Matrix CSV for testing
function generateDemoLegalMatrixCSV() {
  return `Article,Clause Number,Clause Title,Clause Summary BASELINE (Ninja Tune Ltd.),WMX,Sony,Lionsgate,Universal,Warner,Notes
2,2.1,Channel Management Services,"RHEI will provide Channel Management Services as detailed in Schedule ""B"" for Provider Channels listed in Schedule ""A"" or as mutually agreed.","RHEI shall provide Provider with the ""Channel Management Services"" as set out in Schedule ""B"" attached hereto (the ""Channel Management Services"") in connection with the Provider Channels set out in Schedule ""A"" attached hereto or any other Provider Channels mutually agreed upon by the parties in writing (email to suffice) (collectively, the ""Managed Channels"").","RHEI shall provide Provider with the ""Channel Management Services"" as set out in Schedule ""B"" attached hereto (the ""Channel Management Services"") in connection with the Provider Channels set out in Schedule ""A"" attached hereto or any other Provider Channels mutually agreed upon by the parties in writing (email to suffice) (collectively, the ""Managed Channels"").",WMX contract adds "solely" and explicitly states that all services are subject to Provider approval as per Schedules A and B.,✓,✓,Found in Article 3.3; BBTV provides full management services for 'Managed Channels'.
2,2.2,Service Scope,"Services include content optimization, audience development, and revenue maximization for Provider's digital content.","Services shall include but not be limited to: (a) content optimization and SEO; (b) audience development and engagement strategies; (c) revenue maximization through advertising and partnerships; (d) analytics and performance reporting.","Services encompass comprehensive digital content management including optimization, audience growth, monetization strategies, and detailed performance analytics.",✓,"Modified to include ""brand-safe"" content requirements and additional compliance monitoring.","Enhanced to include cross-platform promotion and integrated marketing campaigns.",Standard service scope with focus on music content optimization.
3,3.1,Revenue Sharing,"Net Revenue shall be shared 80% to Provider and 20% to RHEI after deduction of platform fees and direct costs.","Net Revenue Distribution: Provider shall receive eighty percent (80%) and RHEI shall receive twenty percent (20%) of all Net Revenue generated from the Managed Channels, calculated after deduction of Platform Fees and Direct Costs.","Revenue split remains 80/20 but includes additional deductions for marketing spend and third-party tools.",✓,"Modified to 85/15 split in Provider's favor with cap on RHEI's marketing deductions.","Tiered revenue sharing: 80/20 for first $100K, 85/15 thereafter.","Standard 80/20 split with quarterly reconciliation process."
3,3.2,Payment Terms,"Payments shall be made monthly within 30 days of month-end, provided minimum threshold of $100 is met.","RHEI shall pay Provider their share of Net Revenue on a monthly basis, no later than thirty (30) days following the end of each calendar month, subject to a minimum payment threshold of One Hundred Dollars ($100).","Payment terms extended to 45 days with $250 minimum threshold due to additional compliance requirements.",✓,"Accelerated payment terms: 15 days with $50 minimum threshold.","Bi-weekly payments for amounts over $500, monthly for smaller amounts.","Standard 30-day terms with $100 threshold and detailed reporting."
4,4.1,Term Duration,"This Agreement shall commence on the Effective Date and continue for an initial term of three (3) years.","Initial Term: This Agreement shall be effective as of the Effective Date and shall continue for an initial period of three (3) years, unless earlier terminated in accordance with the provisions hereof.","Extended to five (5) year initial term with automatic renewal provisions.",✓,"Reduced to two (2) year initial term with option for one-year extensions.","Rolling three-year term with annual review and adjustment periods.","Standard three-year term with mid-term performance review."
4,4.2,Termination Rights,"Either party may terminate this Agreement with ninety (90) days written notice, or immediately for material breach.","Termination: Either party may terminate this Agreement (a) with ninety (90) days prior written notice; or (b) immediately upon material breach by the other party that remains uncured for thirty (30) days after written notice.","Termination notice reduced to 60 days with 15-day cure period for breaches.",✓,"Termination for convenience requires 120 days notice; immediate termination only for specific enumerated breaches.","30-day termination notice with expedited termination for performance issues.","Standard 90-day notice with 30-day cure period and specific breach definitions."`;
}

// Generate contract using RHEI playbook data (primary method)
export async function generateContractWithPlaybook(formData, generationOptions = {}) {
  console.log("Generating contract with RHEI playbook system...");

  try {
    // Import PlaybookService
    const { PlaybookService } = await import('../../shared/playbook-service.js');
    const playbookService = new PlaybookService();

    // Load the RHEI content-management playbook
    const playbook = await playbookService.loadPlaybook('content-management', 'music');

    if (!playbook || !playbook.template) {
      throw new Error("Failed to load RHEI playbook template");
    }

    console.log("RHEI playbook loaded successfully:", playbook.metadata);

    // Prepare form data with RHEI-specific defaults
    const rheiFormData = {
      provider_name: formData.fields?.provider_name || formData.fields?.entity_name || 'Provider Name Ltd.',
      provider_address: formData.fields?.provider_address || '123 Provider Street, City, State, Country',
      provider_entity_type: formData.fields?.provider_entity_type || 'an incorporated company',
      effective_date: formData.fields?.effective_date || new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      term_length: formData.fields?.term_length || '2 years',
      territory: formData.fields?.territory || 'worldwide',
      governing_law: formData.fields?.governing_law || 'British Columbia, Canada',
      revenue_model: generationOptions.revenue_model || 'baseline',
      ...formData.fields
    };

    // Generate contract using the RHEI template
    const contractText = await generateRHEIContract(playbook, rheiFormData, generationOptions);

    return {
      success: true,
      contract_text: contractText,
      generation_method: "rhei_playbook",
      playbook_metadata: playbook.metadata,
      form_data: rheiFormData,
      metadata: {
        baseline: playbook.metadata.baseline,
        alternatives: playbook.metadata.alternatives,
        generated_at: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error("Error generating contract with RHEI playbook:", error);

    // Return error instead of falling back to avoid legal-matrix-loader issues
    return {
      success: false,
      error: error.message,
      generation_method: "rhei_playbook_failed"
    };
  }
}

// Generate contract with Excel-based training (fallback) or AI prompt system (final fallback)
export async function generateContractWithAI(formData, generationOptions = {}) {
  console.log("Generating contract with RHEI playbook system...");

  try {
    // Try RHEI playbook generation first
    const playbookResult = await generateContractWithPlaybook(formData, generationOptions);
    if (playbookResult.success) {
      return playbookResult;
    }

    // Skip Excel-based generation to avoid legal-matrix-loader issues
    console.log("Skipping Excel generation to avoid browser compatibility issues...");

    console.log("Excel generation failed, falling back to AI prompt system...");

    // Import AI prompts dynamically to avoid static import issues
    const { AI_PROMPTS } = await import('../../shared/config.js');

    // Set up generation options with defaults
    const options = {
      playbook: generationOptions.playbook || AI_PROMPTS.contractGeneration.defaultParameters.playbook,
      includeClauses: generationOptions.includeClauses || AI_PROMPTS.contractGeneration.defaultParameters.includeClauses,
      format: generationOptions.format || AI_PROMPTS.contractGeneration.defaultParameters.format,
      companyName: generationOptions.companyName || AI_PROMPTS.contractGeneration.defaultParameters.companyName,
      counterpartyName: generationOptions.counterpartyName || formData.fields?.entity_name || 'Provider Name, Inc.',
      jurisdiction: generationOptions.jurisdiction || AI_PROMPTS.contractGeneration.defaultParameters.jurisdiction,
      includeSchedules: generationOptions.includeSchedules !== undefined ? generationOptions.includeSchedules : AI_PROMPTS.contractGeneration.defaultParameters.includeSchedules
    };

    console.log("Generation options:", options);

    // Apply variable mapping for compatibility
    const mappedFormData = applyVariableMapping(formData, AI_PROMPTS.contractGeneration.variableMapping);

    // Generate contract using the new prompt structure
    const contractContent = generateContractFromTemplate(mappedFormData, options);

    return {
      success: true,
      contract_text: contractContent,
      generation_options: options,
      ai_prompt_used: "contractGeneration",
      metadata: {
        playbook: options.playbook,
        format: options.format,
        clauses_included: options.includeClauses,
        generated_at: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error("Error generating contract with AI prompt:", error);
    return {
      success: false,
      error: error.message,
      fallback_used: true
    };
  }
}

// Generate RHEI contract using playbook template
async function generateRHEIContract(playbook, formData, generationOptions = {}) {
  console.log("Generating RHEI contract from playbook template...");

  const template = playbook.template;
  let contractText = '';

  // Process each section in order
  const sortedSections = template.template.sections.sort((a, b) => a.order - b.order);

  for (const section of sortedSections) {
    // Skip sections based on generation options
    if (section.id === 'table_of_contents' && !generationOptions.includeTableOfContents) {
      continue;
    }
    if (section.id === 'schedules' && !generationOptions.includeSchedules) {
      continue;
    }

    // Add section content
    contractText += `${section.title}\n\n`;

    // Process section content with variable replacement
    let sectionContent = section.content;

    // Replace variables with form data
    sectionContent = replaceRHEIVariables(sectionContent, formData, generationOptions);

    // Handle alternative clauses based on revenue model
    if (section.id.includes('revenue') && formData.revenue_model && formData.revenue_model !== 'baseline') {
      const alternatives = template.alternatives;
      if (alternatives && alternatives[formData.revenue_model] && alternatives[formData.revenue_model][section.id]) {
        sectionContent = alternatives[formData.revenue_model][section.id].content;
        sectionContent = replaceRHEIVariables(sectionContent, formData, generationOptions);
      }
    }

    contractText += sectionContent + '\n\n';
  }

  // Add signature block
  contractText += generateRHEISignatureBlock(formData);

  return contractText;
}

// Simplified contract generation from TSV data
export async function generateSimpleContract(contractType) {
  console.log(`Generating ${contractType} contract from TSV data...`);

  try {
    let tsvData;

    // Load the appropriate TSV file
    if (contractType === 'content-management') {
      const response = await fetch('./playbooks/ContentManagement.tsv');
      tsvData = await response.text();
    } else if (contractType === 'data-pro') {
      const response = await fetch('./playbooks/DataPro.tsv');
      tsvData = await response.text();
    } else {
      throw new Error(`Unknown contract type: ${contractType}`);
    }

    // Parse TSV data
    const lines = tsvData.split('\n');
    // Skip the first line (tier info) and use the second line as headers
    const headers = lines[1].split('\t');

    console.log('TSV Headers found:', headers);

    // Find the baseline clause text column
    let clauseTextColumn = -1;
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i].trim();
      console.log(`Checking header ${i}: "${header}"`);
      if (header.includes('Full Clause Text BASELINE') ||
          header.includes('Full Clause Text (Original)') ||
          header.includes('Clause Summary BASELINE') ||
          header.toLowerCase().includes('baseline') && header.toLowerCase().includes('clause')) {
        clauseTextColumn = i;
        console.log(`Found baseline column at index ${i}: "${header}"`);
        break;
      }
    }

    if (clauseTextColumn === -1) {
      // Fallback: try column 6 which should be "Full Clause Text BASELINE (Ninja Tune Ltd.)"
      if (headers.length > 6 && headers[6] && headers[6].includes('BASELINE')) {
        clauseTextColumn = 6;
        console.log(`Using fallback column 6: "${headers[6]}"`);
      } else {
        console.error('Available headers:', headers);
        throw new Error('Could not find baseline clause text column in TSV data');
      }
    }

    // Build the contract
    let contractText = '';

    if (contractType === 'content-management') {
      contractText = buildContentManagementContract(lines, clauseTextColumn);
    } else if (contractType === 'data-pro') {
      contractText = buildDataProContract(lines, clauseTextColumn);
    }

    return {
      contractText: contractText,
      method: 'tsv_template'
    };

  } catch (error) {
    console.error('Error generating simple contract:', error);
    throw error;
  }
}

function buildContentManagementContract(lines, clauseTextColumn) {
  let contract = '';

  // Add header
  contract += 'DIGITAL VIDEO SERVICES AGREEMENT\n\n';
  contract += 'This Digital Video Services Agreement (the "Agreement") is made as of _____________ (the "Effective Date").\n\n';
  contract += 'BETWEEN:\n';
  contract += 'RHEI CREATIONS CORP., a British Columbia company having an address at 600-700 Hornby Street Vancouver, British Columbia, Canada V6Z 1S4 ("RHEI")\n\n';
  contract += 'AND:\n';
  contract += '_____________________________________________, an incorporated company having a principal place of business at _____________________________________________ ("Provider")\n\n';

  // Add recitals
  contract += 'WHEREAS:\n';
  contract += 'A. RHEI is a media and technology company that specializes in the optimization, monetization, claiming of video content and the management of online video channels;\n';
  contract += 'B. Provider is _____________________________________________;\n';
  contract += 'C. Provider operates a network of channels on YouTube and wishes to engage RHEI to assist in the management of such channels, and provide content production services with respect to such channels; and\n';
  contract += 'D. RHEI has agreed to accept such engagement on the terms and conditions herein provided.\n\n';
  contract += 'NOW THEREFORE THIS AGREEMENT WITNESSES that in consideration of the premises, the mutual covenants and agreements set forth in this Agreement and other good and valuable consideration (the receipt and sufficiency of which is hereby acknowledged by each of the parties), the parties hereby agree as follows:\n\n';

  // Process clauses from TSV (start from line 2 since line 1 is now headers)
  for (let i = 2; i < lines.length; i++) {
    const columns = lines[i].split('\t');
    if (columns.length > clauseTextColumn && columns[clauseTextColumn] && columns[clauseTextColumn].trim()) {
      const clauseText = columns[clauseTextColumn].trim();

      // Skip title page and table of contents entries
      if (clauseText.includes('DIGITAL VIDEO SERVICES AGREEMENT BETWEEN') ||
          clauseText.includes('ARTICLE 1 INTERPRETATION')) {
        continue;
      }

      // Add article/clause number if available
      const articleColumn = columns[1] || '';
      const clauseColumn = columns[2] || '';

      if (articleColumn && clauseColumn) {
        contract += `${articleColumn} ${clauseColumn}\n`;
      }

      contract += clauseText + '\n\n';
    }
  }

  // Add signature block
  contract += 'IN WITNESS WHEREOF, the parties have executed this Agreement.\n\n';
  contract += 'RHEI CREATIONS CORP.\n\n';
  contract += 'Per: _________________________\n';
  contract += 'Name: _______________________\n';
  contract += 'Title: ______________________\n';
  contract += 'Date: _______________________\n\n';
  contract += 'PROVIDER\n\n';
  contract += 'Per: _________________________\n';
  contract += 'Name: _______________________\n';
  contract += 'Title: ______________________\n';
  contract += 'Date: _______________________\n';

  return contract;
}

function buildDataProContract(lines, clauseTextColumn) {
  let contract = '';

  // Add header
  contract += 'DATA LICENSE AGREEMENT\n\n';
  contract += 'This Data License Agreement (the "Agreement") is entered into between RHEI CREATIONS CORP., a company having an address at Suite 600 - 777 Hornby St., Vancouver, B.C., Canada V6Z 1S4 ("RHEI" or the "Company") and _____________________________________________ ("Licensor" or "You").\n\n';
  contract += 'This Agreement consists of this Cover Sheet and the Terms and Conditions attached hereto as Schedule A.\n\n';

  // Add licensor information section
  contract += 'LICENSOR INFORMATION\n';
  contract += 'The following is to be completed by the provider of media content pursuant to this Agreement:\n';
  contract += 'Full Legal name: _____________________________________________ ("Licensor" or "You")\n';
  contract += 'Address: _____________________________________________\n';
  contract += 'Street: _____________________________________________\n';
  contract += 'City: _____________________________________________\n';
  contract += 'State/Province: _____________________________________________\n';
  contract += 'Country: _____________________________________________\n';
  contract += 'Postal/Zip Code: _____________________________________________\n';
  contract += 'Email address: _____________________________________________ ("Authorized Email")\n';
  contract += 'Phone number: _____________________________________________ (include area code)\n\n';

  // Process clauses from TSV (start from line 2 since line 1 is now headers)
  for (let i = 2; i < lines.length; i++) {
    const columns = lines[i].split('\t');
    if (columns.length > clauseTextColumn && columns[clauseTextColumn] && columns[clauseTextColumn].trim()) {
      const clauseText = columns[clauseTextColumn].trim();

      // Skip cover sheet entries that are already included
      if (clauseText.includes('This Data License Agreement') ||
          clauseText.includes('The following is to be completed')) {
        continue;
      }

      // Add section headers
      const sectionColumn = columns[2] || '';
      if (sectionColumn && sectionColumn.trim()) {
        contract += `${sectionColumn.toUpperCase()}\n`;
      }

      contract += clauseText + '\n\n';
    }
  }

  // Add signature block
  contract += 'EXECUTION\n';
  contract += 'DO NOT SIGN THIS COVER SHEET UNLESS AND UNTIL YOU HAVE READ AND AGREED TO THE TERMS AND CONDITIONS. THE TERMS AND CONDITIONS SHALL BE BINDING ON YOU UNDER THIS AGREEMENT.\n\n';
  contract += 'LICENSOR:\n';
  contract += '_____________________________________________\n';
  contract += 'Name of Company or other entity (if applicable)\n\n';
  contract += '_____________________________________________\n';
  contract += 'Signature of Authorized Signatory\n\n';
  contract += '_____________________________________________\n';
  contract += 'Name of Authorized Signatory\n\n';
  contract += '_____________________________________________\n';
  contract += 'Title of Authorized Signatory (if applicable)\n\n';
  contract += '_____________________________________________\n';
  contract += 'Execution Date\n\n';
  contract += 'Following Your completion of both (a) and (b) above, RHEI will send You an email communication to the Authorized Email confirming that this Agreement is complete ("RHEI Acceptance Email"). This email shall be deemed to constitute RHEI\'s acceptance, execution and delivery of this Agreement, and the date on which RHEI sends you this email shall be the "Effective Date" of this Agreement.\n';

  return contract;
}

// Replace RHEI-specific variables in contract text
function replaceRHEIVariables(content, formData, generationOptions = {}) {
  let processedContent = content;

  // RHEI-specific variable replacements
  const replacements = {
    '[PROVIDER_NAME]': formData.provider_name || 'Provider Name Ltd.',
    '[PROVIDER_ADDRESS]': formData.provider_address || '123 Provider Street, City, State, Country',
    '[PROVIDER_ENTITY_TYPE]': formData.provider_entity_type || 'an incorporated company',
    '[EFFECTIVE_DATE]': formData.effective_date || new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    '[TERM_LENGTH]': formData.term_length || '2 years',
    '[TERRITORY]': formData.territory || 'worldwide',
    '[GOVERNING_LAW]': formData.governing_law || 'British Columbia, Canada'
  };

  // Apply all replacements
  Object.entries(replacements).forEach(([placeholder, value]) => {
    processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
  });

  return processedContent;
}

// Generate RHEI signature block
function generateRHEISignatureBlock(formData) {
  return `
SIGNATURE BLOCK

IN WITNESS WHEREOF, the parties have executed this Digital Video Services Agreement as of the date first written above.

RHEI CREATIONS CORP.

By: _________________________
Name: [Name]
Title: [Title]
Date: ${formData.effective_date || new Date().toLocaleDateString()}


${formData.provider_name || 'PROVIDER NAME'}

By: _________________________
Name: [Name]
Title: [Title]
Date: ${formData.effective_date || new Date().toLocaleDateString()}
  `.trim();
}

// Apply variable mapping between old and new format
function applyVariableMapping(formData, variableMapping) {
  const mappedData = { ...formData };

  // Convert form fields to new variable format
  if (mappedData.fields) {
    const mappedFields = {};
    Object.entries(mappedData.fields).forEach(([key, value]) => {
      // Convert camelCase to PascalCase for new format
      const newKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      mappedFields[newKey] = value;
    });
    mappedData.fields = mappedFields;
  }

  return mappedData;
}

// Generate contract from template using new AI prompt structure
function generateContractFromTemplate(formData, options) {
  const contractType = formData.agreement_type || 'content-management';
  const contentType = formData.content_type || 'music';
  const fields = formData.fields || {};

  // Enhanced contract template with new AI prompt structure
  const contractTemplate = `
${generateContractHeader(options)}

${generatePreamble(options, fields)}

${generateRecitals(contractType, contentType, fields)}

${generateArticlesAndClauses(contractType, contentType, fields, options)}

${generateStandardSections(options, fields)}

${options.includeSchedules ? generateSchedules(contractType, contentType) : ''}

${generateSignatureBlock(options, fields)}
  `.trim();

  return contractTemplate;
}

// Generate contract header with new format
function generateContractHeader(options) {
  return `
**${options.format === 'WordReady' ? 'SERVICES AGREEMENT' : 'SERVICES AGREEMENT'}**

**Effective Date:** {{EffectiveDate}}
**Parties:** ${options.companyName} and ${options.counterpartyName}
**Jurisdiction:** ${options.jurisdiction}
**Playbook:** ${options.playbook}
**Clauses:** ${options.includeClauses}
  `.trim();
}

// Generate preamble section
function generatePreamble(options, fields) {
  return `
**PREAMBLE**

This Services Agreement ("Agreement") is entered into on {{EffectiveDate}} ("Effective Date") between ${options.companyName}, a corporation organized under the laws of ${options.jurisdiction} ("Company"), and ${options.counterpartyName}, a business entity ("Provider").
  `.trim();
}

// Generate recitals section
function generateRecitals(contractType, contentType, fields) {
  return `
**RECITALS**

WHEREAS, Company desires to engage Provider for ${contractType.replace('-', ' ')} services related to ${contentType} content;

WHEREAS, Provider has the expertise and capability to provide such services;

WHEREAS, the parties wish to set forth the terms and conditions of their business relationship;

NOW, THEREFORE, in consideration of the mutual covenants contained herein, the parties agree as follows:
  `.trim();
}

// Generate articles and clauses based on playbook
function generateArticlesAndClauses(contractType, contentType, fields, options) {
  const clauses = parseClauseRange(options.includeClauses);
  let content = '';

  // Generate numbered articles and clauses
  clauses.forEach((clause, index) => {
    const articleNum = Math.floor(clause) || (index + 1);
    const clauseNum = clause % 1 ? clause.toFixed(1) : clause;

    content += `
**${articleNum}. ${getArticleTitle(articleNum, contractType)}**

${articleNum}.1 ${getClauseContent(clauseNum, contractType, contentType, fields)}
    `;
  });

  return content.trim();
}

// Parse clause range (e.g., "2.1-9.5" -> [2.1, 2.2, ..., 9.5])
function parseClauseRange(rangeStr) {
  const [start, end] = rangeStr.split('-').map(parseFloat);
  const clauses = [];

  for (let i = start; i <= end; i += 0.1) {
    clauses.push(Math.round(i * 10) / 10);
  }

  return clauses.slice(0, 20); // Limit for demo
}

// Get article title based on number and contract type
function getArticleTitle(articleNum, contractType) {
  const titles = {
    1: 'SERVICES',
    2: 'OBLIGATIONS',
    3: 'CONFIDENTIALITY',
    4: 'COMPENSATION',
    5: 'TERM',
    6: 'TERMINATION',
    7: 'LIABILITY',
    8: 'GENERAL PROVISIONS',
    9: 'MISCELLANEOUS'
  };

  return titles[articleNum] || `ARTICLE ${articleNum}`;
}

// Get clause content based on clause number and contract details
function getClauseContent(clauseNum, contractType, contentType, fields) {
  // This would normally pull from the playbook database
  return `Standard clause content for ${contractType} ${contentType} agreement. [Clause ${clauseNum}]`;
}

// Generate standard sections
function generateStandardSections(options, fields) {
  return `
**DEFINITIONS**

For purposes of this Agreement, the following terms shall have the meanings set forth below:

**TERM AND TERMINATION**

This Agreement shall commence on {{EffectiveDate}} and continue for {{TermLength}}.

**GENERAL PROVISIONS**

This Agreement shall be governed by the laws of ${options.jurisdiction}.
  `.trim();
}

// Generate schedules if requested
function generateSchedules(contractType, contentType) {
  return `
**SCHEDULE A - CHANNEL MANAGEMENT**

[Channel management details for ${contentType} content]

**SCHEDULE B - CONTENT DEVELOPMENT**

[Content development specifications for ${contractType}]
  `.trim();
}

// Generate signature block
function generateSignatureBlock(options, fields) {
  return `
**SIGNATURE BLOCK**

${options.companyName}

By: _________________________
Name: {{RHEISignatory}}
Title: {{RHEITitle}}
Date: {{EffectiveDate}}


${options.counterpartyName}

By: _________________________
Name: {{ProviderSignatory}}
Title: {{ProviderTitle}}
Date: {{EffectiveDate}}
  `.trim();
}
