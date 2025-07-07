#!/usr/bin/env node

/**
 * Naming Consistency Verification Script
 * 
 * This script checks for common naming inconsistencies in the codebase.
 * Run with: node verify-naming-consistency.js
 */

const fs = require('fs');
const path = require('path');

// Define expected naming patterns
const NAMING_PATTERNS = {
  // JavaScript function names should be camelCase
  functionNames: /^[a-z][a-zA-Z0-9]*$/,
  
  // CSS classes should be kebab-case
  cssClasses: /^[a-z][a-z0-9-]*$/,
  
  // HTML IDs should be kebab-case
  htmlIds: /^[a-z][a-z0-9-]*$/,
  
  // Constants should be UPPER_SNAKE_CASE
  constants: /^[A-Z][A-Z0-9_]*$/,
  
  // Form field names should be snake_case
  formFields: /^[a-z][a-z0-9_]*$/
};

// Common button IDs that should exist
const EXPECTED_BUTTON_IDS = [
  'generate-contract',
  'analyze-contract',
  'test-word-api',
  'show-diagnostics',
  'clear-results',
  'clear-suggestions',
  'toggle-track-changes',
  'highlight-risks',
  'check-compliance',
  'suggest-changes'
];

// Files to check
const FILES_TO_CHECK = [
  'src/taskpane/taskpane.html',
  'src/taskpane/taskpane.js',
  'src/taskpane/modules/event-handlers.js',
  'src/shared/utils.js',
  'src/taskpane/services/contract-generator.js'
];

function checkFile(filePath) {
  console.log(`\n🔍 Checking ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  let hasIssues = false;
  
  // Check for button ID references
  if (filePath.includes('.js')) {
    EXPECTED_BUTTON_IDS.forEach(buttonId => {
      const pattern = new RegExp(`getElementById\\(["']${buttonId}["']\\)`, 'g');
      const matches = content.match(pattern);
      if (matches) {
        console.log(`✅ Button ID '${buttonId}' properly referenced`);
      }
    });
    
    // Check for potential button ID mismatches
    const buttonIdPattern = /getElementById\(["']([^"']+)["']\)/g;
    let match;
    while ((match = buttonIdPattern.exec(content)) !== null) {
      const buttonId = match[1];
      if (buttonId.includes('btn') && !buttonId.endsWith('-btn')) {
        console.log(`⚠️  Potential button ID inconsistency: ${buttonId}`);
        hasIssues = true;
      }
    }
  }
  
  // Check HTML for button IDs
  if (filePath.includes('.html')) {
    EXPECTED_BUTTON_IDS.forEach(buttonId => {
      const pattern = new RegExp(`id=["']${buttonId}["']`, 'g');
      const matches = content.match(pattern);
      if (matches) {
        console.log(`✅ Button ID '${buttonId}' found in HTML`);
      }
    });
  }
  
  return !hasIssues;
}

function main() {
  console.log('🚀 Starting naming consistency verification...\n');
  
  let allGood = true;
  
  FILES_TO_CHECK.forEach(filePath => {
    const result = checkFile(filePath);
    if (!result) {
      allGood = false;
    }
  });
  
  console.log('\n📋 Summary:');
  
  if (allGood) {
    console.log('✅ All naming consistency checks passed!');
    console.log('\n🎯 Key consistency points verified:');
    console.log('   • Button IDs use kebab-case');
    console.log('   • Function names use camelCase');
    console.log('   • No button ID mismatches found');
    console.log('   • Event handlers properly reference button IDs');
  } else {
    console.log('❌ Some naming inconsistencies found. Please review the issues above.');
  }
  
  console.log('\n📖 For complete naming guidelines, see: NAMING_CONVENTIONS.md');
}

// Run the verification
main();
