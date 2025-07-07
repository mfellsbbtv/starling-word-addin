// Legal Matrix Contract Analyzer - Analyze contracts against Legal Matrix baseline and party variations
export class LegalMatrixAnalyzer {
  constructor() {
    this.legalMatrixService = null;
    this.analysisCache = new Map();
  }

  /**
   * Initialize analyzer with Legal Matrix service
   */
  async initialize(legalMatrixService) {
    this.legalMatrixService = legalMatrixService;
    console.log("Legal Matrix Analyzer initialized");
  }

  /**
   * Analyze contract against Legal Matrix
   * This is the main function that determines which clauses need adjustment
   */
  async analyzeContract(contractText, targetParty = null, options = {}) {
    console.log(`Analyzing contract against Legal Matrix${targetParty ? ` for party: ${targetParty}` : ''}...`);
    
    if (!this.legalMatrixService) {
      throw new Error("Legal Matrix Analyzer not initialized. Call initialize() first.");
    }
    
    try {
      // Extract contract structure
      const extractedContract = this.extractContractStructure(contractText);
      
      // Perform comprehensive analysis
      const analysis = {
        contractStructure: extractedContract,
        clauseAnalysis: [],
        missingClauses: [],
        acceptableModifications: [],
        unacceptableModifications: [],
        partySpecificRecommendations: [],
        complianceScore: 0,
        overallAssessment: '',
        targetParty: targetParty,
        analysisDate: new Date().toISOString()
      };
      
      // Analyze each baseline clause
      await this.analyzeBaselineClauses(analysis, contractText, targetParty);
      
      // Generate party-specific recommendations
      if (targetParty) {
        this.generatePartySpecificRecommendations(analysis, targetParty);
      }
      
      // Calculate compliance score
      analysis.complianceScore = this.calculateComplianceScore(analysis);
      
      // Generate overall assessment
      analysis.overallAssessment = this.generateOverallAssessment(analysis);
      
      return analysis;
      
    } catch (error) {
      console.error("Contract analysis failed:", error);
      throw new Error(`Contract analysis failed: ${error.message}`);
    }
  }

  /**
   * Extract contract structure from text
   */
  extractContractStructure(contractText) {
    const structure = {
      articles: [],
      clauses: [],
      totalLength: contractText.length,
      wordCount: contractText.split(/\s+/).length
    };
    
    // Extract articles and clauses using regex patterns
    const lines = contractText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let currentArticle = null;
    let currentClause = null;
    
    lines.forEach((line, index) => {
      // Look for article patterns (ARTICLE 2, Article 2, 2., etc.)
      const articleMatch = line.match(/^(?:ARTICLE\s+)?(\d+)(?:\.|\s|$)/i);
      if (articleMatch) {
        currentArticle = {
          number: articleMatch[1],
          title: line,
          clauses: [],
          startLine: index
        };
        structure.articles.push(currentArticle);
        return;
      }
      
      // Look for clause patterns (2.1, 2.2, etc.)
      const clauseMatch = line.match(/^(\d+)\.(\d+)(?:\s+(.+))?/);
      if (clauseMatch) {
        currentClause = {
          article: clauseMatch[1],
          number: clauseMatch[2],
          fullNumber: `${clauseMatch[1]}.${clauseMatch[2]}`,
          title: clauseMatch[3] || '',
          content: '',
          startLine: index
        };
        
        if (currentArticle && currentArticle.number === clauseMatch[1]) {
          currentArticle.clauses.push(currentClause);
        }
        
        structure.clauses.push(currentClause);
        return;
      }
      
      // Add content to current clause
      if (currentClause && line.length > 10) { // Ignore very short lines
        currentClause.content += (currentClause.content ? ' ' : '') + line;
      }
    });
    
    return structure;
  }

  /**
   * Analyze baseline clauses against extracted contract
   */
  async analyzeBaselineClauses(analysis, contractText, targetParty) {
    const baselineClauses = this.legalMatrixService.baselineClauses;
    
    for (const [clauseKey, baselineClause] of baselineClauses) {
      const foundClause = this.findMatchingClause(analysis.contractStructure, clauseKey);
      
      if (!foundClause) {
        // Clause is missing
        analysis.missingClauses.push({
          clauseKey,
          article: baselineClause.article,
          clauseNumber: baselineClause.clauseNumber,
          title: baselineClause.title,
          baselineContent: baselineClause.baseline,
          severity: this.assessMissingSeverity(clauseKey),
          recommendation: `Add clause ${clauseKey}: ${baselineClause.title}`
        });
      } else {
        // Clause exists, analyze variation
        const clauseAnalysis = await this.analyzeClauseVariation(
          foundClause, 
          baselineClause, 
          clauseKey, 
          targetParty
        );
        
        analysis.clauseAnalysis.push(clauseAnalysis);
        
        // Categorize the analysis
        if (clauseAnalysis.isAcceptable) {
          analysis.acceptableModifications.push(clauseAnalysis);
        } else if (clauseAnalysis.hasModification) {
          analysis.unacceptableModifications.push(clauseAnalysis);
        }
      }
    }
  }

  /**
   * Analyze individual clause variation
   */
  async analyzeClauseVariation(foundClause, baselineClause, clauseKey, targetParty) {
    const matrixEntry = this.legalMatrixService.clauseMatrix.get(clauseKey);
    
    // Calculate similarity to baseline
    const baselineSimilarity = this.calculateSimilarity(foundClause.content, baselineClause.baseline);
    
    // Check if it's an exact or near-exact match to baseline
    if (baselineSimilarity > 0.95) {
      return {
        clauseKey,
        title: baselineClause.title,
        foundContent: foundClause.content,
        baselineContent: baselineClause.baseline,
        status: 'exact_match',
        isAcceptable: true,
        hasModification: false,
        similarity: baselineSimilarity,
        recommendation: 'No changes needed - matches baseline'
      };
    }
    
    // Check against party-specific acceptable variations
    let bestPartyMatch = null;
    let highestPartySimilarity = 0;
    
    if (targetParty && matrixEntry && matrixEntry.partyVariations[targetParty]) {
      const partyVariation = matrixEntry.partyVariations[targetParty];
      
      if (!partyVariation.isUnchanged) {
        const partySimilarity = this.calculateSimilarity(foundClause.content, partyVariation.modification);
        if (partySimilarity > highestPartySimilarity) {
          highestPartySimilarity = partySimilarity;
          bestPartyMatch = partyVariation;
        }
      }
    }
    
    // Check against all acceptable modifications from other parties
    let bestGeneralMatch = null;
    let highestGeneralSimilarity = 0;
    
    if (matrixEntry) {
      Object.entries(matrixEntry.partyVariations).forEach(([party, variation]) => {
        if (!variation.isUnchanged && variation.modification) {
          const similarity = this.calculateSimilarity(foundClause.content, variation.modification);
          if (similarity > highestGeneralSimilarity) {
            highestGeneralSimilarity = similarity;
            bestGeneralMatch = { party, variation };
          }
        }
      });
    }
    
    // Determine acceptability
    const isAcceptableToParty = targetParty && highestPartySimilarity > 0.8;
    const isAcceptableGeneral = highestGeneralSimilarity > 0.8;
    const isAcceptable = isAcceptableToParty || isAcceptableGeneral;
    
    // Generate recommendation
    let recommendation;
    if (isAcceptable) {
      if (isAcceptableToParty) {
        recommendation = `Acceptable modification for ${targetParty} - matches known variation`;
      } else {
        recommendation = `Acceptable modification - similar to ${bestGeneralMatch.party} variation`;
      }
    } else {
      recommendation = this.generateRevisionRecommendation(foundClause, baselineClause, targetParty, matrixEntry);
    }
    
    return {
      clauseKey,
      title: baselineClause.title,
      foundContent: foundClause.content,
      baselineContent: baselineClause.baseline,
      status: isAcceptable ? 'acceptable_modification' : 'unacceptable_modification',
      isAcceptable,
      hasModification: true,
      similarity: Math.max(baselineSimilarity, highestPartySimilarity, highestGeneralSimilarity),
      bestMatch: bestPartyMatch || bestGeneralMatch,
      targetPartySimilarity: highestPartySimilarity,
      generalSimilarity: highestGeneralSimilarity,
      recommendation
    };
  }

  /**
   * Generate party-specific recommendations
   */
  generatePartySpecificRecommendations(analysis, targetParty) {
    const partyVariations = this.legalMatrixService.partyVariations.get(targetParty);
    
    if (!partyVariations) {
      analysis.partySpecificRecommendations.push({
        type: 'info',
        message: `No specific variations found for ${targetParty}. Using general acceptable modifications.`
      });
      return;
    }
    
    // Analyze which party-specific clauses are missing or incorrectly implemented
    partyVariations.forEach((variation, clauseKey) => {
      if (!variation.isUnchanged) {
        const foundAnalysis = analysis.clauseAnalysis.find(a => a.clauseKey === clauseKey);
        
        if (!foundAnalysis) {
          // Clause is missing entirely
          analysis.partySpecificRecommendations.push({
            type: 'missing',
            clauseKey,
            message: `Missing clause ${clauseKey} - ${targetParty} requires specific variation`,
            suggestedContent: variation.modification
          });
        } else if (foundAnalysis.targetPartySimilarity < 0.8) {
          // Clause exists but doesn't match party-specific variation
          analysis.partySpecificRecommendations.push({
            type: 'modification',
            clauseKey,
            message: `Clause ${clauseKey} should be modified for ${targetParty}`,
            currentContent: foundAnalysis.foundContent,
            suggestedContent: variation.modification
          });
        }
      }
    });
  }

  /**
   * Calculate text similarity using word overlap
   */
  calculateSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;
    
    const words1 = new Set(text1.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2));
    const words2 = new Set(text2.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Find matching clause in extracted contract structure
   */
  findMatchingClause(contractStructure, clauseKey) {
    return contractStructure.clauses.find(clause => clause.fullNumber === clauseKey);
  }

  /**
   * Assess severity of missing clause
   */
  assessMissingSeverity(clauseKey) {
    // Critical clauses that should always be present
    const criticalClauses = ['3.1', '3.2', '4.1', '4.2']; // Revenue and termination clauses
    const importantClauses = ['2.1', '2.2']; // Service clauses
    
    if (criticalClauses.includes(clauseKey)) return 'high';
    if (importantClauses.includes(clauseKey)) return 'medium';
    return 'low';
  }

  /**
   * Generate revision recommendation
   */
  generateRevisionRecommendation(foundClause, baselineClause, targetParty, matrixEntry) {
    if (targetParty && matrixEntry && matrixEntry.partyVariations[targetParty] && !matrixEntry.partyVariations[targetParty].isUnchanged) {
      return `Revise to match ${targetParty} variation: "${matrixEntry.partyVariations[targetParty].modification}"`;
    }
    
    return `Revise to match baseline: "${baselineClause.baseline}"`;
  }

  /**
   * Calculate overall compliance score
   */
  calculateComplianceScore(analysis) {
    const totalClauses = this.legalMatrixService.baselineClauses.size;
    const acceptableClauses = analysis.acceptableModifications.length + 
                             analysis.clauseAnalysis.filter(c => c.status === 'exact_match').length;
    
    // Penalty for missing clauses
    const missingPenalty = analysis.missingClauses.reduce((penalty, missing) => {
      return penalty + (missing.severity === 'high' ? 15 : missing.severity === 'medium' ? 10 : 5);
    }, 0);
    
    const baseScore = Math.round((acceptableClauses / totalClauses) * 100);
    return Math.max(0, baseScore - missingPenalty);
  }

  /**
   * Generate overall assessment
   */
  generateOverallAssessment(analysis) {
    const score = analysis.complianceScore;
    const missingCount = analysis.missingClauses.length;
    const unacceptableCount = analysis.unacceptableModifications.length;
    
    if (score >= 90 && missingCount === 0 && unacceptableCount === 0) {
      return 'Excellent - Contract fully complies with Legal Matrix standards';
    } else if (score >= 80 && missingCount <= 1 && unacceptableCount <= 2) {
      return 'Good - Minor adjustments needed to meet Legal Matrix standards';
    } else if (score >= 70) {
      return 'Acceptable - Several modifications required to align with Legal Matrix';
    } else if (score >= 60) {
      return 'Needs Improvement - Significant changes required for compliance';
    } else {
      return 'Poor - Major revisions needed to meet Legal Matrix standards';
    }
  }
}

// Export singleton instance
export const legalMatrixAnalyzer = new LegalMatrixAnalyzer();
