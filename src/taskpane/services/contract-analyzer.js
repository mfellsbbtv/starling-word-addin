// Contract Analysis Service
import { updateStatus, showProgressSection, hideProgressSection, handleError, setButtonLoading } from '../../shared/utils.js';

// Analyze track changes in the document
export async function analyzeTrackChanges() {
  try {
    // Ensure Word API is available
    if (typeof Word === 'undefined') {
      throw new Error('Word API not available. Please ensure you are running this add-in in Microsoft Word.');
    }

    // Additional check for Office.js initialization
    if (!Office.context || !Office.context.document) {
      throw new Error('Office.js not properly initialized. Please refresh the add-in.');
    }

    return await Word.run(async (context) => {
      const body = context.document.body;
      const revisions = context.document.revisions;

      // Load revisions and their properties
      revisions.load("items");
      body.load("text");

      await context.sync();

      const changeData = {
        hasChanges: revisions.items.length > 0,
        totalRevisions: revisions.items.length,
        revisions: []
      };

      // Analyze each revision
      for (let i = 0; i < revisions.items.length; i++) {
        const revision = revisions.items[i];
        revision.load(["range", "type", "author", "date"]);
        await context.sync();

        revision.range.load(["text", "start", "end"]);
        await context.sync();

        changeData.revisions.push({
          type: revision.type,
          text: revision.range.text,
          author: revision.author,
          date: revision.date,
          start: revision.range.start,
          end: revision.range.end
        });
      }

      return changeData;
    });
  } catch (error) {
    console.error("Error analyzing track changes:", error);
    return { hasChanges: false, totalRevisions: 0, revisions: [] };
  }
}

// Check if a specific text range has been modified
export async function checkClauseModifications(clauseText, startPosition) {
  try {
    // Ensure Word API is available
    if (typeof Word === 'undefined') {
      throw new Error('Word API not available. Please ensure you are running this add-in in Microsoft Word.');
    }

    // Additional check for Office.js initialization
    if (!Office.context || !Office.context.document) {
      throw new Error('Office.js not properly initialized. Please refresh the add-in.');
    }

    return await Word.run(async (context) => {
      const body = context.document.body;
      const searchResults = body.search(clauseText, { matchCase: false, matchWholeWord: false });
      searchResults.load(["items"]);

      await context.sync();

      if (searchResults.items.length === 0) {
        return { isModified: false, hasChanges: false };
      }

      const range = searchResults.items[0];
      range.load(["start", "end", "text"]);
      await context.sync();

      // Check for revisions in this range
      const revisions = context.document.revisions;
      revisions.load("items");
      await context.sync();

      let hasModifications = false;
      const modifications = [];

      for (let i = 0; i < revisions.items.length; i++) {
        const revision = revisions.items[i];
        revision.load(["range", "type", "author", "date"]);
        await context.sync();

        revision.range.load(["start", "end", "text"]);
        await context.sync();

        // Check if revision overlaps with our clause range
        if (revision.range.start >= range.start && revision.range.end <= range.end) {
          hasModifications = true;
          modifications.push({
            type: revision.type,
            text: revision.range.text,
            author: revision.author,
            date: revision.date
          });
        }
      }

      return {
        isModified: hasModifications,
        hasChanges: hasModifications,
        modifications: modifications,
        originalText: clauseText,
        currentText: range.text
      };
    });
  } catch (error) {
    console.error("Error checking clause modifications:", error);
    return { isModified: false, hasChanges: false };
  }
}

// Generate demo analysis locally (for demo purposes)
export async function generateDemoAnalysis(documentText) {
  const wordCount = documentText.split(/\s+/).length;
  const hasSignatureLines = documentText.includes('_______') || documentText.includes('DATE:');
  const hasParties = documentText.toLowerCase().includes('party') || documentText.toLowerCase().includes('agreement');
  const hasTermination = documentText.toLowerCase().includes('termination') || documentText.toLowerCase().includes('terminate');
  const hasCompensation = documentText.toLowerCase().includes('fee') || documentText.toLowerCase().includes('payment') || documentText.toLowerCase().includes('compensation');

  // Determine contract type based on content
  let contractType = "General Agreement";
  if (documentText.toLowerCase().includes('content management')) {
    contractType = "Content Management Agreement";
  } else if (documentText.toLowerCase().includes('licensing')) {
    contractType = "Licensing Agreement";
  } else if (documentText.toLowerCase().includes('distribution')) {
    contractType = "Distribution Agreement";
  } else if (documentText.toLowerCase().includes('talent')) {
    contractType = "Talent Agreement";
  }

  // Calculate a demo compliance score
  let complianceScore = 70; // Base score
  if (hasSignatureLines) complianceScore += 10;
  if (hasParties) complianceScore += 10;
  if (hasTermination) complianceScore += 5;
  if (hasCompensation) complianceScore += 5;

  // Generate risk assessment
  const risks = [];
  if (!hasTermination) {
    risks.push("Missing termination clause - consider adding clear termination conditions");
  }
  if (!hasCompensation) {
    risks.push("Compensation terms unclear - ensure payment terms are explicitly defined");
  }
  if (wordCount < 100) {
    risks.push("Contract appears incomplete - consider adding more detailed terms");
  }

  // Parse contract structure for articles and clauses
  const contractStructure = await parseContractStructureWithChanges(documentText);

  return {
    contract_type: contractType,
    word_count: wordCount,
    compliance_score: Math.min(complianceScore, 100),
    summary: `This ${contractType.toLowerCase()} contains ${wordCount} words and appears to be ${complianceScore >= 80 ? 'well-structured' : 'missing some standard clauses'}. ${risks.length > 0 ? 'Several areas need attention.' : 'The contract structure looks good.'}`,
    risks: risks,
    key_terms: extractKeyTerms(documentText),
    recommendations: generateRecommendations(risks.length, hasSignatureLines, hasTermination),
    contract_structure: contractStructure // Add the new structure breakdown with change tracking
  };
}

export function extractKeyTerms(text) {
  const terms = [];
  const lowerText = text.toLowerCase();

  if (lowerText.includes('term') || lowerText.includes('duration')) {
    terms.push("Contract Duration");
  }
  if (lowerText.includes('fee') || lowerText.includes('payment')) {
    terms.push("Payment Terms");
  }
  if (lowerText.includes('territory') || lowerText.includes('worldwide')) {
    terms.push("Geographic Scope");
  }
  if (lowerText.includes('intellectual property') || lowerText.includes('rights')) {
    terms.push("Rights Management");
  }

  return terms.length > 0 ? terms : ["Standard Contract Terms"];
}

export function generateRecommendations(riskCount, hasSignatures, hasTermination) {
  const recommendations = [];

  if (riskCount > 2) {
    recommendations.push("Consider legal review before execution");
  }
  if (!hasSignatures) {
    recommendations.push("Add proper signature blocks and date fields");
  }
  if (!hasTermination) {
    recommendations.push("Include clear termination and dispute resolution clauses");
  }

  recommendations.push("Ensure all parties review terms carefully");
  recommendations.push("Consider adding governing law and jurisdiction clauses");

  return recommendations;
}

// Risk Analysis Functions
export function generateRiskAnalysis(documentText) {
  const risks = [];
  const lowerText = documentText.toLowerCase();

  // Check for missing critical clauses
  if (!lowerText.includes('termination') && !lowerText.includes('terminate')) {
    risks.push({
      severity: 'high',
      category: 'Missing Clause',
      title: 'No Termination Clause',
      description: 'Contract lacks clear termination conditions and procedures.',
      location: 'Document-wide',
      suggestion: 'Add a comprehensive termination clause specifying conditions, notice periods, and post-termination obligations.'
    });
  }

  if (!lowerText.includes('liability') && !lowerText.includes('damages')) {
    risks.push({
      severity: 'critical',
      category: 'Legal Risk',
      title: 'No Liability Limitation',
      description: 'Contract does not address liability limitations or damage caps.',
      location: 'Document-wide',
      suggestion: 'Include liability limitation clauses to protect against excessive damages.'
    });
  }

  if (!lowerText.includes('dispute') && !lowerText.includes('arbitration') && !lowerText.includes('jurisdiction')) {
    risks.push({
      severity: 'medium',
      category: 'Dispute Resolution',
      title: 'No Dispute Resolution Mechanism',
      description: 'Contract lacks clear dispute resolution procedures.',
      location: 'Document-wide',
      suggestion: 'Add dispute resolution clause specifying arbitration, mediation, or court jurisdiction.'
    });
  }

  if (!lowerText.includes('confidential') && !lowerText.includes('proprietary')) {
    risks.push({
      severity: 'medium',
      category: 'IP Protection',
      title: 'No Confidentiality Provisions',
      description: 'Contract may not adequately protect confidential information.',
      location: 'Document-wide',
      suggestion: 'Include confidentiality and non-disclosure provisions.'
    });
  }

  if (!lowerText.includes('force majeure') && !lowerText.includes('act of god')) {
    risks.push({
      severity: 'low',
      category: 'Risk Management',
      title: 'No Force Majeure Clause',
      description: 'Contract lacks protection against unforeseeable circumstances.',
      location: 'Document-wide',
      suggestion: 'Consider adding force majeure clause for protection against extraordinary events.'
    });
  }

  return {
    total_risks: risks.length,
    risk_score: calculateRiskScore(risks),
    risks: risks,
    summary: `Found ${risks.length} potential risk areas. ${risks.filter(r => r.severity === 'critical').length} critical, ${risks.filter(r => r.severity === 'high').length} high, ${risks.filter(r => r.severity === 'medium').length} medium, ${risks.filter(r => r.severity === 'low').length} low priority issues.`
  };
}

function calculateRiskScore(risks) {
  let score = 100;
  risks.forEach(risk => {
    switch(risk.severity) {
      case 'critical': score -= 25; break;
      case 'high': score -= 15; break;
      case 'medium': score -= 10; break;
      case 'low': score -= 5; break;
    }
  });
  return Math.max(score, 0);
}

// Change Suggestions Functions
export function generateChangeSuggestions(documentText) {
  const suggestions = [];
  const lowerText = documentText.toLowerCase();

  // Analyze contract structure and suggest improvements
  if (lowerText.includes('shall') && !lowerText.includes('may')) {
    suggestions.push({
      type: 'Language Improvement',
      priority: 'medium',
      title: 'Balance Mandatory vs Optional Language',
      current: 'Contract uses only mandatory "shall" language',
      suggested: 'Consider using "may" for optional provisions to provide flexibility',
      benefit: 'Provides better balance between obligations and flexibility'
    });
  }

  if (!lowerText.includes('including but not limited to') && !lowerText.includes('such as')) {
    suggestions.push({
      type: 'Clarity Enhancement',
      priority: 'low',
      title: 'Add Inclusive Language',
      current: 'Lists may appear exhaustive',
      suggested: 'Add "including but not limited to" before lists to indicate they are not exhaustive',
      benefit: 'Prevents interpretation that lists are complete and exclusive'
    });
  }

  if (lowerText.includes('reasonable') && !lowerText.includes('commercially reasonable')) {
    suggestions.push({
      type: 'Legal Precision',
      priority: 'medium',
      title: 'Clarify "Reasonable" Standards',
      current: 'Uses vague "reasonable" standard',
      suggested: 'Replace with "commercially reasonable" or define specific criteria',
      benefit: 'Reduces ambiguity and potential disputes over reasonableness'
    });
  }

  if (!lowerText.includes('time is of the essence')) {
    suggestions.push({
      type: 'Performance Standards',
      priority: 'low',
      title: 'Add Time Performance Clause',
      current: 'No explicit time performance requirements',
      suggested: 'Add "time is of the essence" clause for critical deadlines',
      benefit: 'Emphasizes importance of meeting deadlines and strengthens enforcement'
    });
  }

  suggestions.push({
    type: 'Modern Practice',
    priority: 'low',
    title: 'Electronic Signature Provision',
    current: 'Traditional signature requirements',
    suggested: 'Add electronic signature acceptance clause',
    benefit: 'Enables faster execution and modern business practices'
  });

  return {
    total_suggestions: suggestions.length,
    suggestions: suggestions,
    summary: `Generated ${suggestions.length} improvement suggestions to enhance contract clarity, enforceability, and modern business practices.`
  };
}
