(function () {
  console.log("[JobDetector] content script loaded");

  // Prevent detecting the same job page multiple times
  let lastDetectionStatus = null;

  // Detect based on URL patterns commonly used on job pages
  function detectUrlPatterns(currentPageUrl) {
    // Common URL patterns indicating job pages
    const jobUrlPatterns = [
      { regex: /careers?/i, label: "contains 'career' or 'careers'" },
      { regex: /jobs?/i, label: "contains 'job' or 'jobs'" },
      { regex: /jobdetail/i, label: "contains 'jobdetail'" },
      { regex: /jobId=/i, label: "contains 'jobId='" },
    ];

    // Check each pattern against current URL
    const matchedLabels = [];

    for (const pattern of jobUrlPatterns) {
      if (pattern.regex.test(currentPageUrl)) {
        matchedLabels.push(pattern.label);
      }
    }
    // Logging matched patterns depending on results
    if (matchedLabels.length > 0) {
      console.log("[JobDetector] Matched patterns:");
      for (const label of matchedLabels) {
        console.log("  - " + label);
      }
      return true;
    } else {
      console.log("[JobDetector] No job URL patterns matched.");
      return false;
    }
  }

  const testUrl = "https://eofe.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/jobs/preview/70322/apply/section/1/?keyword=Internship+Program";

  detectUrlPatterns(testUrl);

  // ------------------------------------------------------------
  // 2) Detect an Apply button (normal HTML + Workday-specific)
  // ------------------------------------------------------------
  function pageHasApplyButton() {
    const clickableElements = document.querySelectorAll("a, button, input[type='submit']");

    const applyButtonRegex = /(apply|apply now|submit application)/i;

    for (const element of clickableElements) {
      const elementText = (element.innerText || element.value || "").trim();

      if (applyButtonRegex.test(elementText)) {
        return true;
      }
    }

    // Workday-specific selectors (like in your screenshot)
    const workdayApplyButton = document.querySelector("[data-automation-id='adventureButton'], [data-automation-id='applyButton']");

    if (workdayApplyButton) {
      return true;
    }

    return false;
  }

  // ------------------------------------------------------------
  // 3) Main detection logic (runs repeatedly)
  // ------------------------------------------------------------
  function detectJobPage() {
    const urlMatch = urlLooksLikeJobPage();
    const applyMatch = pageHasApplyButton();

    const isLikelyJobPage = urlMatch && applyMatch;

    console.log(`[JobDetector] Recheck → urlMatch=${urlMatch}, applyMatch=${applyMatch}`);

    // Only send message if detection status changes
    if (isLikelyJobPage && lastDetectionStatus !== true) {
      console.log("[JobDetector] Job page detected!");

      chrome.runtime.sendMessage(
        {
          type: "JOB_DETECTED_SIMPLE",
          url: window.location.href,
        },
        () => {}
      );

      lastDetectionStatus = true;
    }

    if (!isLikelyJobPage && lastDetectionStatus !== false) {
      console.log("[JobDetector] Not a job page.");

      lastDetectionStatus = false;
    }
  }

  // ------------------------------------------------------------
  // 4) Run detection every 2 seconds
  // ------------------------------------------------------------
  //   detectJobPage(); // initial run

  //   setInterval(() => {
  //     detectJobPage();
  //   }, 2000); // every 2 seconds
})();
