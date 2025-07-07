// Debug script for contract generation issues
// Add this to browser console when testing the Word Add-in

console.log("🔍 Contract Generation Debug Script");
console.log("=====================================");

// Check global variables
console.log("Global Variables:");
console.log("- window.WORD_API_AVAILABLE:", window.WORD_API_AVAILABLE);
console.log("- window.OFFICE_READY:", window.OFFICE_READY);
console.log("- window.WORD_API_READY:", window.WORD_API_READY);
console.log("- window.INITIALIZATION_COMPLETE:", window.INITIALIZATION_COMPLETE);

// Check Office.js availability
console.log("\nOffice.js Status:");
console.log("- typeof Office:", typeof Office);
console.log("- typeof Word:", typeof Word);
console.log("- typeof Word.run:", typeof Word.run);

if (typeof Office !== 'undefined') {
    console.log("- Office.context:", Office.context);
    console.log("- Office.context.host:", Office.context?.host);
    console.log("- Office.HostApplication:", Office.HostApplication);
    console.log("- Office.HostApplication.Word:", Office.HostApplication?.Word);
}

// Check button availability
const generateBtn = document.getElementById("generate-contract");
console.log("\nGenerate Button:");
console.log("- Button exists:", !!generateBtn);
console.log("- Button disabled:", generateBtn?.disabled);
console.log("- Button style.display:", generateBtn?.style.display);

// Test Word API directly
console.log("\nTesting Word API directly...");
if (typeof Word !== 'undefined' && typeof Word.run === 'function') {
    Word.run(async (context) => {
        console.log("✅ Word.run executed successfully!");
        console.log("- Context:", context);
        console.log("- Document:", context.document);
        return context.sync();
    }).then(() => {
        console.log("✅ Word API test completed successfully!");
    }).catch(error => {
        console.error("❌ Word API test failed:", error);
    });
} else {
    console.log("❌ Word API not available for direct testing");
}

// Test contract generation function
console.log("\nTesting contract generation...");
async function testContractGeneration() {
    try {
        // Get form data
        const agreementType = document.getElementById("agreement-type")?.value || "content-management";
        const contentType = document.getElementById("content-type")?.value || "music";
        
        console.log("Form data:");
        console.log("- Agreement Type:", agreementType);
        console.log("- Content Type:", contentType);
        
        // Try to call the generate contract function directly
        if (window.WORD_API_AVAILABLE) {
            console.log("Attempting to generate contract...");
            
            // Import and call the function
            const { generateContract } = await import('./src/taskpane/modules/event-handlers.js');
            await generateContract();
            console.log("✅ Contract generation completed!");
        } else {
            console.log("❌ Cannot generate contract - Word API not available");
            console.log("Suggestion: Try clicking 'Skip Test & Continue in Demo Mode'");
        }
    } catch (error) {
        console.error("❌ Contract generation failed:", error);
        console.error("Error details:", error.stack);
    }
}

// Add a button to test contract generation
const debugButton = document.createElement('button');
debugButton.textContent = 'Debug Contract Generation';
debugButton.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; background: red; color: white; padding: 10px; border: none; border-radius: 4px;';
debugButton.onclick = testContractGeneration;
document.body.appendChild(debugButton);

console.log("\n🎯 Debug button added to page (top-right corner)");
console.log("Click it to test contract generation directly");

// Monitor Word API status changes
let lastWordApiStatus = window.WORD_API_AVAILABLE;
setInterval(() => {
    if (window.WORD_API_AVAILABLE !== lastWordApiStatus) {
        console.log(`🔄 Word API status changed: ${lastWordApiStatus} → ${window.WORD_API_AVAILABLE}`);
        lastWordApiStatus = window.WORD_API_AVAILABLE;
    }
}, 1000);

console.log("\n📊 Monitoring Word API status changes...");
console.log("=====================================");
