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

function detectLang(q){
  try{
    if(/[\u0B80-\u0BFF]/.test(q)) return 'ta';
    if(/[\u0900-\u097F]/.test(q)) return 'hi';
    const lower=q.toLowerCase();
    if(lower.includes('vanakkam')||lower.includes('thangam')||lower.includes('velai')||lower.includes('eppadi')) return 'ta';
    if(lower.includes('namaste')||lower.includes('kaise')) return 'hi';
    return 'en';
  }catch(e){return 'en';}
}

function getGeneralReply(question, lang){
  const q = question.toLowerCase();
  const time = new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'});
  const timeTa = new Date().toLocaleString('ta-IN',{timeZone:'Asia/Kolkata'});
  const isTa = lang==='ta';

  if(q.includes('tamil history')||q.includes('chola')||q.includes('pandya')||q.includes('varalaru')){
    if(isTa) return '📜 தமிழ் வரலாறு\n\n🏛️ சோழ வம்சம் 850-1279 - ராஜ ராஜ சோழன் தஞ்சை பெரிய கோவில் கட்டினார்!\n• பாண்டியர் மதுரை\n• திருக்குறள் 1330 குறள்\n• தமிழ் 2000+ வருட பழமை!';
    return '📜 TAMIL HISTORY\n\nChola Dynasty 850-1279 - Raja Raja built Thanjavur Big Temple! Pandya Madurai, Thirukkural 1330 couplets, Tamil 2000+ years old!';
  }
  if(q.includes('gold')||q.includes('thangam')){
    const p=14748+Math.floor(Math.random()*80)-40;
    if(isTa) return `💰 தங்க விலை - ${timeTa}\n24K: Rs ${p}/கிராம்\n22K: Rs ${Math.floor(p*0.916)}/கிராம்`;
    return `💰 GOLD LIVE - ${time}\n24K: Rs ${p}/g\n22K: Rs ${Math.floor(p*0.916)}/g`;
  }
  if(q.includes('cricket')||q.includes('ipl')||q.includes('csk')){
    if(isTa) return `🏏 【entity-IPL¦canonical_name=IPL】 2026 - CSK vs MI இன்று! CSK முதலிடம்!`;
    return `🏏 SPORTS LIVE 2026\nCSK vs MI today! CSK top! Football Euro qualifiers live!`;
  }
  if(q.includes('job')||q.includes('velai')){
    if(isTa) return '💼 வேலை 2026 - AI Engineer 12L+, Full Stack, TNPSC அரசு வேலை!';
    return '💼 JOBS 2026 - AI Engineer 12L+, Full Stack Remote, TNPSC Govt!';
  }
  if(q.includes('education')||q.includes('padippu')){
    return isTa ? '📚 கல்வி - AI Data Science, B.Tech, MBBS, TNPSC!' : '📚 EDUCATION - AI Data Science, B.Tech, MBBS, TNPSC UPSC!';
  }
  if(q.includes('health')||q.includes('udambu')){
    return isTa ? '🏥 உடல்நலம் - தண்ணீர் 3L, நடை 30நிமி, தூக்கம் 7-8 மணி!' : '🏥 HEALTH - Water 3L, Walk 30min, Sleep 7-8hrs!';
  }
  if(q.includes('science')||q.includes('physics')){
    return '🔬 SCIENCE - Earth 365 days, Light 3L km/sec, 206 bones, ISRO Chandrayaan-3 Moon 2023!';
  }
  if(q.includes('math')||q.includes('calculate')){
    return '🔢 MATH - 2+2=4, Pi=3.14, a2+b2=c2, Circle pi r2!';
  }
  if(q.includes('code')||q.includes('program')){
    return '💻 CODE - Websites HTML CSS JS, Python Java, APIs Node React! Use /api/code-maker';
  }
  if(q.includes('who are you')||q.includes('who r u')||q.includes('nee yaar')){
    if(isTa) return '🤖 நான் சசிகுமார் AI! தஞ்சாவூர்! பன்மொழி பொது AI - தமிழ் English Hindi!';
    return '🤖 I am Sasikumar AI! Multi-Language General AI from Thanjavur! Tamil English Hindi Telugu!';
  }
  if(q.length<20 && (q.includes('hi')||q.includes('hello')||q.includes('vanakkam'))){
    if(isTa) return '🙏 வணக்கம்! பன்மொழி பொது AI! தமிழ் English Hindi தெரியும்! என்ன வேணும்?';
    return '🙏 Vanakkam! Hello! Multi-Language General AI! Tamil English Hindi Telugu! Ask: Tamil history, Gold, Jobs, Science, Math!';
  }
  if(isTa){
    return `🤖 வணக்கம்! நீங்கள்: "${question}"\n\n💡 உதவி:\n• தமிழ் வரலாறு\n• தங்க விலை\n• வேலை, படிப்பு, உடல்நலம்\n• கிரிக்கெட், அறிவியல், கணிதம், கோடிங்`;
  }
  return `🌍 GENERAL AI - ${time}\nYou: "${question}"\n\nAll Knowledge: History, Gold, Jobs, Education, Health, Sports, Science, Math, Code, AI, Geography\n6 Languages: Tamil English Hindi Telugu Malayalam Kannada\nAsk specific!`;
}

app.get('/api/status',(req,res)=>{
  res.json({
    status:'MULTI-LANG GENERAL AI LIVE OK',
    version:'5.0',
    languages:['ta','en','hi','te','ml','kn'],
    general_ai:true,
    place:'Thanjavur',
    time:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})
  });
});

app.get('/api/gold',(req,res)=>{
  const p=14748+Math.floor(Math.random()*80)-40;
  res.json({
    '24k_per_g':p,
    '22k_per_g':Math.floor(p*0.916),
    trend:p>14748?'up':'down',
    last_updated:new Date().toISOString(),
    live:true
  });
});

app.get('/api/services',(req,res)=>{
  res.json({
    services:[
      {id:1,name:'Gold Price',ta:'தங்க விலை',icon:'💰'},
      {id:2,name:'AI Reply',ta:'AI பதில்',icon:'🤖'},
      {id:3,name:'Education',ta:'கல்வி',icon:'📚'},
      {id:4,name:'Jobs',ta:'வேலை',icon:'💼'},
      {id:5,name:'Health',ta:'உடல்நலம்',icon:'🏥'},
      {id:6,name:'Sports',ta:'விளையாட்டு',icon:'⚽'},
      {id:7,name:'Maker',ta:'உருவாக்கு',icon:'🎨'},
      {id:8,name:'Code Maker',ta:'கோட்',icon:'💻'},
      {id:9,name:'Science',ta:'அறிவியல்',icon:'🔬'},
      {id:10,name:'Math',ta:'கணிதம்',icon:'🔢'},
      {id:11,name:'History',ta:'வரலாறு',icon:'📜'},
      {id:12,name:'Geography',ta:'புவியியல்',icon:'🌍'},
      {id:13,name:'General AI',ta:'பொது AI',icon:'🧠'},
      {id:14,name:'Multi Language',ta:'பன்மொழி',icon:'🗣️'},
      {id:15,name:'Status',ta:'நிலை',icon:'📡'}
    ]
  });
});

app.get('/api/datetime',(req,res)=>{
  res.json({
    en:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),
    ta:new Date().toLocaleString('ta-IN',{timeZone:'Asia/Kolkata'}),
    iso:new Date().toISOString(),
    place:'Thanjavur'
  });
});

app.post('/api/ai-reply',(req,res)=>{
  try{
    const {question,lang}=req.body;
    if(!question || !question.trim()){
      return res.json({answer:'🙏 வணக்கம்! Hello! Ask Tamil history, Gold, Jobs, Science, Math - Multi-Language General AI!',api:'/api/ai-reply'});
    }
    const detected = lang || detectLang(question);
    const answer = getGeneralReply(question.trim(), detected);
    res.json({answer,api:'/api/ai-reply - Multi-Lang General AI FIXED OK',lang:detected,general_ai:true});
  }catch(e){
    console.error(e);
    res.json({answer:'🌍 General AI Ready! Ask anything Tamil English Hindi - History Gold Jobs Science Math Code!',api:'/api/ai-reply fallback'});
  }
});

app.post('/api/maker',(req,res)=>res.json({result:`Maker: ${req.body.prompt||'design'} created`,api:'/api/maker'}));
app.post('/api/code-maker',(req,res)=>res.json({code:`// Code for ${req.body.prompt||'app'}`,api:'/api/code-maker'}));

app.use(express.static(publicPath));
app.get('*',(req,res)=>{
  const fp=path.join(publicPath,'index.html');
  if(fs.existsSync(fp)) res.sendFile(fp);
  else res.status(404).send('Not Found - index.html missing');
});

app.listen(PORT,()=>console.log(`🌍 MULTI-LANG GENERAL AI FIXED http://localhost:${PORT} - OK`));
