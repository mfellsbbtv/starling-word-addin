// Legal Matrix Integration Test - Test complete TSV integration with Word add-in
import { legalMatrixLoader } from './src/services/legal-matrix-loader.js';
import { generateContractWithLegalMatrix, analyzeContractWithLegalMatrix } from './src/taskpane/services/contract-generator.js';

/**
 * Comprehensive test of Legal Matrix TSV integration
 */
async function testLegalMatrixIntegration() {
  console.log("🧪 Testing Legal Matrix TSV Integration...");
  
  const testResults = {
    loadingTest: null,
    generationTest: null,
    analysisTest: null,
    partySpecificTest: null,
    overallSuccess: false
  };
  
  try {
    // Test 1: Load Legal Matrix TSV
    console.log("\n📊 Test 1: Loading Legal Matrix TSV...");
    const loadResult = await legalMatrixLoader.loadLegalMatrix();
    testResults.loadingTest = {
      success: true,
      data: loadResult,
      statistics: legalMatrixLoader.getStatistics()
    };
    console.log("✅ Legal Matrix loaded successfully:", loadResult);
    
    // Test 2: Generate contract from baseline clauses
    console.log("\n📝 Test 2: Generating contract from Legal Matrix baseline...");
    const formData = {
      agreement_type: 'content-management',
      content_type: 'music',
      fields: {
        company_name: 'RHEI, Inc.',
        provider_name: 'Test Music LLC',
        effective_date: new Date().toLocaleDateString()
      }
    };
    
    const generationResult = await generateContractWithLegalMatrix(formData);
    testResults.generationTest = {
      success: generationResult.success,
      contractLength: generationResult.contract_text?.length || 0,
      metadata: generationResult.metadata
    };
    
    if (generationResult.success) {
      console.log("✅ Contract generated successfully");
      console.log(`Contract length: ${generationResult.contract_text.length} characters`);
      console.log("Sample content:", generationResult.contract_text.substring(0, 200) + "...");
    } else {
      console.log("❌ Contract generation failed:", generationResult.error);
    }
    
    // Test 3: Analyze sample contract
    console.log("\n🔍 Test 3: Analyzing contract with Legal Matrix...");
    const sampleContract = `
      CONTENT MANAGEMENT AGREEMENT
      
      This Content Management Agreement is entered into between RHEI, Inc. and Test Music LLC.
      
      ARTICLE 2
      
      2.1 Channel Management Services
      RHEI will provide Channel Management Services as detailed in Schedule "B" for Provider Channels listed in Schedule "A".
      
      2.2 Content Development Services  
      RHEI will provide Content Development Services as detailed in Schedule "C".
      
      ARTICLE 3
      
      3.1 Provider Obligations
      Provider must provide RHEI with administrative access and metadata for Provider Channels.
      
      ARTICLE 5
      
      5.1 Revenue Shares
      Provider pays RHEI 30% of Net Revenue from Managed Channels.
    `;
    
    const analysisResult = await analyzeContractWithLegalMatrix(sampleContract);
    testResults.analysisTest = {
      success: analysisResult.success,
      complianceScore: analysisResult.analysis?.complianceScore,
      missingClauses: analysisResult.analysis?.missingClauses?.length || 0,
      unacceptableModifications: analysisResult.analysis?.unacceptableModifications?.length || 0
    };
    
    if (analysisResult.success) {
      console.log("✅ Contract analysis completed");
      console.log(`Compliance score: ${analysisResult.analysis.complianceScore}%`);
      console.log(`Missing clauses: ${analysisResult.analysis.missingClauses?.length || 0}`);
      console.log(`Unacceptable modifications: ${analysisResult.analysis.unacceptableModifications?.length || 0}`);
      console.log("Overall assessment:", analysisResult.analysis.overallAssessment);
    } else {
      console.log("❌ Contract analysis failed:", analysisResult.error);
    }
    
    // Test 4: Party-specific analysis
    console.log("\n🎯 Test 4: Party-specific analysis (Sony)...");
    const partyAnalysisResult = await analyzeContractWithLegalMatrix(sampleContract, 'Sony');
    testResults.partySpecificTest = {
      success: partyAnalysisResult.success,
      targetParty: partyAnalysisResult.target_party,
      partyRecommendations: partyAnalysisResult.analysis?.partySpecificRecommendations?.length || 0
    };
    
    if (partyAnalysisResult.success) {
      console.log("✅ Party-specific analysis completed for Sony");
      console.log(`Party recommendations: ${partyAnalysisResult.analysis.partySpecificRecommendations?.length || 0}`);
    } else {
      console.log("❌ Party-specific analysis failed:", partyAnalysisResult.error);
    }
    
    // Test 5: Supported parties
    console.log("\n👥 Test 5: Checking supported parties...");
    const supportedParties = legalMatrixLoader.getSupportedParties();
    console.log("Supported parties:", supportedParties);
    
    // Overall success assessment
    testResults.overallSuccess = testResults.loadingTest?.success && 
                                testResults.generationTest?.success && 
                                testResults.analysisTest?.success;
    
    console.log("\n🎯 Integration Test Summary:");
    console.log("=".repeat(50));
    console.log(`Loading Test: ${testResults.loadingTest?.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Generation Test: ${testResults.generationTest?.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Analysis Test: ${testResults.analysisTest?.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Party-Specific Test: ${testResults.partySpecificTest?.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Overall Success: ${testResults.overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
    
    return testResults;
    
  } catch (error) {
    console.error("❌ Integration test failed:", error);
    testResults.overallSuccess = false;
    testResults.error = error.message;
    return testResults;
  }
}

/**
 * Test Legal Matrix statistics and metadata
 */
async function testLegalMatrixStatistics() {
  console.log("\n📈 Testing Legal Matrix Statistics...");
  
  try {
    await legalMatrixLoader.loadLegalMatrix();
    const stats = legalMatrixLoader.getStatistics();
    
    console.log("Legal Matrix Statistics:");
    console.log("- Loaded:", stats.loaded);
    console.log("- Baseline clauses:", stats.baselineClauses);
    console.log("- Party variations:", stats.partyVariations);
    console.log("- Supported parties:", stats.supportedParties);
    console.log("- Clauses loaded:", stats.clausesLoaded);
    console.log("- Articles found:", stats.articlesFound);
    
    return stats;
    
  } catch (error) {
    console.error("Statistics test failed:", error);
    return null;
  }
}

/**
 * Test party recommendations
 */
async function testPartyRecommendations() {
  console.log("\n🎯 Testing Party Recommendations...");
  
  try {
    await legalMatrixLoader.loadLegalMatrix();
    const parties = ['Sony', 'WMX', 'Lionsgate'];
    
    for (const party of parties) {
      console.log(`\nTesting recommendations for ${party}:`);
      const recommendations = await legalMatrixLoader.getPartyRecommendations(party);
      
      if (recommendations.supported) {
        console.log(`✅ ${party}: ${recommendations.totalVariations} variations found`);
        if (recommendations.recommendations.length > 0) {
          console.log("Sample recommendation:", recommendations.recommendations[0]);
        }
      } else {
        console.log(`❌ ${party}: ${recommendations.message}`);
      }
    }
    
  } catch (error) {
    console.error("Party recommendations test failed:", error);
  }
}

/**
 * Test Word add-in integration points
 */
async function testWordAddinIntegration() {
  console.log("\n📄 Testing Word Add-in Integration Points...");
  
  try {
    // Test if Legal Matrix can be loaded in Word add-in context
    await legalMatrixLoader.loadLegalMatrix();
    
    // Test contract generation for Word insertion
    const formData = {
      agreement_type: 'content-management',
      content_type: 'music',
      fields: {
        company_name: 'RHEI, Inc.',
        provider_name: 'Word Test LLC',
        effective_date: new Date().toLocaleDateString()
      }
    };
    
    const contract = await legalMatrixLoader.generateContract(formData);
    
    console.log("✅ Word add-in integration test passed");
    console.log("Contract ready for Word insertion:", contract.contractText.length > 0);
    
    return {
      success: true,
      contractReady: contract.contractText.length > 0,
      clausesUsed: contract.clausesUsed,
      articlesGenerated: contract.articlesGenerated
    };
    
  } catch (error) {
    console.error("❌ Word add-in integration test failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate integration report
 */
function generateIntegrationReport(testResults) {
  const report = {
    timestamp: new Date().toISOString(),
    overallStatus: testResults.overallSuccess ? 'PASS' : 'FAIL',
    testResults,
    recommendations: []
  };
  
  // Add recommendations based on test results
  if (!testResults.loadingTest?.success) {
    report.recommendations.push("Fix Legal Matrix TSV loading - check file path and format");
  }
  
  if (!testResults.generationTest?.success) {
    report.recommendations.push("Fix contract generation - check baseline clause processing");
  }
  
  if (!testResults.analysisTest?.success) {
    report.recommendations.push("Fix contract analysis - check clause matching logic");
  }
  
  if (testResults.overallSuccess) {
    report.recommendations.push("✅ All tests passed! Legal Matrix integration is ready for production");
    report.recommendations.push("🚀 Deploy to Word add-in for live contract generation and analysis");
  }
  
  return report;
}

// Export functions for use in browser or Node.js
if (typeof window !== 'undefined') {
  // Browser environment
  window.testLegalMatrixIntegration = testLegalMatrixIntegration;
  window.testLegalMatrixStatistics = testLegalMatrixStatistics;
  window.testPartyRecommendations = testPartyRecommendations;
  window.testWordAddinIntegration = testWordAddinIntegration;
} else if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    testLegalMatrixIntegration,
    testLegalMatrixStatistics,
    testPartyRecommendations,
    testWordAddinIntegration,
    generateIntegrationReport
  };
}

// Auto-run comprehensive test if executed directly
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].includes('test-legal-matrix-integration')) {
  testLegalMatrixIntegration().then(results => {
    const report = generateIntegrationReport(results);
    console.log("\n📋 Final Integration Report:");
    console.log(JSON.stringify(report, null, 2));
    
    if (results.overallSuccess) {
      console.log("\n🎉 Legal Matrix integration is ready for production!");
      console.log("Next steps:");
      console.log("1. Deploy to Word add-in");
      console.log("2. Test with real contracts");
      console.log("3. Train legal team on new features");
    } else {
      console.log("\n⚠️ Integration issues found. Please review and fix before deployment.");
    }
  });
}
