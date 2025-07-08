/**
 * Legal Matrix Service
 * Handles loading and parsing of Legal Matrix TSV data for clause alternatives
 */

export class LegalMatrixService {
    constructor() {
        this.matrixData = null;
        this.clauses = new Map();
        this.loaded = false;
    }

    /**
     * Load the Legal Matrix TSV file
     */
    async loadLegalMatrix() {
        if (this.loaded) {
            return this.matrixData;
        }

        try {
            console.log("Loading Legal Matrix data...");
            
            // Load the TSV file
            const response = await fetch('./playbooks/Legal agent - RHEI (Tier 1-4) - Clause Matrix for Tier 1 & 2 RHEI Contracts.tsv');
            if (!response.ok) {
                throw new Error(`Failed to load Legal Matrix: ${response.status}`);
            }

            const tsvText = await response.text();
            this.matrixData = this.parseTSV(tsvText);
            this.processClauses();
            this.loaded = true;

            console.log(`Legal Matrix loaded: ${this.clauses.size} clauses available`);
            return this.matrixData;

        } catch (error) {
            console.error("Error loading Legal Matrix:", error);
            throw error;
        }
    }

    /**
     * Parse TSV content into structured data
     */
    parseTSV(tsvText) {
        const lines = tsvText.split('\n');
        const headers = lines[1].split('\t'); // Row 2 contains the headers
        const data = [];

        // Skip header rows and process data rows
        for (let i = 2; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const columns = line.split('\t');
            const row = {};

            headers.forEach((header, index) => {
                row[header.trim()] = columns[index] ? columns[index].trim() : '';
            });

            data.push(row);
        }

        return {
            headers,
            data
        };
    }

    /**
     * Process clauses and organize them by clause number
     */
    processClauses() {
        if (!this.matrixData) return;

        this.matrixData.data.forEach(row => {
            const clauseNumber = row['Clause Number'];
            const title = row['Title / Clause Title'];
            
            // Skip non-clause rows (like Title Page, Table of Contents, etc.)
            if (!clauseNumber || clauseNumber === 'N/A' || !title) {
                return;
            }

            const clause = {
                number: clauseNumber,
                title: title,
                summary: row['Clause Summary BASELINE (Ninja Tune Ltd.)'] || '',
                baseline: {
                    content: row['Full Clause Text BASELINE (Ninja Tune Ltd.)'] || '',
                    source: 'Ninja Tune Ltd.'
                },
                alternatives: []
            };

            // Add alternatives from different columns
            const alternatives = [
                {
                    id: 'mnrk',
                    title: 'MNRK Music Group LP',
                    content: row['Full Clause Text (MNRK Music Group LP)'] || '',
                    comparison: row['MNRK comparison to BASELINE (✓ = the same)'] || '',
                    riskLevel: 'low'
                },
                {
                    id: 'wmx',
                    title: 'WMX',
                    content: row['WMX comparison to BASELINE (✓ = the same)'] || '',
                    comparison: row['WMX comparison to BASELINE (✓ = the same)'] || '',
                    riskLevel: 'low'
                },
                {
                    id: 'sony',
                    title: 'Sony',
                    content: row['Sony comparison to BASELINE (✓ = the same) note contract is from 2014'] || '',
                    comparison: row['Sony comparison to BASELINE (✓ = the same) note contract is from 2014'] || '',
                    riskLevel: 'medium'
                },
                {
                    id: 'create_music',
                    title: 'Create Music Group',
                    content: row['Create Music Group comparison to BASELINE (✓ = the same)'] || '',
                    comparison: row['Create Music Group comparison to BASELINE (✓ = the same)'] || '',
                    riskLevel: 'low'
                },
                {
                    id: 'lionsgate',
                    title: 'Lionsgate',
                    content: row['Lionsgate comparison to BASELINE (✓ = the same)'] || '',
                    comparison: row['Lionsgate comparison to BASELINE (✓ = the same)'] || '',
                    riskLevel: 'medium'
                }
            ];

            // Filter out alternatives that are just "✓" (same as baseline) or empty
            clause.alternatives = alternatives.filter(alt => {
                const content = alt.content || alt.comparison || '';
                return content &&
                       content !== '✓' &&
                       content !== 'Contains the same version but with provider details' &&
                       content.length > 10 &&
                       !content.toLowerCase().includes('the same version but with provider details');
            });

            // For alternatives that reference baseline, use baseline content
            clause.alternatives = clause.alternatives.map(alt => {
                const content = alt.content || alt.comparison || '';
                if (content === '✓' || content.toLowerCase().includes('same version but with provider details')) {
                    return {
                        ...alt,
                        content: clause.baseline.content,
                        note: `Same as baseline (${clause.baseline.source}) with ${alt.title}-specific details`
                    };
                }
                return alt;
            });

            // If still no real alternatives, create meaningful alternatives from baseline
            if (clause.alternatives.length === 0 && clause.baseline.content) {
                clause.alternatives = alternatives.slice(0, 3).map(alt => ({
                    ...alt,
                    content: clause.baseline.content,
                    note: `Standard clause adapted for ${alt.title} requirements`
                }));
            }

            this.clauses.set(clauseNumber, clause);
        });
    }

    /**
     * Get all available clause numbers
     */
    getAvailableClauseNumbers() {
        return Array.from(this.clauses.keys()).sort((a, b) => {
            // Sort clause numbers naturally (1.1, 1.2, 1.3, etc.)
            const parseClause = (clause) => {
                const parts = clause.split('.');
                return parts.map(part => parseInt(part) || 0);
            };

            const aParts = parseClause(a);
            const bParts = parseClause(b);

            for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                const aVal = aParts[i] || 0;
                const bVal = bParts[i] || 0;
                if (aVal !== bVal) {
                    return aVal - bVal;
                }
            }
            return 0;
        });
    }

    /**
     * Get clause data by clause number
     */
    getClause(clauseNumber) {
        return this.clauses.get(clauseNumber);
    }

    /**
     * Get all clauses
     */
    getAllClauses() {
        return Array.from(this.clauses.values());
    }

    /**
     * Search clauses by title or content
     */
    searchClauses(searchTerm) {
        const results = [];
        const term = searchTerm.toLowerCase();

        this.clauses.forEach(clause => {
            if (clause.title.toLowerCase().includes(term) ||
                clause.summary.toLowerCase().includes(term) ||
                clause.baseline.content.toLowerCase().includes(term)) {
                results.push(clause);
            }
        });

        return results;
    }

    /**
     * Get clause alternatives with risk assessment
     */
    getClauseAlternatives(clauseNumber) {
        const clause = this.getClause(clauseNumber);
        if (!clause) {
            return null;
        }

        return {
            current: clause.baseline,
            alternatives: clause.alternatives.map(alt => ({
                ...alt,
                recommended: alt.riskLevel === 'low',
                source: 'legal_matrix'
            }))
        };
    }
}

// Create singleton instance
export const legalMatrixService = new LegalMatrixService();
