
(function () {
  if (document.getElementById("skGlobalExitButton")) return;

  var style = document.createElement("style");
  style.id = "skGlobalExitButtonStyle";
  style.textContent = `
    #skGlobalExitButton {
      position: fixed !important;
      top: calc(env(safe-area-inset-top, 0px) + 10px) !important;
      right: calc(env(safe-area-inset-right, 0px) + 10px) !important;
      z-index: 2147483647 !important;
      width: 42px !important;
      height: 42px !important;
      min-width: 42px !important;
      min-height: 42px !important;
      padding: 0 !important;
      border: 2px solid #fff !important;
      border-radius: 50% !important;
      background: #e53935 !important;
      color: #fff !important;
      font: bold 30px/36px Arial, sans-serif !important;
      text-align: center !important;
      box-shadow: 0 3px 12px #0005 !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      -webkit-tap-highlight-color: transparent;
    }
    #skGlobalExitButton:active {
      transform: scale(.92);
    }
  `;
  document.head.appendChild(style);

  var btn = document.createElement("button");
  btn.id = "skGlobalExitButton";
  btn.type = "button";
  btn.textContent = "\u00D7";
  btn.title = "Close / Exit";
  btn.setAttribute("aria-label", "Close page");

  btn.addEventListener("click", function () {
    window.close();
    window.setTimeout(function () {
      if (!window.closed) {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = "/";
        }
      }
    }, 150);
  });

  document.body.appendChild(btn);
})();
