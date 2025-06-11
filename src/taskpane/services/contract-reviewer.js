// Contract Review and Revision Service
// Analyzes contracts against playbook standards and automatically revises non-acceptable clauses

export class ContractReviewer {
  constructor() {
    this.playbookService = null;
    this.currentReview = null;
  }

  /**
   * Initialize the reviewer with playbook service
   */
  async initialize() {
    if (!this.playbookService) {
      const { playbookService } = await import('../../shared/playbook-service.js');
      this.playbookService = playbookService;
    }
  }

  /**
   * Comprehensive contract review workflow
   * @param {string} contractText - The contract text to review
   * @param {string} agreementType - Type of agreement (e.g., 'content-management')
   * @param {string} contentType - Content type (e.g., 'music', 'non-music')
   * @returns {Promise<Object>} Complete review results with revision recommendations
   */
  async reviewContract(contractText, agreementType, contentType) {
    await this.initialize();
    
    console.log(`Starting comprehensive review for ${agreementType}-${contentType}`);
    
    // Step 1: Parse contract structure
    const contractStructure = await this.parseContractStructure(contractText);
    
    // Step 2: Load playbook standards
    const playbook = await this.playbookService.loadPlaybook(agreementType, contentType);
    
    // Step 3: Analyze against playbook standards
    const complianceAnalysis = await this.analyzeCompliance(contractStructure, playbook);
    
    // Step 4: Identify non-acceptable clauses
    const nonAcceptableClauses = this.identifyNonAcceptableClauses(complianceAnalysis);
    
    // Step 5: Generate revision recommendations
    const revisionPlan = await this.generateRevisionPlan(nonAcceptableClauses, playbook);
    
    // Step 6: Calculate overall acceptability
    const acceptabilityStatus = this.calculateAcceptabilityStatus(complianceAnalysis, revisionPlan);
    
    this.currentReview = {
      contractStructure,
      complianceAnalysis,
      nonAcceptableClauses,
      revisionPlan,
      acceptabilityStatus,
      playbook,
      reviewTimestamp: new Date().toISOString()
    };
    
    return this.currentReview;
  }

  /**
   * Parse contract into structured format for analysis
   */
  async parseContractStructure(contractText) {
    const { parseContractStructure } = await import('./contract-parser.js');
    const structure = parseContractStructure(contractText);
    
    // Enhance with clause identification
    structure.articles.forEach(article => {
      article.clauses.forEach(clause => {
        clause.clauseType = this.identifyClauseType(clause.text);
        clause.keywords = this.extractKeywords(clause.text);
        clause.riskLevel = 'unknown';
        clause.complianceStatus = 'pending';
      });
    });
    
    return structure;
  }

  /**
   * Analyze contract compliance against playbook standards
   */
  async analyzeCompliance(contractStructure, playbook) {
    const analysis = {
      overallScore: 0,
      clauseAnalysis: [],
      missingClauses: [],
      problematicClauses: [],
      acceptableClauses: []
    };
    
    const standardClauses = playbook.clauses?.clauses || [];
    const riskRules = playbook.riskRules?.risk_rules || [];
    
    // Analyze each clause in the contract
    for (const article of contractStructure.articles) {
      for (const clause of article.clauses) {
        const clauseAnalysis = await this.analyzeClause(clause, standardClauses, riskRules);
        analysis.clauseAnalysis.push(clauseAnalysis);
        
        // Categorize clause based on analysis
        if (clauseAnalysis.complianceStatus === 'non-acceptable') {
          analysis.problematicClauses.push(clauseAnalysis);
        } else if (clauseAnalysis.complianceStatus === 'acceptable') {
          analysis.acceptableClauses.push(clauseAnalysis);
        }
      }
    }
    
    // Check for missing essential clauses
    analysis.missingClauses = this.findMissingClauses(contractStructure, standardClauses);
    
    // Calculate overall compliance score
    analysis.overallScore = this.calculateComplianceScore(analysis);
    
    return analysis;
  }

  /**
   * Analyze individual clause against standards
   */
  async analyzeClause(clause, standardClauses, riskRules) {
    const analysis = {
      clauseId: clause.number,
      clauseText: clause.text,
      clauseType: clause.clauseType,
      complianceStatus: 'acceptable', // Default to acceptable
      riskLevel: 'low',
      issues: [],
      recommendations: [],
      standardMatch: null,
      replacementOptions: []
    };
    
    // Find matching standard clause
    const standardMatch = this.findMatchingStandardClause(clause, standardClauses);
    if (standardMatch) {
      analysis.standardMatch = standardMatch;
      
      // Compare against standard
      const complianceCheck = this.checkClauseCompliance(clause, standardMatch);
      analysis.complianceStatus = complianceCheck.status;
      analysis.riskLevel = complianceCheck.riskLevel;
      analysis.issues = complianceCheck.issues;
      
      // Get replacement options if non-compliant
      if (complianceCheck.status === 'non-acceptable') {
        analysis.replacementOptions = this.getReplacementOptions(standardMatch);
      }
    }
    
    // Apply risk rules
    const riskAssessment = this.applyRiskRules(clause, riskRules);
    if (riskAssessment.hasRisks) {
      analysis.riskLevel = Math.max(analysis.riskLevel, riskAssessment.maxRiskLevel);
      analysis.issues.push(...riskAssessment.risks);
    }
    
    return analysis;
  }

  /**
   * Check if a clause complies with standard requirements
   */
  checkClauseCompliance(clause, standardClause) {
    const clauseText = clause.text.toLowerCase();
    const standardText = standardClause.content.toLowerCase();
    
    // Simple compliance checks (in real implementation, this would be more sophisticated)
    const issues = [];
    let status = 'acceptable';
    let riskLevel = standardClause.risk_level || 'low';
    
    // Check for required keywords
    if (standardClause.keywords) {
      const missingKeywords = standardClause.keywords.filter(keyword => 
        !clauseText.includes(keyword.toLowerCase())
      );
      
      if (missingKeywords.length > 0) {
        issues.push({
          type: 'missing_keywords',
          description: `Missing required terms: ${missingKeywords.join(', ')}`,
          severity: 'medium'
        });
      }
    }
    
    // Check if clause is negotiable
    if (!standardClause.negotiable) {
      // For non-negotiable clauses, check strict compliance
      const similarity = this.calculateTextSimilarity(clauseText, standardText);
      if (similarity < 0.7) {
        status = 'non-acceptable';
        riskLevel = 'high';
        issues.push({
          type: 'non_negotiable_deviation',
          description: 'This clause deviates from non-negotiable standard requirements',
          severity: 'high'
        });
      }
    }
    
    return { status, riskLevel, issues };
  }

  /**
   * Find matching standard clause for a contract clause
   */
  findMatchingStandardClause(clause, standardClauses) {
    const clauseText = clause.text.toLowerCase();
    
    // Try to match by clause type first
    let matches = standardClauses.filter(standard => 
      standard.category === clause.clauseType
    );
    
    // If no type match, try keyword matching
    if (matches.length === 0) {
      matches = standardClauses.filter(standard => 
        standard.keywords && standard.keywords.some(keyword => 
          clauseText.includes(keyword.toLowerCase())
        )
      );
    }
    
    // Return best match (first match for now, could be enhanced with scoring)
    return matches.length > 0 ? matches[0] : null;
  }

  /**
   * Get replacement options for a non-compliant clause
   */
  getReplacementOptions(standardClause) {
    const options = [{
      id: 'standard',
      title: 'Standard Clause',
      content: standardClause.content,
      riskLevel: standardClause.risk_level,
      recommended: true
    }];
    
    // Add alternatives if available
    if (standardClause.alternatives) {
      standardClause.alternatives.forEach((alt, index) => {
        options.push({
          id: `alternative_${index}`,
          title: alt.title,
          content: alt.content,
          riskLevel: alt.risk_level,
          recommended: false
        });
      });
    }
    
    return options;
  }

  /**
   * Identify non-acceptable clauses that need revision
   */
  identifyNonAcceptableClauses(complianceAnalysis) {
    return complianceAnalysis.problematicClauses.filter(clause => 
      clause.complianceStatus === 'non-acceptable' || 
      clause.riskLevel === 'high'
    );
  }

  /**
   * Generate comprehensive revision plan
   */
  async generateRevisionPlan(nonAcceptableClauses, playbook) {
    const plan = {
      totalRevisions: nonAcceptableClauses.length,
      revisions: [],
      estimatedImpact: 'medium',
      readyForLegal: false
    };
    
    for (const clause of nonAcceptableClauses) {
      const revision = {
        clauseId: clause.clauseId,
        currentText: clause.clauseText,
        issues: clause.issues,
        recommendedAction: this.determineRecommendedAction(clause),
        replacementOptions: clause.replacementOptions,
        priority: this.calculateRevisionPriority(clause),
        autoReplaceable: clause.replacementOptions.length > 0
      };
      
      plan.revisions.push(revision);
    }
    
    // Determine if contract is ready for legal review
    plan.readyForLegal = this.isReadyForLegalReview(plan, playbook);
    plan.estimatedImpact = this.calculateEstimatedImpact(plan);
    
    return plan;
  }

  /**
   * Calculate overall acceptability status
   */
  calculateAcceptabilityStatus(complianceAnalysis, revisionPlan) {
    const totalClauses = complianceAnalysis.clauseAnalysis.length;
    const problematicClauses = complianceAnalysis.problematicClauses.length;
    const acceptablePercentage = ((totalClauses - problematicClauses) / totalClauses) * 100;
    
    let status = 'not-acceptable';
    let message = 'Contract requires significant revisions before legal review';
    
    if (acceptablePercentage >= 90) {
      status = 'ready-for-legal';
      message = 'Contract meets standards and is ready for legal review';
    } else if (acceptablePercentage >= 75) {
      status = 'minor-revisions';
      message = 'Contract needs minor revisions before legal review';
    } else if (acceptablePercentage >= 50) {
      status = 'major-revisions';
      message = 'Contract needs major revisions before legal review';
    }
    
    return {
      status,
      message,
      acceptablePercentage: Math.round(acceptablePercentage),
      totalClauses,
      problematicClauses,
      readyForLegal: revisionPlan.readyForLegal,
      nextSteps: this.generateNextSteps(status, revisionPlan)
    };
  }

  /**
   * Apply contract revisions automatically
   */
  async applyRevisions(revisionPlan, autoApprove = false) {
    const results = {
      applied: [],
      failed: [],
      requiresManualReview: []
    };
    
    for (const revision of revisionPlan.revisions) {
      if (revision.autoReplaceable && (autoApprove || revision.priority === 'high')) {
        try {
          const result = await this.applyRevision(revision);
          results.applied.push(result);
        } catch (error) {
          results.failed.push({ revision, error: error.message });
        }
      } else {
        results.requiresManualReview.push(revision);
      }
    }
    
    return results;
  }

  /**
   * Apply a single revision to the contract
   */
  async applyRevision(revision) {
    // This would integrate with Word API to actually replace text
    // For now, return the revision plan
    return {
      clauseId: revision.clauseId,
      originalText: revision.currentText,
      newText: revision.replacementOptions[0]?.content || revision.currentText,
      applied: true,
      timestamp: new Date().toISOString()
    };
  }

  // Helper methods
  identifyClauseType(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('termination') || lowerText.includes('terminate')) return 'termination';
    if (lowerText.includes('payment') || lowerText.includes('compensation')) return 'financial';
    if (lowerText.includes('liability') || lowerText.includes('damages')) return 'liability';
    if (lowerText.includes('confidential') || lowerText.includes('non-disclosure')) return 'confidentiality';
    if (lowerText.includes('intellectual property') || lowerText.includes('copyright')) return 'rights';
    return 'general';
  }

  extractKeywords(text) {
    const keywords = [];
    const lowerText = text.toLowerCase();
    const commonTerms = ['termination', 'payment', 'liability', 'confidential', 'rights', 'territory', 'term'];
    
    commonTerms.forEach(term => {
      if (lowerText.includes(term)) keywords.push(term);
    });
    
    return keywords;
  }

  calculateTextSimilarity(text1, text2) {
    // Simple similarity calculation (could be enhanced with more sophisticated algorithms)
    const words1 = text1.split(' ');
    const words2 = text2.split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  findMissingClauses(contractStructure, standardClauses) {
    const contractText = contractStructure.articles
      .flatMap(article => article.clauses)
      .map(clause => clause.text.toLowerCase())
      .join(' ');
    
    return standardClauses.filter(standard => {
      if (!standard.keywords) return false;
      return !standard.keywords.some(keyword => 
        contractText.includes(keyword.toLowerCase())
      );
    });
  }

  calculateComplianceScore(analysis) {
    const total = analysis.clauseAnalysis.length;
    const acceptable = analysis.acceptableClauses.length;
    return total > 0 ? Math.round((acceptable / total) * 100) : 0;
  }

  determineRecommendedAction(clause) {
    if (clause.riskLevel === 'high') return 'replace';
    if (clause.issues.length > 2) return 'revise';
    return 'review';
  }

  calculateRevisionPriority(clause) {
    if (clause.riskLevel === 'high') return 'high';
    if (clause.issues.some(issue => issue.severity === 'high')) return 'high';
    if (clause.issues.length > 1) return 'medium';
    return 'low';
  }

  isReadyForLegalReview(plan, playbook) {
    const highPriorityRevisions = plan.revisions.filter(r => r.priority === 'high').length;
    return highPriorityRevisions === 0;
  }

  calculateEstimatedImpact(plan) {
    const highPriority = plan.revisions.filter(r => r.priority === 'high').length;
    if (highPriority > 3) return 'high';
    if (highPriority > 1) return 'medium';
    return 'low';
  }

  generateNextSteps(status, revisionPlan) {
    const steps = [];
    
    switch (status) {
      case 'ready-for-legal':
        steps.push('Contract is ready for legal team review');
        steps.push('Schedule legal review meeting');
        steps.push('Prepare contract summary for legal team');
        break;
      case 'minor-revisions':
        steps.push('Apply recommended minor revisions');
        steps.push('Re-run contract analysis');
        steps.push('Submit to legal team when ready');
        break;
      case 'major-revisions':
        steps.push('Review and apply major clause revisions');
        steps.push('Consider renegotiation of key terms');
        steps.push('Re-analyze after revisions');
        break;
      default:
        steps.push('Address all high-priority issues');
        steps.push('Apply automatic clause replacements');
        steps.push('Manual review of complex clauses');
        steps.push('Re-run analysis after revisions');
    }
    
    return steps;
  }
}

// Export singleton instance
export const contractReviewer = new ContractReviewer();
