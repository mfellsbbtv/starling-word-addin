// Test Legal Matrix CSV Parsing - Analyze separator issues and test solutions
import { legalMatrixService } from './src/services/legal-matrix-service.js';
import { readFileSync } from 'fs';

/**
 * Test Legal Matrix CSV parsing with your actual file
 */
async function testLegalMatrixParsing() {
  console.log("🧪 Testing Legal Matrix CSV Parsing...");
  
  try {
    // Read your actual CSV file
    const csvContent = readFileSync('Legal Matrix - Test.csv', 'utf8');
    
    console.log("\n📊 File Analysis:");
    console.log(`File size: ${csvContent.length} characters`);
    console.log(`Lines: ${csvContent.split('\n').length}`);
    
    // Analyze separator frequency
    const separatorAnalysis = analyzeSeparators(csvContent);
    console.log("\n🔍 Separator Analysis:", separatorAnalysis);
    
    // Test parsing with different formats
    console.log("\n🚀 Testing Parsing Methods:");
    
    // Test 1: Auto-detect format
    console.log("\n1. Auto-detect format:");
    try {
      const autoResult = await legalMatrixService.loadLegalMatrix(csvContent);
      console.log("✅ Auto-detect successful:", autoResult);
    } catch (error) {
      console.log("❌ Auto-detect failed:", error.message);
    }
    
    // Test 2: Force CSV parsing
    console.log("\n2. Force CSV parsing:");
    try {
      const csvResult = legalMatrixService.parseLegalMatrixCSV(csvContent, 'csv');
      console.log("✅ CSV parsing successful:");
      console.log(`  - Rows parsed: ${csvResult.data.length}`);
      console.log(`  - Headers: ${csvResult.headers.length}`);
      console.log(`  - Format detected: ${csvResult.format}`);
      
      // Show first few rows
      if (csvResult.data.length > 0) {
        console.log("\n📋 Sample parsed data:");
        csvResult.data.slice(0, 3).forEach((row, index) => {
          console.log(`Row ${index + 1}:`);
          console.log(`  Article: ${row.article}`);
          console.log(`  Clause: ${row.clauseNumber}`);
          console.log(`  Title: ${row.clauseTitle}`);
          console.log(`  Baseline: ${row.baseline.substring(0, 100)}...`);
          console.log(`  Party variations: ${Object.keys(row.partyVariations).length}`);
        });
      }
      
    } catch (error) {
      console.log("❌ CSV parsing failed:", error.message);
      console.log("Error details:", error.stack);
    }
    
    // Test 3: Generate TSV recommendation
    console.log("\n3. TSV Conversion Recommendation:");
    const tsvSample = generateTSVSample(csvContent);
    console.log("✅ TSV sample generated (first 500 chars):");
    console.log(tsvSample.substring(0, 500) + "...");
    
    // Test 4: Analyze problematic content
    console.log("\n4. Problematic Content Analysis:");
    const problems = analyzeProblematicContent(csvContent);
    console.log("Issues found:", problems);
    
    return {
      success: true,
      separatorAnalysis,
      recommendation: "Convert to TSV for best results"
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
 * Analyze separator frequency in the content
 */
function analyzeSeparators(content) {
  const firstLine = content.split('\n')[0];
  const sampleLines = content.split('\n').slice(0, 10);
  
  const separators = {
    comma: ',',
    tab: '\t',
    pipe: '|',
    semicolon: ';',
    caret: '^',
    tilde: '~'
  };
  
  const analysis = {};
  
  Object.entries(separators).forEach(([name, char]) => {
    const firstLineCount = (firstLine.match(new RegExp('\\' + char, 'g')) || []).length;
    const avgCount = sampleLines.reduce((sum, line) => {
      return sum + (line.match(new RegExp('\\' + char, 'g')) || []).length;
    }, 0) / sampleLines.length;
    
    analysis[name] = {
      character: char,
      firstLineCount,
      averagePerLine: Math.round(avgCount * 10) / 10,
      recommendation: getRecommendation(name, firstLineCount, avgCount)
    };
  });
  
  return analysis;
}

/**
 * Get recommendation for separator usage
 */
function getRecommendation(separatorName, firstLineCount, avgCount) {
  if (separatorName === 'comma' && firstLineCount > 10) {
    return "❌ PROBLEMATIC - Too many commas in legal text";
  } else if (separatorName === 'tab' && firstLineCount > 5) {
    return "✅ EXCELLENT - Tabs are rare in legal text";
  } else if (separatorName === 'pipe' && firstLineCount > 5 && avgCount < 2) {
    return "✅ GOOD - Pipes are uncommon in legal text";
  } else if (firstLineCount === 0) {
    return "✅ PERFECT - Character not used in content";
  } else {
    return "⚠️ MODERATE - Some usage detected";
  }
}

/**
 * Generate TSV sample from CSV content
 */
function generateTSVSample(csvContent) {
  const lines = csvContent.split('\n').slice(0, 5); // First 5 lines
  
  return lines.map(line => {
    // Simple conversion: replace commas outside quotes with tabs
    let result = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
        // Remove quotes in TSV since we don't need them
      } else if (char === ',' && !inQuotes) {
        result += '\t'; // Replace comma with tab
      } else {
        result += char;
      }
    }
    
    return result;
  }).join('\n');
}

/**
 * Analyze problematic content that causes parsing issues
 */
function analyzeProblematicContent(content) {
  const lines = content.split('\n');
  const problems = {
    multiLineFields: 0,
    quotesInQuotes: 0,
    unbalancedQuotes: 0,
    longFields: 0,
    specialCharacters: 0
  };
  
  lines.forEach((line, index) => {
    // Check for quotes within quotes
    if (line.includes('""')) {
      problems.quotesInQuotes++;
    }
    
    // Check for unbalanced quotes
    const quoteCount = (line.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) {
      problems.unbalancedQuotes++;
    }
    
    // Check for very long fields (likely legal clauses)
    if (line.length > 1000) {
      problems.longFields++;
    }
    
    // Check for special characters that might cause issues
    if (line.includes('\n') || line.includes('\r')) {
      problems.multiLineFields++;
    }
  });
  
  return problems;
}

/**
 * Generate conversion recommendations
 */
function generateRecommendations(analysis) {
  const recommendations = [];
  
  if (analysis.separatorAnalysis.comma.firstLineCount > 10) {
    recommendations.push({
      priority: "HIGH",
      issue: "Too many commas in legal text",
      solution: "Convert to TSV (Tab-Separated Values)",
      benefit: "Eliminates all comma-related parsing issues"
    });
  }
  
  if (analysis.separatorAnalysis.tab.firstLineCount === 0) {
    recommendations.push({
      priority: "HIGH",
      issue: "No tabs detected in content",
      solution: "TSV is perfect for this content",
      benefit: "Zero conflicts with legal text"
    });
  }
  
  recommendations.push({
    priority: "MEDIUM",
    issue: "Complex legal clauses with quotes",
    solution: "Use enhanced CSV parser or convert to TSV",
    benefit: "Handles nested quotes and multi-line content"
  });
  
  return recommendations;
}

// Export for use in browser or Node.js
if (typeof window !== 'undefined') {
  // Browser environment
  window.testLegalMatrixParsing = testLegalMatrixParsing;
  window.analyzeSeparators = analyzeSeparators;
} else if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    testLegalMatrixParsing,
    analyzeSeparators,
    generateTSVSample,
    analyzeProblematicContent
  };
}

// Auto-run if executed directly
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].includes('test-legal-matrix-parsing')) {
  testLegalMatrixParsing().then(result => {
    console.log("\n🎯 Final Result:", result);
    
    if (result.success) {
      console.log("\n💡 Recommendations:");
      console.log("1. ✅ Convert to TSV for best parsing results");
      console.log("2. ✅ Use enhanced CSV parser for current format");
      console.log("3. ✅ Test with actual Legal Matrix data");
    }
  });
}
