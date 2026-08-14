document.addEventListener('DOMContentLoaded', () => {
  const extractBtn = document.getElementById('extractBtn');
  const openAppBtn = document.getElementById('openAppBtn');
  const statusEl = document.getElementById('status');
  const fileInput = document.getElementById('resumeFile');
  const fileNameDisplay = document.getElementById('fileName');

  let selectedFileBase64 = null;
  let selectedFileName = '';
  let selectedFileType = '';

  // Handle file selection
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      fileNameDisplay.textContent = file.name;
      selectedFileName = file.name;
      selectedFileType = file.type;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        selectedFileBase64 = event.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      fileNameDisplay.textContent = 'No file selected';
      selectedFileBase64 = null;
    }
  });

  // Helper function to show status messages
  const showStatus = (message, isError = false) => {
    statusEl.textContent = message;
    statusEl.className = `status-msg ${isError ? 'error' : 'success'}`;
    setTimeout(() => {
      statusEl.className = 'status-msg hidden';
    }, 3000);
  };

  // Open the main ResumeAnalyzer app (assumes it runs on localhost:5173 for now)
  openAppBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:5173' });
  });

  // Extract data from the current page
  extractBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        showStatus('No active tab found', true);
        return;
      }

      // Send a message to the content script of the active tab
      chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_DATA' }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script might not be injected or the page is restricted
          showStatus('Cannot extract data from this page', true);
          console.error(chrome.runtime.lastError);
          return;
        }

        if (response && response.success) {
          
          // Attach file data if present
          if (selectedFileBase64) {
            response.data.resumeBase64 = selectedFileBase64;
            response.data.resumeName = selectedFileName;
            response.data.resumeType = selectedFileType;
            
            showStatus('Calculating Job Match Score...');
            document.getElementById('actionButtons').classList.add('hidden');
            
            // Convert base64 to Blob
            fetch(selectedFileBase64)
              .then(res => res.blob())
              .then(blob => {
                const formData = new FormData();
                formData.append('resume', blob, selectedFileName);
                
                // Combine job details for analysis
                const jobText = `Job Title: ${response.data.jobTitle || 'N/A'}\nCompany: ${response.data.company || 'N/A'}\n\nDescription:\n${response.data.content || ''}`;
                formData.append('jobDescription', jobText);
                
                // Call local backend
                return fetch('http://localhost:5000/api/analyze', {
                  method: 'POST',
                  body: formData
                });
              })
              .then(res => res.json())
              .then(analysisResult => {
                // Hide status
                statusEl.classList.add('hidden');
                
                // Show score UI
                const scoreContainer = document.getElementById('scoreContainer');
                const scoreValue = document.getElementById('scoreValue');
                const scoreVerdict = document.getElementById('scoreVerdict');
                
                const score = analysisResult?.scores?.overall || 0;
                scoreValue.textContent = score;
                
                if (score >= 80) {
                  scoreVerdict.textContent = "Excellent Match! 🚀";
                  scoreVerdict.style.color = "#10b981"; // Emerald
                } else if (score >= 60) {
                  scoreVerdict.textContent = "Good Match 👍";
                  scoreVerdict.style.color = "#f59e0b"; // Amber
                } else {
                  scoreVerdict.textContent = "Weak Match ⚠️";
                  scoreVerdict.style.color = "#ef4444"; // Red
                }
                
                scoreContainer.classList.remove('hidden');
                
                // Attach the result to pass to the web app
                response.data.analysisResult = analysisResult;
                
                // Save the extracted data + result to extension storage
                chrome.storage.local.set({ pending_job_data: response.data });
              })
              .catch(err => {
                console.error("Analysis failed:", err);
                showStatus('Failed to calculate score.', true);
                document.getElementById('actionButtons').classList.remove('hidden');
                // Still save whatever data we have
                chrome.storage.local.set({ pending_job_data: response.data });
              });
              
          } else {
            showStatus('Data extracted! Opening app...');
            // No file uploaded, just save and open the app normally
            chrome.storage.local.set({ pending_job_data: response.data }, () => {
              // Check if the app is already open in another tab
              chrome.tabs.query({ url: "http://localhost:5173/*" }, (tabs) => {
                if (tabs.length > 0) {
                  chrome.tabs.update(tabs[0].id, { active: true });
                  chrome.tabs.reload(tabs[0].id);
                } else {
                  chrome.tabs.create({ url: 'http://localhost:5173/analyzer' });
                }
              });
            });
          }

        } else {
          showStatus('Failed to extract data', true);
        }
      });
    } catch (err) {
      showStatus('Error occurred', true);
      console.error(err);
    }
  });

  // Handle the "View Full Details" button after getting the score
  document.getElementById('viewDetailsBtn').addEventListener('click', () => {
    chrome.tabs.query({ url: "http://localhost:5173/*" }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.update(tabs[0].id, { active: true });
        chrome.tabs.reload(tabs[0].id);
      } else {
        chrome.tabs.create({ url: 'http://localhost:5173/analyzer' });
      }
    });
  });
});
