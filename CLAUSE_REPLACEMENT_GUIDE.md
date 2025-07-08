# Clause Replacement Functionality Guide

## Overview

The RHEI AI Legal Assistant now includes comprehensive clause replacement functionality that allows users to:

1. **Select clauses from a dropdown** - Choose from all available clauses in the Legal Matrix
2. **View current clause content** - See the baseline clause text and summary
3. **Browse alternative clauses** - Review alternatives from different providers (MNRK, WMX, Sony, Create Music Group, Lionsgate)
4. **Preview replacements** - See before/after comparison of clause changes
5. **Apply replacements** - Replace clauses directly in Word documents

## Features

### 🎯 Clause Selection Interface
- **Dropdown Selection**: Choose from all available clauses (1.1, 1.2, 2.1, etc.)
- **Clause Titles**: Each option shows both clause number and descriptive title
- **Dynamic Loading**: Clauses are loaded from the Legal Matrix TSV file

### 📋 Clause Details Display
- **Current Clause**: Shows the baseline clause content from Ninja Tune Ltd.
- **Clause Summary**: Brief description of what the clause covers
- **Clause Number Badge**: Visual indicator of the selected clause

### 🔄 Alternative Clauses
- **Multiple Sources**: Alternatives from MNRK, WMX, Sony, Create Music Group, Lionsgate
- **Risk Assessment**: Each alternative shows risk level (Low, Medium, High)
- **Recommended Badges**: Highlights recommended alternatives
- **Content Preview**: Truncated view of alternative clause text
- **Source Attribution**: Shows which provider the alternative comes from

### 👀 Preview Functionality
- **Before/After Comparison**: Side-by-side view of current vs. replacement clause
- **Risk Summary**: Shows risk level and recommendation status
- **Source Information**: Details about the alternative clause source

### ⚡ Word API Integration
- **Direct Replacement**: Replaces clauses directly in Word documents
- **Smart Search**: Finds clauses by number in the document
- **Fallback Insertion**: Adds clauses at document end if not found
- **Formatting**: Applies consistent Times New Roman, 12pt formatting

## Technical Implementation

### Core Components

#### 1. Legal Matrix Service (`src/services/legal-matrix-service.js`)
```javascript
// Loads and parses the Legal Matrix TSV file
await legalMatrixService.loadLegalMatrix();

// Get available clause numbers
const clauseNumbers = legalMatrixService.getAvailableClauseNumbers();

// Get specific clause data
const clause = legalMatrixService.getClause('1.1');
```

#### 2. Clause Replacement Module (`src/features/clause-replacement.js`)
```javascript
// Initialize the clause replacement interface
await initializeClauseReplacement();

// Handle clause selection
handleClauseSelection(event);

// Preview and apply replacements
previewClauseReplacement();
applyClauseReplacement();
```

#### 3. UI Components (`taskpane-modular.html`)
- Clause selection dropdown
- Current clause display area
- Alternatives list with selection
- Preview and apply buttons

### Data Structure

The Legal Matrix TSV file contains:
- **Clause Number**: Unique identifier (1.1, 1.2, etc.)
- **Title**: Descriptive name of the clause
- **Summary**: Brief explanation of clause purpose
- **Baseline Content**: Standard clause text (Ninja Tune Ltd.)
- **Alternatives**: Variations from different providers

### Styling

Custom CSS classes for clause replacement:
- `.clause-replacement-section`: Main container
- `.clause-details`: Clause information display
- `.alternative-item`: Individual alternative option
- `.clause-number-badge`: Visual clause number indicator
- `.risk-badge`: Risk level indicator
- `.recommended-badge`: Recommendation indicator

## Usage Instructions

### For Users

1. **Select a Clause**
   - Open the RHEI AI Legal Assistant in Word
   - Navigate to the "Clause Replacement" section
   - Choose a clause from the dropdown menu

2. **Review Current Clause**
   - Read the current clause content and summary
   - Understand what the clause covers

3. **Browse Alternatives**
   - Scroll through available alternatives
   - Note risk levels and recommendations
   - Click on an alternative to select it

4. **Preview Changes**
   - Click "Preview Replacement" to see before/after comparison
   - Review the risk assessment and source information
   - Confirm the change is appropriate

5. **Apply Replacement**
   - Click "Apply Replacement" to update the Word document
   - The clause will be replaced automatically
   - Success message confirms the change

### For Developers

1. **Adding New Alternatives**
   - Update the Legal Matrix TSV file
   - Add new provider columns
   - Include risk assessments

2. **Customizing Risk Levels**
   - Modify risk assessment logic in `legal-matrix-service.js`
   - Update risk color coding in CSS
   - Adjust recommendation criteria

3. **Extending Word API Integration**
   - Enhance clause search patterns
   - Add more sophisticated formatting
   - Implement batch replacement features

## File Structure

```
src/
├── features/
│   └── clause-replacement.js     # Main clause replacement logic
├── services/
│   └── legal-matrix-service.js   # Legal Matrix data handling
├── styles/
│   └── main.css                  # Styling for clause replacement UI
└── main.js                       # Application initialization

playbooks/
└── Legal agent - RHEI (Tier 1-4) - Clause Matrix for Tier 1 & 2 RHEI Contracts.tsv

taskpane-modular.html             # Main UI with clause replacement section
test-clause-replacement.html      # Test page for functionality verification
```

## Testing

### Test Page
Access `https://localhost:3000/test-clause-replacement.html` to:
- Test Legal Matrix loading
- Verify clause parsing
- Check dropdown population
- Test alternative selection

### Debug Tools
Use the debug section in the main application:
- "Test Clause Replacement" button
- Console logging for troubleshooting
- Status messages for user feedback

## Future Enhancements

1. **Batch Replacement**: Replace multiple clauses at once
2. **Clause Comparison**: Side-by-side comparison of multiple alternatives
3. **Custom Alternatives**: Allow users to create custom clause variations
4. **Risk Analysis**: Advanced risk scoring and recommendations
5. **Version History**: Track clause replacement history
6. **Export Options**: Export clause alternatives to different formats

## Troubleshooting

### Common Issues

1. **Legal Matrix Not Loading**
   - Check TSV file path and format
   - Verify server is serving static files
   - Check browser console for errors

2. **No Alternatives Showing**
   - Verify TSV file has alternative columns
   - Check data parsing logic
   - Ensure alternatives have content

3. **Word API Not Working**
   - Confirm Word Online environment
   - Check Office.js initialization
   - Verify add-in permissions

### Error Messages

- "Error loading clause database" - TSV file loading failed
- "No clause or alternative selected" - Selection state issue
- "Clause replacement simulated" - Word API not available
- "No alternatives available" - No valid alternatives found

## Support

For technical support or feature requests:
1. Check console logs for detailed error information
2. Verify all files are properly loaded
3. Test with the dedicated test page
4. Review the Legal Matrix TSV file format
