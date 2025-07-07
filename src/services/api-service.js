/**
 * API Service Module
 * Handles external API calls and data fetching
 */

export class ApiService {
    constructor() {
        this.baseUrl = './'; // For local files
        this.cache = new Map();
    }

    // Load TSV files with caching
    async loadTSV(filename) {
        const cacheKey = `tsv_${filename}`;
        
        if (this.cache.has(cacheKey)) {
            console.log(`Loading ${filename} from cache`);
            return this.cache.get(cacheKey);
        }

        try {
            console.log(`Fetching ${filename} from server`);
            const response = await fetch(`${this.baseUrl}playbooks/${filename}`);
            
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}: ${response.status} ${response.statusText}`);
            }

            const data = await response.text();
            this.cache.set(cacheKey, data);
            console.log(`${filename} loaded and cached (${data.length} characters)`);
            
            return data;
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            throw error;
        }
    }

    // Parse TSV data into structured format
    parseTSV(tsvData) {
        const lines = tsvData.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
            throw new Error('TSV file must have at least 2 lines (headers and data)');
        }

        // Skip first line (tier info), use second line as headers
        const headers = lines[1].split('\t').map(h => h.trim());
        const data = [];

        for (let i = 2; i < lines.length; i++) {
            const columns = lines[i].split('\t');
            const row = {};
            
            headers.forEach((header, index) => {
                row[header] = columns[index] ? columns[index].trim() : '';
            });
            
            data.push(row);
        }

        return {
            headers,
            data,
            rowCount: data.length
        };
    }

    // Find baseline clause column in TSV data
    findBaselineColumn(headers) {
        const baselinePatterns = [
            'Full Clause Text BASELINE',
            'Full Clause Text (Original)',
            'Clause Summary BASELINE',
            /baseline.*clause/i,
            /clause.*baseline/i
        ];

        for (let i = 0; i < headers.length; i++) {
            const header = headers[i].trim();
            
            for (const pattern of baselinePatterns) {
                if (typeof pattern === 'string') {
                    if (header.includes(pattern)) {
                        return { index: i, header };
                    }
                } else if (pattern instanceof RegExp) {
                    if (pattern.test(header)) {
                        return { index: i, header };
                    }
                }
            }
        }

        // Fallback: check column 6 for BASELINE
        if (headers.length > 6 && headers[6].includes('BASELINE')) {
            return { index: 6, header: headers[6] };
        }

        throw new Error('Could not find baseline clause text column in TSV data');
    }

    // Load and parse contract template
    async loadContractTemplate(contractType) {
        const filename = contractType === 'content-management' 
            ? 'ContentManagement.tsv' 
            : 'DataPro.tsv';

        const tsvData = await this.loadTSV(filename);
        const parsed = this.parseTSV(tsvData);
        const baselineColumn = this.findBaselineColumn(parsed.headers);

        return {
            ...parsed,
            baselineColumn,
            contractType
        };
    }

    // Extract clauses from template data
    extractClauses(templateData) {
        const clauses = [];
        const { data, baselineColumn } = templateData;

        data.forEach((row, index) => {
            const clauseText = row[baselineColumn.header];
            
            if (clauseText && clauseText.trim()) {
                // Skip header/title entries
                if (clauseText.includes('DIGITAL VIDEO SERVICES AGREEMENT BETWEEN') ||
                    clauseText.includes('ARTICLE 1 INTERPRETATION') ||
                    row['Section'] === 'Title Page' ||
                    row['Section'] === 'Table of Contents' ||
                    row['Section'] === 'RECITALS') {
                    return;
                }

                clauses.push({
                    index,
                    articleNumber: row['Article Number'] || '',
                    clauseNumber: row['Clause Number'] || '',
                    section: row['Section'] || '',
                    title: row['Clause Title'] || '',
                    text: clauseText,
                    alternatives: this.extractAlternatives(row, baselineColumn.header)
                });
            }
        });

        return clauses;
    }

    // Extract alternative clauses from row data
    extractAlternatives(row, baselineHeader) {
        const alternatives = [];
        const headers = Object.keys(row);

        // Look for alternative columns (typically after baseline)
        headers.forEach(header => {
            if (header !== baselineHeader && 
                (header.includes('Alternative') || 
                 header.includes('Yoola') || 
                 header.includes('Sony') || 
                 header.includes('Lionsgate'))) {
                
                const altText = row[header];
                if (altText && altText.trim()) {
                    alternatives.push({
                        source: header,
                        text: altText.trim(),
                        riskLevel: this.assessRiskLevel(header, altText)
                    });
                }
            }
        });

        return alternatives;
    }

    // Assess risk level based on alternative source and content
    assessRiskLevel(source, text) {
        // Simple risk assessment based on source
        if (source.toLowerCase().includes('baseline')) return 'low';
        if (source.toLowerCase().includes('yoola')) return 'low';
        if (source.toLowerCase().includes('sony')) return 'medium';
        if (source.toLowerCase().includes('lionsgate')) return 'medium';
        
        // Content-based assessment (simplified)
        const highRiskTerms = ['unlimited', 'perpetual', 'irrevocable', 'exclusive'];
        const lowRiskTerms = ['limited', 'non-exclusive', 'revocable', 'term'];
        
        const lowerText = text.toLowerCase();
        const hasHighRisk = highRiskTerms.some(term => lowerText.includes(term));
        const hasLowRisk = lowRiskTerms.some(term => lowerText.includes(term));
        
        if (hasHighRisk && !hasLowRisk) return 'high';
        if (hasLowRisk && !hasHighRisk) return 'low';
        
        return 'medium';
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
        console.log('API cache cleared');
    }

    // Get cache statistics
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Create singleton instance
export const apiService = new ApiService();

// Utility functions for backward compatibility
export async function loadTSVFile(filename) {
    return await apiService.loadTSV(filename);
}

export function parseTSVData(tsvData) {
    return apiService.parseTSV(tsvData);
}

export async function loadContractTemplate(contractType) {
    return await apiService.loadContractTemplate(contractType);
}

export function extractClausesFromTemplate(templateData) {
    return apiService.extractClauses(templateData);
}
