
(function(){
  if(window.__skYTCardAutoRefresh5Min) return;
  window.__skYTCardAutoRefresh5Min = true;

  function refreshCards(){
    if(document.hidden) return;
    var section = document.getElementById('skYouTubeCreativeCards');
    if(!section) return;

    section.querySelectorAll('iframe.sk-yt-video').forEach(function(frame){
      var src = frame.getAttribute('src');
      if(!src || !/youtube(-nocookie)?\.com$/i.test(
        (function(){try{return new URL(src).hostname}catch(e){return ''}})()
      )) return;

      /* Reload only when the card is on screen to reduce unnecessary data use. */
      var rect = frame.getBoundingClientRect();
      if(rect.bottom > 0 && rect.top < window.innerHeight){
        frame.src = src;
      }
    });
  }

  window.setInterval(refreshCards, 5 * 60 * 1000);
})();
