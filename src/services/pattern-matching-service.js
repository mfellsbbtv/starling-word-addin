// Pattern Matching Service - Simple alternative to RAG using Excel-trained patterns
export class PatternMatchingService {
  constructor() {
    this.patterns = new Map();
    this.clausePatterns = new Map();
    this.riskPatterns = new Map();
    this.contextRules = new Map();
  }

  /**
   * Initialize with Excel-derived patterns
   */
  async initialize(excelTrainingData) {
    console.log("Initializing pattern matching with Excel data...");
    
    this.buildClausePatterns(excelTrainingData.clauseLibrary || []);
    this.buildRiskPatterns(excelTrainingData.riskRules || []);
    this.buildContextRules(excelTrainingData.contractTemplates || []);
    
    console.log(`Loaded ${this.clausePatterns.size} clause patterns, ${this.riskPatterns.size} risk patterns`);
  }

  /**
   * Build clause matching patterns from Excel data
   */
  buildClausePatterns(clauseData) {
    clauseData.forEach(clause => {
      const patterns = [];
      
      // Create patterns from keywords
      if (clause.Keywords) {
        clause.Keywords.split(',').forEach(keyword => {
          patterns.push({
            type: 'keyword',
            pattern: keyword.trim().toLowerCase(),
            weight: 1.0
          });
        });
      }
      
      // Create patterns from clause content
      if (clause.Content) {
        const contentWords = this.extractSignificantWords(clause.Content);
        contentWords.forEach(word => {
          patterns.push({
            type: 'content',
            pattern: word,
            weight: 0.5
          });
        });
      }
      
      this.clausePatterns.set(clause.ClauseID, {
        clause: clause,
        patterns: patterns,
        category: clause.Category,
        riskLevel: clause.RiskLevel
      });
    });
  }

  /**
   * Build risk detection patterns from Excel data
   */
  buildRiskPatterns(riskData) {
    riskData.forEach(rule => {
      const patterns = [];
      
      // Keyword patterns
      if (rule.Keywords) {
        rule.Keywords.split(',').forEach(keyword => {
          patterns.push({
            type: 'keyword',
            pattern: keyword.trim().toLowerCase(),
            weight: 1.0
          });
        });
      }
      
      // Regex patterns
      if (rule.Pattern) {
        patterns.push({
          type: 'regex',
          pattern: rule.Pattern,
          weight: 1.5
        });
      }
      
      this.riskPatterns.set(rule.RuleID, {
        rule: rule,
        patterns: patterns,
        severity: rule.Severity,
        category: rule.Category
      });
    });
  }

  /**
   * Build context rules for contract type detection
   */
  buildContextRules(templateData) {
    const contextMap = new Map();
    
    templateData.forEach(template => {
      const key = `${template.ContractType}-${template.ContentType}`;
      
      if (!contextMap.has(key)) {
        contextMap.set(key, {
          contractType: template.ContractType,
          contentType: template.ContentType,
          indicators: new Set()
        });
      }
      
      const context = contextMap.get(key);
      
      // Add indicators from section titles and content
      if (template.Title) {
        this.extractSignificantWords(template.Title).forEach(word => {
          context.indicators.add(word.toLowerCase());
        });
      }
      
      if (template.Content) {
        this.extractSignificantWords(template.Content).slice(0, 10).forEach(word => {
          context.indicators.add(word.toLowerCase());
        });
      }
    });
    
    this.contextRules = contextMap;
  }

  /**
   * Find best matching clauses for given text
   */
  findMatchingClauses(text, limit = 5) {
    const matches = [];
    const lowerText = text.toLowerCase();
    
    this.clausePatterns.forEach((clauseData, clauseId) => {
      let score = 0;
      let matchedPatterns = [];
      
      clauseData.patterns.forEach(pattern => {
        if (pattern.type === 'keyword' && lowerText.includes(pattern.pattern)) {
          score += pattern.weight;
          matchedPatterns.push(pattern.pattern);
        } else if (pattern.type === 'content' && lowerText.includes(pattern.pattern)) {
          score += pattern.weight;
          matchedPatterns.push(pattern.pattern);
        } else if (pattern.type === 'regex') {
          try {
            const regex = new RegExp(pattern.pattern, 'i');
            if (regex.test(text)) {
              score += pattern.weight;
              matchedPatterns.push('regex_match');
            }
          } catch (error) {
            console.warn(`Invalid regex in clause ${clauseId}:`, error);
          }
        }
      });
      
      if (score > 0) {
        matches.push({
          clauseId,
          clause: clauseData.clause,
          score,
          matchedPatterns,
          category: clauseData.category,
          riskLevel: clauseData.riskLevel
        });
      }
    });
    
    // Sort by score and return top matches
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Detect risks in contract text
   */
  detectRisks(text) {
    const risks = [];
    const lowerText = text.toLowerCase();
    
    this.riskPatterns.forEach((riskData, ruleId) => {
      let detected = false;
      let matchedPatterns = [];
      
      riskData.patterns.forEach(pattern => {
        if (pattern.type === 'keyword' && lowerText.includes(pattern.pattern)) {
          detected = true;
          matchedPatterns.push(pattern.pattern);
        } else if (pattern.type === 'regex') {
          try {
            const regex = new RegExp(pattern.pattern, 'i');
            if (regex.test(text)) {
              detected = true;
              matchedPatterns.push('regex_match');
            }
          } catch (error) {
            console.warn(`Invalid regex in risk rule ${ruleId}:`, error);
          }
        }
      });
      
      if (detected) {
        risks.push({
          ruleId,
          rule: riskData.rule,
          severity: riskData.severity,
          category: riskData.category,
          matchedPatterns
        });
      }
    });
    
    return risks;
  }

  /**
   * Determine contract type and content type from text
   */
  determineContractContext(text) {
    const lowerText = text.toLowerCase();
    const scores = new Map();
    
    this.contextRules.forEach((context, key) => {
      let score = 0;
      
      context.indicators.forEach(indicator => {
        if (lowerText.includes(indicator)) {
          score += 1;
        }
      });
      
      if (score > 0) {
        scores.set(key, {
          contractType: context.contractType,
          contentType: context.contentType,
          score
        });
      }
    });
    
    // Return best match or default
    if (scores.size > 0) {
      const bestMatch = Array.from(scores.values())
        .sort((a, b) => b.score - a.score)[0];
      return {
        contractType: bestMatch.contractType,
        contentType: bestMatch.contentType,
        confidence: bestMatch.score
      };
    }
    
    return {
      contractType: 'content-management',
      contentType: 'music',
      confidence: 0
    };
  }

  /**
   * Generate contract suggestions based on patterns
   */
  generateSuggestions(text, contractType, contentType) {
    const suggestions = [];
    
    // Find missing standard clauses
    const matchingClauses = this.findMatchingClauses(text);
    const presentCategories = new Set(matchingClauses.map(m => m.category));
    
    // Check for missing essential categories
    const essentialCategories = ['termination', 'payment', 'liability', 'confidentiality'];
    essentialCategories.forEach(category => {
      if (!presentCategories.has(category)) {
        const categoryClause = this.findClauseByCategory(category);
        if (categoryClause) {
          suggestions.push({
            type: 'missing_clause',
            category,
            title: `Add ${category} clause`,
            description: `Contract is missing a ${category} clause`,
            suggestedClause: categoryClause.clause,
            priority: 'high'
          });
        }
      }
    });
    
    // Detect risks and suggest improvements
    const risks = this.detectRisks(text);
    risks.forEach(risk => {
      if (risk.rule.Action === 'suggest_improvement') {
        suggestions.push({
          type: 'improvement',
          title: risk.rule.Title,
          description: risk.rule.Description,
          recommendation: risk.rule.Recommendation,
          priority: risk.severity
        });
      }
    });
    
    return suggestions;
  }

  /**
   * Find clause by category
   */
  findClauseByCategory(category) {
    for (const [clauseId, clauseData] of this.clausePatterns) {
      if (clauseData.category.toLowerCase() === category.toLowerCase()) {
        return clauseData;
      }
    }
    return null;
  }

  /**
   * Extract significant words from text (excluding common words)
   */
  extractSignificantWords(text) {
    const commonWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'must',
      'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their'
    ]);
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word))
      .slice(0, 20); // Limit to most significant words
  }

  /**
   * Calculate similarity between two texts using simple word overlap
   */
  calculateSimilarity(text1, text2) {
    const words1 = new Set(this.extractSignificantWords(text1));
    const words2 = new Set(this.extractSignificantWords(text2));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Get pattern matching statistics
   */
  getStatistics() {
    return {
      clausePatterns: this.clausePatterns.size,
      riskPatterns: this.riskPatterns.size,
      contextRules: this.contextRules.size,
      totalPatterns: Array.from(this.clausePatterns.values())
        .reduce((sum, clause) => sum + clause.patterns.length, 0) +
        Array.from(this.riskPatterns.values())
        .reduce((sum, risk) => sum + risk.patterns.length, 0)
    };
  }
}

// Export singleton instance
export const patternMatchingService = new PatternMatchingService();
