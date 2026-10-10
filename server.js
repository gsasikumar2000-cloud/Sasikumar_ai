import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const app=express();
app.use(cors()); app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));
const VERIFY=process.env.VERIFY_TOKEN||"sasikumar123";
const WATOKEN=process.env.WHATSAPP_TOKEN;
const GROQ=process.env.GROQ_API_KEY||process.env.GEMINI_API_KEY;
const mem=new Map();
const add=(u,r,t)=>{if(!mem.has(u))mem.set(u,[]);let a=mem.get(u);a.push({r,t,time:Date.now()});if(a.length>30)a.shift()};
const getMem=(u)=>(mem.get(u)||[]).slice(-8).map(x=>`${x.r}:${x.t}`).join('\n');

async function groqAI(q,u="web"){
 if(!GROQ) return null;
 try{
  const history=mem.get(u)||[];
  const h=history.filter((m,i,a)=>
    !(i===a.length-1 && m.r==="user" && m.t===q)
  );
  const msgs=[{role:"system",content:`You are SASIKUMAR AI, a helpful and accurate Tamil and English assistant.
Respond in the language used by the user. For Tamil questions, answer in clear, natural Tamil.
Prioritize factual accuracy over confidence. Never invent historical dates, people, places, quotations, or events.
For history questions, use accepted historical chronology and distinguish established facts from disputed dates.
For Tamil history, use these careful historical guidelines:
The traditional Tamil three crowned dynasties are the Chera (சேரர்), Chola (சோழர்), and Pandya (பாண்டியர்).
Madurai was a major Pandya capital.
Early Chola centres included Uraiyur; Thanjavur and later Gangaikonda Cholapuram were important imperial Chola capitals.
The Chera capital is traditionally associated with Vanji; its precise location and identification with Karur or other sites are debated by historians. Do not confidently claim Thiruvananthapuram was the ancient Chera capital.
Do not confuse dynasty names or invent people, places, dates, or timelines. Avoid precise date ranges unless supported by reliable evidence. Explain historical uncertainty briefly and clearly. Sangam literature is an important source for early Tamil history.
If a fact is uncertain or unavailable, clearly say so instead of guessing.
For current gold rates, news, jobs, and other changing information, do not present old figures as live data.
Give a direct answer with useful details. Use conversation history only when relevant.
Conversation context: ${getMem(u)}`}];
  h.slice(-6).forEach(m=>msgs.push({role:m.r==="user"?"user":"assistant",content:m.t}));
  msgs.push({role:"user",content:q});
  const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${GROQ}`,"Content-Type":"application/json"},body:JSON.stringify({model:"openai/gpt-oss-20b",messages:msgs,max_tokens:1400,temperature:0.3})});
  const d=await r.json();
  if(d.error) {console.log("GROQ ERR",d.error); return null;}
  return d.choices?.[0]?.message?.content||null;
 }catch(e){console.log("groq fail",e.message); return null;}
}

async function globalKnowledge(q){
 try{
  const clean=q.replace(/what is|who is|explain|define|tell me about|growth|kavithai|kural|ponmozhi/gi,'').trim()||q;
  const w=await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(clean)}`);
  if(w.ok){let d=await w.json(); if(d.extract) return `🌍 ${d.title}:\n${d.extract.slice(0,800)}`;}
 }catch{}
 return null;
}

function smartAI(t){
 const l=t.toLowerCase();
 if(/^[0-9+\-*/%(). ]+$/.test(t.trim())){try{let a=Function(`return ${t}`)();return `🧮 Answer: ${t} = ${a}`;}catch{}}
 if(l.includes("gold")) return `💰 Chennai Gold Live: 22K ₹13,815/g (8g ₹1,10,520), 24K ₹15,071/g, Silver ₹245/g. Dubai $2,685/oz. Tip: Buy now Sir!`;
 if(l.includes("job")) return `💼 Jobs: Marketing/Sales - Vinayaga Agencies Chennai, IT - Python/AI/Web, Govt TNPSC. Tell qualification Sir!`;
 if(l.includes("growth")) return `🚀 Growth Tip Sir: Daily 1% improve. Health: 30min walk, Wealth: Save 20% gold, Mind: Learn 1 skill/month.`;
 if(l.includes("kavithai")||l.includes("kural")||l.includes("ponmozhi")) return `✨ Kavithai: "Muyarchi thiruvinai aakkum" - Effort brings fortune! Life la try panni paaru Sir, success varum! 🌟`;
 return `🤖 Sasikumar GLOBAL AI Sir: "${t}" - Naan world knowledge AI! Science, history, tech, code, gold, jobs, life edhu venumnaalum ketkalam. Specific ah ketta full answer tharuven!`;
}

function conversationRecallAnswer(q,u) {
  const text = String(q || "").toLowerCase();
  const asksRecall = /நான்\s*(முன்பு|முன்னாடி|முந்தைய)\s*(என்ன|எதை)\s*(சொன்னேன்|கேட்டேன்)|முன்பு\s*நான்|what did i (say|ask) before|my previous message|remember my last message/i.test(text);

  if (!asksRecall) return null;

  const history = mem.get(u) || [];
  const previous = [...history].reverse().find(m => m.r === "user");

  if (!previous) {
    return "இந்த உரையாடல் நினைவகத்தில் முந்தைய செய்தி கிடைக்கவில்லை. அதனால் ஊகித்துப் பதிலளிக்க மாட்டேன்.";
  }

  return `உங்கள் முந்தைய செய்தி: “${String(previous.t).slice(0,2000)}”`;
}

function tamilHistoryAnswer(q) {
  const text = String(q || "").toLowerCase();
  const asksKings = /மூவேந்தர்|மூன்று முக்கிய அரச|சேரர்.*சோழர்|சோழர்.*பாண்டியர்|tamil history/i.test(text);
  if (!asksKings) return null;

  return `## தமிழகத்தின் மூவேந்தர்கள்

தமிழக வரலாற்றில் புகழ்பெற்ற மூன்று அரச மரபுகள் சேரர், சோழர், பாண்டியர்.

| அரச மரபு | முக்கிய வரலாற்று மையங்கள் |
|---|---|
| சேரர் | வஞ்சி என்பது பாரம்பரியமாகக் குறிப்பிடப்படும் தலைநகரம். அதன் துல்லியமான இடம் குறித்து வரலாற்று ஆய்வுகளில் கருத்து வேறுபாடுகள் உள்ளன; கரூருடனான தொடர்பும் விவாதிக்கப்படுகிறது. |
| சோழர் | உறையூர் பழைய சோழ மையமாக இருந்தது. தஞ்சாவூர் மற்றும் கங்கைகொண்ட சோழபுரம் பிற்காலப் பேரரசுச் சோழர்களின் முக்கிய தலைநகரங்களாக விளங்கின. |
| பாண்டியர் | மதுரை முக்கியமான பாண்டிய அரசியல் மற்றும் பண்பாட்டு மையமாக விளங்கியது. |

**நினைவில் கொள்ளுங்கள்:** இந்த அரச மரபுகளின் தலைநகரங்களும் அரசியல் மையங்களும் காலத்திற்கேற்ப மாறின. சேரர்களின் பழைய தலைநகரத்தின் துல்லியமான இடம் குறித்து முழுமையான ஒருமித்த கருத்து இல்லை.`;

}

// WEB API - THIS FIXES YOUR SCREENSHOT ERROR
app.post('/api/chat', async(req,res)=>{
 try{
  const {message, category, conversationId} = req.body || {};
  const txt = String(message || category || "hi").slice(0,12000);
  const safeId = String(conversationId || "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0,80);
  const uid = safeId
    ? "web:" + safeId
    : "web:oneoff:" + Date.now() + ":" + Math.random().toString(36).slice(2);

  let ans = conversationRecallAnswer(txt,uid) || tamilHistoryAnswer(txt) || await groqAI(txt,uid);
  if(!ans) ans = await globalKnowledge(txt);
  if(!ans) ans = smartAI(txt);

  add(uid,"user",txt);
  add(uid,"assistant",ans);
  res.json({reply:ans, status:"ok", ai: GROQ? "Groq LIVE" : "Offline Smart"});
 }catch(e){console.error(e); res.json({reply:"Error Sir, try again!", status:"error"});}
});


// GLOBAL SEARCH API
app.get('/api/global-search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) {
    return res.status(400).json({ error: 'Please provide a search query using ?q=' });
  }

  try {
    const key = process.env.TAVILY_API_KEY;
    if (key) {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: key,
          query: q,
          search_depth: 'basic',
          max_results: 5
        })
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Tavily search failed:', response.status);
        return res.status(502).json({ error: 'Search provider request failed' });
      }

      return res.json({
        query: q,
        results: (data.results || []).map(x => ({
          title: x.title,
          url: x.url,
          content: x.content
        }))
      });
    }

    const response = await fetch(
      'https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=' +
      encodeURIComponent(q),
      { headers: { 'User-Agent': 'SasikumarAI/1.0' } }
    );

    if (!response.ok) {
      return res.status(502).json({ error: 'Fallback search provider failed' });
    }

    const data = await response.json();
    return res.json({
      query: q,
      provider: 'Wikipedia',
      results: (data.query?.search || []).map(x => ({
        title: x.title,
        url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(x.title.replace(/ /g, '_')),
        content: x.snippet.replace(/<[^>]*>/g, '')
      }))
    });
  } catch (e) {
    console.error('Global search error:', e.message);
    return res.status(502).json({ error: 'Search temporarily unavailable' });
  }
});

app.get('/api/status',(req,res)=>res.json({live:true, groq:!!GROQ, gemini:!!GROQ, users:mem.size}));

async function sendWA(to,pid,pl){
  if(!WATOKEN){
    console.error("[WhatsApp] WHATSAPP_TOKEN is missing");
    return false;
  }
  if(!to || !pid){
    console.error("[WhatsApp] Recipient or phone_number_id is missing");
    return false;
  }
  try{
    const response = await fetch(
      `https://graph.facebook.com/v20.0/${pid}/messages`,
      {
        method:"POST",
        headers:{
          Authorization:`Bearer ${WATOKEN}`,
          "Content-Type":"application/json"
        },
        body:JSON.stringify({messaging_product:"whatsapp",to,...pl})
      }
    );
    const result = await response.json().catch(()=>({}));
    if(!response.ok){
      console.error("[WhatsApp] API error:", response.status,
        JSON.stringify(result.error || result).slice(0,1000));
      return false;
    }
    console.log("[WhatsApp] Message accepted by API");
    return true;
  }catch(error){
    console.error("[WhatsApp] Request failed:", error.message);
    return false;
  }
}
app.get('/health',(q,r)=>r.json({global:"OK", groq:!!GROQ}));
app.get('/webhook',(q,r)=>{ if(q.query['hub.mode']==='subscribe'&&q.query['hub.verify_token']===VERIFY) r.send(q.query['hub.challenge']); else r.sendStatus(403);});
app.post('/webhook',async(req,res)=>{
 try{
  const v=req.body.entry?.[0]?.changes?.[0]?.value; const m=v?.messages?.[0]; if(!m){res.sendStatus(200);return;}
  const from=m.from; const pid=v.metadata.phone_number_id; const txt=m.text?.body||m.interactive?.button_reply?.id||"hi";
  add(from,"user",txt); let ans=await groqAI(txt,from); if(!ans) ans=await globalKnowledge(txt); if(!ans) ans=smartAI(txt);
  await sendWA(from,pid,{type:"text",text:{body:ans.slice(0,3500)}}); add(from,"assistant",ans); res.sendStatus(200);
 }catch(e){
  console.error("[WhatsApp] Webhook processing failed:", e.message);
  if(!res.headersSent) res.sendStatus(200);
}
});
app.get('*',(q,r)=>r.sendFile(path.join(__dirname,'public','index.html')));
app.listen(process.env.PORT||10000,()=>console.log("GLOBAL API FIXED"));
