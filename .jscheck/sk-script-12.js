
(function(){
  window.sasikumarShopSearch = function(){
    const q = (document.getElementById("sasikumarShopSearch")?.value || "").trim();
    const box = document.getElementById("sasikumarShopResult");
    if(!box) return;

    if(!q){
      box.style.display = "none";
      box.innerHTML = "";
      return;
    }

    box.style.display = "block";
    box.innerHTML =
      "<b>🔎 Shop Search</b><br>" +
      "Searching for: <strong>" +
      q.replace(/[&<>"']/g, function(x){
        return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x];
      }) +
      "</strong><br><small>Select a company above to continue.</small>";
  };

  window.sasikumarOpenShop = function(company){
    const box = document.getElementById("sasikumarShopResult");
    if(!box) return;

    box.style.display = "block";
    box.innerHTML =
      "<b>🏪 " + company + "</b><br>" +
      "<small>Company / affiliate destination can be configured here.</small>";
  };

  window.sasikumarAffiliate = function(){
    const box = document.getElementById("sasikumarShopResult");
    if(!box) return;
    box.style.display = "block";
    box.innerHTML =
      "<b>🔗 Affiliate Marketing</b><br>" +
      "<small>Referral links, clicks, sales and commission tracking.</small>";
  };

  window.sasikumarCommission = function(){
    const box = document.getElementById("sasikumarShopResult");
    if(!box) return;
    box.style.display = "block";
    box.innerHTML =
      "<b>📊 Sales & Commission</b><br>" +
      "<small>Track affiliate sales and commission history.</small>";
  };

  window.sasikumarReferral = function(){
    const box = document.getElementById("sasikumarShopResult");
    if(!box) return;
    box.style.display = "block";
    box.innerHTML =
      "<b>👥 Referral</b><br>" +
      "<small>Referral code and customer referral tracking.</small>";
  };
})();
