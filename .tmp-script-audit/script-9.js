
async function showNewGoldRate(){
  const box = document.getElementById("newGoldRateResult");
  if (!box) return;

  box.innerHTML = '<div style="padding:14px;text-align:center;">⏳ Loading live Gold + Silver rate...</div>';

  const money = n => {
    const value = Number(n);
    return Number.isFinite(value) && value > 0
      ? value.toLocaleString("en-IN", {maximumFractionDigits:2})
      : "Unavailable";
  };

  try {
    const response = await fetch("/api/gold-rate?state=Tamil%20Nadu&district=Thanjavur");
    if (!response.ok) throw new Error("Gold API HTTP " + response.status);

    const gold = await response.json();
    if (!gold.ok || !gold.rates) throw new Error("Gold rate data unavailable");

    const gold24 = gold.rates["24K"];
    const gold22 = gold.rates["22K"];

    let silverHTML = '<b>Silver</b><br>Rate unavailable';

    try {
      const sr = await fetch("/api/silver-rate?state=Tamil%20Nadu&district=Thanjavur");
      if (sr.ok) {
        const silver = await sr.json();
        const silverRate = silver.silverPerGram || silver.rate || silver.price;
        if (silver.ok && Number(silverRate) > 0) {
          silverHTML = '<b>Silver</b><br>₹' + money(silverRate) + ' / gram';
        }
      }
    } catch (silverError) {
      console.warn("[SASIKUMAR AI] Silver rate unavailable:", silverError.message);
    }

    box.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;">
        <div style="padding:14px;border-radius:16px;background:#fff;color:#172033;text-align:center;">
          <b>24K Gold</b><br>₹${money(gold24)} / gram
        </div>
        <div style="padding:14px;border-radius:16px;background:#fff;color:#172033;text-align:center;">
          <b>22K Gold</b><br>₹${money(gold22)} / gram
        </div>
        <div style="padding:14px;border-radius:16px;background:#fff;color:#172033;text-align:center;">
          ${silverHTML}
        </div>
      </div>
      <div style="text-align:center;margin-top:10px;font-size:13px;opacity:.7;">
        📍 Tamil Nadu → Thanjavur · ${gold.date || ""}
      </div>
      <div style="text-align:center;margin-top:5px;font-size:11px;opacity:.65;">
        Reference rates; jewellery retail prices may differ.
      </div>`;
  } catch (e) {
    console.error("[SASIKUMAR AI] Gold rate error:", e);
    box.innerHTML = '<div style="padding:14px;text-align:center;">⚠️ Gold rate unavailable. Please try again.</div>';
  }
}
