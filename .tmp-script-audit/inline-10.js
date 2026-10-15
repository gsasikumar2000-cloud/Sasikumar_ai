

const q=document.getElementById("q");
const chat=document.getElementById("chat");
const sendBtn=document.getElementById("sendBtn");

let recognition=null;
let voiceEnabled=false;
let autoVoice=false;
let darkMode=localStorage.getItem("sasikumar_ai_dark")==="1";

function escapeHtml(text){
  const d=document.createElement("div");
  d.textContent=text;
  return d.innerHTML;
}




async function skReplyWebSearch(){
  const input = document.getElementById("q");
  const chatBox = document.getElementById("chat");
  if (!input || !chatBox) {
    alert("Reply box unavailable.");
    return;
  }

  const query = input.value.trim();
  if (!query) {
    alert("முதலில் உங்கள் கேள்வியை எழுதுங்கள்.");
    input.focus();
    return;
  }

  let panel = document.getElementById("skReplyWebResults");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "skReplyWebResults";
    panel.style.cssText =
      "margin:12px 0;padding:12px;border:1px solid #93c5fd;" +
      "border-radius:14px;background:#eff6ff;color:#172554;" +
      "overflow-wrap:anywhere;";
    chatBox.appendChild(panel);
  }

  panel.innerHTML = "<strong>🌐 Web Tool</strong><p>Searching the web...</p>";
  panel.scrollIntoView({behavior:"smooth", block:"nearest"});

  try {
    const response = await fetch(
      "/api/global-search?q=" + encodeURIComponent(query),
      {headers: {"Accept":"application/json"}}
    );

    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (_) {
      data = {message: raw};
    }

    if (!response.ok) {
      throw new Error(
        (data && (data.error || data.message)) ||
        ("Search failed (HTTP " + response.status + ")")
      );
    }

    const results = Array.isArray(data) ? data :
      (data.results || data.data || data.items || []);

    const safeText = value => {
      const el = document.createElement("span");
      el.textContent = String(value == null ? "" : value);
      return el.innerHTML;
    };

    let html = "<strong>🌐 Web Search Results</strong>" +
      "<p><b>Query:</b> " + safeText(query) + "</p>";

    if (Array.isArray(results) && results.length) {
      html += results.slice(0, 8).map((item, index) => {
        if (typeof item === "string") {
          return "<div style='padding:9px 0;border-top:1px solid #bfdbfe'>" +
            safeText(item) + "</div>";
        }

        const title = item.title || item.name || ("Result " + (index + 1));
        const description =
          item.content || item.snippet || item.description || item.text || "";
        const url = item.url || item.link || "";
        let link = "";

        try {
          const parsed = new URL(url, window.location.origin);
          if (parsed.protocol === "https:" || parsed.protocol === "http:") {
            link = "<p><a href='" + safeText(parsed.href) +
              "' target='_blank' rel='noopener noreferrer'>Open source ↗</a></p>";
          }
        } catch (_) {}

        return "<article style='padding:10px 0;border-top:1px solid #bfdbfe'>" +
          "<b>" + safeText(title) + "</b><p>" +
          safeText(description) + "</p>" + link + "</article>";
      }).join("");
    } else {
      const summary = data.answer || data.summary || data.message || data.error;
      html += summary
        ? "<p>" + safeText(summary) + "</p>"
        : "<p>No search results returned. Please try another query.</p>";
    }

    panel.innerHTML = html;
  } catch (error) {
    panel.innerHTML =
      "<strong>🌐 Web Tool</strong><p>Search failed: " +
      safeText(error.message || "Unknown error") + "</p>" +
      "<p>Check the server and search API configuration.</p>";
  }
}

function goldHallmark(){
  const box = document.createElement("div");
  box.className = "msg ai";
  box.innerHTML = `
    <div class="report-box">
      <div class="report-head">
        <strong>🏷️ GOLD HALLMARK</strong>
        <div>SASIKUMAR AI • Gold Appraiser</div>
      </div>
      <h3>🏷️ BIS Hallmark Information</h3>
      <p><b>Hallmark</b> helps identify the purity and authenticity marking on gold jewellery.</p>
      <ul>
        <li>🔹 Check the BIS Hallmark symbol</li>
        <li>🔹 Check purity / fineness marking such as 22K / 916</li>
        <li>🔹 Check the unique HUID number where applicable</li>
        <li>🔹 For final confirmation, use an authorised testing method</li>
      </ul>
      <div style="margin-top:12px;padding:12px;border-radius:10px;background:#222;">
        ⚠️ <b>Appraiser Note:</b><br>
        Hallmark markings should be verified carefully before valuation or purchase.
      </div>
    </div>`;
  const chat = document.querySelector(".chat") || document.querySelector("#chat") || document.body;
  chat.appendChild(box);
  box.scrollIntoView({behavior:"smooth",block:"end"});
}

function goldBISExtra(){
  const box = document.createElement("div");
  box.className = "msg ai";
  box.innerHTML = `
    <div class="report-box">
      <div class="report-head">
        <strong>🛡️ BIS EXTRA</strong>
        <div>SASIKUMAR AI • Gold Safety</div>
      </div>
      <h3>🛡️ BIS Gold Safety Checklist</h3>
      <ul>
        <li>🏷️ Verify the BIS Hallmark</li>
        <li>🔢 Check the HUID / identification details</li>
        <li>⚖️ Confirm the jewellery weight</li>
        <li>💰 Check the current gold rate before valuation</li>
        <li>📋 Keep the purchase bill and valuation details</li>
      </ul>
      <div style="margin-top:12px;padding:12px;border-radius:10px;background:#222;">
        ⚠️ <b>Important:</b><br>
        BIS/Hallmark information does not replace professional purity testing when exact purity is required.
      </div>
    </div>`;
  const chat = document.querySelector(".chat") || document.querySelector("#chat") || document.body;
  chat.appendChild(box);
  box.scrollIntoView({behavior:"smooth",block:"end"});
}

function goldExpert(){ console.log("GOLD EXPERT CLICKED");
  const box=document.createElement("div");
  box.className="msg ai";

  box.innerHTML=`
  <div class="report-box">
    <div class="report-head">
      <img src="/assets/sasikumar-ai-logo.png" alt="SASIKUMAR AI" style="width:40px;height:40px;object-fit:contain;display:block;margin:0 auto 6px;">
      <h2>🔬 GOLD EXPERT PRO</h2>
      <div>SASIKUMAR AI • Gold Appraiser Tools</div>
    </div>

    <h3>⚖️ Professional Gold Testing</h3>

    <button class="loan-calc" onclick="goldPractical()">
      ⚖️ Density / Specific Gravity Test
    </button>

    <button class="loan-calc" onclick="goldKaratTool()">
      🥇 Karat / Purity Calculator
    </button>

    <button class="loan-calc" onclick="goldStoneTest()">
      🧪 Touch Stone + Acid Guide
    </button>

    <button class="loan-calc" onclick="goldRiskTool()">
      ⚠️ Gold Risk Assessment
    </button>

    <div style="margin-top:15px;padding:12px">
      🔍 <b>Appraiser Note</b><br>
      Screening results மட்டும் அடிப்படையாக வைத்து final purity முடிவு செய்ய வேண்டாம்.<br>
      XRF / assay confirmation பயன்படுத்தவும்.
    </div>
  </div>
  `;

  const chat=document.querySelector(".chat") || document.querySelector("#chat") || document.body;
  chat.appendChild(box);
  box.scrollIntoView({behavior:"smooth",block:"end"});
}

function openJobsFolder(){
  const target=document.getElementById("allJobs");
  if(!target){
    alert("💼 Jobs section not found.");
    return;
  }
  target.style.display="";
  target.scrollIntoView({behavior:"smooth",block:"start"});
  if(typeof renderSasikumarJobs==="function") renderSasikumarJobs();
}

function kidsService(){
  const oldBox=document.getElementById("sasikumarKidsPanel");
  if(oldBox){
    oldBox.scrollIntoView({behavior:"smooth",block:"start"});
    return;
  }

  const box=document.createElement("section");
  box.id="sasikumarKidsPanel";
  box.style.cssText="margin:20px 0;padding:18px;border-radius:16px;background:#111;color:#fff;";
  box.innerHTML=`
    <h2>👦 KIDS SERVICE</h2>
    <h3>📚 Learning</h3>
    <p>Alphabet • Numbers • Basic Maths • Science • General Knowledge</p>
    <h3>🎮 Fun & Games</h3>
    <p>Simple puzzles • Memory activities • Educational games</p>
    <h3>🛡️ Safety</h3>
    <p>Online safety • Safe internet habits • Learning with family guidance</p>
    <button type="button" onclick="skAIQuick('Kids learning help வேண்டும்')">🤖 Ask SASIKUMAR AI</button>
  `;

  const target=document.getElementById("dashboard") || document.getElementById("chat");
  if(target) target.parentNode.insertBefore(box,target);
  else document.body.appendChild(box);

  box.scrollIntoView({behavior:"smooth",block:"start"});
}

function skAIQuick(message){
  const input=document.getElementById("q");
  if(!input)return;
  input.value=message;
  input.focus();
  send();
}

let skSending = false;

async function send(){
  if (skSending) return;

  const message = q.value.trim();
  if (!message && !replyAttachment) return;

  skSending = true;
  let attachment = null;

  try {
    if (replyAttachment) {
      if (replyAttachment.size > 10 * 1024 * 1024) {
        alert("📎 File size 10 MB-க்கு மேல் இருக்கக்கூடாது.");
        skSending = false;
        return;
      }

      attachment = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || "");
          const comma = result.indexOf(",");
          resolve({
            data: comma >= 0 ? result.slice(comma + 1) : result,
            type: replyAttachment.type || "application/octet-stream",
            name: replyAttachment.name
          });
        };
        reader.onerror = () => reject(new Error("File read failed"));
        reader.readAsDataURL(replyAttachment);
      });
    }

    const userText = message
      ? "👤 " + escapeHtml(message)
      : "👤 📎 " + escapeHtml(replyAttachment.name);

    chat.innerHTML += '<div class="msg user">' + userText + '</div>';
    q.value = "";

    const loading = document.createElement("div");
    loading.className = "msg ai";
    loading.innerText = "🤖 பதில் எழுதுகிறது...";
    chat.appendChild(loading);
    bottomChat();

    sendBtn.disabled = true;
    sendBtn.innerText = "…";

    const conversationId = (() => {
      let id = sessionStorage.getItem("sasikumarConversationId");
      if (!id) {
        id = (crypto.randomUUID
          ? crypto.randomUUID()
          : "sk-" + Date.now() + "-" + Math.random().toString(36).slice(2));
        sessionStorage.setItem("sasikumarConversationId", id);
      }
      return id;
    })();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);

    let r;
    try {
      r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, attachment, conversationId }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timer);
    }

    const d = await r.json().catch(() => ({}));

    if (!r.ok) {
      console.error("SASIKUMAR AI API error:", r.status, d);
      throw new Error((d && d.reply) || ("HTTP " + r.status));
    }

    if (!d.reply) {
      console.error("SASIKUMAR AI empty response:", d);
      throw new Error("Empty AI reply");
    }

    if (window.skDesignPending) {
      window.skDesignPending = false;

      const rawDesignReply = String(d.reply || "");
      const designCodeBox = document.getElementById("skDesignCode");
      const designFrame = document.getElementById("skDesignPreviewFrame");

      let generatedHTML = "";
      const fencedBlocks = [...rawDesignReply.matchAll(/```(?:html)?\s*([\s\S]*?)```/gi)];

      for (const block of fencedBlocks) {
        const candidate = block[1].trim();
        if (/<(?:!doctype\s+html|html\b)/i.test(candidate)) {
          generatedHTML = candidate;
          break;
        }
      }

      if (!generatedHTML) {
        const startHTML = rawDesignReply.search(/<!doctype\s+html|<html\b/i);
        if (startHTML >= 0) {
          generatedHTML = rawDesignReply.slice(startHTML).trim();
        }
      }

      if (generatedHTML && designCodeBox) {
        designCodeBox.value = generatedHTML;
        if (designFrame) {
          designFrame.srcdoc = generatedHTML;
        }

        loading.innerText = "🤖 Design generated! Code added and preview updated below.";
        document.getElementById("skDesignMakerGlobal")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      } else {
        loading.innerText = "🤖 AI replied, but complete HTML was not detected. Try Website UI, Poster, or Logo again.";
        console.warn("Design Maker: HTML not detected in AI reply:", rawDesignReply);
      }
    } else {
      loading.innerText = "🤖 " + d.reply;
    }

    if (voiceEnabled && typeof speakTamil === "function") {
      speakTamil(String(d.reply).replace(/^🤖\s*/, ""));
    }

    if (replyAttachment && typeof removeReplyAttachment === "function") {
      removeReplyAttachment();
    }
  } catch (e) {
    window.skDesignPending = false;
    console.error("SASIKUMAR AI reply error:", e);

    const messageText = e.name === "AbortError"
      ? "⏳ பதில் வர அதிக நேரமாகிறது. மீண்டும் முயற்சிக்கவும்."
      : "🌐 இணைப்பில் சிக்கல் ஏற்பட்டது. இணையத்தைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.";

    const last = chat.lastElementChild;
    if (last && last.classList.contains("msg") && last.classList.contains("ai")) {
      last.innerText = messageText;
    } else {
      const errorBox = document.createElement("div");
      errorBox.className = "msg ai";
      errorBox.innerText = messageText;
      chat.appendChild(errorBox);
    }
  } finally {
    skSending = false;
    sendBtn.disabled = false;
    sendBtn.innerText = "Send";
    bottomChat();
  }
}
q.addEventListener("keydown",e=>{
 if(e.key==="Enter"&&!e.shiftKey){
   e.preventDefault();
   send();
 }
});

function bottomChat(){
 chat.scrollTo({
   top:chat.scrollHeight,
   behavior:"smooth"
 });
}

function topChat(){
 chat.scrollTo({
   top:0,
   behavior:"smooth"
 });
}

function toggleAutoVoice(){
  autoVoice=!autoVoice;
  const btn=document.getElementById("autoVoiceBtn");

  if(autoVoice){
    btn.innerText="🎙️ Auto ON";
    voiceEnabled=true;
    const vb=document.getElementById("voiceBtn");
    if(vb) vb.innerText="🔊 Voice ON";
    startVoice();
  }else{
    btn.innerText="🎙️ Auto Voice";
    stopAI();
  }
}

function startVoice(){

 const SR=window.SpeechRecognition||
          window.webkitSpeechRecognition;

 if(!SR){
   alert("🎤 இந்த browser-ல் voice recognition இல்லை.");
   return;
 }

 if(recognition){
   try{recognition.stop()}catch(e){}
 }

 recognition=new SR();
 recognition.lang="ta-IN";
 recognition.continuous=false;
 recognition.interimResults=false;

 recognition.onresult=e=>{
   q.value=e.results[0][0].transcript;
   q.focus();

   if(autoVoice)
     setTimeout(()=>send(),300);
 };

 recognition.start();
}

function toggleVoice(){
  voiceEnabled=!voiceEnabled;

  const btn=document.getElementById("voiceBtn");

  if(voiceEnabled){
    btn.innerText="🔊 Voice ON";
    speakTamil("AI Voice இயக்கப்பட்டது.");
  }else{
    btn.innerText="🔇 Voice OFF";
    if("speechSynthesis" in window)
      speechSynthesis.cancel();
  }
}

function speakTamil(text){

  if(!voiceEnabled || !("speechSynthesis" in window))
    return;

  speechSynthesis.cancel();

  const clean=String(text||"")
    .replace(/https?:\/\/\S+/g,"")
    .replace(/[🌐🤖👤🪙📰⚠️❌🔬📐💧⚖️]/g,"")
    .trim();

  if(!clean)return;

  const u=new SpeechSynthesisUtterance(clean);
  u.lang="ta-IN";
  u.rate=0.95;
  u.pitch=1;
  u.volume=1;

  speechSynthesis.speak(u);
}

function stopAI(){

 if("speechSynthesis" in window)
   speechSynthesis.cancel();

 if(recognition){
   try{recognition.stop()}catch(e){}
   recognition=null;
 }
}

async function copyChat(){

 try{
   await navigator.clipboard.writeText(chat.innerText);
   alert("📋 Chat நகலெடுக்கப்பட்டது ✅");
 }catch(e){
   alert("❌ Copy செய்ய முடியவில்லை.");
 }
}

async function shareChat(){

 const text=chat.innerText;

 if(navigator.share){
   try{
     await navigator.share({
       title:"SASIKUMAR AI",
       text:text
     });
   }catch(e){}
 }else{
   await copyChat();
 }
}

function clearChat(){

 if(!confirm("🧹 உரையாடலை அழிக்க வேண்டுமா?"))
   return;

 chat.innerHTML=
 '<div class="msg ai">🤖 வணக்கம்! நான் SASIKUMAR AI.<br><br>எதையும் கேளுங்கள்.</div>';
}




async function nationalNews(){

  const loading=document.createElement("div");
  loading.className="msg ai";

  const box=document.createElement("div");

  box.innerHTML=
    "📰 <b>District News Live</b><br><br>"+
    "🌐 State: "+
    '<select id="newsState" onchange="loadNewsDistricts()" style="padding:8px;border-radius:8px;">'+
    '<option value="TN">Tamil Nadu</option>'+
    '<option value="KL">Kerala</option>'+
    '<option value="KA">Karnataka</option>'+
    '<option value="AP">Andhra Pradesh</option>'+
    '<option value="TS">Telangana</option>'+
    '<option value="MH">Maharashtra</option>'+
    '<option value="GJ">Gujarat</option>'+
    '<option value="RJ">Rajasthan</option>'+
    '<option value="WB">West Bengal</option>'+
    '<option value="UP">Uttar Pradesh</option>'+
    '</select><br><br>'+
    "📍 District: "+
    '<select id="newsDistrict" style="padding:8px;border-radius:8px;"></select><br><br>'+
    '<button onclick="searchStateNews()" style="padding:9px 16px;border-radius:8px;">🔎 Search District News</button>'+
    '<div id="newsResult" style="margin-top:15px;white-space:pre-wrap;line-height:1.6;"></div>';

  loading.appendChild(box);
  chat.appendChild(loading);
  bottomChat();

  window.loadNewsDistricts=function(){

    const state=document.getElementById("newsState").value;
    const select=document.getElementById("newsDistrict");

    const districts={
      TN:["All Districts","Ariyalur","Chengalpattu","Chennai","Coimbatore","Cuddalore","Dharmapuri","Dindigul","Erode","Kallakurichi","Kancheepuram","Karur","Krishnagiri","Madurai","Mayiladuthurai","Nagapattinam","Namakkal","Perambalur","Pudukkottai","Ramanathapuram","Ranipet","Salem","Sivaganga","Tenkasi","Thanjavur","Theni","Thoothukudi","Tiruchirappalli","Tirunelveli","Tirupathur","Tiruppur","Tiruvallur","Tiruvannamalai","Tiruvarur","Vellore","Viluppuram","Virudhunagar"],
      KL:["All Districts","Alappuzha","Ernakulam","Idukki","Kannur","Kasaragod","Kollam","Kottayam","Kozhikode","Malappuram","Palakkad","Pathanamthitta","Thiruvananthapuram","Thrissur","Wayanad"],
      KA:["All Districts","Bagalkot","Ballari","Bengaluru Rural","Bengaluru Urban","Belagavi","Bidar","Chamarajanagar","Chikkaballapur","Chikkamagaluru","Chitradurga","Dakshina Kannada","Davanagere","Dharwad","Gadag","Hassan","Haveri","Kalaburagi","Kodagu","Kolar","Koppal","Mandya","Mysuru","Raichur","Ramanagara","Shivamogga","Tumakuru","Udupi","Uttara Kannada","Vijayapura","Yadgir"],
      AP:["All Districts","Anakapalli","Anantapur","Bapatla","Chittoor","East Godavari","Eluru","Guntur","Kakinada","Krishna","Kurnool","Nandyal","NTR","Palnadu","Prakasam","Srikakulam","Tirupati","Visakhapatnam","Vizianagaram","West Godavari","YSR Kadapa"],
      TS:["All Districts","Adilabad","Hyderabad","Karimnagar","Khammam","Nalgonda","Nizamabad","Rangareddy","Sangareddy","Warangal"],
      MH:["All Districts","Ahmednagar","Akola","Amravati","Aurangabad","Beed","Bhandara","Buldhana","Chandrapur","Dhule","Gadchiroli","Gondia","Jalgaon","Jalna","Kolhapur","Latur","Mumbai City","Mumbai Suburban","Nagpur","Nanded","Nashik","Palghar","Parbhani","Pune","Raigad","Ratnagiri","Sangli","Satara","Solapur","Thane","Wardha","Washim","Yavatmal"],
      GJ:["All Districts","Ahmedabad","Amreli","Anand","Banaskantha","Bharuch","Bhavnagar","Gandhinagar","Jamnagar","Junagadh","Kheda","Kutch","Mehsana","Navsari","Patan","Rajkot","Surat","Surendranagar","Vadodara","Valsad"],
      RJ:["All Districts","Ajmer","Alwar","Banswara","Barmer","Bharatpur","Bhilwara","Bikaner","Chittorgarh","Churu","Dausa","Dungarpur","Jaipur","Jaisalmer","Jalore","Jhalawar","Jhunjhunu","Jodhpur","Kota","Nagaur","Pali","Rajsamand","Sawai Madhopur","Sikar","Sirohi","Tonk","Udaipur"],
      WB:["All Districts","Alipurduar","Bankura","Birbhum","Cooch Behar","Darjeeling","Hooghly","Howrah","Jalpaiguri","Jhargram","Kolkata","Maldah","Murshidabad","Nadia","North 24 Parganas","South 24 Parganas","Paschim Medinipur","Purba Medinipur"],
      UP:["All Districts","Agra","Aligarh","Ayodhya","Azamgarh","Bareilly","Bijnor","Bulandshahr","Etawah","Farrukhabad","Fatehpur","Ghaziabad","Gorakhpur","Jhansi","Kanpur Nagar","Lucknow","Mathura","Meerut","Moradabad","Muzaffarnagar","Prayagraj","Rampur","Saharanpur","Sitapur","Varanasi"]
    };

    const list=districts[state]||["All Districts"];

    select.innerHTML=list.map(x=>'<option value="'+x+'">'+x+'</option>').join("");
  };

  window.searchStateNews=async function(){

    const state=document.getElementById("newsState").value;
    const district=document.getElementById("newsDistrict").value;
    const result=document.getElementById("newsResult");

    result.innerText="📰 "+district+" news தேடுகிறது...";

    try{
      const r=await fetch(
        "/api/state-news?state="+
        encodeURIComponent(state)+
        "&district="+
        encodeURIComponent(district)
      );

      const d=await r.json();

      if(!r.ok || !d.ok)
        throw new Error(d.reply||"News unavailable");

      const lines=String(d.reply)
        .split(/\r?/)
        .filter(Boolean)
        .slice(0,10);

      result.innerText=
        "🤖 📰 "+d.state+" - "+d.district+" News"+
        lines.join("");

    }catch(e){
      console.error(e);
      result.innerText=
        "❌ News தற்போது கிடைக்கவில்லை."+
        "சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.";
    }

    bottomChat();
  };

  loadNewsDistricts();
}


const content =
    document.getElementById("chat") ||
    document.getElementById("content") ||
    document.getElementById("mainContent") ||
    document.body;

  content.innerHTML = `
    <div id="skGoldApp">

      <button id="skGoldPriceToggle" type="button"
        aria-expanded="false"
        onclick="const panel=document.getElementById('skGoldDetails');const opening=panel.style.display==='none';panel.style.display=opening?'block':'none';this.textContent=opening?'✖️ HIDE GOLD PRICE':'🪙 GOLD PRICE';this.setAttribute('aria-expanded',String(opening));"
        style="display:block;width:100%;max-width:420px;margin:10px auto 14px;padding:13px 18px;border:0;border-radius:12px;cursor:pointer;font-weight:800;font-size:16px;background:linear-gradient(135deg,#f9d976,#f39c12);color:#332200;">
        🪙 GOLD PRICE
      </button>

      <div id="skGoldDetails" style="display:none;">

      <div class="skHeader">
        <div class="skLogo" style="width:30px!important;height:30px!important;min-width:30px!important;min-height:30px!important;max-width:30px!important;max-height:30px!important;flex:0 0 30px!important;padding:0!important;margin:0!important;overflow:hidden!important;"><img src="/assets/sasikumar-ai-logo.png?v=20261003" alt="SASIKUMAR AI" style="width:30px!important;height:30px!important;min-width:30px!important;min-height:30px!important;max-width:30px!important;max-height:30px!important;object-fit:contain!important;display:block!important;"></div>
        <div>
          <h2>Gold & Silver Price</h2>
          <p>🇮🇳 India • Live Market Rate</p>
        </div>
      </div>

      <div class="skLocation">

        <div class="skField">
          <label>🇮🇳 Select State</label>
          <select id="skState"></select>
        </div>

        <div class="skField">
          <label>📍 Select District</label>
          <select id="skDistrict"></select>
        </div>

        <button id="skRateButton" onclick="skLoadRates()">
          📊 GET LIVE GOLD + SILVER RATE
        </button>

      </div>

      <div id="skResult">
        <div class="skHint">
          🇮🇳 Select State and District<br>
          then tap <b>GET LIVE GOLD + SILVER RATE</b>
        </div>
      </div>

      </div>
    </div>
  `;

  const states = {
    "Tamil Nadu":[
      "Thanjavur","Chennai","Madurai","Coimbatore",
      "Tiruchirappalli","Salem","Tirunelveli","Vellore",
      "Erode","Tiruppur","Dindigul","Cuddalore",
      "Nagapattinam","Mayiladuthurai","Pudukkottai",
      "Kanchipuram","Thiruvallur","Virudhunagar"
    ],
    "Kerala":[
      "Thiruvananthapuram","Kollam","Pathanamthitta",
      "Alappuzha","Kottayam","Idukki","Ernakulam",
      "Thrissur","Palakkad","Malappuram","Kozhikode",
      "Wayanad","Kannur","Kasaragod"
    ],
    "Karnataka":[
      "Bengaluru Urban","Mysuru","Mangaluru","Belagavi",
      "Kalaburagi","Ballari","Tumakuru","Shivamogga"
    ],
    "Andhra Pradesh":[
      "Visakhapatnam","Vijayawada","Guntur","Tirupati",
      "Nellore","Kurnool","Kadapa","Rajahmundry"
    ],
    "Telangana":[
      "Hyderabad","Warangal","Nizamabad","Karimnagar",
      "Khammam","Nalgonda","Adilabad"
    ],
    "Maharashtra":[
      "Mumbai","Pune","Nagpur","Nashik","Thane",
      "Kolhapur","Solapur"
    ],
    "Gujarat":[
      "Ahmedabad","Surat","Vadodara","Rajkot",
      "Bhavnagar","Jamnagar"
    ],
    "Rajasthan":[
      "Jaipur","Jodhpur","Udaipur","Kota","Ajmer","Bikaner"
    ],
    "Delhi":[
      "New Delhi","North Delhi","South Delhi",
      "East Delhi","West Delhi"
    ],
    "West Bengal":[
      "Kolkata","Howrah","Darjeeling","Siliguri",
      "Durgapur","Asansol"
    ],
    "Uttar Pradesh":[
      "Lucknow","Kanpur","Agra","Varanasi",
      "Prayagraj","Ghaziabad","Noida","Meerut"
    ],
    "Madhya Pradesh":[
      "Bhopal","Indore","Gwalior","Jabalpur","Ujjain"
    ],
    "Bihar":[
      "Patna","Gaya","Muzaffarpur","Bhagalpur"
    ],
    "Odisha":[
      "Bhubaneswar","Cuttack","Puri","Rourkela","Sambalpur"
    ],
    "Punjab":[
      "Amritsar","Ludhiana","Jalandhar","Patiala","Bathinda"
    ],
    "Haryana":[
      "Gurugram","Faridabad","Panipat","Ambala","Hisar"
    ],
    "Jharkhand":[
      "Ranchi","Jamshedpur","Dhanbad","Bokaro"
    ],
    "Chhattisgarh":[
      "Raipur","Bhilai","Bilaspur","Korba"
    ],
    "Assam":[
      "Guwahati","Dibrugarh","Silchar","Jorhat"
    ],
    "Goa":[
      "North Goa","South Goa"
    ]
  };

  const stateBox = document.getElementById("skState");
  const districtBox = document.getElementById("skDistrict");

  stateBox.innerHTML =
    `<option value="">-- Select State --</option>` +
    Object.keys(states)
      .map(x => `<option value="${x}">${x}</option>`)
      .join("");

  function fillDistricts(){

    const state = stateBox.value;

    districtBox.innerHTML =
      `<option value="">-- Select District --</option>` +
      (states[state] || [])
        .map(x => `<option value="${x}">${x}</option>`)
        .join("");

    if(state === "Tamil Nadu"){
      districtBox.value = "Thanjavur";
    }
  }

  stateBox.onchange = fillDistricts;

  stateBox.value = "Tamil Nadu";
  fillDistricts();
  districtBox.value = "Thanjavur";


/* SASIKUMAR_GOLD_SILVER_AUTO_REFRESH */
(function setupSasikumarRateAutoRefresh(){
  if (window.__skRateAutoRefreshInstalled) return;
  window.__skRateAutoRefreshInstalled = true;

  let skRateRefreshTimer = null;

  function skScheduleRateRefresh(){
    if (skRateRefreshTimer) clearTimeout(skRateRefreshTimer);
    if (document.hidden) return;

    skRateRefreshTimer = setTimeout(async function(){
      if (!document.hidden) {
        const stateEl = document.getElementById("skState");
        const districtEl = document.getElementById("skDistrict");
        if (stateEl && districtEl && stateEl.value && districtEl.value &&
            typeof window.skLoadRates === "function") {
          try { await window.skLoadRates(); }
          catch (error) { console.error("Gold/Silver auto-refresh failed:", error); }
        }
      }
      skScheduleRateRefresh();
    }, 5 * 60 * 1000);
  }

  document.addEventListener("visibilitychange", function(){
    if (document.hidden) {
      if (skRateRefreshTimer) clearTimeout(skRateRefreshTimer);
      skRateRefreshTimer = null;
    } else {
      skScheduleRateRefresh();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", skScheduleRateRefresh, {once:true});
  } else {
    skScheduleRateRefresh();
  }
})();

function liveGoldRate(){
  const target = document.getElementById("skGoldApp");
  if (target) {
    target.scrollIntoView({behavior:"smooth", block:"start"});
  }
  return skLoadRates();
}

async function skLoadRates(){

  const state =
    document.getElementById("skState").value;

  const district =
    document.getElementById("skDistrict").value;

  const result =
    document.getElementById("skResult");

  if(!state){
    result.innerHTML =
      `<div class="skError">⚠️ Please select a State</div>`;
    return;
  }

  if(!district){
    result.innerHTML =
      `<div class="skError">⚠️ Please select a District</div>`;
    return;
  }

  result.innerHTML = `
    <div class="skLoading">
      ⏳ Loading live Gold + Silver rate...
      <small>${state} → ${district}</small>
    </div>
  `;

  try{

    const goldURL =
      "/api/gold-rate?state=" +
      encodeURIComponent(state) +
      "&district=" +
      encodeURIComponent(district);

    const silverURL =
      "/api/silver-rate?state=" +
      encodeURIComponent(state) +
      "&district=" +
      encodeURIComponent(district);

    const [goldFetch, silverFetch] = await Promise.allSettled([
  fetch(goldURL, { headers: { Accept: "application/json" } }),
  fetch(silverURL, { headers: { Accept: "application/json" } })
]);

async function skReadRateResponse(response, label) {
  const raw = await response.text();
  let data;

  try {
    data = JSON.parse(raw);
  } catch (e) {
    throw new Error(label + " API returned invalid JSON (HTTP " + response.status + ")");
  }

  if (!response.ok) {
    throw new Error(label + " API HTTP " + response.status + ": " + (data.reply || "Request failed"));
  }

  return data;
}

if (goldFetch.status !== "fulfilled") {
  throw new Error("Gold API network error: " + goldFetch.reason);
}
const gold = await skReadRateResponse(goldFetch.value, "Gold");

let silver = null;
try {
  if (silverFetch.status !== "fulfilled") {
    throw silverFetch.reason;
  }
  silver = await skReadRateResponse(silverFetch.value, "Silver");
} catch (silverError) {
  console.error("Silver rate unavailable:", silverError);
}

const money = n =>
      Number(n || 0).toLocaleString("en-IN");

    const money2 = n =>
      Number(n || 0).toLocaleString("en-IN",{
        minimumFractionDigits:2,
        maximumFractionDigits:2
      });

    result.innerHTML = `

      <div class="skSelected">
        📍 <b>${state}</b>
        <span>→</span>
        <b>${district}</b>
      </div>

      <div class="skTitle gold">🟨 GOLD</div>

      <div class="skGrid">

        <div class="skCard goldCard">
          <div>💎</div>
          <small>24K GOLD</small>
          <strong>₹${money(gold.rates["24K"])}</strong>
          <span>1 gram</span>
        </div>

        <div class="skCard goldCard">
          <div>🪙</div>
          <small>22K / 916</small>
          <strong>₹${money(gold.rates["22K"])}</strong>
          <span>1 gram</span>
        </div>

        <div class="skCard goldCard">
          <div>⚖️</div>
          <small>22K / 916</small>
          <strong>₹${money(gold.rates8g["22K"])}</strong>
          <span>8 gram / 1 சவரன்</span>
        </div>

      </div>

      <div class="skTitle silver">⚪ SILVER 999</div>

      <div class="skGrid">

        <div class="skCard silverCard">
          <div>⚪</div>
          <small>1 GRAM</small>
          <strong>${silver ? "₹" + money2(silver.price_gram_999 || silver.silver?.gram) : "Unavailable"}</strong>
          <span>999 Silver</span>
        </div>

        <div class="skCard silverCard">
          <div>⚪</div>
          <small>10 GRAMS</small>
          <strong>${silver ? "₹" + money2(silver.price_10g_999 || silver.silver?.tenGram) : "Unavailable"}</strong>
          <span>999 Silver</span>
        </div>

        <div class="skCard silverCard">
          <div>⚪</div>
          <small>1 KG</small>
          <strong>${silver ? "₹" + money(silver.price_kg_999 || silver.silver?.kg) : "Unavailable"}</strong>
          <span>999 Silver</span>
        </div>

      </div>

      <div class="skLive">
        🟢 LIVE RATE • ${state} • ${district}
      </div>

      <button
        class="skPosterButton"
        onclick="skShowPoster('${state.replace(/'/g,"\\'")}','${district.replace(/'/g,"\\'")}')">
        🖼️ VIEW LIVE DAILY POSTER
      </button>

      <div id="skPoster"></div>
    `;

  }catch(error){

    console.error(error);

    result.innerHTML = `
      <div class="skError">
        ❌ Live Gold + Silver rate unavailable
        <small>${error.message}</small>
      </div>
    `;
  }
}


window.skLoadRates = skLoadRates;

function skShowPoster(state,district){
  const box = document.getElementById("skPoster");
  if(!box) return;

  box.innerHTML = `
    <div class="skPosterCard">
      <h3>🖼️ SASIKUMAR AI — Daily Gold & Silver</h3>
      <p>🇮🇳 ${state} → ${district}</p>
      <p>⏳ Loading current rates...</p>
    </div>
  `;

  const qs = "?state=" + encodeURIComponent(state) +
             "&district=" + encodeURIComponent(district);

  async function readRate(response, label){
    const body = await response.text();
    let data;

    try {
      data = JSON.parse(body);
    } catch(e) {
      throw new Error(
        label + " API returned invalid JSON (HTTP " +
        response.status + "). Please retry."
      );
    }

    if(!response.ok || !data || data.ok === false){
      throw new Error(
        (data && (data.reply || data.error || data.message)) ||
        label + " rate unavailable (HTTP " + response.status + ")"
      );
    }

    return data;
  }

  Promise.all([
    fetch("/api/gold-rate" + qs, {
      headers: { "Accept": "application/json" }
    }),
    fetch("/api/silver-rate" + qs, {
      headers: { "Accept": "application/json" }
    })
  ])
  .then(async responses => {
    const gold = await readRate(responses[0], "Gold");
    const silver = await readRate(responses[1], "Silver");

    if(!gold.rates || !gold.rates8g){
      throw new Error("Gold API response is missing rate data.");
    }

    const money = n => {
      const value = Number(n);
      return Number.isFinite(value)
        ? value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        : "Unavailable";
    };

    box.innerHTML = `
      <div class="skPosterCard" style="padding:18px;border:2px solid #d4af37;border-radius:16px;background:linear-gradient(135deg,#fffdf3,#edf8ff);color:#222;text-align:center;overflow-wrap:anywhere">
        <h3>🇮🇳 SASIKUMAR AI</h3>
        <h3>🟨 LIVE GOLD & ⚪ SILVER 999</h3>
        <p><b>${state} → ${district}</b></p>
        <hr>
        <p>🟨 24K Gold / 1 gram<br><strong>₹${money(gold.rates["24K"])}</strong></p>
        <p>🟨 22K Gold / 1 gram<br><strong>₹${money(gold.rates["22K"])}</strong></p>
        <p>🟨 22K Gold / 8 grams<br><strong>₹${money(gold.rates8g["22K"])}</strong></p>
        <hr>
        <p>⚪ Silver 999 / 1 gram<br><strong>₹${money(silver.price_gram_999)}</strong></p>
        <p>⚪ Silver 999 / 10 grams<br><strong>₹${money(silver.price_10g_999)}</strong></p>
        <p>⚪ Silver 999 / 1 kg<br><strong>₹${money(silver.price_kg_999)}</strong></p>
        <small>Source: OroPocket reference prices</small><br>
        <small>Gold updated: ${gold.updatedAt || gold.date || "Latest API response"}</small><br>
        <small>Silver updated: ${silver.updatedAt || "Latest API response"}</small><br>
        <small>Jewellery/shop rates may differ.</small><br>
        <button type="button" onclick="window.print()" style="margin-top:12px;padding:10px 18px;border-radius:8px">🖨️ Print / Save PDF</button>
      </div>
    `;
  })
  .catch(error => {
    console.error("Daily poster error:", error);
    box.innerHTML = `
      <div class="skError">
        ❌ Live poster unavailable
        <small>${String(error.message || "Rate API error")}</small>
      </div>
    `;
  });
}

document.addEventListener("DOMContentLoaded",()=>{const b=document.getElementById("bankingServicesBtn");if(b)b.addEventListener("click",bankingServices);});

function bankingServices(){
 const chat=document.getElementById("chat");
 if(!chat){
  alert("⚠️ Chat area not found");
  return;
 }

 const old=document.getElementById("bankingServiceMessage");
 if(old) old.remove();

 const box=document.createElement("div");
 box.id="bankingServiceMessage";
 box.className="msg ai";

 box.innerHTML=`
 <div class="loan-box">
  <h3>🏦 BANKING SERVICES</h3>

  <div class="loan-grid">

   <label>🏦 Bank / Nidhi Type
    <select id="bankType">
     <option value="">Select</option>
     <option>Bank</option>
     <option>Small Finance Bank</option>
     <option>Co-operative Bank</option>
     <option>Nidhi</option>
     <option>NBFC</option>
    </select>
   </label>

   <label>💳 Type of Loan
    <select id="bankLoanType">
     <option value="">Select</option>
     <option>Gold Loan</option>
     <option>Personal Loan</option>
     <option>Business Loan</option>
     <option>Vehicle Loan</option>
     <option>Other</option>
    </select>
   </label>

   <label>👤 Customer Name
    <input id="bankCustomerName" type="text" placeholder="Customer Name">
   </label>

   <label>📱 Mobile Number
    <input id="bankMobile" type="tel" maxlength="10" inputmode="numeric" placeholder="10 digit mobile">
   </label>

   <label>🌐 State
    <select id="bankState">
     <option>Tamil Nadu</option>
     <option>Other State</option>
    </select>
   </label>

   <label>📍 District
    <input id="bankDistrict" type="text" placeholder="District">
   </label>

   <label>📍 Taluk
    <input id="bankTaluk" type="text" placeholder="Taluk">
   </label>

   <label>✅ Responsibilities
    <select id="bankResponsibility">
     <option value="">Select</option>
     <option>YES</option>
     <option>NO</option>
    </select>
   </label>

   <label>💰 Loan Amount
    <input id="bankLoanAmount" type="number" min="0" placeholder="Loan Amount">
   </label>

  </div>

  <button class="loan-calc" type="button" onclick="submitBankingService()">
   📤 SUBMIT / FORWARD
  </button>

  <div id="bankingResult" class="loan-result">
   Customer details உள்ளிட்டு Submit செய்யுங்கள்.
  </div>
 </div>`;

 chat.appendChild(box);
 bottomChat();
}

async function submitBankingService(){
 const result=document.getElementById("bankingResult");

 const name=document.getElementById("bankCustomerName").value.trim();
 const mobile=document.getElementById("bankMobile").value.trim();
 const bankType=document.getElementById("bankType").value;
 const loanType=document.getElementById("bankLoanType").value;
 const state=document.getElementById("bankState").value;
 const district=document.getElementById("bankDistrict").value.trim();
 const taluk=document.getElementById("bankTaluk").value.trim();
 const responsibility=document.getElementById("bankResponsibility").value;
 const loanAmount=document.getElementById("bankLoanAmount").value.trim();

 if(!name){
  alert("⚠️ Customer Name உள்ளிடுங்கள்.");
  return;
 }

 if(!/^[0-9]{10}$/.test(mobile)){
  alert("⚠️ சரியான 10 digit Mobile Number உள்ளிடுங்கள்.");
  return;
 }

 if(!bankType){
  alert("⚠️ Bank / Nidhi Type தேர்வு செய்யுங்கள்.");
  return;
 }

 if(!loanType){
  alert("⚠️ Loan Type தேர்வு செய்யுங்கள்.");
  return;
 }

 result.innerHTML="⏳ <b>Banking request அனுப்பப்படுகிறது...</b>";

 const application={
  id:"BANK-"+Date.now(),
  bankType,
  loanType,
  customerName:name,
  name,
  mobile,
  state,
  district,
  taluk,
  responsibility,
  loanAmount,
  submittedAt:Date.now(),
  status:"SUBMITTED"
 };

 try{
  const response=await fetch("/api/banking-test",{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({
    bankType,
    loanType,
    customerName:name,
    mobile,
    loanAmount
   })
  });

  const data=await response.json();

  if(!response.ok || !data.ok){
   throw new Error(data.reply || "Banking API failed");
  }

  localStorage.setItem(
   "bankingServiceApplication",
   JSON.stringify(application)
  );

  result.innerHTML=
   "✅ <b>Banking Application Submitted</b><br><br>"+
   "🆔 Application ID: <b>"+application.id+"</b><br>"+
   "👤 Customer: <b>"+name+"</b><br>"+
   "📱 Mobile: <b>"+mobile+"</b><br>"+
   "🏦 Bank: <b>"+bankType+"</b><br>"+
   "💳 Loan: <b>"+loanType+"</b><br>"+
   "💰 Amount: <b>₹"+(loanAmount || "Not specified")+"</b><br>"+
   ": <b>"+district+" / "+taluk+"</b><br>"+
   "📌 Status: <b>SUBMITTED</b><br><br>"+
   "⏱️ Application received successfully.<br><br>"+
   (data.whatsapp
     ? "📲 WhatsApp notification sent."
     : "⚠️ WhatsApp notification is not configured yet.");

 }catch(error){
  console.error("Banking Submit Error:",error);

  result.innerHTML=
   "❌ <b>Banking submission failed</b><br><br>"+
   "Reason: "+error.message+"<br><br>"+
   "Please try again.";
 }
}

function loanCalculations(){
  const old=document.getElementById("loanCalculationMessage");
  if(old) old.remove();

  const box=document.createElement("div");
  box.id="loanCalculationMessage";
  box.className="msg ai";

  box.innerHTML=`
    <div class="loan-box">
      <h3>🧮 LOAN CALCULATIONS</h3>

      <label>📌 Calculator Type
        <select id="loanCalcType">
          <option value="emi">EMI Loan</option>
          <option value="gold">Gold Loan</option>
          <option value="personal">Personal Loan</option>
          <option value="home">Home Loan</option>
          <option value="interest">Simple Interest</option>
          <option value="fd">FD Estimate</option>
          <option value="rd">RD Estimate</option>
        </select>
      </label>

      <label>💰 Amount / Principal
        <input id="loanAmount" type="number" min="0" placeholder="Enter amount">
      </label>

      <label>📈 Annual Interest %
        <input id="loanRate" type="number" min="0" step="0.01" placeholder="Interest rate">
      </label>

      <label>📅 Tenure (months)
        <input id="loanMonths" type="number" min="1" placeholder="Months">
      </label>

      <button type="button" onclick="calculateLoan()">🧮 Calculate</button>

      <div id="loanCalcResult" class="loan-result" style="margin-top:12px"></div>

      <div style="margin-top:10px">
        <small>ℹ️ Illustrative calculation only. Actual lender rates, fees and terms may differ.</small>
      </div>
    </div>
  `;

  const chat=document.getElementById("chat");
  if(chat){
    chat.appendChild(box);
    setTimeout(bottomChat,300);
  }
}

function calculateLoan(){
  const amount=Number(document.getElementById("loanAmount").value);
  const rate=Number(document.getElementById("loanRate").value);
  const months=Number(document.getElementById("loanMonths").value);
  const result=document.getElementById("loanCalcResult");

  if(!amount || amount<=0 || rate<0 || !months || months<=0){
    result.innerHTML="⚠️ Please enter valid Amount, Interest and Tenure.";
    return;
  }

  const monthlyRate=rate/100/12;
  let emi;

  if(monthlyRate===0){
    emi=amount/months;
  }else{
    emi=amount*monthlyRate*Math.pow(1+monthlyRate,months)/
      (Math.pow(1+monthlyRate,months)-1);
  }

  const total=emi*months;
  const interest=total-amount;

  result.innerHTML=
    "✅ <b>Calculation Result</b><br><br>"+
    "💰 Principal: ₹"+amount.toFixed(2)+"<br>"+
    "📈 Interest: "+rate.toFixed(2)+"%<br>"+
    "📅 Tenure: "+months+" months<br><br>"+
    "💳 <b>Monthly EMI: ₹"+emi.toFixed(2)+"</b><br>"+
    "💵 Total Interest: ₹"+interest.toFixed(2)+"<br>"+
    "💵 Total Payment: ₹"+total.toFixed(2);
}
function goldKaratTool(){
 const box=document.createElement("div");
 box.className="msg ai";
 box.innerHTML=`
 <div class="report-box">
  <div class="report-head">
   <h2>🥇 KARAT / PURITY CALCULATOR</h2>
   <div>SASIKUMAR AI • Gold Appraiser</div>
  </div>
  <div style="margin:14px 0;padding:15px;border-radius:16px;background:rgba(255,193,7,.10);border:1px solid rgba(255,193,7,.35)">
   <h3>👨‍💼 Professional Gold Appraiser</h3>
   <p>A Gold Appraiser evaluates the authenticity, purity, weight and estimated value of gold items such as jewellery, coins and bullion.</p>
   <ul>
    <li>⚖️ Accurate weight recording</li>
    <li>🥇 Karat and purity assessment</li>
    <li>🔎 Hallmark and authenticity review</li>
    <li>💰 Reference-rate based valuation</li>
    <li>📋 Appraisal report preparation</li>
   </ul>
   <small>Final purity and valuation should be confirmed using appropriate professional testing and applicable institutional requirements.</small>
  </div>
  <table class="report-table">
   <tr><td>Gold Weight (g)</td><td><input id="gkWeight" type="number" step="0.001" placeholder="Example: 10"></td></tr>
   <tr><td>Karat</td><td>
    <select id="gkKarat">
     <option value="24">24K</option>
     <option value="23">23K</option>
     <option value="22">22K / 916</option>
     <option value="21">21K</option>
     <option value="20">20K</option>
     <option value="18">18K / 750</option>
     <option value="14">14K / 585</option>
     <option value="9">9K / 375</option>
    </select>
   </td></tr>
  </table>
  <button class="loan-calc" onclick="calculateGoldKarat()">🥇 Calculate Purity</button>
  <div id="goldKaratResult" style="margin-top:15px"></div>
 </div>`;
 const chat=document.querySelector(".chat") || document.querySelector("#chat") || document.body;
 chat.appendChild(box);
 box.scrollIntoView({behavior:"smooth",block:"end"});
}

function calculateGoldKarat(){
 const weight=parseFloat(document.getElementById("gkWeight").value);
 const karat=parseFloat(document.getElementById("gkKarat").value);
 const result=document.getElementById("goldKaratResult");
 if(!Number.isFinite(weight) || weight<=0){
  result.innerHTML="❌ Gold Weight உள்ளிடவும்.";
  return;
 }
 const purity=karat/24;
 const fineGold=weight*purity;
 result.innerHTML="🥇 <b>Karat:</b> "+karat+"K<br><br>"+
  "📊 <b>Purity:</b> "+(purity*100).toFixed(2)+"%<br><br>"+
  "⚖️ <b>Weight:</b> "+weight.toFixed(3)+" g<br><br>"+
  "✨ <b>Fine Gold:</b> "+fineGold.toFixed(3)+" g";
}

function goldStoneTest(){
 const box=document.createElement("div");
 box.className="msg ai";
 box.innerHTML=`
 <div class="report-box">
  <div class="report-head">
   <h2>🧪 TOUCH STONE + ACID GUIDE</h2>
   <div>SASIKUMAR AI • Gold Appraiser</div>
  </div>
  <h3>🔬 Practical Screening Guide</h3>
  <table class="report-table">
   <tr><th>Observation</th><th>Possible Indication</th></tr>
   <tr><td>Yellow streak remains strong</td><td>Higher gold content may be indicated</td></tr>
   <tr><td>Streak fades after comparison</td><td>Lower karat may be indicated</td></tr>
   <tr><td>Strong reaction / streak disappears</td><td>Further testing required</td></tr>
  </table>
  <div style="margin-top:15px;padding:12px">
   ⚠️ <b>Safety & Appraiser Note</b><br>
   Acid testing should be performed only with appropriate professional procedures and protective equipment.<br><br>
   Touch-stone testing is a screening method only; it does not by itself prove exact purity.<br>
   Final confirmation: XRF / certified assay.
  </div>
 </div>`;
 const chat=document.querySelector(".chat") || document.querySelector("#chat") || document.body;
 chat.appendChild(box);
 box.scrollIntoView({behavior:"smooth",block:"end"});
}

function goldRiskTool(){
 const box=document.createElement("div");
 box.className="msg ai";
 box.innerHTML=`
 <div class="report-box">
  <div class="report-head">
   <h2>⚠️ GOLD RISK ASSESSMENT</h2>
   <div>SASIKUMAR AI • Gold Appraiser</div>
  </div>
  <h3>📊 Practical Screening Checklist</h3>
  <table class="report-table">
   <tr><td>Purity / hallmark concern</td><td><select id="riskPurity"><option value="0">Low</option><option value="25">Concern</option><option value="50">High</option></select></td></tr>
   <tr><td>Stone / non-gold material concern</td><td><select id="riskStone"><option value="0">Low</option><option value="20">Concern</option><option value="40">High</option></select></td></tr>
   <tr><td>Weight / density mismatch</td><td><select id="riskDensity"><option value="0">Low</option><option value="20">Concern</option><option value="40">High</option></select></td></tr>
  </table>
  <button class="loan-calc" onclick="calculateGoldRisk()">⚠️ Calculate Risk</button>
  <div id="goldRiskResult" style="margin-top:15px"></div>
 </div>`;
 const chat=document.querySelector(".chat") || document.querySelector("#chat") || document.body;
 chat.appendChild(box);
 box.scrollIntoView({behavior:"smooth",block:"end"});
}

function calculateGoldRisk(){
 const p=Number(document.getElementById("riskPurity").value);
 const s=Number(document.getElementById("riskStone").value);
 const d=Number(document.getElementById("riskDensity").value);
 const score=Math.min(100,p+s+d);
 let level="🟢 LOW RISK";
 if(score>=60) level="🔴 HIGH RISK";
 else if(score>=30) level="🟠 MEDIUM RISK";
 document.getElementById("goldRiskResult").innerHTML=
  "⚠️ <b>Risk Score:</b> "+score+"%<br><br>"+
  "<b>Assessment:</b> "+level+"<br><br>"+
  "⚠️ Screening assessment மட்டும். Final lending / purity decisionக்கு physical verification மற்றும் applicable internal policy பயன்படுத்தவும்.";
}

function goldPractical(){

 const box=document.createElement("div");
 box.className="msg ai";

 box.innerHTML=`
 <div class="report-box">

   <div class="report-head">
     <h2>⚖️ GOLD EXPERT PRACTICAL TEST</h2>
     <div>SASIKUMAR AI • Gold Appraiser</div>
   </div>

   <h3>🔬 Density / Specific Gravity Test</h3>

   <table class="report-table">
     <tr>
       <td>Air Weight (g)</td>
       <td><input id="gpAir" type="number" step="0.001" placeholder="Example: 10.000"></td>
     </tr>

     <tr>
       <td>Water Weight (g)</td>
       <td><input id="gpWater" type="number" step="0.001" placeholder="Example: 9.480"></td>
     </tr>
   </table>

   <button class="loan-calc" onclick="calculateGoldPractical()">
     🔬 Calculate Density
   </button>

   <div id="goldPracticalResult" style="margin-top:15px"></div>

 </div>
 `;

 const chat=document.querySelector(".chat") ||
            document.querySelector("#chat") ||
            document.body;

 chat.appendChild(box);

 box.scrollIntoView({behavior:"smooth",block:"end"});
}


function calculateGoldPractical(){

 const air=parseFloat(document.getElementById("gpAir").value);
 const water=parseFloat(document.getElementById("gpWater").value);
 const result=document.getElementById("goldPracticalResult");

 if(!Number.isFinite(air) || !Number.isFinite(water)){
   result.innerHTML="❌ Air Weight மற்றும் Water Weight உள்ளிடவும்.";
   return;
 }

 if(air<=0 || water<=0 || water>=air){
   result.innerHTML="❌ Weight values சரிபார்க்கவும். Water reading, Air weight-ஐ விட குறைவாக இருக்க வேண்டும்.";
   return;
 }

 const density=air/(air-water);

 let estimate="";

 if(density>=19.0){
   estimate="🟢 24K அருகிலான density range";
 }else if(density>=17.3){
   estimate="🟡 22K அருகிலான range";
 }else if(density>=16.5){
   estimate="🟡 21K அருகிலான range";
 }else if(density>=15.0){
   estimate="🟠 18K–20K range இருக்கலாம்";
 }else{
   estimate="🔴 Low density — மேலும் testing தேவை";
 }

 result.innerHTML=
   "⚖️ <b>Specific Gravity / Density:</b> "+
   density.toFixed(3)+"<br><br>"+
   "<b>Practical indication:</b> "+estimate+
   "<br><br>"+
   "⚠️ இது ஒரு screening/practical indication மட்டும். "+
   "Alloy composition, stones, cavities மற்றும் test conditions காரணமாக result மாறலாம். "+
   "Final purity confirmationக்கு XRF/assay testing பயன்படுத்தவும்.";
}



function shareAppraisalReport(btn){
  const report = btn.closest(".report-box, .appraisal-report, .report-card") || btn.parentElement.parentElement;
  const text = report ? report.innerText : "SASIKUMAR AI Appraiser Report";

  if(navigator.share){
    navigator.share({
      title: "SASIKUMAR AI - Appraiser Report",
      text: text
    }).catch(()=>{});
  }else if(navigator.clipboard){
    navigator.clipboard.writeText(text).then(()=>{
      alert("Report copied. You can paste it in WhatsApp or other apps.");
    });
  }else{
    alert("Sharing is not supported on this device.");
  }
}

function printAppraisalReport(btn){
  const id = btn && btn.dataset ? btn.dataset.id : btn;
  const el = document.getElementById("appraisalReport" + id);

  if (!el) {
    alert("Appraisal Report not found");
    return;
  }

  const w = window.open("", "_blank");
  if (!w) {
    alert("Please allow pop-ups for SASIKUMAR AI");
    return;
  }

  w.document.write(
    "<!doctype html><html><head><meta charset='utf-8'>" +
    "<meta name='viewport' content='width=device-width,initial-scale=1'>" +
    "<title>SASIKUMAR AI - Appraisal Report</title>" +
    "<style>body{font-family:Arial,sans-serif;margin:20px;color:#111;background:#fff}.report-box{max-width:850px;margin:auto}</style>" +
    "</head><body>" + el.outerHTML + "</body></html>"
  );

  w.document.close();
  setTimeout(function(){ try { w.print(); } catch(e) {} }, 700);
}

function smartHomeAsk(service) {
  const chat = document.getElementById("chat");
  const input = document.querySelector("#chat input, #chat textarea");
  if (input) {
    input.value = service + " பற்றி உதவி வேண்டும்";
    input.dispatchEvent(new Event("input", {bubbles:true}));
    input.focus();
  }
  if (chat) chat.scrollIntoView({behavior:"smooth", block:"center"});
}
