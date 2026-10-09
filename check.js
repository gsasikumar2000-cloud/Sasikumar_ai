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

function goldExpert(){
  const box=document.createElement("div");
  box.className="msg ai";

  box.innerHTML=`
  <div class="report-box">
    <div class="report-head">
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

async function send(){
 const message=q.value.trim();
 if(!message)return;
 chat.innerHTML+=
   '<div class="msg user">👤 '+escapeHtml(message)+'</div>';

 q.value="";

 const loading=document.createElement("div");
 loading.className="msg ai";
 loading.innerText="🤖 பதில் எழுதுகிறது...";
 chat.appendChild(loading);

 bottomChat();

 sendBtn.disabled=true;
 sendBtn.innerText="…";

 try{

   const r=await fetch("/api/chat",{
     method:"POST",
     headers:{"Content-Type":"application/json"},
     body:JSON.stringify({message})
   });

   if(!r.ok)throw new Error("HTTP "+r.status);

   const d=await r.json();

   loading.innerText=d.reply
     ?"🤖 "+d.reply
     :"❌ பதில் கிடைக்கவில்லை.";

 }catch(e){

   console.error(e);

   loading.innerText=
     "❌ Server connection error.\n\n"+
     "Server இயங்குகிறதா என்று பார்க்கவும்.";

 }finally{

   sendBtn.disabled=false;
   sendBtn.innerText="Send";
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




async function thanjavurNews(){

  const loading=document.createElement("div");
  loading.className="msg ai";
  loading.innerText="📰 தஞ்சாவூர் மாவட்ட Top News தேடுகிறது...";
  chat.appendChild(loading);
  bottomChat();

  try{

    const r=await fetch("/api/thanjavur-news");
    const d=await r.json();

    if(!r.ok || !d.ok)
      throw new Error(d.reply||"News unavailable");

    loading.innerText=
      "🤖 📰 தஞ்சாவூர் மாவட்ட செய்திகள்\n\n"+
      d.reply;

  }catch(e){

    console.error(e);

    loading.innerText=
      "❌ தஞ்சாவூர் மாவட்ட செய்திகள் தற்போது கிடைக்கவில்லை.\n\n"+
      "சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.";

  }

  bottomChat();
}

async function liveGoldRate(){

  const loading=document.createElement("div");
  loading.className="msg ai";
  loading.innerText="🤖 Chennai Live Gold Rate தேடுகிறது...";
  chat.appendChild(loading);
  bottomChat();

  try{

    const r=await fetch("/api/gold-rate");
    const d=await r.json();

    if(!r.ok || !d.ok)
      throw new Error(d.reply||"Gold rate unavailable");

    const text=String(d.reply||"");

    const rates=[...text.matchAll(/(?:₹|Rs\\.?\\s*)([0-9,]{4,7}(?:\\.[0-9]+)?)/gi)]
      .map(x=>Number(x[1].replace(/,/g,"")))
      .filter(x=>x>1000 && x<100000)
      .slice(0,4);

    const r22=rates[0]||0;
    const r24=rates[1]||0;

    const card=(title,rate,sub)=>{
      if(!rate)return "";
      return '<div class="gold-card">'+
        '<div class="title">'+title+'</div>'+
        '<div class="rate">₹'+rate.toLocaleString("en-IN")+'</div>'+
        '<div class="sub">'+sub+'</div>'+
      '</div>';
    };

    if(rates.length){

      const html=
        '<div class="gold-dashboard">'+
        card("🪙 22K / 916",r22,"1 gram")+
        card("💎 24K",r24,"1 gram")+
        card("⚖️ 22K / 916",r22*8,"8 gram / 1 சவரன்")+
        card("⚖️ 24K",r24*8,"8 gram / 1 சவரன்")+
        '</div>'+
        '<div style="font-size:13px;margin-top:6px">'+
        '🌐 Tavily Web Search • Current result'+
        '</div>';

      loading.innerHTML=html;

    }else{

      loading.innerText="🤖 "+text;

    }

  }catch(e){

    console.error(e);

    loading.innerText=
      "❌ Live Gold Rate தற்போது கிடைக்கவில்லை.\n\n"+
      "சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.";

  }

  bottomChat();
}

function goldCalculator(){

 const r=prompt("🪙 22K / 916 rate per gram:");

 if(r===null||r===""||isNaN(r))return;

 const w=prompt("⚖️ Weight in gram:");

 if(w===null||w===""||isNaN(w))return;

 const rate=Number(r);
 const weight=Number(w);

 alert(
  "🪙 SASIKUMAR AI – Gold Calculator\n\n"+
  "22K Rate: ₹"+rate.toLocaleString("en-IN")+
  " / gram\n\n"+
  "Weight: "+weight+" gram\n\n"+
  "💰 Total: ₹"+
  (rate*weight).toLocaleString("en-IN")+
  "\n\n"+
  "8g / 1 Sovereign: ₹"+
  (rate*8).toLocaleString("en-IN")
 );
}

window.addEventListener("load",()=>{
 setTimeout(bottomChat,300);
});

function goldLoanDashboard(){

 const box=document.createElement("div");
 box.className="msg ai";

 box.innerHTML=`
 <div class="loan-box">
   <h3>💰 Gold Loan Appraiser Dashboard</h3>

   <div class="loan-grid">

     <label>
       ⚖️ Net Gold Weight (g)
       <input id="loanWeight" type="number" step="0.001" placeholder="உதா: 8">
     </label>

     <label>
       🪙 Karat
       <select id="loanKarat">
         <option value="24">24K</option>
         <option value="23">23K</option>
         <option value="22" selected>22K / 916</option>
         <option value="21">21K</option>
         <option value="20">20K</option>
         <option value="18">18K</option>
       </select>
     </label>

     <label>
       💰 Market Rate / gram (₹)
       <input id="loanRate" type="number" step="0.01" placeholder="உதா: 14000">
     </label>

     <label>
       📊 LTV (%)
       <input id="loanLtv" type="number" step="0.1" value="75">
     </label>

   </div>

   <button class="loan-calc" onclick="calculateGoldLoan()">
     🧮 Calculate Loan Value
   </button>

   <div id="loanResult" class="loan-result">
     Values உள்ளிட்டு Calculate செய்யுங்கள்.
   </div>

   <div style="font-size:12px;margin-top:10px">
     ⚠️ Indicative calculation only. Actual eligible loan amount depends
     on lender policy, valuation rules, applicable LTV limits, stones,
     deductions and other charges.
   </div>
 </div>
 `;

 chat.appendChild(box);
 bottomChat();
}

function calculateGoldLoan(){

 const w=Number(document.getElementById("loanWeight").value);
 const k=Number(document.getElementById("loanKarat").value);
 const rate=Number(document.getElementById("loanRate").value);
 const ltv=Number(document.getElementById("loanLtv").value);

 const result=document.getElementById("loanResult");

 if(!w || w<=0 || !rate || rate<=0 || ltv<0){
   result.innerText="⚠️ Weight, Rate, LTV values சரியாக உள்ளிடுங்கள்.";
   return;
 }

 const purity=k/24;
 const fineGold=w*purity;
 const grossValue=w*rate;
 const indicativeLoan=grossValue*(ltv/100);

 result.innerHTML=
   "🪙 Karat: <b>"+k+"K</b><br>"+
   "📈 Purity: <b>"+(purity*100).toFixed(2)+"%</b><br>"+
   "⚖️ Net Weight: <b>"+w.toFixed(3)+" g</b><br>"+
   "✨ Fine Gold: <b>"+fineGold.toFixed(3)+" g</b><br>"+
   "💰 Gold Value: <b>₹"+grossValue.toLocaleString("en-IN",{maximumFractionDigits:2})+"</b><br>"+
   "📊 LTV: <b>"+ltv+"%</b><br>"+
   "🏦 Indicative Loan Value: <b>₹"+
   indicativeLoan.toLocaleString("en-IN",{maximumFractionDigits:2})+
   "</b>";
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
