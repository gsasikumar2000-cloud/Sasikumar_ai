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
const VERIFY_TOKEN=process.env.VERIFY_TOKEN||"sasikumar123";
const WHATSAPP_TOKEN=process.env.WHATSAPP_TOKEN;
const GROQ_KEY=process.env.GROQ_API_KEY;

const chatHistory=new Map();
function addHistory(u,r,t){ if(!chatHistory.has(u)) chatHistory.set(u,[]); const a=chatHistory.get(u); a.push({role:r,text:t,time:Date.now()}); if(a.length>20) a.shift(); }
function getHistory(u){ return (chatHistory.get(u)||[]).slice(-6).map(m=>`${m.role}:${m.text}`).join('\n'); }

async function askGroq(prompt, uid){
 if(!GROQ_KEY) return null;
 try{
  const hist=chatHistory.get(uid)||[];
  const msgs=[{role:"system",content:`You are Sasikumar AI, Chennai Vinayaga Agencies General Intelligent Assistant. You are helpful, smart, friendly, Tamil+English mix. You know everything - jobs, gold, tech, science, life, history, maths. Answer short, clear, useful. User is Sir. Current history: ${getHistory(uid)}`}];
  hist.slice(-8).forEach(h=>msgs.push({role:h.role==="user"?"user":"assistant",content:h.text}));
  msgs.push({role:"user",content:prompt});
  const res=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Authorization":`Bearer ${GROQ_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:"llama-3.1-8b-instant",messages:msgs,max_tokens:800,temperature:0.7})});
  const data=await res.json();
  if(data.error){ console.log("GROQ ERR",data.error.message); return null; }
  return data.choices?.[0]?.message?.content||null;
 }catch(e){ console.log("Groq fail",e.message); return null;}
}

async function wikiSearch(q){
 try{
  const res=await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`);
  if(!res.ok) return null;
  const d=await res.json();
  if(d.extract) return `📚 ${d.title}:\n${d.extract.substring(0,600)}\n\nMore: ${d.content_urls?.desktop?.page||''}`;
  return null;
 }catch{ return null; }
}

function generalIntelligence(text){
 const t=text.toLowerCase();
 // Maths
 try{ if(/^[0-9+\-*/().% ]+$/.test(t.trim())){ const ans=Function(`"use strict";return (${t})`)(); return `🧮 Answer Sir: ${t} = ${ans}`; } }catch{}
 if(t.includes("who is")||t.includes("what is")||t.includes("explain")||t.includes("define")||t.includes("history")||t.includes("science")) return null; // will try wiki
 if(t.includes("job")) return `💼 *General Job Intelligence Sir!*\n\nSasikumar AI Job Hub:\n• Marketing / Sales - Vinayaga Agencies, Chennai\n• IT - Python, AI, Web Dev\n• Govt Jobs - TNPSC, SSC updates daily\n• Salary 15k-60k\n\nUngalukku enna field Sir? Naan full details + apply link tharuven! Qualification sollunga 🐼`;
 if(t.includes("gold")) return null;
 if(t.includes("code")||t.includes("python")||t.includes("program")) return `💻 *Coding Help Sir!*\n\nNaan Python, JS, AI code tharuven!\nEnna code venum nu sollunga - eg: "python calculator code" or "website code"\nNaan full code + explanation tharuven! 🐼`;
 if(t.includes("life")||t.includes("motivation")) return `🌟 *Life Intelligence Sir!*\n\nLife = Health + Wealth + Happiness\n• Daily 30min walk\n• Save 20% income - Gold best\n• Learn 1 new skill per month\n• Family time daily 1 hour\n\nEnna life doubt Sir? Specific ah sollunga - deep advice tharuven! 🤗`;
 return `🤖 *General AI Sir!* "${text}"\n\nNaan Sasikumar General AI - edhu venumnaalum ketkalam:\n• Science, History, Tech, Maths\n• Gold, Jobs, Business\n• Tamil Nadu news, Life advice\n• Code, Study help\n\nSpecific ah ketta full answer tharuven Sir! Example: "What is AI?" or "Explain photosynthesis" nu type pannunga - instant answer! 🐼`;
}

async function sendWhatsApp(to,phoneId,payload){
 if(!WHATSAPP_TOKEN) return;
 await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`,{method:'POST',headers:{'Authorization':`Bearer ${WHATSAPP_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:"whatsapp",to,...payload})});
}

app.get('/health',(req,res)=>res.json({status:"GENERAL AI OK",groq:!!GROQ_KEY,users:chatHistory.size}));
app.get('/webhook',(req,res)=>{ if(req.query['hub.mode']==='subscribe' && req.query['hub.verify_token']===VERIFY_TOKEN) res.status(200).send(req.query['hub.challenge']); else res.sendStatus(403); });

app.post('/webhook', async (req,res)=>{
 try{
  const val=req.body.entry?.[0]?.changes?.[0]?.value;
  const msg=val?.messages?.[0]; if(!msg){res.sendStatus(200);return;}
  const from=msg.from; const phoneId=val.metadata.phone_number_id;
  const userText=msg.text?.body || msg.interactive?.button_reply?.title || msg.interactive?.button_reply?.id || "hi";
  const lower=userText.toLowerCase();
  addHistory(from,"user",userText);

  if(["hi","hello","menu","start","vanakkam","hai"].includes(lower)){
   await sendWhatsApp(from,phoneId,{type:"interactive",interactive:{type:"button",body:{text:"Vanakkam Sir! 🐼\n*Sasikumar GENERAL AI* Ready!\nIntelligent + Memory ON\nSelect pannunga 👇"},action:{buttons:[{type:"reply",reply:{id:"gold",title:"💰 Gold Rate"}},{type:"reply",reply:{id:"history",title:"📜 Old Msgs"}},{type:"reply",reply:{id:"ai",title:"🧠 Ask Anything"}}]}}});
  } else if(lower.includes("gold")){
   const goldMsg=`💰 Chennai Gold Live 💰\n\n22K: ₹13,815 /g\n8g = ₹1,10,520\n10g = ₹1,38,150\n24K: ₹15,071 /g\nSilver: ₹245 /g\n\n💡 AI Tip: Gold 5% up this month - Best buy now Sir!\nMenu: *menu*`;
   await sendWhatsApp(from,phoneId,{type:"text",text:{body:goldMsg}}); addHistory(from,"assistant",goldMsg);
  } else if(lower.includes("old")||lower.includes("history")){
   const hist=chatHistory.get(from)||[]; let ht=`📜 *General AI Memory (${hist.length})* Sir:\n\n`+hist.slice(-10).map((h,i)=>`${h.role==="user"?"You":"AI"}: ${h.text.substring(0,80)}`).join('\n')+`\n\n🧠 I remember everything Sir!`;
   await sendWhatsApp(from,phoneId,{type:"text",text:{body:ht}}); addHistory(from,"assistant",ht);
  } else {
   let aiReply=await askGroq(userText,from);
   if(!aiReply){
    // Try Wiki for general knowledge
    const wiki=await wikiSearch(userText.replace(/what is|who is|explain|define/i,'').trim());
    if(wiki) aiReply=wiki;
    else aiReply=generalIntelligence(userText);
   }
   aiReply+=`\n\n_Ask anything Sir! Menu: *menu* 🐼_`;
   await sendWhatsApp(from,phoneId,{type:"text",text:{body:aiReply.substring(0,3800)}}); addHistory(from,"assistant",aiReply);
  }
  res.sendStatus(200);
 }catch(e){console.error(e); res.sendStatus(200);}
});

app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
const PORT=process.env.PORT||10000;
app.listen(PORT,()=>console.log(`GENERAL AI READY ${PORT}`));
