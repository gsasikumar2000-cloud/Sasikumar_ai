const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const PORT = process.env.PORT || 3000;
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(__dirname, 'public', 'daily-gold-poster.svg');

const designs = [
  {
    bg:'#111111', card:'#1d1d1d', accent:'#f5c542',
    title:'SASIKUMAR AI',
    subtitle:'LIVE THANJAVUR GOLD RATE'
  },
  {
    bg:'#071a16', card:'#10352d', accent:'#ffd54a',
    title:'SASIKUMAR AI',
    subtitle:'THANJAVUR GOLD TODAY'
  },
  {
    bg:'#10142b', card:'#202858', accent:'#ffd166',
    title:'SASIKUMAR AI',
    subtitle:'DAILY GOLD UPDATE'
  },
  {
    bg:'#24120b', card:'#402116', accent:'#ffcf5a',
    title:'SASIKUMAR AI',
    subtitle:'THANJAVUR LIVE RATE'
  },
  {
    bg:'#171024', card:'#2c1b3d', accent:'#f6d365',
    title:'SASIKUMAR AI',
    subtitle:'GOLD RATE • THANJAVUR'
  },
  {
    bg:'#06151f', card:'#0e2b3a', accent:'#ffd84d',
    title:'SASIKUMAR AI',
    subtitle:'TODAY GOLD POSTER'
  }
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

function getDesign(){
  const d = new Date();
  return designs[(d.getDate() - 1) % designs.length];
}

const posterTypes = [
  {
    name: 'TODAY GOLD RATE',
    tamil: 'இன்றைய தங்க விலை',
    tag: 'GOLD RATE UPDATE'
  },
  {
    name: 'GOLD NEWS',
    tamil: 'தங்கம் தொடர்பான தகவல்',
    tag: 'DAILY GOLD NEWS'
  },
  {
    name: 'GOLD EDUCATION',
    tamil: 'தங்கம் பற்றிய கல்வி',
    tag: 'LEARN ABOUT GOLD'
  },
  {
    name: 'APPRAISER TIP',
    tamil: 'Gold Appraiser Tip',
    tag: 'APPRAISER AWARENESS'
  },
  {
    name: 'GOLD LOAN AWARENESS',
    tamil: 'Gold Loan Awareness',
    tag: 'GENERAL INFORMATION'
  },
  {
    name: 'DAILY GOLD TIP',
    tamil: 'தினசரி தங்க குறிப்பு',
    tag: 'GOLD AWARENESS'
  },
  {
    name: '8G / SAVARAN RATE',
    tamil: '8 கிராம் / சவரன் விலை',
    tag: '8 GRAM GOLD RATE'
  },
  {
    name: 'SASIKUMAR AI',
    tamil: 'Gold Appraiser • Gold Valuer',
    tag: 'SASIKUMAR AI'
  }
];

function getPosterType(){
  const now = new Date();
  const year = Number(new Intl.DateTimeFormat('en-IN',{
    timeZone:'Asia/Kolkata',
    year:'numeric'
  }).format(now));

  const month = Number(new Intl.DateTimeFormat('en-IN',{
    timeZone:'Asia/Kolkata',
    month:'numeric'
  }).format(now));

  const day = Number(new Intl.DateTimeFormat('en-IN',{
    timeZone:'Asia/Kolkata',
    day:'numeric'
  }).format(now));

  const start = new Date(Date.UTC(year, 0, 1));
  const current = new Date(Date.UTC(year, month - 1, day));
  const dayOfYear = Math.floor((current - start) / 86400000) + 1;

  return posterTypes[(dayOfYear - 1) % posterTypes.length];
}

function safeNumber(v){
  const n = Number(String(v ?? '').replace(/[^0-9.]/g,''));
  return Number.isFinite(n) ? n : 0;
}

async function getRates(){
  const url = BASE + '/api/gold-rate';

  const res = await fetch(url);
  if(!res.ok){
    throw new Error('/api/gold-rate HTTP ' + res.status);
  }

  const data = await res.json();

  console.log('Gold API response:', JSON.stringify(data));

  const rates = data.rates || data.data?.rates || data.gold?.rates || {};

  const r24 = safeNumber(rates['24K'] ?? rates['24k'] ?? data['24K']);
  const r22 = safeNumber(rates['22K'] ?? rates['22k'] ?? data['22K']);
  const r20 = safeNumber(rates['20K'] ?? rates['20k'] ?? data['20K']);
  const r19 = safeNumber(rates['19K'] ?? rates['19k'] ?? data['19K']);
  const r18 = safeNumber(rates['18K'] ?? rates['18k'] ?? data['18K']);

  if(!r24 || !r22){
    throw new Error('24K/22K rate not found in /api/gold-rate response');
  }

  return {
    r24,
    r22,
    r20: r20 || Math.round(r24 * 20 / 24),
    r19: r19 || Math.round(r24 * 19 / 24),
    r18: r18 || Math.round(r24 * 18 / 24)
  };
}

function poster(r){
  const d = getDesign();

  const rows = [
    ['24K','99.9%',r.r24],
    ['22K / 916','91.6%',r.r22],
    ['20K','83.3%',r.r20],
    ['19K','79.2%',r.r19],
    ['18K','75.0%',r.r18]
  ];

  const rowSvg = rows.map((x,i)=>{
    const y = 360 + i * 82;

    return `
      <rect x="55" y="${y-48}" width="890" height="66"
        rx="16" fill="${d.card}"/>
      <text x="85" y="${y-7}"
        font-family="Arial,sans-serif"
        font-size="27" font-weight="700"
        fill="${d.accent}">${x[0]}</text>
      <text x="350" y="${y-7}"
        font-family="Arial,sans-serif"
        font-size="20" fill="#dddddd">${x[1]}</text>
      <text x="900" y="${y-7}"
        text-anchor="end"
        font-family="Arial,sans-serif"
        font-size="29" font-weight="700"
        fill="#ffffff">${money(x[2])}/g</text>
    `;
  }).join('');

  const eight22 = r.r22 * 8;
  const eight24 = r.r24 * 8;

  return `
<svg xmlns="http://www.w3.org/2000/svg"
     width="1000" height="1400" viewBox="0 0 1000 1400">

  <rect width="1000" height="1400" fill="${d.bg}"/>

  <rect x="35" y="35" width="930" height="1330"
        rx="35" fill="none"
        stroke="${d.accent}" stroke-width="4"/>

  <text x="500" y="115"
        text-anchor="middle"
        font-family="Arial,sans-serif"
        font-size="48" font-weight="900"
        fill="${d.accent}">${d.title}</text>

  <text x="500" y="165"
        text-anchor="middle"
        font-family="Arial,sans-serif"
        font-size="30" font-weight="700"
        fill="#ffffff">${d.subtitle}</text>

  <text x="500" y="215"
        text-anchor="middle"
        font-family="Arial,sans-serif"
        font-size="23"
        fill="#dddddd">THANJAVUR • ${today()}</text>

  ${rowSvg}

  <rect x="55" y="800" width="890" height="190"
        rx="22" fill="${d.card}"/>

  <text x="85" y="850"
        font-family="Arial,sans-serif"
        font-size="25" font-weight="700"
        fill="${d.accent}">⚖ 8 GRAM / 1 SAVARAN</text>

  <text x="85" y="910"
        font-family="Arial,sans-serif"
        font-size="25"
        fill="#ffffff">22K / 916</text>

  <text x="900" y="910"
        text-anchor="end"
        font-family="Arial,sans-serif"
        font-size="32" font-weight="800"
        fill="#ffffff">${money(eight22)}</text>

  <text x="85" y="955"
        font-family="Arial,sans-serif"
        font-size="25"
        fill="#ffffff">24K</text>

  <text x="900" y="955"
        text-anchor="end"
        font-family="Arial,sans-serif"
        font-size="32" font-weight="800"
        fill="#ffffff">${money(eight24)}</text>

  <rect x="55" y="1040" width="890" height="150"
        rx="22" fill="${d.accent}"/>

  <text x="500" y="1095"
        text-anchor="middle"
        font-family="Arial,sans-serif"
        font-size="27" font-weight="900"
        fill="#111111">WHATSAPP</text>

  <text x="500" y="1145"
        text-anchor="middle"
        font-family="Arial,sans-serif"
        font-size="38" font-weight="900"
        fill="#111111">95850 80842</text>

  <text x="500" y="1260"
        text-anchor="middle"
        font-family="Arial,sans-serif"
        font-size="21"
        fill="#cccccc">Indicative rates • Verify with local jeweller</text>

  <text x="500" y="1305"
        text-anchor="middle"
        font-family="Arial,sans-serif"
        font-size="19"
        fill="#aaaaaa">SASIKUMAR AI • LIVE THANJAVUR RATE</text>

</svg>`;
}


function normalizeRates(x){
  if(!x) return x;

  if(x.r24 && x.r22){
    return x;
  }

  return {
    r24: safeNumber(x['24K'] ?? x['24k'] ?? x.r24 ?? x.rate24),
    r22: safeNumber(x['22K'] ?? x['22k'] ?? x.r22 ?? x.rate22),
    r20: safeNumber(x['20K'] ?? x['20k'] ?? x.r20 ?? x.rate20),
    r19: safeNumber(x['19K'] ?? x['19k'] ?? x.r19 ?? x.rate19),
    r18: safeNumber(x['18K'] ?? x['18k'] ?? x.r18 ?? x.rate18)
  };
}

async function generate(){
  try{
    const rates = await getRates();
    const svg = poster(rates);

    fs.writeFileSync(OUT, svg, 'utf8');

    console.log(
      `✅ Daily Gold Poster generated: ${new Date().toISOString()}`
    );
    console.log(`📁 ${OUT}`);
    console.log(`💎 24K: ${money(rates.r24)}`);
    console.log(`🪙 22K: ${money(rates.r22)}`);
  }catch(e){
    console.error('❌ Daily Gold Poster failed:', e.message);
  }
}

/*
  Daily at 10:00 AM IST.
*/
cron.schedule(
  '0 10 * * *',
  generate,
  { timezone:'Asia/Kolkata' }
);

console.log('🟢 SASIKUMAR AI Daily Gold Poster automation started');
console.log('⏰ Schedule: Every day at 10:00 AM IST');

generate();
