
(function(){
  const data = {
    gold:{
      icon:"🪙", title:"Gold & Silver",
      detail:"Live Gold Rate, Silver Rate and useful gold calculation tools.",
      url:"/"
    },
    education:{
      icon:"📚", title:"Education Hub",
      detail:"Class 1–12 learning, equations, subjects, Q&A and learning tools.",
      url:"/education/equations.html"
    },
    jobs:{
      icon:"💼", title:"Jobs Hub",
      detail:"Central Government, State Government, Bank Jobs and job application tools.",
      url:"/jobs/"
    },
    sports:{
      icon:"🏆", title:"Sports Hub",
      detail:"Sports information and useful sports sections in SASIKUMAR AI.",
      url:"/sports/"
    },
    ai:{
      icon:"🤖", title:"Ask SASIKUMAR AI",
      detail:"Ask questions and get AI-powered assistance from the dashboard.",
      url:"/"
    },
    appraiser:{
      icon:"📋", title:"Gold Appraiser Report",
      detail:"Customer details, weight, purity, rate, value, remarks, image, Save, Load, Clear and Print/PDF.",
      url:"/"
    },
    poster:{
      icon:"🖼️", title:"Daily Gold Poster",
      detail:"Daily SASIKUMAR AI gold poster with current rate information.",
      url:"/daily-gold-poster.svg"
    },
    equations:{
      icon:"📐", title:"Mathematics & Equations",
      detail:"Class 1–12 mathematics equations, calculators and learning tools.",
      url:"/education/equations.html"
    }
  };

  let current = "gold";

  window.skPreview = function(type){
    current = data[type] ? type : "gold";
    const x = data[current];

    document.getElementById("skPreviewContent").innerHTML = `
      <div style="font-size:48px">${x.icon}</div>
      <h2 style="margin:8px 0">${x.title}</h2>
      <p style="font-size:17px;line-height:1.6">${x.detail}</p>
      <div style="padding:12px;border-radius:14px;background:#f5f7fb;">
        <b>SASIKUMAR AI Preview</b><br>
        Select “Open Full Page” to continue.
      </div>
    `;

    document.getElementById("skPreviewPanel").style.display = "block";
  };

  window.skOpenPreview = function(){
    const x = data[current];

    if(current === "gold" && typeof liveGoldRate === "function"){
      document.getElementById("skPreviewPanel").style.display = "none";
      liveGoldRate();
      return;
    }

    if(current === "appraiser" && typeof goldReport === "function"){
      document.getElementById("skPreviewPanel").style.display = "none";
      goldReport();
      return;
    }

    if(current === "ai"){
      document.getElementById("skPreviewPanel").style.display = "none";
      const chat = document.getElementById("chatInput") ||
                   document.querySelector('textarea') ||
                   document.querySelector('input[type="text"]');
      if(chat){
        chat.scrollIntoView({behavior:"smooth",block:"center"});
        chat.focus();
      } else {
        window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});
      }
      return;
    }

    window.location.href = x.url;
  };

  document.addEventListener("click", function(e){
    const panel = document.getElementById("skPreviewPanel");
    if(e.target === panel) panel.style.display = "none";
  });
})();
