
const q=document.getElementById("q");
const chat=document.getElementById("chat");
const sendBtn=document.getElementById("sendBtn");

let recognition=null;
let voiceEnabled=false;\nlet autoVoice=false;
let darkMode=localStorage.getItem("sasikumar_ai_dark")==="1";

function escapeHtml(text){
 const d=document.createElement("div");
 d.textContent=text;
 return d.innerHTML;
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
    .replace(/https?:\\/\\/\\S+/g,"")
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

function goldReport(){

 const now=new Date().toLocaleString("en-IN");

 const box=document.createElement("div");
 box.className="msg ai";

 box.innerHTML=`
 <div class="report-box" id="appraisalReport">

   <div class="report-head">
     <h2>🪙 GOLD APPRAISAL REPORT</h2>
     <div>SASIKUMAR AI • Gold Appraiser</div>
     <div>Generated: ${now}</div>
   </div>

   <table class="report-table">
     <tr><td>Customer Name</td><td><input id="repCustomer" placeholder="பெயர்"></td></tr>
     <tr><td>Gold Type</td><td><select id="repKarat">
       <option>22K / 916</option>
       <option>24K / 999</option>
       <option>23K / 958</option>
       <option>21K / 875</option>
       <option>20K / 833</option>
       <option>18K / 750</option>
     </select></td></tr>
     <tr><td>Net Weight (g)</td><td><input id="repWeight" type="number" step="0.001"></td></tr>
     <tr><td>Rate / gram (₹)</td><td><input id="repRate" type="number" step="0.01"></td></tr>
     <tr><td>LTV (%)</td><td><input id="repLtv" type="number" value="75" step="0.1"></td></tr>
   </table>

   <button class="loan-calc" onclick="generateReport()">
     🧮 Generate Report
   </button>

   <div id="reportResult" style="margin-top:12px"></div>

   <div class="report-actions">
     <button onclick="printReport()">🖨️ Print</button>
     <button onclick="window.print()">📄 Save PDF</button>
   </div>

 </div>
 `;

 chat.appendChild(box);
 bottomChat();
}

function generateReport(){

 const name=document.getElementById("repCustomer").value.trim()||"Customer";
 const weight=Number(document.getElementById("repWeight").value);
 const rate=Number(document.getElementById("repRate").value);
 const ltv=Number(document.getElementById("repLtv").value)||0;

 const karatText=document.getElementById("repKarat").value;
 const karat=Number(karatText.match(/\d+/)[0]);

 if(!weight || weight<=0 || !rate || rate<=0){
   document.getElementById("reportResult").innerHTML=
     "⚠️ Weight மற்றும் Rate சரியாக உள்ளிடுங்கள்.";
   return;
 }

 const purity=karat/24;
 const fineness=Math.round(purity*1000);
 const fineGold=weight*purity;
 const goldValue=weight*rate;
 const loanValue=goldValue*(ltv/100);

 document.getElementById("reportResult").innerHTML=`
   <table class="report-table">
     <tr><td>Customer</td><td><b>${escapeHtml(name)}</b></td></tr>
     <tr><td>Karat</td><td><b>${karat}K</b></td></tr>
     <tr><td>Purity</td><td><b>${(purity*100).toFixed(2)}%</b></td></tr>
     <tr><td>Fineness</td><td><b>${fineness}</b></td></tr>
     <tr><td>Net Weight</td><td><b>${weight.toFixed(3)} g</b></td></tr>
     <tr><td>Fine Gold</td><td><b>${fineGold.toFixed(3)} g</b></td></tr>
     <tr><td>Rate</td><td><b>₹${rate.toLocaleString("en-IN")}/g</b></td></tr>
     <tr><td>Indicative Gold Value</td><td><b>₹${goldValue.toLocaleString("en-IN",{maximumFractionDigits:2})}</b></td></tr>
     <tr><td>LTV</td><td><b>${ltv}%</b></td></tr>
     <tr><td>Indicative Loan Value</td><td><b>₹${loanValue.toLocaleString("en-IN",{maximumFractionDigits:2})}</b></td></tr>
   </table>

   <div style="font-size:11px;margin-top:12px">
     ⚠️ Indicative appraisal calculation only. Final valuation and
     eligible loan amount depend on the applicable lender policy,
     testing method, deductions and regulatory requirements.
   </div>
 `;
}

function printReport(){

 const report=document.getElementById("appraisalReport");

 if(!report){
   alert("📋 Report உருவாக்கவும்.");
   return;
 }

 const w=window.open("","_blank");

 w.document.write(`
 <!DOCTYPE html>
 <html>
 <head>
   <title>SASIKUMAR AI - Gold Appraisal Report</title>
   <meta name="viewport" content="width=device-width,initial-scale=1">
   <style>
     body{font-family:Arial,sans-serif;padding:25px;color:#111}
     .report-box{max-width:700px;margin:auto;border:2px solid #c9a227;padding:20px}
     .report-head{text-align:center;border-bottom:1px solid #c9a227;padding-bottom:12px}
     .report-head h2{margin:0 0 5px}
     table{width:100%;border-collapse:collapse;margin-top:15px}
     td{padding:8px;border-bottom:1px solid #ddd}
     td:first-child{font-weight:bold}
     input,select,button{border:0;background:transparent;font:inherit}
     .loan-calc,.report-actions{display:none}
   </style>
 </head>
 <body>
   ${report.outerHTML}
   <script>
     window.onload=function(){window.print();}
   