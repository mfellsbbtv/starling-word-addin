/**
 * Contract Generator Service
 * Handles contract generation from TSV templates
 */

import { updateStatus, showProgress, hideProgress, showResults } from '../utils/ui-utils.js';

export async function generateContract() {
    console.log("🚀 GENERATE CONTRACT BUTTON CLICKED!");
    console.log("Current timestamp:", new Date().toISOString());
    
    // Visual confirmation that button was clicked
    updateStatus("Generate Contract button clicked! Processing...", "info");
    
    // Remove alert and continue with normal processing
    
    // Check if elements exist
    const contractTypeSelect = document.getElementById('contract-type-select');
    console.log("Contract type select element:", contractTypeSelect);
    console.log("Contract type value:", contractTypeSelect ? contractTypeSelect.value : 'NOT FOUND');
    
    showProgress("Generating contract from template...");
    console.log("Progress shown, starting generation...");

    try {
        // Get selected contract type from dropdown
        const selectedContractType = contractTypeSelect ? contractTypeSelect.value : 'content-management';
        console.log("Selected contract type:", selectedContractType);

        // Generate contract using direct TSV approach
        console.log("Calling generateContractFromTSV with type:", selectedContractType);
        const result = await generateContractFromTSV(selectedContractType);
        console.log("generateContractFromTSV result:", result);

        if (result.success) {
            updateStatus("Contract generated successfully!", "success");

            // If Word API is available, insert into document with formatting
            if (window.WORD_API_AVAILABLE && typeof Word !== 'undefined') {
                try {
                    await Word.run(async (context) => {
                        const body = context.document.body;
                        body.clear();

                        // Insert contract text
                        const contractRange = body.insertText(result.contract_text, Word.InsertLocation.start);

                        // Apply basic formatting with error handling
                        try {
                            contractRange.font.name = "Times New Roman";
                            contractRange.font.size = 12;

                            // Check if alignment property exists before setting
                            if (contractRange.paragraphFormat && typeof contractRange.paragraphFormat.alignment !== 'undefined') {
                                contractRange.paragraphFormat.alignment = Word.Alignment.justified;
                            }

                            if (contractRange.paragraphFormat) {
                                contractRange.paragraphFormat.lineSpacing = 18; // 1.5 line spacing
                                contractRange.paragraphFormat.spaceAfter = 6;
                                contractRange.paragraphFormat.keepWithNext = true;
                            }
                        } catch (formatError) {
                            console.log("Formatting not fully supported, using basic insertion:", formatError);
                        }

                        await context.sync();
                    });
                    updateStatus("Contract inserted into Word document!", "success");
                } catch (wordError) {
                    console.error("Word API error:", wordError);
                    updateStatus("Contract generated but couldn't insert into Word. See preview below.", "warning");
                    // Fall through to show preview
                }
            } else {
                // Demo mode - show contract in results section
                console.log("📋 Demo mode: showing contract in results section");
                console.log("WORD_API_AVAILABLE:", window.WORD_API_AVAILABLE);
                console.log("typeof Word:", typeof Word);
                
                const contractPreview = `
                    <h3>Generated Contract (Demo Mode)</h3>
                    <div class="contract-preview">
                        <pre style="white-space: pre-wrap; font-family: 'Times New Roman', serif; font-size: 12px; line-height: 1.5;">${result.contract_text}</pre>
                    </div>
                `;
                
                showResults(contractPreview);
                console.log("✅ Contract displayed in demo mode");
                updateStatus("Contract generated successfully (demo mode)", "success");
            }
        } else {
            throw new Error(result.error || 'Contract generation failed');
        }

    } catch (error) {
        console.error("Contract generation error:", error);
        updateStatus("Failed to generate contract: " + error.message, "error");
    } finally {
        hideProgress();
    }
}

// Direct contract generation from TSV
export async function generateContractFromTSV(contractType) {
    console.log("📄 generateContractFromTSV called with type:", contractType);
    try {
        let tsvData;

        // Load the appropriate TSV file
        console.log("Loading TSV file for contract type:", contractType);
        if (contractType === 'content-management') {
            console.log("Fetching ContentManagement.tsv...");
            const response = await fetch('./playbooks/ContentManagement.tsv');
            console.log("Fetch response status:", response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`Failed to load ContentManagement.tsv: ${response.status} ${response.statusText}`);
            }
            tsvData = await response.text();
            console.log("ContentManagement.tsv loaded, length:", tsvData.length);
        } else if (contractType === 'data-pro') {
            console.log("Fetching DataPro.tsv...");
            const response = await fetch('./playbooks/DataPro.tsv');
            console.log("Fetch response status:", response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`Failed to load DataPro.tsv: ${response.status} ${response.statusText}`);
            }
            tsvData = await response.text();
            console.log("DataPro.tsv loaded, length:", tsvData.length);
        } else {
            throw new Error(`Unknown contract type: ${contractType}`);
        }

        // Parse TSV data
        const lines = tsvData.split('\n');
        // Skip the first line (tier info) and use the second line as headers
        const headers = lines[1].split('\t');

        console.log('TSV Headers found:', headers);

        // Find the baseline clause text column
        let clauseTextColumn = -1;
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i].trim();
            console.log(`Checking header ${i}: "${header}"`);
            if (header.includes('Full Clause Text BASELINE') ||
                header.includes('Full Clause Text (Original)') ||
                header.includes('Clause Summary BASELINE') ||
                (header.toLowerCase().includes('baseline') && header.toLowerCase().includes('clause'))) {
                clauseTextColumn = i;
                console.log(`Found baseline column at index ${i}: "${header}"`);
                break;
            }
        }

        if (clauseTextColumn === -1) {
            console.log('Primary search failed, trying fallback...');
            if (headers.length > 6 && headers[6] && headers[6].includes('BASELINE')) {
                clauseTextColumn = 6;
                console.log(`Using fallback column 6: "${headers[6]}"`);
            } else {
                console.error('Available headers:', headers);
                throw new Error('Could not find baseline clause text column in TSV data');
            }
        }

        // Build the contract
        console.log("Building contract for type:", contractType);
        let contractText = '';

        if (contractType === 'content-management') {
            console.log("Calling buildContentManagementContract...");
            contractText = buildContentManagementContract(lines, clauseTextColumn);
            console.log("Content Management contract built, length:", contractText.length);
        } else if (contractType === 'data-pro') {
            console.log("Calling buildDataProContract...");
            contractText = buildDataProContract(lines, clauseTextColumn);
            console.log("Data Pro contract built, length:", contractText.length);
        }

        console.log("Contract text preview (first 200 chars):", contractText.substring(0, 200));

        const result = {
            success: true,
            contract_text: contractText,
            method: 'tsv_template'
        };
        
        console.log("Returning result:", { success: result.success, textLength: result.contract_text.length, method: result.method });
        return result;

    } catch (error) {
        console.error('Error generating contract from TSV:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

function buildContentManagementContract(lines, clauseTextColumn) {
    console.log("📋 buildContentManagementContract called");
    console.log("Lines count:", lines.length);
    console.log("Clause text column:", clauseTextColumn);
    
    // Get form data
    console.log("Getting form data...");
    const formData = getFormData();
    console.log("Form data:", formData);

    console.log("Formatting contract header...");
    let contract = formatContractHeader(formData);
    console.log("Header length:", contract.length);
    
    console.log("Generating recitals...");
    contract += generateRecitals(formData);
    console.log("After recitals length:", contract.length);

    // Process clauses from TSV (start from line 2 since line 1 is now headers)
    console.log("Processing clauses from TSV...");
    let clausesProcessed = 0;
    for (let i = 2; i < lines.length; i++) {
        const columns = lines[i].split('\t');
        if (columns.length > clauseTextColumn && columns[clauseTextColumn] && columns[clauseTextColumn].trim()) {
            const clauseText = columns[clauseTextColumn].trim();

            // Skip title page, table of contents, and recitals entries (we generate these)
            if (clauseText.includes('DIGITAL VIDEO SERVICES AGREEMENT BETWEEN') ||
                clauseText.includes('ARTICLE 1 INTERPRETATION') ||
                columns[0] === 'Title Page' ||
                columns[0] === 'Table of Contents' ||
                columns[0] === 'RECITALS') {
                console.log(`Skipping line ${i}: ${clauseText.substring(0, 50)}...`);
                continue;
            }

            // Add formatted clause with proper numbering
            const articleColumn = columns[1] || '';
            const clauseColumn = columns[2] || '';

            if (articleColumn && clauseColumn) {
                // Replace placeholder text with actual form data
                let processedClauseText = replacePlaceholders(clauseText, formData);
                contract += formatClause(articleColumn, clauseColumn, processedClauseText);
                clausesProcessed++;
                if (clausesProcessed <= 3) {
                    console.log(`Added clause ${articleColumn} ${clauseColumn}: ${clauseText.substring(0, 50)}...`);
                }
            }
        }
    }
    console.log(`Total clauses processed: ${clausesProcessed}`);

    console.log("Generating schedules...");
    contract += generateSchedules(formData);
    console.log("Final contract length:", contract.length);

    console.log("✅ buildContentManagementContract completed");
    return contract;
}

function buildDataProContract(lines, clauseTextColumn) {
    const formData = getFormData();

    let contract = `DATA LICENSE AGREEMENT

BETWEEN: ${formData.companyName}
AND: ${formData.providerName}

Effective Date: ${formData.effectiveDate}

`;

    // Process clauses from TSV (start from line 2 since line 1 is now headers)
    for (let i = 2; i < lines.length; i++) {
        const columns = lines[i].split('\t');
        if (columns.length > clauseTextColumn && columns[clauseTextColumn] && columns[clauseTextColumn].trim()) {
            const clauseText = columns[clauseTextColumn].trim();

            // Skip cover sheet entries that are already included
            if (clauseText.includes('This Data License Agreement') ||
                clauseText.includes('The following is to be completed')) {
                continue;
            }

            // Add section headers
            const sectionColumn = columns[2] || '';
            if (sectionColumn && sectionColumn.trim()) {
                contract += `${sectionColumn.toUpperCase()}\n`;
            }

            contract += clauseText + '\n\n';
        }
    }

    return contract;
}

function getFormData() {
    return {
        companyName: 'RHEI Creations Inc.',
        companyAddress: '600-777 Hornby St, Vancouver, BC, Canada, V6Z1S4',
        providerName: document.getElementById('provider-name')?.value || 'Provider Name, Inc.',
        providerAddress: document.getElementById('provider-address')?.value || 'Provider Address',
        effectiveDate: document.getElementById('effective-date')?.value || new Date().toLocaleDateString(),
        agreementTitle: document.getElementById('agreement-title')?.value || 'DIGITAL VIDEO SERVICES AGREEMENT'
    };
}

function formatContractHeader(formData) {
    return `${formData.agreementTitle}


BETWEEN:

${formData.companyName}
${formData.companyAddress}
("RHEI")

AND:

${formData.providerName}
${formData.providerAddress}
("Provider")

Effective Date: ${formData.effectiveDate}


`;
}

function generateRecitals(formData) {
    return `RECITALS

WHEREAS:
A. RHEI is a media and technology company that specializes in the optimization, monetization, claiming of video content and the management of online video channels;

B. Provider is engaged in the business of creating and distributing digital video content;

C. The parties wish to enter into this Agreement to set forth the terms and conditions under which RHEI will provide digital video services to Provider;

NOW THEREFORE THIS AGREEMENT WITNESSES that in consideration of the premises, the mutual covenants and agreements set forth in this Agreement and other good and valuable consideration (the receipt and sufficiency of which is hereby acknowledged by each of the parties), the parties hereby agree as follows:

`;
}

function formatClause(articleNumber, clauseNumber, clauseText) {
    // Ensure clause number stays with clause text (non-breaking)
    let formattedClause = '';

    // Add page break before new articles if needed
    if (articleNumber.startsWith('ARTICLE')) {
        formattedClause += '\n';
    }

    formattedClause += `${articleNumber} ${clauseNumber}\n${clauseText}\n\n`;
    return formattedClause;
}

function replacePlaceholders(text, formData) {
    return text
        .replace(/RHEI CREATIONS CORP\./g, formData.companyName)
        .replace(/NINJA TUNE LTD\./g, formData.providerName)
        .replace(/600-700 Hornby Street Vancouver, British Columbia, Canada V6Z 1S4/g, formData.companyAddress)
        .replace(/90 Kennington Ln, London SE11 4XD, UK/g, formData.providerAddress)
        .replace(/\[DATE\]/g, formData.effectiveDate)
        .replace(/\[EFFECTIVE DATE\]/g, formData.effectiveDate);
}

function generateSchedules(formData) {
    return `

SCHEDULES

SCHEDULE "A" – LIST OF MANAGED CHANNELS AND RHEI OWNED AND OPERATED CHANNELS

[To be completed by the parties]

SCHEDULE "B" – CHANNEL MANAGEMENT SERVICES

[To be completed based on specific services required]

SCHEDULE "C" – CONTENT DEVELOPMENT SERVICES

[To be completed based on specific content development requirements]

`;
}
