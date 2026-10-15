
(function () {
  function hideLegacyReplyTools() {
    document.querySelectorAll(
      'button[onclick*="noteCamera"], button[onclick*="noteUpload"]'
    ).forEach(function (button) {
      if (!button.closest("#skReplyToolsBar")) {
        button.style.display = "none";
      }
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hideLegacyReplyTools, {once:true});
  } else {
    hideLegacyReplyTools();
  }
})();
