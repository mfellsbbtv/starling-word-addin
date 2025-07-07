# Project Archive

This directory contains files that were archived during the modularization of the RHEI AI Legal Assistant Word Add-in project.

## Archive Date
**Date**: December 2024  
**Reason**: Project modularization and cleanup  
**Branch**: update-clause  

## Archived Files and Directories

### Old HTML Files (Replaced by Modular Structure)
- `taskpane-fixed.html` - Previous monolithic HTML file (2,500+ lines)
- `taskpane-minimal.html` - Minimal version for testing
- `taskpane-ultra-minimal.html` - Ultra-minimal test version
- `taskpane-debug.html` - Debug version

**Replacement**: `taskpane-modular.html` with modular architecture

### Debug and Test Files
- `debug-*.html` - Various debug HTML files
- `debug-*.js` - Debug JavaScript files
- `test-*.html` - Test HTML files
- `test-*.js` - Test JavaScript files
- `simple-*.html` - Simple test files
- `simple-*.js` - Simple test scripts
- `minimal-test.html` - Minimal test file
- `verify-naming-consistency.js` - Naming verification script

**Status**: No longer needed with new modular testing approach

### Old Manifest Files
- `manifest-fixed-version.xml`
- `manifest-new-guid.xml`
- `manifest-rhei-basic.xml`
- `manifest-rhei-updated.xml`
- `manifest-simple-working.xml`
- `manifest-test-basic.xml`
- `manifest-ultra-simple.xml`
- `manifest-working-fixed.xml`
- `manifest-dev-github-test.xml`
- `src/manifest-*.xml` - Old manifest files in src directory

**Replacement**: `manifest-localhost.xml` (current working manifest)

### Old Source Code Structure
- `src/taskpane/` - Old taskpane structure
  - `modules/` - Old module system
  - `services/` - Old service files
  - `taskpane.html`, `taskpane.js`, `taskpane.css` - Old files
- `src/shared/` - Old shared utilities
  - `api-service.js`
  - `config.js`
  - `playbook-service.js`
  - `utils.js`
- `src/commands/` - Old command structure
- `src/config/` - Old configuration files

**Replacement**: New modular structure in `src/core/`, `src/services/`, `src/features/`, `src/utils/`

### Old Service Files
- `src/services/excel-*.js` - Excel integration services (not currently used)
- `src/services/legal-matrix-*.js` - Old Legal Matrix services
- `src/services/pattern-matching-service.js` - Pattern matching service

**Status**: Functionality integrated into new modular services

### Old Playbook Structure
- `playbooks/_templates/` - JSON template files
- `playbooks/content-management/` - Old JSON-based content management playbooks
- `playbooks/data-pro/` - Old JSON-based data pro playbooks

**Replacement**: TSV-based playbooks (`ContentManagement.tsv`, `DataPro.tsv`)

### Temporary Files
- `ConsoleOutPut.txt` - Console output from debugging sessions
- `Legal Matrix - Test.tsv` - Test TSV file

**Status**: Temporary files no longer needed

## Current Active Structure

### Main Files
- `taskpane-modular.html` - Main HTML file with clean structure
- `manifest-localhost.xml` - Working manifest for local development
- `local-server.js` - Local HTTPS server

### Modular Source Code
```
src/
├── core/office-init.js          # Office.js initialization
├── services/
│   ├── api-service.js           # Data fetching & TSV parsing
│   └── contract-generator.js    # Contract generation logic
├── features/
│   ├── clause-replacement.js    # Clause replacement functionality
│   └── contract-analysis.js     # Contract analysis & compliance
├── utils/ui-utils.js            # UI helpers & DOM utilities
├── styles/main.css              # All CSS styles
└── main.js                      # Application entry point
```

### Active Playbooks
- `playbooks/ContentManagement.tsv` - Content Management agreement template
- `playbooks/DataPro.tsv` - Data Pro agreement template

### Documentation
- `MODULAR_STRUCTURE.md` - Documentation of new modular architecture
- `CLAUSE_REPLACEMENT_ROADMAP.md` - Development roadmap for clause replacement

## Recovery Instructions

If any archived files are needed:

1. **Individual Files**: Copy specific files back to the main project directory
2. **Old Structure**: The old monolithic structure can be restored from `taskpane-fixed.html`
3. **Git History**: All files are preserved in git history before archiving

## Notes

- All functionality from archived files has been preserved in the new modular structure
- The new structure is more maintainable and easier to develop
- Contract generation is confirmed working in the modular version
- Clause replacement development continues on the `update-clause` branch

## Archive Verification

To verify the archive is complete, check that:
- [ ] Main project directory is clean and organized
- [ ] Only active, current files remain in the main directory
- [ ] All old/unused files are properly archived here
- [ ] New modular structure is working correctly
- [ ] Git history preserves all changes
