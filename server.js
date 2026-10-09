import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "sasikumar123";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function askGemini(p){
 const models=["gemini-1.5-flash","gemini-pro"];
 for(const m of models){
  try{ const model=genAI.getGenerativeModel({model:m}); const r=await model.generateContent(p); return r.response.text(); }catch(e){}
 }
 return `Vanakkam! Sasikumar AI 🐼`;
}

async function sendWhatsApp(to, phoneId, payload){
 if(!WHATSAPP_TOKEN) return;
 await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`,{
  method:'POST',
  headers:{'Authorization':`Bearer ${WHATSAPP_TOKEN}`,'Content-Type':'application/json'},
  body:JSON.stringify({messaging_product:"whatsapp", to,...payload})
 });
}

function menuPayload(){
 return {
  type:"interactive",
  interactive:{
   type:"button",
   body:{text:"Vanakkam! Sasikumar AI 🐼\nKeela menu la irunthu select pannunga Sir 👇"},
   action:{buttons:[
    {type:"reply", reply:{id:"ai_chat", title:"🤖 AI Chat"}},
    {type:"reply", reply:{id:"my_services", title:"💼 Services"}},
    {type:"reply", reply:{id:"contact", title:"📞 Contact"}}
   ]}
  }
 };
}

app.get('/health',(req,res)=>res.json({status:"OK",whatsapp:!!WHATSAPP_TOKEN}));
app.get('/webhook',(req,res)=>{
 if(req.query['hub.mode']==='subscribe' && req.query['hub.verify_token']===VERIFY_TOKEN) res.status(200).send(req.query['hub.challenge']);
 else res.sendStatus(403);
});

app.post('/webhook', async (req,res)=>{
 try{
  const entry=req.body.entry?.[0]; const changes=entry?.changes?.[0]; const val=changes?.value;
  const msg=val?.messages?.[0]; if(!msg){ res.sendStatus(200); return; }
  const from=msg.from; const phoneId=val.metadata.phone_number_id;
  const text=msg.text?.body?.toLowerCase() || ""; const btnId=msg.interactive?.button_reply?.id || "";

  if(["hi","hello","menu","start","vanakkam"].includes(text) || btnId==="menu"){
   await sendWhatsApp(from, phoneId, menuPayload());
  } else if(btnId==="ai_chat" || text.includes("ai")){
   await sendWhatsApp(from, phoneId, {type:"text", text:{body:"Sollaunga Sir! Enna kelvi? Naan ready! 🤖"}});
  } else if(btnId==="my_services"){
   await sendWhatsApp(from, phoneId, {type:"text", text:{body:"💼 My Services:\n1. AI Chatbot Development\n2. Website Development\n3. WhatsApp Automation\n\nEnna venum Sir? Type pannunga!"}});
  } else if(btnId==="contact"){
   await sendWhatsApp(from, phoneId, {type:"text", text:{body:"📞 Contact:\nName: Sasikumar\nWebsite: sasikumar-ai-9wdq.onrender.com\nWhatsApp: Itha same number Sir!"}});
  } else {
   const aiReply=await askGemini(msg.text?.body||"hi");
   await sendWhatsApp(from, phoneId, {type:"text", text:{body: aiReply.substring(0,3500)+"\n\nType *menu* for options 👆"}});
  }
  res.sendStatus(200);
 }catch(e){console.error(e); res.sendStatus(200);}
});

app.post('/api/chat', async (req,res)=>{
 res.set('Content-Type','application/json');
 try{ const m=req.body?.message||"hi"; const reply=await askGemini(m); res.json({reply,success:true}); }catch(e){ res.json({reply:"Server busy",success:true}); }
});
app.get('*',(req,res)=> res.sendFile(path.join(__dirname,'public','index.html')));
const PORT=process.env.PORT||10000;
app.listen(PORT,()=>console.log(`Running ${PORT} MENU READY`));
