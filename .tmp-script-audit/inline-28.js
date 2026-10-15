
(function(){
  "use strict";
  function addBrandLogos(){
    var cards = document.querySelectorAll(
      ".skMainLiveGrid > .skMainFeatureCard, #skLiveBookCardsRow > *"
    );
    cards.forEach(function(card){
      if(card.querySelector(":scope > .skCardBrandBadge")) return;
      var badge = document.createElement("div");
      badge.className = "skCardBrandBadge";
      badge.setAttribute("aria-label","SASIKUMAR AI brand");
      var img = document.createElement("img");
      img.src = "/assets/sasikumar-ai-logo.png";
      img.alt = "SASIKUMAR AI";
      img.loading = "lazy";
      img.onerror = function(){
        badge.textContent = "SK";
        badge.style.color = "#14532d";
        badge.style.fontWeight = "900";
        badge.style.fontSize = "16px";
      };
      badge.appendChild(img);
      card.appendChild(badge);
    });
  }
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded",addBrandLogos);
  }else{
    addBrandLogos();
  }
  var observer = new MutationObserver(addBrandLogos);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(function(){observer.disconnect();},15000);
})();
