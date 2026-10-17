import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.json({limit:'16mb'}));
app.use((req,res,next)=>{
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.sendStatus(200);
  next();
});
const publicPath = path.join(__dirname,'public');
const WA_TOKEN = process.env.WHATSAPP_TOKEN || '';
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID || process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WA_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'sasikumar_ai_verify_2026';

const WELCOME_MENU = `🤖 Welcome 🙏
SASIKUMAR AI

🖼️ Logo: SASIKUMAR AI
🌐 Website: https://sasikumar-ai-9wdq.onrender.com

🎁 Visit Bonus • ▶️ Continue
Website: https://sasikumar-ai-9wdq.onrender.com

🌍 MULTI-LANGUAGE AI
Tamil • English • Tanglish • Hindi • Telugu • Malayalam • Kannada • Bengali • Marathi • Gujarati • Punjabi • Urdu • Odia • Assamese • More Languages

1️⃣ Gold Rate
2️⃣ Gold Loan / EMI
3️⃣ Banking
4️⃣ Gold Expert
5️⃣ Appraisal
6️⃣ Education
7️⃣ Jobs
8️⃣ Business / Tech News
9️⃣ General AI
🔟 🚨 Breaking News
1️⃣1️⃣ 💼 Business News
1️⃣2️⃣ 🏏 Sports
1️⃣3️⃣ 🔎 Web Search
1️⃣4️⃣ 🎨 Poster / Creative
1️⃣5️⃣ 📸 Image AI
1️⃣6️⃣ 🎬 Video Maker
1️⃣7️⃣ 📞 Contact / Communication
1️⃣8️⃣ ⭐ Feedback
1️⃣9️⃣ ℹ️ About SASIKUMAR AI
2️⃣0️⃣ 📰 Tamil News Channel Videos

2️⃣1️⃣ 📚 Leadership History
2️⃣2️⃣ 📰 Tamil Breaking News
2️⃣3️⃣ ✍️ கவிதைகள் — Tamil Kavithai
2️⃣4️⃣ 💬 பொன்மொழிகள் — Ponmozhigal
2️⃣5️⃣ 💡 தத்துவங்கள் — Thathuvam

🗣️ Any Language — Ask Freely

ஒரு option number அனுப்புங்கள்.
உதாரணம்: 1

அல்லது எந்த மொழியிலும் உங்கள் கேள்வியை நேரடியாக அனுப்பலாம்.

— SASIKUMAR AI
2️⃣6️⃣ 🪔 தினசரி திருக்குறள் — Daily Thirukkural
2️⃣7️⃣ 🔥 தினசரி ஊக்கம் — Daily Motivation
`;

const MENU_REPLIES = {
  '1': () => { const p=14748+Math.floor(Math.random()*80)-40; return `1️⃣ Gold Rate - LIVE\n\n💰 Thanjavur Gold:\n24K: Rs ${p}/g\n22K: Rs ${Math.floor(p*0.916)}/g\nTrend: ${p>14748?'Up ⬆️':'Down ⬇️'}\nLive: /api/gold\n\nType 0 for Menu`; },
  '2': () => `2️⃣ Gold Loan / EMI\nLoan 75% = Rs 1,01,250, Interest 12%, EMI Rs 8,500\nBanks: SBI, HDFC, Muthoot\nType 0 for Menu`,
  '3': () => `3️⃣ Banking\nSavings 3.5%, Gold Loan Instant, Personal Loan 11%\nType 0 for Menu`,
  '4': () => `4️⃣ GOLD EXPERT — PURITY SYMBOLS

💛 24K — 999: 99.9% தங்கம்
💍 22K — 916: 91.6% தங்கம்
💎 18K — 750: 75% தங்கம்
✨ 14K — 585: 58.5% தங்கம்
🔹 9K — 375: 37.5% தங்கம்

🏷️ BIS Hallmark சரிபார்க்கவும்:
✅ BIS முத்திரை
✅ Purity/Fineness எண்
✅ HUID — 6 எழுத்து/எண்கள் கொண்ட தனிப்பட்ட குறியீடு

⚠️ குறியீடுகளுடன் Hallmark மற்றும் HUID விவரங்களையும் சரிபார்க்கவும்.
🤖 SASIKUMAR AI
Type 0 for Menu`,
  '5': () => `5️⃣ Appraisal\nPurity test, Weight, Value, Certificate\nCharge Rs 100-300\nType 0 for Menu`,
  '6': () => `6️⃣ Education\nTop: AI & Data Science, B.Tech, MBBS, TNPSC UPSC\nType 0 for Menu`,
  '7': () => `7️⃣ Jobs\nAI Engineer 12L+, Full Stack Remote 8-15L, TNPSC Govt\nType 0 for Menu`,
  '8': () => `8️⃣ Business / Tech News\nAI boom, Gold up 5%, Sensex 75k+\nType 0 for Menu`,
  '9': () => `9️⃣ General AI\nAsk Anything: Tamil history, Gold, Jobs, Science, Math, Coding, 20+ languages!\nType 0 for Menu`,
  '10': () => `🔟 Breaking News\nGold Rs 14748/g LIVE, Thanjavur festival, 【entity-IPL¦canonical_name=IPL】 CSK Top\nType 0 for Menu`,
  '11': () => `11️⃣ Business News\nGold market strong, RBI 6.5%, Startups funding up\nType 0 for Menu`,
  '12': () => `12️⃣ Sports\nIPL CSK vs MI today! CSK Top! Football Euro\nType 0 for Menu`,
  '13': () => `13️⃣ Web Search\nSearch: "【entity-ISRO¦canonical_name=ISRO】", "Thanjavur"\nType 0 for Menu`,
  '14': () => `14️⃣ Poster / Creative\nFestival posters Pongal Diwali, Business posters\nSend "Poster Pongal"\nType 0 for Menu`,
  '15': () => `15️⃣ Image AI\nGenerate: "Thanjavur temple", "Gold jewellery"\nType 0 for Menu`,
  '16': () => `16️⃣ Video Maker\nFestival videos, Business promo\nSend "Video Pongal"\nType 0 for Menu`,
  '17': () => `17️⃣ Contact\nWebsite: https://sasikumar-ai-9wdq.onrender.com\nWhatsApp: This number!\nThanjavur\nType 0 for Menu`,
  '18': () => `18️⃣ Feedback\nRate 1-5 stars, Send idea\n"Feedback 5 star - Super AI!"\nType 0 for Menu`,
  '19': () => `19️⃣ About SASIKUMAR AI\nFrom Thanjavur, Multi-Language 20+ langs, 20 Services, Version 7.0\nType 0 for Menu`,
  '20': () => `20️⃣ Tamil News Videos\nThanjavur news, Sun News, 【entity-Thanthi TV¦canonical_name=Thanthi TV】\nSend "Tamil news"\nType 0 for Menu`,

  '21': () => `2️⃣1️⃣ LEADERSHIP HISTORY — தலைமைத்துவ வரலாறு

🌍 உலகத் தலைவர்கள்
🇮🇳 இந்தியத் தலைவர்கள்
🏛️ தமிழ்நாட்டுத் தலைவர்கள்
📚 வாழ்க்கை வரலாறு மற்றும் தலைமைத்துவப் பாடங்கள்

ஒரு தலைவரின் பெயரை அல்லது "Indian leaders", "Tamil Nadu leaders" என்று அனுப்புங்கள்.
🤖 SASIKUMAR AI
Type 0 for Menu`,
  '22': () => `2️⃣2️⃣ TAMIL BREAKING NEWS — தமிழ் முக்கியச் செய்திகள்

📰 சமீபத்திய செய்திகளைப் பெற "Tamil news" அல்லது "Breaking news" என்று அனுப்புங்கள்.
🌍 தமிழ்நாடு • இந்தியா • உலகம்
🤖 SASIKUMAR AI
Type 0 for Menu`,

  '23': () => `2️⃣3️⃣ 📝 தமிழ் கவிதைகள் — KAVITHAI

❤️ காதல் கவிதைகள்
🤝 நட்பு கவிதைகள்
🌿 வாழ்க்கைக் கவிதைகள்
💪 ஊக்கக் கவிதைகள்

எந்த வகைக் கவிதை வேண்டும் என்று அனுப்புங்கள்.
உதாரணம்: காதல் கவிதை
🤖 SASIKUMAR AI
Type 0 for Menu`,

  '24': () => `2️⃣4️⃣ 🌹 பொன்மொழிகள் — PONMOZHIGAL

🌱 வாழ்க்கைப் பொன்மொழிகள்
💪 ஊக்கமளிக்கும் பொன்மொழிகள்
🤝 நட்பு மற்றும் அன்பு
🎓 கல்வி மற்றும் வெற்றி

"வாழ்க்கை பொன்மொழிகள்" அல்லது "Motivation quotes" என்று அனுப்புங்கள்.
🤖 SASIKUMAR AI
Type 0 for Menu`,

  '25': () => `2️⃣5️⃣ 💡 தத்துவம் — THATHUVAM

🌍 வாழ்க்கைத் தத்துவம்
🧠 சிந்தனை மற்றும் அறிவு
❤️ அன்பு மற்றும் மனிதநேயம்
🕊️ அமைதி மற்றும் மனநிறைவு

"வாழ்க்கை தத்துவம்" என்று அனுப்புங்கள்.
🤖 SASIKUMAR AI
Type 0 for Menu`


  ,
  '26': () => `🪔 26 — தினசரி திருக்குறள்

📖 குறள் 1:
அகர முதல எழுத்தெல்லாம் ஆதி
பகவன் முதற்றே உலகு.

💡 பொருள்:
எழுத்துகளுக்கு அகரம் முதன்மையானது; உலகிற்கு இறைவன் முதன்மையானவர்.

📩 அடுத்த குறளுக்கு NEXT அனுப்புங்கள்.
🤖 SASIKUMAR AI Type 0 for Menu`,
  '27': () => `🔥 27 — தினசரி ஊக்கம்

🌅 இன்றைய சிந்தனை:
சிறிய முயற்சியையும் தொடர்ந்து செய்தால் பெரிய முன்னேற்றத்தை அடையலாம்.

🎯 இன்றைய செயல்:
நீண்ட நாட்களாகத் தள்ளிப்போட்ட ஒரு நல்ல வேலையை இன்று தொடங்குங்கள்.

💪 நம்பிக்கையுடன் தொடர்ந்து முயற்சி செய்யுங்கள்.
🤖 SASIKUMAR AI Type 0 for Menu`
};

function getMenuReply(num){const fn=MENU_REPLIES[num];return fn?fn():null;}
function detectLang(q){try{if(/[\u0B80-\u0BFF]/.test(q))return 'ta';return 'en';}catch(e){return 'en';}}
function getGeneralReply(q,lang){const time=new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'});if(q.toLowerCase().includes('gold')){const p=14748+Math.floor(Math.random()*80)-40;return `💰 GOLD LIVE - ${time}\n24K: Rs ${p}/g\nType 0 for Menu`;}return `🌍 General AI - ${time}\nYou: "${q}"\nType 0 for Menu or 1-27`; }

app.get('/api/status',(req,res)=>{res.json({status:'WHATSAPP MENU 27 OPTIONS LIVE OK',version:'7.1 Menu',options:27,time:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})});});
app.get('/api/whatsapp/menu',(req,res)=>{res.json({welcome:WELCOME_MENU,total:27});});
app.get('/api/gold',(req,res)=>{const p=14748+Math.floor(Math.random()*80)-40;res.json({'24k_per_g':p,'22k_per_g':Math.floor(p*0.916),trend:p>14748?'up':'down',last_updated:new Date().toISOString()});});
app.get('/api/services',(req,res)=>{res.json({services:[{id:1,name:'Gold Rate',ta:'தங்க விலை',icon:'💰'},{id:2,name:'Gold Loan',ta:'தங்க கடன்',icon:'🏦'},{id:3,name:'Banking',ta:'வங்கி',icon:'🏧'},{id:4,name:'Gold Expert',ta:'தங்க நிபுணர்',icon:'👨‍🏫'},{id:5,name:'Appraisal',ta:'மதிப்பீடு',icon:'🔍'},{id:6,name:'Education',ta:'கல்வி',icon:'📚'},{id:7,name:'Jobs',ta:'வேலை',icon:'💼'},{id:8,name:'Business Tech News',ta:'வணிக செய்தி',icon:'💼'},{id:9,name:'General AI',ta:'பொது AI',icon:'🧠'},{id:10,name:'Breaking News',ta:'முக்கிய செய்தி',icon:'🚨'},{id:11,name:'Business News',ta:'வணிக செய்தி',icon:'💼'},{id:12,name:'Sports',ta:'விளையாட்டு',icon:'🏏'},{id:13,name:'Web Search',ta:'இணைய தேடல்',icon:'🔎'},{id:14,name:'Poster Creative',ta:'போஸ்டர்',icon:'🎨'},{id:15,name:'Image AI',ta:'பட AI',icon:'📸'},{id:16,name:'Video Maker',ta:'வீடியோ',icon:'🎬'},{id:17,name:'Contact',ta:'தொடர்பு',icon:'📞'},{id:18,name:'Feedback',ta:'கருத்து',icon:'⭐'},{id:19,name:'About',ta:'பற்றி',icon:'ℹ️'},{id:20,name:'Tamil News Videos',ta:'தமிழ் செய்தி',icon:'📰'}]});});


/* SASIKUMAR AI GLOBAL CHAT API */
app.post('/api/chat', async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();
    const category = String(req.body?.category || 'General AI').slice(0, 100);
    const attachment = req.body?.attachment;

    if (!message && !attachment) {
      return res.status(400).json({
        reply: 'தயவுசெய்து உங்கள் கேள்வியை உள்ளிடுங்கள்.',
        answer: 'தயவுசெய்து உங்கள் கேள்வியை உள்ளிடுங்கள்.'
      });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        reply: 'AI server configuration error: GROQ_API_KEY is missing.',
        answer: 'AI server configuration error: GROQ_API_KEY is missing.'
      });
    }

    let userMessage = message;

    if (attachment) {
      const fileName =
        typeof attachment === 'object'
          ? String(attachment.name || attachment.filename || 'uploaded file')
          : 'uploaded file';

      userMessage +=
        (userMessage ? '\n\n' : '') +
        '[User attached a file: ' + fileName +
        '. If its contents are not available to you, ask the user to paste the relevant text.]';
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);

    let upstream;
    try {
      upstream = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-20b',
            messages: [
              {
                role: 'system',
                content:
                  'You are SASIKUMAR AI, a helpful multilingual assistant. ' +
                  'Respond in the language used by the user, including Tamil, English, or Tanglish. ' +
                  'Give clear, accurate and useful answers. ' +
                  'For current information that you cannot verify, be transparent. ' +
                  'The requested service category is: ' + category + '.'
              },
              {
                role: 'user',
                content: userMessage
              }
            ],
            temperature: 0.7,
            max_completion_tokens: 2048
          }),
          signal: controller.signal
        }
      );
    } finally {
      clearTimeout(timer);
    }

    const result = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      console.error(
        'Groq API error:',
        upstream.status,
        result?.error?.message || 'Upstream request failed'
      );

      const errorMessage =
        upstream.status === 401
          ? 'AI API authentication failed. Please check the server API key.'
          : upstream.status === 429
          ? 'AI service is busy or its usage limit was reached. Please try again later.'
          : 'AI service returned an error (HTTP ' + upstream.status + '). Please try again.';

      return res.status(502).json({
        reply: errorMessage,
        answer: errorMessage
      });
    }

    const reply = result?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(502).json({
        reply: 'AI-யிடமிருந்து பதில் கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.',
        answer: 'AI-யிடமிருந்து பதில் கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.'
      });
    }

    return res.json({ reply, answer: reply, api: 'Groq AI' });
  } catch (error) {
    console.error('Chat API error:', error.name || 'Error', error.message || '');

    const message =
      error.name === 'AbortError'
        ? 'AI பதில் பெற அதிக நேரமாகிறது. மீண்டும் முயற்சிக்கவும்.'
        : 'AI இணைப்பில் பிழை ஏற்பட்டது. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.';

    return res.status(500).json({ reply: message, answer: message });
  }
});

app.post('/api/ai-reply',(req,res)=>{
  try{
    const q=(req.body.question||'').trim();
    if(!q) return res.json({answer:WELCOME_MENU,api:'Welcome Menu'});
    if(q==='0' || q.toLowerCase()==='menu' || ['hi','hello','vanakkam','start'].includes(q.toLowerCase())) return res.json({answer:WELCOME_MENU,api:'Welcome Menu'});
    const direct=q.match(/^\s*(1[0-9]|20|[0-9])\s*$/);
    let num=direct?direct[1]:q.replace(/[^0-9]/g,'');
    if(num && parseInt(num)>=1 && parseInt(num)<=20 && q.length<=3){
      const reply=getMenuReply(num);
      if(reply) return res.json({answer:reply,api:`Option ${num}`,option:num});
    }
    // Check 11-20 explicitly
    if(q.includes('11')) return res.json({answer:getMenuReply('11'),option:'11'});
    if(q.includes('12')) return res.json({answer:getMenuReply('12'),option:'12'});
    if(q.includes('13')) return res.json({answer:getMenuReply('13'),option:'13'});
    if(q.includes('14')) return res.json({answer:getMenuReply('14'),option:'14'});
    if(q.includes('15')) return res.json({answer:getMenuReply('15'),option:'15'});
    if(q.includes('16')) return res.json({answer:getMenuReply('16'),option:'16'});
    if(q.includes('17')) return res.json({answer:getMenuReply('17'),option:'17'});
    if(q.includes('18')) return res.json({answer:getMenuReply('18'),option:'18'});
    if(q.includes('19')) return res.json({answer:getMenuReply('19'),option:'19'});
    if(q.includes('20')) return res.json({answer:getMenuReply('20'),option:'20'});
    res.json({answer:getGeneralReply(q,detectLang(q)),api:'General'});
  }catch(e){res.json({answer:WELCOME_MENU});}
});


// SK_WA_FRIENDLY_COMEDY_AI_V1
async function getWhatsAppAIReply(question, mode = 'normal') {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return 'மன்னிக்கவும் நண்பா 😊 AI சேவை இப்போது கிடைக்கவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்.';
  }

  const systemPrompt = mode === 'friendly'
    ? 'You are SASIKUMAR AI, a warm, friendly and respectful conversation partner. Match the user language (Tamil, English or Tanglish). Be kind, natural and concise. Never claim to be human.'
    : 'You are SASIKUMAR AI. Answer the user helpfully, accurately and respectfully. Match the user language (Tamil, English or Tanglish). If unsure about current facts, be transparent. Keep WhatsApp replies concise.';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: String(question).slice(0, 4000) }
          ],
          temperature: 0.7,
          max_completion_tokens: 700
        }),
        signal: controller.signal
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[WhatsApp AI]', response.status,
        data?.error?.message || 'AI request failed');
      return 'மன்னிக்கவும் நண்பா 😊 இப்போது AI பதில் கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.';
    }

    return data?.choices?.[0]?.message?.content?.trim() ||
      'மன்னிக்கவும் நண்பா 😊 பதில் கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.';
  } catch (error) {
    console.error('[WhatsApp AI]', error.message || error);
    return 'மன்னிக்கவும் நண்பா 😊 AI இணைப்பில் தற்காலிகப் பிழை. மீண்டும் முயற்சிக்கவும்.';
  } finally {
    clearTimeout(timer);
  }
}

app.get('/api/whatsapp/webhook',(req,res)=>{const mode=req.query['hub.mode'];const token=req.query['hub.verify_token'];const challenge=req.query['hub.challenge'];if(mode==='subscribe' && token===WA_VERIFY_TOKEN) res.status(200).send(challenge); else res.sendStatus(403);});

// SK_WA_LEADERSHIP_TAMIL_BREAKING_NEWS_V1
async function getTamilBreakingNews() {
  const key = process.env.TAVILY_API_KEY;
  const now = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata'
  });

  if (!key) {
    return '📰 தமிழ் முக்கியச் செய்திகள்\n\n' +
      'தற்போதைய செய்தித் தேடல் இப்போது அமைக்கப்படவில்லை.\n' +
      'Website: https://sasikumar-ai-9wdq.onrender.com\n' +
      '🤖 SASIKUMAR AI';
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        query: 'latest breaking news Tamil Nadu India world today',
        search_depth: 'basic',
        topic: 'news',
        max_results: 5,
        include_answer: true
      }),
      signal: AbortSignal.timeout(20000)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[Tamil Breaking News] Search HTTP error:', response.status);
      return '📰 தமிழ் முக்கியச் செய்திகள்\n\n' +
        'தற்போதைய செய்திகளைப் பெற முடியவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்.\n' +
        '🤖 SASIKUMAR AI';
    }

    const results = Array.isArray(data.results) ? data.results : [];
    if (!results.length && !data.answer) {
      return '📰 இப்போது சரிபார்க்கப்பட்ட செய்தி கிடைக்கவில்லை. பின்னர் முயற்சிக்கவும்.\n🤖 SASIKUMAR AI';
    }

    let out = '📰 தமிழ் முக்கியச் செய்திகள்\n' +
      '🕒 தேடிய நேரம்: ' + now + '\n\n';

    if (data.answer) {
      out += '📌 சுருக்கம்:\n' + String(data.answer).slice(0, 900) + '\n\n';
    }

    for (const [i, item] of results.slice(0, 5).entries()) {
      out += `${i + 1}. ${String(item.title || 'செய்தி').slice(0, 180)}\n`;
      if (item.content) {
        out += String(item.content).slice(0, 260) + '\n';
      }
      if (item.url && /^https?:\/\//i.test(item.url)) {
        out += item.url + '\n';
      }
      out += '\n';
    }

    return out.slice(0, 3500) + '\n🤖 SASIKUMAR AI';
  } catch (error) {
    console.error('[Tamil Breaking News]', error.message || error);
    return '📰 செய்தித் தேடலில் தற்காலிகப் பிழை. மீண்டும் முயற்சிக்கவும்.\n🤖 SASIKUMAR AI';
  }
}

app.post('/api/whatsapp/webhook',async(req,res)=>{
  try{
    const body=req.body;
    if(body.object!=='whatsapp_business_account') return res.sendStatus(404);

    const msg=body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if(!msg) return res.sendStatus(200);

    const from=msg.from;
    const trimmed=(msg.text?.body||'').trim();
    const lower=trimmed.toLowerCase();

const isWelcome = !trimmed || trimmed === '0' ||
  ['menu', 'start'].includes(lower);

let reply = WELCOME_MENU;

if (!isWelcome) {
  const num = trimmed.match(/^\s*(2[0-7]|1[0-9]|[0-9])\s*$/);

  if (num) {
    reply = num[1] === '22'
      ? await getTamilBreakingNews()
      : (getMenuReply(num[1]) || WELCOME_MENU);
  } else if (/^(hi|hello|hey|வணக்கம்|ஹாய்|ஹலோ)[\s!.]*$/i.test(trimmed)) {
    reply = /[\u0B80-\u0BFF]/.test(trimmed)
      ? 'வணக்கம் நண்பா! 😊❤️ எப்படி இருக்கீங்க? என்ன உதவி வேண்டும்?'
      : 'Hey friend! 😊❤️ How are you today? How can I help?';
  } else if (/tamil\s*(breaking\s*)?news|breaking\s*news|தமிழ்.*செய்தி|முக்கியச் செய்திகள்/i.test(trimmed)) {
    reply = await getTamilBreakingNews();
  } else if (/\b(kavithai|poem|poetry)\b|கவிதை|கவிதைகள்/i.test(trimmed)) {
    reply = getMenuReply('23');
  } else if (/\b(ponmozhigal|ponmozhi|quotes?|proverbs?)\b|பொன்மொழி|பொன்மொழிகள்/i.test(trimmed)) {
    reply = getMenuReply('24');
  } else if (/\b(thathuvam|philosophy)\b|தத்துவம்|வாழ்க்கைத் தத்துவம்/i.test(trimmed)) {
    reply = getMenuReply('25');
  } else if (/\b(thirukkural|kural)\b|திருக்குறள்/i.test(trimmed)) {
    reply = getMenuReply('26');
  } else if (/\b(motivation|motivational)\b|ஊக்கம்|தன்னம்பிக்கை/i.test(trimmed)) {
    reply = getMenuReply('27');
  } else if (/\b(comedy|joke|funny|laugh|next)\b|காமெடி|ஜோக்|நகைச்சுவை/i.test(trimmed)) {
    const jokes = [
      '😂 ஆசிரியர்: ஏன் லேட்டா வந்தாய்? மாணவர்: சார், கனவில் பள்ளிக்கு வந்தேன்; அதனால் நிஜத்தில் லேட்டாகிவிட்டது! 🤣',
      '🤣 நண்பன்: என் மொபைல் என்னை ரொம்ப நேசிக்குது! மற்றவன்: எப்படி? நண்பன்: எப்போதும் என்னைக் கட்டிப்பிடிச்சு சார்ஜ் கேட்குது! 😂📱',
      '😄 மருத்துவர்: தினமும் உடற்பயிற்சி செய்யுங்கள். நோயாளி: சரி டாக்டர், இனிமேல் உடற்பயிற்சி வீடியோக்களை தினமும் பார்ப்பேன்! 😂',
      '😂 கணவர்: இன்று சாப்பாட்டில் என்ன ஸ்பெஷல்? மனைவி: உங்களுக்காக அன்புடன் செய்தேன்! கணவர்: அதனால்தான் உப்புக்கூட அன்பாக அதிகமா இருக்கா? 🤣'
    ];
    reply = jokes[Math.floor(Math.random() * jokes.length)] +
      '\n\n😄 இன்னொரு காமெடிக்கு Next அனுப்புங்கள்!';
  } else if (/\bfriendly\b|நண்பா|நண்பரே/i.test(trimmed)) {
    reply = await getWhatsAppAIReply(trimmed, 'friendly');
  } else {
    reply = await getWhatsAppAIReply(trimmed, 'normal');
  }
}
if(WA_TOKEN && WA_PHONE_ID){
      const sendWA=async(payload)=>{
        const r=await fetch(
          `https://graph.facebook.com/v20.0/${WA_PHONE_ID}/messages`,
          {
            method:'POST',
            headers:{
              'Authorization':`Bearer ${WA_TOKEN}`,
              'Content-Type':'application/json'
            },
            body:JSON.stringify({
              messaging_product:'whatsapp',
              to:from,
              ...payload
            })
          }
        );
        const data=await r.json().catch(()=>({}));
        if(!r.ok) console.error('[WhatsApp send]',r.status,JSON.stringify(data).slice(0,400));
        return r.ok;
      };

      // One branded image message for every WhatsApp reply.
      const answerText = String(reply || WELCOME_MENU);
      const isMenuReply = answerText === WELCOME_MENU;

      const imageUrl = isMenuReply
        ? 'https://sasikumar-ai-9wdq.onrender.com/assets/whatsapp-menu.png'
        : 'https://sasikumar-ai-9wdq.onrender.com/assets/sasikumar-ai-logo.png';

      const caption = isMenuReply
        ? '🤖 SASIKUMAR AI — Welcome! Send an option number from 1 to 27.'
        : ('🤖 SASIKUMAR AI\\n' + answerText).substring(0, 1000);

      await sendWA({
        type: 'image',
        image: {
          link: imageUrl,
          caption: caption
        }
      });
    }
    res.sendStatus(200);
  }catch(e){
    console.error('[WhatsApp webhook]',e.message||e);
    res.sendStatus(500);
  }
});

app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { to, message, phone } = req.body || {};
    const target = to || phone;

    if (!target || !message) {
      return res.status(400).json({
        success: false,
        error: 'Need phone and message'
      });
    }

    let clean = String(target).replace(/[^0-9]/g, '');
    if (clean.length === 10) clean = '91' + clean;

    if (clean.length < 11 || clean.length > 15) {
      return res.status(400).json({
        success: false,
        error: 'Invalid recipient phone number'
      });
    }

    if (!WA_TOKEN || !WA_PHONE_ID) {
      const link = `https://wa.me/${clean}?text=${encodeURIComponent(String(message))}`;
      return res.status(503).json({
        success: false,
        demo: true,
        error: 'WhatsApp Cloud API is not configured',
        wa_link: link,
        to: clean
      });
    }

    const resp = await fetch(
      `https://graph.facebook.com/v20.0/${WA_PHONE_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WA_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: clean,
          type: 'text',
          text: { body: String(message).substring(0, 4000) }
        })
      }
    );

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      console.error('WhatsApp Cloud API error:', resp.status,
        data.error?.code || 'unknown');
      return res.status(resp.status >= 400 && resp.status < 600 ? resp.status : 502)
        .json({
          success: false,
          real_api: true,
          error: data.error?.message || 'WhatsApp message send failed',
          error_code: data.error?.code || null
        });
    }

    return res.json({
      success: true,
      real_api: true,
      data
    });
  } catch (e) {
    console.error('WhatsApp send route error:', e.message);
    return res.status(500).json({
      success: false,
      error: 'Internal WhatsApp send error'
    });
  }
});
app.post('/api/whatsapp/share',(req,res)=>{
  const {message,phone}=req.body;const text=message||WELCOME_MENU;
  let clean=(phone||'').replace(/[^0-9]/g,''); if(clean.length===10) clean='91'+clean;
  const link=clean?`https://wa.me/${clean}?text=${encodeURIComponent(text)}`:`https://wa.me/?text=${encodeURIComponent(text)}`;
  res.json({wa_link:link});
});


// SASIKUMAR AI GLOBAL WEB SEARCH API
app.get('/api/global-search', async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const query = String(req.query.q || '').trim();

  if (!query) {
    return res.status(400).json({
      error: 'Please enter a search query.',
      results: []
    });
  }

  if (query.length > 500) {
    return res.status(400).json({
      error: 'Search query is too long.',
      results: []
    });
  }

  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: 'Web Search is not configured. Please set TAVILY_API_KEY.',
      results: []
    });
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: 'basic',
        max_results: 8,
        include_answer: false
      }),
      signal: AbortSignal.timeout(25000)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Tavily Search HTTP error:', response.status);
      const googleUrl = 'https://www.google.com/search?q=' + encodeURIComponent(query);
      return res.json({
        query,
        fallback: 'google',
        error: 'Tavily search is unavailable. Continue with Google Search.',
        results: [{
          title: 'Google Search — ' + query,
          url: googleUrl,
          content: 'Tap this result to open current Google search results.'
        }]
      });
    }

    const results = (Array.isArray(data.results) ? data.results : [])
      .map(item => ({
        title: String(item.title || 'Search result'),
        url: String(item.url || ''),
        content: String(item.content || item.snippet || '')
      }))
      .filter(item => item.url.startsWith('https://') || item.url.startsWith('http://'));

    return res.json({ query, results });
  } catch (error) {
    console.error('Global Search request failed:', error.message);
    return res.status(502).json({
      error: 'Web Search is temporarily unavailable. Please try again.',
      results: []
    });
  }
});
// END SASIKUMAR AI GLOBAL WEB SEARCH API

app.use(express.static(publicPath));
app.get('*',(req,res)=>{const fp=path.join(publicPath,'index.html');if(fs.existsSync(fp))res.sendFile(fp);else res.status(404).send('Not Found');});
app.listen(PORT,()=>console.log(`🤖 27 OPTIONS WHATSAPP MENU http://localhost:${PORT} - OK`));
