
(function(){
  function updateWelcomeClock(){
    const now=new Date();
    const date=now.toLocaleDateString("en-IN",{
      weekday:"long",year:"numeric",month:"long",day:"numeric"
    });
    const time=now.toLocaleTimeString("en-IN",{
      hour:"2-digit",minute:"2-digit",second:"2-digit"
    });
    const d=document.getElementById("skWelcomeDate");
    const t=document.getElementById("skWelcomeTime");
    const fp=document.getElementById("skFirstPageDateTime");
    if(d)d.textContent=date;
    if(t)t.textContent=time;
    if(fp)fp.textContent=date+" • "+time;
  }
  updateWelcomeClock();
  setInterval(updateWelcomeClock,1000);

  async function loadVideoAd(){
    const video=document.getElementById("skVideoAd");
    const status=document.getElementById("skVideoAdStatus");
    const open=document.getElementById("skVideoAdOpen");
    if(!video)return;
    try{
      const r=await fetch("/api/video/library",{cache:"no-store"});
      if(!r.ok)throw new Error("Video library HTTP "+r.status);
      const data=await r.json();
      const list=Array.isArray(data)?data:(data.items||data.videos||[]);
      const item=list.find(x=>x && (x.videoUrl||x.url||x.file||x.id));
      if(!item)throw new Error("No video available");
      const url=item.videoUrl || item.url || item.file ||
        (item.id ? "/api/video/file/"+encodeURIComponent(item.id) : "");
      if(!url)throw new Error("Video URL missing");
      video.src=url;
      video.style.display="block";
      status.textContent="SASIKUMAR AI • Video Ad";
      open.style.display="inline-block";
      open.onclick=()=>window.open(url,"_blank");
    }catch(e){
      console.warn("Video Ad:",e);
      status.textContent="🎬 Video Ad library empty — add a video from HUB → Video Library";
    }
  }
  loadVideoAd();
})();
