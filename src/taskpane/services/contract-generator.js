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

// Collect form data - simplified for demo
export function collectFormData() {
  // Since form fields are hidden, use varied demo values for more realistic contracts
  const demoVariations = [
    {
      agreement_type: 'content-management',
      content_type: 'music',
      fields: {
        entity_name: 'Starling Music Management LLC',
        content_creator: 'Alex Rivera',
        scope_description: 'Comprehensive music content management including digital distribution across all major platforms, rights management, marketing campaigns, and revenue collection services.',
        revenue_split: '20',
        term_length: '3 years',
        territory: 'Worldwide',
        music_rights: 'Master Rights',
        advance_amount: '15000',
        termination_notice: '60'
      }
    },
    {
      agreement_type: 'content-management',
      content_type: 'non-music',
      fields: {
        entity_name: 'Digital Content Partners',
        content_creator: 'Jordan Smith',
        scope_description: 'Full-service content management for video content including YouTube optimization, brand partnerships, content strategy, and monetization.',
        revenue_split: '25',
        term_length: '2 years',
        territory: 'North America',
        content_type: 'Video Content',
        platform_focus: 'YouTube',
        termination_notice: '30'
      }
    },
    {
      agreement_type: 'licensing',
      content_type: 'music',
      fields: {
        entity_name: 'Harmony Licensing Group',
        content_creator: 'Taylor Music Productions',
        scope_description: 'Licensing agreement for synchronization rights in film, television, and digital media.',
        license_fee: '5000',
        term_length: '5 years',
        territory: 'Worldwide',
        music_rights: 'Synchronization Rights',
        termination_notice: '90'
      }
    }
  ];

  // Randomly select a demo variation for variety
  const selectedDemo = demoVariations[Math.floor(Math.random() * demoVariations.length)];
  return selectedDemo;
}

// Validate form data - simplified for demo
export function validateFormData(formData) {
  // Since we're using default demo values, validation always passes
  return true;
}

// Generate contract using Legal Matrix (preferred) or Excel-based training data (fallback)
export async function generateContractWithExcel(formData, generationOptions = {}) {
  console.log("Attempting Legal Matrix contract generation...");

  try {
    // Try Legal Matrix generation first
    const matrixResult = await generateContractWithLegalMatrix(formData, generationOptions);
    if (matrixResult.success) {
      return matrixResult;
    }

    console.log("Legal Matrix generation failed, falling back to Excel training...");

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

// Generate contract using Legal Matrix baseline clauses
export async function generateContractWithLegalMatrix(formData, generationOptions = {}) {
  console.log("Generating contract using Legal Matrix baseline clauses...");

  try {
    // Import Legal Matrix loader
    const { legalMatrixLoader } = await import('../../services/legal-matrix-loader.js');

    // Ensure Legal Matrix is loaded
    await legalMatrixLoader.loadLegalMatrix();

    // Generate contract from baseline clauses
    const contractResult = await legalMatrixLoader.generateContract(
      {
        company_name: formData.fields?.company_name || 'RHEI, Inc.',
        provider_name: formData.fields?.provider_name || 'Provider Name, Inc.',
        effective_date: formData.fields?.effective_date || new Date().toLocaleDateString()
      },
      generationOptions
    );

    return {
      success: true,
      contract_text: contractResult.contractText,
      generation_method: "legal_matrix_baseline",
      training_source: "legal_matrix_tsv",
      metadata: {
        clauses_used: contractResult.clausesUsed,
        articles_generated: contractResult.articlesGenerated,
        agreement_type: formData.agreement_type,
        content_type: formData.content_type,
        generated_at: new Date().toISOString(),
        legal_matrix_stats: legalMatrixLoader.getStatistics()
      }
    };

  } catch (error) {
    console.error("Legal Matrix generation failed:", error);
    return {
      success: false,
      error: error.message,
      generation_method: "legal_matrix_failed"
    };
  }
}

// Analyze contract using Legal Matrix
export async function analyzeContractWithLegalMatrix(contractText, targetParty = null, options = {}) {
  console.log(`Analyzing contract with Legal Matrix${targetParty ? ` for party: ${targetParty}` : ''}...`);

  try {
    // Import Legal Matrix loader
    const { legalMatrixLoader } = await import('../../services/legal-matrix-loader.js');

    // Ensure Legal Matrix is loaded
    await legalMatrixLoader.loadLegalMatrix();

    // Analyze contract against Legal Matrix
    const analysis = await legalMatrixLoader.analyzeContract(contractText, targetParty, options);

    return {
      success: true,
      analysis,
      analysis_method: "legal_matrix",
      target_party: targetParty,
      supported_parties: legalMatrixLoader.getSupportedParties(),
      analyzed_at: new Date().toISOString()
    };

  } catch (error) {
    console.error("Legal Matrix analysis failed:", error);
    return {
      success: false,
      error: error.message,
      analysis_method: "legal_matrix_failed"
    };
  }
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

// Generate contract with Excel-based training (preferred) or AI prompt system (fallback)
export async function generateContractWithAI(formData, generationOptions = {}) {
  console.log("Generating contract with Excel-based training system...");

  try {
    // Try Excel-based generation first
    const excelResult = await generateContractWithExcel(formData, generationOptions);
    if (excelResult.success) {
      return excelResult;
    }

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
