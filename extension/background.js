// Service worker for background tasks

chrome.runtime.onInstalled.addListener(() => {
  console.log('ResumeAnalyzer Extension Installed.');
});

// Example of listening for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'PING') {
    sendResponse({ message: 'PONG from background' });
  }
});
