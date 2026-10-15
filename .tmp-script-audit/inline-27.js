
(function(){
  function update(){
    var p=new Intl.DateTimeFormat("en-GB",{
      timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hourCycle:"h23"
    }).formatToParts(new Date());
    var t={};p.forEach(function(x){t[x.type]=x.value});
    var m=Number(t.hour)*60+Number(t.minute);
    var show=!(m>=1260&&m<1440);
    [["skLiveBookCardsRow","flex"],["skVideoAdCard","flex"]].forEach(function(x){
      var e=document.getElementById(x[0]);
      if(e)e.style.setProperty("display",show?x[1]:"none","important");
    });
  }
  update();setInterval(update,30000);
})();
