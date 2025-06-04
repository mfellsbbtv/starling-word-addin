// Configuration - following augment-guidelines: environment-specific URLs
const API_CONFIG = {
  baseUrl: process.env.NODE_ENV === 'production'
    ? 'https://starling.yourdomain.com/api/v1'  // Update with your production domain
    : 'http://localhost:8000/api/v1',  // Local development API
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer dev-token'  // TODO: Implement proper auth
  }
};

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    document.getElementById("analyze-contract").onclick = analyzeContract;
    document.getElementById("generate-summary").onclick = generateSummary;
    document.getElementById("highlight-risks").onclick = highlightRisks;
    document.getElementById("suggest-changes").onclick = suggestChanges;
    document.getElementById("check-compliance").onclick = checkCompliance;

    // Set status as ready
    updateStatus("Ready to analyze your contract", "info");
  }
});

// Function to analyze the contract
async function analyzeContract() {
  updateStatus("Analyzing contract...", "info");
  showProgressSection("Extracting document content...");

  try {
    // Get document content
    const documentText = await Word.run(async (context) => {
      const body = context.document.body;
      body.load("text");
      await context.sync();
      return body.text;
    });

    if (!documentText || documentText.trim().length === 0) {
      throw new Error("No content found in document");
    }

    showProgressSection("Sending to AI for analysis...");

    // Call the API
    const analysisResult = await callAnalysisAPI(documentText);

    // Display results
    displayAnalysisResults(analysisResult);
    updateStatus("Analysis complete", "success");
    hideProgressSection();

  } catch (error) {
    handleError(error);
  }
}

// API call function
async function callAnalysisAPI(content) {
  const response = await fetch(`${API_CONFIG.baseUrl}/analyze`, {
    method: 'POST',
    headers: API_CONFIG.headers,
    body: JSON.stringify({
      content: content,
      analysis_type: 'comprehensive'
    })
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Display analysis results
function displayAnalysisResults(result) {
  const resultsSection = document.getElementById("results-section");
  const resultsContent = document.getElementById("results-content");

  let html = `
    <div class="analysis-summary">
      <h3>Analysis Summary</h3>
      <p>${result.summary}</p>
      <p><strong>Compliance Score:</strong> ${result.compliance_score}/100</p>
    </div>

    <div class="risks-section">
      <h3>Identified Risks (${result.risks.length})</h3>
      ${result.risks.map(risk => `
        <div class="risk-item ${risk.severity}">
          <div class="risk-header">
            <span class="severity-badge ${risk.severity}">${risk.severity.toUpperCase()}</span>
            <span class="category">${risk.category}</span>
          </div>
          <p class="description">${risk.description}</p>
          <p class="location"><strong>Location:</strong> ${risk.location}</p>
          ${risk.suggestion ? `<p class="suggestion"><strong>Suggestion:</strong> ${risk.suggestion}</p>` : ''}
        </div>
      `).join('')}
    </div>

    <div class="recommendations-section">
      <h3>Recommendations</h3>
      <ul>
        ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
    </div>
  `;

  resultsSection.style.display = "block";
  resultsContent.innerHTML = html;
}

// Helper functions
function updateStatus(message, type = "info") {
  const statusElement = document.getElementById("status-message");
  statusElement.textContent = message;
  statusElement.className = `status-message ${type}`;
}

function showProgressSection(message) {
  document.getElementById("progress-section").style.display = "block";
  document.getElementById("progress-text").textContent = message;
  simulateProgress();
}

function hideProgressSection() {
  document.getElementById("progress-section").style.display = "none";
}

function showResults(message) {
  const resultsSection = document.getElementById("results-section");
  const resultsContent = document.getElementById("results-content");

  resultsSection.style.display = "block";
  resultsContent.innerHTML = `<p>${message}</p>`;
}

function simulateProgress() {
  let width = 0;
  const progressFill = document.getElementById("progress-fill");
  const interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
    } else {
      width += 5;
      progressFill.style.width = width + "%";
    }
  }, 100);
}

function handleError(error) {
  console.error(error);
  updateStatus(`Error: ${error.message}`, "error");
  hideProgressSection();
}

// Placeholder functions for other buttons
function generateSummary() {
  updateStatus("Generating summary...", "info");
  // Implementation will be added later
}

function highlightRisks() {
  updateStatus("Highlighting risks...", "info");
  // Implementation will be added later
}

function suggestChanges() {
  updateStatus("Suggesting changes...", "info");
  // Implementation will be added later
}

function checkCompliance() {
  updateStatus("Checking compliance...", "info");
  // Implementation will be added later
}