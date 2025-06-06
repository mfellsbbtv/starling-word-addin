// UI Display Module - handles all result display functionality
import { setButtonLoading } from '../../shared/utils.js';

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
