import 'dotenv/config';
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

const WELCOME_MENU = `🤖 SASIKUMAR AI — MAIN MENU

🌐 Website: https://sasikumar-ai-9wdq.onrender.com

1. 🤖 SASIKUMAR AI — AI Assistant
2. 🪙 Live Gold & Silver Rate
3. 🧮 Gold Loan / EMI Calculator
4. 🏦 Banking Services
5. 💎 Gold Expert
6. 📋 Gold Appraisal
7. 🎓 Education
8. 💼 Jobs & Careers
9. 💻 Business & Technology News
10. 📰 Breaking News
11. 🧠 General AI Chat
12. 🎨 Poster & Creative Design
13. 🖼️ AI Image Maker
14. 🎬 Video Maker
15. 🔍 Global Web Search
16. 🏏 Sports Updates
17. 📖 Daily Thirukkural
18. 📝 Tamil Kavithai
19. 🌹 Ponmozhigal
20. 💡 Thathuvam
21. 🔥 Motivation
22. 🌍 Leadership History
23. 🎧 Audio & Video Songs Hub
24. 📻 Live FM Radio
25. ✂️ Audio / Video Song Cutter
26. 📱 Mobile App Download
27. 🚀 Business Ideas
28. 🛠️ AI Tools
29. 🌐 Website Services
30. 📞 Contact & Customer Feedback
31. 📚 ALL CONTENT — Complete Services & Details

0. 🏠 Main Menu

Any language-la unga question-ai type pannalaam.
Option number anuppi service select pannunga.

— SASIKUMAR AI`;

const MENU_REPLIES = {
  '1': () => `🤖 SASIKUMAR AI — AI Assistant
Tamil, English, Tanglish and other languages-la kelvigal kelunga.
Type 0 for Main Menu`,
  '2': () => `🪙 LIVE GOLD & SILVER RATE
Current rates:
Gold API: https://sasikumar-ai-9wdq.onrender.com/api/gold
Silver API: https://sasikumar-ai-9wdq.onrender.com/api/silver-rate?state=Tamil%20Nadu&district=Thanjavur
Indha links-la current API data check pannunga. Verified live value illama rate guess pannama iruppom.
Type 0 for Main Menu`,
  '3': () => `🧮 GOLD LOAN / EMI CALCULATOR
Loan amount, interest rate, tenure details use panni EMI calculate pannalaam.
Website: https://sasikumar-ai-9wdq.onrender.com/loan-calculator.html
Type 0 for Main Menu`,
  '4': () => `🏦 BANKING SERVICES
Savings, loans, EMI and banking-related questions-ai kelunga.
Bank terms-ai official bank sources-la verify pannunga.
Type 0 for Main Menu`,
  '5': () => `💎 GOLD EXPERT
24K = 999; 22K = 916; 18K = 750.
Hallmark, purity, fineness and HUID-ai verify pannunga.
Type 0 for Main Menu`,
  '6': () => `📋 GOLD APPRAISAL
Weight, purity and valuation guidance.
AI estimate mattum final certification illa; professional testing thevai.
Type 0 for Main Menu`,
  '7': () => `🎓 EDUCATION
Courses, exams, scholarships and career guidance.
https://sasikumar-ai-9wdq.onrender.com/education/qa.html
https://sasikumar-ai-9wdq.onrender.com/education/equations.html
Type 0 for Main Menu`,
  '8': () => `💼 JOBS & CAREERS
Job search, resume, interview and career guidance.
https://sasikumar-ai-9wdq.onrender.com/jobs/index.html
Type 0 for Main Menu`,
  '9': () => `💻 BUSINESS & TECHNOLOGY NEWS
Business, startups, AI and technology-related questions kelunga.
Latest news details-ai current sources-la verify pannunga.
Type 0 for Main Menu`,
  '10': () => `📰 BREAKING NEWS
Tamil breaking news updates-kku request pannunga.
Type 0 for Main Menu`,
  '11': () => `🧠 GENERAL AI CHAT
Science, maths, coding, writing and general questions kelunga.
Type 0 for Main Menu`,
  '12': () => `🎨 POSTER & CREATIVE DESIGN
Festival posters, business posters and creative design ideas.
Website: https://sasikumar-ai-9wdq.onrender.com
Type 0 for Main Menu`,
  '13': () => `🖼️ AI IMAGE MAKER
Image creation ideas and prompts.
https://sasikumar-ai-9wdq.onrender.com/ai-image.html
Type 0 for Main Menu`,
  '14': () => `🎬 VIDEO MAKER
Video creation and promotional video guidance.
https://sasikumar-ai-9wdq.onrender.com/ai-video.html
Type 0 for Main Menu`,
  '15': () => `🔍 GLOBAL WEB SEARCH
Search-related questions and web research requests-ai anuppunga.
Type 0 for Main Menu`,
  '16': () => `🏏 SPORTS UPDATES
Sports schedules, scores and updates kelunga.
Latest scores-ai live source-la verify pannunga.
Type 0 for Main Menu`,
  '17': () => `📖 DAILY THIRUKKURAL
Thirukkural and its meaning ketkalaam.
Type 0 for Main Menu`,
  '18': () => `📝 TAMIL KAVITHAI
Tamil kavithai, love poems and friendship poems ketkalaam.
Type 0 for Main Menu`,
  '19': () => `🌹 PONMOZHIGAL
Tamil ponmozhigal and their meanings ketkalaam.
Type 0 for Main Menu`,
  '20': () => `💡 THATHUVAM
Life philosophy and Tamil thathuvam ketkalaam.
Type 0 for Main Menu`,
  '21': () => `🔥 MOTIVATION
Motivational thoughts and positive guidance ketkalaam.
Type 0 for Main Menu`,
  '22': () => `🌍 LEADERSHIP HISTORY
Indian and world leaders history patri kelunga.
https://sasikumar-ai-9wdq.onrender.com/indian-leadership.html
Type 0 for Main Menu`,
  '23': () => `🎧 AUDIO & VIDEO SONGS HUB
Audio/video hub:
https://sasikumar-ai-9wdq.onrender.com/audio-video-hub.html
Type 0 for Main Menu`,
  '24': () => `📻 LIVE FM RADIO
FM radio hub:
https://sasikumar-ai-9wdq.onrender.com/audio-video-hub.html
Type 0 for Main Menu`,
  '25': () => `✂️ AUDIO / VIDEO SONG CUTTER
Audio cutter tools:
https://sasikumar-ai-9wdq.onrender.com/audio-video-hub.html
Type 0 for Main Menu`,
  '26': () => `📱 MOBILE APP DOWNLOAD
SASIKUMAR AI website:
https://sasikumar-ai-9wdq.onrender.com
Verified dedicated APK link currently not confirmed.
Type 0 for Main Menu`,
  '27': () => `🚀 BUSINESS IDEAS
Small business, startup and business planning ideas ketkalaam.
Type 0 for Main Menu`,
  '28': () => `🛠️ AI TOOLS
AI tools and productivity suggestions ketkalaam.
Type 0 for Main Menu`,
  '29': () => `🌐 WEBSITE SERVICES
Website creation and web development guidance.
https://sasikumar-ai-9wdq.onrender.com
Type 0 for Main Menu`,
  '30': () => `📞 CONTACT & CUSTOMER FEEDBACK
Contact: https://sasikumar-ai-9wdq.onrender.com/communication.html
Feedback: https://sasikumar-ai-9wdq.onrender.com/customer-feedback.html
Type 0 for Main Menu`,
  '31': () => `📚 ALL CONTENT — COMPLETE SERVICES
SASIKUMAR AI menu options 1–31 cover AI chat, Gold/Silver, loan/EMI, banking, appraisal, education, jobs, news, creative tools, search, sports, Tamil content, audio/video, business ideas and website services.
Website: https://sasikumar-ai-9wdq.onrender.com/all-menus.html
Type 0 for Main Menu`
};

function getMenuReply(num){const fn=MENU_REPLIES[num];return fn?fn():null;}
function detectLang(q){try{if(/[\u0B80-\u0BFF]/.test(q))return 'ta';return 'en';}catch(e){return 'en';}}
function getGeneralReply(q,lang){const time=new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'});if(q.toLowerCase().includes('gold'))return `💰 GOLD RATE\nVerified current rate-ai /api/gold-la check pannunga.\nhttps://sasikumar-ai-9wdq.onrender.com/api/gold\nType 0 for Menu`;return `🌍 General AI - ${time}\nYou: "${q}"\nType 0 for Menu or 1-31`; }

app.get('/api/status',(req,res)=>{res.json({status:'WHATSAPP MENU 31 OPTIONS LIVE OK',version:'7.1 Menu',options:31,time:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})});});
app.get('/api/whatsapp/menu',(req,res)=>{res.json({welcome:WELCOME_MENU,total:31});});
app.get('/api/gold', async (req,res)=>{try{const d=await skGetLiveGoldRates();res.set('Cache-Control','no-store');res.json({'24k_per_g':d.rates['24K'],'22k_per_g':d.rates['22K'],rates:d.rates,source:d.source,fallbackUsed:d.fallbackUsed,updatedAt:d.updatedAt,note:d.note});}catch(e){console.error('[Gold API] Request failed:',e.message);res.status(503).json({ok:false,error:'Live Gold Rate temporarily unavailable.'});}});
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
  const num = trimmed.match(/^\s*(3[01]|[12][0-9]|[0-9])\s*$/);

  if (num) {
    reply = num[1] === '10'
      ? await getTamilBreakingNews()
      : (getMenuReply(num[1]) || WELCOME_MENU);
  } else if (/^(hi|hello|hey|வணக்கம்|ஹாய்|ஹலோ)[\s!.]*$/i.test(trimmed)) {
    reply = /[\u0B80-\u0BFF]/.test(trimmed)
      ? 'வணக்கம் நண்பா! 😊❤️ எப்படி இருக்கீங்க? என்ன உதவி வேண்டும்?'
      : 'Hey friend! 😊❤️ How are you today? How can I help?';
  } else if (/tamil\s*(breaking\s*)?news|breaking\s*news|தமிழ்.*செய்தி|முக்கியச் செய்திகள்/i.test(trimmed)) {
    reply = await getTamilBreakingNews();
  } else if (/\b(kavithai|poem|poetry)\b|கவிதை|கவிதைகள்/i.test(trimmed)) {
    reply = getMenuReply('18');
  } else if (/\b(ponmozhigal|ponmozhi|quotes?|proverbs?)\b|பொன்மொழி|பொன்மொழிகள்/i.test(trimmed)) {
    reply = getMenuReply('19');
  } else if (/\b(thathuvam|philosophy)\b|தத்துவம்|வாழ்க்கைத் தத்துவம்/i.test(trimmed)) {
    reply = getMenuReply('20');
  } else if (/\b(thirukkural|kural)\b|திருக்குறள்/i.test(trimmed)) {
    reply = getMenuReply('17');
  } else if (/\b(motivation|motivational)\b|ஊக்கம்|தன்னம்பிக்கை/i.test(trimmed)) {
    reply = getMenuReply('21');
  } else if (/audio\s*(and|&)\s*video\s*hub|audio.video.hub|audio|songs?|music|video\s*hub|movie\s*videos?|பாடல்கள்?|ஆடியோ|வீடியோ ஹப்|ஒலி/i.test(trimmed)) {
    reply = getMenuReply('23');
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

      if (isWelcome) {
        const now = new Date();
        const date = now.toLocaleDateString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit', month: 'long', year: 'numeric'
        });
        const time = now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit', minute: '2-digit', hour12: true
        });

        const welcomeCaption = [
          '🤖 SASIKUMAR AI',
          '🙏 Welcome! வணக்கம்!',
          '🌍 ALL LANGUAGES AVAILABLE',
          '💬 Ask in your preferred language: Tamil, English, Hindi, Telugu, Malayalam, Kannada, Bengali, Marathi, Gujarati, Punjabi, Urdu and more.',
          '🌐 Website: https://sasikumar-ai-9wdq.onrender.com',
          '📅 Date: ' + date,
          '🕒 Time: ' + time + ' IST',
          '',
          '📩 Complete service menu follows in the next message.'
        ].join('\n');

        await sendWA({
          type: 'image',
          image: {
            link: 'https://sasikumar-ai-9wdq.onrender.com/assets/sasikumar-ai-logo.png',
            caption: welcomeCaption
          }
        });

        await new Promise(resolve => setTimeout(resolve, 800));

        const menuCaption = [
          '🤖 SASIKUMAR AI — COMPLETE MENU',
          '1. AI Assistant',
          '2. Live Gold & Silver Rate',
          '3. Gold Loan / EMI Calculator',
          '4. Banking Services',
          '5. Gold Expert',
          '6. Gold Appraisal',
          '7. Education',
          '8. Jobs & Careers',
          '9. Business & Technology News',
          '10. Breaking News',
          '11. General AI Chat',
          '12. Poster & Creative Design',
          '13. AI Image Maker',
          '14. Video Maker',
          '15. Global Web Search',
          '16. Sports Updates',
          '17. Daily Thirukkural',
          '18. Tamil Kavithai',
          '19. Ponmozhigal',
          '20. Thathuvam',
          '21. Motivation',
          '22. Leadership History',
          '23. Audio & Video Songs Hub',
          '24. Live FM Radio',
          '25. Audio / Video Song Cutter',
          '26. Mobile App Download',
          '27. Business Ideas',
          '28. AI Tools',
          '29. Website Services',
          '30. Contact & Customer Feedback',
          '31. All Content — Complete Services',
          '0. Main Menu',
          'Send an option number to select a service.'
        ].join('\n');

        await sendWA({
          type: 'image',
          image: {
            link: 'https://sasikumar-ai-9wdq.onrender.com/assets/whatsapp-menu.png',
            caption: menuCaption
          }
        });
      } else {
        const caption = ('🤖 SASIKUMAR AI\n' + answerText).substring(0, 1000);
        const imageUrl = 'https://sasikumar-ai-9wdq.onrender.com/assets/sasikumar-ai-logo.png';

        await sendWA({
          type: 'image',
          image: {
            link: imageUrl,
            caption: caption
          }
        });
      }
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



// SK_LIVE_TAMIL_NEWS_JSON_API_V1
app.get('/api/breaking-news', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');

  const key = process.env.NEWSDATA_API_KEY;
  if (!key || !key.trim()) {
    return res.status(503).json({
      ok: false,
      error: 'News API key is not configured.',
      articles: []
    });
  }

  const requested = String(req.query.category || 'tamil-nadu')
    .trim().toLowerCase().replace(/\s+/g, '-');

  const configs = {
    'tamil-nadu': {
      label: 'Tamil Nadu',
      country: 'in',
      language: 'ta',
      q: 'தமிழ்நாடு OR இந்தியா'
    },
    'india': {
      label: 'India',
      country: 'in',
      language: 'en'
    },
    'world': {
      label: 'World',
      language: 'en',
      category: 'world'
    },
    'business': {
      label: 'Business',
      country: 'in',
      language: 'en',
      category: 'business'
    },
    'technology': {
      label: 'Technology',
      country: 'in',
      language: 'en',
      category: 'technology'
    },
    'sports': {
      label: 'Sports',
      country: 'in',
      language: 'en',
      category: 'sports'
    }
  };

  const config = configs[requested];

  if (!config) {
    return res.status(400).json({
      ok: false,
      error: 'Invalid news category.',
      supportedCategories: Object.keys(configs),
      articles: []
    });
  }

  try {
    const values = {
      apikey: key.trim(),
      language: config.language
    };

    if (config.country) values.country = config.country;
    if (config.category) values.category = config.category;
    if (config.q) values.q = config.q;

    const params = new URLSearchParams(values);

    const response = await fetch(
      'https://newsdata.io/api/1/latest?' + params.toString(),
      { signal: AbortSignal.timeout(20000) }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.status === 'error') {
      const errorInfo =
        data.results || data.message || data.error || 'Unknown provider error';

      console.error(
        '[Live News] NewsData error:',
        response.status,
        JSON.stringify(errorInfo).slice(0, 300)
      );

      return res.status(502).json({
        ok: false,
        error: 'News provider is temporarily unavailable.',
        category: config.label,
        articles: []
      });
    }

    const articles = (Array.isArray(data.results) ? data.results : [])
      .filter(item =>
        item &&
        item.title &&
        item.link &&
        /^https?:\/\//i.test(String(item.link))
      )
      .slice(0, 5)
      .map(item => ({
        title: String(item.title).slice(0, 250),
        url: String(item.link),
        content: String(item.description || '').slice(0, 500),
        published_date: item.pubDate || null
      }));

    return res.json({
      ok: true,
      provider: 'NewsData.io',
      category: config.label,
      language: config.language,
      updatedAt: new Date().toISOString(),
      articles
    });
  } catch (error) {
    console.error('[Live News] Request failed:', error.message || error);

    return res.status(502).json({
      ok: false,
      error: 'News search temporarily failed.',
      articles: []
    });
  }
});
// END SK_LIVE_TAMIL_NEWS_JSON_API_V1



// SK_REAL_GOLD_SILVER_API_V1
const SK_GOLD_SILVER_CACHE_MS = 5 * 60 * 1000;
let skLiveGoldCache = null;
let skLiveGoldCacheTime = 0;
let skLiveSilverCache = null;
let skLiveSilverCacheTime = 0;

async function skGetLiveGoldRates() {
  if (skLiveGoldCache && Date.now() - skLiveGoldCacheTime < SK_GOLD_SILVER_CACHE_MS) {
    return { ...skLiveGoldCache, cached: true };
  }

  let r24, source, fallbackUsed = false, buy = null, sell = null, gst = null;
  let change24h = null;

  try {
    const response = await fetch(
      "https://api.oropocket.com/public/prices",
      { signal: AbortSignal.timeout(12000) }
    );
    const data = await response.json();
    const gold = data && data.data && data.data.gold;
    const value = Number(gold && gold.sell);

    if (!response.ok || !gold || !Number.isFinite(value) || value <= 0) {
      throw new Error("OroPocket gold price unavailable or invalid");
    }

    r24 = Math.round(value);
    buy = Number.isFinite(Number(gold.buy)) ? Number(gold.buy) : null;
    sell = value;
    gst = Number.isFinite(Number(gold.gst)) ? Number(gold.gst) : null;
    change24h = gold.change24h || null;
    source = "OroPocket • Gold • INR/gram";
  } catch (primaryError) {
    console.warn("[Gold Rate] OroPocket failed:", primaryError.message);

    const response = await fetch(
      "https://api.goldprice.dev/v1/prices?symbol=XAU-INR-SPOT",
      { signal: AbortSignal.timeout(12000) }
    );
    const data = await response.json();
    const ouncePrice = Number(data && data.symbols && data.symbols[0] && data.symbols[0].price);

    if (!response.ok || !Number.isFinite(ouncePrice) || ouncePrice <= 0) {
      throw new Error("Live Gold providers unavailable");
    }

    r24 = Math.round(ouncePrice / 31.1034768);
    source = "goldprice.dev • XAU/INR";
    fallbackUsed = true;
  }

  const rates = {
    "24K": r24,
    "22K": Math.round(r24 * 22 / 24),
    "20K": Math.round(r24 * 20 / 24),
    "19K": Math.round(r24 * 19 / 24),
    "18K": Math.round(r24 * 18 / 24)
  };

  skLiveGoldCache = {
    ok: true,
    rates,
    gold24k: rates["24K"],
    gold22k: rates["22K"],
    "24k_per_g": rates["24K"],
    "22k_per_g": rates["22K"],
    buy,
    sell,
    gst,
    change24h,
    source,
    fallbackUsed,
    updatedAt: new Date().toISOString(),
    note: "Reference gold price. Local jewellery retail rates may differ."
  };
  skLiveGoldCacheTime = Date.now();

  return { ...skLiveGoldCache, cached: false };
}

async function skGetLiveSilverRate() {
  if (skLiveSilverCache && Date.now() - skLiveSilverCacheTime < SK_GOLD_SILVER_CACHE_MS) {
    return { ...skLiveSilverCache, cached: true };
  }

  const response = await fetch(
    "https://api.oropocket.com/public/prices",
    { signal: AbortSignal.timeout(12000) }
  );
  const data = await response.json();
  const silver = data && data.data && data.data.silver;
  const priceGram = Number(silver && silver.sell);

  if (!response.ok || !silver || !Number.isFinite(priceGram) || priceGram <= 0) {
    throw new Error("Live Silver provider unavailable or returned invalid data");
  }

  const round = n => Math.round(n * 100) / 100;

  skLiveSilverCache = {
    ok: true,
    price_gram_999: round(priceGram),
    price_10g_999: round(priceGram * 10),
    price_8g_999: round(priceGram * 8),
    price_kg_999: round(priceGram * 1000),
    silver: {
      gram: round(priceGram),
      tenGram: round(priceGram * 10),
      eightGram: round(priceGram * 8),
      kg: round(priceGram * 1000)
    },
    source: "OroPocket • Silver • INR/gram",
    fallbackUsed: false,
    updatedAt: new Date().toISOString(),
    note: "Reference silver sell price. Local retail rates may differ."
  };
  skLiveSilverCacheTime = Date.now();

  return { ...skLiveSilverCache, cached: false };
}

app.get("/api/gold-rate", async (req, res) => {
  try {
    const rates = await skGetLiveGoldRates();
    res.set("Cache-Control", "no-store");
    res.json({
      ...rates,
      state: req.query.state || "Tamil Nadu",
      district: req.query.district || "Thanjavur",
      date: new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata" }).format(new Date())
    });
  } catch (error) {
    console.error("[Gold Rate] Request failed:", error.message || error);
    res.status(503).json({
      ok: false,
      error: "Live Gold Rate temporarily unavailable.",
      source: null
    });
  }
});

app.get("/api/silver-rate", async (req, res) => {
  try {
    const rates = await skGetLiveSilverRate();
    res.set("Cache-Control", "no-store");
    res.json({
      ...rates,
      state: req.query.state || "Tamil Nadu",
      district: req.query.district || "Thanjavur",
      date: new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata" }).format(new Date())
    });
  } catch (error) {
    console.error("[Silver Rate] Request failed:", error.message || error);
    res.status(503).json({
      ok: false,
      state: req.query.state || "Tamil Nadu",
      district: req.query.district || "Thanjavur",
      error: "Live Silver Rate temporarily unavailable."
    });
  }
});
// END SK_REAL_GOLD_SILVER_API_V1

// SK_HIDE_OLD_20_OPTION_MENU_V1
app.get('/whatsapp-menu.html', (req, res) => res.redirect(302, '/'));
// END SK_HIDE_OLD_20_OPTION_MENU_V1

app.use(express.static(publicPath));
app.get('*',(req,res)=>{const fp=path.join(publicPath,'index.html');if(fs.existsSync(fp))res.sendFile(fp);else res.status(404).send('Not Found');});
app.listen(PORT,()=>console.log(`🤖 31 OPTIONS WHATSAPP MENU http://localhost:${PORT} - OK`));
