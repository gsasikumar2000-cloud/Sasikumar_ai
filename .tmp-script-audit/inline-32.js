
(function(){
  if(window.__skUniformYTCardsV1) return;
  window.__skUniformYTCardsV1=true;

  function setup(){
    var section=document.getElementById('skYouTubeCreativeCards');
    var row=section && section.querySelector('.sk-yt-grid');
    if(!row || row.dataset.skAutoSwipeReady==='1') return;
    row.dataset.skAutoSwipeReady='1';

    var timer=null;
    var paused=false;

    function stop(){ if(timer){clearInterval(timer);timer=null;} }
    function start(){
      stop();
      timer=setInterval(function(){
        if(paused || document.hidden) return;
        var max=row.scrollWidth-row.clientWidth;
        if(max<=4) return;
        if(row.scrollLeft>=max-4){
          row.scrollTo({left:0,behavior:'smooth'});
        }else{
          var card=row.querySelector('.sk-yt-card');
          row.scrollBy({
            left:card ? card.getBoundingClientRect().width+14 : 260,
            behavior:'smooth'
          });
        }
      },3500);
    }

    row.addEventListener('touchstart',function(){paused=true;},{passive:true});
    row.addEventListener('touchend',function(){
      setTimeout(function(){paused=false;},1800);
    },{passive:true});
    row.addEventListener('mouseenter',function(){paused=true;});
    row.addEventListener('mouseleave',function(){paused=false;});
    row.addEventListener('pointerdown',function(){paused=true;});
    row.addEventListener('pointerup',function(){
      setTimeout(function(){paused=false;},1800);
    });
    document.addEventListener('visibilitychange',function(){
      if(document.hidden) stop(); else start();
    });
    start();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',setup);
  }else{
    setup();
  }
  setTimeout(setup,1500);
})();
