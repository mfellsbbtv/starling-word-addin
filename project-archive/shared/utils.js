// Shared utility functions

// Enhanced button state management
export function setButtonLoading(buttonId, isLoading) {
  const button = document.getElementById(buttonId);
  if (!button) {
    console.warn(`Button with ID '${buttonId}' not found`);
    return;
  }

  if (isLoading) {
    button.classList.add("loading");
    button.disabled = true;
  } else {
    button.classList.remove("loading");
    button.disabled = false;
  }
}

// Helper functions
export function updateStatus(message, type = "info") {
  const statusElement = document.getElementById("status-message");
  if (!statusElement) {
    console.warn("Status element not found");
    return;
  }

  statusElement.textContent = message;
  statusElement.className = `status-message ms-font-s ${type} slide-in`;

  // Add success animation for success messages
  if (type === "success") {
    statusElement.classList.add("success-animation");
    setTimeout(() => {
      statusElement.classList.remove("success-animation");
    }, 600);
  }
}

export function showProgressSection(message) {
  const progressSection = document.getElementById("progress-section");
  const progressText = document.getElementById("progress-text");

  if (progressSection) {
    progressSection.style.display = "block";
  }
  if (progressText) {
    progressText.textContent = message;
  }
  simulateProgress();
}

export function hideProgressSection() {
  const progressSection = document.getElementById("progress-section");
  if (progressSection) {
    progressSection.style.display = "none";
  }
}

// Progress simulation
function simulateProgress() {
  const progressBar = document.getElementById("progress-fill");
  if (!progressBar) {
    console.warn("Progress fill element not found");
    return;
  }

  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 90) progress = 90;

    progressBar.style.width = progress + "%";

    if (progress >= 90) {
      clearInterval(interval);
    }
  }, 200);
}

// Error handling
export function handleError(error) {
  console.error("Error:", error);
  let errorMessage = "An error occurred";
  
  if (error.message) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  updateStatus(errorMessage, "error");
  hideProgressSection();
}

// Clear results functions
export function clearResults() {
  const resultsSection = document.getElementById("results-section");
  const resultsContent = document.getElementById("results-content");

  if (resultsSection) {
    resultsSection.style.display = "none";
  }
  if (resultsContent) {
    resultsContent.innerHTML = "";
  }

  updateStatus("Results cleared", "info");
}

export function clearSuggestions() {
  const suggestionsSection = document.getElementById("suggestions-section");
  const suggestionsContent = document.getElementById("suggestions-content");

  if (suggestionsSection) {
    suggestionsSection.style.display = "none";
  }
  if (suggestionsContent) {
    suggestionsContent.innerHTML = "";
  }

  updateStatus("Suggestions cleared", "info");
}

// Theme detection and initialization
export function initializeTheme() {
  // Detect Office theme
  if (Office.context && Office.context.officeTheme && document.body) {
    const theme = Office.context.officeTheme;
    document.body.className = `office-theme-${theme.bodyBackgroundColor}`;
  }
}
