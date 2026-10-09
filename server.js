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
function addHistory(u,r,t){ if(!chatHistory.has(u)) chatHistory.set(u,[]); const a=chatHistory.get(u); a.push({role:r,text:t}); if(a.length>10) a.shift(); }
function getHistory(u){ return (chatHistory.get(u)||[]).map(m=>`${m.role}:${m.text}`).join('\n'); }

async function askGroq(prompt, uid){
 if(!GROQ_KEY) return null;
 try{
  const res=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Authorization":`Bearer ${GROQ_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:"llama-3.1-8b-instant",messages:[{role:"system",content:"You are Sasikumar AI, friendly Tamil English assistant from Chennai Vinayaga Agencies. Short helpful."},{role:"user",content:prompt}],max_tokens:500})});
  const data=await res.json();
  if(data.error){console.log("GROQ ERROR",JSON.stringify(data.error)); return null;}
  return data.choices?.[0]?.message?.content||null;
 }catch(e){console.log("Groq fail",e.message); return null;}
}

function offlineAI(text){
 const t=text.toLowerCase();
 if(t.includes("job")) return `💼 Job Info Sir!\n\nSasikumar AI Jobs:\n• Vinayaga Agencies - Marketing, Sales jobs available\n• Chennai la full-time / part-time\n• Salary 15k-35k based on role\n\nUngalukku enna job venum Sir? Qualification sollunga - naan help pannuren! 🐼`;
 if(t.includes("life")) return `🌟 Life Advice Sir!\n\nLife la 3 mukkiyam:\n1. Health - Daily walk, nalla thookam\n2. Wealth - Save 20% salary, Gold invest pannunga 💰\n3. Happiness - Family time important\n\nEnna life problem Sir? Sollunga - naan kooda irukken! 🤗`;
 if(t.includes("gold")) return null; // handled separately
 if(t.includes("tamil")||t.includes("news")) return `📰 Tamil News Today Sir!\n\n• TN la new jobs scheme launch\n• Chennai gold rate up ₹105\n• Weather: Chennai today 32°C\n\nFull news ku *Tamil news* google pannunga Sir!`;
 if(t.includes("love")||t.includes("kadhal")) return `❤️ Love Advice Sir!\n\nKadhal la honesty mukkiyam!\n• Open ah pesunga\n• Respect kudunga\n• Family ku time kudunga\n\nEnna love matter Sir? Sollunga! 🐼`;
 if(t.includes("money")||t.includes("panam")) return `💰 Money Tips Sir!\n\n• Gold la invest pannunga - rate ippo ₹13,815/g\n• 20% savings must\n• Vinayaga Agencies products resell panni earn pannalam\n\nEnna money help venum Sir?`;
 return `Vanakkam Sir! "${text}" - purinchikitten! 🐼\n\nNaan Sasikumar AI - Gold rate, Jobs, Life advice ellam tharuven!\n\nEnna venum nu sollunga Sir - help pannuren!\nGold rate ku *gold rate* nu type pannunga 💰`;
}

async function sendWhatsApp(to,phoneId,payload){
 if(!WHATSAPP_TOKEN) return;
 await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`,{method:'POST',headers:{'Authorization':`Bearer ${WHATSAPP_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:"whatsapp",to,...payload})});
}

app.get('/health',(req,res)=>res.json({status:"OK",groq:!!GROQ_KEY,users:chatHistory.size}));
app.get('/webhook',(req,res)=>{ if(req.query['hub.mode']==='subscribe' && req.query['hub.verify_token']===VERIFY_TOKEN) res.status(200).send(req.query['hub.challenge']); else res.sendStatus(403); });

app.post('/webhook', async (req,res)=>{
 try{
  const val=req.body.entry?.[0]?.changes?.[0]?.value;
  const msg=val?.messages?.[0]; if(!msg){res.sendStatus(200);return;}
  const from=msg.from; const phoneId=val.metadata.phone_number_id;
  const userText=msg.text?.body || msg.interactive?.button_reply?.title || "hi";
  const lower=userText.toLowerCase();
  addHistory(from,"user",userText);

  if(["hi","hello","menu","start","vanakkam"].includes(lower)){
   await sendWhatsApp(from,phoneId,{type:"interactive",interactive:{type:"button",body:{text:"Vanakkam! Sasikumar AI 🐼\nOffline AI ON! Select pannunga Sir 👇"},action:{buttons:[{type:"reply",reply:{id:"gold",title:"💰 Gold Rate"}},{type:"reply",reply:{id:"history",title:"📜 Old Msgs"}},{type:"reply",reply:{id:"ai",title:"🤖 AI Chat"}}]}}});
  } else if(lower.includes("gold")){
   const goldMsg=`💰 Chennai Gold Rate Today 💰\n\n22K: ₹13,815 /g\n8g = ₹1,10,520\n10g = ₹1,38,150\n\n24K: ₹15,071 /g\nSilver: ₹245 /g\n\nInvest best time Sir! 📈\nMenu ku *menu*`;
   await sendWhatsApp(from,phoneId,{type:"text",text:{body:goldMsg}}); addHistory(from,"assistant",goldMsg);
  } else if(lower.includes("old")||lower.includes("history")){
   const hist=chatHistory.get(from)||[]; let ht=`📜 Old Msgs (${hist.length}) Sir:\n\n`+hist.slice(-6).map((h,i)=>`${i+1}. ${h.role}: ${h.text.substring(0,70)}`).join('\n')+`\n\nMemory ON ✅`;
   await sendWhatsApp(from,phoneId,{type:"text",text:{body:ht}}); addHistory(from,"assistant",ht);
  } else {
   let aiReply=await askGroq(userText,from);
   if(!aiReply) aiReply=offlineAI(userText);
   aiReply+=`\n\n_Menu ku *menu* type pannunga 👆_`;
   await sendWhatsApp(from,phoneId,{type:"text",text:{body:aiReply.substring(0,3800)}}); addHistory(from,"assistant",aiReply);
  }
  res.sendStatus(200);
 }catch(e){console.error(e); res.sendStatus(200);}
});

app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
const PORT=process.env.PORT||10000;
app.listen(PORT,()=>console.log(`OFFLINE AI READY ${PORT}`));
