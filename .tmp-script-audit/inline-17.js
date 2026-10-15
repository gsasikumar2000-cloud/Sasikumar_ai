

window.showJobFolder=function(){
  const el=document.getElementById('allJobs');
  if(el){
    el.scrollIntoView({behavior:'smooth',block:'start'});
  }
  if(typeof showLiveJobSearch==='function'){
    setTimeout(function(){
      showLiveJobSearch();
    },300);
  }
};

window.showEducationFolder=function(){
  const el=document.getElementById('educationContent') ||
           document.getElementById('education') ||
           document.getElementById('educationFolder');

  if(el){
    el.style.display='';
    el.scrollIntoView({behavior:'smooth',block:'start'});
  }else{
    alert('📚 EDUCATION FOLDEREducation content will be available here.');
  }
};

let replyAttachment = null;

function skNewCamera(){
  const input = document.getElementById("skNewCameraInput");
  if(!input){ alert("Camera input unavailable."); return; }
  input.value = "";
  input.click();
}

function skNewUpload(){
  const input = document.getElementById("skNewUploadInput");
  if(!input){ alert("Upload input unavailable."); return; }
  input.value = "";
  input.click();
}

function noteCamera(){ skNewCamera(); }
function noteUpload(){ skNewUpload(); }

function showReplyAttachment(file){
  if(!file) return;

  replyAttachment = file;

  const area = document.getElementById("sasikumarAIReplySection");
  if(!area){
    alert("Reply area unavailable.");
    return;
  }

  let box = document.getElementById("replyAttachmentPreview");
  if(!box){
    box = document.createElement("div");
    box.id = "replyAttachmentPreview";
    const row = area.querySelector(".input-row");
    if(row) area.insertBefore(box, row);
    else area.appendChild(box);
  }

  box.style.cssText =
    "display:block;margin:8px 0;padding:10px;border:1px solid #93c5fd;" +
    "border-radius:12px;background:#eff6ff;color:#111827;";

  const name = escapeHtml(file.name || "Selected attachment");
  const isImage =
    (file.type && file.type.toLowerCase().startsWith("image/")) ||
    /\.(jpe?g|png|gif|webp|bmp|heic|heif|avif)$/i.test(file.name || "");

  box.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
    (isImage
      ? '<img id="skAttachmentPreviewImage" alt="Image preview" ' +
        'style="width:90px;height:90px;object-fit:contain;border-radius:8px;background:white">'
      : '<span style="font-size:28px">📎</span>') +
    '<span style="flex:1;overflow-wrap:anywhere"><b>' + name + '</b>' +
    '<br><small>' + (isImage ? 'Image selected' : 'File selected') + '</small></span>' +
    '<button type="button" onclick="removeReplyAttachment()" ' +
    'style="padding:8px 12px;border:0;border-radius:8px;background:#fecaca">✖ Remove</button>' +
    '</div>';

  if(isImage){
    const reader = new FileReader();
    reader.onload = function(e){
      const img = document.getElementById("skAttachmentPreviewImage");
      if(img && e.target && e.target.result) img.src = e.target.result;
    };
    reader.onerror = function(){
      console.error("SASIKUMAR AI: Image preview read failed.", reader.error);
      const preview = document.getElementById("replyAttachmentPreview");
      if (preview) {
        const error = document.createElement("p");
        error.textContent = "⚠️ Image preview failed. Please select the image again.";
        error.style.cssText = "color:#b91c1c;font-size:14px;margin-top:8px;";
        preview.appendChild(error);
      }
    };
    reader.readAsDataURL(file);
  }

  console.log("SASIKUMAR AI attachment selected:", file.name, file.type, file.size);
}

function removeReplyAttachment(){
  replyAttachment = null;

  ["skNewCameraInput", "skNewUploadInput"].forEach(function(id){
    const input = document.getElementById(id);
    if(input) input.value = "";
  });

  const box = document.getElementById("replyAttachmentPreview");
  if(box){
    box.innerHTML = "";
    box.style.display = "none";
  }
}

function bindNewReplyFileInputs(){
  ["skNewCameraInput", "skNewUploadInput"].forEach(function(id){
    const input = document.getElementById(id);
    if(input && input.dataset.skBound !== "1"){
      input.dataset.skBound = "1";
      input.addEventListener("change", function(event){
        const file = event.target.files && event.target.files[0];
        if(file) showReplyAttachment(file);
      });
    }
  });
}

function skReplyCut(){
  const input = document.getElementById("q");
  if(!input) return;
  const start = input.selectionStart;
  const end = input.selectionEnd;
  if(start === end){
    alert("முதலில் Reply Box-ல் text-ஐ select செய்யுங்கள்.");
    input.focus();
    return;
  }
  const selected = input.value.slice(start, end);
  function removeSelected(){
    input.setRangeText("", start, end, "start");
    input.dispatchEvent(new Event("input", {bubbles:true}));
    input.focus();
  }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(selected).then(removeSelected).catch(function(){
      alert("Clipboard permission இல்லை. Text-ஐ select செய்து Cut செய்ய முடியவில்லை.");
    });
  }else{
    alert("Clipboard வசதி இல்லை. Copy செய்து தேவையான text-ஐ கைமுறையாக நீக்குங்கள்.");
  }
}

function skReplySelectAll(){
  const input = document.getElementById("q");
  if(!input) return;
  input.focus();
  input.select();
}

function skReplyEdit(){
  const input = document.getElementById("q");
  if(!input) return;
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}

function skReplySave(){
  const input = document.getElementById("q");
  if(!input) return;
  const blob = new Blob([input.value], {type:"text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "SASIKUMAR-AI-Reply.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
}

function skReplyPrint(){
  const input = document.getElementById("q");
  if(!input) return;
  const popup = window.open("", "_blank");
  if(!popup){
    alert("Print window blocked. Browser-ல் pop-ups அனுமதிக்கவும்.");
    return;
  }
  const escaped = input.value.replace(/[&<>"]/g, function(ch){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch];
  });
  popup.document.open();
  popup.document.write(
    '<!doctype html><html><head><meta charset="utf-8">' +
    '<title>SASIKUMAR AI Reply</title>' +
    '<style>body{font:16px Arial,sans-serif;padding:24px}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style>' +
    '</head><body><h2>SASIKUMAR AI Reply</h2><pre>' +
    escaped + '</pre></body></html>'
  );
  popup.document.close();
  popup.focus();
  popup.onload = function(){ popup.print(); };
}

function skReplyCopy(){
  const input = document.getElementById("q");
  if(!input) return;
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(input.value).catch(function(){
      input.select();
      alert("Text selected. Copy it manually.");
    });
  }else{
    input.select();
    alert("Text selected. Copy it manually.");
  }
}

function skReplyPaste(){
  const input = document.getElementById("q");
  if(!input) return;
  if(navigator.clipboard && navigator.clipboard.readText){
    navigator.clipboard.readText().then(function(text){
      input.value += text;
      input.dispatchEvent(new Event("input", {bubbles:true}));
      input.focus();
    }).catch(function(){
      input.focus();
      alert("Long-press the reply box and choose Paste.");
    });
  }else{
    input.focus();
    alert("Long-press the reply box and choose Paste.");
  }
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", bindNewReplyFileInputs, {once:true});
}else{
  bindNewReplyFileInputs();
}

function selectAllNotes(){
  const el = document.activeElement;
  if(el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")){
    el.select();
  } else {
    window.getSelection().selectAllChildren(document.body);
  }
}

function undoNotes(){
  document.execCommand("undo");
}

function redoNotes(){
  document.execCommand("redo");
}

function findNotes(){
  const q = prompt("Find:");
  if(q) window.find(q);
}

function editNotes(){
  document.body.contentEditable =
    document.body.contentEditable === "true" ? "false" : "true";
  alert(document.body.contentEditable === "true"
    ? "Edit mode ON"
    : "Edit mode OFF");
}

function saveNotes(){
  const text = document.body.innerText;
  const blob = new Blob([text], {type:"text/plain;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "SASIKUMAR-AI-Notes.txt";
  a.click();
  URL.revokeObjectURL(a.href);
}

function printNotes(){
  window.print();
}

function pdfNotes(){
  window.print();
}









