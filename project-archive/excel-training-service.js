// Excel Training Service - Convert Excel workbooks to contract templates and rules
export class ExcelTrainingService {
  constructor() {
    this.trainingData = new Map();
    this.contractPatterns = new Map();
    this.clauseLibrary = new Map();
  }

  /**
   * Load training data from Excel workbook structure
   * Excel Structure:
   * - Sheet 1: "Contract Templates" (contract types, sections, standard language)
   * - Sheet 2: "Clause Library" (clause variations, risk levels, alternatives)
   * - Sheet 3: "Risk Rules" (patterns, keywords, severity levels)
   * - Sheet 4: "Variable Mappings" (field mappings, transformations)
   */
  async loadExcelTrainingData(excelData) {
    console.log("Loading Excel training data...");
    
    // Process each sheet
    if (excelData.contractTemplates) {
      this.processContractTemplates(excelData.contractTemplates);
    }
    
    if (excelData.clauseLibrary) {
      this.processClauseLibrary(excelData.clauseLibrary);
    }
    
    if (excelData.riskRules) {
      this.processRiskRules(excelData.riskRules);
    }
    
    if (excelData.variableMappings) {
      this.processVariableMappings(excelData.variableMappings);
    }
    
    console.log("Excel training data loaded successfully");
  }

  /**
   * Process contract templates from Excel
   * Expected columns: ContractType, ContentType, Section, Order, Title, Content, Required, Variables
   */
  processContractTemplates(templateData) {
    const templates = new Map();
    
    templateData.forEach(row => {
      const key = `${row.ContractType}-${row.ContentType}`;
      
      if (!templates.has(key)) {
        templates.set(key, {
          metadata: {
            name: `${row.ContractType} - ${row.ContentType}`,
            type: row.ContractType,
            contentType: row.ContentType
          },
          sections: []
        });
      }
      
      const template = templates.get(key);
      template.sections.push({
        id: row.Section.toLowerCase().replace(/\s+/g, '_'),
        title: row.Title,
        order: parseInt(row.Order),
        required: row.Required === 'TRUE' || row.Required === true,
        content: row.Content,
        variables: row.Variables ? row.Variables.split(',').map(v => v.trim()) : []
      });
    });
    
    // Sort sections by order
    templates.forEach(template => {
      template.sections.sort((a, b) => a.order - b.order);
    });
    
    this.trainingData.set('templates', templates);
  }

  /**
   * Process clause library from Excel
   * Expected columns: ClauseID, Category, Title, Content, RiskLevel, Negotiable, Keywords, Alternatives
   */
  processClauseLibrary(clauseData) {
    const clauses = new Map();
    
    clauseData.forEach(row => {
      clauses.set(row.ClauseID, {
        id: row.ClauseID,
        category: row.Category,
        title: row.Title,
        content: row.Content,
        riskLevel: row.RiskLevel,
        negotiable: row.Negotiable === 'TRUE' || row.Negotiable === true,
        keywords: row.Keywords ? row.Keywords.split(',').map(k => k.trim()) : [],
        alternatives: row.Alternatives ? row.Alternatives.split('|') : []
      });
    });
    
    this.clauseLibrary = clauses;
  }

  /**
   * Process risk rules from Excel
   * Expected columns: RuleID, Category, Severity, Title, Description, Keywords, Pattern, Action, Recommendation
   */
  processRiskRules(riskData) {
    const rules = [];
    
    riskData.forEach(row => {
      rules.push({
        id: row.RuleID,
        category: row.Category,
        severity: row.Severity,
        title: row.Title,
        description: row.Description,
        detection: {
          keywords: row.Keywords ? row.Keywords.split(',').map(k => k.trim()) : [],
          pattern: row.Pattern,
          type: row.Pattern ? 'regex' : 'keyword'
        },
        action: row.Action,
        recommendation: row.Recommendation
      });
    });
    
    this.trainingData.set('riskRules', rules);
  }

  /**
   * Process variable mappings from Excel
   * Expected columns: FieldName, DisplayName, Type, Required, DefaultValue, Validation, Transformation
   */
  processVariableMappings(mappingData) {
    const mappings = new Map();
    
    mappingData.forEach(row => {
      mappings.set(row.FieldName, {
        fieldName: row.FieldName,
        displayName: row.DisplayName,
        type: row.Type,
        required: row.Required === 'TRUE' || row.Required === true,
        defaultValue: row.DefaultValue,
        validation: row.Validation,
        transformation: row.Transformation
      });
    });
    
    this.trainingData.set('variableMappings', mappings);
  }

  /**
   * Generate contract using Excel-trained templates
   */
  async generateContractFromExcel(contractType, contentType, formData) {
    const templates = this.trainingData.get('templates');
    const template = templates?.get(`${contractType}-${contentType}`);
    
    if (!template) {
      throw new Error(`No Excel-trained template found for ${contractType}-${contentType}`);
    }
    
    let contractText = `${template.metadata.name.toUpperCase()}\n\n`;
    
    // Process each section
    template.sections.forEach(section => {
      contractText += `${section.title}\n\n`;
      contractText += this.processTemplateContent(section.content, formData) + '\n\n';
    });
    
    return contractText;
  }

  /**
   * Analyze contract using Excel-trained rules
   */
  async analyzeContractWithExcel(contractText, contractType, contentType) {
    const riskRules = this.trainingData.get('riskRules') || [];
    const risks = [];
    const suggestions = [];
    
    // Apply each risk rule
    riskRules.forEach(rule => {
      const riskDetected = this.evaluateRiskRule(rule, contractText);
      if (riskDetected) {
        risks.push({
          id: rule.id,
          severity: rule.severity,
          title: rule.title,
          description: rule.description,
          recommendation: rule.recommendation
        });
        
        if (rule.action === 'suggest_clause') {
          suggestions.push(this.generateClauseSuggestion(rule, contractText));
        }
      }
    });
    
    return {
      risks,
      suggestions,
      complianceScore: this.calculateComplianceScore(risks),
      trainingSource: 'excel'
    };
  }

  /**
   * Evaluate risk rule against contract text
   */
  evaluateRiskRule(rule, contractText) {
    const lowerText = contractText.toLowerCase();
    
    if (rule.detection.type === 'keyword') {
      return rule.detection.keywords.some(keyword => 
        lowerText.includes(keyword.toLowerCase())
      );
    } else if (rule.detection.type === 'regex' && rule.detection.pattern) {
      try {
        const regex = new RegExp(rule.detection.pattern, 'i');
        return regex.test(contractText);
      } catch (error) {
        console.warn(`Invalid regex pattern in rule ${rule.id}:`, error);
        return false;
      }
    }
    
    return false;
  }

  /**
   * Generate clause suggestion based on rule
   */
  generateClauseSuggestion(rule, contractText) {
    const clause = this.clauseLibrary.get(rule.suggestedClause);
    
    return {
      type: 'clause_addition',
      title: rule.title,
      description: rule.recommendation,
      suggestedClause: clause ? clause.content : 'Standard clause content',
      priority: rule.severity === 'high' ? 'immediate' : 'recommended'
    };
  }

  /**
   * Calculate compliance score based on detected risks
   */
  calculateComplianceScore(risks) {
    if (risks.length === 0) return 100;
    
    const severityWeights = { high: 30, medium: 15, low: 5 };
    const totalDeduction = risks.reduce((sum, risk) => {
      return sum + (severityWeights[risk.severity] || 10);
    }, 0);
    
    return Math.max(0, 100 - totalDeduction);
  }

  /**
   * Process template content with variable substitution
   */
  processTemplateContent(content, formData) {
    let processedContent = content;
    
    // Replace variables with form data
    Object.entries(formData).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
    });
    
    return processedContent;
  }

  /**
   * Export current training data back to Excel format
   */
  exportToExcelFormat() {
    return {
      contractTemplates: this.exportTemplates(),
      clauseLibrary: this.exportClauses(),
      riskRules: this.exportRiskRules(),
      variableMappings: this.exportVariableMappings()
    };
  }

  exportTemplates() {
    const templates = this.trainingData.get('templates') || new Map();
    const rows = [];
    
    templates.forEach(template => {
      template.sections.forEach(section => {
        rows.push({
          ContractType: template.metadata.type,
          ContentType: template.metadata.contentType,
          Section: section.id,
          Order: section.order,
          Title: section.title,
          Content: section.content,
          Required: section.required,
          Variables: section.variables.join(', ')
        });
      });
    });
    
    return rows;
  }

  exportClauses() {
    const rows = [];
    this.clauseLibrary.forEach(clause => {
      rows.push({
        ClauseID: clause.id,
        Category: clause.category,
        Title: clause.title,
        Content: clause.content,
        RiskLevel: clause.riskLevel,
        Negotiable: clause.negotiable,
        Keywords: clause.keywords.join(', '),
        Alternatives: clause.alternatives.join(' | ')
      });
    });
    return rows;
  }

  exportRiskRules() {
    const rules = this.trainingData.get('riskRules') || [];
    return rules.map(rule => ({
      RuleID: rule.id,
      Category: rule.category,
      Severity: rule.severity,
      Title: rule.title,
      Description: rule.description,
      Keywords: rule.detection.keywords.join(', '),
      Pattern: rule.detection.pattern || '',
      Action: rule.action,
      Recommendation: rule.recommendation
    }));
  }

  exportVariableMappings() {
    const mappings = this.trainingData.get('variableMappings') || new Map();
    const rows = [];
    mappings.forEach(mapping => {
      rows.push({
        FieldName: mapping.fieldName,
        DisplayName: mapping.displayName,
        Type: mapping.type,
        Required: mapping.required,
        DefaultValue: mapping.defaultValue,
        Validation: mapping.validation,
        Transformation: mapping.transformation
      });
    });
    return rows;
  }
}

// Export singleton instance
export const excelTrainingService = new ExcelTrainingService();
