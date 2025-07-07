// Simple contract generation test
// This bypasses the complex checks and tries to insert content directly

async function simpleContractTest() {
    console.log("🧪 Starting simple contract test...");
    
    // Check if Word API is available
    if (typeof Word === 'undefined' || typeof Word.run !== 'function') {
        console.error("❌ Word API not available");
        alert("Word API not available. Make sure you're running this in Word Online or Word Desktop.");
        return;
    }
    
    console.log("✅ Word API is available");
    
    // Simple contract text
    const contractText = `RHEI DIGITAL VIDEO SERVICES AGREEMENT

This Agreement is entered into between RHEI CREATIONS CORP. and the Provider.

1. DEFINITIONS
In this Agreement, the following terms shall have the following meanings:
- "Services" means the digital video services provided by RHEI
- "Provider" means the content provider party to this agreement
- "Content" means the digital video content provided by Provider

2. SERVICES
RHEI shall provide Provider with digital video management services including:
- Content optimization and distribution
- Analytics and reporting
- Revenue management

3. TERM
This agreement shall remain in effect for a period of two (2) years from the effective date.

4. REVENUE SHARING
Revenue shall be shared as follows:
- Provider: 70%
- RHEI: 30%

5. TERMINATION
Either party may terminate this agreement with thirty (30) days written notice.

IN WITNESS WHEREOF, the parties have executed this Agreement.

_________________________         _________________________
RHEI CREATIONS CORP.              PROVIDER

Date: _______________             Date: _______________`;

    try {
        console.log("📝 Attempting to insert contract into Word document...");
        
        await Word.run(async (context) => {
            console.log("✅ Word.run context created");
            
            // Get the document body
            const body = context.document.body;
            console.log("✅ Document body accessed");
            
            // Clear existing content
            body.clear();
            console.log("✅ Document cleared");
            
            // Insert the contract text
            body.insertText(contractText, Word.InsertLocation.start);
            console.log("✅ Contract text inserted");
            
            // Apply basic formatting
            const range = body.getRange();
            range.font.name = "Calibri";
            range.font.size = 11;
            console.log("✅ Basic formatting applied");
            
            // Sync changes
            await context.sync();
            console.log("✅ Changes synced to document");
        });
        
        console.log("🎉 Contract generation completed successfully!");
        alert("✅ Contract generated successfully! Check your Word document.");
        
    } catch (error) {
        console.error("❌ Error during contract generation:", error);
        alert(`❌ Error: ${error.message}`);
    }
}

// Add test button to page
function addTestButton() {
    const button = document.createElement('button');
    button.textContent = '🧪 Simple Contract Test';
    button.style.cssText = `
        position: fixed;
        top: 50px;
        right: 10px;
        z-index: 9999;
        background: #0078d4;
        color: white;
        padding: 10px 15px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    button.onclick = simpleContractTest;
    document.body.appendChild(button);
    console.log("🔘 Simple contract test button added (top-right)");
}

// Auto-add button when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addTestButton);
} else {
    addTestButton();
}

// Export for manual use
window.simpleContractTest = simpleContractTest;
