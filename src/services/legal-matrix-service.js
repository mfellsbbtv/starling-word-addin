// Legal Matrix Service - Handle clause evolution matrix for contract generation and analysis
export class LegalMatrixService {
  constructor() {
    this.clauseMatrix = new Map();
    this.baselineClauses = new Map();
    this.partyVariations = new Map();
    this.acceptableModifications = new Map();
  }

  /**
   * Load Legal Matrix CSV data
   * Expected columns: Article, Clause Number, Clause Title, Clause Summary BASELINE (Ninja Tune Ltd.), 
   * [Party Columns E-K], Notes/Comments
   */
  async loadLegalMatrix(csvData) {
    console.log("Loading Legal Matrix data...");
    
    try {
      const parsedData = this.parseLegalMatrixCSV(csvData);
      this.processClauseMatrix(parsedData);
      
      console.log(`Loaded ${this.clauseMatrix.size} clauses with variations`);
      console.log(`Baseline clauses: ${this.baselineClauses.size}`);
      console.log(`Party variations: ${this.partyVariations.size}`);
      
      return {
        success: true,
        clausesLoaded: this.clauseMatrix.size,
        partiesFound: this.getPartyNames(),
        articlesFound: this.getArticleNumbers()
      };
      
    } catch (error) {
      console.error("Error loading Legal Matrix:", error);
      throw new Error(`Failed to load Legal Matrix: ${error.message}`);
    }
  }

  /**
   * Parse Legal Matrix data (supports CSV, TSV, or auto-detect)
   */
  parseLegalMatrixCSV(csvData, format = 'auto') {
    // Auto-detect format based on content
    if (format === 'auto') {
      format = this.detectFormat(csvData);
      console.log(`Auto-detected format: ${format}`);
    }

    let lines, headers, data = [];

    if (format === 'tsv') {
      // Parse TSV (Tab-Separated Values) - RECOMMENDED for legal documents
      lines = csvData.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        throw new Error("TSV must have at least a header row and one data row");
      }

      headers = lines[0].split('\t').map(h => h.trim());

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t');
        const row = {};

        headers.forEach((header, index) => {
          row[header] = values[index] ? values[index].trim() : '';
        });

        if (this.isValidDataRow(row)) {
          data.push(this.processDataRow(row));
        }
      }
    } else {
      // Parse CSV with enhanced quote handling
      const parsedCSV = this.parseComplexCSV(csvData);
      headers = parsedCSV.headers;
      data = parsedCSV.data.filter(row => this.isValidDataRow(row))
                           .map(row => this.processDataRow(row));
    }

    // Identify column structure
    const columnMap = this.identifyColumns(headers);

    return {
      data,
      columnMap,
      format,
      totalRows: data.length,
      headers
    };
  }

  /**
   * Auto-detect file format based on content analysis
   */
  detectFormat(content) {
    const firstLine = content.split('\n')[0];

    // Count separators in first line
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const pipeCount = (firstLine.match(/\|/g) || []).length;

    // If we have tabs and they're more frequent than commas, it's likely TSV
    if (tabCount > 5 && tabCount > commaCount) {
      return 'tsv';
    }

    // If we have many pipes, it might be PSV
    if (pipeCount > 5 && pipeCount > commaCount) {
      return 'psv';
    }

    // Default to CSV
    return 'csv';
  }

  /**
   * Parse complex CSV with proper quote handling for legal documents
   */
  parseComplexCSV(csvText) {
    const lines = csvText.split('\n');
    const result = { headers: [], data: [] };

    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    let rowIndex = 0;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            // Escaped quote
            currentField += '"';
            i++; // Skip next quote
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          // End of field
          currentRow.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }

      // If we're not in quotes, this line is complete
      if (!inQuotes) {
        // Add the last field
        currentRow.push(currentField.trim());

        if (rowIndex === 0) {
          result.headers = currentRow;
        } else if (currentRow.length > 1 && currentRow.some(cell => cell.trim())) {
          // Convert array to object
          const rowObj = {};
          result.headers.forEach((header, index) => {
            rowObj[header] = currentRow[index] || '';
          });
          result.data.push(rowObj);
        }

        // Reset for next row
        currentRow = [];
        currentField = '';
        rowIndex++;
      } else {
        // Multi-line field, add newline and continue
        currentField += '\n';
      }
    }

    return result;
  }

  /**
   * Check if a row contains valid Legal Matrix data
   */
  isValidDataRow(row) {
    const articleCol = this.findColumn(row, ['article', 'Article']);
    const clauseCol = this.findColumn(row, ['clause number', 'Clause Number']);
    const baselineCol = this.findColumn(row, ['baseline', 'BASELINE', 'Ninja Tune']);

    return articleCol && clauseCol && baselineCol &&
           row[articleCol] && row[clauseCol] && row[baselineCol];
  }

  /**
   * Process a data row into standardized format
   */
  processDataRow(row) {
    const articleCol = this.findColumn(row, ['article', 'Article']);
    const clauseCol = this.findColumn(row, ['clause number', 'Clause Number']);
    const titleCol = this.findColumn(row, ['clause title', 'Clause Title']);
    const baselineCol = this.findColumn(row, ['baseline', 'BASELINE', 'Ninja Tune']);

    // Extract party variations (columns that aren't the main structure columns)
    const partyColumns = Object.keys(row).filter(key =>
      !key.toLowerCase().includes('article') &&
      !key.toLowerCase().includes('clause number') &&
      !key.toLowerCase().includes('clause title') &&
      !key.toLowerCase().includes('baseline') &&
      !key.toLowerCase().includes('ninja tune') &&
      row[key] && row[key].trim()
    );

    return {
      article: row[articleCol],
      clauseNumber: row[clauseCol],
      clauseTitle: row[titleCol] || '',
      baseline: row[baselineCol],
      partyVariations: this.extractPartyVariations(row, partyColumns.map(col => ({ header: col, index: 0 }))),
      rawRow: row
    };
  }

  /**
   * Find column by multiple possible names
   */
  findColumn(row, possibleNames) {
    for (const name of possibleNames) {
      const found = Object.keys(row).find(key =>
        key.toLowerCase().includes(name.toLowerCase())
      );
      if (found) return found;
    }
    return null;
  }

  /**
   * Identify column structure from headers
   */
  identifyColumns(headers) {
    const columnMap = {
      article: null,
      clauseNumber: null,
      clauseTitle: null,
      baseline: null,
      partyColumns: []
    };
    
    headers.forEach((header, index) => {
      const lowerHeader = header.toLowerCase();
      
      if (lowerHeader.includes('article')) {
        columnMap.article = header;
      } else if (lowerHeader.includes('clause number')) {
        columnMap.clauseNumber = header;
      } else if (lowerHeader.includes('clause title')) {
        columnMap.clauseTitle = header;
      } else if (lowerHeader.includes('baseline') || lowerHeader.includes('ninja tune')) {
        columnMap.baseline = header;
      } else if (index >= 4 && !lowerHeader.includes('note') && !lowerHeader.includes('comment')) {
        // Assume columns E onwards (index 4+) are party variations
        columnMap.partyColumns.push({ header, index });
      }
    });
    
    return columnMap;
  }

  /**
   * Extract party variations from row
   */
  extractPartyVariations(row, partyColumns) {
    const variations = {};
    
    partyColumns.forEach(({ header, index }) => {
      const value = row[header];
      if (value && value.trim()) {
        // Determine if this is a modification or unchanged
        const isUnchanged = value === '✓' || value.toLowerCase().includes('matched') || value.toLowerCase().includes('same');
        
        variations[header] = {
          value: value,
          isUnchanged: isUnchanged,
          isModification: !isUnchanged && value !== '✓',
          modification: isUnchanged ? null : value
        };
      }
    });
    
    return variations;
  }

  /**
   * Process clause matrix data
   */
  processClauseMatrix(parsedData) {
    const { data, columnMap } = parsedData;
    
    data.forEach(clause => {
      const clauseKey = `${clause.article}.${clause.clauseNumber}`;
      
      // Store baseline clause
      this.baselineClauses.set(clauseKey, {
        article: clause.article,
        clauseNumber: clause.clauseNumber,
        title: clause.clauseTitle,
        baseline: clause.baseline,
        key: clauseKey
      });
      
      // Store full clause matrix entry
      this.clauseMatrix.set(clauseKey, {
        ...clause,
        key: clauseKey,
        partyNames: Object.keys(clause.partyVariations)
      });
      
      // Process party variations
      Object.entries(clause.partyVariations).forEach(([partyName, variation]) => {
        if (!this.partyVariations.has(partyName)) {
          this.partyVariations.set(partyName, new Map());
        }
        
        this.partyVariations.get(partyName).set(clauseKey, variation);
        
        // Track acceptable modifications
        if (variation.isModification) {
          if (!this.acceptableModifications.has(clauseKey)) {
            this.acceptableModifications.set(clauseKey, []);
          }
          this.acceptableModifications.get(clauseKey).push({
            party: partyName,
            modification: variation.modification,
            originalValue: variation.value
          });
        }
      });
    });
  }

  /**
   * Generate contract from baseline clauses
   */
  generateBaselineContract(contractType = 'content-management', options = {}) {
    console.log("Generating contract from baseline clauses...");
    
    const clauses = Array.from(this.baselineClauses.values())
      .sort((a, b) => this.compareClauseOrder(a.key, b.key));
    
    let contractText = this.generateContractHeader(contractType, options);
    
    // Group clauses by article
    const articleGroups = this.groupClausesByArticle(clauses);
    
    Object.entries(articleGroups).forEach(([articleNum, articleClauses]) => {
      contractText += `\n\nARTICLE ${articleNum}\n`;
      
      articleClauses.forEach(clause => {
        contractText += `\n${clause.clauseNumber} ${clause.title}\n`;
        contractText += `${clause.baseline}\n`;
      });
    });
    
    contractText += this.generateContractFooter(options);
    
    return {
      contractText,
      clausesUsed: clauses.length,
      articlesGenerated: Object.keys(articleGroups).length,
      generationMethod: 'baseline_matrix'
    };
  }

  /**
   * Analyze contract against Legal Matrix
   */
  analyzeContractAgainstMatrix(contractText, targetParty = null) {
    console.log("Analyzing contract against Legal Matrix...");
    
    const analysis = {
      clauseAnalysis: [],
      missingClauses: [],
      acceptableModifications: [],
      unacceptableModifications: [],
      recommendations: [],
      complianceScore: 0
    };
    
    // Extract clauses from contract text
    const extractedClauses = this.extractClausesFromContract(contractText);
    
    // Analyze each baseline clause
    this.baselineClauses.forEach((baselineClause, clauseKey) => {
      const foundClause = this.findMatchingClause(extractedClauses, baselineClause);
      
      if (!foundClause) {
        analysis.missingClauses.push({
          clauseKey,
          title: baselineClause.title,
          baseline: baselineClause.baseline,
          severity: 'high'
        });
      } else {
        const clauseAnalysis = this.analyzeClauseVariation(
          foundClause, 
          baselineClause, 
          clauseKey, 
          targetParty
        );
        analysis.clauseAnalysis.push(clauseAnalysis);
        
        if (clauseAnalysis.isAcceptable) {
          analysis.acceptableModifications.push(clauseAnalysis);
        } else if (clauseAnalysis.hasModification) {
          analysis.unacceptableModifications.push(clauseAnalysis);
        }
      }
    });
    
    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);
    
    // Calculate compliance score
    analysis.complianceScore = this.calculateComplianceScore(analysis);
    
    return analysis;
  }

  /**
   * Analyze individual clause variation
   */
  analyzeClauseVariation(foundClause, baselineClause, clauseKey, targetParty) {
    const matrixEntry = this.clauseMatrix.get(clauseKey);
    const acceptableModifications = this.acceptableModifications.get(clauseKey) || [];
    
    // Check if clause matches baseline exactly
    const isExactMatch = this.calculateSimilarity(foundClause.content, baselineClause.baseline) > 0.95;
    
    if (isExactMatch) {
      return {
        clauseKey,
        title: baselineClause.title,
        status: 'exact_match',
        isAcceptable: true,
        hasModification: false,
        similarity: 1.0
      };
    }
    
    // Check against acceptable modifications
    let bestMatch = null;
    let highestSimilarity = 0;
    
    acceptableModifications.forEach(modification => {
      const similarity = this.calculateSimilarity(foundClause.content, modification.modification);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = modification;
      }
    });
    
    const isAcceptable = highestSimilarity > 0.8; // 80% similarity threshold
    
    return {
      clauseKey,
      title: baselineClause.title,
      foundContent: foundClause.content,
      baselineContent: baselineClause.baseline,
      status: isAcceptable ? 'acceptable_modification' : 'unacceptable_modification',
      isAcceptable,
      hasModification: true,
      similarity: highestSimilarity,
      bestMatch: bestMatch,
      suggestedRevision: isAcceptable ? null : this.suggestRevision(foundClause, baselineClause, acceptableModifications)
    };
  }

  /**
   * Calculate text similarity (simple word overlap)
   */
  calculateSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Generate contract recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = [];
    
    // Missing clauses
    analysis.missingClauses.forEach(missing => {
      recommendations.push({
        type: 'missing_clause',
        priority: 'high',
        title: `Add ${missing.title}`,
        description: `Contract is missing clause ${missing.clauseKey}: ${missing.title}`,
        suggestedAction: 'Add baseline clause',
        suggestedContent: missing.baseline
      });
    });
    
    // Unacceptable modifications
    analysis.unacceptableModifications.forEach(unacceptable => {
      recommendations.push({
        type: 'unacceptable_modification',
        priority: 'medium',
        title: `Revise ${unacceptable.title}`,
        description: `Clause ${unacceptable.clauseKey} deviates from acceptable variations`,
        suggestedAction: 'Revise to match acceptable modification',
        suggestedContent: unacceptable.suggestedRevision
      });
    });
    
    return recommendations;
  }

  /**
   * Calculate compliance score
   */
  calculateComplianceScore(analysis) {
    const totalClauses = this.baselineClauses.size;
    const acceptableClauses = analysis.acceptableModifications.length + 
                             analysis.clauseAnalysis.filter(c => c.status === 'exact_match').length;
    
    return Math.round((acceptableClauses / totalClauses) * 100);
  }

  /**
   * Utility methods
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  compareClauseOrder(key1, key2) {
    const [article1, clause1] = key1.split('.').map(parseFloat);
    const [article2, clause2] = key2.split('.').map(parseFloat);
    
    if (article1 !== article2) return article1 - article2;
    return clause1 - clause2;
  }

  groupClausesByArticle(clauses) {
    const groups = {};
    clauses.forEach(clause => {
      if (!groups[clause.article]) {
        groups[clause.article] = [];
      }
      groups[clause.article].push(clause);
    });
    return groups;
  }

  generateContractHeader(contractType, options) {
    return `CONTENT MANAGEMENT AGREEMENT

This Content Management Agreement ("Agreement") is entered into on ${options.effectiveDate || '{{EffectiveDate}}'} between ${options.companyName || '{{CompanyName}}'} ("Company") and ${options.providerName || '{{ProviderName}}'} ("Provider").

RECITALS

WHEREAS, Company desires to provide content management services to Provider;
WHEREAS, Provider owns or controls certain content and channels;
WHEREAS, the parties wish to establish the terms of their business relationship;

NOW, THEREFORE, the parties agree as follows:`;
  }

  generateContractFooter(options) {
    return `

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

COMPANY:                           PROVIDER:

_________________________         _________________________
${options.companyName || '{{CompanyName}}'}                    ${options.providerName || '{{ProviderName}}'}

Date: _______________             Date: _______________`;
  }

  getPartyNames() {
    return Array.from(this.partyVariations.keys());
  }

  getArticleNumbers() {
    return [...new Set(Array.from(this.baselineClauses.values()).map(c => c.article))].sort();
  }

  // Additional utility methods would go here...
  extractClausesFromContract(contractText) {
    // Implementation for extracting clauses from contract text
    // This would parse the contract and identify individual clauses
    return [];
  }

  findMatchingClause(extractedClauses, baselineClause) {
    // Implementation for finding matching clauses
    // This would use similarity matching to find corresponding clauses
    return null;
  }

  suggestRevision(foundClause, baselineClause, acceptableModifications) {
    // Implementation for suggesting revisions
    // This would recommend the best acceptable modification
    return baselineClause.baseline;
  }
}

// Export singleton instance
export const legalMatrixService = new LegalMatrixService();
