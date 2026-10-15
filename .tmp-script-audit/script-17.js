
async function skRefreshPay2AllWallet(){
  const balance=document.getElementById("skWalletBalance");
  const status=document.getElementById("skWalletStatus");
  if(!balance||!status)return;
  balance.textContent="Checking...";
  status.textContent="Checking Pay2All connection...";
  try{
    const r=await fetch("/api/recharge/balance",{cache:"no-store"});
    const j=await r.json();
    if(j.status_id===1 && j.data){
      balance.textContent="₹"+Number(j.data.balance||0).toLocaleString("en-IN",{minimumFractionDigits:2});
      status.textContent="🟢 Pay2All Wallet Connected";
    }else{
      balance.textContent="Unavailable";
      status.textContent="🔴 "+(j.message||"Wallet unavailable");
    }
  }catch(e){
    balance.textContent="Unavailable";
    status.textContent="🔴 Wallet connection failed";
  }
}
function skPay2AllAddMoney(){
  const box=document.getElementById("skWalletAddMoney");
  if(box)box.style.display=box.style.display==="none"?"block":"none";
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",skRefreshPay2AllWallet);
else skRefreshPay2AllWallet();
