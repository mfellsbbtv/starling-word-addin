// Application Configuration

// API Configuration
export const API_CONFIG = {
  USE_REAL_API: false, // Toggle between real API and demo mode
  baseUrl: "https://api.starling-ai.com/v1",
  demoMode: true,
  endpoints: {
    analyze: "/analyze-contract",
    generate: "/generate-contract",
    suggestions: "/suggest-changes"
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Demo Data Configuration
export const DEMO_CONFIG = {
  // Contract templates for generation
  contractTemplates: {
    'content-management': {
      'music': {
        title: 'Music Content Management Agreement',
        baseContent: `MUSIC CONTENT MANAGEMENT AGREEMENT

This Music Content Management Agreement ("Agreement") is entered into on [DATE] between [ENTITY_NAME], a limited liability company ("Manager"), and [CONTENT_CREATOR] ("Artist").

1. SCOPE OF SERVICES
Manager agrees to provide comprehensive music content management services including:
- Digital distribution across all major streaming platforms
- Rights management and royalty collection
- Marketing and promotional campaigns
- Performance tracking and analytics

2. REVENUE SHARING
Artist and Manager agree to the following revenue split:
- Artist: [ARTIST_PERCENTAGE]%
- Manager: [MANAGER_PERCENTAGE]%

3. TERM AND TERRITORY
This Agreement shall remain in effect for [TERM_LENGTH] and covers [TERRITORY].

4. RIGHTS GRANTED
Artist grants Manager the right to manage [MUSIC_RIGHTS] for the specified territory and term.

5. TERMINATION
Either party may terminate this Agreement with [TERMINATION_NOTICE] days written notice.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

[SIGNATURE BLOCKS]`
      },
      'non-music': {
        title: 'Content Management Agreement',
        baseContent: `CONTENT MANAGEMENT AGREEMENT

This Content Management Agreement ("Agreement") is entered into on [DATE] between [ENTITY_NAME] ("Manager") and [CONTENT_CREATOR] ("Creator").

1. CONTENT MANAGEMENT SERVICES
Manager will provide comprehensive content management including:
- [CONTENT_TYPE] optimization and strategy
- Platform management for [PLATFORM_FOCUS]
- Brand partnership facilitation
- Revenue optimization and analytics

2. COMPENSATION
Revenue sharing: Creator [CREATOR_PERCENTAGE]%, Manager [MANAGER_PERCENTAGE]%

3. TERM AND SCOPE
Duration: [TERM_LENGTH]
Territory: [TERRITORY]

4. TERMINATION
[TERMINATION_NOTICE] days written notice required.

[SIGNATURE BLOCKS]`
      }
    }
  },

  // Analysis response templates
  analysisTemplates: {
    risks: [
      {
        severity: 'high',
        category: 'Missing Clause',
        title: 'No Termination Clause',
        description: 'Contract lacks clear termination conditions.',
        suggestion: 'Add comprehensive termination clause with notice periods.'
      },
      {
        severity: 'medium',
        category: 'Legal Risk',
        title: 'Liability Limitations',
        description: 'Consider adding liability limitation clauses.',
        suggestion: 'Include mutual liability caps and indemnification.'
      }
    ],
    suggestions: [
      {
        type: 'Language Improvement',
        priority: 'medium',
        title: 'Clarify Payment Terms',
        current: 'Payment terms are vague',
        suggested: 'Specify exact payment schedules and methods',
        benefit: 'Reduces payment disputes and improves cash flow'
      }
    ]
  }
};

// UI Configuration
export const UI_CONFIG = {
  animations: {
    fadeInDuration: 300,
    slideInDuration: 400,
    progressUpdateInterval: 200
  },
  
  themes: {
    default: 'office-light',
    supported: ['office-light', 'office-dark', 'office-colorful']
  },
  
  validation: {
    maxContractLength: 50000, // characters
    minContractLength: 100,   // characters
    requiredFields: ['agreement-type', 'content-type']
  }
};

// Feature Flags
export const FEATURES = {
  trackChanges: true,
  realTimeAnalysis: false,
  advancedSuggestions: true,
  contractGeneration: true,
  riskAnalysis: true
};

// AI Prompts Configuration
export const AI_PROMPTS = {
  contractReview: {
    systemPrompt: `You are an expert legal AI specialized in contract analysis. Given:

An active Microsoft Word document containing a commercial or legal contract.

A predefined company standard clauses database ("Standard Library") with negotiable and non-negotiable terms clearly marked.

Perform the following tasks step-by-step:

Contract Analysis:
- Identify and extract all Articles and Clauses from the active Word document.
- Clearly segment the contract into distinct clauses or sections.
- Use numbers to define each article and clause (e.g. the first article of the first clause would be 1.1, the first sub-clause would be 1.1.1. The second article would be 2, while the first clause of article 2 would be 2.1, and so on)

Clause Comparison:
- Compare each extracted clause against the corresponding clause from the Standard Library.
- Highlight deviations clearly using Word's Track Changes feature.

Deviation Summary:
- Provide a concise summary detailing each deviation from the Standard Library.
- Classify deviations into negotiable (flexible) and non-negotiable (must adhere strictly to the standard).

Improvement Recommendations:
- Suggest precise language revisions for clauses identified as negotiable to optimize the company's position.
- For non-negotiable clauses, recommend specific edits that restore compliance with the Standard Library.
- Quantify risks on current clauses and provide reasons for why the updated clause would be best.

Output Format:
- Generate the tracked-changes directly within the Word document.
- Provide a structured textual summary including:
  * Clause reference (number/title)
  * Brief description of the deviation
  * Negotiable/non-negotiable status
  * Recommended language improvements or restorations

Ensure the analysis is thorough, professional, and actionable. Maintain accuracy and clarity in recommendations, prioritizing the company's legal and commercial interests. The recommendations must align with best legal practices and strategic objectives defined in the Standard Library.`,

    userPromptTemplate: `Please analyze the following contract document:

CONTRACT TEXT:
{documentText}

CONTRACT TYPE: {contractType}

Please provide a comprehensive analysis following the system instructions above, with particular attention to:
1. Article and clause numbering (1, 1.1, 1.1.1, 2, 2.1, etc.)
2. Deviation classification (negotiable vs non-negotiable)
3. Risk quantification for each clause
4. Specific language recommendations

Return the analysis in the structured format specified.`
  },

  riskAssessment: {
    systemPrompt: `You are a legal risk assessment specialist. Analyze contracts for potential legal, financial, and operational risks.`,

    userPromptTemplate: `Assess the risks in this contract:

{documentText}

Focus on:
- Legal compliance risks
- Financial exposure
- Operational constraints
- Termination risks
- Liability issues

Provide risk severity (high/medium/low) and mitigation strategies.`
  },

  clauseImprovement: {
    systemPrompt: `You are a contract optimization expert. Suggest improvements to contract language that protect the company's interests while maintaining enforceability.`,

    userPromptTemplate: `Improve the following contract clauses:

{documentText}

For each clause, provide:
- Current language assessment
- Improved language suggestion
- Business benefit explanation
- Legal rationale`
  },

  contractGeneration: {
    systemPrompt: `You are a legal contract generation AI specialized in drafting commercial services agreements. Generate a complete, formalized contract document using the selected clause library ("playbook"). Include:

1. **Header, Title, and Preamble** with party names, effective date, and jurisdiction placeholders.
2. **Recitals** explaining the context and purpose.
3. **All Articles and Clauses** provided in the selected playbook.
4. **Standard Definitions, Term, Termination, and Boilerplate Sections**.
5. Include **Schedules or Exhibits** if referenced in clauses.
6. Use formal legal style and consistent numbering.
7. Output as clean text or structured data as needed by the system.
8. Allow dynamic insertion of variables such as:
   - {{EffectiveDate}}
   - {{ProviderName}}
   - {{RHEIAddress}}
   - {{GoverningLaw}}
   - {{TermLength}}

**OUTPUT EXPECTATIONS:**

- Full contract including:
  - Articles: Services, Obligations, Confidentiality, Term, Miscellaneous
  - Clause Numbering: Preserved (e.g. 2.1, 2.2, ..., 9.5)
  - Schedules: Appendix A (Channel Management), B (Content Dev), if invoked
- Clean formatting for contract lifecycle systems (e.g., Clause Library Matching, Redline Support)`,

    userPromptTemplate: `Generate a complete Services Agreement using the following parameters:

**PLAYBOOK**: {playbook}
**INCLUDE CLAUSES**: {includeClauses}
**FORMAT**: {format}
**PARTIES**:
  - Company: {companyName}
  - Counterparty: {counterpartyName}
**JURISDICTION**: {jurisdiction}
**INCLUDE SCHEDULES**: {includeSchedules}

**CONTRACT TYPE**: {contractType}
**CONTENT TYPE**: {contentType}

**FORM DATA**: {formData}

Please generate a complete contract following the system instructions above, ensuring:
1. All specified clauses are included in the range {includeClauses}
2. Output format matches {format} specification
3. All variables are properly substituted with provided values
4. Professional legal formatting and structure
5. Schedules/exhibits included if {includeSchedules} is true

Return the contract in the specified format with proper legal structure and numbering.`,

    // Default parameters for contract generation
    defaultParameters: {
      playbook: "Custom",
      includeClauses: "1.1-9.5",
      format: "FullText",
      companyName: "RHEI, Inc.",
      jurisdiction: "State of California",
      includeSchedules: true
    },

    // Supported playbooks
    supportedPlaybooks: ["Ninja Tune Ltd.", "WMX", "Sony", "Lionsgate", "Custom"],

    // Supported output formats
    supportedFormats: ["FullText", "StructuredJSON", "WordReady"],

    // Variable mapping between old and new format
    variableMapping: {
      // Old format -> New format
      "{effectiveDate}": "{{EffectiveDate}}",
      "{providerName}": "{{ProviderName}}",
      "{rheiAddress}": "{{RHEIAddress}}",
      "{governingLaw}": "{{GoverningLaw}}",
      "{termLength}": "{{TermLength}}",
      "{entityName}": "{{EntityName}}",
      "{contentCreator}": "{{ContentCreator}}",
      "{scopeDescription}": "{{ScopeDescription}}",
      "{revenueSplit}": "{{RevenueSplit}}",
      "{territory}": "{{Territory}}"
    }
  }
};
