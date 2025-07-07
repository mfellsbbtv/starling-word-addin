/**
 * Clause Replacement Module
 * Handles clause selection, replacement, and preview functionality
 */

import { showModal, hideModal, updateStatus } from '../utils/ui-utils.js';

// Global state for clause replacement
let currentClauseData = null;
let selectedAlternative = null;

export function initializeClauseReplacement() {
    console.log("Initializing clause replacement functionality...");
    
    // Set up clause click handlers
    setupClauseClickHandlers();
}

function setupClauseClickHandlers() {
    // This will be called when contract analysis results are displayed
    // For now, it's a placeholder for future implementation
    console.log("Clause click handlers ready");
}

export function selectClause(clauseNumber, clauseElement) {
    console.log(`Selecting clause ${clauseNumber}`);
    
    // Remove previous selections
    document.querySelectorAll('.clause-item.selected').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add selection to current clause
    if (clauseElement) {
        clauseElement.classList.add('selected');
    }
    
    // Store current clause data
    currentClauseData = {
        number: clauseNumber,
        text: clauseElement ? clauseElement.textContent : '',
        element: clauseElement
    };
    
    console.log("Clause selected:", currentClauseData);
}

export function openReplacementModal(clauseNumber) {
    console.log(`Opening replacement modal for clause ${clauseNumber}`);
    
    if (!currentClauseData) {
        console.error("No clause data available");
        updateStatus("Error: No clause selected", "error");
        return;
    }
    
    // Display current clause
    displayCurrentClause();
    
    // Load alternative clauses
    loadAlternativeClauses(clauseNumber);
    
    // Show the modal
    showModal('replacement-modal');
}

function displayCurrentClause() {
    const currentClauseDisplay = document.getElementById('current-clause-display');
    if (currentClauseDisplay && currentClauseData) {
        currentClauseDisplay.innerHTML = `
            <div class="current-clause">
                <h4>Current Clause ${currentClauseData.number}</h4>
                <div class="clause-text">
                    ${formatClauseText(currentClauseData.text)}
                </div>
            </div>
        `;
    }
}

function loadAlternativeClauses(clauseNumber) {
    console.log(`Loading alternatives for clause ${clauseNumber}`);
    
    // Mock alternatives for now - in real implementation, this would fetch from the Legal Matrix
    const alternatives = getMockAlternatives(clauseNumber);
    
    displayAlternatives(alternatives);
}

function getMockAlternatives(clauseNumber) {
    return [
        {
            id: 'baseline',
            title: 'BASELINE (Ninja Tune Ltd.)',
            content: `This is the baseline clause text for ${clauseNumber} from the RHEI Legal Matrix. It represents the standard acceptable language for this type of clause.`,
            riskLevel: 'low',
            recommended: true,
            source: 'legal_matrix'
        },
        {
            id: 'yoola',
            title: 'Yoola Alternative',
            content: `Alternative clause text for ${clauseNumber} suitable for Yoola agreements. This version includes specific provisions that align with Yoola requirements.`,
            riskLevel: 'low',
            recommended: false,
            source: 'legal_matrix'
        },
        {
            id: 'sony',
            title: 'Sony Alternative',
            content: `Sony-specific clause language for ${clauseNumber} that meets their contractual requirements while maintaining acceptable risk levels.`,
            riskLevel: 'medium',
            recommended: false,
            source: 'legal_matrix'
        },
        {
            id: 'lionsgate',
            title: 'Lionsgate Alternative',
            content: `Lionsgate preferred clause structure for ${clauseNumber} with enhanced liability protections and specific performance requirements.`,
            riskLevel: 'medium',
            recommended: false,
            source: 'legal_matrix'
        }
    ];
}

function displayAlternatives(alternatives) {
    const alternativesContainer = document.getElementById('alternatives-container');
    if (!alternativesContainer) return;
    
    let html = '<h4>Alternative Clauses</h4>';
    
    alternatives.forEach(alternative => {
        const riskColors = {
            low: { bg: '#dff6dd', color: '#107c10' },
            medium: { bg: '#fff4ce', color: '#797673' },
            high: { bg: '#fde7e9', color: '#d13438' }
        };
        
        const riskStyle = riskColors[alternative.riskLevel] || riskColors.medium;
        
        html += `
            <div class="alternative-option" data-alternative-id="${alternative.id}">
                <div class="alternative-header">
                    <h5>${alternative.title}</h5>
                    <span class="risk-badge" style="background-color: ${riskStyle.bg}; color: ${riskStyle.color};">
                        ${alternative.riskLevel.toUpperCase()} RISK
                    </span>
                    ${alternative.recommended ? '<span class="recommended-badge">RECOMMENDED</span>' : ''}
                </div>
                <div class="alternative-content">
                    ${formatClauseText(alternative.content)}
                </div>
                <div class="alternative-source">
                    Source: ${alternative.source}
                </div>
            </div>
        `;
    });
    
    alternativesContainer.innerHTML = html;
    
    // Add click handlers to alternatives
    alternativesContainer.querySelectorAll('.alternative-option').forEach(option => {
        option.addEventListener('click', () => {
            selectAlternative(option.dataset.alternativeId, alternatives);
        });
    });
}

function selectAlternative(alternativeId, alternatives) {
    console.log(`Selecting alternative: ${alternativeId}`);
    
    // Remove previous selections
    document.querySelectorAll('.alternative-option.selected').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selection to current alternative
    const selectedOption = document.querySelector(`[data-alternative-id="${alternativeId}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    // Store selected alternative
    selectedAlternative = alternatives.find(alt => alt.id === alternativeId);
    
    // Enable preview and apply buttons
    const previewBtn = document.getElementById('preview-replacement-btn');
    const applyBtn = document.getElementById('apply-replacement-btn');
    
    if (previewBtn) previewBtn.disabled = false;
    if (applyBtn) applyBtn.disabled = false;
    
    console.log("Alternative selected:", selectedAlternative);
}

export function previewReplacement() {
    console.log("Previewing replacement...");
    
    if (!currentClauseData || !selectedAlternative) {
        updateStatus("Error: No clause or alternative selected", "error");
        return;
    }
    
    // Display preview
    const previewContent = document.getElementById('preview-content');
    if (previewContent) {
        previewContent.innerHTML = `
            <div class="preview-comparison">
                <div class="preview-section">
                    <h4>Current Clause ${currentClauseData.number}</h4>
                    <div class="clause-text original">
                        ${formatClauseText(currentClauseData.text)}
                    </div>
                </div>
                
                <div class="preview-arrow">→</div>
                
                <div class="preview-section">
                    <h4>Replacement: ${selectedAlternative.title}</h4>
                    <div class="clause-text replacement">
                        ${formatClauseText(selectedAlternative.content)}
                    </div>
                </div>
            </div>
            
            <div class="preview-summary">
                <p><strong>Risk Level:</strong> ${selectedAlternative.riskLevel.toUpperCase()}</p>
                <p><strong>Source:</strong> ${selectedAlternative.source}</p>
                ${selectedAlternative.recommended ? '<p><strong>Status:</strong> RECOMMENDED</p>' : ''}
            </div>
        `;
    }
    
    // Show preview modal
    showModal('preview-modal');
}

export function applyReplacement() {
    console.log("Applying replacement...");
    
    if (!currentClauseData || !selectedAlternative) {
        updateStatus("Error: No clause or alternative selected", "error");
        return;
    }
    
    // In a real implementation, this would update the Word document
    // For now, we'll just simulate the replacement
    simulateClauseReplacement();
    
    // Close modals
    hideModal('replacement-modal');
    hideModal('preview-modal');
    
    updateStatus(`Clause ${currentClauseData.number} replaced successfully`, "success");
}

function simulateClauseReplacement() {
    console.log("=== SIMULATED CLAUSE REPLACEMENT ===");
    console.log(`Clause Number: ${currentClauseData.number}`);
    console.log(`Original Text: ${currentClauseData.text.substring(0, 100)}...`);
    console.log(`New Text: ${selectedAlternative.content.substring(0, 100)}...`);
    console.log(`Alternative: ${selectedAlternative.title}`);
    console.log("=====================================");
    
    // Update the UI to show the replacement was applied
    if (currentClauseData.element) {
        currentClauseData.element.innerHTML += ' <span style="color: #107c10;">✅ REPLACED</span>';
    }
}

function formatClauseText(text) {
    // Basic text formatting for display
    return text.replace(/\n/g, '<br>');
}

// Export functions for global access
window.selectClause = selectClause;
window.openReplacementModal = openReplacementModal;
window.previewReplacement = previewReplacement;
window.applyReplacement = applyReplacement;
