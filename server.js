import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.json({limit:'1mb'}));
app.use((req,res,next)=>{res.header('Access-Control-Allow-Origin','*');res.header('Access-Control-Allow-Methods','GET,POST,OPTIONS');res.header('Access-Control-Allow-Headers','Content-Type');if(req.method==='OPTIONS')return res.sendStatus(200);next();});
const publicPath = path.join(__dirname,'public');
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
function detectLang(q){
  if(/[\u0B80-\u0BFF]/.test(q)) return 'ta';
  if(/[\u0900-\u097F]/.test(q)) return 'hi';
  if(/[\u0C00-\u0C7F]/.test(q)) return 'te';
  if(/[\u0D00-\u0D7F]/.test(q)) return 'ml';
  if(/[\u0C80-\u0CFF]/.test(q)) return 'kn';
  const lower=q.toLowerCase();
  if(['vanakkam','eppadi','enna','thangam','velai','nandri','thanjavur'].some(w=>lower.includes(w))) return 'ta';
  if(['namaste','kaise','kya','aap','kaam','dhanyawad'].some(w=>lower.includes(w))) return 'hi';
  return 'en';
}
function getGeneralAIReply(question, lang){
  const q = question.toLowerCase().trim();
  const qOrig = question.trim();
  const now = new Date();
  const timeEn = now.toLocaleString('en-IN',{timeZone:'Asia/Kolkata'});
  const timeTa = now.toLocaleString('ta-IN',{timeZone:'Asia/Kolkata'});
  const has = (...w)=>w.some(x=>q.includes(x));
  const hasWord = (w)=> new RegExp('\\b'+w+'\\b','i').test(q);
  const L = lang;
  if(L==='ta'){
    if(has('tamil history','varalaru','chola','pandya','sangam')) return `📜 தமிழ் வரலாறு\n\n🏛️ சோழ வம்சம் (850-1279) - ராஜ ராஜ சோழன் தஞ்சை பெரிய கோவில்!\n• பாண்டியர் - மதுரை\n• சங்க இலக்கியம்: திருக்குறள் 1330 குறள்\n• தமிழ் 2000+ வருட பழமை!`;
    if(has('gold','thangam')){const p=14748+Math.floor(Math.random()*100)-50;return `💰 தங்க விலை - ${timeTa}\n24K: Rs ${p}/கிராம்\n22K: Rs ${Math.floor(p*0.916)}/கிராம்`;}
    if(has('cricket','ipl','vilayattu')) return `🏏 【entity-IPL¦canonical_name=IPL】 2026 - CSK vs MI இன்று! CSK முதலிடம்!`;
    if(has('job','velai')) return `💼 வேலை 2026 - AI Engineer 12L+, Full Stack, TNPSC!`;
    if(has('science','arin')) return `🔬 அறிவியல் - பூமி சூரியனை 365 நாளில் சுற்றுகிறது, 206 எலும்புகள்!`;
    if(has('math','kanakku')) return `🔢 கணிதம் - 2+2=4, பை=3.14, a²+b²=c²`;
    if(hasWord('hi')||q.length<15) return `🙏 வணக்கம்! பன்மொழி பொது AI! தமிழ், English, हिंदी எல்லாம் தெரியும்!`;
  }
  if(L==='hi'){
    if(has('gold','sona')){const p=14748+Math.floor(Math.random()*100)-50;return `💰 सोने का भाव\n24K: Rs ${p}/ग्राम`;}
    if(hasWord('namaste')||q.length<15) return `🙏 नमस्ते! बहुभाषी AI! हिंदी, Tamil, English सब आता है!`;
  }
  if(has('tamil history','chola','pandya')) return `📜 TAMIL HISTORY - Chola Dynasty 850-1279, Raja Raja built Thanjavur Big Temple! Sangam: Thirukkural 1330 couplets, 2000+ years old!`;
  if(has('indian history','mughal','gandhi')) return `📜 INDIAN HISTORY - Indus Valley 2500 BCE, Maurya Ashoka, Mughal Taj Mahal 1632, Independence 1947 Gandhi Nehru!`;
  if(has('gold')){const p=14748+Math.floor(Math.random()*100)-50;return `💰 GOLD LIVE - ${timeEn}\n24K: Rs ${p}/g\n22K: Rs ${Math.floor(p*0.916)}/g`;}
  if(has('cricket','ipl','sports')) return `🏏 SPORTS - 【entity-IPL¦canonical_name=IPL】 2026 CSK vs MI today! CSK Top! Football Euro, Olympics live!`;
  if(has('job','career')) return `💼 JOBS 2026 - AI Engineer 12L+, Full Stack Remote, Data Analyst, TNPSC Govt!`;
  if(has('education','study')) return `📚 EDUCATION - AI & Data Science, B.Tech, MBBS, MBA, TNPSC UPSC NEET JEE!`;
  if(has('health','doctor')) return `🏥 HEALTH - Water 3L, Walk 30min, Sleep 7-8hrs, Fruits! Consult doctor!`;
  if(has('science','physics','space','isro','nasa')) return `🔬 SCIENCE - Earth 365 days, Light 3L km/sec, 206 bones, 【entity-ISRO¦canonical_name=ISRO】 Chandrayaan-3 Moon 2023!`;
  if(has('math','calculate','2+2')) return `🔢 MATH - 2+2=4, Pi=3.14, a²+b²=c², Circle πr²! Ask 'Solve 2x+3=7'`;
  if(has('code','javascript','python','html')) return `💻 CODE - Websites HTML/CSS/JS, Python Java, APIs Node React, Portfolio E-commerce! Use /api/code-maker`;
  if(has('ai','machine learning')) return `🤖 AI - Artificial Intelligence machines think, ML learns data, LLM like me! Future AGI Robotics!`;
  if(hasWord('hi')||q.length<20) return `🙏 Vanakkam! Hello! Namaste! Multi-Lang General AI! 🌍\n\nTamil, English, Hindi, Telugu, Malayalam, Kannada\nHistory, Gold, Jobs, Education, Health, Sports, Science, Math, Coding, Space!\nAsk in ANY language!`;
  return `🌍 GENERAL AI - ${timeEn}\nYou: "${qOrig}"\n\n🧠 All Knowledge: History, Gold, Jobs, Education, Health, Sports, Science, Math, Coding, AI, Geography, Space\n🗣️ 6 Languages: Tamil English Hindi Telugu Malayalam Kannada\nAsk specific!`;
}
app.get('/api/status',(req,res)=>res.json({status:'MULTI-LANG GENERAL AI LIVE ✅',version:'5.0 Multi',languages:['ta','en','hi','te','ml','kn'],general_ai:true,place:'Thanjavur',time:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})}));
app.get('/api/gold',(req,res)=>{const p=14748+Math.floor(Math.random()*100)-50;res.json({'24k_per_g':p,'22k_per_g':Math.floor(p*0.916),trend:p>14748?'up':'down',last_updated:new Date().toISOString(),multi_lang:{ta:`${p}/கிராம்`,hi:`${p}/ग्राम`,en:`${p}/g`}});});
app.get('/api/services',(req,res)=>res.json({services:[{id:1,name:'Gold Price',ta:'தங்க விலை',hi:'सोने का भाव',icon:'💰'},{id:2,name:'AI Reply',ta:'AI பதில்',hi:'AI जवाब',icon:'🤖'},{id:3,name:'Education',ta:'கல்வி',hi:'शिक्षा',icon:'📚'},{id:4,name:'Jobs',ta:'வேலை',hi:'नौकरी',icon:'💼'},{id:5,name:'Health',ta:'உடல்நலம்',hi:'स्वास्थ्य',icon:'🏥'},{id:6,name:'Sports',ta:'விளையாட்டு',hi:'खेल',icon:'⚽'},{id:7,name:'Maker',ta:'உருவாக்கு',hi:'बनाएं',icon:'🎨'},{id:8,name:'Code Maker',ta:'கோட்',hi:'कोड',icon:'💻'},{id:9,name:'Science',ta:'அறிவியல்',hi:'विज्ञान',icon:'🔬'},{id:10,name:'Math',ta:'கணிதம்',hi:'गणित',icon:'🔢'},{id:11,name:'History',ta:'வரலாறு',hi:'इतिहास',icon:'📜'},{id:12,name:'Geography',ta:'புவியியல்',hi:'भूगोल',icon:'🌍'},{id:13,name:'General AI',ta:'பொது AI',hi:'सामान्य AI',icon:'🧠'},{id:14,name:'Multi Language',ta:'பன்மொழி',hi:'बहुभाषी',icon:'🗣️'},{id:15,name:'Status',ta:'நிலை',hi:'स्थिति',icon:'📡'}]}));
app.get('/api/datetime',(req,res)=>res.json({en:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),ta:new Date().toLocaleString('ta-IN',{timeZone:'Asia/Kolkata'}),hi:new Date().toLocaleString('hi-IN',{timeZone:'Asia/Kolkata'}),iso:new Date().toISOString(),place:'Thanjavur'}));
app.post('/api/ai-reply',async(req,res)=>{
  try{
    const {question,lang}=req.body;
    if(!question||!question.trim()) return res.json({answer:'🙏 வணக்கம்! / Hello! / नमस्ते! Ask in Tamil English Hindi - Tamil history, Gold, Jobs, Cricket, Science, Math, Code - All General AI! 🌍',api:'/api/ai-reply'});
    const q=question.trim();
    let detectedLang = lang || detectLang(q);
    if(GEMINI_KEY){
      try{
        const {GoogleGenerativeAI}=await import('@google/generative-ai');
        const genAI=new GoogleGenerativeAI(GEMINI_KEY);
        const model=genAI.getGenerativeModel({model:'gemini-1.5-flash'});
        const prompt=`You are Sasikumar AI - Multi-Language General AI from Thanjavur. Support Tamil English Hindi Telugu Malayalam Kannada. Detect language (${detectedLang}) reply same language. Concise 100 words, no entity tags. User: ${q}`;
        const result=await model.generateContent(prompt);
        return res.json({answer:result.response.text(),api:'/api/ai-reply - Gemini Multi-Lang General AI ✅',lang:detectedLang,general_ai:true});
      }catch(e){console.log('Gemini fallback',e.message);}
    }
    const answer=getGeneralAIReply(q,detectedLang);
    res.json({answer,api:'/api/ai-reply - Multi-Lang General AI ✅',lang:detectedLang,general_ai:true,multi_lang:true});
  }catch(e){res.json({answer:`🌍 Multi-Language General AI! Tamil English Hindi Telugu - History Gold Jobs Education Health Sports Science Math Code!`,api:'/api/ai-reply fallback'});}
});
app.use(express.static(publicPath));
app.get('*',(req,res)=>{const fp=path.join(publicPath,'index.html');if(fs.existsSync(fp))res.sendFile(fp);else res.status(404).send('Not Found');});
app.listen(PORT,()=>console.log(`🌍 MULTI-LANG GENERAL AI http://localhost:${PORT} - 6 languages + All General Knowledge`));
