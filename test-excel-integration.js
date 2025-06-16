// Test Excel Integration - Analyze Legal Matrix Excel file structure
// Run this in browser console or Node.js to test Excel file parsing

// Import our Excel services (adjust paths as needed)
import { excelFileReader } from './src/services/excel-file-reader.js';
import { excelTrainingService } from './src/services/excel-training-service.js';
import { patternMatchingService } from './src/services/pattern-matching-service.js';

/**
 * Test Excel file integration with Legal Matrix file
 */
async function testExcelIntegration() {
  console.log("🧪 Testing Excel Integration with Legal Matrix file...");
  
  try {
    // Test 1: Read demo Excel structure
    console.log("\n📊 Test 1: Reading demo Excel structure...");
    const demoData = excelFileReader.getDemoExcelData();
    const validatedDemo = excelFileReader.validateExcelStructure(demoData);
    
    console.log("Demo data validation:", validatedDemo.metadata);
    console.log("Contract templates found:", validatedDemo.contractTemplates.length);
    console.log("Clause library entries:", validatedDemo.clauseLibrary.length);
    console.log("Risk rules:", validatedData.riskRules.length);
    
    // Test 2: Load into training service
    console.log("\n🎯 Test 2: Loading into training service...");
    await excelTrainingService.loadExcelTrainingData(validatedDemo);
    
    // Test 3: Generate contract using Excel data
    console.log("\n📝 Test 3: Generating contract from Excel data...");
    const testFormData = {
      agreement_type: 'content-management',
      content_type: 'music',
      fields: {
        company_name: 'RHEI, Inc.',
        provider_name: 'Test Music LLC',
        artist_percentage: 80,
        manager_percentage: 20,
        term_length: '3 years'
      }
    };
    
    const generatedContract = await excelTrainingService.generateContractFromExcel(
      testFormData.agreement_type,
      testFormData.content_type,
      testFormData.fields
    );
    
    console.log("Generated contract preview:", generatedContract.substring(0, 200) + "...");
    
    // Test 4: Pattern matching analysis
    console.log("\n🔍 Test 4: Testing pattern matching...");
    await patternMatchingService.initialize(validatedDemo);
    
    const testContract = `
      MUSIC CONTENT MANAGEMENT AGREEMENT
      
      This agreement is between RHEI Inc. and Artist Name.
      
      1. SERVICES
      Manager will provide music management services.
      
      2. COMPENSATION
      Revenue split: 80% Artist, 20% Manager.
      
      3. TERM
      This agreement is effective for 3 years.
    `;
    
    const detectedRisks = patternMatchingService.detectRisks(testContract);
    const matchingClauses = patternMatchingService.findMatchingClauses(testContract);
    const contractContext = patternMatchingService.determineContractContext(testContract);
    
    console.log("Detected risks:", detectedRisks.length);
    console.log("Matching clauses:", matchingClauses.length);
    console.log("Contract context:", contractContext);
    
    // Test 5: Generate validation report
    console.log("\n📋 Test 5: Generating validation report...");
    const validationReport = excelFileReader.generateValidationReport(validatedDemo);
    console.log("Validation report:", validationReport);
    
    console.log("\n✅ All tests completed successfully!");
    return {
      success: true,
      demoData: validatedDemo,
      generatedContract,
      detectedRisks,
      matchingClauses,
      contractContext,
      validationReport
    };
    
  } catch (error) {
    console.error("❌ Test failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test CSV parsing with sample data
 */
function testCSVParsing() {
  console.log("\n📄 Testing CSV parsing...");
  
  const sampleCSV = `ContractType,ContentType,Section,Order,Title,Content,Required,Variables
content-management,music,preamble,1,PREAMBLE,"This Music Content Management Agreement is entered into between {{CompanyName}} and {{ProviderName}}.",TRUE,"CompanyName,ProviderName"
content-management,music,services,2,SCOPE OF SERVICES,"Manager will provide comprehensive music management including distribution, marketing, and rights management.",TRUE,ServiceScope
content-management,music,compensation,3,COMPENSATION,"Revenue split: Artist {{ArtistPercentage}}% - Manager {{ManagerPercentage}}%",TRUE,"ArtistPercentage,ManagerPercentage"`;
  
  try {
    const parsedCSV = excelFileReader.parseCSVText(sampleCSV);
    console.log("CSV parsing successful!");
    console.log("Rows parsed:", parsedCSV.ContractTemplates.length);
    console.log("Sample row:", parsedCSV.ContractTemplates[0]);
    
    return parsedCSV;
  } catch (error) {
    console.error("CSV parsing failed:", error);
    return null;
  }
}

/**
 * Test JSON structure validation
 */
function testJSONValidation() {
  console.log("\n🔧 Testing JSON validation...");
  
  const sampleJSON = {
    ContractTemplates: [
      {
        ContractType: 'content-management',
        ContentType: 'music',
        Section: 'preamble',
        Order: 1,
        Title: 'PREAMBLE',
        Content: 'This agreement...',
        Required: true,
        Variables: 'CompanyName,ProviderName'
      }
    ],
    ClauseLibrary: [
      {
        ClauseID: 'termination_standard',
        Category: 'termination',
        Title: 'Standard Termination',
        Content: 'Either party may terminate...',
        RiskLevel: 'low',
        Negotiable: true,
        Keywords: 'termination,terminate,end',
        Alternatives: 'termination_extended'
      }
    ]
  };
  
  try {
    const validated = excelFileReader.validateExcelStructure(sampleJSON);
    console.log("JSON validation successful!");
    console.log("Validation errors:", validated.metadata.validationErrors.length);
    
    return validated;
  } catch (error) {
    console.error("JSON validation failed:", error);
    return null;
  }
}

/**
 * Generate sample Excel structure for Legal Matrix
 */
function generateSampleExcelStructure() {
  console.log("\n📊 Generating sample Excel structure for Legal Matrix...");
  
  return {
    ContractTemplates: [
      {
        ContractType: 'content-management',
        ContentType: 'music',
        Section: 'preamble',
        Order: 1,
        Title: 'PREAMBLE',
        Content: 'This Music Content Management Agreement ("Agreement") is entered into on {{EffectiveDate}} between {{CompanyName}}, a corporation ("Company"), and {{ProviderName}}, an individual or entity ("Artist").',
        Required: 'TRUE',
        Variables: 'EffectiveDate,CompanyName,ProviderName'
      },
      {
        ContractType: 'content-management',
        ContentType: 'music',
        Section: 'services',
        Order: 2,
        Title: 'SCOPE OF SERVICES',
        Content: 'Company agrees to provide comprehensive music content management services including: (a) digital distribution across all major streaming platforms; (b) rights management and royalty collection; (c) marketing and promotional campaigns; (d) performance tracking and analytics.',
        Required: 'TRUE',
        Variables: 'ServiceScope'
      },
      {
        ContractType: 'content-management',
        ContentType: 'music',
        Section: 'compensation',
        Order: 3,
        Title: 'COMPENSATION AND REVENUE SHARING',
        Content: 'Net revenues shall be divided as follows: Artist shall receive {{ArtistPercentage}}% and Company shall receive {{ManagerPercentage}}% of all net revenues derived from the exploitation of the musical works.',
        Required: 'TRUE',
        Variables: 'ArtistPercentage,ManagerPercentage'
      },
      {
        ContractType: 'content-management',
        ContentType: 'music',
        Section: 'term',
        Order: 4,
        Title: 'TERM AND TERMINATION',
        Content: 'This Agreement shall commence on {{EffectiveDate}} and continue for a period of {{TermLength}}. Either party may terminate this Agreement upon {{TerminationNotice}} days written notice.',
        Required: 'TRUE',
        Variables: 'EffectiveDate,TermLength,TerminationNotice'
      }
    ],
    ClauseLibrary: [
      {
        ClauseID: 'termination_standard',
        Category: 'termination',
        Title: 'Standard Termination Clause',
        Content: 'Either party may terminate this Agreement upon thirty (30) days written notice to the other party.',
        RiskLevel: 'low',
        Negotiable: 'TRUE',
        Keywords: 'termination,terminate,end,notice,thirty,30',
        Alternatives: 'termination_extended|termination_immediate'
      },
      {
        ClauseID: 'revenue_split_standard',
        Category: 'compensation',
        Title: 'Standard Revenue Split',
        Content: 'Net revenues shall be divided equally between the parties.',
        RiskLevel: 'medium',
        Negotiable: 'TRUE',
        Keywords: 'revenue,split,compensation,payment,percentage',
        Alternatives: 'revenue_split_artist_favor|revenue_split_company_favor'
      },
      {
        ClauseID: 'liability_limitation',
        Category: 'liability',
        Title: 'Liability Limitation',
        Content: 'In no event shall either party be liable for any indirect, incidental, special, or consequential damages.',
        RiskLevel: 'high',
        Negotiable: 'FALSE',
        Keywords: 'liability,damages,limitation,indirect,consequential',
        Alternatives: 'liability_unlimited'
      }
    ],
    RiskRules: [
      {
        RuleID: 'missing_termination',
        Category: 'missing_clauses',
        Severity: 'high',
        Title: 'Missing Termination Clause',
        Description: 'Contract lacks clear termination conditions and procedures',
        Keywords: 'termination,terminate,end,expiry,notice',
        Pattern: '',
        Action: 'suggest_clause',
        Recommendation: 'Add comprehensive termination clause specifying conditions, notice periods, and post-termination obligations'
      },
      {
        RuleID: 'vague_compensation',
        Category: 'compensation_issues',
        Severity: 'medium',
        Title: 'Vague Compensation Terms',
        Description: 'Compensation terms are not sufficiently detailed',
        Keywords: 'payment,compensation,fee,revenue,split',
        Pattern: '(?i)(payment|compensation|fee)(?!.*\\d+%?)(?!.*specific)',
        Action: 'flag',
        Recommendation: 'Specify exact payment amounts, percentages, and payment schedules'
      },
      {
        RuleID: 'no_liability_cap',
        Category: 'liability_issues',
        Severity: 'high',
        Title: 'No Liability Limitation',
        Description: 'Contract lacks liability limitation clauses',
        Keywords: 'liability,damages,limitation,cap,limit',
        Pattern: '',
        Action: 'suggest_clause',
        Recommendation: 'Add liability limitation clause to protect company interests and limit exposure'
      }
    ],
    VariableMappings: [
      {
        FieldName: 'company_name',
        DisplayName: 'Company Name',
        Type: 'text',
        Required: 'TRUE',
        DefaultValue: 'RHEI, Inc.',
        Validation: 'required',
        Transformation: 'uppercase'
      },
      {
        FieldName: 'provider_name',
        DisplayName: 'Provider/Artist Name',
        Type: 'text',
        Required: 'TRUE',
        DefaultValue: 'Provider Name, Inc.',
        Validation: 'required',
        Transformation: 'titlecase'
      },
      {
        FieldName: 'artist_percentage',
        DisplayName: 'Artist Revenue Percentage',
        Type: 'number',
        Required: 'TRUE',
        DefaultValue: '80',
        Validation: 'range:50-95',
        Transformation: 'number'
      },
      {
        FieldName: 'manager_percentage',
        DisplayName: 'Manager Revenue Percentage',
        Type: 'number',
        Required: 'TRUE',
        DefaultValue: '20',
        Validation: 'range:5-50',
        Transformation: 'number'
      },
      {
        FieldName: 'term_length',
        DisplayName: 'Contract Term Length',
        Type: 'text',
        Required: 'TRUE',
        DefaultValue: '3 years',
        Validation: 'required',
        Transformation: 'lowercase'
      },
      {
        FieldName: 'termination_notice',
        DisplayName: 'Termination Notice Period',
        Type: 'text',
        Required: 'TRUE',
        DefaultValue: '30',
        Validation: 'required',
        Transformation: 'number'
      }
    ]
  };
}

// Export functions for use in browser or Node.js
if (typeof window !== 'undefined') {
  // Browser environment
  window.testExcelIntegration = testExcelIntegration;
  window.testCSVParsing = testCSVParsing;
  window.testJSONValidation = testJSONValidation;
  window.generateSampleExcelStructure = generateSampleExcelStructure;
} else if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    testExcelIntegration,
    testCSVParsing,
    testJSONValidation,
    generateSampleExcelStructure
  };
}

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined' && window.location) {
  console.log("Excel Integration Test Suite loaded!");
  console.log("Run testExcelIntegration() to test the full integration");
  console.log("Run generateSampleExcelStructure() to see the expected format");
}
