
(function(){
  const items = [
    {
      icon:"🪙",
      title:"LIVE GOLD & SILVER",
      text:"Today's Gold & Silver Poster",
      url:"/daily-gold-poster.svg",
      button:"Open Live Poster"
    },
    {
      icon:"💼",
      title:"LIVE JOBS",
      text:"Latest Jobs & Career Opportunities",
      url:"/jobs/",
      button:"Open Jobs"
    },
    {
      icon:"⚽",
      title:"LIVE SPORTS",
      text:"Sports & Games Updates",
      url:"/sports/",
      button:"Open Sports"
    },
    {
      icon:"📜",
      title:"DAILY THIRUKKURAL",
      text:"Daily Thirukkural & Meaning",
      url:"/hub-dashboard.html",
      button:"Open Thirukkural"
    },
    {
      icon:"🖼️",
      title:"LIVE IMAGES",
      text:"SASIKUMAR AI Live Images",
      url:"/daily-gold-poster.svg",
      button:"Open Live Image"
    },
    {
      icon:"🎬",
      title:"LIVE VIDEO",
      text:"SASIKUMAR AI Video Content",
      url:"/daily-video.html",
      button:"Open Video"
    },
    {
      icon:"🛠️",
      title:"SASIKUMAR AI SERVICES",
      text:"All Services • Tools • Smart Features",
      url:"/#newSasikumarHome",
      button:"Open Services"
    }
  ];

  let index = 0;

  function renderAllContent(){
    const box = document.getElementById("skAllContentLiveBox");
    const dots = document.querySelectorAll(".sk-live-dot");

    if(!box) return;

    const item = items[index];

    box.innerHTML =
      '<div class="sk-live-icon">'+item.icon+'</div>'+
      '<div class="sk-live-title">'+item.title+'</div>'+
      '<div class="sk-live-text">'+item.text+'</div>'+
      '<button type="button" id="skAllContentOpen">'+item.button+'</button>';

    box.style.animation="none";
    void box.offsetWidth;
    box.style.animation="skContentIn .5s ease";

    const openBtn = document.getElementById("skAllContentOpen");

    if(openBtn){
      openBtn.addEventListener("click",function(e){
        e.stopPropagation();
        window.open(item.url,"_blank");
      });
    }

    dots.forEach(function(dot,i){
      dot.classList.toggle("active",i===index);
    });
  }

  renderAllContent();

  setInterval(function(){
    index = (index + 1) % items.length;
    renderAllContent();
  },120000);
})();
