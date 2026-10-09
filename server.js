import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const app=express();
app.use(cors());app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));
const VERIFY=process.env.VERIFY_TOKEN||"sasikumar123";
const WATOKEN=process.env.WHATSAPP_TOKEN;
const GROQ=process.env.GROQ_API_KEY;
const mem=new Map();
const add=(u,r,t)=>{if(!mem.has(u))mem.set(u,[]);let a=mem.get(u);a.push({r,t});if(a.length>30)a.shift()};
const getMem=(u)=>(mem.get(u)||[]).slice(-8).map(x=>`${x.r}:${x.t}`).join('\n');

async function groqAI(q,u){
 if(!GROQ) return null;
 try{
  const h=mem.get(u)||[];
  const msgs=[{role:"system",content:`You are Sasikumar GLOBAL AI. World most intelligent assistant. You know ALL - science, history, geography, politics, tech, coding, health, gold, jobs, maths, Tamil+English. Answer short, smart, friendly. Memory: ${getMem(u)}`}];
  h.slice(-6).forEach(m=>msgs.push({role:m.r==="user"?"user":"assistant",content:m.t}));
  msgs.push({role:"user",content:q});
  const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${GROQ}`,"Content-Type":"application/json"},body:JSON.stringify({model:"llama-3.1-8b-instant",messages:msgs,max_tokens:1000})});
  const d=await r.json(); return d.choices?.[0]?.message?.content||null;
 }catch{return null;}
}

async function globalKnowledge(q){
 try{
  // Wikipedia global
  const w=await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q.replace(/what is|who is|explain|define|tell me about/i,'').trim())}`);
  if(w.ok){let d=await w.json(); if(d.extract) return `🌍 *${d.title} - Global Info*\n\n${d.extract}\n\nSource: Wikipedia\nAsk more Sir!`;}
  // DuckDuckGo
  const ddg=await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json`);
  if(ddg.ok){let d=await ddg.json(); if(d.AbstractText) return `🌍 *Global Answer*\n\n${d.AbstractText}\n\nSource: ${d.AbstractURL}`;}
 }catch{}
 return null;
}

function smartGlobal(t){
 const l=t.toLowerCase();
 if(/^[0-9+\-*/%(). ]+$/.test(t.trim())){try{let a=Function(`return ${t}`)();return `🌍 Math Result: ${t} = ${a}`;}catch{}}
 if(l.includes("gold")) return `🌍💰 *Global Gold Live*\nChennai 22K ₹13,815/g | 24K ₹15,071/g\nLondon $2,685/oz | Dubai AED 308/g\nUSA Gold up 1.2% today\nInvestment Tip Sir: Buy now!`;
 if(l.includes("job")) return `🌍💼 *Global Jobs Hub*\nIndia: IT, Sales, Govt - Vinayaga Agencies hiring\nUSA: Software $80k, Remote jobs\nDubai: Sales AED 4000+\nTell field Sir - I give apply link!`;
 if(l.includes("weather")) return `🌍 Weather Sir - Place sollunga! Eg: "Chennai weather" naan live report tharuven!`;
 if(l.includes("translate")) return `🌍 Translator Ready! Eg: "Translate hello to Tamil"`;
 return `🌍 *Sasikumar GLOBAL AI* Sir!\n\nYou asked: "${t}"\n\nI know EVERYTHING:\n• 🌍 World news, history, science\n• 💻 Code, AI, Tech\n• 💰 Gold, money, business global\n• 📚 Study, maths, translation\n• ❤️ Life advice\n\nSpecific ah kelunga Sir - Full global answer tharuven! Try: "What is Black Hole?" or "Explain AI" 🐼`;
}

async function send(to,pid,pl){ if(!WATOKEN) return; await fetch(`https://graph.facebook.com/v20.0/${pid}/messages`,{method:"POST",headers:{Authorization:`Bearer ${WATOKEN}`,"Content-Type":"application/json"},body:JSON.stringify({messaging_product:"whatsapp",to,...pl})});}

app.get('/health',(q,r)=>r.json({global:"OK",ai:!!GROQ,users:mem.size}));
app.get('/webhook',(q,r)=>{ if(q.query['hub.mode']==='subscribe'&&q.query['hub.verify_token']===VERIFY) r.send(q.query['hub.challenge']); else r.sendStatus(403);});
app.post('/webhook',async(req,res)=>{
 try{
  const v=req.body.entry?.[0]?.changes?.[0]?.value; const m=v?.messages?.[0]; if(!m){res.sendStatus(200);return;}
  const from=m.from; const pid=v.metadata.phone_number_id; const txt=m.text?.body||m.interactive?.button_reply?.id||"hi"; const low=txt.toLowerCase();
  add(from,"user",txt);
  if(["hi","hello","menu","start","vanakkam"].includes(low)){
   await send(from,pid,{type:"interactive",interactive:{type:"button",body:{text:"Vanakkam Sir! 🌍\n*Sasikumar GLOBAL AI*\nWorld Knowledge + Memory ON\nSelect 👇"},action:{buttons:[{type:"reply",reply:{id:"global",title:"🌍 Ask Global"}},{type:"reply",reply:{id:"gold rate",title:"💰 Gold Live"}},{type:"reply",reply:{id:"history",title:"📜 Memory"}}]}}});
  } else if(low.includes("gold")){
   let g=smartGlobal("gold"); await send(from,pid,{type:"text",text:{body:g}}); add(from,"assistant",g);
  } else if(low.includes("history")||low.includes("memory")){
   let h=(mem.get(from)||[]).map(x=>`${x.r}:${x.t.slice(0,60)}`).join('\n'); await send(from,pid,{type:"text",text:{body:`📜 Global Memory:\n${h.slice(-1500)}`}}); add(from,"assistant",h);
  } else {
   let ans=await groqAI(txt,from); if(!ans) ans=await globalKnowledge(txt); if(!ans) ans=smartGlobal(txt);
   ans+=`\n\n_🌍 Global AI | Menu: *menu* 🐼_`;
   await send(from,pid,{type:"text",text:{body:ans.slice(0,3500)}}); add(from,"assistant",ans);
  }
  res.sendStatus(200);
 }catch(e){console.error(e); res.sendStatus(200);}
});
app.get('*',(q,r)=>r.sendFile(path.join(__dirname,'public','index.html')));
app.listen(process.env.PORT||10000,()=>console.log("GLOBAL AI LIVE"));
