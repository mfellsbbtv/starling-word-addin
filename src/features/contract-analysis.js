/**
 * Contract Analysis Module
 * Handles contract analysis and clause compliance checking
 */

import { updateStatus, showResults } from '../utils/ui-utils.js';

export function analyzeContract() {
    console.log("Starting contract analysis...");
    updateStatus("Analyzing contract...", "info");
    
    // For now, show a demo analysis
    displayDemoAnalysis();
}

export function displayDemoAnalysis() {
    console.log("Displaying demo contract analysis...");
    
    const analysisResult = generateDemoAnalysisData();
    displayAnalysisResults(analysisResult);
}

function generateDemoAnalysisData() {
    return {
        contract_structure: {
            title: "DIGITAL VIDEO SERVICES AGREEMENT",
            parties: ["RHEI Creations Inc.", "Provider Name, Inc."],
            effective_date: new Date().toLocaleDateString(),
            articles: [
                {
                    number: "1",
                    title: "Definitions and Interpretation",
                    clauses: [
                        {
                            number: "1.1",
                            text: "In this Agreement, the following terms shall have the meanings set forth below...",
                            changeStatus: { isModified: false }
                        },
                        {
                            number: "1.2", 
                            text: "The headings in this Agreement are for convenience only and shall not affect interpretation...",
                            changeStatus: { isModified: true }
                        }
                    ]
                },
                {
                    number: "2",
                    title: "Grant of Rights",
                    clauses: [
                        {
                            number: "2.1",
                            text: "Subject to the terms and conditions of this Agreement, Licensor hereby grants...",
                            changeStatus: { isModified: true }
                        },
                        {
                            number: "2.2",
                            text: "The rights granted hereunder are non-exclusive and non-transferable...",
                            changeStatus: { isModified: false }
                        }
                    ]
                },
                {
                    number: "3",
                    title: "Term and Termination",
                    clauses: [
                        {
                            number: "3.1",
                            text: "This Agreement shall commence on the Effective Date and continue for a period...",
                            changeStatus: { isModified: false }
                        },
                        {
                            number: "3.2",
                            text: "Either party may terminate this Agreement upon thirty (30) days written notice...",
                            changeStatus: { isModified: true }
                        }
                    ]
                }
            ]
        },
        risk_assessment: {
            overall_risk: "medium",
            risk_factors: [
                {
                    clause: "2.1",
                    risk_level: "high",
                    description: "Broad grant of rights without sufficient limitations"
                },
                {
                    clause: "3.2",
                    risk_level: "medium", 
                    description: "Termination clause may be too permissive"
                }
            ]
        },
        recommendations: [
            {
                clause: "2.1",
                recommendation: "Consider adding geographical and temporal limitations to the grant of rights",
                priority: "high"
            },
            {
                clause: "3.2",
                recommendation: "Add specific termination conditions and notice requirements",
                priority: "medium"
            }
        ]
    };
}

function displayAnalysisResults(analysisResult) {
    const structure = analysisResult.contract_structure;
    const modifiedClauses = structure.articles.reduce((count, article) =>
        count + article.clauses.filter(clause => clause.changeStatus?.isModified).length, 0);
    const totalClauses = structure.articles.reduce((count, article) => count + article.clauses.length, 0);

    const html = `
        <div class="analysis-results">
            <h3>Contract Analysis Results</h3>
            
            <!-- Executive Summary -->
            <div class="executive-summary">
                <h4>Executive Summary</h4>
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-number">${totalClauses}</span>
                        <span class="stat-label">Total Clauses</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${modifiedClauses}</span>
                        <span class="stat-label">Modified Clauses</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${analysisResult.risk_assessment.overall_risk.toUpperCase()}</span>
                        <span class="stat-label">Overall Risk</span>
                    </div>
                </div>
            </div>

            <!-- Article Breakdown -->
            <div class="article-breakdown">
                <h4>Article Breakdown</h4>
                ${structure.articles.map(article => `
                    <div class="article-section">
                        <h5>Article ${article.number}: ${article.title}</h5>
                        <div class="clauses-list">
                            ${article.clauses.map(clause => `
                                <div class="clause-item ${clause.changeStatus?.isModified ? 'modified' : 'unmodified'}" 
                                     data-clause-number="${clause.number}"
                                     onclick="selectClause('${clause.number}', this)">
                                    <div class="clause-header">
                                        <span class="clause-number">${clause.number}</span>
                                        <span class="clause-status ${clause.changeStatus?.isModified ? 'modified' : 'unmodified'}">
                                            ${clause.changeStatus?.isModified ? '🔴 Modified' : '🟢 Standard'}
                                        </span>
                                    </div>
                                    <div class="clause-text">
                                        ${clause.text}
                                    </div>
                                    ${clause.changeStatus?.isModified ? `
                                        <div class="clause-actions">
                                            <button class="replace-button" onclick="event.stopPropagation(); openReplacementModal('${clause.number}')">
                                                Replace Clause
                                            </button>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Risk Assessment -->
            <div class="risk-assessment">
                <h4>Risk Assessment</h4>
                <div class="risk-factors">
                    ${analysisResult.risk_assessment.risk_factors.map(factor => `
                        <div class="risk-factor risk-${factor.risk_level}">
                            <div class="risk-header">
                                <span class="risk-clause">Clause ${factor.clause}</span>
                                <span class="risk-level">${factor.risk_level.toUpperCase()} RISK</span>
                            </div>
                            <div class="risk-description">${factor.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Recommendations -->
            <div class="recommendations">
                <h4>Recommendations</h4>
                <div class="recommendations-list">
                    ${analysisResult.recommendations.map(rec => `
                        <div class="recommendation priority-${rec.priority}">
                            <div class="rec-header">
                                <span class="rec-clause">Clause ${rec.clause}</span>
                                <span class="rec-priority">${rec.priority.toUpperCase()} PRIORITY</span>
                            </div>
                            <div class="rec-text">${rec.recommendation}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="analysis-actions">
                ${modifiedClauses > 0 ? `
                    <div class="auto-update-section">
                        <label class="auto-update-label">
                            <input type="checkbox" id="auto-update-checkbox" onchange="toggleAutoUpdate(this.checked)">
                            <span>Automatically Update All Clauses</span>
                        </label>
                        <button class="accept-all-button" onclick="acceptAllChanges()">
                            ✅ Accept All Changes (${modifiedClauses})
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    showResults(html);
    updateStatus("Contract analysis completed", "success");
}

// Global functions for HTML onclick handlers
window.acceptAllChanges = function() {
    console.log("Accepting all changes...");
    updateStatus("All changes accepted", "success");
    
    // Update UI to show all clauses as accepted
    document.querySelectorAll('.clause-item.modified').forEach(clause => {
        clause.classList.remove('modified');
        clause.classList.add('accepted');
        const statusSpan = clause.querySelector('.clause-status');
        if (statusSpan) {
            statusSpan.textContent = '✅ Accepted';
            statusSpan.className = 'clause-status accepted';
        }
    });
};

window.toggleAutoUpdate = function(enabled) {
    const acceptAllButton = document.querySelector('.accept-all-button');
    if (acceptAllButton && enabled) {
        acceptAllButton.textContent = '🔄 Auto-Applying Changes...';
        acceptAllButton.disabled = true;
        setTimeout(() => window.acceptAllChanges(), 1000);
    }
};

export { displayAnalysisResults };
