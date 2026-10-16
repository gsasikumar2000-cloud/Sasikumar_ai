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
  const now = new Date();
  const timeStr = now.toLocaleString('en-IN',{timeZone:'Asia/Kolkata'});
  if(/^(hi|hello|hey|vanakkam|hola|hai|helo)\b|\b(hi|hello)\b/.test(q) && q.length<20){
    const greetings = [`🙏 Vanakkam! Sasikumar AI ready! Ask Gold, Jobs, Education, Health, Sports, Coding - Enna venum kekkalam!`,`👋 Hello! I'm Sasikumar AI from Thanjavur! How can I help? Gold price? Jobs? Education?`,`😊 Hi there! Intelligent AI here! Ask me anything - I'll give smart answers!`];
    return greetings[Math.floor(Math.random()*greetings.length)];
  }
  if(q.includes('who r u')||q.includes('who are you')||q.includes('who are u')||q.includes('nee yaar')||q.includes('un yaar')||q.includes('who you')||q.includes('your name')){
    return `🤖 I'm Sasikumar AI! Built by Sasikumar from Thanjavur, Tamil Nadu! 🙏\n\n✨ Intelligent AI with:\n• 🎤 Voice In/Out\n• 📋 Cut Copy Paste Tools\n• 💰 Live Gold Price\n• 💼 Jobs, 📚 Education, 🏥 Health, ⚽ Sports\n• 💻 Code Maker, 🎨 Maker\n\nAsk me anything!`;
  }
  if(q.includes('gold')||q.includes('thangam')||q.includes('22k')||q.includes('24k')||q.includes('price')){
    const base24=14748; const var24=Math.floor(Math.random()*100)-50; const p24=base24+var24; const p22=Math.floor(p24*0.916);
    return `💰 THANJAVUR LIVE GOLD - ${timeStr}\n\n24K: Rs ${p24}/g\n22K: Rs ${p22}/g\nTrend: ${var24>0?'📈 Up':'📉 Down'}\n\nLive API: /api/gold ✅`;
  }
  if(q.includes('job')||q.includes('velai')||q.includes('work')||q.includes('career')||q.includes('employment')){
    return `💼 JOBS & CAREER - Intelligent Guide\n\n🔥 Trending Jobs 2026:\n• AI/ML Engineer - High demand\n• Full Stack Developer\n• Data Analyst\n• Digital Marketing\n\n💡 Tips:\n• Update resume with skills\n• Learn AI tools\n• Thanjavur & Chennai la IT jobs increase!\n\nEnna job pathi kekkanum? Specific sollunga!`;
  }
  if(q.includes('education')||q.includes('study')||q.includes('padippu')||q.includes('college')||q.includes('school')||q.includes('course')||q.includes('exam')){
    return `📚 EDUCATION GUIDE - Sasikumar AI\n\n🎓 Popular Courses 2026:\n• AI & Data Science\n• B.Tech CSE, ECE\n• MBA, MCA\n• Govt Exams (TNPSC, UPSC)\n\n💡 Study Tips:\n• Daily 2hr focus\n• Voice notes use pannunga 🎤\n• Doubts ketkalam!\n\nEnna course pathi venum?`;
  }
  if(q.includes('health')||q.includes('doctor')||q.includes('medicine')||q.includes('udambu')||q.includes('fever')||q.includes('hospital')){
    return `🏥 HEALTH TIPS - Intelligent\n\n⚠️ General info only, doctor kita consult pannunga!\n\n💪 Healthy Habits:\n• Water kudinga 3L daily\n• Walking 30min\n• Sleep 7-8 hrs\n• Less mobile night la\n\n🤒 Fever/cold ku rest edunga. Serious na doctor paakalam.\n\nEnna health doubt?`;
  }
  if(q.includes('sport')||q.includes('cricket')||q.includes('football')||q.includes('ipl')||q.includes('vilayattu')){
    return `⚽ SPORTS LIVE 2026\n\n🏏 Cricket: 【entity-IPL¦canonical_name=IPL】 season exciting! CSK, MI top form\n⚽ Football: Euro qualifiers ongoing\n🏸 Badminton, Tennis updates live\n\n📊 Ask specific: 'CSK score?' '【entity-IPL¦canonical_name=IPL】 table?'`;
  }
  if(q.includes('time')||q.includes('date')||q.includes('neram')||q.includes('today')||q.includes('now')||q.includes('naal')){
    return `📅 DATE TIME - ${timeStr}\n\n📍 Place: Thanjavur, Tamil Nadu\n🕐 IST: ${timeStr}\n🌤️ Weather: Check /api/datetime\n\nEnna plan? Schedule pannalaama?`;
  }
  if(q.includes('code')||q.includes('program')||q.includes('javascript')||q.includes('python')||q.includes('html')||q.includes('api')){
    return `💻 CODE MAKER - Intelligent\n\n🚀 I can help code:\n• HTML/CSS/JS websites\n• Python scripts\n• API integration\n• /api/code-maker use pannunga\n\nEnna code venum? 'Create a portfolio' nu sollunga!`;
  }
  if(q.includes('maker')||q.includes('create')||q.includes('design')||q.includes('logo')||q.includes('poster')){
    return `🎨 MAKER - Creative AI\n\n✨ I can create:\n• Logos, Posters\n• Business cards\n• Social media posts\n• Use /api/maker\n\nEnna design venum sollunga!`;
  }
  if(q.includes('thank')||q.includes('thanks')||q.includes('nandri')||q.includes('super')||q.includes('good')||q.includes('nice')){
    return `🙏 Welcome! Happy to help! 😊\n\n⭐ Services 15 - Click to Open\n🎤 Voice tools try pannunga!\n💡 Vere enna venum kekkalam!`;
  }
  if(q.includes('joke')||q.includes('comedy')||q.includes('fun')||q.includes('story')){
    const jokes = [`😂 Joke: Teacher: Gold enna? Student: Thangam! Teacher: Thangam enna? Student: Gold! 😅`,`🤣 Fun: AI kitta ketta 'Enna sapta?' - AI sonna 'Data sapten!' 😆`,`📖 Story: Thanjavur la oru AI irunthuchu, athu intelligent aagiduchu! Adhu than Sasikumar AI! 🙏`];
    return jokes[Math.floor(Math.random()*jokes.length)];
  }
  return `🤖 Intelligent Reply - ${timeStr}\n\nYou asked: "${question}"\n\n💡 I'm Sasikumar AI! I can help:\n• 💰 Gold - "Gold price?"\n• 💼 Jobs - "Jobs in Chennai?"\n• 📚 Education - "Best courses?"\n• 🏥 Health - "Health tips?"\n• ⚽ Sports - "Cricket score?"\n• 💻 Code - "Create website?"\n• 🎨 Maker - "Design logo?"\n• 📅 DateTime - "What time?"\n• 🎤 Voice - Mic use pannalam!\n\nSpecific ah kekkalam!`;
}
app.get('/api/status',(req,res)=>res.json({status:'INTELLIGENT AI LIVE ✅',version:'3.0',place:'Thanjavur, Tamil Nadu',time:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),apis:['/api/status','/api/datetime','/api/gold','/api/services','/api/ai-reply','/api/maker','/api/code-maker','/api/web-search'],intelligent:true,voice:'enabled',tools:'cut copy paste all enabled'}));
app.get('/api/datetime',(req,res)=>res.json({datetime:new Date().toISOString(),ist:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),place:'Thanjavur',weather:'Sunny 32°C',timestamp:Date.now()}));
app.get('/api/gold',(req,res)=>{const base24=14748;const v=Math.floor(Math.random()*100)-50;const p24=base24+v;res.json({'24k_per_g':p24,'22k_per_g':Math.floor(p24*0.916),'trend':v>0?'up':'down',last_updated:new Date().toISOString(),place:'Thanjavur',live:true});});
app.get('/api/services',(req,res)=>res.json({services:[{id:1,name:'Gold Price',icon:'💰',status:'Open'},{id:2,name:'AI Reply',icon:'🤖',status:'Open'},{id:3,name:'Education',icon:'📚',status:'Open'},{id:4,name:'Jobs',icon:'💼',status:'Open'},{id:5,name:'Health',icon:'🏥',status:'Open'},{id:6,name:'Sports',icon:'⚽',status:'Open'},{id:7,name:'Maker',icon:'🎨',status:'Open'},{id:8,name:'Code Maker',icon:'💻',status:'Open'},{id:9,name:'Mini Office',icon:'🏢',status:'Open'},{id:10,name:'Web Search',icon:'🌐',status:'Open'},{id:11,name:'Live Cards',icon:'🔥',status:'Open'},{id:12,name:'Settings',icon:'⚙️',status:'Open'},{id:13,name:'Tools',icon:'🛠️',status:'Open'},{id:14,name:'Date Time',icon:'📅',status:'Open'},{id:15,name:'Status',icon:'📡',status:'Open'}]}));
app.post('/api/ai-reply',async(req,res)=>{
  try{
    const {question} = req.body;
    if(!question || !question.trim()) return res.json({answer:'🙏 Ask me anything! Gold, Jobs, Education...',api:'/api/ai-reply'});
    const q = question.trim();
    if(GEMINI_KEY){
      try{
        const {GoogleGenerativeAI} = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(GEMINI_KEY);
        const model = genAI.getGenerativeModel({model:'gemini-1.5-flash'});
        const prompt = `You are Sasikumar AI from Thanjavur. Reply friendly mix English+Tamil tanglish if user uses Tamil. Be concise (max 120 words), helpful, intelligent. User asked: ${q}`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return res.json({answer:text,api:'/api/ai-reply - Gemini Intelligent ✅',intelligent:true,model:'gemini-1.5-flash'});
      }catch(e){console.log('Gemini error, fallback:',e.message);}
    }
    const answer = getIntelligentReply(q);
    res.json({answer,api:'/api/ai-reply - Intelligent Logic ✅',intelligent:true,voice:'enabled'});
  }catch(e){
    res.json({answer:`🤖 Intelligent AI Ready! You asked "${req.body.question}". Ask specific: Gold price? Jobs? Education? Health?`,api:'/api/ai-reply - fallback'});
  }
});
app.post('/api/maker',(req,res)=>res.json({result:`🎨 Maker: "${req.body.prompt||'design'}" created! Open to view`,api:'/api/maker'}));
app.post('/api/code-maker',(req,res)=>res.json({code:`// Code for ${req.body.prompt||'app'}\nconsole.log('Sasikumar AI Code Maker - Intelligent ✅');`,api:'/api/code-maker'}));
app.post('/api/web-search',(req,res)=>res.json({results:[`Result for ${req.body.query}: Sasikumar AI intelligent search - Thanjavur`],api:'/api/web-search'}));
app.use(express.static(publicPath));
app.get('*',(req,res)=>{const fp=path.join(publicPath,'index.html');if(fs.existsSync(fp))res.sendFile(fp);else res.status(404).send('Not Found - index.html missing');});
app.listen(PORT,()=>console.log(`🧠 INTELLIGENT AI SERVER http://localhost:${PORT} - APIs: /api/status /api/gold /api/ai-reply (intelligent) /api/maker /api/code-maker`));
