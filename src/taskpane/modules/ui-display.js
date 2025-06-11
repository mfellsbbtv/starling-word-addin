// UI Display Module - handles all result display functionality
// NO STATIC IMPORTS - All imports will be dynamic to prevent Word API access during loading

// Display combined analysis results
export function displayCombinedAnalysisResults(analysisResult, riskAnalysis, changeSuggestions, summaryResult) {
  const resultsContent = document.getElementById("results-content");
  const resultsSection = document.getElementById("results-section");

  // Get contract structure data
  const structure = analysisResult.contract_structure;
  const modifiedClauses = structure.articles.reduce((count, article) =>
    count + article.clauses.filter(clause => clause.changeStatus?.isModified).length, 0);
  const totalClauses = structure.articles.reduce((count, article) => count + article.clauses.length, 0);

  let html = `
    <div class="analysis-results">
      <!-- 1. CONTRACT STRUCTURE BREAKDOWN (FIRST) -->
      <div class="analysis-section contract-structure">
        <h3>📋 Contract Structure</h3>
        <div class="structure-overview">
          <p><strong>Total Articles:</strong> ${structure.articles.length}</p>
          <p><strong>Total Clauses:</strong> ${totalClauses}</p>
        </div>
        
        <div class="articles-breakdown">`;

  // Display each article with its clauses
  structure.articles.forEach(article => {
    html += `
          <div class="article-item">
            <h4 class="article-title">${article.number}. ${article.title}</h4>
            <div class="clauses-list">`;
    
    article.clauses.forEach(clause => {
      const statusClass = clause.changeStatus?.isModified ? 'modified' : 'unmodified';
      const statusColor = clause.changeStatus?.isModified ? 'red' : 'green';
      
      html += `
              <div class="clause-item ${statusClass}">
                <span class="clause-number" style="color: ${statusColor};">${clause.number}</span>
                <span class="clause-text">${clause.text.substring(0, 100)}${clause.text.length > 100 ? '...' : ''}</span>
              </div>`;
    });
    
    html += `
            </div>
          </div>`;
  });

  html += `
        </div>
      </div>

      <!-- 2. TRACK CHANGES SUMMARY (AFTER STRUCTURE) -->
      <div class="analysis-section track-changes-summary">
        <h3>🔄 Track Changes Summary</h3>
        ${structure.trackChanges ? `
          <div class="change-tracking-info">
            <p><strong>Track Changes:</strong> ${structure.trackChanges.enabled ? 'Enabled' : 'Disabled'}</p>
            ${structure.trackChanges.enabled ? `
              <p><strong>Modified Clauses:</strong> <span class="modified-count">${modifiedClauses}</span> / ${totalClauses}</p>
              <p><strong>Unmodified Clauses:</strong> <span class="unmodified-count">${totalClauses - modifiedClauses}</span> / ${totalClauses}</p>
            ` : ''}
            ${structure.trackChanges.note ? `<p class="track-changes-note"><em>${structure.trackChanges.note}</em></p>` : ''}
            ${structure.trackChanges.demoMode ? '<p class="demo-note"><em>Demo mode - simulated changes for testing</em></p>' : ''}
          </div>
          ${structure.trackChanges.enabled ? `
            <div class="change-legend">
              <div class="legend-item">
                <span class="legend-indicator modified"></span>
                <span>Modified Clause</span>
              </div>
              <div class="legend-item">
                <span class="legend-indicator unmodified"></span>
                <span>Unmodified Clause</span>
              </div>
            </div>
          ` : ''}
        ` : ''}
      </div>

      <!-- 3. EXECUTIVE SUMMARY SECTION -->
      <div class="analysis-summary">
        <h3>${summaryResult.title}</h3>
        <div class="summary-overview">
          <p>${summaryResult.overview}</p>
        </div>
        
        <div class="summary-metrics">
          <div class="metric-item">
            <span class="metric-label">Contract Type:</span>
            <span class="metric-value">${analysisResult.contract_type}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Word Count:</span>
            <span class="metric-value">${analysisResult.word_count}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Compliance Score:</span>
            <span class="metric-value compliance-score">${analysisResult.compliance_score}%</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Risk Score:</span>
            <span class="metric-value risk-score">${riskAnalysis.risk_score}%</span>
          </div>
        </div>
      </div>

      <!-- 4. DETAILED ANALYSIS SECTIONS -->
      <div class="detailed-analysis">
        
        <!-- Risk Analysis -->
        <div class="analysis-section risks">
          <h3>⚠️ Risk Analysis</h3>
          <p class="section-summary">${riskAnalysis.summary}</p>
          
          <div class="risks-list">`;

  riskAnalysis.risks.forEach(risk => {
    const severityClass = `severity-${risk.severity}`;
    html += `
            <div class="risk-item ${severityClass}">
              <div class="risk-header">
                <span class="risk-severity">${risk.severity.toUpperCase()}</span>
                <span class="risk-title">${risk.title}</span>
              </div>
              <p class="risk-description">${risk.description}</p>
              <p class="risk-suggestion"><strong>Suggestion:</strong> ${risk.suggestion}</p>
            </div>`;
  });

  html += `
          </div>
        </div>

        <!-- Change Suggestions -->
        <div class="analysis-section suggestions">
          <h3>💡 Improvement Suggestions</h3>
          <p class="section-summary">${changeSuggestions.summary}</p>
          
          <div class="suggestions-list">`;

  changeSuggestions.suggestions.forEach(suggestion => {
    const priorityClass = `priority-${suggestion.priority}`;
    html += `
            <div class="suggestion-item ${priorityClass}">
              <div class="suggestion-header">
                <span class="suggestion-priority">${suggestion.priority.toUpperCase()}</span>
                <span class="suggestion-title">${suggestion.title}</span>
              </div>
              <div class="suggestion-details">
                <p><strong>Current:</strong> ${suggestion.current}</p>
                <p><strong>Suggested:</strong> ${suggestion.suggested}</p>
                <p><strong>Benefit:</strong> ${suggestion.benefit}</p>
              </div>
            </div>`;
  });

  html += `
          </div>
        </div>

        <!-- Key Terms -->
        <div class="analysis-section key-terms">
          <h3>🔑 Key Terms Identified</h3>
          <div class="terms-list">`;

  analysisResult.key_terms.forEach(term => {
    html += `<span class="term-tag">${term}</span>`;
  });

  html += `
          </div>
        </div>

        <!-- Recommendations -->
        <div class="analysis-section recommendations">
          <h3>📝 Recommendations</h3>
          <ul class="recommendations-list">`;

  analysisResult.recommendations.forEach(rec => {
    html += `<li>${rec}</li>`;
  });

  html += `
          </ul>
        </div>
      </div>
    </div>`;

  resultsContent.innerHTML = html;
  resultsSection.style.display = "block";

  // Show suggestions section with Apply Changes button
  showSuggestionsSection(changeSuggestions);
}

// Show suggestions section with apply changes functionality
export function showSuggestionsSection(changeSuggestions) {
  const suggestionsSection = document.getElementById("suggestions-section");
  const suggestionsContent = document.getElementById("suggestions-content");

  let html = `
    <div class="suggestions-header">
      <h3>💡 Contract Improvement Suggestions</h3>
      <p>Review and apply the following suggestions to improve your contract:</p>
    </div>
    
    <div class="suggestions-list">`;

  changeSuggestions.suggestions.forEach((suggestion, index) => {
    const priorityClass = `priority-${suggestion.priority}`;
    html += `
      <div class="suggestion-card ${priorityClass}">
        <div class="suggestion-header">
          <span class="priority-badge ${suggestion.priority}">${suggestion.priority.toUpperCase()}</span>
          <h4>${suggestion.title}</h4>
        </div>
        <div class="suggestion-content">
          <div class="current-state">
            <strong>Current:</strong> ${suggestion.current}
          </div>
          <div class="suggested-change">
            <strong>Suggested:</strong> ${suggestion.suggested}
          </div>
          <div class="benefit">
            <strong>Benefit:</strong> ${suggestion.benefit}
          </div>
        </div>
        <div class="suggestion-actions">
          <button class="apply-suggestion-btn" onclick="applySuggestion(${index})">
            Apply This Change
          </button>
        </div>
      </div>`;
  });

  html += `
    </div>
    
    <div class="suggestions-actions">
      <button id="apply-all-changes-btn" class="primary-button" onclick="applyAllChanges()">
        Apply All Changes
      </button>
      <button id="dismiss-suggestions-btn" class="secondary-button" onclick="dismissSuggestions()">
        Dismiss Suggestions
      </button>
    </div>`;

  suggestionsContent.innerHTML = html;
  suggestionsSection.style.display = "block";
}

// Display contract generation results
export function displayContractResults(result) {
  const resultsContent = document.getElementById("results-content");
  const resultsSection = document.getElementById("results-section");

  const html = `
    <div class="contract-results">
      <h3>✅ Contract Generated Successfully</h3>
      <div class="contract-info">
        <p><strong>Contract Type:</strong> ${result.metadata?.template_used || 'Content Management Agreement'}</p>
        <p><strong>Generated:</strong> ${new Date(result.metadata?.generated_at || new Date()).toLocaleString()}</p>
        <p><strong>Status:</strong> <span class="status-success">Ready for Review</span></p>
      </div>
      
      <div class="contract-actions">
        <button id="review-contract-btn" class="primary-button" onclick="reviewGeneratedContract()">
          📋 Review Contract
        </button>
        <button id="analyze-new-contract-btn" class="secondary-button" onclick="analyzeContract()">
          🔍 Analyze Generated Contract
        </button>
      </div>
      
      <div class="next-steps">
        <h4>Next Steps:</h4>
        <ul>
          <li>Review the generated contract content</li>
          <li>Run contract analysis to check for risks</li>
          <li>Make any necessary modifications</li>
          <li>Save and share with relevant parties</li>
        </ul>
      </div>
    </div>`;

  resultsContent.innerHTML = html;
  resultsSection.style.display = "block";
}

// Display structured analysis results following the new AI prompt format
export function displayStructuredAnalysisResults(analysisResult) {
  const resultsContent = document.getElementById("results-content");
  const resultsSection = document.getElementById("results-section");

  // Check if we have the new structured analysis format
  if (!analysisResult.structured_analysis) {
    // Fall back to the existing display function
    console.log("No structured analysis found, using legacy display");
    return;
  }

  const structured = analysisResult.structured_analysis;

  let html = `
    <div class="structured-analysis-results">
      <div class="analysis-header">
        <h2>📋 AI Contract Analysis Report</h2>
        <div class="analysis-meta">
          <p><strong>Contract Type:</strong> ${analysisResult.contract_type}</p>
          <p><strong>Analysis Date:</strong> ${new Date(structured.analysis_timestamp).toLocaleString()}</p>
          <p><strong>AI Prompt:</strong> ${structured.ai_prompt_used}</p>
        </div>
      </div>

      <!-- 1. ARTICLE STRUCTURE (Following numbering: 1, 1.1, 1.1.1, 2, 2.1, etc.) -->
      <div class="analysis-section article-structure">
        <h3>📑 Contract Structure Analysis</h3>
        <div class="structure-summary">
          <p>Articles identified and numbered according to legal standards:</p>
        </div>

        <div class="articles-breakdown">`;

  // Display articles with proper numbering
  structured.article_structure.forEach(article => {
    html += `
          <div class="article-container">
            <div class="article-header">
              <h4 class="article-number">Article ${article.number}</h4>
              <h5 class="article-title">${article.title}</h5>
            </div>

            <div class="clauses-container">`;

    article.clauses.forEach(clause => {
      html += `
              <div class="clause-item">
                <span class="clause-number">${clause.number}</span>
                <div class="clause-content">
                  <p>${clause.content}</p>
                  <small class="line-reference">Line ${clause.line_number}</small>
                </div>
              </div>`;
    });

    html += `
            </div>
          </div>`;
  });

  html += `
        </div>
      </div>

      <!-- 2. DEVIATION ANALYSIS -->
      <div class="analysis-section deviation-analysis">
        <h3>⚖️ Standard Library Comparison</h3>
        <div class="deviations-summary">
          <p>Deviations from company standard clauses:</p>
        </div>

        <div class="deviations-list">`;

  structured.deviation_analysis.forEach(deviation => {
    const statusClass = deviation.negotiable_status === 'negotiable' ? 'negotiable' : 'non-negotiable';
    const riskClass = `risk-${deviation.risk_level}`;

    html += `
          <div class="deviation-item ${statusClass} ${riskClass}">
            <div class="deviation-header">
              <span class="clause-ref">Clause ${deviation.clause_reference}</span>
              <span class="negotiable-badge ${deviation.negotiable_status}">
                ${deviation.negotiable_status.toUpperCase()}
              </span>
              <span class="risk-badge ${deviation.risk_level}">
                ${deviation.risk_level.toUpperCase()} RISK
              </span>
            </div>

            <div class="deviation-content">
              <h5>${deviation.clause_title}</h5>
              <p class="deviation-description">${deviation.deviation_description}</p>

              <div class="language-comparison">
                <div class="current-language">
                  <strong>Current Language:</strong>
                  <p>${deviation.current_language}</p>
                </div>
                <div class="standard-language">
                  <strong>Standard Library:</strong>
                  <p>${deviation.standard_language}</p>
                </div>
              </div>

              <div class="business-impact">
                <strong>Business Impact:</strong> ${deviation.business_impact}
              </div>
            </div>
          </div>`;
  });

  html += `
        </div>
      </div>

      <!-- 3. IMPROVEMENT RECOMMENDATIONS -->
      <div class="analysis-section improvement-recommendations">
        <h3>💡 Improvement Recommendations</h3>
        <div class="recommendations-summary">
          <p>Specific language revisions and compliance recommendations:</p>
        </div>

        <div class="recommendations-list">`;

  structured.improvement_recommendations.forEach(recommendation => {
    const priorityClass = `priority-${recommendation.priority}`;
    const typeClass = `type-${recommendation.recommendation_type}`;

    html += `
          <div class="recommendation-item ${priorityClass} ${typeClass}">
            <div class="recommendation-header">
              <span class="clause-ref">Clause ${recommendation.clause_reference}</span>
              <span class="priority-badge ${recommendation.priority}">
                ${recommendation.priority.toUpperCase()}
              </span>
              <span class="type-badge ${recommendation.recommendation_type}">
                ${recommendation.recommendation_type.toUpperCase()}
              </span>
            </div>

            <div class="recommendation-content">
              <div class="risk-score">
                <strong>Current Risk Score:</strong>
                <span class="score">${recommendation.current_risk_score}/100</span>
              </div>

              <div class="improved-language">
                <strong>Recommended Language:</strong>
                <p>${recommendation.improved_language}</p>
              </div>

              <div class="benefits">
                <div class="risk-mitigation">
                  <strong>Risk Mitigation:</strong> ${recommendation.risk_mitigation}
                </div>
                <div class="business-benefit">
                  <strong>Business Benefit:</strong> ${recommendation.business_benefit}
                </div>
              </div>

              <div class="implementation">
                <strong>Implementation Notes:</strong> ${recommendation.implementation_notes}
              </div>
            </div>
          </div>`;
  });

  html += `
        </div>
      </div>

      <!-- 4. SUMMARY METRICS -->
      <div class="analysis-section summary-metrics">
        <h3>📊 Analysis Summary</h3>
        <div class="metrics-grid">
          <div class="metric-card">
            <span class="metric-label">Total Articles</span>
            <span class="metric-value">${structured.article_structure.length}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Deviations Found</span>
            <span class="metric-value">${structured.deviation_analysis.length}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Recommendations</span>
            <span class="metric-value">${structured.improvement_recommendations.length}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Compliance Score</span>
            <span class="metric-value">${analysisResult.compliance_score}%</span>
          </div>
        </div>
      </div>
    </div>`;

  resultsContent.innerHTML = html;
  resultsSection.style.display = "block";

  // Show suggestions section if we have recommendations
  if (structured.improvement_recommendations.length > 0) {
    showStructuredSuggestionsSection(structured.improvement_recommendations);
  }
}

// Show suggestions section for structured recommendations
function showStructuredSuggestionsSection(recommendations) {
  const suggestionsSection = document.getElementById("suggestions-section");
  const suggestionsContent = document.getElementById("suggestions-content");

  let html = `
    <div class="structured-suggestions-header">
      <h3>🔧 Apply Recommended Changes</h3>
      <p>Review and apply AI-recommended improvements to optimize your contract:</p>
    </div>

    <div class="structured-suggestions-list">`;

  recommendations.forEach((recommendation, index) => {
    const priorityClass = `priority-${recommendation.priority}`;
    const typeClass = `type-${recommendation.recommendation_type}`;

    html += `
      <div class="structured-suggestion-card ${priorityClass} ${typeClass}">
        <div class="suggestion-header">
          <span class="clause-ref">Clause ${recommendation.clause_reference}</span>
          <span class="priority-badge ${recommendation.priority}">${recommendation.priority.toUpperCase()}</span>
          <span class="type-badge ${recommendation.recommendation_type}">${recommendation.recommendation_type.toUpperCase()}</span>
        </div>
        <div class="suggestion-content">
          <div class="risk-info">
            <strong>Current Risk Score:</strong> <span class="risk-score">${recommendation.current_risk_score}/100</span>
          </div>
          <div class="improved-language">
            <strong>Recommended Language:</strong>
            <p>${recommendation.improved_language}</p>
          </div>
          <div class="benefits">
            <p><strong>Business Benefit:</strong> ${recommendation.business_benefit}</p>
          </div>
        </div>
        <div class="suggestion-actions">
          <button class="apply-structured-suggestion-btn" onclick="applyStructuredSuggestion(${index})">
            Apply This Change
          </button>
        </div>
      </div>`;
  });

  html += `
    </div>

    <div class="structured-suggestions-actions">
      <button id="apply-all-structured-changes-btn" class="primary-button" onclick="applyAllStructuredChanges()">
        Apply All Recommendations
      </button>
      <button id="dismiss-structured-suggestions-btn" class="secondary-button" onclick="dismissSuggestions()">
        Dismiss Suggestions
      </button>
    </div>`;

  suggestionsContent.innerHTML = html;
  suggestionsSection.style.display = "block";
}

// Display contract review results with revision workflow
export function displayContractReviewResults(reviewResults) {
  const resultsContent = document.getElementById("results-content");
  const resultsSection = document.getElementById("results-section");

  const { acceptabilityStatus, complianceAnalysis, revisionPlan, nonAcceptableClauses } = reviewResults;

  // Determine status styling
  const statusClass = {
    'ready-for-legal': 'status-success',
    'minor-revisions': 'status-warning',
    'major-revisions': 'status-error',
    'not-acceptable': 'status-critical'
  }[acceptabilityStatus.status] || 'status-info';

  let html = `
    <div class="contract-review-results">
      <!-- Overall Status Header -->
      <div class="review-header">
        <h2>📋 Contract Review Results</h2>
        <div class="acceptability-status ${statusClass}">
          <div class="status-indicator">
            <span class="status-icon">${getStatusIcon(acceptabilityStatus.status)}</span>
            <span class="status-text">${acceptabilityStatus.message}</span>
          </div>
          <div class="status-metrics">
            <span class="metric">
              <strong>${acceptabilityStatus.acceptablePercentage}%</strong> Acceptable
            </span>
            <span class="metric">
              <strong>${acceptabilityStatus.problematicClauses}</strong> Issues Found
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="review-actions">
        ${generateActionButtons(acceptabilityStatus, revisionPlan)}
      </div>

      <!-- Compliance Overview -->
      <div class="compliance-overview">
        <h3>📊 Compliance Analysis</h3>
        <div class="compliance-grid">
          <div class="compliance-card acceptable">
            <div class="card-number">${complianceAnalysis.acceptableClauses.length}</div>
            <div class="card-label">Acceptable Clauses</div>
          </div>
          <div class="compliance-card problematic">
            <div class="card-number">${complianceAnalysis.problematicClauses.length}</div>
            <div class="card-label">Issues Found</div>
          </div>
          <div class="compliance-card missing">
            <div class="card-number">${complianceAnalysis.missingClauses.length}</div>
            <div class="card-label">Missing Clauses</div>
          </div>
          <div class="compliance-card score">
            <div class="card-number">${complianceAnalysis.overallScore}%</div>
            <div class="card-label">Compliance Score</div>
          </div>
        </div>
      </div>

      <!-- Revision Plan -->
      ${generateRevisionPlanSection(revisionPlan, nonAcceptableClauses)}

      <!-- Next Steps -->
      <div class="next-steps-section">
        <h3>📝 Next Steps</h3>
        <ol class="next-steps-list">
          ${acceptabilityStatus.nextSteps.map(step => `<li>${step}</li>`).join('')}
        </ol>
      </div>

      <!-- Detailed Issues (Collapsible) -->
      <div class="detailed-issues">
        <h3>🔍 Detailed Analysis</h3>
        <div class="issues-accordion">
          ${generateDetailedIssuesSection(complianceAnalysis)}
        </div>
      </div>
    </div>`;

  resultsContent.innerHTML = html;
  resultsSection.style.display = "block";

  // Add event listeners for interactive elements
  addReviewEventListeners(reviewResults);
}

function getStatusIcon(status) {
  const icons = {
    'ready-for-legal': '✅',
    'minor-revisions': '⚠️',
    'major-revisions': '🔧',
    'not-acceptable': '❌'
  };
  return icons[status] || '📋';
}

function generateActionButtons(acceptabilityStatus, revisionPlan) {
  let buttons = '';

  if (acceptabilityStatus.status === 'ready-for-legal') {
    buttons = `
      <button class="primary-button" onclick="submitToLegal()">
        📤 Submit to Legal Review
      </button>
      <button class="secondary-button" onclick="generateContractSummary()">
        📄 Generate Summary
      </button>`;
  } else if (revisionPlan.totalRevisions > 0) {
    const autoReplaceable = revisionPlan.revisions.filter(r => r.autoReplaceable).length;

    buttons = `
      <button class="primary-button" onclick="applyAutomaticRevisions()" ${autoReplaceable === 0 ? 'disabled' : ''}>
        🔧 Apply ${autoReplaceable} Automatic Revisions
      </button>
      <button class="secondary-button" onclick="reviewManualChanges()">
        👁️ Review Manual Changes (${revisionPlan.totalRevisions - autoReplaceable})
      </button>
      <button class="tertiary-button" onclick="rerunAnalysis()">
        🔄 Re-run Analysis
      </button>`;
  }

  return buttons;
}

function generateRevisionPlanSection(revisionPlan, nonAcceptableClauses) {
  if (revisionPlan.totalRevisions === 0) {
    return `
      <div class="revision-plan-section">
        <h3>✅ No Revisions Needed</h3>
        <p>All clauses meet the required standards.</p>
      </div>`;
  }

  const highPriority = revisionPlan.revisions.filter(r => r.priority === 'high');
  const mediumPriority = revisionPlan.revisions.filter(r => r.priority === 'medium');
  const lowPriority = revisionPlan.revisions.filter(r => r.priority === 'low');

  return `
    <div class="revision-plan-section">
      <h3>🔧 Revision Plan (${revisionPlan.totalRevisions} items)</h3>

      ${highPriority.length > 0 ? `
        <div class="priority-group high-priority">
          <h4>🚨 High Priority (${highPriority.length})</h4>
          <div class="revision-items">
            ${highPriority.map(revision => generateRevisionItem(revision)).join('')}
          </div>
        </div>` : ''}

      ${mediumPriority.length > 0 ? `
        <div class="priority-group medium-priority">
          <h4>⚠️ Medium Priority (${mediumPriority.length})</h4>
          <div class="revision-items">
            ${mediumPriority.map(revision => generateRevisionItem(revision)).join('')}
          </div>
        </div>` : ''}

      ${lowPriority.length > 0 ? `
        <div class="priority-group low-priority">
          <h4>ℹ️ Low Priority (${lowPriority.length})</h4>
          <div class="revision-items">
            ${lowPriority.map(revision => generateRevisionItem(revision)).join('')}
          </div>
        </div>` : ''}
    </div>`;
}

function generateRevisionItem(revision) {
  const actionIcon = {
    'replace': '🔄',
    'revise': '✏️',
    'review': '👁️'
  }[revision.recommendedAction] || '📝';

  return `
    <div class="revision-item" data-clause-id="${revision.clauseId}">
      <div class="revision-header">
        <span class="revision-icon">${actionIcon}</span>
        <span class="clause-id">Clause ${revision.clauseId}</span>
        <span class="revision-action">${revision.recommendedAction.toUpperCase()}</span>
        ${revision.autoReplaceable ? '<span class="auto-badge">AUTO</span>' : '<span class="manual-badge">MANUAL</span>'}
      </div>
      <div class="revision-content">
        <div class="current-text">
          <strong>Current:</strong> ${revision.currentText.substring(0, 100)}...
        </div>
        ${revision.replacementOptions.length > 0 ? `
          <div class="replacement-options">
            <strong>Recommended:</strong> ${revision.replacementOptions[0].content.substring(0, 100)}...
          </div>` : ''}
        <div class="revision-issues">
          <strong>Issues:</strong> ${revision.issues.map(issue => issue.description).join(', ')}
        </div>
      </div>
      <div class="revision-actions">
        ${revision.autoReplaceable ?
          `<button class="mini-button primary" onclick="applyRevision('${revision.clauseId}')">Apply</button>` :
          `<button class="mini-button secondary" onclick="reviewRevision('${revision.clauseId}')">Review</button>`
        }
        <button class="mini-button tertiary" onclick="viewDetails('${revision.clauseId}')">Details</button>
      </div>
    </div>`;
}

function generateDetailedIssuesSection(complianceAnalysis) {
  return `
    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAccordion('problematic-clauses')">
        <span>❌ Problematic Clauses (${complianceAnalysis.problematicClauses.length})</span>
        <span class="accordion-icon">▼</span>
      </div>
      <div class="accordion-content" id="problematic-clauses">
        ${complianceAnalysis.problematicClauses.map(clause => `
          <div class="issue-item">
            <strong>Clause ${clause.clauseId}:</strong> ${clause.issues.map(issue => issue.description).join(', ')}
          </div>
        `).join('')}
      </div>
    </div>

    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAccordion('missing-clauses')">
        <span>➕ Missing Clauses (${complianceAnalysis.missingClauses.length})</span>
        <span class="accordion-icon">▼</span>
      </div>
      <div class="accordion-content" id="missing-clauses">
        ${complianceAnalysis.missingClauses.map(clause => `
          <div class="issue-item">
            <strong>${clause.title}:</strong> ${clause.content.substring(0, 100)}...
          </div>
        `).join('')}
      </div>
    </div>`;
}

function addReviewEventListeners(reviewResults) {
  // Store review results globally for access by event handlers
  window.currentReviewResults = reviewResults;

  // Add accordion functionality
  window.toggleAccordion = function(id) {
    const content = document.getElementById(id);
    const header = content.previousElementSibling;
    const icon = header.querySelector('.accordion-icon');

    if (content.style.display === 'none' || !content.style.display) {
      content.style.display = 'block';
      icon.textContent = '▲';
    } else {
      content.style.display = 'none';
      icon.textContent = '▼';
    }
  };
}
