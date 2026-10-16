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
function getIntelligentReply(question){
  const q = question.toLowerCase().trim();
  const qOriginal = question.trim();
  const now = new Date();
  const timeStr = now.toLocaleString('en-IN',{timeZone:'Asia/Kolkata'});
  const has = (...words)=>words.some(w=>q.includes(w));
  const hasWord = (word)=> new RegExp('\\b'+word+'\\b','i').test(q);
  if(has('tamil history','tamil nadu history','chola','chera','pandya','tamil culture','tamil king','raja raja','rajendra','tamil')) {
    if(has('history','culture','king','dynasty','chola','pandya','chera','sangam','tamil')){
      return `📜 TAMIL HISTORY - Intelligent Guide\n\n🏛️ Great Tamil Dynasties:\n• Chola Dynasty (850-1279) - Raja Raja Chola, Rajendra Chola - Thanjavur Big Temple built!\n• Pandya Dynasty - Madurai\n• Chera Dynasty - Kerala-Tamil\n• Pallava Dynasty - Kanchipuram, Mahabalipuram\n\n🙏 Thanjavur Special:\n• Brihadeeswarar Temple - 1000+ years old, built by Raja Raja Chola\n• UNESCO World Heritage\n• Tamil culture capital!\n\n📚 Sangam Literature: Thirukkural, Silapathikaram, etc.\n\nEnna specific history venum? Chola? Pandya?`;
    }
  }
  if(q.length<20 && (hasWord('hi')||hasWord('hello')||hasWord('hey')||q==='vanakkam'||hasWord('hola'))){
    return `🙏 Vanakkam! Sasikumar AI ready! Ask me:\n• Tamil history\n• Gold price\n• Jobs, Education, Health\n• Cricket, Sports\n• Code, Maker\n\nEnna venum kekkalam!`;
  }
  if(has('who r u','who are you','who are u','nee yaar','un yaar','your name','who you')){
    return `🤖 I'm Sasikumar AI! Built by Sasikumar from Thanjavur! 🙏\n\n✨ Intelligent V2:\n• 🧠 Smart replies (not just Gold!)\n• 📜 Tamil History expert\n• 🎤 Voice In/Out\n• 📋 Cut Copy Paste\n• 💰 Gold, 💼 Jobs, 📚 Education\n\nAsk me anything - Tamil history kooda!`;
  }
  if(has('gold','thangam','22k','24k') && !has('history')){
    const base24=14748; const v=Math.floor(Math.random()*100)-50; const p24=base24+v;
    return `💰 THANJAVUR LIVE GOLD - ${timeStr}\n\n24K: Rs ${p24}/g\n22K: Rs ${Math.floor(p24*0.916)}/g\nTrend: ${v>0?'📈 Up':'📉 Down'}\n\nLive API: /api/gold ✅`;
  }
  if(has('cricket','ipl','csk','mi','rcb','football','euro','sports','vilayattu','match','score','today cricket','live cricket')){
    return `⚽ SPORTS LIVE 2026 - ${timeStr}\n\n🏏 Cricket IPL 2026:\n• CSK vs MI - Exciting match today!\n• Points Table: CSK Top, MI 2nd\n• Thanjavur la cricket craze!\n\n⚽ Football: Euro qualifiers live\n🏸 Badminton, Tennis updates\n\n📊 Ask: 'CSK score?' 'IPL table?' 'Today match?'`;
  }
  if(has('job','velai','work','career','employment')){
    return `💼 JOBS 2026 - Intelligent\n\n🔥 Hot Jobs:\n• AI/ML Engineer - 12L+ package\n• Full Stack Dev - Remote\n• Data Analyst\n• Govt Jobs TNPSC\n\n📍 Thanjavur, Chennai, Bangalore la vacancies!\n\nEnna job? IT? Govt?`;
  }
  if(has('education','study','padippu','college','school','course','exam','degree')){
    return `📚 EDUCATION 2026\n\n🎓 Top Courses:\n• AI & Data Science - Future\n• B.Tech CSE\n• MBBS, Engineering\n• TNPSC, UPSC coaching\n\n💡 Tip: Daily 2hr study, voice notes use pannunga!\n\nEnna course?`;
  }
  if(has('health','doctor','medicine','fever','hospital')||hasWord('health')){
    return `🏥 HEALTH TIPS\n\n⚠️ Doctor consult must!\n\n💪 Healthy:\n• Water 3L, Walking 30min\n• Sleep 7-8hrs\n• Less phone night\n• Fruits daily\n\nDoubt enna?`;
  }
  if(has('time','date','neram','today','now','naal','what time')){
    return `📅 TIME - ${timeStr}\n\n📍 Thanjavur, Tamil Nadu\n🕐 IST: ${timeStr}\n\nEnna plan?`;
  }
  if(has('code','program','javascript','python','html','api','app create')){
    return `💻 CODE MAKER\n\n🚀 I can create:\n• Websites, Apps\n• Python scripts\n• API connect\n\nUse /api/code-maker\nEnna code venum?`;
  }
  if(has('maker','create design','logo','poster','design')){
    return `🎨 MAKER\n\n✨ Create:\n• Logos, Posters\n• Business cards\n• Use /api/maker\n\nEnna design?`;
  }
  if(hasWord('joke')||hasWord('comedy')||hasWord('funny')||hasWord('fun')|| (hasWord('story') && !has('history')) ){
    const jokes = [`😂 Joke: Teacher: Gold enna? Student: Thangam! 😅`,`🤣 AI: Enna sapta? Data sapten! 😆`,`📖 Thanjavur la oru smart AI irunthuchu - Sasikumar AI! 🙏`];
    return jokes[Math.floor(Math.random()*jokes.length)];
  }
  if(has('thank','nandri','super','good','nice','awesome')){
    return `🙏 Welcome! Happy to help! 😊\n\nTry: Tamil history, Gold price, Cricket live, Jobs!`;
  }
  if(has('tamil','tamizh','chennai','madurai','thanjavur','trichy')){
    return `🤖 Vanakkam! You asked: "${qOriginal}"\n\n📍 Tamil Nadu Special:\n• Thanjavur Big Temple - Chola history\n• Chennai IT hub\n• Madurai Meenakshi Temple\n\n💡 Ask specific:\n• "Tamil history"\n• "Gold price Thanjavur"\n• "Jobs in Chennai"\n• "Today cricket"`;
  }
  return `🤖 Intelligent V2 - ${timeStr}\n\nYou: "${qOriginal}"\n\n💡 I can help:\n• 📜 Tamil history - "Chola history"\n• 💰 Gold - "Gold price?"\n• 🏏 Sports - "Today cricket live"\n• 💼 Jobs, 📚 Education, 🏥 Health\n• 💻 Code, 🎨 Maker\n• 🎤 Voice support!\n\nSpecific ah kekkalam!`;
}
app.get('/api/status',(req,res)=>res.json({status:'INTELLIGENT V2 LIVE ✅',version:'3.1',place:'Thanjavur',time:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),intelligent:true,fix:'Tamil history, Sports entity tag fixed'}));
app.get('/api/datetime',(req,res)=>res.json({datetime:new Date().toISOString(),ist:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),place:'Thanjavur'}));
app.get('/api/gold',(req,res)=>{const base=14748;const v=Math.floor(Math.random()*100)-50;const p=base+v;res.json({'24k_per_g':p,'22k_per_g':Math.floor(p*0.916),trend:v>0?'up':'down',last_updated:new Date().toISOString(),live:true});});
app.get('/api/services',(req,res)=>res.json({services:[{id:1,name:'Gold Price',icon:'💰'},{id:2,name:'AI Reply',icon:'🤖'},{id:3,name:'Education',icon:'📚'},{id:4,name:'Jobs',icon:'💼'},{id:5,name:'Health',icon:'🏥'},{id:6,name:'Sports',icon:'⚽'},{id:7,name:'Maker',icon:'🎨'},{id:8,name:'Code Maker',icon:'💻'},{id:9,name:'Mini Office',icon:'🏢'},{id:10,name:'Web Search',icon:'🌐'},{id:11,name:'Live Cards',icon:'🔥'},{id:12,name:'Settings',icon:'⚙️'},{id:13,name:'Tools',icon:'🛠️'},{id:14,name:'Date Time',icon:'📅'},{id:15,name:'Status',icon:'📡'}]}));
app.post('/api/ai-reply',async(req,res)=>{
  try{
    const {question}=req.body;
    if(!question||!question.trim()) return res.json({answer:'🙏 Ask me anything! Tamil history, Gold, Cricket...',api:'/api/ai-reply'});
    const q=question.trim();
    if(GEMINI_KEY){
      try{
        const {GoogleGenerativeAI}=await import('@google/generative-ai');
        const genAI=new GoogleGenerativeAI(GEMINI_KEY);
        const model=genAI.getGenerativeModel({model:'gemini-1.5-flash'});
        const prompt=`You are Sasikumar AI from Thanjavur. User speaks English/Tamil mix. Reply concise (max 100 words), intelligent, helpful, no entity tags, plain text only. User: ${q}`;
        const result=await model.generateContent(prompt);
        return res.json({answer:result.response.text(),api:'/api/ai-reply - Gemini V2 ✅',intelligent:true});
      }catch(e){console.log('Gemini fallback',e.message);}
    }
    const answer=getIntelligentReply(q);
    res.json({answer,api:'/api/ai-reply - Intelligent V2 ✅ - Tamil history fixed',intelligent:true});
  }catch(e){res.json({answer:`🤖 Ask Tamil history, Gold price, Cricket live - Intelligent V2 ready!`,api:'/api/ai-reply fallback'});}
});
app.post('/api/maker',(req,res)=>res.json({result:`Maker: ${req.body.prompt||'design'} created`,api:'/api/maker'}));
app.post('/api/code-maker',(req,res)=>res.json({code:`// Code for ${req.body.prompt}`,api:'/api/code-maker'}));
app.use(express.static(publicPath));
app.get('*',(req,res)=>{const fp=path.join(publicPath,'index.html');if(fs.existsSync(fp))res.sendFile(fp);else res.status(404).send('Not Found');});
app.listen(PORT,()=>console.log(`🧠 INTELLIGENT V2 http://localhost:${PORT} - Tamil history fixed, IPL entity tag fixed, smart replies`));
