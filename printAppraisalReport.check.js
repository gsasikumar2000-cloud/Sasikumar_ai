function printAppraisalReport(btn){
  const report = btn && btn.closest ? btn.closest(".report-box") : null;

  if(!report){
    alert("Appraisal Report not found.");
    return;
  }

  const w = window.open("", "_blank");

  if(!w){
    alert("Please allow pop-ups for Print / PDF.");
    return;
  }

  const clone = report.cloneNode(true);

  clone.querySelectorAll("input, textarea, select").forEach(function(el){
    if(el.type === "file"){
      el.remove();
      return;
    }

    let value = "";

    if(el.tagName === "SELECT"){
      const opt = el.options[el.selectedIndex];
      value = opt ? opt.textContent.trim() : "";
    }else{
      value = el.value || "";
    }

    const span = document.createElement("span");
    span.textContent = value;
    span.style.whiteSpace = "pre-wrap";
    span.style.display = "inline-block";
    span.style.minHeight = "20px";
    el.replaceWith(span);
  });

  clone.querySelectorAll("button").forEach(function(el){
    el.remove();
  });

  clone.querySelectorAll(".report-actions, .no-print").forEach(function(el){
    el.remove();
  });

  clone.querySelectorAll("img").forEach(function(img){
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.display = "block";
    img.style.margin = "10px auto";
  });

  w.document.open();
  w.document.write(
    "<!doctype html>" +
    "<html><head>" +
    "<meta charset='utf-8'>" +
    "<meta name='viewport' content='width=device-width,initial-scale=1'>" +
    "<title>SASIKUMAR AI - Appraisal Report</title>" +
    "<style>" +
    "body{font-family:Arial,sans-serif;margin:20px;color:#111;background:#fff;}" +
    ".report-box{max-width:850px;margin:auto;background:#fff;}" +
    ".report-head{text-align:center;margin-bottom:20px;}" +
    ".report-head h2{margin:0 0 6px;}" +
    ".report-head div{margin:3px 0;}" +
    "table{width:100%;border-collapse:collapse;margin:10px 0 18px;}" +
    "td,th{border:1px solid #999;padding:9px;text-align:left;vertical-align:top;}" +
    "td:first-child{font-weight:bold;width:32%;}" +
    "img{max-width:100%;height:auto;display:block;margin:10px auto;}" +
    "h3{margin-top:18px;border-bottom:1px solid #ccc;padding-bottom:5px;}" +
    "@media print{body{margin:10mm}.report-box{max-width:none}}" +
    "</style>
<style id="sk-bottom-logo-final-fix">
.sk-all-content-logo{
  text-align:center!important;
  overflow:hidden!important;
  max-width:100%!important;
}
.sk-all-content-logo img{
  width:50px!important;
  height:50px!important;
  max-width:50px!important;
  max-height:50px!important;
  object-fit:contain!important;
  display:block!important;
  margin:8px auto!important;
}
@media(max-width:600px){
  .sk-all-content-logo img{
    width:42px!important;
    height:42px!important;
    max-width:42px!important;
    max-height:42px!important;
  }
}
</style>


<style id="sk-final-logo-hide">
.sk-all-content-logo{
  display:none!important;
  width:0!important;
  height:0!important;
  max-width:0!important;
  max-height:0!important;
  margin:0!important;
  padding:0!important;
  overflow:hidden!important;
}
.sk-all-content-logo img{
  display:none!important;
}
</style>


<style id="sasikumar-font-style">
:root{
  --font-main: Inter, "Noto Sans Tamil", "Noto Sans", Arial, sans-serif;
}
html,body{
  font-family:var(--font-main)!important;
  font-size:15px;
  line-height:1.5;
}
h1{
  font-size:clamp(26px,5vw,32px)!important;
  font-weight:800!important;
  line-height:1.2;
}
h2{
  font-size:clamp(20px,4vw,24px)!important;
  font-weight:750!important;
  line-height:1.25;
}
h3{
  font-size:clamp(17px,3.5vw,19px)!important;
  font-weight:700!important;
}
button,.btn,a.button{
  font-size:15px!important;
  font-weight:650!important;
}
.card,.service-card,.dashboard-card{
  font-size:14px;
}
.card strong,.service-card strong,.dashboard-card strong{
  font-size:16px;
  font-weight:700;
}
small,.small{
  font-size:12px!important;
}
@media(max-width:600px){
  html,body{font-size:14px;}
  h1{font-size:26px!important;}
  h2{font-size:21px!important;}
  h3{font-size:17px!important;}
  button,.btn,a.button{font-size:14px!important;}
}
</style>


<style id="sasikumar-title-animation">
.sasikumar-title,
h1.sasikumar-ai-title{
  animation:sasikumarTitleIn 1.2s ease-out both,
            sasikumarGlow 3s ease-in-out 1.2s infinite;
  transform-origin:center;
}
@keyframes sasikumarTitleIn{
  0%{opacity:0;transform:translateY(-18px) scale(.96);}
  100%{opacity:1;transform:translateY(0) scale(1);}
}
@keyframes sasikumarGlow{
  0%,100%{text-shadow:0 0 4px rgba(255,215,0,.25);}
  50%{text-shadow:0 0 14px rgba(255,215,0,.65);}
}
@media(prefers-reduced-motion:reduce){
  .sasikumar-title,
  h1.sasikumar-ai-title{
    animation:none!important;
  }
}
</style>


<style id="sasikumar-global-search-style">
#sasikumar-global-search{
  position:relative;
  max-width:760px;
  margin:14px auto 20px;
  z-index:1000;
}
</style>

</head><body>

</div>


" +
    clone.outerHTML +
    "
<!-- LIFESTYLE BOOKLIFE -->
<section id="booklife-dashboard" style="margin:20px 0;">
  <div style="
    padding:20px;
    border-radius:20px;
    background:linear-gradient(135deg,#fff8e1,#f3e5f5,#e3f2fd);
    box-shadow:0 8px 25px rgba(0,0,0,.12);
  ">
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;">
      📘 Lifestyle BookLife
    </h2>
    <p style="margin:0 0 16px;opacity:.8;">
      Books • Novels • Science • Lifestyle
    </p>

    <div style="
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(140px,1fr));
      gap:12px;
    ">
      <button onclick="alert('📚 Books — Tamil, English, Business, Education, History & Biography')"
        style="padding:16px;border:0;border-radius:16px;font-size:15px;font-weight:700;cursor:pointer;">
        📚 Books
      </button>

      <button onclick="alert('📖 Novels — Tamil, English, Mystery, Adventure & Short Stories')"
        style="padding:16px;border:0;border-radius:16px;font-size:15px;font-weight:700;cursor:pointer;">
        📖 Novels
      </button>

      <button onclick="alert('🔬 Science — Space, Physics, Chemistry, Biology & Nature')"
        style="padding:16px;border:0;border-radius:16px;font-size:15px;font-weight:700;cursor:pointer;">
        🔬 Science
      </button>

      <button onclick="alert('🌱 Lifestyle — Learning, Time Management, Communication & Daily Life')"
        style="padding:16px;border:0;border-radius:16px;font-size:15px;font-weight:700;cursor:pointer;">
        🌱 Lifestyle
      </button>
    </div>
  </div>
</section>

      <button onclick="alert('✍️ கவிதை — தமிழ் கவிதைகள், இயற்கை, வாழ்க்கை, நட்பு மற்றும் ஊக்கக் கவிதைகள்')"
        style="padding:16px;border:0;border-radius:16px;font-size:15px;font-weight:700;cursor:pointer;">
        ✍️ கவிதை
      </button>

      <button onclick="alert('💎 பொன்மொழி — வாழ்க்கை, அறிவு, வெற்றி மற்றும் நல்ல சிந்தனை பொன்மொழிகள்')"
        style="padding:16px;border:0;border-radius:16px;font-size:15px;font-weight:700;cursor:pointer;">
        💎 பொன்மொழி
      </button>

      <button onclick="alert('👑 History Leaders — World Leaders, Indian Leaders, Tamil Historical Leaders, Kings, Freedom Fighters & Social Reformers')"
        style="padding:16px;border:0;border-radius:16px;font-size:15px;font-weight:700;cursor:pointer;">
        👑 History Leaders
      </button>
<!-- END LIFESTYLE BOOKLIFE -->


<script id="booklife-search-script">
function searchBookLife(){
  const input=document.getElementById("booklifeSearch");
  const result=document.getElementById("booklifeSearchResult");
  if(!input || !result) return;

  const q=input.value.trim().toLowerCase();
  if(!q){
    result.innerHTML="";
    return;
  }

  const items=[
    ["📚 Books","Books Tamil English Business Education History Biography"],
    ["📖 Novels","Novels Tamil English Mystery Adventure Short Stories"],
    ["🔬 Science","Science Space Physics Chemistry Biology Nature"],
    ["🌱 Lifestyle","Lifestyle Learning Time Management Communication Daily Life"],
    ["✍️ கவிதை","Kavithai Tamil poetry nature life friendship motivation"],
    ["💎 பொன்மொழி","Ponmozhi quotes life wisdom success knowledge"],
    ["👑 History Leaders","World Leaders Indian Leaders Tamil Historical Leaders Kings Freedom Fighters Social Reformers"]
  ];

  const found=items.filter(x=>
    (x[0]+" "+x[1]).toLowerCase().includes(q)
  );

  result.innerHTML=found.length
    ? found.map(x=>`<div style="padding:10px 12px;margin:6px 0;border-radius:10px;background:#f5f5f5;font-weight:600;">${x[0]}</div>`).join("")
    : '<div style="padding:10px;">No matching BookLife category found.</div>';
}
</script>


<script id="sasikumar-global-search-script">
(function(){
  const input=document.getElementById("sasikumarGlobalSearchInput");
  const results=document.getElementById("sasikumar-search-results");
  if(!input || !results) return;

  function clean(t){
    return (t||"").replace(/\s+/g," ").trim();
  }

  function escapeHtml(t){
    return String(t).replace(/[&<>"']/g,function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];
    });
  }

  function buildIndex(){
    const selectors=[
      "section",
      "article",
      "main",
      "div.card",
      "div.service-card",
      "div.dashboard-card",
      "[class*='card']",
      "[class*='service']",
      "[class*='dashboard']",
      "button",
      "a",
      "h1","h2","h3","h4","h5","h6",
      "[data-search]"
    ];

    const nodes=document.querySelectorAll(selectors.join(","));
    const seen=new Set();
    const items=[];

    nodes.forEach(function(el){
      if(el.closest("#sasikumar-global-search")) return;
      if(el.closest("script,style,noscript")) return;

      const text=clean(el.innerText||el.textContent);
      if(text.length<2) return;

      const titleEl=el.querySelector("h1,h2,h3,h4,h5,h6,strong,.title");
      const title=clean(
        titleEl ? titleEl.innerText :
        el.getAttribute("aria-label") ||
        el.getAttribute("title") ||
        el.innerText ||
        el.textContent
      );

      if(!title) return;

      const key=title.toLowerCase()+"|"+text.slice(0,250).toLowerCase();
      if(seen.has(key)) return;
      seen.add(key);

      items.push({
        el:el,
        title:title.slice(0,120),
        text:text.toLowerCase()
      });
    });

    return items;
  }

  function showResults(query){
    const q=clean(query).toLowerCase();

    if(!q){
      results.innerHTML="";
      results.style.display="none";
      return;
    }

    const words=q.split(/\s+/).filter(Boolean);

    const items=buildIndex().filter(function(item){
      const haystack=item.title.toLowerCase()+" "+item.text;

      return words.every(function(word){
        return haystack.includes(word);
      });
    }).slice(0,25);

    if(!items.length){
      results.innerHTML=
        '<div style="padding:15px;font-size:14px;">⏳ Searching web with SASIKUMAR AI...</div>';
      results.style.display="block";

      fetch("/api/global-search?q=" + encodeURIComponent(query))
        .then(function(response){ return response.json(); })
        .then(function(data){
          if(!data || !data.success){
            throw new Error("Global search failed");
          }

          var html = "";

          if(data.answer){
            html +=
              '<div style="padding:15px;background:#f7f9fc;border-bottom:1px solid #ddd;white-space:pre-line;font-size:14px;line-height:1.6;">' +
              escapeHtml(data.answer) +
              '</div>';
          }

          if(data.results && data.results.length){
            html += data.results.slice(0,5).map(function(item){
              return '<a href="' + escapeHtml(item.url || "#") +
                '" target="_blank" rel="noopener noreferrer" style="display:block;padding:12px 15px;border-bottom:1px solid #eee;text-decoration:none;color:#111;">' +
                '🌐 ' + escapeHtml(item.title || "Web Result") +
                '</a>';
            }).join("");
          }

          if(!html){
            html =
              '<div style="padding:15px;font-size:14px;">🔎 No result found.</div>';
          }

          results.innerHTML = html;
          results.style.display="block";
        })
        .catch(function(){
          results.innerHTML=
            '<div style="padding:15px;font-size:14px;">⚠️ Global Search temporarily unavailable.</div>';
          results.style.display="block";
        });

      return;
    }

    results.innerHTML=items.map(function(item,i){
      return '<button type="button" class="sasikumar-search-item" data-index="'+i+'" style="display:block;width:100%;padding:13px 15px;border:0;border-bottom:1px solid #eee;background:#fff;text-align:left;font:inherit;font-size:14px;cursor:pointer;">🔎 '+escapeHtml(item.title)+'</button>';
    }).join("");

    results.querySelectorAll(".sasikumar-search-item").forEach(function(btn,i){
      btn.addEventListener("click",function(){
        const el=items[i].el;

        if(el){
          el.scrollIntoView({
            behavior:"smooth",
            block:"center"
          });

          el.style.outline="3px solid currentColor";
          el.style.outlineOffset="4px";

          setTimeout(function(){
            el.style.outline="";
            el.style.outlineOffset="";
          },1800);
        }

        results.style.display="none";
        input.blur();
      });
    });

    results.style.display="block";
  }

  input.addEventListener("input",function(){
    showResults(input.value);
  });

  input.addEventListener("keydown",function(e){
    if(e.key==="Escape"){
      results.style.display="none";
      input.blur();
    }
  });

  document.addEventListener("click",function(e){
    if(!e.target.closest("#sasikumar-global-search")){
      results.style.display="none";
    }
  });
})();
</script>

</body></html>"
  );
  w.document.close();
  w.focus();

  setTimeout(function(){
    try{
      w.print();
    }catch(e){
      alert("Print failed. Please try again.");
    }
  },700);
}