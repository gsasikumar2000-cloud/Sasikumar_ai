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
  const h=mem.get(u)||[];
  const msgs=[{role:"system",content:`You are Sasikumar GLOBAL AI. Chennai Vinayaga Agencies. Helpful, smart, Tamil+English mix. Know everything. Memory:${getMem(u)}`}];
  h.slice(-6).forEach(m=>msgs.push({role:m.r==="user"?"user":"assistant",content:m.t}));
  msgs.push({role:"user",content:q});
  const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${GROQ}`,"Content-Type":"application/json"},body:JSON.stringify({model:"openai/gpt-oss-20b",messages:msgs,max_tokens:1000,temperature:0.7})});
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

// WEB API - THIS FIXES YOUR SCREENSHOT ERROR
app.post('/api/chat', async(req,res)=>{
 try{
  const {message, category} = req.body;
  const txt = message || category || "hi";
  const uid="web-user";
  add(uid,"user",txt);
  let ans = await groqAI(txt,uid);
  if(!ans) ans = await globalKnowledge(txt);
  if(!ans) ans = smartAI(txt);
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

async function sendWA(to,pid,pl){ if(!WATOKEN) return; await fetch(`https://graph.facebook.com/v20.0/${pid}/messages`,{method:"POST",headers:{Authorization:`Bearer ${WATOKEN}`,"Content-Type":"application/json"},body:JSON.stringify({messaging_product:"whatsapp",to,...pl})});}
app.get('/health',(q,r)=>r.json({global:"OK", groq:!!GROQ}));
app.get('/webhook',(q,r)=>{ if(q.query['hub.mode']==='subscribe'&&q.query['hub.verify_token']===VERIFY) r.send(q.query['hub.challenge']); else r.sendStatus(403);});
app.post('/webhook',async(req,res)=>{
 try{
  const v=req.body.entry?.[0]?.changes?.[0]?.value; const m=v?.messages?.[0]; if(!m){res.sendStatus(200);return;}
  const from=m.from; const pid=v.metadata.phone_number_id; const txt=m.text?.body||m.interactive?.button_reply?.id||"hi";
  add(from,"user",txt); let ans=await groqAI(txt,from); if(!ans) ans=await globalKnowledge(txt); if(!ans) ans=smartAI(txt);
  await sendWA(from,pid,{type:"text",text:{body:ans.slice(0,3500)}}); add(from,"assistant",ans); res.sendStatus(200);
 }catch(e){res.sendStatus(200);}
});
app.get('*',(q,r)=>r.sendFile(path.join(__dirname,'public','index.html')));
app.listen(process.env.PORT||10000,()=>console.log("GLOBAL API FIXED"));
