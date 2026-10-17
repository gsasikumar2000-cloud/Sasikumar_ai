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

🗣️ Any Language — Ask Freely

ஒரு option number அனுப்புங்கள்.
உதாரணம்: 1

அல்லது எந்த மொழியிலும் உங்கள் கேள்வியை நேரடியாக அனுப்பலாம்.

— SASIKUMAR AI`;

const MENU_REPLIES = {
  '1': () => { const p=14748+Math.floor(Math.random()*80)-40; return `1️⃣ Gold Rate - LIVE\n\n💰 Thanjavur Gold:\n24K: Rs ${p}/g\n22K: Rs ${Math.floor(p*0.916)}/g\nTrend: ${p>14748?'Up ⬆️':'Down ⬇️'}\nLive: /api/gold\n\nType 0 for Menu`; },
  '2': () => `2️⃣ Gold Loan / EMI\nLoan 75% = Rs 1,01,250, Interest 12%, EMI Rs 8,500\nBanks: SBI, HDFC, Muthoot\nType 0 for Menu`,
  '3': () => `3️⃣ Banking\nSavings 3.5%, Gold Loan Instant, Personal Loan 11%\nType 0 for Menu`,
  '4': () => `4️⃣ Gold Expert\n24K Investment best, 22K Jewellery best, BIS 916 must!\nShops: Lalithaa, GRT\nType 0 for Menu`,
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
};

function getMenuReply(num){const fn=MENU_REPLIES[num];return fn?fn():null;}
function detectLang(q){try{if(/[\u0B80-\u0BFF]/.test(q))return 'ta';return 'en';}catch(e){return 'en';}}
function getGeneralReply(q,lang){const time=new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'});if(q.toLowerCase().includes('gold')){const p=14748+Math.floor(Math.random()*80)-40;return `💰 GOLD LIVE - ${time}\n24K: Rs ${p}/g\nType 0 for Menu`;}return `🌍 General AI - ${time}\nYou: "${q}"\nType 0 for Menu or 1-20`; }

app.get('/api/status',(req,res)=>{res.json({status:'WHATSAPP MENU 20 OPTIONS LIVE OK',version:'7.0 Menu',options:20,time:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})});});
app.get('/api/whatsapp/menu',(req,res)=>{res.json({welcome:WELCOME_MENU,total:20});});
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

app.get('/api/whatsapp/webhook',(req,res)=>{const mode=req.query['hub.mode'];const token=req.query['hub.verify_token'];const challenge=req.query['hub.challenge'];if(mode==='subscribe' && token===WA_VERIFY_TOKEN) res.status(200).send(challenge); else res.sendStatus(403);});
app.post('/api/whatsapp/webhook',async(req,res)=>{
  try{
    const body=req.body;
    if(body.object!=='whatsapp_business_account') return res.sendStatus(404);

    const msg=body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if(!msg) return res.sendStatus(200);

    const from=msg.from;
    const trimmed=(msg.text?.body||'').trim();
    const lower=trimmed.toLowerCase();
    const isWelcome=!trimmed || trimmed==='0' ||
      ['menu','hi','hello','vanakkam','start'].includes(lower);

    let reply=WELCOME_MENU;
    if(!isWelcome){
      const num=trimmed.match(/^\s*(1[0-9]|20|[0-9])\s*$/);
      reply=num ? (getMenuReply(num[1])||WELCOME_MENU)
                : getGeneralReply(trimmed,detectLang(trimmed));
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
        ? '🤖 SASIKUMAR AI — Welcome! Send an option number from 1 to 20.'
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

app.post('/api/whatsapp/send',async(req,res)=>{
  try{
    const {to,message,phone}=req.body;const target=to||phone;
    if(!target||!message) return res.status(400).json({error:'Need phone and message'});
    let clean=target.replace(/[^0-9]/g,''); if(clean.length===10) clean='91'+clean;
    if(!WA_TOKEN||!WA_PHONE_ID){const link=`https://wa.me/${clean}?text=${encodeURIComponent(message)}`;return res.json({success:true,demo:true,wa_link:link,to:clean});}
    const resp=await fetch(`https://graph.facebook.com/v20.0/${WA_PHONE_ID}/messages`,{method:'POST',headers:{'Authorization':`Bearer ${WA_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to:clean,type:'text',text:{body:message.substring(0,4000)}})});
    const data=await resp.json();res.json({success:true,real_api:true,data});
  }catch(e){res.status(500).json({error:e.message});}
});

app.post('/api/whatsapp/share',(req,res)=>{
  const {message,phone}=req.body;const text=message||WELCOME_MENU;
  let clean=(phone||'').replace(/[^0-9]/g,''); if(clean.length===10) clean='91'+clean;
  const link=clean?`https://wa.me/${clean}?text=${encodeURIComponent(text)}`:`https://wa.me/?text=${encodeURIComponent(text)}`;
  res.json({wa_link:link});
});

app.use(express.static(publicPath));
app.get('*',(req,res)=>{const fp=path.join(publicPath,'index.html');if(fs.existsSync(fp))res.sendFile(fp);else res.status(404).send('Not Found');});
app.listen(PORT,()=>console.log(`🤖 20 OPTIONS WHATSAPP MENU http://localhost:${PORT} - OK`));
