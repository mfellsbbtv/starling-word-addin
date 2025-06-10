# 📚 RHEI AI Legal Assistant - Playbooks System

## 🎯 **Overview**

This directory contains structured playbooks for each contract type. Playbooks define the templates, clauses, risk assessments, and generation logic for specific contract types.

## 📁 **Directory Structure**

```
playbooks/
├── README.md                           ← This file
├── content-management/                 ← Content Management Agreement playbooks
│   ├── music/                         ← Music-specific playbooks
│   │   ├── template.json              ← Contract template
│   │   ├── clauses.json               ← Standard clauses library
│   │   ├── risk-rules.json            ← Risk assessment rules
│   │   └── form-fields.json           ← Dynamic form configuration
│   ├── non-music/                     ← Non-music content playbooks
│   │   ├── template.json
│   │   ├── clauses.json
│   │   ├── risk-rules.json
│   │   └── form-fields.json
│   └── both/                          ← Mixed content playbooks
│       ├── template.json
│       ├── clauses.json
│       ├── risk-rules.json
│       └── form-fields.json
├── licensing/                          ← Licensing Agreement playbooks
│   ├── music/
│   ├── non-music/
│   └── both/
├── distribution/                       ← Distribution Agreement playbooks
│   ├── music/
│   ├── non-music/
│   └── both/
├── talent/                            ← Talent Agreement playbooks
│   ├── music/
│   ├── non-music/
│   └── both/
└── _templates/                        ← Template files for creating new playbooks
    ├── template.json.template
    ├── clauses.json.template
    ├── risk-rules.json.template
    └── form-fields.json.template
```

## 🔧 **Playbook Components**

### **1. template.json**
Defines the contract template structure and content generation logic.

### **2. clauses.json**
Contains the standard clauses library for contract analysis and comparison.

### **3. risk-rules.json**
Defines risk assessment rules and compliance checking logic.

### **4. form-fields.json**
Configures the dynamic form fields for contract generation.

## 📋 **Usage Instructions**

### **For Developers:**
1. **Load playbooks** using the `PlaybookLoader` service
2. **Access templates** via `PlaybookService.getTemplate(agreementType, contentType)`
3. **Get clauses** via `PlaybookService.getClauses(agreementType, contentType)`
4. **Run risk analysis** via `PlaybookService.assessRisks(contract, agreementType, contentType)`

### **For Legal Team:**
1. **Review dummy playbooks** to understand the structure
2. **Prepare real playbooks** following the same JSON format
3. **Drop in new files** to replace dummy content
4. **Test functionality** with real contract data

## 🚀 **Integration Points**

### **Contract Generator:**
- Uses `template.json` for contract generation
- Uses `form-fields.json` for dynamic form creation

### **Contract Analyzer:**
- Uses `clauses.json` for standard library comparison
- Uses `risk-rules.json` for risk assessment

### **AI Prompts:**
- Uses playbook data to enhance AI prompt context
- Provides contract-specific guidance to AI models

## 📝 **Adding New Contract Types**

1. **Create directory structure** following the pattern above
2. **Copy template files** from `_templates/` directory
3. **Customize content** for the specific contract type
4. **Update configuration** in `src/shared/config.js`
5. **Test integration** with the application

## 🔄 **Updating Existing Playbooks**

1. **Backup current files** before making changes
2. **Update JSON files** with new content
3. **Validate JSON syntax** before deployment
4. **Test functionality** to ensure compatibility
5. **Deploy changes** to production

## ⚠️ **Important Notes**

- **JSON Format**: All playbook files must be valid JSON
- **Consistent Structure**: Follow the established schema for compatibility
- **Validation**: Test playbooks thoroughly before production deployment
- **Backup**: Always backup existing playbooks before updates
- **Documentation**: Update this README when adding new contract types

## 🎯 **Current Status**

- ✅ **Dummy playbooks created** for all existing contract types
- ✅ **Integration points established** in the application
- ✅ **Template system ready** for real playbook deployment
- 🔄 **Ready for legal team** to provide real playbook content

---

**Next Steps**: Review dummy playbooks and prepare real content following the established structure.
