
(function () {
  const selectors = [
    '#sasikumar-ai-hub-dashboard-card',
    '#skAllContentLiveCard',
    '#newSasikumarHome',
    '#newGoldServices',
    '#newEducationServices',
    '#newQuickServices',
    '#allJobs',
    '#banking-products',
    '#sasikumarPay2AllWallet',
    '#upi-bottom-dashboard',
    '#sk3DAdButton',
    '#skGoldApp'
  ];

  function cleanOptionB() {
    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.style.setProperty('display', 'none', 'important');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanOptionB, { once: true });
  } else {
    cleanOptionB();
  }
})();
