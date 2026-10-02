

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

function openReplyFilePicker(camera){
  const input=document.getElementById("replyFileInput");
  if(!input)return;
  input.value="";
  if(camera){
    input.accept="image/*";
    input.setAttribute("capture","environment");
  }else{
    input.accept="image/*,.pdf,.txt,.doc,.docx";
    input.removeAttribute("capture");
  }
  input.click();
}

function noteCamera(){openReplyFilePicker(true);}
function noteUpload(){openReplyFilePicker(false);}

function showReplyAttachment(file){
  replyAttachment=file;
  let box=document.getElementById("replyAttachmentPreview");
  if(!box){
    box=document.createElement("div");
    box.id="replyAttachmentPreview";
    box.style="margin:6px 0;padding:8px;border:1px solid #ccc;border-radius:10px;background:#f7f7f7;";
    document.querySelector(".input-area").insertBefore(box,document.querySelector(".input-row"));
  }
  box.style.display="block";
  if(file.type && file.type.startsWith("image/")){
    const url=URL.createObjectURL(file);
    box.innerHTML="<div style=\"display:flex;align-items:center;gap:10px\">"+
      "<img src=\""+url+"\" style=\"width:70px;height:70px;object-fit:cover;border-radius:8px\">"+
      "<b>📎 "+escapeHtml(file.name)+"</b>"+
      "<button type=\"button\" onclick=\"removeReplyAttachment()\">✕</button></div>";
  }else{
    box.innerHTML="📎 <b>"+escapeHtml(file.name)+"</b> <button type=\"button\" onclick=\"removeReplyAttachment()\">✕</button>";
  }
}

function removeReplyAttachment(){
  replyAttachment=null;
  const input=document.getElementById("replyFileInput");
  if(input)input.value="";
  const box=document.getElementById("replyAttachmentPreview");
  if(box){box.innerHTML="";box.style.display="none";}
}
document.addEventListener("DOMContentLoaded",function(){
  const input=document.getElementById("replyFileInput");
  if(input){
    input.addEventListener("change",function(e){
      const file=e.target.files && e.target.files[0];
      if(file)showReplyAttachment(file);
    });
  }
});

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









