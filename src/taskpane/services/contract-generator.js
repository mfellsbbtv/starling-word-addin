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
