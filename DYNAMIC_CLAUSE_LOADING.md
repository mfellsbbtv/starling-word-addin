# 🔄 Dynamic Clause Loading by Contract Type

## Problem Solved

**Issue**: The Data Pro contract doesn't contain numbered clauses (like 1.1, 1.2, 2.1), so clause replacement wasn't working. The system was hardcoded to expect numbered clauses from the Content Management contract structure.

**Solution**: Implemented dynamic clause loading that adapts to different contract structures based on the selected contract type.

## ✅ What's Been Implemented

### 1. **Contract Type Detection**
- System now detects which contract type is selected (Content Management vs Data Pro)
- Automatically loads the appropriate clause structure
- Switches between different TSV files based on contract type

### 2. **Dynamic Clause Structure**
- **Content Management**: Uses numbered clauses (1.1, 1.2, 2.1, etc.)
- **Data Pro**: Uses descriptive section names (e.g., "Licensor Information", "Definitions", "Non-exclusive License")

### 3. **Adaptive Search Patterns**
- **Content Management**: Searches by clause numbers ("1.1", "1.1.", "1.1 ")
- **Data Pro**: Searches by section titles and keywords from clause titles

### 4. **Smart UI Adaptation**
- **Content Management Dropdown**: Shows "1.1 - Definitions"
- **Data Pro Dropdown**: Shows "Licensor Information" (no numbers)
- Compact titles adjust length based on contract type

## 🔧 Technical Implementation

### Files Modified:

#### 1. **`src/services/legal-matrix-service.js`**
- Added `currentContractType` and `contractTypeData` properties
- Added `switchContractType()` method
- Added `processDataProClauses()` method
- Enhanced `loadLegalMatrix()` to handle multiple contract types
- Updated `getAvailableClauseNumbers()` for different sorting logic

#### 2. **`src/features/clause-replacement.js`**
- Added `setupContractTypeListener()` function
- Updated search patterns to be contract-type aware
- Enhanced `createCompactTitle()` for different display formats
- Modified dropdown population for different contract structures

### Key Functions Added:

```javascript
// Switch between contract types
await legalMatrixService.switchContractType('data-pro');

// Get current contract type
const contractType = legalMatrixService.getCurrentContractType();

// Process Data Pro clauses (section-based)
processDataProClauses()

// Setup contract type change listener
setupContractTypeListener()
```

## 🎯 How It Works

### Contract Type Switching:
1. User selects contract type from dropdown
2. System detects the change via event listener
3. Loads appropriate TSV file (ContentManagement.tsv or DataPro.tsv)
4. Processes clauses using the correct structure
5. Repopulates clause dropdown with new options
6. Updates search patterns for clause replacement

### Data Pro Structure:
- **Sections**: "Cover Sheet", "Licensor Information", "Definitions", etc.
- **Identifiers**: Uses format like "Cover Sheet-3", "Cover Sheet-4"
- **Search**: Searches by section titles and keywords
- **Display**: Shows descriptive names without numbers

### Content Management Structure:
- **Clauses**: Numbered format (1.1, 1.2, 2.1, etc.)
- **Identifiers**: Uses actual clause numbers
- **Search**: Searches by clause numbers
- **Display**: Shows "1.1 - Definitions" format

## 📊 Contract Type Mapping

| Contract Type | TSV File | Clause Format | Search Method | Display Format |
|---------------|----------|---------------|---------------|----------------|
| **Content Management** | ContentManagement.tsv | 1.1, 1.2, 2.1 | By clause number | "1.1 - Definitions" |
| **Data Pro** | DataPro.tsv | Section names | By title keywords | "Licensor Information" |

## 🚀 User Experience

### Before:
- ❌ Data Pro contracts had no clause replacement options
- ❌ System only worked with numbered clauses
- ❌ Users couldn't replace clauses in Data Pro contracts

### After:
- ✅ **Automatic Detection**: System detects contract type and loads appropriate clauses
- ✅ **Seamless Switching**: Change contract type and clause options update automatically
- ✅ **Smart Search**: Finds clauses/sections regardless of numbering system
- ✅ **Adaptive UI**: Dropdown shows appropriate format for each contract type

## 🧪 Testing

### Test Content Management:
1. Select "Content Management" contract type
2. Generate contract
3. Select clause "1.1" from dropdown
4. Verify clause replacement works with numbered search

### Test Data Pro:
1. Select "Data Pro" contract type
2. Generate contract
3. Select "Licensor Information" from dropdown
4. Verify clause replacement works with title-based search

## 📈 Benefits

### For Users:
- ✅ **Universal Compatibility**: Works with both contract types
- ✅ **No Manual Setup**: Automatic detection and switching
- ✅ **Consistent Experience**: Same workflow regardless of contract structure
- ✅ **Smart Search**: Finds clauses even with different naming conventions

### For Development:
- ✅ **Extensible**: Easy to add new contract types
- ✅ **Maintainable**: Separate processing for each contract type
- ✅ **Robust**: Handles different clause structures gracefully
- ✅ **Future-Proof**: Can accommodate new contract formats

## 🔄 Future Enhancements

Potential improvements for future versions:
- **Auto-Detection**: Automatically detect contract type from document content
- **Custom Mappings**: Allow users to define custom clause mappings
- **Hybrid Contracts**: Support contracts with mixed numbering systems
- **Bulk Operations**: Replace multiple clauses across different contract types
- **Template Management**: Save and reuse clause replacement templates

## 📝 Usage Instructions

### For Content Management Contracts:
1. Select "Content Management" from contract type dropdown
2. Generate contract as usual
3. Use clause replacement with numbered clauses (1.1, 1.2, etc.)

### For Data Pro Contracts:
1. Select "Data Pro" from contract type dropdown
2. Generate contract as usual
3. Use clause replacement with section names ("Licensor Information", "Definitions", etc.)

The system now provides full clause replacement functionality for both contract types! 🎉
