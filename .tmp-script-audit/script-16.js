
(function(){
  try{
    const params=new URLSearchParams(window.location.search);
    const ref=(params.get("ref")||"").trim().toUpperCase();

    if(!ref || !/^[A-Z0-9-]{3,40}$/.test(ref)) return;

    let visitorId=localStorage.getItem("sasikumar_visitor_id");

    if(!visitorId){
      if(window.crypto && crypto.randomUUID){
        visitorId="v-"+crypto.randomUUID();
      }else{
        visitorId="v-"+Date.now()+"-"+Math.random().toString(36).slice(2);
      }
      localStorage.setItem("sasikumar_visitor_id",visitorId);
    }

    localStorage.setItem("sasikumar_referrer",ref);

    fetch("/api/referral/track",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        code:ref,
        visitor_id:visitorId
      })
    }).catch(function(){});
  }catch(e){}
})();
