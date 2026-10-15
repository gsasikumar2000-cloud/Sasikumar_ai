
function skSetPreview(mode){
 document.body.classList.remove("skMobilePreview","skDesktopPreview");
 document.body.classList.add(mode==="mobile" ? "skMobilePreview" : "skDesktopPreview");
 localStorage.setItem("sasikumarPreviewMode",mode);
}
document.addEventListener("DOMContentLoaded",function(){
 skSetPreview(localStorage.getItem("sasikumarPreviewMode")||"mobile");
});
