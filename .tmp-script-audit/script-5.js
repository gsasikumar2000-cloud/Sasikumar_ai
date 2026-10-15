

const adminButtonSettings = [
  ["liveGoldRate","🪙 Gold Rate"],
  ["goldLoanDashboard","💰 Gold Loan"],
  ["bankingServices","🏦 Banking Services"],
  ["goldExpert","🔬 Gold Expert"],
  ["goldPractical","⚖️ Practical Test"],
  ["goldReport","📋 Appraisal Report"],
  ["education","📚 Education"],
  ["startVoice","🎤 Voice Input"],
  ["technologyMenu","💻 Technology"],
  ["copyChat","📋 Copy"],
  ["shareChat","📤 Share"],
  ["stopAI","⏹ Stop"],
  ["toggleDark","🌙 Dark"],
  ["clearChat","🧹 Clear"],
  ["topChat","⬆️ Up"],
  ["bottomChat","⬇️ Down"],
  ["autoVoiceBtn","🎙️ Auto Voice"],
  ["voiceBtn","🔊 AI Voice"],
  ["allJobs","💼 ALL JOBS"]
];

function openAdminControl(){
  if(sessionStorage.getItem("sasikumar_role") !== "admin"){
    const username = prompt("Admin Username:");
    const password = prompt("Admin Password:");
    if(!username || !password) return;
    fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,password})})
    .then(r=>r.json()).then(data=>{
      if(data.ok && data.role==="admin"){
        sessionStorage.setItem("sasikumar_logged_in","true");
        sessionStorage.setItem("sasikumar_role","admin");
        sessionStorage.setItem("sasikumar_username",data.username);
        showAdminPanel();
      }else alert("❌ Admin login failed");
    }).catch(()=>alert("❌ Login connection error"));
    return;
  }
  showAdminPanel();
}

function showAdminPanel(){
  const list=document.getElementById("adminButtonsList");
  list.innerHTML="";
  adminButtonSettings.forEach(([fn,label])=>{
    const key="admin_btn_"+fn;
    const enabled=localStorage.getItem(key)!=="off";
    const row=document.createElement("div");
    row.style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #ddd";
    row.innerHTML = "<b>"+label+"</b><button class=\"adminToggleBtn\" style=\"padding:7px 12px;border:0;border-radius:8px;cursor:pointer\">"+(enabled?"ON":"OFF")+"</button>";
    const toggleBtn = row.querySelector(".adminToggleBtn");
    toggleBtn.onclick = function(){ toggleAdminButton(fn,this); };
    list.appendChild(row);
    applyAdminButton(fn,enabled);
  });
  document.getElementById("adminControlPanel").style.display="block";
}

function toggleAdminButton(fn,btn){
  const enabled=localStorage.getItem("admin_btn_"+fn)==="off";
  localStorage.setItem("admin_btn_"+fn,enabled?"on":"off");
  btn.textContent=enabled?"ON":"OFF";
  applyAdminButton(fn,enabled);
}

function applyAdminButton(fn,enabled){
  if(fn==="allJobs"){const el=document.getElementById("allJobs");if(el)el.style.display=enabled?"":"none";return;}if(fn==="autoVoiceBtn" || fn==="voiceBtn"){
    const el=document.getElementById(fn);
    if(el) el.style.display=enabled?"":"none";
    return;
  }
  document.querySelectorAll("button[onclick^=\""+fn+"(\"]").forEach(el=>el.style.display=enabled?"":"none");
}

function closeAdminControl(){
  document.getElementById("adminControlPanel").style.display="none";
}

