// This script runs in the context of the web pages matched in manifest.json

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'EXTRACT_DATA') {
    let data = {
      title: document.title,
      url: window.location.href,
      company: '',
      jobTitle: '',
      content: ''
    };

    if (window.location.hostname.includes('linkedin.com')) {
      console.log('LinkedIn page detected - attempting to scrape job details');
      
      // Try multiple possible selectors for Title
      const titleSelectors = [
        'h1.job-details-jobs-unified-top-card__job-title',
        '.job-details-jobs-unified-top-card__job-title',
        '.top-card-layout__title',
        '.topcard__title',
        'h1.t-24',
        'h1'
      ];
      // Find the first element that exists AND has visible text
      const titleEl = titleSelectors
        .map(sel => document.querySelector(sel))
        .find(el => el && el.innerText && el.innerText.trim() !== '');
      
      // Try multiple possible selectors for Company
      const companySelectors = [
        '.job-details-jobs-unified-top-card__company-name a',
        '.job-details-jobs-unified-top-card__company-name',
        '.job-details-jobs-unified-top-card__primary-description a',
        '.topcard__org-name-link',
        'a[href*="/company/"]'
      ];
      let companyEl = companySelectors
        .map(sel => document.querySelector(sel))
        .find(el => el && el.innerText && el.innerText.trim() !== '');
      
      // Try multiple possible selectors for Description
      const descSelectors = [
        '#job-details',
        '.jobs-description__content',
        '.jobs-description-content__text',
        '.show-more-less-html__markup'
      ];
      let descEl = descSelectors
        .map(sel => document.querySelector(sel))
        .find(el => el && el.innerText && el.innerText.trim() !== '');

      // Structural Fallbacks if CSS classes fail
      if (!descEl) {
        // Look for the "About the job" heading and grab its parent or next sibling
        const headings = Array.from(document.querySelectorAll('h2'));
        const aboutHeading = headings.find(h => h.innerText.toLowerCase().includes('about the job'));
        if (aboutHeading) {
          descEl = aboutHeading.parentElement.parentElement; // Usually a few levels up encompasses the text
        }
      }

      if (!companyEl && titleEl) {
        // Company is often just a sibling or near the title
        const companyCandidate = document.querySelector('.job-details-jobs-unified-top-card__primary-description') || titleEl.previousElementSibling;
        if (companyCandidate) companyEl = companyCandidate;
      }
      
      if (titleEl) {
        data.jobTitle = titleEl.innerText.trim();
      } else {
        // Bulletproof fallback: LinkedIn always puts the Job Title at the start of the page tab title
        // e.g., "Software Engineer | LinkedIn" or "Software Engineer - Company"
        const docTitle = document.title || '';
        data.jobTitle = docTitle.split(/\||-/)[0].trim();
      }
      
      if (companyEl) data.company = companyEl.innerText.split('\n')[0].trim(); // Take just the first line in case it grabs extra text
      
      if (descEl) {
        // Strip out the "About the job" header text if it's in the extraction
        let text = descEl.innerText.trim();
        if (text.toLowerCase().startsWith('about the job')) {
          text = text.substring('About the job'.length).trim();
        }
        data.content = text;
      } else {
        data.content = document.body.innerText.substring(0, 1500) + '\n\n... (Fallback)';
      }
    } else if (window.location.hostname.includes('indeed.com')) {
      console.log('Indeed page detected - attempting to scrape job details');
      // Indeed typical selectors
      const titleEl = document.querySelector('.jobsearch-JobInfoHeader-title') || document.querySelector('h1');
      const companyEl = document.querySelector('[data-company-name="true"]') || document.querySelector('.jobsearch-CompanyInfoContainer a');
      const descEl = document.querySelector('#jobDescriptionText');

      if (titleEl) data.jobTitle = titleEl.innerText.trim();
      if (companyEl) data.company = companyEl.innerText.trim();
      if (descEl) {
        data.content = descEl.innerText.trim();
      } else {
        data.content = document.body.innerText.substring(0, 1500) + '\n\n... (Fallback)';
      }
    } else {
      // Fallback for other sites
      data.content = document.body.innerText.substring(0, 1000);
    }

    sendResponse({ success: true, data: data });
  }
  
  // Return true to indicate we wish to send a response asynchronously (if needed)
  return true;
});
