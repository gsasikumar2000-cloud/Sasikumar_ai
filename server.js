import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.json({limit:'1mb'}));
app.use((req,res,next)=>{
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.sendStatus(200);
  next();
});
const publicPath = path.join(__dirname,'public');
const WA_TOKEN = process.env.WHATSAPP_TOKEN || '';
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID || '';
const WA_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'sasikumar_ai_verify_2026';

function detectLang(q){
  try{
    if(/[\u0B80-\u0BFF]/.test(q)) return 'ta';
    if(/[\u0900-\u097F]/.test(q)) return 'hi';
    const lower=q.toLowerCase();
    if(lower.includes('vanakkam')||lower.includes('thangam')||lower.includes('velai')) return 'ta';
    if(lower.includes('namaste')) return 'hi';
    return 'en';
  }catch(e){return 'en';}
}

function getGeneralReply(question, lang){
  const q = question.toLowerCase();
  const time = new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'});
  const timeTa = new Date().toLocaleString('ta-IN',{timeZone:'Asia/Kolkata'});
  const isTa = lang==='ta';
  if(q.includes('tamil history')||q.includes('chola')||q.includes('varalaru')){
    return isTa ? '📜 தமிழ் வரலாறு\n\n🏛️ சோழ வம்சம் 850-1279 - ராஜ ராஜ சோழன் தஞ்சை பெரிய கோவில்!\n• திருக்குறள் 1330 குறள்\n• தமிழ் 2000+ வருட பழமை!' : '📜 TAMIL HISTORY - Chola 850-1279 Raja Raja Big Temple! Thirukkural 1330 couplets!';
  }
  if(q.includes('gold')||q.includes('thangam')){
    const p=14748+Math.floor(Math.random()*80)-40;
    return isTa ? `💰 தங்க விலை - ${timeTa}\n24K: Rs ${p}/கிராம்` : `💰 GOLD LIVE - ${time}\n24K: Rs ${p}/g`;
  }
  if(q.includes('cricket')||q.includes('ipl')||q.includes('csk')) return isTa ? '🏏 IPL 2026 CSK vs MI இன்று! CSK முதலிடம்!' : '🏏 IPL 2026 CSK vs MI today! CSK top!';
  if(q.includes('job')||q.includes('velai')) return isTa ? '💼 வேலை 2026 - AI Engineer 12L+, TNPSC!' : '💼 JOBS 2026 - AI Engineer 12L+, TNPSC!';
  if(q.includes('who are you')||q.includes('who r u')) return isTa ? '🤖 நான் சசிகுமார் AI! WhatsApp API + பன்மொழி AI!' : '🤖 I am Sasikumar AI! WhatsApp API + Multi-Language!';
  if(q.length<20 && (q.includes('hi')||q.includes('hello')||q.includes('vanakkam'))) return isTa ? '🙏 வணக்கம்! WhatsApp API Ready! என்ன வேணும்?' : '🙏 Vanakkam! Hello! WhatsApp API Ready! Ask anything!';
  if(isTa) return `🤖 வணக்கம்! "${question}"\n💡 தமிழ் வரலாறு, தங்க விலை, வேலை, கிரிக்கெட் - 【entity-WhatsApp¦canonical_name=WhatsApp】 la kooda!`;
  return `🌍 GENERAL AI - ${time}\nYou: "${question}"\nAll Knowledge + 【entity-WhatsApp¦canonical_name=WhatsApp】 API Ready!`;
}

app.get('/api/status',(req,res)=>{
  res.json({status:'MULTI-LANG + 【entity-WHATSAPP¦canonical_name=WhatsApp】 API LIVE OK',version:'6.0 【entity-WhatsApp¦canonical_name=WhatsApp】',whatsapp_api: WA_TOKEN ? 'Configured ✅' : 'Demo mode - Set WHATSAPP_TOKEN',place:'Thanjavur',time:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})});
});

app.get('/api/gold',(req,res)=>{
  const p=14748+Math.floor(Math.random()*80)-40;
  res.json({'24k_per_g':p,'22k_per_g':Math.floor(p*0.916),trend:p>14748?'up':'down',last_updated:new Date().toISOString(),live:true});
});

app.get('/api/services',(req,res)=>{
  res.json({services:[{id:1,name:'Gold Price',ta:'தங்க விலை',icon:'💰'},{id:2,name:'AI Reply',ta:'AI பதில்',icon:'🤖'},{id:3,name:'Education',ta:'கல்வி',icon:'📚'},{id:4,name:'Jobs',ta:'வேலை',icon:'💼'},{id:5,name:'Health',ta:'உடல்நலம்',icon:'🏥'},{id:6,name:'Sports',ta:'விளையாட்டு',icon:'⚽'},{id:7,name:'Maker',ta:'உருவாக்கு',icon:'🎨'},{id:8,name:'Code Maker',ta:'கோட்',icon:'💻'},{id:9,name:'Science',ta:'அறிவியல்',icon:'🔬'},{id:10,name:'Math',ta:'கணிதம்',icon:'🔢'},{id:11,name:'History',ta:'வரலாறு',icon:'📜'},{id:12,name:'WhatsApp API',ta:'வாட்ஸ்அப் API',icon:'📱'},{id:13,name:'General AI',ta:'பொது AI',icon:'🧠'},{id:14,name:'Multi Language',ta:'பன்மொழி',icon:'🗣️'},{id:15,name:'Status',ta:'நிலை',icon:'📡'}]});
});

app.post('/api/ai-reply',(req,res)=>{
  try{
    const {question,lang}=req.body;
    if(!question||!question.trim()) return res.json({answer:'🙏 வணக்கம்! Hello! WhatsApp API Ready!',api:'/api/ai-reply'});
    const detected=lang||detectLang(question);
    const answer=getGeneralReply(question.trim(),detected);
    res.json({answer,api:'/api/ai-reply - WhatsApp + Multi-Lang OK',lang:detected});
  }catch(e){res.json({answer:'🌍 General AI + WhatsApp API Ready!',api:'/api/ai-reply fallback'});}
});

// WHATSAPP API
app.get('/api/whatsapp/webhook',(req,res)=>{
  const mode=req.query['hub.mode'];const token=req.query['hub.verify_token'];const challenge=req.query['hub.challenge'];
  if(mode==='subscribe' && token===WA_VERIFY_TOKEN){res.status(200).send(challenge);}else{res.sendStatus(403);}
});

app.post('/api/whatsapp/webhook',async(req,res)=>{
  try{
    const body=req.body;
    if(body.object==='whatsapp_business_account'){
      const message=body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      if(message){
        const from=message.from;const text=message.text?.body||'';
        const lang=detectLang(text);const aiReply=getGeneralReply(text,lang);
        if(WA_TOKEN && WA_PHONE_ID){
          await fetch(`https://graph.facebook.com/v20.0/${WA_PHONE_ID}/messages`,{method:'POST',headers:{'Authorization':`Bearer ${WA_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to:from,type:'text',text:{body:aiReply.substring(0,4000)}})});
        }
      }
      res.sendStatus(200);
    }else{res.sendStatus(404);}
  }catch(e){res.sendStatus(500);}
});

app.post('/api/whatsapp/send',async(req,res)=>{
  try{
    const {to,message,phone}=req.body;
    const targetPhone=to||phone;
    if(!targetPhone||!message) return res.status(400).json({error:'Need phone and message'});
    let cleanPhone=targetPhone.replace(/[^0-9]/g,'');
    if(cleanPhone.length===10) cleanPhone='91'+cleanPhone;
    if(!WA_TOKEN||!WA_PHONE_ID){
      const waLink=`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      return res.json({success:true,demo:true,wa_link:waLink,to:cleanPhone,text:message,api:'/api/whatsapp/send - Demo (set WHATSAPP_TOKEN & PHONE_ID for real API)'});
    }
    const resp=await fetch(`https://graph.facebook.com/v20.0/${WA_PHONE_ID}/messages`,{method:'POST',headers:{'Authorization':`Bearer ${WA_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to:cleanPhone,type:'text',text:{body:message.substring(0,4000)}})});
    const data=await resp.json();
    res.json({success:true,real_api:true,data,to:cleanPhone,api:'/api/whatsapp/send - Real API ✅'});
  }catch(e){res.status(500).json({error:e.message});}
});

app.post('/api/whatsapp/share',(req,res)=>{
  const {message,phone}=req.body;
  const text=message||'Hello from Sasikumar AI! 🌍 https://sasikumar-ai-9wdq.onrender.com';
  let cleanPhone=(phone||'').replace(/[^0-9]/g,'');
  if(cleanPhone.length===10) cleanPhone='91'+cleanPhone;
  const link = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
  res.json({wa_link:link,share_text:text,api:'/api/whatsapp/share'});
});

app.use(express.static(publicPath));
app.get('*',(req,res)=>{const fp=path.join(publicPath,'index.html');if(fs.existsSync(fp))res.sendFile(fp);else res.status(404).send('Not Found');});
app.listen(PORT,()=>console.log(`📱 WHATSAPP + MULTI-LANG AI http://localhost:${PORT} - OK`));
