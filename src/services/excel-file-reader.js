// Excel File Reader Service - Read and parse Excel files for legal training data
export class ExcelFileReader {
  constructor() {
    this.supportedFormats = ['xlsx', 'xls', 'csv'];
    this.requiredSheets = ['ContractTemplates', 'ClauseLibrary', 'RiskRules', 'VariableMappings'];
  }

  /**
   * Read Excel file from various sources
   * @param {File|string|ArrayBuffer} fileInput - File object, file path, or buffer
   * @param {string} format - File format (xlsx, csv, json)
   * @returns {Promise<Object>} Parsed Excel data
   */
  async readExcelFile(fileInput, format = 'xlsx') {
    console.log(`Reading Excel file in ${format} format...`);
    
    try {
      let parsedData;
      
      if (format === 'csv') {
        parsedData = await this.readCSVFile(fileInput);
      } else if (format === 'json') {
        parsedData = await this.readJSONFile(fileInput);
      } else if (format === 'xlsx' || format === 'xls') {
        parsedData = await this.readExcelFileWithSheetJS(fileInput);
      } else {
        throw new Error(`Unsupported format: ${format}`);
      }
      
      return this.validateExcelStructure(parsedData);
      
    } catch (error) {
      console.error("Error reading Excel file:", error);
      throw new Error(`Failed to read Excel file: ${error.message}`);
    }
  }

  /**
   * Read CSV file (single sheet)
   */
  async readCSVFile(fileInput) {
    let csvText;
    
    if (typeof fileInput === 'string') {
      // File path or CSV text
      if (fileInput.includes(',') || fileInput.includes('\n')) {
        csvText = fileInput;
      } else {
        // Assume it's a file path
        const response = await fetch(fileInput);
        csvText = await response.text();
      }
    } else if (fileInput instanceof File) {
      csvText = await fileInput.text();
    } else {
      throw new Error('Invalid CSV input format');
    }
    
    return this.parseCSVText(csvText);
  }

  /**
   * Read JSON file
   */
  async readJSONFile(fileInput) {
    let jsonData;
    
    if (typeof fileInput === 'string') {
      try {
        jsonData = JSON.parse(fileInput);
      } catch {
        // Assume it's a file path
        const response = await fetch(fileInput);
        jsonData = await response.json();
      }
    } else if (fileInput instanceof File) {
      const text = await fileInput.text();
      jsonData = JSON.parse(text);
    } else {
      jsonData = fileInput;
    }
    
    return jsonData;
  }

  /**
   * Read Excel file using SheetJS (would need to be installed)
   * For now, this is a placeholder that shows how it would work
   */
  async readExcelFileWithSheetJS(fileInput) {
    // In a real implementation, you would install SheetJS:
    // npm install xlsx
    // import * as XLSX from 'xlsx';
    
    console.log("Excel file reading requires SheetJS library");
    console.log("For now, returning demo structure. To implement:");
    console.log("1. npm install xlsx");
    console.log("2. Import XLSX library");
    console.log("3. Use XLSX.read() to parse the file");
    
    // Return demo structure for testing
    return this.getDemoExcelData();
  }

  /**
   * Parse CSV text into structured data
   */
  parseCSVText(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error("CSV must have at least a header row and one data row");
    }
    
    const headers = this.parseCSVLine(lines[0]);
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const row = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }
    
    // Assume single sheet for CSV
    return { ContractTemplates: data };
  }

  /**
   * Parse a single CSV line, handling quoted values
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    
    return result;
  }

  /**
   * Validate Excel structure against expected format
   */
  validateExcelStructure(data) {
    const validatedData = {
      contractTemplates: [],
      clauseLibrary: [],
      riskRules: [],
      variableMappings: [],
      metadata: {
        validatedAt: new Date().toISOString(),
        sheetsFound: Object.keys(data),
        validationErrors: []
      }
    };

    // Validate Contract Templates
    if (data.ContractTemplates || data.contractTemplates) {
      const templates = data.ContractTemplates || data.contractTemplates;
      const result = this.validateContractTemplates(templates);
      validatedData.contractTemplates = result.valid;
      validatedData.metadata.validationErrors.push(...result.errors);
    }

    // Validate Clause Library
    if (data.ClauseLibrary || data.clauseLibrary) {
      const clauses = data.ClauseLibrary || data.clauseLibrary;
      const result = this.validateClauseLibrary(clauses);
      validatedData.clauseLibrary = result.valid;
      validatedData.metadata.validationErrors.push(...result.errors);
    }

    // Validate Risk Rules
    if (data.RiskRules || data.riskRules) {
      const risks = data.RiskRules || data.riskRules;
      const result = this.validateRiskRules(risks);
      validatedData.riskRules = result.valid;
      validatedData.metadata.validationErrors.push(...result.errors);
    }

    // Validate Variable Mappings
    if (data.VariableMappings || data.variableMappings) {
      const mappings = data.VariableMappings || data.variableMappings;
      const result = this.validateVariableMappings(mappings);
      validatedData.variableMappings = result.valid;
      validatedData.metadata.validationErrors.push(...result.errors);
    }

    return validatedData;
  }

  /**
   * Validate contract templates data
   */
  validateContractTemplates(templates) {
    const requiredFields = ['ContractType', 'ContentType', 'Section', 'Title', 'Content'];
    const valid = [];
    const errors = [];
    
    templates.forEach((template, index) => {
      const missingFields = requiredFields.filter(field => !template[field]);
      
      if (missingFields.length === 0) {
        valid.push({
          ContractType: template.ContractType,
          ContentType: template.ContentType,
          Section: template.Section,
          Order: parseInt(template.Order) || 1,
          Title: template.Title,
          Content: template.Content,
          Required: template.Required === 'TRUE' || template.Required === true,
          Variables: template.Variables || ''
        });
      } else {
        errors.push(`Contract Template row ${index + 1}: Missing fields: ${missingFields.join(', ')}`);
      }
    });
    
    return { valid, errors };
  }

  /**
   * Validate clause library data
   */
  validateClauseLibrary(clauses) {
    const requiredFields = ['ClauseID', 'Category', 'Title', 'Content'];
    const valid = [];
    const errors = [];
    
    clauses.forEach((clause, index) => {
      const missingFields = requiredFields.filter(field => !clause[field]);
      
      if (missingFields.length === 0) {
        valid.push({
          ClauseID: clause.ClauseID,
          Category: clause.Category,
          Title: clause.Title,
          Content: clause.Content,
          RiskLevel: clause.RiskLevel || 'medium',
          Negotiable: clause.Negotiable === 'TRUE' || clause.Negotiable === true,
          Keywords: clause.Keywords || '',
          Alternatives: clause.Alternatives || ''
        });
      } else {
        errors.push(`Clause Library row ${index + 1}: Missing fields: ${missingFields.join(', ')}`);
      }
    });
    
    return { valid, errors };
  }

  /**
   * Validate risk rules data
   */
  validateRiskRules(rules) {
    const requiredFields = ['RuleID', 'Category', 'Severity', 'Title'];
    const valid = [];
    const errors = [];
    
    rules.forEach((rule, index) => {
      const missingFields = requiredFields.filter(field => !rule[field]);
      
      if (missingFields.length === 0) {
        valid.push({
          RuleID: rule.RuleID,
          Category: rule.Category,
          Severity: rule.Severity,
          Title: rule.Title,
          Description: rule.Description || '',
          Keywords: rule.Keywords || '',
          Pattern: rule.Pattern || '',
          Action: rule.Action || 'flag',
          Recommendation: rule.Recommendation || ''
        });
      } else {
        errors.push(`Risk Rules row ${index + 1}: Missing fields: ${missingFields.join(', ')}`);
      }
    });
    
    return { valid, errors };
  }

  /**
   * Validate variable mappings data
   */
  validateVariableMappings(mappings) {
    const requiredFields = ['FieldName', 'DisplayName', 'Type'];
    const valid = [];
    const errors = [];
    
    mappings.forEach((mapping, index) => {
      const missingFields = requiredFields.filter(field => !mapping[field]);
      
      if (missingFields.length === 0) {
        valid.push({
          FieldName: mapping.FieldName,
          DisplayName: mapping.DisplayName,
          Type: mapping.Type,
          Required: mapping.Required === 'TRUE' || mapping.Required === true,
          DefaultValue: mapping.DefaultValue || '',
          Validation: mapping.Validation || '',
          Transformation: mapping.Transformation || ''
        });
      } else {
        errors.push(`Variable Mappings row ${index + 1}: Missing fields: ${missingFields.join(', ')}`);
      }
    });
    
    return { valid, errors };
  }

  /**
   * Get demo Excel data for testing
   */
  getDemoExcelData() {
    return {
      ContractTemplates: [
        {
          ContractType: 'content-management',
          ContentType: 'music',
          Section: 'preamble',
          Order: '1',
          Title: 'PREAMBLE',
          Content: 'This Music Content Management Agreement is entered into between {{CompanyName}} and {{ProviderName}}.',
          Required: 'TRUE',
          Variables: 'CompanyName,ProviderName'
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

  /**
   * Generate validation report
   */
  generateValidationReport(validatedData) {
    const report = {
      summary: {
        totalSheets: validatedData.metadata.sheetsFound.length,
        validRows: {
          contractTemplates: validatedData.contractTemplates.length,
          clauseLibrary: validatedData.clauseLibrary.length,
          riskRules: validatedData.riskRules.length,
          variableMappings: validatedData.variableMappings.length
        },
        totalErrors: validatedData.metadata.validationErrors.length
      },
      errors: validatedData.metadata.validationErrors,
      recommendations: []
    };

    // Add recommendations based on data
    if (validatedData.contractTemplates.length === 0) {
      report.recommendations.push("Add contract templates to enable contract generation");
    }
    
    if (validatedData.clauseLibrary.length === 0) {
      report.recommendations.push("Add clause library for contract analysis");
    }
    
    if (validatedData.riskRules.length === 0) {
      report.recommendations.push("Add risk rules for automated risk detection");
    }

    return report;
  }
}

// Export singleton instance
export const excelFileReader = new ExcelFileReader();
