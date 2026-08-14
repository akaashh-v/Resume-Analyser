// This script runs on the ResumeAnalyzer web app to bridge extension data to the app
chrome.storage.local.get(['pending_job_data'], (result) => {
  if (result.pending_job_data) {
    console.log('ResumeAnalyzer Extension: Injecting pending job data into web app.');
    // Set the data in the web app's localStorage
    localStorage.setItem('imported_job_data', JSON.stringify(result.pending_job_data));
    
    // Dispatch a custom event so the React app picks it up immediately
    window.dispatchEvent(new Event('extension_data_imported'));
    
    // Also dispatch a generic storage event as fallback
    window.dispatchEvent(new Event('storage'));

    // Clear it from extension storage so it doesn't get injected again
    chrome.storage.local.remove('pending_job_data');
  }
});
