// API Service Layer - following augment-guidelines: centralized API calls
import { AI_PROMPTS } from './config.js';

export class APIService {
  constructor(config) {
    this.config = config;
  }

  async makeRequest(endpoint, options = {}) {
    if (!this.config.USE_REAL_API) {
      console.log(`[DEMO MODE] Would call API: ${endpoint}`, options);
      return this.getMockResponse(endpoint, options);
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        ...this.config.headers,
        ...options.headers
      },
      ...options
    };

    if (options.body && typeof options.body === 'object') {
      requestOptions.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Mock responses for demo mode
  getMockResponse(endpoint, options) {
    if (endpoint.includes('/analyze')) {
      return this.getMockAnalysisResponse(options.body);
    } else if (endpoint.includes('/generate')) {
      return this.getMockGenerationResponse(options.body);
    } else if (endpoint.includes('/health')) {
      return { status: 'healthy', timestamp: new Date().toISOString() };
    }

    return { message: 'Mock response', endpoint, options };
  }

  getMockAnalysisResponse(requestData) {
    // Return mock analysis data (existing demo logic)
    return {
      contract_type: "Content Management Agreement",
      compliance_score: 85,
      summary: "This contract appears well-structured with standard clauses.",
      risks: [
        { severity: "medium", description: "Consider adding force majeure clause" },
        { severity: "low", description: "Termination notice period could be more specific" }
      ],
      key_terms: ["Payment Terms", "Geographic Scope", "Rights Management"],
      recommendations: [
        "Consider legal review before execution",
        "Ensure all parties review terms carefully"
      ]
    };
  }

  getMockGenerationResponse(requestData) {
    // Return mock generation data
    return {
      contract_text: "Generated contract content would be here...",
      metadata: {
        template_used: requestData?.agreement_type || "content-management",
        generated_at: new Date().toISOString()
      }
    };
  }

  // API Methods
  async analyzeContract(documentText, contractType = 'general') {
    // Prepare the AI prompt for real API calls
    const userPrompt = AI_PROMPTS.contractReview.userPromptTemplate
      .replace('{documentText}', documentText)
      .replace('{contractType}', contractType);

    return this.makeRequest('/contracts/analyze', {
      method: 'POST',
      body: {
        document_text: documentText,
        contract_type: contractType,
        analysis_type: 'comprehensive',
        ai_prompt: {
          system_prompt: AI_PROMPTS.contractReview.systemPrompt,
          user_prompt: userPrompt
        },
        requirements: {
          article_numbering: true,
          deviation_classification: true,
          risk_quantification: true,
          track_changes: true
        }
      }
    });
  }

  async generateContract(formData, generationOptions = {}) {
    // Prepare the AI prompt for contract generation
    const {
      playbook = AI_PROMPTS.contractGeneration.defaultParameters.playbook,
      includeClauses = AI_PROMPTS.contractGeneration.defaultParameters.includeClauses,
      format = AI_PROMPTS.contractGeneration.defaultParameters.format,
      companyName = AI_PROMPTS.contractGeneration.defaultParameters.companyName,
      counterpartyName = formData.fields?.entity_name || 'Provider Name, Inc.',
      jurisdiction = AI_PROMPTS.contractGeneration.defaultParameters.jurisdiction,
      includeSchedules = AI_PROMPTS.contractGeneration.defaultParameters.includeSchedules
    } = generationOptions;

    const userPrompt = AI_PROMPTS.contractGeneration.userPromptTemplate
      .replace('{playbook}', playbook)
      .replace('{includeClauses}', includeClauses)
      .replace('{format}', format)
      .replace('{companyName}', companyName)
      .replace('{counterpartyName}', counterpartyName)
      .replace('{jurisdiction}', jurisdiction)
      .replace('{includeSchedules}', includeSchedules)
      .replace('{contractType}', formData.agreement_type || 'general')
      .replace('{contentType}', formData.content_type || 'general')
      .replace('{formData}', JSON.stringify(formData.fields || {}));

    return this.makeRequest('/contracts/generate', {
      method: 'POST',
      body: {
        ...formData,
        generation_options: generationOptions,
        ai_prompt: {
          system_prompt: AI_PROMPTS.contractGeneration.systemPrompt,
          user_prompt: userPrompt
        },
        parameters: {
          playbook,
          include_clauses: includeClauses,
          format,
          company_name: companyName,
          counterparty_name: counterpartyName,
          jurisdiction,
          include_schedules: includeSchedules
        }
      }
    });
  }

  async checkHealth() {
    return this.makeRequest('/health');
  }
}
