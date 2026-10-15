
(function () {
  function moveReplyBelowWelcome() {
    const welcome = document.getElementById("skWelcomeHero");
    const heading = document.getElementById("skReplyHeading");
    const quick = document.getElementById("skAIQuickQuestions");
    const reply = document.getElementById("sasikumarAIReplySection");
    const chat = document.getElementById("chat");
    const newBar = document.getElementById("skReplyToolsBar");

    if (!welcome || !heading || !quick || !reply || !chat || !newBar) {
      console.warn("SASIKUMAR AI: Required reply elements not found; no move performed.");
      return;
    }

    let anchor = welcome;
    [heading, quick, reply, chat].forEach(function (element) {
      anchor.insertAdjacentElement("afterend", element);
      anchor = element;
    });

    heading.style.display = "block";
    heading.style.width = "100%";
    heading.style.boxSizing = "border-box";

    newBar.style.setProperty("display", "flex", "important");
    newBar.style.flexWrap = "wrap";
    newBar.style.alignItems = "center";
    newBar.style.gap = "7px";
    newBar.style.width = "100%";
    newBar.style.visibility = "visible";
    newBar.style.opacity = "1";

    quick.style.display = "flex";
    quick.style.flexWrap = "wrap";

    reply.style.setProperty("display", "block", "important");
    reply.style.setProperty("visibility", "visible", "important");
    reply.style.width = "100%";
    reply.style.maxWidth = "900px";
    reply.style.boxSizing = "border-box";
    reply.style.margin = "12px auto 18px";
    reply.style.position = "relative";
    reply.style.zIndex = "2";

    chat.style.display = "block";
    chat.style.visibility = "visible";

    const initialGreeting = document.querySelector("#chat .skInitialGreeting");
    if (initialGreeting) initialGreeting.style.display = "none";

    const goldButton = document.getElementById("skGoldPriceToggle");
    if (goldButton) goldButton.style.display = "none";

    console.log("SASIKUMAR AI: Unified Reply toolbar positioned below Welcome.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", moveReplyBelowWelcome, { once: true });
  } else {
    moveReplyBelowWelcome();
  }
})();
