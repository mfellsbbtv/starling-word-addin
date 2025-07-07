// Playbook Service - Manages contract playbooks and templates
export class PlaybookService {
  constructor() {
    this.playbooks = new Map();
    this.loadedPlaybooks = new Set();
  }

  /**
   * Load a playbook for a specific contract type and content type
   * @param {string} agreementType - The agreement type (e.g., 'content-management')
   * @param {string} contentType - The content type (e.g., 'music', 'non-music', 'both')
   * @returns {Promise<Object>} The loaded playbook
   */
  async loadPlaybook(agreementType, contentType) {
    const playbookKey = `${agreementType}-${contentType}`;
    
    if (this.playbooks.has(playbookKey)) {
      return this.playbooks.get(playbookKey);
    }

    try {
      const playbook = await this.fetchPlaybookFiles(agreementType, contentType);
      this.playbooks.set(playbookKey, playbook);
      this.loadedPlaybooks.add(playbookKey);
      
      console.log(`Loaded playbook: ${playbookKey}`);
      return playbook;
    } catch (error) {
      console.error(`Failed to load playbook ${playbookKey}:`, error);
      return this.getFallbackPlaybook(agreementType, contentType);
    }
  }

  /**
   * Fetch all playbook files for a specific type
   * @param {string} agreementType 
   * @param {string} contentType 
   * @returns {Promise<Object>} Combined playbook data
   */
  async fetchPlaybookFiles(agreementType, contentType) {
    const baseUrl = this.getPlaybookBaseUrl();
    const playbookPath = `${agreementType}/${contentType}`;
    
    const [template, clauses, riskRules, formFields] = await Promise.all([
      this.fetchJsonFile(`${baseUrl}/${playbookPath}/template.json`),
      this.fetchJsonFile(`${baseUrl}/${playbookPath}/clauses.json`),
      this.fetchJsonFile(`${baseUrl}/${playbookPath}/risk-rules.json`).catch(() => null),
      this.fetchJsonFile(`${baseUrl}/${playbookPath}/form-fields.json`).catch(() => null)
    ]);

    return {
      metadata: {
        agreementType,
        contentType,
        loadedAt: new Date().toISOString()
      },
      template,
      clauses,
      riskRules,
      formFields
    };
  }

  /**
   * Get the base URL for playbook files
   * @returns {string} Base URL
   */
  getPlaybookBaseUrl() {
    // In development, use local files
    if (window.location.hostname === 'localhost') {
      return '/playbooks';
    }
    // In production, use GitHub Pages
    return 'https://mfellsbbtv.github.io/starling-word-addin/playbooks';
  }

  /**
   * Fetch a JSON file with error handling
   * @param {string} url 
   * @returns {Promise<Object>}
   */
  async fetchJsonFile(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    return await response.json();
  }

  /**
   * Get contract template for generation
   * @param {string} agreementType 
   * @param {string} contentType 
   * @returns {Promise<Object>} Template data
   */
  async getTemplate(agreementType, contentType) {
    const playbook = await this.loadPlaybook(agreementType, contentType);
    return playbook.template;
  }

  /**
   * Get standard clauses for analysis
   * @param {string} agreementType 
   * @param {string} contentType 
   * @returns {Promise<Object>} Clauses data
   */
  async getClauses(agreementType, contentType) {
    const playbook = await this.loadPlaybook(agreementType, contentType);
    return playbook.clauses;
  }

  /**
   * Get risk assessment rules
   * @param {string} agreementType 
   * @param {string} contentType 
   * @returns {Promise<Object>} Risk rules data
   */
  async getRiskRules(agreementType, contentType) {
    const playbook = await this.loadPlaybook(agreementType, contentType);
    return playbook.riskRules;
  }

  /**
   * Get form field configuration
   * @param {string} agreementType 
   * @param {string} contentType 
   * @returns {Promise<Object>} Form fields data
   */
  async getFormFields(agreementType, contentType) {
    const playbook = await this.loadPlaybook(agreementType, contentType);
    return playbook.formFields;
  }

  /**
   * Generate contract using playbook template
   * @param {string} agreementType 
   * @param {string} contentType 
   * @param {Object} formData 
   * @returns {Promise<string>} Generated contract text
   */
  async generateContract(agreementType, contentType, formData) {
    const template = await this.getTemplate(agreementType, contentType);
    
    if (!template) {
      throw new Error(`No template found for ${agreementType}-${contentType}`);
    }

    return this.processTemplate(template, formData);
  }

  /**
   * Process template with form data
   * @param {Object} template 
   * @param {Object} formData 
   * @returns {string} Processed contract text
   */
  processTemplate(template, formData) {
    let contractText = `${template.template.title}\n\n`;
    
    // Process each section
    template.template.sections.forEach(section => {
      contractText += `${section.title}\n\n`;
      contractText += this.replaceVariables(section.content, formData) + '\n\n';
    });

    return contractText;
  }

  /**
   * Replace template variables with actual values
   * @param {string} content 
   * @param {Object} formData 
   * @returns {string} Content with variables replaced
   */
  replaceVariables(content, formData) {
    let processedContent = content;
    
    // Replace all [VARIABLE] placeholders
    Object.keys(formData).forEach(key => {
      const placeholder = `[${key.toUpperCase()}]`;
      const value = formData[key] || `[${key.toUpperCase()}]`;
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
    });

    // Handle calculated variables
    if (formData.revenue_split) {
      const artistSplit = 100 - parseFloat(formData.revenue_split);
      processedContent = processedContent.replace(/\[ARTIST_SPLIT\]/g, artistSplit.toString());
    }

    // Handle conditional content
    if (formData.advance_amount && parseFloat(formData.advance_amount) > 0) {
      processedContent = processedContent.replace(
        /\[ADVANCE_CLAUSE\]/g, 
        `Manager shall provide an advance of $${formData.advance_amount}, which shall be recoupable from Artist's future earnings.`
      );
    } else {
      processedContent = processedContent.replace(/\[ADVANCE_CLAUSE\]/g, 'No advance payment is provided under this Agreement.');
    }

    return processedContent;
  }

  /**
   * Assess contract risks using playbook rules
   * @param {string} contractText 
   * @param {string} agreementType 
   * @param {string} contentType 
   * @returns {Promise<Object>} Risk assessment results
   */
  async assessRisks(contractText, agreementType, contentType) {
    const riskRules = await this.getRiskRules(agreementType, contentType);
    
    if (!riskRules) {
      return this.getBasicRiskAssessment(contractText);
    }

    const risks = [];
    const contractLower = contractText.toLowerCase();

    // Process each risk rule
    riskRules.risk_rules.forEach(rule => {
      const riskDetected = this.evaluateRiskRule(rule, contractLower);
      if (riskDetected) {
        risks.push({
          id: rule.id,
          severity: rule.severity,
          title: rule.title,
          description: rule.description,
          recommendation: rule.recommendation,
          category: rule.category
        });
      }
    });

    return {
      risks,
      complianceScore: this.calculateComplianceScore(risks, riskRules.scoring_algorithm),
      assessmentDate: new Date().toISOString()
    };
  }

  /**
   * Evaluate a single risk rule against contract text
   * @param {Object} rule 
   * @param {string} contractText 
   * @returns {boolean} Whether risk is detected
   */
  evaluateRiskRule(rule, contractText) {
    const detection = rule.detection;
    
    switch (detection.type) {
      case 'keyword_absence':
        return !detection.keywords.some(keyword => contractText.includes(keyword.toLowerCase()));
      
      case 'keyword_analysis':
        const foundKeywords = detection.keywords.filter(keyword => 
          contractText.includes(keyword.toLowerCase())
        ).length;
        return foundKeywords < detection.threshold;
      
      default:
        return false;
    }
  }

  /**
   * Calculate compliance score based on detected risks
   * @param {Array} risks 
   * @param {Object} scoringAlgorithm 
   * @returns {number} Compliance score (0-100)
   */
  calculateComplianceScore(risks, scoringAlgorithm) {
    if (!scoringAlgorithm) return 75; // Default score
    
    let score = scoringAlgorithm.base_score;
    
    risks.forEach(risk => {
      const deduction = scoringAlgorithm.deductions[risk.severity] || 10;
      score -= deduction;
    });

    return Math.max(scoringAlgorithm.minimum_score, Math.min(scoringAlgorithm.maximum_score, score));
  }

  /**
   * Get fallback playbook when loading fails
   * @param {string} agreementType 
   * @param {string} contentType 
   * @returns {Object} Fallback playbook
   */
  getFallbackPlaybook(agreementType, contentType) {
    return {
      metadata: {
        agreementType,
        contentType,
        fallback: true
      },
      template: this.getBasicTemplate(agreementType, contentType),
      clauses: this.getBasicClauses(),
      riskRules: null,
      formFields: null
    };
  }

  /**
   * Get basic template for fallback
   * @param {string} agreementType 
   * @param {string} contentType 
   * @returns {Object} Basic template
   */
  getBasicTemplate(agreementType, contentType) {
    return {
      template: {
        title: `${agreementType.toUpperCase()} AGREEMENT`,
        sections: [
          {
            id: 'basic',
            title: 'AGREEMENT',
            content: `This ${agreementType} agreement covers ${contentType} content management services.`
          }
        ]
      }
    };
  }

  /**
   * Get basic clauses for fallback
   * @returns {Object} Basic clauses
   */
  getBasicClauses() {
    return {
      clauses: [
        {
          id: 'basic_termination',
          category: 'termination',
          title: 'Basic Termination',
          content: 'Either party may terminate with 30 days notice.',
          keywords: ['termination', 'terminate']
        }
      ]
    };
  }

  /**
   * Get basic risk assessment for fallback
   * @param {string} contractText 
   * @returns {Object} Basic risk assessment
   */
  getBasicRiskAssessment(contractText) {
    const risks = [];
    const contractLower = contractText.toLowerCase();
    
    if (!contractLower.includes('termination')) {
      risks.push({
        severity: 'high',
        title: 'Missing Termination Clause',
        description: 'Contract lacks termination provisions'
      });
    }

    return {
      risks,
      complianceScore: risks.length === 0 ? 85 : 65,
      assessmentDate: new Date().toISOString()
    };
  }

  /**
   * Get alternative clauses for a specific clause from the Legal Matrix
   * @param {string} clauseNumber - The clause number (e.g., "1.1", "2.3")
   * @param {string} agreementType - The agreement type
   * @param {string} contentType - The content type
   * @returns {Promise<Array>} Array of alternative clauses
   */
  async getAlternativeClauses(clauseNumber, agreementType = 'content-management', contentType = 'general') {
    try {
      // First try to get alternatives from the loaded playbook
      const playbook = await this.loadPlaybook(agreementType, contentType);
      const playbookAlternatives = this.extractPlaybookAlternatives(clauseNumber, playbook);

      // Then try to get alternatives from Legal Matrix if available
      const legalMatrixAlternatives = await this.getLegalMatrixAlternatives(clauseNumber);

      // Combine and deduplicate alternatives
      const allAlternatives = [...playbookAlternatives, ...legalMatrixAlternatives];

      // If no alternatives found, provide fallback options
      if (allAlternatives.length === 0) {
        return this.getFallbackAlternatives(clauseNumber);
      }

      return allAlternatives;

    } catch (error) {
      console.error(`Error getting alternatives for clause ${clauseNumber}:`, error);
      return this.getFallbackAlternatives(clauseNumber);
    }
  }

  /**
   * Extract alternatives from loaded playbook
   * @param {string} clauseNumber
   * @param {Object} playbook
   * @returns {Array} Playbook alternatives
   */
  extractPlaybookAlternatives(clauseNumber, playbook) {
    const alternatives = [];

    if (!playbook.clauses || !playbook.clauses.clauses) {
      return alternatives;
    }

    // Find matching clause in playbook
    const matchingClause = playbook.clauses.clauses.find(clause =>
      clause.id.includes(clauseNumber) ||
      clause.title.toLowerCase().includes(clauseNumber.toLowerCase())
    );

    if (matchingClause) {
      // Add the main clause as baseline
      alternatives.push({
        id: 'playbook_baseline',
        title: `Playbook Baseline - ${matchingClause.title}`,
        content: matchingClause.content,
        riskLevel: matchingClause.risk_level || 'low',
        recommended: true,
        source: 'playbook'
      });

      // Add alternatives if available
      if (matchingClause.alternatives) {
        matchingClause.alternatives.forEach((alt, index) => {
          alternatives.push({
            id: `playbook_alt_${index}`,
            title: alt.title,
            content: alt.content,
            riskLevel: alt.risk_level || 'medium',
            recommended: false,
            source: 'playbook'
          });
        });
      }
    }

    return alternatives;
  }

  /**
   * Get alternatives from Legal Matrix service
   * @param {string} clauseNumber
   * @returns {Promise<Array>} Legal Matrix alternatives
   */
  async getLegalMatrixAlternatives(clauseNumber) {
    const alternatives = [];

    try {
      // Check if Legal Matrix service is available
      if (typeof window !== 'undefined' && window.legalMatrixService) {
        const matrixData = window.legalMatrixService.getClauseVariations(clauseNumber);

        if (matrixData) {
          // Add baseline clause
          if (matrixData.baseline) {
            alternatives.push({
              id: 'matrix_baseline',
              title: 'BASELINE (Ninja Tune Ltd.)',
              content: matrixData.baseline,
              riskLevel: 'low',
              recommended: true,
              source: 'legal_matrix'
            });
          }

          // Add party variations
          if (matrixData.partyVariations) {
            Object.entries(matrixData.partyVariations).forEach(([party, content]) => {
              if (content && content.trim()) {
                alternatives.push({
                  id: `matrix_${party.toLowerCase()}`,
                  title: `${party} Alternative`,
                  content: content,
                  riskLevel: this.assessRiskLevel(party),
                  recommended: false,
                  source: 'legal_matrix'
                });
              }
            });
          }
        }
      }
    } catch (error) {
      console.log('Legal Matrix not available, using playbook alternatives only');
    }

    return alternatives;
  }

  /**
   * Assess risk level based on party name
   * @param {string} party
   * @returns {string} Risk level
   */
  assessRiskLevel(party) {
    const lowRiskParties = ['ninja tune', 'yoola', 'baseline'];
    const highRiskParties = ['sony', 'lionsgate'];

    const partyLower = party.toLowerCase();

    if (lowRiskParties.some(p => partyLower.includes(p))) {
      return 'low';
    } else if (highRiskParties.some(p => partyLower.includes(p))) {
      return 'high';
    }

    return 'medium';
  }

  /**
   * Get fallback alternatives when no specific alternatives are found
   * @param {string} clauseNumber
   * @returns {Array} Fallback alternatives
   */
  getFallbackAlternatives(clauseNumber) {
    return [
      {
        id: 'fallback_standard',
        title: 'Standard Clause',
        content: `Standard clause text for ${clauseNumber}. This is a generic fallback clause that should be reviewed and customized for your specific needs.`,
        riskLevel: 'medium',
        recommended: true,
        source: 'fallback'
      },
      {
        id: 'fallback_conservative',
        title: 'Conservative Alternative',
        content: `Conservative alternative for ${clauseNumber}. This version includes additional protections and stricter terms to minimize risk.`,
        riskLevel: 'low',
        recommended: false,
        source: 'fallback'
      }
    ];
  }

  /**
   * Get list of available playbooks
   * @returns {Array} List of available playbook combinations
   */
  getAvailablePlaybooks() {
    return [
      { agreementType: 'content-management', contentType: 'music' },
      { agreementType: 'content-management', contentType: 'non-music' },
      { agreementType: 'content-management', contentType: 'both' },
      { agreementType: 'data-pro', contentType: 'general' },
      { agreementType: 'licensing', contentType: 'music' },
      { agreementType: 'licensing', contentType: 'non-music' },
      { agreementType: 'licensing', contentType: 'both' },
      { agreementType: 'distribution', contentType: 'music' },
      { agreementType: 'distribution', contentType: 'non-music' },
      { agreementType: 'distribution', contentType: 'both' },
      { agreementType: 'talent', contentType: 'music' },
      { agreementType: 'talent', contentType: 'non-music' },
      { agreementType: 'talent', contentType: 'both' }
    ];
  }
}

// Export singleton instance
export const playbookService = new PlaybookService();
