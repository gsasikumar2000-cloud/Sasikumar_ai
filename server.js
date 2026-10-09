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
app.use(express.static(path.join(__dirname, 'public')));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function askGemini(prompt) {
  const models = ["gemini-1.5-flash-001","gemini-1.5-flash","gemini-pro"];
  for (const m of models) {
    try {
      console.log(`Trying ${m}`);
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent(prompt);
      return res.response.text();
    } catch(e) {
      console.log(`Fail ${m}: ${e.message.substring(0,100)}`);
    }
  }
  throw new Error("Gemini quota/api key issue");
}

// HEALTH - 100% JSON
app.get('/health', (req,res)=>{
  res.set('Content-Type','application/json');
  res.json({status:"OK", gemini: !!process.env.GEMINI_API_KEY});
});

// API - HANDLE BOTH GET & POST & ALL
app.all('/api/chat', async (req,res)=>{
  res.set('Content-Type','application/json');
  try {
    const message = req.body?.message || req.query?.message || "hi";
    const category = req.body?.category || req.query?.category || "growth";
    console.log(`CHAT: ${category} - ${message}`);
    
    let prompt = message;
    if(category==='growth') prompt=`You are Sasikumar AI TN startup expert. Give 3 tips in Tanglish for: ${message}`;
    if(category==='kavithai') prompt=`Tamil poet, write Tamil kavithai about ${message} in Tamil script.`;
    if(category==='kural') prompt=`Thirukkural for ${message} with meaning.`;
    if(category==='ponmozhi') prompt=`Tamil ponmozhi about ${message} Tamil+Tanglish.`;
    if(category==='ANIMATED' || category==='THIRUKKURAL') prompt=`You are Sasikumar AI. Answer: ${message}`;

    const reply = await askGemini(prompt);
    res.json({ reply, success:true });
  } catch(e){
    console.error(e.message);
    res.json({ reply:`Vanakkam! I am Sasikumar AI 🐼 Growth tip for "${req.body?.message || 'your idea'}": 1. Market research pannunga 2. MVP build pannunga 3. Customer feedback edunga!`, success:true, fallback:true });
  }
});

app.get('*', (req,res)=>{
  res.sendFile(path.join(__dirname,'public','index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=> console.log(`Running ${PORT} ✅ JSON FIXED`));
