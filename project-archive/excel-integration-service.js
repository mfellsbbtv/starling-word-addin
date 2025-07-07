// Excel Integration Service - Handle Excel workbook import/export for training data
export class ExcelIntegrationService {
  constructor() {
    this.supportedFormats = ['xlsx', 'csv', 'json'];
    this.requiredSheets = ['ContractTemplates', 'ClauseLibrary', 'RiskRules', 'VariableMappings'];
  }

  /**
   * Parse Excel file or CSV data into training format
   * Supports both file upload and direct data input
   */
  async parseExcelData(fileData, format = 'xlsx') {
    console.log(`Parsing Excel data in ${format} format...`);
    
    try {
      let parsedData;
      
      if (format === 'json') {
        // Direct JSON input (for testing or API integration)
        parsedData = typeof fileData === 'string' ? JSON.parse(fileData) : fileData;
      } else if (format === 'csv') {
        // CSV format - assume single sheet
        parsedData = this.parseCSVData(fileData);
      } else {
        // Excel format - would need a library like SheetJS in real implementation
        parsedData = await this.parseExcelFile(fileData);
      }
      
      // Validate and structure the data
      return this.validateAndStructureData(parsedData);
      
    } catch (error) {
      console.error("Error parsing Excel data:", error);
      throw new Error(`Failed to parse Excel data: ${error.message}`);
    }
  }

  /**
   * Parse CSV data into structured format
   */
  parseCSVData(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error("CSV must have at least a header row and one data row");
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }
    
    return { ContractTemplates: data }; // Assume single sheet for CSV
  }

  /**
   * Parse Excel file (placeholder - would use SheetJS or similar in real implementation)
   */
  async parseExcelFile(fileData) {
    // In a real implementation, you would use a library like SheetJS:
    // const XLSX = require('xlsx');
    // const workbook = XLSX.read(fileData, { type: 'buffer' });
    
    // For now, return demo structure
    console.log("Excel file parsing - using demo data structure");
    return this.getDemoExcelStructure();
  }

  /**
   * Validate and structure parsed data
   */
  validateAndStructureData(rawData) {
    const structuredData = {
      contractTemplates: [],
      clauseLibrary: [],
      riskRules: [],
      variableMappings: []
    };

    // Process Contract Templates
    if (rawData.ContractTemplates || rawData.contractTemplates) {
      const templates = rawData.ContractTemplates || rawData.contractTemplates;
      structuredData.contractTemplates = this.validateContractTemplates(templates);
    }

    // Process Clause Library
    if (rawData.ClauseLibrary || rawData.clauseLibrary) {
      const clauses = rawData.ClauseLibrary || rawData.clauseLibrary;
      structuredData.clauseLibrary = this.validateClauseLibrary(clauses);
    }

    // Process Risk Rules
    if (rawData.RiskRules || rawData.riskRules) {
      const risks = rawData.RiskRules || rawData.riskRules;
      structuredData.riskRules = this.validateRiskRules(risks);
    }

    // Process Variable Mappings
    if (rawData.VariableMappings || rawData.variableMappings) {
      const mappings = rawData.VariableMappings || rawData.variableMappings;
      structuredData.variableMappings = this.validateVariableMappings(mappings);
    }

    return structuredData;
  }

  /**
   * Validate contract templates data
   */
  validateContractTemplates(templates) {
    const requiredFields = ['ContractType', 'ContentType', 'Section', 'Title', 'Content'];
    
    return templates.filter(template => {
      const isValid = requiredFields.every(field => template[field]);
      if (!isValid) {
        console.warn("Invalid template row:", template);
      }
      return isValid;
    }).map(template => ({
      ContractType: template.ContractType,
      ContentType: template.ContentType,
      Section: template.Section,
      Order: parseInt(template.Order) || 1,
      Title: template.Title,
      Content: template.Content,
      Required: template.Required === 'TRUE' || template.Required === true,
      Variables: template.Variables || ''
    }));
  }

  /**
   * Validate clause library data
   */
  validateClauseLibrary(clauses) {
    const requiredFields = ['ClauseID', 'Category', 'Title', 'Content'];
    
    return clauses.filter(clause => {
      const isValid = requiredFields.every(field => clause[field]);
      if (!isValid) {
        console.warn("Invalid clause row:", clause);
      }
      return isValid;
    }).map(clause => ({
      ClauseID: clause.ClauseID,
      Category: clause.Category,
      Title: clause.Title,
      Content: clause.Content,
      RiskLevel: clause.RiskLevel || 'medium',
      Negotiable: clause.Negotiable === 'TRUE' || clause.Negotiable === true,
      Keywords: clause.Keywords || '',
      Alternatives: clause.Alternatives || ''
    }));
  }

  /**
   * Validate risk rules data
   */
  validateRiskRules(rules) {
    const requiredFields = ['RuleID', 'Category', 'Severity', 'Title'];
    
    return rules.filter(rule => {
      const isValid = requiredFields.every(field => rule[field]);
      if (!isValid) {
        console.warn("Invalid risk rule row:", rule);
      }
      return isValid;
    }).map(rule => ({
      RuleID: rule.RuleID,
      Category: rule.Category,
      Severity: rule.Severity,
      Title: rule.Title,
      Description: rule.Description || '',
      Keywords: rule.Keywords || '',
      Pattern: rule.Pattern || '',
      Action: rule.Action || 'flag',
      Recommendation: rule.Recommendation || ''
    }));
  }

  /**
   * Validate variable mappings data
   */
  validateVariableMappings(mappings) {
    const requiredFields = ['FieldName', 'DisplayName', 'Type'];
    
    return mappings.filter(mapping => {
      const isValid = requiredFields.every(field => mapping[field]);
      if (!isValid) {
        console.warn("Invalid mapping row:", mapping);
      }
      return isValid;
    }).map(mapping => ({
      FieldName: mapping.FieldName,
      DisplayName: mapping.DisplayName,
      Type: mapping.Type,
      Required: mapping.Required === 'TRUE' || mapping.Required === true,
      DefaultValue: mapping.DefaultValue || '',
      Validation: mapping.Validation || '',
      Transformation: mapping.Transformation || ''
    }));
  }

  /**
   * Export training data to Excel format
   */
  exportToExcelFormat(trainingData) {
    return {
      ContractTemplates: this.formatContractTemplatesForExport(trainingData.contractTemplates || []),
      ClauseLibrary: this.formatClauseLibraryForExport(trainingData.clauseLibrary || []),
      RiskRules: this.formatRiskRulesForExport(trainingData.riskRules || []),
      VariableMappings: this.formatVariableMappingsForExport(trainingData.variableMappings || [])
    };
  }

  /**
   * Format contract templates for Excel export
   */
  formatContractTemplatesForExport(templates) {
    return templates.map(template => ({
      ContractType: template.ContractType,
      ContentType: template.ContentType,
      Section: template.Section,
      Order: template.Order,
      Title: template.Title,
      Content: template.Content,
      Required: template.Required ? 'TRUE' : 'FALSE',
      Variables: template.Variables
    }));
  }

  /**
   * Format clause library for Excel export
   */
  formatClauseLibraryForExport(clauses) {
    return clauses.map(clause => ({
      ClauseID: clause.ClauseID,
      Category: clause.Category,
      Title: clause.Title,
      Content: clause.Content,
      RiskLevel: clause.RiskLevel,
      Negotiable: clause.Negotiable ? 'TRUE' : 'FALSE',
      Keywords: clause.Keywords,
      Alternatives: clause.Alternatives
    }));
  }

  /**
   * Format risk rules for Excel export
   */
  formatRiskRulesForExport(rules) {
    return rules.map(rule => ({
      RuleID: rule.RuleID,
      Category: rule.Category,
      Severity: rule.Severity,
      Title: rule.Title,
      Description: rule.Description,
      Keywords: rule.Keywords,
      Pattern: rule.Pattern,
      Action: rule.Action,
      Recommendation: rule.Recommendation
    }));
  }

  /**
   * Format variable mappings for Excel export
   */
  formatVariableMappingsForExport(mappings) {
    return mappings.map(mapping => ({
      FieldName: mapping.FieldName,
      DisplayName: mapping.DisplayName,
      Type: mapping.Type,
      Required: mapping.Required ? 'TRUE' : 'FALSE',
      DefaultValue: mapping.DefaultValue,
      Validation: mapping.Validation,
      Transformation: mapping.Transformation
    }));
  }

  /**
   * Generate CSV from data
   */
  generateCSV(data, sheetName = 'data') {
    if (!data || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        // Escape commas and quotes
        return `"${value.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  /**
   * Get demo Excel structure for testing
   */
  getDemoExcelStructure() {
    return {
      ContractTemplates: [
        {
          ContractType: 'content-management',
          ContentType: 'music',
          Section: 'preamble',
          Order: 1,
          Title: 'PREAMBLE',
          Content: 'This Content Management Agreement is entered into between {{CompanyName}} and {{ProviderName}}.',
          Required: 'TRUE',
          Variables: 'CompanyName,ProviderName'
        },
        {
          ContractType: 'content-management',
          ContentType: 'music',
          Section: 'services',
          Order: 2,
          Title: 'SCOPE OF SERVICES',
          Content: 'Manager will provide comprehensive music management services including distribution, marketing, and rights management.',
          Required: 'TRUE',
          Variables: ''
        }
      ],
      ClauseLibrary: [
        {
          ClauseID: 'termination_standard',
          Category: 'termination',
          Title: 'Standard Termination',
          Content: 'Either party may terminate this agreement with 30 days written notice.',
          RiskLevel: 'low',
          Negotiable: 'TRUE',
          Keywords: 'termination,terminate,end,notice',
          Alternatives: 'termination_extended|termination_immediate'
        }
      ],
      RiskRules: [
        {
          RuleID: 'missing_termination',
          Category: 'missing_clauses',
          Severity: 'high',
          Title: 'Missing Termination Clause',
          Description: 'Contract lacks termination provisions',
          Keywords: 'termination,terminate,end',
          Pattern: '',
          Action: 'suggest_clause',
          Recommendation: 'Add standard termination clause with appropriate notice period'
        }
      ],
      VariableMappings: [
        {
          FieldName: 'company_name',
          DisplayName: 'Company Name',
          Type: 'text',
          Required: 'TRUE',
          DefaultValue: 'RHEI, Inc.',
          Validation: 'required',
          Transformation: 'uppercase'
        }
      ]
    };
  }
}

// Export singleton instance
export const excelIntegrationService = new ExcelIntegrationService();
