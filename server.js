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
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

async function askGemini(prompt){
 if(!genAI) return null;
 const fullPrompt = `You are Sasikumar AI from Chennai, friendly Tamil+English assistant. User: ${prompt}`;
 const models = ["gemini-2.0-flash","gemini-1.5-flash-latest","gemini-1.5-flash"];
 for(const m of models){
  try{
   const model = genAI.getGenerativeModel({model:m});
   const result = await model.generateContent(fullPrompt);
   const text = result.response.text();
   if(text) return text;
  }catch(e){}
 }
 return null;
}

async function sendWhatsApp(to, phoneId, payload){
 if(!WHATSAPP_TOKEN) return;
 await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`,{
  method:'POST',
  headers:{'Authorization':`Bearer ${WHATSAPP_TOKEN}`,'Content-Type':'application/json'},
  body:JSON.stringify({messaging_product:"whatsapp", to, ...payload})
 });
}

app.get('/health',(req,res)=>res.json({status:"OK",whatsapp:!!WHATSAPP_TOKEN,gemini:!!process.env.GEMINI_API_KEY,gemini_length:process.env.GEMINI_API_KEY?.length||0}));

app.get('/webhook',(req,res)=>{
 if(req.query['hub.mode']==='subscribe' && req.query['hub.verify_token']===VERIFY_TOKEN) res.status(200).send(req.query['hub.challenge']);
 else res.sendStatus(403);
});

app.post('/webhook', async (req,res)=>{
 try{
  const entry=req.body.entry?.[0]; const val=entry?.changes?.[0]?.value;
  const msg=val?.messages?.[0]; if(!msg){res.sendStatus(200);return;}
  const from=msg.from; const phoneId=val.metadata.phone_number_id;
  const userText=msg.text?.body || msg.interactive?.button_reply?.title || "hi";
  const lower=userText.toLowerCase();
  if(["hi","hello","menu","start","vanakkam"].includes(lower)){
   await sendWhatsApp(from, phoneId, {type:"interactive", interactive:{type:"button", body:{text:"Vanakkam! Sasikumar AI 🐼\nSelect pannunga Sir 👇"}, action:{buttons:[{type:"reply", reply:{id:"gold", title:"💰 Gold Rate"}},{type:"reply", reply:{id:"ai", title:"🤖 AI Chat"}},{type:"reply", reply:{id:"services", title:"💼 Services"}}]}}});
  } else if(lower.includes("gold")){
   const goldMsg = `💰 Chennai Today Gold Rate (Oct 9)\n\n22K (916): ₹13,815 /g\n8g = ₹1,10,520 | 10g = ₹1,38,150\n\n24K (999): ₹15,071 /g\n8g = ₹1,20,568 | 10g = ₹1,50,710\n\nSilver: ₹245 /g\n\n*Note: Rate changes daily Sir!*\n\nMenu ku *menu* type pannunga 👆`;
   await sendWhatsApp(from, phoneId, {type:"text", text:{body:goldMsg}});
  } else {
   let aiReply=await askGemini(userText);
   if(!aiReply) aiReply=`Vanakkam Sir! "${userText}" - Ippo Gemini busy Sir! Konjam time la try pannunga! Gold rate ku *gold rate* nu type pannunga! 🐼`;
   else aiReply+=`\n\n_Menu ku *menu* type pannunga 👆_`;
   await sendWhatsApp(from, phoneId, {type:"text", text:{body:aiReply.substring(0,3800)}});
  }
  res.sendStatus(200);
 }catch(e){console.error(e); res.sendStatus(200);}
});

app.post('/api/chat', async (req,res)=>{
 res.set('Content-Type','application/json');
 try{ const m=req.body?.message||"hi"; let r=await askGemini(m); if(!r) r="Vanakkam! Sasikumar AI 🐼 Gold rate ku gold rate nu sollunga!"; res.json({reply:r,success:true}); }catch(e){ res.json({reply:"Server busy",success:true}); }
});
app.get('*',(req,res)=> res.sendFile(path.join(__dirname,'public','index.html')));
const PORT=process.env.PORT||10000;
app.listen(PORT,()=>console.log(`Running ${PORT}`));
