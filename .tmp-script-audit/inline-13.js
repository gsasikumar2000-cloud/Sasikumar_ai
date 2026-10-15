
function educationAskNew(){
  const input=document.querySelector("#chat input, #chat textarea, input[type='text'], textarea");
  if(input){
    input.value="Education பற்றி உதவி வேண்டும்";
    input.dispatchEvent(new Event("input",{bubbles:true}));
    input.focus();
    document.getElementById("chat")?.scrollIntoView({behavior:"smooth",block:"center"});
  }else{
    alert("Ask SASIKUMAR AI in Tamil or English for step-by-step education help.");
  }
}
function goldReport(){
  const box=document.createElement("div");
  box.className="msg ai";
  const id=Date.now();

  box.innerHTML=`
  <div class="report-box" id="appraisalReport${id}">
    <div class="report-head">
      <img src="/assets/sasikumar-ai-logo.png?v=20261002"
           alt="SASIKUMAR AI"
           style="width:40px;height:40px;object-fit:contain;display:block;margin:0 auto 6px;">
      <h2>📋 APPRAISER REPORT</h2>
      <div>SASIKUMAR AI • Gold Appraiser</div>
    </div>

    <table class="report-table">
      <tr><td>Customer Name</td><td><input id="arName${id}" type="text" placeholder="Customer Name"></td></tr>
      <tr><td>Phone</td><td><input id="arPhone${id}" type="tel" placeholder="Phone Number"></td></tr>
      <tr><td>Gross Weight (g)</td><td><input id="arGross${id}" type="number" step="0.001"></td></tr>
      <tr><td>Stone Weight (g)</td><td><input id="arStone${id}" type="number" step="0.001" value="0"></td></tr>
      <tr><td>Net Gold Weight (g)</td><td><input id="arNet${id}" type="number" step="0.001" readonly></td></tr>
      <tr><td>Purity / Karat</td><td>
        <select id="arKarat${id}">
          <option value="24">24K</option>
          <option value="22" selected>22K / 916</option>
          <option value="18">18K</option>
          <option value="14">14K</option>
        </select>
      </td></tr>
      <tr><td>Gold Rate / g</td><td><input id="arRate${id}" type="number" step="0.01"></td></tr>
      <tr><td>Estimated Gold Value</td><td><input id="arValue${id}" type="number" step="0.01" readonly></td></tr>
      <tr><td>Remarks</td><td><textarea id="arRemarks${id}" rows="3" placeholder="Appraisal remarks"></textarea></td></tr>
    </table>

    <h3>📷 Gold Image</h3>

    <input id="arCamera${id}" type="file" accept="image/*" capture="environment" style="display:none">
    <input id="arUpload${id}" type="file" accept="image/*" style="display:none">

    <button type="button" class="loan-calc"
      onclick="document.getElementById('arCamera${id}').click()">📷 OPEN CAMERA</button>

    <button type="button" class="loan-calc"
      onclick="document.getElementById('arUpload${id}').click()">🖼️ UPLOAD IMAGE</button>

    <div id="arPreview${id}" style="margin-top:12px"></div>

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:15px;">
      <button type="button" class="loan-calc" onclick="printAppraisalReport('${id}')">🖨️ PRINT / PDF</button>
      <button type="button" class="loan-calc" onclick="saveAppraisalReport('${id}')">💾 SAVE REPORT</button>
      <button type="button" class="loan-calc" onclick="showSavedAppraisalReports('${id}')">📂 SAVED REPORTS</button>
      <div id="arSavedList${id}" style="width:100%;margin-top:10px"></div>
      <button type="button" class="loan-calc" onclick="location.reload()">↩️ RETURN MAIN</button>
    </div>

    <div style="margin-top:12px;padding:12px;border-radius:10px;background:#f5f5f5;">
      <img src="/assets/sasikumar-ai-logo.png?v=20261002"
           alt="SASIKUMAR AI"
           style="width:30px;height:30px;object-fit:contain;">
      <b>SASIKUMAR AI Gold Appraiser</b><br>
      Screening/estimate only. Final purity should be confirmed by appropriate professional testing.
    </div>
  </div>`;

  const chat=document.getElementById("chat") || document.body;
  chat.appendChild(box);

  const gross=document.getElementById("arGross"+id);
  const stone=document.getElementById("arStone"+id);
  const net=document.getElementById("arNet"+id);
  const rate=document.getElementById("arRate"+id);
  const value=document.getElementById("arValue"+id);

  function calculate(){
    const g=parseFloat(gross.value)||0;
    const st=parseFloat(stone.value)||0;
    const r=parseFloat(rate.value)||0;
    const n=Math.max(0,g-st);
    net.value=n.toFixed(3);
    value.value=(n*r).toFixed(2);
  }

  gross.addEventListener("input",calculate);
  stone.addEventListener("input",calculate);
  rate.addEventListener("input",calculate);

  ["arCamera","arUpload"].forEach(prefix=>{
    document.getElementById(prefix+id).addEventListener("change",function(){
      const file=this.files && this.files[0];
      if(!file)return;
      const reader=new FileReader();
      reader.onload=e=>{
        document.getElementById("arPreview"+id).innerHTML=
          '<img src="'+e.target.result+'" alt="Gold Image" style="max-width:100%;max-height:300px;object-fit:contain;">';
      };
      reader.readAsDataURL(file);
    });
  });

  box.scrollIntoView({behavior:"smooth",block:"start"});
}

function printAppraisalReport(id){
  id = (id && id.dataset && id.dataset.id) ? id.dataset.id : id;
  const el=document.getElementById("appraisalReport"+id);
  if(!el){ alert("Appraisal Report not found."); return; }

  const w=window.open("","_blank");
  if(!w){ alert("Please allow pop-ups for Print/PDF."); return; }

  w.document.write(
    "<!doctype html><html><head><meta charset='utf-8'>" +
    "<title>SASIKUMAR AI - Appraisal Report</title>" +
    "<style>body{font-family:Arial,sans-serif;margin:20px;color:#111}" +
    ".report-box{max-width:850px;margin:auto}" +
    "table{width:100%;border-collapse:collapse}" +
    "td{border:1px solid #999;padding:8px}" +
    "td:first-child{font-weight:bold;width:32%}" +
    "button,input,textarea,select{display:none}" +
    "img{max-width:100%;height:auto}" +
    "@media print{body{margin:10mm}}</style>" +
    "</head><body>" + el.outerHTML + "</body></html>"
  );
  w.document.close();
  w.focus();
  setTimeout(()=>{try{w.print()}catch(e){}},700);
}


const SK_APPRAISAL_STORAGE_KEY = "sasikumarAppraisalReports";
const SK_APPRAISAL_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

function skGetAppraisalReports() {
  try {
    const raw = JSON.parse(localStorage.getItem(SK_APPRAISAL_STORAGE_KEY) || "[]");
    const now = Date.now();
    const valid = Array.isArray(raw)
      ? raw.filter(r => r && r.id && r.createdAt &&
          now - Number(r.createdAt) < SK_APPRAISAL_MAX_AGE &&
          Number(r.createdAt) <= now)
      : [];
    localStorage.setItem(SK_APPRAISAL_STORAGE_KEY, JSON.stringify(valid));
    return valid;
  } catch (e) {
    console.error("Appraisal storage read failed:", e);
    return [];
  }
}

function saveAppraisalReport(id) {
  const root = document.getElementById("appraisalReport" + id);
  if (!root) {
    alert("Appraisal Report not found.");
    return;
  }

  const get = name => root.querySelector("#" + name + id);
  const image = root.querySelector("#arPreview" + id + " img");

  const report = {
    id: String(Date.now()) + String(Math.floor(Math.random() * 1000)),
    createdAt: Date.now(),
    customer: get("arName")?.value || "",
    phone: get("arPhone")?.value || "",
    gross: get("arGross")?.value || "",
    stone: get("arStone")?.value || "0",
    net: get("arNet")?.value || "",
    karat: get("arKarat")?.value || "22",
    rate: get("arRate")?.value || "",
    value: get("arValue")?.value || "",
    remarks: get("arRemarks")?.value || "",
    image: image?.src || ""
  };

  try {
    const reports = skGetAppraisalReports();
    reports.push(report);
    localStorage.setItem(SK_APPRAISAL_STORAGE_KEY, JSON.stringify(reports));
    alert("✅ Appraisal Report saved on this device. It will expire after 30 days.");
    showSavedAppraisalReports(id);
  } catch (e) {
    alert("Unable to save. Device storage may be full, especially if the report includes a large image.");
    console.error("Appraisal save failed:", e);
  }
}

function showSavedAppraisalReports(id) {
  const container = document.getElementById("arSavedList" + id);
  if (!container) {
    alert("Saved Reports area not found.");
    return;
  }

  container.replaceChildren();
  const reports = skGetAppraisalReports();
  const heading = document.createElement("h3");
  heading.textContent = "📂 SAVED APPRAISAL REPORTS";
  container.appendChild(heading);

  if (!reports.length) {
    const empty = document.createElement("p");
    empty.textContent = "No saved reports. Save a report first.";
    container.appendChild(empty);
    return;
  }

  reports.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

  reports.forEach(report => {
    const row = document.createElement("div");
    row.style.cssText = "padding:10px;margin:8px 0;border:1px solid #bbb;border-radius:8px;background:#fff;color:#111";

    const label = document.createElement("div");
    label.textContent =
      (report.customer || "Unnamed customer") + " • " +
      (report.karat || "22") + "K • " +
      new Date(Number(report.createdAt)).toLocaleString();
    row.appendChild(label);

    const open = document.createElement("button");
    open.type = "button";
    open.className = "loan-calc";
    open.textContent = "📄 OPEN REPORT";
    open.addEventListener("click", () => loadAppraisalReport(report.id));
    row.appendChild(open);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "loan-calc";
    remove.textContent = "🗑️ DELETE";
    remove.addEventListener("click", () => {
      if (!confirm("Delete this saved appraisal report?")) return;
      const remaining = skGetAppraisalReports().filter(r => r.id !== report.id);
      localStorage.setItem(SK_APPRAISAL_STORAGE_KEY, JSON.stringify(remaining));
      showSavedAppraisalReports(id);
    });
    row.appendChild(remove);
    container.appendChild(row);
  });
}

function loadAppraisalReport(savedId) {
  const report = skGetAppraisalReports().find(r => r.id === savedId);
  if (!report) {
    alert("This saved report has expired or was deleted.");
    return;
  }

  goldReport();

  const boxes = document.querySelectorAll('.report-box[id^="appraisalReport"]');
  const root = boxes[boxes.length - 1];
  if (!root) {
    alert("Unable to open a new appraisal report.");
    return;
  }

  const id = root.id.substring("appraisalReport".length);
  const set = (name, value) => {
    const field = root.querySelector("#" + name + id);
    if (field) {
      field.value = value == null ? "" : value;
      field.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  set("arName", report.customer);
  set("arPhone", report.phone);
  set("arGross", report.gross);
  set("arStone", report.stone);
  set("arKarat", report.karat);
  set("arRate", report.rate);
  set("arRemarks", report.remarks);

  if (report.image && report.image.startsWith("data:image/")) {
    const preview = root.querySelector("#arPreview" + id);
    if (preview) {
      const img = document.createElement("img");
      img.src = report.image;
      img.alt = "Saved gold image";
      img.style.cssText = "max-width:100%;max-height:300px;object-fit:contain";
      preview.replaceChildren(img);
    }
  }

  root.scrollIntoView({ behavior: "smooth", block: "start" });
}

function cleanupExpiredAppraisalReports() {
  skGetAppraisalReports();
}

cleanupExpiredAppraisalReports();
setInterval(cleanupExpiredAppraisalReports, 60 * 60 * 1000);


function openEducationFolder(){
  const oldBox = document.getElementById("sasikumarEducationPanel");
  if(oldBox){
    oldBox.scrollIntoView({behavior:"smooth"});
    return;
  }

  const box = document.createElement("section");
  box.id = "sasikumarEducationPanel";
  box.style.cssText =
    "margin:20px 0;padding:16px;border-radius:16px;background:#111;color:#fff;";

  box.innerHTML = `
    <h2>📚 EDUCATION DETAILS</h2>

    <h3>🏫 School Education</h3>
    <p>Class 1 • Class 2 • Class 3 • Class 4 • Class 5 • Class 6 • Class 7 • Class 8 • Class 9 • Class 10 • Class 11 • Class 12</p>

    <h3>📖 Main Subjects</h3>
    <p>Tamil • English • Mathematics • Physics • Chemistry • Biology • Science • Social Science • History • Geography • Civics • Economics • Computer Science</p>

    <h3>🧮 Mathematics & Equations</h3>
    <p>Arithmetic • Fractions • Decimals • Algebra • Geometry • Mensuration • Trigonometry • Statistics • Probability • Important Formulas • Updated Equations</p>

    <h3>🔬 Science</h3>
    <p>Physics Concepts • Chemistry Basics • Biology • Human Body • Plants & Animals • Environment • Practical Science</p>

    <h3>💻 Computer & Technology</h3>
    <p>Computer Basics • Internet Basics • Programming Fundamentals • AI Basics • Cyber Safety • Digital Skills</p>

    <h3>📝 Study & Exam Preparation</h3>
    <p>Chapter Notes • Important Questions • Previous Questions • Practice Tests • Revision • Quick Notes • Exam Preparation • Doubt Clarification</p>

    <h3>🎓 Higher Education</h3>
    <p>Diploma • ITI • Polytechnic • Undergraduate Courses • Postgraduate Courses • Skill Development • Career Guidance</p>

    <div style="margin:12px 0;padding:14px;border-radius:12px;background:#123c8c;color:white;">
      <h3>🎯 Education A–Z AI</h3>
      <p>All Subjects • NEET • JEE • TNPSC • UPSC • SSC • Railway • Banking • TNUSRB • TET • AI Tutor • Quiz • Mock Test</p>
      <button type="button" onclick="window.open('/education/a-to-z.html','_blank')">📚 Open Education A–Z AI</button>
    </div>
    <button type="button" onclick="window.open('/education/equations.html','_blank')">
      🧮 Open Equations
    </button>

    <button type="button" onclick="alert('Ask SASIKUMAR AI in Tamil or English for step-by-step education help.')">
      🤖 Ask SASIKUMAR AI
    </button>
  `;

  const target = document.getElementById("dashboard") || document.getElementById("allJobs");
  if(target) target.parentNode.insertBefore(box, target);
  else document.body.appendChild(box);

  box.scrollIntoView({behavior:"smooth"});
}
