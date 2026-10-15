
(function(){
  "use strict";

  var selectors = ".skMainLiveGrid > .skMainFeatureCard, #skLiveBookCardsRow > *, #skVideoAdCard";
  var storageKey = "sasikumarAILiveCardOrderV1";
  var active = null, startX = 0, startY = 0, moved = false;
  var saveTimer = null;

  function cardKey(card, index){
    if(card.id) return "id:" + card.id;
    var title = card.querySelector("h1,h2,h3,h4,[data-card-key]");
    var label = title ? title.textContent.trim().replace(/\s+/g," ").slice(0,100) : "";
    return "label:" + (label || card.className || "card") + ":" + index;
  }

  function saveOrders(){
    try{
      var groups = {};
      document.querySelectorAll(".skMainLiveGrid, #skLiveBookCardsRow").forEach(function(parent){
        var cards = Array.prototype.filter.call(parent.children,function(el){
          return el.matches(".skMainFeatureCard, #skVideoAdCard, #skLiveImagesCard") ||
                 el.matches(selectors);
        });
        if(!cards.length) return;
        groups[parent.id || parent.className || parent.tagName] = cards.map(function(card,index){
          return cardKey(card,index);
        });
      });
      localStorage.setItem(storageKey,JSON.stringify(groups));
    }catch(err){}
  }

  function scheduleSave(){
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveOrders,180);
  }

  function restoreOrders(){
    try{
      var saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      document.querySelectorAll(".skMainLiveGrid, #skLiveBookCardsRow").forEach(function(parent){
        var key = parent.id || parent.className || parent.tagName;
        var order = saved[key];
        if(!Array.isArray(order) || !order.length) return;
        var cards = Array.from(parent.children);
        var byKey = new Map();
        cards.forEach(function(card,index){
          byKey.set(cardKey(card,index),card);
        });
        order.forEach(function(id){
          var card = byKey.get(id);
          if(card && card.parentElement === parent) parent.appendChild(card);
        });
      });
    }catch(err){}
  }

  function enableCards(){
    document.querySelectorAll(selectors).forEach(function(card){
      if(card.dataset.skDragReady === "1") return;
      card.dataset.skDragReady = "1";
      card.classList.add("skDragEnabled");
      card.setAttribute("title","Hold and drag to move this card");

      card.addEventListener("pointerdown",function(e){
        if(e.target.closest("button,a,input,textarea,select,video,audio,[contenteditable=true]")) return;
        if(e.pointerType === "mouse" && e.button !== 0) return;
        active = card;
        startX = e.clientX;
        startY = e.clientY;
        moved = false;
      });
    });
  }

  document.addEventListener("pointermove",function(e){
    if(!active) return;
    if(Math.abs(e.clientX-startX)>8 || Math.abs(e.clientY-startY)>8) moved = true;
    if(!moved) return;

    active.classList.add("skDragging");
    var target = document.elementFromPoint(e.clientX,e.clientY);
    if(!target) return;

    var other = target.closest(selectors);
    if(!other || other === active || other.parentElement !== active.parentElement) return;

    var r = other.getBoundingClientRect();
    var before = e.clientX < r.left + r.width/2;
    other.parentElement.insertBefore(active,before ? other : other.nextSibling);
  });

  function finish(){
    if(active) active.classList.remove("skDragging");
    if(active && moved) scheduleSave();
    active = null;
    moved = false;
  }

  document.addEventListener("pointerup",finish);
  document.addEventListener("pointercancel",finish);

  restoreOrders();
  enableCards();

  var observer = new MutationObserver(function(){
    enableCards();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(function(){observer.disconnect();},20000);
})();
