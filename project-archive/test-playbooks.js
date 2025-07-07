// Test script to verify playbook loading
import { playbookService } from './src/shared/playbook-service.js';

async function testPlaybooks() {
  console.log('Testing playbook loading...');
  
  try {
    // Test content-management/music playbook
    console.log('\n1. Testing content-management/music playbook...');
    const contentMgmtPlaybook = await playbookService.loadPlaybook('content-management', 'music');
    console.log('✅ Content Management playbook loaded successfully');
    console.log('   - Template sections:', contentMgmtPlaybook.template?.template?.sections?.length || 0);
    console.log('   - Clauses:', contentMgmtPlaybook.clauses?.clauses?.length || 0);
    console.log('   - Form fields:', contentMgmtPlaybook.formFields?.form_sections?.length || 0);
    console.log('   - Risk rules:', contentMgmtPlaybook.riskRules?.risk_rules?.length || 0);
    
    // Test data-pro/general playbook
    console.log('\n2. Testing data-pro/general playbook...');
    const dataProPlaybook = await playbookService.loadPlaybook('data-pro', 'general');
    console.log('✅ Data Pro playbook loaded successfully');
    console.log('   - Template sections:', dataProPlaybook.template?.template?.sections?.length || 0);
    console.log('   - Clauses:', dataProPlaybook.clauses?.clauses?.length || 0);
    console.log('   - Form fields:', dataProPlaybook.formFields?.form_sections?.length || 0);
    console.log('   - Risk rules:', dataProPlaybook.riskRules?.risk_rules?.length || 0);
    
    // Test available playbooks list
    console.log('\n3. Testing available playbooks list...');
    const availablePlaybooks = playbookService.getAvailablePlaybooks();
    console.log('✅ Available playbooks:', availablePlaybooks.length);
    availablePlaybooks.forEach(pb => {
      console.log(`   - ${pb.agreementType}/${pb.contentType}`);
    });
    
    console.log('\n🎉 All playbook tests passed!');
    
  } catch (error) {
    console.error('❌ Playbook test failed:', error);
  }
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  testPlaybooks();
} else {
  // Browser environment
  window.testPlaybooks = testPlaybooks;
  console.log('Playbook test function available as window.testPlaybooks()');
}
