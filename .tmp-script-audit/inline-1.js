
(function(){
  const input = document.getElementById("saiReplyInput");
  if (!input || input.dataset.enterReady === "1") return;

  input.dataset.enterReady = "1";

  input.addEventListener("keydown", function(e){
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const btn = this.parentElement?.querySelector("button");
      if (btn) btn.click();
    }
  });
})();
