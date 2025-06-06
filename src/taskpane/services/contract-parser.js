// Contract Structure Parser Service
import { analyzeTrackChanges, checkClauseModifications } from './contract-analyzer.js';

// Parse contract structure into articles and clauses
export function parseContractStructure(documentText) {
  const lines = documentText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const structure = {
    articles: [],
    metadata: {
      totalLines: lines.length,
      parsedAt: new Date().toISOString()
    }
  };

  let currentArticle = null;
  let articleNumber = 1;
  let clauseNumber = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line is an article header
    if (isArticleHeader(line)) {
      // Save previous article if exists
      if (currentArticle) {
        structure.articles.push(currentArticle);
      }
      
      // Start new article
      currentArticle = {
        number: articleNumber++,
        title: cleanArticleTitle(line),
        clauses: [],
        originalText: line
      };
      clauseNumber = 1; // Reset clause numbering for new article
    } else if (currentArticle && isClause(line)) {
      // Add clause to current article
      currentArticle.clauses.push({
        number: `${currentArticle.number}.${clauseNumber++}`,
        text: line,
        type: 'clause',
        changeStatus: {
          isModified: false,
          hasChanges: false,
          status: 'unmodified'
        }
      });
    } else if (currentArticle && line.length > 20) {
      // Add as continuation of previous clause or new clause if substantial
      if (currentArticle.clauses.length > 0) {
        // Append to last clause
        const lastClause = currentArticle.clauses[currentArticle.clauses.length - 1];
        lastClause.text += ' ' + line;
      } else {
        // First clause in article
        currentArticle.clauses.push({
          number: `${currentArticle.number}.${clauseNumber++}`,
          text: line,
          type: 'clause',
          changeStatus: {
            isModified: false,
            hasChanges: false,
            status: 'unmodified'
          }
        });
      }
    }
  }

  // Add the last article
  if (currentArticle) {
    structure.articles.push(currentArticle);
  }

  // If no articles were found, create a default structure
  if (structure.articles.length === 0) {
    structure.articles = createDefaultStructure(documentText);
  }

  return structure;
}

// Enhanced parsing function that includes change tracking
export async function parseContractStructureWithChanges(documentText) {
  // First get the basic structure
  const basicStructure = parseContractStructure(documentText);

  try {
    // Ensure Word API is available
    if (typeof Word === 'undefined') {
      throw new Error('Word API not available. Please ensure you are running this add-in in Microsoft Word.');
    }

    // Additional check for Office.js initialization
    if (!Office.context || !Office.context.document) {
      throw new Error('Office.js not properly initialized. Please refresh the add-in.');
    }

    // Check actual Word track changes status
    const trackChangesStatus = await Word.run(async (context) => {
      const document = context.document;
      document.load("changeTrackingMode");
      await context.sync();
      
      return {
        isEnabled: document.changeTrackingMode === Word.ChangeTrackingMode.trackAll,
        mode: document.changeTrackingMode
      };
    });

    // If track changes is enabled, analyze real changes
    if (trackChangesStatus.isEnabled) {
      const changeData = await analyzeTrackChanges();
      
      // Enhance each clause with real change information
      if (basicStructure.articles && basicStructure.articles.length > 0) {
        for (let article of basicStructure.articles) {
          for (let clause of article.clauses) {
            // Check if this clause has been modified
            const clauseChanges = await checkClauseModifications(clause.text);
            clause.changeStatus = {
              isModified: clauseChanges.isModified,
              hasChanges: clauseChanges.hasChanges,
              modifications: clauseChanges.modifications || [],
              status: clauseChanges.isModified ? 'modified' : 'unmodified'
            };
          }
        }
      }

      const modifiedCount = basicStructure.articles.reduce((count, article) =>
        count + article.clauses.filter(clause => clause.changeStatus?.isModified).length, 0);

      return {
        ...basicStructure,
        trackChanges: {
          enabled: true,
          totalRevisions: changeData.totalRevisions,
          hasChanges: changeData.hasChanges,
          lastAnalyzed: new Date().toISOString(),
          modifiedClauses: modifiedCount
        }
      };
    } else {
      // Track changes is disabled - show current status
      return {
        ...basicStructure,
        trackChanges: {
          enabled: false,
          totalRevisions: 0,
          hasChanges: false,
          lastAnalyzed: new Date().toISOString(),
          note: "Track changes is currently disabled. Enable track changes in Word to see modification tracking."
        }
      };
    }
  } catch (error) {
    console.error("Error checking track changes status:", error);
    
    // Fallback to demo mode if there's an error
    if (basicStructure.articles && basicStructure.articles.length > 0) {
      generateDemoChangeTracking(basicStructure.articles);
    }

    const modifiedCount = basicStructure.articles.reduce((count, article) =>
      count + article.clauses.filter(clause => clause.changeStatus?.isModified).length, 0);

    return {
      ...basicStructure,
      trackChanges: {
        enabled: true,
        totalRevisions: modifiedCount,
        hasChanges: modifiedCount > 0,
        lastAnalyzed: new Date().toISOString(),
        demoMode: true,
        note: "Demo mode - simulated changes for testing"
      }
    };
  }
}

// Helper functions for parsing
function isArticleHeader(line) {
  // Check for various article header patterns
  const patterns = [
    /^\d+\.\s+[A-Z]/,  // "1. ARTICLE TITLE"
    /^Article\s+\d+/i,  // "Article 1" or "ARTICLE 1"
    /^Section\s+\d+/i,  // "Section 1" or "SECTION 1"
    /^[A-Z\s]{3,}$/,    // ALL CAPS titles
    /^\d+\.\d+\s+[A-Z]/ // "1.1 SUBSECTION"
  ];
  
  return patterns.some(pattern => pattern.test(line));
}

function isClause(line) {
  // A clause is typically a substantial line of text (not just a title)
  return line.length > 30 && !isArticleHeader(line);
}

function cleanArticleTitle(line) {
  // Remove numbering and clean up the title
  return line.replace(/^\d+\.\s*/, '')
             .replace(/^Article\s+\d+:?\s*/i, '')
             .replace(/^Section\s+\d+:?\s*/i, '')
             .trim();
}

function createDefaultStructure(documentText) {
  // Create a basic structure when no clear articles are found
  const paragraphs = documentText.split('\n\n').filter(p => p.trim().length > 50);
  
  return [{
    number: 1,
    title: "Contract Terms",
    clauses: paragraphs.slice(0, 5).map((paragraph, index) => ({
      number: `1.${index + 1}`,
      text: paragraph.trim(),
      type: 'clause',
      changeStatus: {
        isModified: false,
        hasChanges: false,
        status: 'unmodified'
      }
    })),
    originalText: "Contract Terms"
  }];
}

// Generate demo change tracking data for testing
export function generateDemoChangeTracking(articles) {
  articles.forEach((article, articleIndex) => {
    article.clauses.forEach((clause, clauseIndex) => {
      // Randomly mark some clauses as modified for demo purposes
      const isModified = Math.random() < 0.3; // 30% chance of being modified
      
      clause.changeStatus = {
        isModified: isModified,
        hasChanges: isModified,
        status: isModified ? 'modified' : 'unmodified',
        modifications: isModified ? [
          {
            type: 'insertion',
            text: 'demo modification',
            author: 'Demo User',
            date: new Date().toISOString()
          }
        ] : []
      };
    });
  });
}
