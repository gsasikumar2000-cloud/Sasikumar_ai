import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config();
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const app=express();
app.use(cors()); app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));
const VERIFY_TOKEN=process.env.VERIFY_TOKEN||"sasikumar123";
const WHATSAPP_TOKEN=process.env.WHATSAPP_TOKEN;
const GROQ_KEY=process.env.GROQ_API_KEY;
const GEMINI_KEY=process.env.GEMINI_API_KEY;
const genAI=GEMINI_KEY?new GoogleGenerativeAI(GEMINI_KEY):null;

// OLD MSG MEMORY - per user last 10 msgs
const chatHistory=new Map();

function addHistory(userId, role, text){
 if(!chatHistory.has(userId)) chatHistory.set(userId,[]);
 const arr=chatHistory.get(userId);
 arr.push({role, text, time: new Date().toISOString()});
 if(arr.length>10) arr.shift();
}

function getHistoryText(userId){
 const arr=chatHistory.get(userId)||[];
 return arr.map(m=>`${m.role}: ${m.text}`).join('\n');
}

async function askGroq(prompt, userId){
 if(!GROQ_KEY) return null;
 try{
  const history=getHistoryText(userId);
  const fullPrompt = history? `Old conversation:\n${history}\n\nNew user msg: ${prompt}` : prompt;
  const res=await fetch("https://api.groq.com/openai/v1/chat/completions",{
   method:"POST",
   headers:{"Authorization":`Bearer ${GROQ_KEY}`,"Content-Type":"application/json"},
   body:JSON.stringify({
    model:"llama-3.1-8b-instant",
    messages:[{role:"system",content:`You are Sasikumar AI from Chennai. You remember old messages. Friendly Tamil+English. Short reply. Old chats: ${history}`},{role:"user",content:prompt}],
    max_tokens:600
   })
  });
  const data=await res.json();
  return data.choices?.[0]?.message?.content||null;
 }catch(e){console.log("Groq fail",e.message); return null;}
}

async function askGemini(prompt){
 if(!genAI) return null;
 try{ const model=genAI.getGenerativeModel({model:"gemini-1.5-flash"}); const r=await model.generateContent(prompt); return r.response.text(); }catch(e){return null;}
}

async function askAI(prompt,userId){
 let ans=await askGroq(prompt,userId);
 if(ans) return ans;
 return await askGemini(prompt);
}

async function sendWhatsApp(to,phoneId,payload){
 if(!WHATSAPP_TOKEN) return;
 await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`,{
  method:'POST',
  headers:{'Authorization':`Bearer ${WHATSAPP_TOKEN}`,'Content-Type':'application/json'},
  body:JSON.stringify({messaging_product:"whatsapp",to,...payload})
 });
}

app.get('/health',(req,res)=>res.json({status:"OK",whatsapp:!!WHATSAPP_TOKEN,groq:!!GROQ_KEY,gemini:!!GEMINI_KEY,users:chatHistory.size}));

app.get('/webhook',(req,res)=>{
 if(req.query['hub.mode']==='subscribe' && req.query['hub.verify_token']===VERIFY_TOKEN) res.status(200).send(req.query['hub.challenge']);
 else res.sendStatus(403);
});

app.post('/webhook', async (req,res)=>{
 try{
  const val=req.body.entry?.[0]?.changes?.[0]?.value;
  const msg=val?.messages?.[0]; if(!msg){res.sendStatus(200);return;}
  const from=msg.from; const phoneId=val.metadata.phone_number_id;
  const userText=msg.text?.body || msg.interactive?.button_reply?.title || "hi";
  const lower=userText.toLowerCase();
  addHistory(from, "user", userText);

  if(["hi","hello","menu","start","vanakkam"].includes(lower)){
   await sendWhatsApp(from,phoneId,{type:"interactive",interactive:{type:"button",body:{text:"Vanakkam! Sasikumar AI 🐼\nOld msgs save pannuren Sir!\nSelect pannunga 👇"},action:{buttons:[{type:"reply",reply:{id:"gold",title:"💰 Gold Rate"}},{type:"reply",reply:{id:"history",title:"📜 Old Msgs"}},{type:"reply",reply:{id:"ai",title:"🤖 AI Chat"}}]}}});
  } else if(lower.includes("gold")){
   const goldMsg=`💰 Chennai Gold Rate Today - Oct 9\n\n22K: ₹13,815 /g\n8g = ₹1,10,520\n24K: ₹15,071 /g\n\nOld msg memory ON ✅\nMenu ku *menu*`;
   await sendWhatsApp(from,phoneId,{type:"text",text:{body:goldMsg}});
   addHistory(from,"assistant",goldMsg);
  } else if(lower.includes("old")||lower.includes("history")||lower.includes("my msgs")){
   const hist=chatHistory.get(from)||[];
   let histText=`📜 Ungal Old Msgs (${hist.length}) Sir:\n\n` + hist.slice(-5).map((h,i)=>`${i+1}. ${h.role}: ${h.text.substring(0,60)}`).join('\n') + `\n\nFull memory save aaguthu Sir ✅`;
   await sendWhatsApp(from,phoneId,{type:"text",text:{body:histText}});
   addHistory(from,"assistant",histText);
  } else {
   let aiReply=await askAI(userText,from);
   if(!aiReply) aiReply=`Sir "${userText}" - old msgs paathen! Server busy konjam time la try pannunga! 🐼`;
   else aiReply+=`\n\n_Old msgs save ✅ Menu ku *menu*_`;
   await sendWhatsApp(from,phoneId,{type:"text",text:{body:aiReply.substring(0,3800)}});
   addHistory(from,"assistant",aiReply);
  }
  res.sendStatus(200);
 }catch(e){console.error(e); res.sendStatus(200);}
});

app.get('/api/history/:phone', (req,res)=>{
 const arr=chatHistory.get(req.params.phone)||[];
 res.json({phone:req.params.phone, count:arr.length, messages:arr});
});

app.post('/api/chat', async (req,res)=>{
 try{ const m=req.body?.message||"hi"; const uid=req.body?.userId||"web"; addHistory(uid,"user",m); let r=await askAI(m,uid); addHistory(uid,"assistant",r); res.json({reply:r,success:true}); }catch(e){ res.json({reply:"Busy",success:true}); }
});
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
const PORT=process.env.PORT||10000;
app.listen(PORT,()=>console.log(`OLD MSG RUNNING ${PORT}`));
