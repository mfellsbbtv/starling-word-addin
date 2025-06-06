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
