const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const PORT = process.env.PORT || 3000;
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(__dirname, 'public', 'daily-gold-poster.svg');

const designs = [
  {bg:'#111111',card:'#1d1d1d',accent:'#f5c542',title:'SASIKUMAR AI'},
  {bg:'#071a16',card:'#10352d',accent:'#ffd54a',title:'SASIKUMAR AI'},
  {bg:'#10142b',card:'#202858',accent:'#ffd166',title:'SASIKUMAR AI'},
  {bg:'#24120b',card:'#402116',accent:'#ffcf5a',title:'SASIKUMAR AI'},
  {bg:'#171024',card:'#2c1b3d',accent:'#f6d365',title:'SASIKUMAR AI'},
  {bg:'#06151f',card:'#0e2b3a',accent:'#ffd84d',title:'SASIKUMAR AI'}
];

const posterTypes = [
  ['GOLD & SILVER PRICE','தங்கம் மற்றும் வெள்ளி விலை','DAILY PRICE UPDATE'],
  ['PRECIOUS METALS UPDATE','தங்கம் • வெள்ளி தினசரி தகவல்','LIVE PRICE UPDATE'],
  ['GOLD & SILVER NEWS','தங்கம் மற்றும் வெள்ளி தகவல்','DAILY MARKET UPDATE'],
  ['PRICE AWARENESS','தங்கம் • வெள்ளி விலை விழிப்புணர்வு','PRICE AWARENESS'],
  ['APPRAISER UPDATE','Gold Appraiser • Gold Valuer','APPRAISER INFORMATION'],
  ['DAILY METAL TIP','தினசரி தங்கம் • வெள்ளி குறிப்பு','METAL AWARENESS'],
  ['8G GOLD + 1KG SILVER','8 கிராம் தங்கம் • 1 கிலோ வெள்ளி','REFERENCE PRICE'],
  ['SASIKUMAR AI','Gold Appraiser • Gold Valuer','SASIKUMAR AI']
];

function money(n){
  return '₹' + Math.round(Number(n || 0)).toLocaleString('en-IN');
}

function today(){
  return new Intl.DateTimeFormat('en-IN',{
    timeZone:'Asia/Kolkata',
    day:'2-digit',
    month:'2-digit',
    year:'numeric'
  }).format(new Date());
}

function safeNumber(v){
  const n=Number(String(v ?? '').replace(/[^0-9.-]/g,''));
  return Number.isFinite(n) ? n : 0;
}

function getDesign(){
  const d=new Date();
  return designs[(d.getDate()-1)%designs.length];
}

function getPosterType(){
  const now=new Date();
  const parts=new Intl.DateTimeFormat('en-IN',{
    timeZone:'Asia/Kolkata',
    year:'numeric',
    month:'numeric',
    day:'numeric'
  }).formatToParts(now);

  const year=Number(parts.find(x=>x.type==='year').value);
  const month=Number(parts.find(x=>x.type==='month').value);
  const day=Number(parts.find(x=>x.type==='day').value);

  const start=new Date(Date.UTC(year,0,1));
  const current=new Date(Date.UTC(year,month-1,day));
  const dayOfYear=Math.floor((current-start)/86400000)+1;

  return posterTypes[(dayOfYear-1)%posterTypes.length];
}

async function getRates(){
  const [goldRes,silverRes]=await Promise.all([
    fetch(BASE+'/api/gold-rate'),
    fetch(BASE+'/api/silver-rate')
  ]);

  if(!goldRes.ok)
    throw new Error('/api/gold-rate HTTP '+goldRes.status);

  if(!silverRes.ok)
    throw new Error('/api/silver-rate HTTP '+silverRes.status);

  const gold=await goldRes.json();
  const silver=await silverRes.json();

  console.log('Gold API:',JSON.stringify(gold));
  console.log('Silver API:',JSON.stringify(silver));

  const gr=gold.rates || {};
  const r24=safeNumber(gr['24K']);
  const r22=safeNumber(gr['22K']);
  const r20=safeNumber(gr['20K']);
  const r19=safeNumber(gr['19K']);
  const r18=safeNumber(gr['18K']);

  if(!r24 || !r22)
    throw new Error('Gold 24K/22K rate unavailable');

  const sr=silver.silver || {};

  const silverGram=safeNumber(
    sr.gram ?? silver.price_gram_999
  );

  const silver10g=safeNumber(
    sr.tenGram ?? (silver.price_gram_999 * 10)
  );

  const silverKg=safeNumber(
    sr.kg ?? silver.price_kg_999
  );

  if(!silverGram || !silverKg)
    throw new Error('Silver rate unavailable');

  return {
    gold:{
      r24,
      r22,
      r20:r20 || Math.round(r24*20/24),
      r19:r19 || Math.round(r24*19/24),
      r18:r18 || Math.round(r24*18/24),
      previousClose:safeNumber(gold.previousClose),
      change:safeNumber(gold.change),
      changePercent:safeNumber(gold.changePercent)
    },
    silver:{
      gram:silverGram,
      tenGram:silver10g || silverGram*10,
      kg:silverKg,
      previousClose:safeNumber(silver.previousClose),
      change:safeNumber(silver.change),
      changePercent:safeNumber(silver.changePercent)
    }
  };
}

function changeText(change,pct){
  if(change>0)
    return `▲ UP ${money(Math.abs(change))} (${Math.abs(pct).toFixed(2)}%)`;

  if(change<0)
    return `▼ DOWN ${money(Math.abs(change))} (${Math.abs(pct).toFixed(2)}%)`;

  return '— NO CHANGE';
}

function poster(data){
  const d=getDesign();
  const pt=getPosterType();

  const g=data.gold;
  const s=data.silver;

  const goldRows=[
    ['24K','99.9%',g.r24],
    ['22K / 916','91.6%',g.r22],
    ['20K','83.3%',g.r20],
    ['19K','79.2%',g.r19],
    ['18K','75.0%',g.r18]
  ];

  const goldSvg=goldRows.map((x,i)=>{
    const y=350+i*66;
    return `
      <rect x="55" y="${y-39}" width="890" height="53" rx="13" fill="${d.card}"/>
      <text x="80" y="${y-5}" font-family="Arial,sans-serif"
        font-size="23" font-weight="700" fill="${d.accent}">${x[0]}</text>
      <text x="330" y="${y-5}" font-family="Arial,sans-serif"
        font-size="17" fill="#dddddd">${x[1]}</text>
      <text x="900" y="${y-5}" text-anchor="end"
        font-family="Arial,sans-serif" font-size="25"
        font-weight="700" fill="#ffffff">${money(x[2])}/g</text>`;
  }).join('');

  return `
<svg xmlns="http://www.w3.org/2000/svg"
 width="1000" height="1400" viewBox="0 0 1000 1400">

<rect width="1000" height="1400" fill="${d.bg}"/>

<rect x="35" y="35" width="930" height="1330" rx="35"
 fill="none" stroke="${d.accent}" stroke-width="4"/>

<text x="500" y="105" text-anchor="middle"
 font-family="Arial,sans-serif" font-size="46" font-weight="900"
 fill="${d.accent}">${d.title}</text>

<text x="500" y="150" text-anchor="middle"
 font-family="Arial,sans-serif" font-size="29" font-weight="800"
 fill="#ffffff">${pt[0]}</text>

<text x="500" y="190" text-anchor="middle"
 font-family="Arial,sans-serif" font-size="19"
 fill="#dddddd">${pt[1]}</text>

<text x="500" y="225" text-anchor="middle"
 font-family="Arial,sans-serif" font-size="20"
 fill="#bbbbbb">TAMIL NADU • THANJAVUR • LIVE RATE • ${today()}</text>

<text x="75" y="270"
 font-family="Arial,sans-serif" font-size="24" font-weight="900"
 fill="${d.accent}">GOLD PRICE</text>

${goldSvg}

<rect x="55" y="690" width="890" height="175" rx="22" fill="${d.card}"/>

<text x="80" y="735"
 font-family="Arial,sans-serif" font-size="22" font-weight="900"
 fill="${d.accent}">GOLD RATE CHANGE</text>

<text x="80" y="780"
 font-family="Arial,sans-serif" font-size="21"
 fill="#ffffff">Previous Close: ${money(g.previousClose)}</text>

<text x="80" y="825"
 font-family="Arial,sans-serif" font-size="23" font-weight="800"
 fill="#ffffff">${changeText(g.change,g.changePercent)}</text>

<rect x="55" y="895" width="890" height="245" rx="24"
 fill="${d.card}"/>

<text x="80" y="940"
 font-family="Arial,sans-serif" font-size="30" font-weight="900"
 fill="${d.accent}">SILVER PRICE</text>

<text x="80" y="990"
 font-family="Arial,sans-serif" font-size="22"
 fill="#ffffff">1 gram</text>

<text x="900" y="990" text-anchor="end"
 font-family="Arial,sans-serif" font-size="28" font-weight="800"
 fill="#ffffff">${money(s.gram)}</text>

<text x="80" y="1035"
 font-family="Arial,sans-serif" font-size="22"
 fill="#ffffff">10 gram</text>

<text x="900" y="1035" text-anchor="end"
 font-family="Arial,sans-serif" font-size="28" font-weight="800"
 fill="#ffffff">${money(s.tenGram)}</text>

<text x="80" y="1080"
 font-family="Arial,sans-serif" font-size="22"
 fill="#ffffff">1 kilogram</text>

<text x="900" y="1080" text-anchor="end"
 font-family="Arial,sans-serif" font-size="30" font-weight="900"
 fill="#ffffff">${money(s.kg)}</text>

<text x="80" y="1120"
 font-family="Arial,sans-serif" font-size="21" font-weight="800"
 fill="#ffffff">${changeText(s.change,s.changePercent)}</text>

<rect x="55" y="1170" width="890" height="95" rx="20"
 fill="${d.accent}"/>

<text x="500" y="1210" text-anchor="middle"
 font-family="Arial,sans-serif" font-size="20" font-weight="900"
 fill="#111111">GOLD 8G: ${money(g.r22*8)} • SILVER 1KG: ${money(s.kg)}</text>

<text x="500" y="1245" text-anchor="middle"
 font-family="Arial,sans-serif" font-size="25" font-weight="900"
 fill="#111111">WHATSAPP 95850 80842</text>

<text x="500" y="1300" text-anchor="middle"
 font-family="Arial,sans-serif" font-size="18"
 fill="#bbbbbb">International/reference rates • Local retail rate may differ</text>

<text x="500" y="1330" text-anchor="middle"
 font-family="Arial,sans-serif" font-size="17"
 fill="#999999">SASIKUMAR AI • GOLD + SILVER DAILY UPDATE</text>

</svg>`;
}

async function sendDiscordUpdate(data){
  try{
    const webhook=process.env.DISCORD_WEBHOOK_URL;

    if(!webhook){
      console.log('⚠️ DISCORD_WEBHOOK_URL not configured — Discord skipped');
      return;
    }

    const g=data.gold;
    const s=data.silver;

    const message={
      username:'SASIKUMAR AI',
      content:
`💰 **SASIKUMAR AI — GOLD + SILVER DAILY UPDATE**

📅 ${today()}

💎 GOLD
24K: ${money(g.r24)}/g
22K: ${money(g.r22)}/g
20K: ${money(g.r20)}/g
19K: ${money(g.r19)}/g
18K: ${money(g.r18)}/g
⚖️ 22K / 916 — 8g: ${money(g.r22*8)}
📈 ${changeText(g.change,g.changePercent)}

🥈 SILVER
1g: ${money(s.gram)}
10g: ${money(s.tenGram)}
1kg: ${money(s.kg)}
📊 ${changeText(s.change,s.changePercent)}

📍 Thanjavur
ℹ️ GoldAPI international/reference rates. Local jewellery retail rate may differ.

🌐 SASIKUMAR AI
https://sasikumar-ai-9wdq.onrender.com/daily-gold-poster.svg`
    };

    const response=await fetch(webhook,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(message)
    });

    if(!response.ok){
      const errorText=await response.text();
      throw new Error(`Discord HTTP ${response.status}: ${errorText}`);
    }

    console.log('✅ Discord Gold + Silver Update sent successfully');

  }catch(e){
    console.error('❌ Discord send failed:',e.message);
  }
}

async function generate(){
  try{
    const data=await getRates();
    const svg=poster(data);

    fs.writeFileSync(OUT,svg,'utf8');

    console.log(`✅ Gold + Silver Daily Poster generated: ${new Date().toISOString()}`);
    console.log(`📁 ${OUT}`);
    console.log(`💎 Gold 24K: ${money(data.gold.r24)}`);
    console.log(`🪙 Gold 22K: ${money(data.gold.r22)}`);
    console.log(`🥈 Silver 1g: ${money(data.silver.gram)}`);
    console.log(`🥈 Silver 1kg: ${money(data.silver.kg)}`);

    await sendDiscordUpdate(data);

  }catch(e){
    console.error('❌ Gold + Silver Daily Poster failed:',e.message);
  }
}

cron.schedule(
  '0 10 * * *',
  generate,
  {timezone:'Asia/Kolkata'}
);

console.log('🟢 SASIKUMAR AI Gold + Silver Poster automation started');
console.log('⏰ Schedule: Every day at 10:00 AM IST');

generate();
