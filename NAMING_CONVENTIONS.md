# Naming Conventions Guide

This document outlines the naming conventions used throughout the RHEI AI Legal Assistant codebase to ensure consistency and maintainability.

## JavaScript Naming Conventions

### Functions and Methods
- **Format**: camelCase
- **Examples**: 
  - `generateContract()`
  - `analyzeContract()`
  - `handleAgreementTypeChange()`
  - `displayContractResults()`

### Variables and Properties
- **Format**: camelCase
- **Examples**:
  - `contractText`
  - `formData`
  - `generationOptions`
  - `reviewResults`

### Constants
- **Format**: UPPER_SNAKE_CASE
- **Examples**:
  - `API_CONFIG`
  - `FORM_TEMPLATES`
  - `UI_CONFIG`
  - `DEMO_CONFIG`

### Classes
- **Format**: PascalCase
- **Examples**:
  - `APIService`
  - `PlaybookService`
  - `ContractReviewer`

## HTML/CSS Naming Conventions

### Element IDs
- **Format**: kebab-case
- **Examples**:
  - `generate-contract`
  - `analyze-contract`
  - `agreement-type`
  - `content-type`
  - `results-section`
  - `suggestions-section`

### CSS Classes
- **Format**: kebab-case
- **Examples**:
  - `.ms-Button`
  - `.ms-Button--primary`
  - `.status-message`
  - `.results-content`
  - `.clause-item`
  - `.modify-button`

### CSS Class Modifiers
- **Format**: kebab-case with double dashes for BEM-style modifiers
- **Examples**:
  - `.ms-Button--primary`
  - `.ms-Button--secondary`
  - `.status-message--error`
  - `.status-message--success`

## Form Data Naming Conventions

### Form Field Names
- **Format**: snake_case (for compatibility with backend systems)
- **Examples**:
  - `entity_name`
  - `content_creator`
  - `scope_description`
  - `revenue_split`
  - `term_length`
  - `governing_law`

### API Response Properties
- **Format**: snake_case (following REST API conventions)
- **Examples**:
  - `contract_text`
  - `generation_method`
  - `analysis_method`
  - `compliance_score`
  - `risk_level`

## File and Directory Naming

### JavaScript Files
- **Format**: kebab-case
- **Examples**:
  - `contract-generator.js`
  - `contract-analyzer.js`
  - `event-handlers.js`
  - `ui-display.js`
  - `api-service.js`

### CSS Files
- **Format**: kebab-case
- **Examples**:
  - `taskpane.css`
  - `components.css`

### HTML Files
- **Format**: kebab-case
- **Examples**:
  - `taskpane.html`
  - `debug-contract.html`
  - `test-contract-generation.html`

## Event Handler Naming

### Event Handler Functions
- **Format**: camelCase with descriptive prefixes
- **Examples**:
  - `handleAgreementTypeChange()`
  - `handleContentTypeChange()`
  - `safeGenerateContract()`
  - `safeAnalyzeContract()`

### Global Window Functions
- **Format**: camelCase
- **Examples**:
  - `window.generateContract`
  - `window.analyzeContract`
  - `window.acceptAllChanges`
  - `window.toggleAutoUpdate`

## Button and UI Element Conventions

### Button IDs
- **Pattern**: `{action}-{target}` or `{feature}-{action}`
- **Examples**:
  - `generate-contract`
  - `analyze-contract`
  - `test-word-api`
  - `show-diagnostics`
  - `clear-results`
  - `clear-suggestions`

### Section IDs
- **Pattern**: `{content}-section`
- **Examples**:
  - `results-section`
  - `suggestions-section`
  - `progress-section`
  - `generate-button-group`

## Data Structure Naming

### Object Properties
- **JavaScript Objects**: camelCase
- **API Responses**: snake_case
- **Form Data**: snake_case

### Example:
```javascript
// JavaScript object (camelCase)
const generationOptions = {
  includeTableOfContents: true,
  includeSchedules: true,
  revenueModel: "baseline"
};

// API response (snake_case)
const apiResponse = {
  success: true,
  contract_text: "...",
  generation_method: "rhei_playbook",
  metadata: {
    generated_at: "2024-01-01T00:00:00Z"
  }
};

// Form data (snake_case)
const formData = {
  agreement_type: "content-management",
  content_type: "music",
  fields: {
    entity_name: "RHEI Corp",
    content_creator: "Artist Name"
  }
};
```

## Best Practices

### 1. Consistency Within Context
- Use the same naming convention throughout a single file or module
- Match the conventions of the framework or library being used

### 2. Descriptive Names
- Use clear, descriptive names that indicate purpose
- Avoid abbreviations unless they are widely understood

### 3. Prefix Conventions
- Use `safe` prefix for functions that include error handling
- Use `handle` prefix for event handlers
- Use `generate` prefix for content creation functions
- Use `display` prefix for UI rendering functions

### 4. Avoid Name Conflicts
- Check for existing names before adding new ones
- Use namespacing for global functions
- Prefer specific over generic names

### 5. Documentation
- Document any deviations from these conventions
- Update this guide when new patterns are established
- Include examples for complex naming scenarios

## Validation Checklist

Before committing code, verify:
- [ ] All function names use camelCase
- [ ] All CSS classes use kebab-case
- [ ] All HTML IDs use kebab-case
- [ ] All constants use UPPER_SNAKE_CASE
- [ ] Form field names use snake_case
- [ ] File names use kebab-case
- [ ] No naming conflicts exist
- [ ] Names are descriptive and clear
