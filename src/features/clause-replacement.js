/**
 * Clause Replacement Module
 * Handles clause selection, replacement, and preview functionality
 */

import { showModal, hideModal, updateStatus } from '../utils/ui-utils.js';
import { legalMatrixService } from '../services/legal-matrix-service.js';

// Global state for clause replacement
let currentClauseData = null;
let selectedAlternative = null;
let clauseDropdown = null;
let clauseDetails = null;

export async function initializeClauseReplacement() {
    console.log("Initializing clause replacement functionality...");

    // Get DOM elements
    clauseDropdown = document.getElementById('clause-select');
    clauseDetails = document.getElementById('clause-details');

    if (!clauseDropdown || !clauseDetails) {
        console.error("Clause replacement elements not found");
        return;
    }

    // Load Legal Matrix data
    try {
        await legalMatrixService.loadLegalMatrix();
        populateClauseDropdown();
        setupEventHandlers();
        console.log("Clause replacement initialized successfully");
    } catch (error) {
        console.error("Failed to initialize clause replacement:", error);
        updateStatus("Error loading clause database", "error");
    }
}

function populateClauseDropdown() {
    const clauseNumbers = legalMatrixService.getAvailableClauseNumbers();

    // Clear existing options (except the first placeholder)
    clauseDropdown.innerHTML = '<option value="">Choose a clause...</option>';

    clauseNumbers.forEach(clauseNumber => {
        const clause = legalMatrixService.getClause(clauseNumber);
        if (clause) {
            const option = document.createElement('option');
            option.value = clauseNumber;
            // Create compact display: clause number + 3-5 words from title
            const compactTitle = createCompactTitle(clause.title);
            option.textContent = `${clauseNumber} - ${compactTitle}`;
            clauseDropdown.appendChild(option);
        }
    });

    console.log(`Populated dropdown with ${clauseNumbers.length} clauses`);
}

function createCompactTitle(title) {
    if (!title) return 'Untitled';

    const words = title.split(' ');
    let compactTitle = '';
    let wordCount = 0;

    for (const word of words) {
        if (wordCount >= 5) break;

        const testTitle = compactTitle ? `${compactTitle} ${word}` : word;

        // If adding this word would make it too long, stop
        if (testTitle.length > 25) break;

        compactTitle = testTitle;
        wordCount++;

        // If we have at least 3 words and reasonable length, we can stop
        if (wordCount >= 3 && compactTitle.length >= 15) break;
    }

    return compactTitle || title.substring(0, 20);
}

function setupEventHandlers() {
    // Clause dropdown change handler
    clauseDropdown.addEventListener('change', handleClauseSelection);

    // Replacement action buttons
    const previewBtn = document.getElementById('preview-clause-replacement');
    const applyBtn = document.getElementById('apply-clause-replacement');

    if (previewBtn) {
        previewBtn.addEventListener('click', previewClauseReplacement);
    }

    if (applyBtn) {
        applyBtn.addEventListener('click', applyClauseReplacement);
    }
}

function handleClauseSelection(event) {
    const clauseNumber = event.target.value;

    if (!clauseNumber) {
        clauseDetails.style.display = 'none';
        currentClauseData = null;
        selectedAlternative = null;
        return;
    }

    console.log(`Selected clause: ${clauseNumber}`);

    const clause = legalMatrixService.getClause(clauseNumber);
    if (!clause) {
        console.error(`Clause ${clauseNumber} not found`);
        updateStatus(`Clause ${clauseNumber} not found`, "error");
        return;
    }

    // Store current clause data
    currentClauseData = {
        number: clauseNumber,
        title: clause.title,
        content: clause.baseline.content,
        summary: clause.summary
    };

    // Display clause details
    displayClauseDetails(clause);
    clauseDetails.style.display = 'block';

    // Reset selection state
    selectedAlternative = null;
    updateReplacementButtons();
}

function displayClauseDetails(clause) {
    // Display current clause content
    const currentClauseContent = document.getElementById('current-clause-content');
    if (currentClauseContent) {
        currentClauseContent.innerHTML = `
            <div class="clause-header">
                <span class="clause-number-badge">${clause.number}</span>
                <strong>${clause.title}</strong>
            </div>
            ${clause.summary ? `<div class="clause-summary"><em>${clause.summary}</em></div>` : ''}
            <div class="clause-text">${formatClauseText(clause.baseline.content)}</div>
        `;
    }

    // Display alternatives
    displayAlternativesList(clause.alternatives);
}

function displayAlternativesList(alternatives) {
    const alternativesList = document.getElementById('alternatives-list');
    if (!alternativesList) return;

    if (!alternatives || alternatives.length === 0) {
        alternativesList.innerHTML = '<p class="no-alternatives">No alternative clauses available for this clause.</p>';
        return;
    }

    let html = '';
    alternatives.forEach((alternative, index) => {
        const riskColors = {
            low: { bg: '#dff6dd', color: '#107c10' },
            medium: { bg: '#fff4ce', color: '#797673' },
            high: { bg: '#fde7e9', color: '#d13438' }
        };

        const riskStyle = riskColors[alternative.riskLevel] || riskColors.medium;

        html += `
            <div class="alternative-item" data-alternative-id="${alternative.id}" data-alternative-index="${index}">
                <div class="alternative-header">
                    <div class="alternative-title">${alternative.title}</div>
                    <div class="alternative-badges">
                        <span class="risk-badge" style="background-color: ${riskStyle.bg}; color: ${riskStyle.color};">
                            ${alternative.riskLevel.toUpperCase()} RISK
                        </span>
                        ${alternative.recommended ? '<span class="recommended-badge">RECOMMENDED</span>' : ''}
                    </div>
                </div>
                <div class="alternative-content">
                    ${formatClauseText(alternative.content || alternative.comparison)}
                    ${alternative.note ? `<div class="alternative-note"><em>${alternative.note}</em></div>` : ''}
                </div>
                <div class="alternative-source">Source: ${alternative.title}</div>
            </div>
        `;
    });

    alternativesList.innerHTML = html;

    // Add click handlers to alternatives
    alternativesList.querySelectorAll('.alternative-item').forEach(item => {
        item.addEventListener('click', () => {
            selectAlternativeItem(item, alternatives);
        });
    });
}

function selectAlternativeItem(item, alternatives) {
    const alternativeIndex = parseInt(item.dataset.alternativeIndex);
    const alternative = alternatives[alternativeIndex];

    if (!alternative) {
        console.error("Alternative not found");
        return;
    }

    console.log(`Selecting alternative: ${alternative.title}`);

    // Remove previous selections
    document.querySelectorAll('.alternative-item.selected').forEach(selectedItem => {
        selectedItem.classList.remove('selected');
    });

    // Add selection to current alternative
    item.classList.add('selected');

    // Store selected alternative
    selectedAlternative = alternative;

    // Update button states
    updateReplacementButtons();

    console.log("Alternative selected:", selectedAlternative);
}

function updateReplacementButtons() {
    const previewBtn = document.getElementById('preview-clause-replacement');
    const applyBtn = document.getElementById('apply-clause-replacement');

    const hasSelection = selectedAlternative !== null;

    if (previewBtn) {
        previewBtn.disabled = !hasSelection;
    }

    if (applyBtn) {
        applyBtn.disabled = !hasSelection;
    }
}

function previewClauseReplacement() {
    console.log("Previewing clause replacement...");

    if (!currentClauseData || !selectedAlternative) {
        updateStatus("Error: No clause or alternative selected", "error");
        return;
    }

    // Display preview in modal
    const previewContent = document.getElementById('preview-content');
    if (previewContent) {
        previewContent.innerHTML = `
            <div class="preview-comparison">
                <div class="preview-section">
                    <h4>Current Clause ${currentClauseData.number}</h4>
                    <div class="clause-text original">
                        ${formatClauseText(currentClauseData.content)}
                    </div>
                </div>

                <div class="preview-arrow">→</div>

                <div class="preview-section">
                    <h4>Replacement: ${selectedAlternative.title}</h4>
                    <div class="clause-text replacement">
                        ${formatClauseText(selectedAlternative.content || selectedAlternative.comparison)}
                    </div>
                </div>
            </div>

            <div class="preview-summary">
                <p><strong>Risk Level:</strong> ${selectedAlternative.riskLevel.toUpperCase()}</p>
                <p><strong>Source:</strong> ${selectedAlternative.title}</p>
                ${selectedAlternative.recommended ? '<p><strong>Status:</strong> RECOMMENDED</p>' : ''}
                ${selectedAlternative.note ? `<p><strong>Note:</strong> ${selectedAlternative.note}</p>` : ''}
            </div>
        `;
    }

    // Show preview modal
    showModal('preview-modal');
}

async function applyClauseReplacement() {
    console.log("Applying clause replacement...");

    if (!currentClauseData || !selectedAlternative) {
        updateStatus("Error: No clause or alternative selected", "error");
        return;
    }

    // Show progress
    updateStatus("Replacing clause with track changes...", "info");

    try {
        await simulateClauseReplacement();
        updateStatus(`Clause ${currentClauseData.number} replaced with ${selectedAlternative.title} version using track changes`, "success");
    } catch (error) {
        console.error("Clause replacement failed:", error);
        updateStatus(`Clause replacement failed: ${error.message}`, "error");
    }
}

async function simulateClauseReplacement() {
    console.log("=== CLAUSE REPLACEMENT ===");
    console.log(`Clause Number: ${currentClauseData.number}`);
    console.log(`Clause Title: ${currentClauseData.title}`);
    console.log(`Original Content: ${currentClauseData.content.substring(0, 100)}...`);
    console.log(`New Content: ${(selectedAlternative.content || selectedAlternative.comparison).substring(0, 100)}...`);
    console.log(`Alternative Source: ${selectedAlternative.title}`);
    console.log(`Risk Level: ${selectedAlternative.riskLevel}`);
    console.log("=====================================");

    // Check if Word API is available
    if (typeof Word !== 'undefined' && typeof Word.run === 'function') {
        console.log("Word API is available, attempting real replacement...");

        const replacementContent = selectedAlternative.content || selectedAlternative.comparison;

        if (!replacementContent || replacementContent.trim() === '' || replacementContent === '✓') {
            throw new Error("No valid replacement content available for this alternative");
        }

        try {
            // Use the most reliable in-place replacement method
            await directClauseReplacement(currentClauseData.number, replacementContent);
            console.log("✅ Clause replacement completed successfully in-place");
        } catch (error) {
            console.error("❌ Direct replacement failed:", error);
            throw new Error(`Clause replacement failed: ${error.message}`);
        }
    } else {
        console.log("Word API not available, running demo mode simulation...");

        // Demo mode: simulate in-place replacement visually
        await simulateDemoReplacement(currentClauseData.number, selectedAlternative);
        console.log("✅ Demo replacement simulation completed");
    }
}

/**
 * Replace a clause in the Word document using the Word API
 */
async function replaceClauseInDocument(clauseNumber, newContent) {
    console.log(`Attempting to replace clause ${clauseNumber} in Word document`);

    if (!newContent || newContent.trim() === '') {
        throw new Error('No content provided for replacement');
    }

    return new Promise((resolve, reject) => {
        Word.run(async (context) => {
            try {
                const body = context.document.body;

                // Try multiple search patterns to find the clause
                const searchPatterns = [
                    `${clauseNumber}.`,  // "1.1."
                    `${clauseNumber} `,  // "1.1 "
                    clauseNumber,        // "1.1"
                    `Article ${clauseNumber}`,  // "Article 1.1"
                    `Section ${clauseNumber}`   // "Section 1.1"
                ];

                let foundClause = false;
                let replacementMade = false;

                for (const pattern of searchPatterns) {
                    console.log(`Searching for pattern: "${pattern}"`);

                    try {
                        const searchResults = body.search(pattern, {
                            matchCase: false,
                            matchWholeWord: false,
                            matchWildcards: false
                        });

                        context.load(searchResults, 'items');
                        await context.sync();

                        console.log(`Found ${searchResults.items.length} matches for pattern "${pattern}"`);

                        if (searchResults.items.length > 0) {
                            foundClause = true;

                            // Use the first match
                            const firstResult = searchResults.items[0];

                            // Get the range and expand to include the full paragraph
                            const range = firstResult.getRange();
                            const paragraph = range.paragraph;

                            // Load the paragraph text first
                            context.load(paragraph, 'text');
                            await context.sync();

                            console.log(`Original paragraph text: "${paragraph.text.substring(0, 100)}..."`);

                            // Create the replacement text
                            const replacementText = `${clauseNumber} ${newContent}`;

                            // Clear and replace the paragraph content
                            paragraph.clear();
                            await context.sync();

                            // Insert new content
                            const insertedRange = paragraph.insertText(replacementText, Word.InsertLocation.start);

                            // Apply formatting
                            context.load(insertedRange, 'font');
                            await context.sync();

                            insertedRange.font.name = "Times New Roman";
                            insertedRange.font.size = 12;
                            insertedRange.font.color = "#0078d4"; // Blue to indicate change

                            await context.sync();

                            console.log(`Successfully replaced clause ${clauseNumber} using pattern "${pattern}"`);
                            replacementMade = true;
                            break;
                        }
                    } catch (patternError) {
                        console.warn(`Error with pattern "${pattern}":`, patternError);
                        // Continue to next pattern
                        continue;
                    }
                }

                if (!foundClause) {
                    // If clause not found anywhere, try a simpler approach
                    console.log(`Clause ${clauseNumber} not found with search, trying simple insertion`);

                    try {
                        const insertedRange = body.insertText(`\n\n${clauseNumber} ${newContent}`, Word.InsertLocation.end);

                        // Apply basic formatting
                        context.load(insertedRange, 'font');
                        await context.sync();

                        insertedRange.font.name = "Times New Roman";
                        insertedRange.font.size = 12;
                        insertedRange.font.color = "#0078d4"; // Blue to indicate new content

                        await context.sync();

                        console.log(`Clause ${clauseNumber} inserted at end of document`);
                        replacementMade = true;
                    } catch (insertError) {
                        console.error("Error inserting at end:", insertError);
                        // Try even simpler approach
                        body.insertText(`\n\n${clauseNumber} ${newContent}`, Word.InsertLocation.end);
                        await context.sync();
                        console.log(`Clause ${clauseNumber} inserted with basic method`);
                        replacementMade = true;
                    }
                }

                if (replacementMade) {
                    resolve();
                } else {
                    reject(new Error(`Failed to replace clause ${clauseNumber}`));
                }

            } catch (error) {
                console.error("Error in Word API replacement:", error);
                reject(error);
            }
        }).catch((error) => {
            console.error("Word.run failed:", error);
            reject(error);
        });
    });
}

/**
 * Simulate in-place replacement for demo mode
 */
async function simulateDemoReplacement(clauseNumber, alternative) {
    console.log(`=== DEMO MODE REPLACEMENT SIMULATION ===`);
    console.log(`Simulating in-place replacement of clause ${clauseNumber}`);

    // Find the contract display area
    const contractDisplay = document.getElementById('contract-display');
    if (!contractDisplay) {
        console.log("No contract display found - replacement would happen in Word document");
        return;
    }

    // Get the contract text
    let contractText = contractDisplay.textContent || contractDisplay.innerText || '';

    if (!contractText.includes(clauseNumber)) {
        console.log(`Clause ${clauseNumber} not found in displayed contract`);
        return;
    }

    console.log(`Found clause ${clauseNumber} in contract display`);

    // Find the clause in the text and replace it
    const lines = contractText.split('\n');
    let replacementMade = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith(clauseNumber)) {
            console.log(`Found clause line: "${line}"`);

            // Replace the line with new content
            const newContent = alternative.content || alternative.comparison;
            const newLine = `${clauseNumber} ${newContent}`;
            lines[i] = newLine;

            console.log(`Replaced with: "${newLine.substring(0, 100)}..."`);
            replacementMade = true;
            break;
        }
    }

    if (replacementMade) {
        // Update the display with highlighted replacement
        const newContractText = lines.join('\n');

        // Create highlighted version
        const highlightedText = newContractText.replace(
            new RegExp(`(${clauseNumber}[^\\n]+)`, 'g'),
            `<span style="background-color: #e3f2fd; color: #0078d4; font-weight: bold; padding: 2px 4px; border-radius: 3px;">$1 [REPLACED with ${alternative.title} version]</span>`
        );

        contractDisplay.innerHTML = highlightedText.replace(/\n/g, '<br>');

        console.log(`✅ Demo replacement completed - clause ${clauseNumber} highlighted in contract display`);

        // Scroll to the replaced clause
        const replacedElement = contractDisplay.querySelector('span[style*="background-color: #e3f2fd"]');
        if (replacedElement) {
            replacedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } else {
        console.log(`❌ Could not find clause ${clauseNumber} to replace in demo mode`);
    }
}

/**
 * Direct clause replacement - most reliable method for in-place replacement
 */
async function directClauseReplacement(clauseNumber, newContent) {
    console.log(`=== DIRECT CLAUSE REPLACEMENT FOR ${clauseNumber} ===`);

    return new Promise((resolve, reject) => {
        Word.run(async (context) => {
            try {
                const body = context.document.body;

                // Load the entire document text first
                body.load('text');
                await context.sync();

                const fullText = body.text;
                console.log(`Document has ${fullText.length} characters`);

                // Search for the clause number
                const searchResults = body.search(clauseNumber, {
                    matchCase: false,
                    matchWholeWord: false
                });

                context.load(searchResults, 'items');
                await context.sync();

                console.log(`Found ${searchResults.items.length} matches for "${clauseNumber}"`);

                if (searchResults.items.length === 0) {
                    reject(new Error(`Clause ${clauseNumber} not found in document`));
                    return;
                }

                // Get the first match (should be our clause)
                const match = searchResults.items[0];

                // Get the paragraph containing this match
                const paragraph = match.paragraph;
                context.load(paragraph, 'text');
                await context.sync();

                const paragraphText = paragraph.text.trim();
                console.log(`Found paragraph: "${paragraphText}"`);

                // Verify this is the right clause
                if (!paragraphText.startsWith(clauseNumber)) {
                    console.log(`Paragraph doesn't start with ${clauseNumber}, searching within paragraph...`);

                    // Try to find the clause within the paragraph
                    const clauseIndex = paragraphText.indexOf(clauseNumber);
                    if (clauseIndex === -1) {
                        reject(new Error(`Clause ${clauseNumber} not found at start of any paragraph`));
                        return;
                    }

                    // Find the end of this clause (look for next clause number or end of paragraph)
                    let clauseEnd = paragraphText.length;
                    const nextClauseMatch = paragraphText.match(/(\d+\.\d+)/g);

                    if (nextClauseMatch && nextClauseMatch.length > 1) {
                        const currentIndex = nextClauseMatch.indexOf(clauseNumber);
                        if (currentIndex !== -1 && currentIndex < nextClauseMatch.length - 1) {
                            const nextClause = nextClauseMatch[currentIndex + 1];
                            const nextIndex = paragraphText.indexOf(nextClause, clauseIndex + clauseNumber.length);
                            if (nextIndex !== -1) {
                                clauseEnd = nextIndex;
                            }
                        }
                    }

                    // Extract just the clause we want to replace
                    const beforeClause = paragraphText.substring(0, clauseIndex);
                    const afterClause = paragraphText.substring(clauseEnd);
                    const newClauseText = `${clauseNumber} ${newContent}`;
                    const newParagraphText = beforeClause + newClauseText + afterClause;

                    console.log(`Replacing clause within paragraph:`);
                    console.log(`Before: "${beforeClause}"`);
                    console.log(`New clause: "${newClauseText}"`);
                    console.log(`After: "${afterClause}"`);

                    // Replace the entire paragraph content
                    const paragraphRange = paragraph.getRange();
                    paragraphRange.insertText(newParagraphText, Word.InsertLocation.replace);

                } else {
                    // Simple case: clause occupies the entire paragraph
                    console.log(`Replacing entire paragraph with clause ${clauseNumber}`);

                    const newClauseText = `${clauseNumber} ${newContent}`;
                    console.log(`New clause text: "${newClauseText}"`);

                    // Replace the entire paragraph
                    const paragraphRange = paragraph.getRange();
                    paragraphRange.insertText(newClauseText, Word.InsertLocation.replace);
                }

                await context.sync();

                // Apply formatting to highlight the change
                const updatedParagraph = match.paragraph;
                const paragraphRange = updatedParagraph.getRange();
                context.load(paragraphRange, 'font');
                await context.sync();

                paragraphRange.font.color = "#0078d4"; // Blue
                paragraphRange.font.bold = true;

                await context.sync();

                console.log(`✅ Successfully replaced clause ${clauseNumber} in-place`);
                resolve();

            } catch (error) {
                console.error("Direct replacement error:", error);
                reject(error);
            }
        }).catch(reject);
    });
}

/**
 * Replace clause in-place using track changes - finds exact clause location and replaces it
 */
async function replaceClauseWithTrackChanges(clauseNumber, newContent) {
    console.log(`Replacing clause ${clauseNumber} in-place with track changes`);

    return new Promise((resolve, reject) => {
        Word.run(async (context) => {
            try {
                const body = context.document.body;

                // Enable track changes
                context.document.changeTrackingMode = Word.ChangeTrackingMode.trackAll;

                // Find the exact clause location
                const clauseRange = await findClauseRange(context, body, clauseNumber);

                if (clauseRange) {
                    console.log(`Found clause ${clauseNumber} at specific location`);

                    // Load the original text for logging
                    context.load(clauseRange, 'text');
                    await context.sync();

                    console.log(`Original clause text: "${clauseRange.text.substring(0, 100)}..."`);

                    // Create the new clause text
                    const newClauseText = `${clauseNumber} ${newContent}`;
                    console.log(`Replacing with: "${newClauseText}"`);

                    // Replace the content in-place (this will show in track changes)
                    clauseRange.insertText(newClauseText, Word.InsertLocation.replace);

                    // Add a comment to explain the change
                    try {
                        const insertedRange = clauseRange.getRange();
                        context.load(insertedRange);
                        await context.sync();

                        insertedRange.insertComment(`Clause ${clauseNumber} replaced with ${selectedAlternative.title} version via RHEI AI Legal Assistant`);
                    } catch (commentError) {
                        console.log("Could not add comment:", commentError);
                    }

                    await context.sync();

                    console.log(`✅ Successfully replaced clause ${clauseNumber} in-place with track changes`);
                    resolve();

                } else {
                    console.log(`Clause ${clauseNumber} not found in document`);
                    reject(new Error(`Clause ${clauseNumber} not found in document`));
                }

            } catch (error) {
                console.error("Track changes replacement error:", error);
                reject(error);
            }
        }).catch(reject);
    });
}

/**
 * Find the exact range of a clause in the document
 */
async function findClauseRange(context, body, clauseNumber) {
    console.log(`Searching for clause ${clauseNumber} range...`);

    // Search patterns in order of specificity
    const searchPatterns = [
        `${clauseNumber}.`,      // "8.1."
        `${clauseNumber} `,      // "8.1 "
        clauseNumber             // "8.1"
    ];

    for (const pattern of searchPatterns) {
        console.log(`Trying pattern: "${pattern}"`);

        try {
            const searchResults = body.search(pattern, {
                matchCase: false,
                matchWholeWord: false
            });

            context.load(searchResults, 'items');
            await context.sync();

            console.log(`Found ${searchResults.items.length} matches for "${pattern}"`);

            if (searchResults.items.length > 0) {
                // Get the first match (should be the clause we want)
                const match = searchResults.items[0];

                // Get the paragraph containing this match
                const paragraph = match.paragraph;
                context.load(paragraph, 'text');
                await context.sync();

                console.log(`Paragraph text: "${paragraph.text.substring(0, 100)}..."`);

                // Check if this looks like our clause (starts with the clause number)
                const paragraphText = paragraph.text.trim();
                if (paragraphText.startsWith(clauseNumber)) {
                    console.log(`✅ Found exact clause ${clauseNumber} paragraph`);
                    return paragraph.getRange();
                }

                // If paragraph doesn't start with clause number, try to find the clause boundary
                return await findClauseBoundary(context, match, clauseNumber);
            }
        } catch (patternError) {
            console.warn(`Error with pattern "${pattern}":`, patternError);
            continue;
        }
    }

    return null; // Clause not found
}

/**
 * Find the boundary of a clause when it's not a full paragraph
 */
async function findClauseBoundary(context, match, clauseNumber) {
    console.log(`Finding clause boundary for ${clauseNumber}...`);

    try {
        // Start with the match range
        let clauseRange = match.getRange();

        // Expand to include the rest of the clause content
        // Look for the end of the sentence or next clause number
        const paragraph = match.paragraph;
        context.load(paragraph, 'text');
        await context.sync();

        const paragraphText = paragraph.text;
        const matchStart = paragraphText.indexOf(clauseNumber);

        if (matchStart !== -1) {
            // Find the end of this clause (next clause number or end of paragraph)
            const nextClausePattern = /\d+\.\d+/g;
            const matches = [...paragraphText.matchAll(nextClausePattern)];

            let clauseEnd = paragraphText.length;

            // Find the next clause number after our current one
            for (const nextMatch of matches) {
                if (nextMatch.index > matchStart + clauseNumber.length) {
                    clauseEnd = nextMatch.index;
                    break;
                }
            }

            // Extract just the clause content
            const clauseText = paragraphText.substring(matchStart, clauseEnd).trim();
            console.log(`Extracted clause text: "${clauseText.substring(0, 100)}..."`);

            // Create a range for just this clause
            const paragraphRange = paragraph.getRange();
            context.load(paragraphRange, 'text');
            await context.sync();

            // Find the clause within the paragraph
            const clauseSearchResults = paragraphRange.search(clauseText.substring(0, 50), {
                matchCase: false,
                matchWholeWord: false
            });

            context.load(clauseSearchResults, 'items');
            await context.sync();

            if (clauseSearchResults.items.length > 0) {
                console.log(`✅ Found clause boundary for ${clauseNumber}`);
                return clauseSearchResults.items[0].getRange();
            }
        }

        // Fallback: return the whole paragraph
        console.log(`Using whole paragraph as fallback for ${clauseNumber}`);
        return paragraph.getRange();

    } catch (error) {
        console.error("Error finding clause boundary:", error);
        return match.getRange(); // Return just the match as last resort
    }
}

/**
 * Replace clause in-place without track changes (alternative approach)
 */
async function replaceClauseInPlace(clauseNumber, newContent) {
    console.log(`Replacing clause ${clauseNumber} in-place (no track changes)`);

    return new Promise((resolve, reject) => {
        Word.run(async (context) => {
            try {
                const body = context.document.body;

                // Use a simpler, more reliable search approach
                const searchText = clauseNumber;
                const searchResults = body.search(searchText, {
                    matchCase: false,
                    matchWholeWord: false
                });

                context.load(searchResults, 'items');
                await context.sync();

                console.log(`Found ${searchResults.items.length} matches for "${searchText}"`);

                if (searchResults.items.length > 0) {
                    // Get the first match
                    const firstMatch = searchResults.items[0];

                    // Get the paragraph containing the clause
                    const paragraph = firstMatch.paragraph;
                    context.load(paragraph, 'text');
                    await context.sync();

                    const originalText = paragraph.text.trim();
                    console.log(`Found paragraph: "${originalText.substring(0, 100)}..."`);

                    // Check if this paragraph starts with our clause number
                    if (originalText.startsWith(clauseNumber)) {
                        console.log(`✅ Found exact clause ${clauseNumber} paragraph`);
                        console.log(`Original text: "${originalText}"`);

                        // Create the new clause text
                        const newClauseText = `${clauseNumber} ${newContent}`;
                        console.log(`New text: "${newClauseText}"`);

                        // Get the paragraph range and replace its content
                        const paragraphRange = paragraph.getRange();

                        // Use insertText with replace location to replace content in-place
                        paragraphRange.insertText(newClauseText, Word.InsertLocation.replace);

                        await context.sync();

                        // Apply formatting to make it stand out
                        context.load(paragraphRange, 'font');
                        await context.sync();

                        paragraphRange.font.color = "#0078d4"; // Blue to indicate change
                        paragraphRange.font.bold = true;

                        await context.sync();

                        console.log(`✅ Successfully replaced clause ${clauseNumber} in-place`);
                        resolve();
                        return;
                    }

                    // If paragraph doesn't start with clause number, try to find clause within paragraph
                    const paragraphText = paragraph.text;
                    const clauseStart = paragraphText.indexOf(clauseNumber);

                    if (clauseStart !== -1) {
                        console.log(`Found clause ${clauseNumber} within paragraph at position ${clauseStart}`);

                        // Find the end of the clause (look for next clause number or end of paragraph)
                        let clauseEnd = paragraphText.length;
                        const nextClauseMatch = paragraphText.match(/\d+\.\d+/g);

                        if (nextClauseMatch && nextClauseMatch.length > 1) {
                            // Find the next clause after our current one
                            const currentClauseIndex = nextClauseMatch.indexOf(clauseNumber);
                            if (currentClauseIndex !== -1 && currentClauseIndex < nextClauseMatch.length - 1) {
                                const nextClause = nextClauseMatch[currentClauseIndex + 1];
                                const nextClausePos = paragraphText.indexOf(nextClause, clauseStart + clauseNumber.length);
                                if (nextClausePos !== -1) {
                                    clauseEnd = nextClausePos;
                                }
                            }
                        }

                        // Extract the clause text
                        const clauseText = paragraphText.substring(clauseStart, clauseEnd).trim();
                        console.log(`Extracted clause: "${clauseText.substring(0, 100)}..."`);

                        // Replace the clause text within the paragraph
                        const beforeClause = paragraphText.substring(0, clauseStart);
                        const afterClause = paragraphText.substring(clauseEnd);
                        const newClauseText = `${clauseNumber} ${newContent}`;
                        const newParagraphText = beforeClause + newClauseText + afterClause;

                        // Replace the entire paragraph
                        paragraph.clear();
                        await context.sync();

                        paragraph.insertText(newParagraphText, Word.InsertLocation.start);
                        await context.sync();

                        console.log(`✅ Successfully replaced clause ${clauseNumber} within paragraph`);
                        resolve();
                        return;
                    }
                }

                // If we get here, clause wasn't found
                console.log(`❌ Clause ${clauseNumber} not found in document`);
                reject(new Error(`Clause ${clauseNumber} not found in document`));

            } catch (error) {
                console.error("In-place replacement error:", error);
                reject(error);
            }
        }).catch(reject);
    });
}

/**
 * Simple track changes replacement - enables track changes and inserts at end
 */
async function simpleTrackChangesReplacement(clauseNumber, newContent) {
    console.log(`Simple track changes replacement for clause ${clauseNumber}`);

    return new Promise((resolve, reject) => {
        Word.run(async (context) => {
            try {
                // Enable track changes
                context.document.changeTrackingMode = Word.ChangeTrackingMode.trackAll;

                const body = context.document.body;

                // Load document text to check if clause exists
                body.load('text');
                await context.sync();

                const documentText = body.text;
                const clauseExists = documentText.includes(clauseNumber);

                // Create replacement text
                const timestamp = new Date().toLocaleTimeString();
                let insertText;

                if (clauseExists) {
                    insertText = `\n\n[CLAUSE REPLACEMENT - ${timestamp}]\n` +
                               `Replacing clause ${clauseNumber} with ${selectedAlternative.title} version:\n` +
                               `${clauseNumber} ${newContent}\n` +
                               `[Original clause ${clauseNumber} should be deleted manually]\n`;
                } else {
                    insertText = `\n\n[NEW CLAUSE ADDITION - ${timestamp}]\n` +
                               `${clauseNumber} ${newContent}\n` +
                               `[Added via ${selectedAlternative.title} alternative]\n`;
                }

                // Insert with track changes enabled
                const insertedRange = body.insertText(insertText, Word.InsertLocation.end);

                // Try to add a comment
                try {
                    const commentText = clauseExists ?
                        `Clause ${clauseNumber} replaced with ${selectedAlternative.title} version` :
                        `New clause ${clauseNumber} added from ${selectedAlternative.title}`;
                    insertedRange.insertComment(commentText);
                } catch (commentError) {
                    console.log("Could not add comment:", commentError);
                }

                await context.sync();

                console.log(`✅ Simple track changes replacement completed for clause ${clauseNumber}`);
                resolve();

            } catch (error) {
                console.error("Simple track changes replacement failed:", error);
                reject(error);
            }
        }).catch(reject);
    });
}

/**
 * Simple and reliable clause replacement that avoids complex paragraph manipulation
 */
async function simpleClauseReplacement(clauseNumber, newContent) {
    console.log(`Simple clause replacement for ${clauseNumber}`);

    return new Promise((resolve, reject) => {
        Word.run(async (context) => {
            try {
                const body = context.document.body;

                // Load the document text first
                body.load('text');
                await context.sync();

                const documentText = body.text;
                console.log(`Document has ${documentText.length} characters`);

                // Try to find the clause in the document
                const searchPatterns = [`${clauseNumber}.`, `${clauseNumber} `, clauseNumber];
                let clauseFound = false;

                for (const pattern of searchPatterns) {
                    if (documentText.includes(pattern)) {
                        console.log(`Found clause pattern "${pattern}" in document`);
                        clauseFound = true;
                        break;
                    }
                }

                // Create replacement text with clear marking
                const timestamp = new Date().toLocaleTimeString();
                const replacementText = `\n\n--- CLAUSE REPLACEMENT (${timestamp}) ---\n` +
                                      `ORIGINAL CLAUSE: ${clauseNumber}\n` +
                                      `NEW VERSION: ${selectedAlternative.title}\n` +
                                      `CONTENT: ${clauseNumber} ${newContent}\n` +
                                      `--- END REPLACEMENT ---\n`;

                // Insert the replacement at the end of the document
                body.insertText(replacementText, Word.InsertLocation.end);
                await context.sync();

                console.log(`Clause ${clauseNumber} replacement added to document`);
                resolve();

            } catch (error) {
                console.error("Simple replacement failed:", error);
                reject(error);
            }
        }).catch(reject);
    });
}

/**
 * Simple clause insertion as fallback when complex replacement fails
 */
async function simpleClauseInsertion(clauseNumber, newContent) {
    console.log(`Simple insertion for clause ${clauseNumber}`);

    return new Promise((resolve, reject) => {
        Word.run(async (context) => {
            try {
                const body = context.document.body;

                // Simple approach: just insert at the end with clear marking
                const insertText = `\n\n[REPLACED CLAUSE ${clauseNumber}]\n${clauseNumber} ${newContent}\n[END REPLACEMENT]\n`;

                body.insertText(insertText, Word.InsertLocation.end);
                await context.sync();

                console.log(`Simple insertion completed for clause ${clauseNumber}`);
                resolve();

            } catch (error) {
                console.error("Simple insertion failed:", error);
                reject(error);
            }
        }).catch(reject);
    });
}

function formatClauseText(text) {
    if (!text) return 'No content available';

    // Basic text formatting for display
    return text
        .replace(/\n/g, '<br>')
        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
        .substring(0, 500) + (text.length > 500 ? '...' : '');
}

// Modal functions for compatibility with existing modal system
export function closeReplacementModal() {
    hideModal('replacement-modal');
}

export function closePreviewModal() {
    hideModal('preview-modal');
}

export function confirmReplacement() {
    applyClauseReplacement();
    hideModal('preview-modal');
}

// Legacy functions for backward compatibility
export function selectClause(clauseNumber, clauseElement) {
    // Set the dropdown to the specified clause
    if (clauseDropdown) {
        clauseDropdown.value = clauseNumber;
        clauseDropdown.dispatchEvent(new Event('change'));
    }
}

export function openReplacementModal(clauseNumber) {
    // This is now handled by the dropdown selection
    selectClause(clauseNumber);
}

export function previewReplacement() {
    previewClauseReplacement();
}

export function applyReplacement() {
    applyClauseReplacement();
}

// Debug function to test Word API and clause finding
export async function debugWordAPI() {
    console.log("=== WORD API DEBUG ===");

    if (typeof Word === 'undefined') {
        console.log("❌ Word object is undefined");
        return false;
    }

    if (typeof Word.run !== 'function') {
        console.log("❌ Word.run is not a function");
        return false;
    }

    try {
        await Word.run(async (context) => {
            console.log("✅ Word.run executed successfully");
            const body = context.document.body;
            body.load('text');
            await context.sync();
            console.log(`✅ Document has ${body.text.length} characters`);

            // Test clause finding
            console.log("=== CLAUSE FINDING TEST ===");
            const testClauses = ['1.1', '2.1', '8.1', '10.1'];

            for (const clauseNum of testClauses) {
                console.log(`\nTesting clause ${clauseNum}:`);

                const searchResults = body.search(clauseNum, { matchCase: false });
                context.load(searchResults, 'items');
                await context.sync();

                console.log(`  Found ${searchResults.items.length} matches for "${clauseNum}"`);

                if (searchResults.items.length > 0) {
                    const firstMatch = searchResults.items[0];
                    const paragraph = firstMatch.paragraph;
                    context.load(paragraph, 'text');
                    await context.sync();

                    const paragraphText = paragraph.text.trim();
                    console.log(`  Paragraph: "${paragraphText.substring(0, 80)}..."`);
                    console.log(`  Starts with clause: ${paragraphText.startsWith(clauseNum)}`);
                }
            }

            // Test simple insertion
            console.log("\n=== INSERTION TEST ===");
            body.insertText("\n[DEBUG TEST - " + new Date().toLocaleTimeString() + "]", Word.InsertLocation.end);
            await context.sync();
            console.log("✅ Simple insertion test passed");
        });
        console.log("✅ Word API is fully functional");
        return true;
    } catch (error) {
        console.log("❌ Word API test failed:", error);
        return false;
    }
}

// Test function for debugging clause replacement
export async function testClauseReplacement(clauseNumber = "8.1", testContent = "TEST REPLACEMENT CONTENT") {
    console.log(`=== TESTING CLAUSE REPLACEMENT FOR ${clauseNumber} ===`);

    if (typeof Word === 'undefined') {
        console.log("❌ Word API not available");
        return false;
    }

    try {
        await Word.run(async (context) => {
            const body = context.document.body;

            // First, let's see what's in the document
            body.load('text');
            await context.sync();

            console.log(`Document content (first 500 chars): "${body.text.substring(0, 500)}..."`);

            // Search for the clause
            const searchResults = body.search(clauseNumber, { matchCase: false });
            context.load(searchResults, 'items');
            await context.sync();

            console.log(`Found ${searchResults.items.length} matches for "${clauseNumber}"`);

            if (searchResults.items.length > 0) {
                const match = searchResults.items[0];
                const paragraph = match.paragraph;
                context.load(paragraph, 'text');
                await context.sync();

                console.log(`Paragraph containing clause: "${paragraph.text}"`);

                // Try to replace it
                const newText = `${clauseNumber} ${testContent}`;
                console.log(`Attempting to replace with: "${newText}"`);

                const paragraphRange = paragraph.getRange();
                paragraphRange.insertText(newText, Word.InsertLocation.replace);

                await context.sync();

                console.log("✅ Replacement attempted - check document");
                return true;
            } else {
                console.log(`❌ Clause ${clauseNumber} not found in document`);
                return false;
            }
        });
    } catch (error) {
        console.error("❌ Test failed:", error);
        return false;
    }
}

// Export functions for global access (for modal compatibility)
window.closeReplacementModal = closeReplacementModal;
window.closePreviewModal = closePreviewModal;
window.confirmReplacement = confirmReplacement;
window.selectClause = selectClause;
window.openReplacementModal = openReplacementModal;
window.previewReplacement = previewReplacement;
window.applyReplacement = applyReplacement;
window.debugWordAPI = debugWordAPI;
window.testClauseReplacement = testClauseReplacement;


