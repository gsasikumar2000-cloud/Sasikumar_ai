
function openDailyPoster(){
  const url="https://www.sasikumarai.com/daily-gold-poster.svg";
  const text="இன்றைய SASIKUMAR AI Daily Gold & Silver Poster";

  const old=document.getElementById("dailyPosterSharePanel");
  if(old) old.remove();

  const panel=document.createElement("div");
  panel.id="dailyPosterSharePanel";
  panel.style.cssText=
    "position:fixed;inset:0;background:rgba(0,0,0,.72);"+
    "z-index:99999;display:flex;align-items:center;justify-content:center;"+
    "padding:12px;box-sizing:border-box;";

  panel.innerHTML=
    '<div style="width:min(94vw,420px);max-height:94vh;overflow:auto;'+
    'background:#fff;border-radius:20px;padding:14px;box-sizing:border-box;'+
    'box-shadow:0 10px 50px rgba(0,0,0,.45);text-align:center">'+
    '<h3 style="margin:4px 0 12px">🖼️ Daily Gold & Silver Poster</h3>'+
    '<div style="background:#f5f5f5;border-radius:14px;padding:8px">'+
    '<img id="dpPosterImage" src="'+url+'" alt="SASIKUMAR AI Daily Gold and Silver Poster" '+
    'style="width:100%;height:auto;display:block;border-radius:10px">'+
    '</div>'+
    '<button id="dpCopyImage" style="width:100%;padding:13px;margin:6px 0;border:0;border-radius:10px">📋 Copy Image</button>'+
    '<button id="dpSave" style="width:100%;padding:13px;margin:6px 0;border:0;border-radius:10px">💾 Save Poster</button>'+
    '<button id="dpShare" style="width:100%;padding:13px;margin:6px 0;border:0;border-radius:10px">📤 Share</button>'+
    '<button id="dpWhatsApp" style="width:100%;padding:13px;margin:6px 0;border:0;border-radius:10px">🟢 WhatsApp</button>'+
    '<button id="dpCopy" style="width:100%;padding:13px;margin:6px 0;border:0;border-radius:10px">🔗 Copy Link</button>'+
    '<button id="dpOpen" style="width:100%;padding:13px;margin:6px 0;border:0;border-radius:10px">👁️ Open Full Poster</button>'+
    '<button id="dpClose" style="width:100%;padding:11px;margin-top:8px;border:0;border-radius:10px">✕ Close</button>'+
    '</div>';

  document.body.appendChild(panel);

  document.getElementById("dpSave").onclick=()=>{
    const a=document.createElement("a");
    a.href=url;
    a.download="SASIKUMAR-AI-Daily-Gold-Silver-Poster.svg";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  document.getElementById("dpCopyImage").onclick=async()=>{
    try{
      const response=await fetch(url);
      const blob=await response.blob();
      if(navigator.clipboard && window.ClipboardItem){
        await navigator.clipboard.write([
          new ClipboardItem({[blob.type]:blob})
        ]);
        alert("✅ Poster image copied!");
      }else{
        alert("📋 Image copy is not supported. Use Save or Share.");
      }
    }catch(e){
      alert("📋 Image copy failed. Use Save or Share.");
    }
  };

  document.getElementById("dpShare").onclick=async()=>{
    if(navigator.share){
      try{
        await navigator.share({
          title:"SASIKUMAR AI - Daily Gold & Silver Poster",
          text,
          url
        });
      }catch(e){}
    }else{
      alert("📤 Share is not supported. Use WhatsApp or Copy Link.");
    }
  };

  document.getElementById("dpWhatsApp").onclick=()=>{
    window.open(
      "https://wa.me/?text="+encodeURIComponent(text+""+url),
      "_blank"
    );
  };

  document.getElementById("dpCopy").onclick=async()=>{
    try{
      await navigator.clipboard.writeText(url);
      alert("✅ Poster link copied!");
    }catch(e){
      prompt("Copy this poster link:",url);
    }
  };

  document.getElementById("dpOpen").onclick=()=>{
    window.open(url,"_blank");
  };

  document.getElementById("dpClose").onclick=()=>{
    panel.remove();
  };
}
window.makeClickableLinks=function(text){return String(text).replace(/(https?:\/\/[^\s<]+)/g,"<a class=\"ai-link\" href=\"$1\" target=\"_blank\" rel=\"noopener noreferrer\">$1</a>");};