# RHEI AI Legal Assistant - Continuation Guide

## Quick Start for New Chat Sessions

### Current Project State
- **Project**: RHEI AI Legal Assistant Word Add-in
- **Main Branch**: Stable modular architecture with working contract generation
- **Active Branch**: `update-clause` (clause replacement development)
- **Working File**: `taskpane-modular.html` (clean modular structure)
- **Local Server**: `node local-server.js` at https://localhost:3000
- **Manifest**: `manifest-localhost.xml` for Word Online testing

### Key Accomplishments
✅ **Contract Generation**: Fully working with TSV templates (ContentManagement.tsv, DataPro.tsv)  
✅ **Modular Architecture**: Clean 8-module structure replacing 2,500+ line monolithic file  
✅ **Project Cleanup**: 178+ old files archived to `project-archive/`  
✅ **Branch Structure**: Main (stable) + update-clause (development)  
✅ **Documentation**: Comprehensive guides and roadmaps created  

### Current Working Structure
```
src/
├── core/office-init.js          # Office.js initialization & error handling
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

## Development Context

### Company Information
- **Company**: RHEI Creations Inc.
- **Address**: 600-777 Hornby St, Vancouver, BC, Canada, V6Z1S4
- **Project**: Word add-in for contract analysis and generation
- **Target**: Office 365 organization with admin restrictions

### Technical Stack
- **Frontend**: HTML5, CSS3, ES6 JavaScript (modular)
- **Office Integration**: Office.js API, Word Online compatible
- **Data Format**: TSV files for contract templates and Legal Matrix
- **Development**: Local HTTPS server, git workflow
- **Deployment**: AWS infrastructure (Terraform configured)

### Key Features
1. **Contract Generation**: 
   - Dropdown selection (Content Management vs Data Pro)
   - Form fields for company/provider details
   - TSV-based clause parsing and insertion
   - Auto-generated table of contents and schedules

2. **Clause Replacement** (In Development):
   - Interactive clause selection in contracts
   - Legal Matrix alternatives (BASELINE, Yoola, Sony, Lionsgate)
   - Before/after preview and Word API integration

3. **Contract Analysis** (Planned):
   - Risk assessment and compliance checking
   - Track Changes integration
   - Executive summary generation

## Development Workflow

### Local Testing
```bash
# Start development server
node local-server.js

# Access application
https://localhost:3000/taskpane-modular.html

# Upload manifest in Word Online
manifest-localhost.xml
```

### Git Workflow
```bash
# Current branch
git branch  # Should show: update-clause

# Check status
git status

# Make changes and commit
git add .
git commit -m "feat: description"
git push origin update-clause
```

### File Organization
- **Active Files**: Root directory and `src/` (modular structure)
- **Archived Files**: `project-archive/` (old versions, debug files, etc.)
- **Documentation**: Multiple .md files with comprehensive guides
- **Templates**: `playbooks/*.tsv` (ContentManagement.tsv, DataPro.tsv)

## Next Development Priorities

### Phase 1: Clause Replacement Enhancement
1. **Document Analysis**: Read and parse existing Word documents
2. **TSV Integration**: Load real Legal Matrix alternatives
3. **Interactive Selection**: Click-to-select clauses with visual feedback
4. **Word API Integration**: Apply replacements with Track Changes

### Phase 2: User Experience
1. **Advanced UI**: Better modals and selection interfaces
2. **Risk Assessment**: Color-coded alternatives with explanations
3. **Batch Operations**: Multiple clause replacement workflows

### Phase 3: Production Readiness
1. **Testing**: Comprehensive unit and integration tests
2. **Performance**: Optimization for large documents
3. **Deployment**: AWS production deployment

## Important Notes

### User Preferences
- **Clean Architecture**: Prefers modular code over monolithic files
- **File Organization**: Archive old/unused files to keep workspace clean
- **UI Style**: Blue theme, Poppins/Segoe UI fonts, minimal interface
- **Development**: Local server preferred over GitHub Pages

### Technical Constraints
- **Office 365**: Admin restrictions require specific manifest formats
- **Word Online**: Must work in browser-based Word environment
- **HTTPS Required**: Local development needs HTTPS server
- **TSV Format**: Legal Matrix data in tab-separated values

### Key Files to Know
- `taskpane-modular.html`: Main application file
- `manifest-localhost.xml`: Working manifest for development
- `src/main.js`: Application entry point
- `CLAUSE_REPLACEMENT_ROADMAP.md`: Detailed development plan
- `project-archive/README.md`: What was archived and why

## Troubleshooting

### Common Issues
1. **Add-in Won't Load**: Check HTTPS server is running, manifest is correct
2. **Office.js Errors**: Verify Office.onReady() initialization in office-init.js
3. **TSV Parsing**: Check file encoding and tab separation in api-service.js
4. **Word API**: Ensure proper error handling in contract-generator.js

### Debug Tools
- Browser DevTools for JavaScript debugging
- Word Online developer tools
- Debug output in application UI
- Git history for reverting changes

This guide provides everything needed to continue development efficiently in new chat sessions.
