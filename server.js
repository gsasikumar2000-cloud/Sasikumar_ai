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
console.log("GEMINI Key:", !!process.env.GEMINI_API_KEY);

const WORKING_MODELS = [
  "gemini-1.5-flash-001",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-pro"
];

async function askGemini(prompt) {
  for (const modelName of WORKING_MODELS) {
    try {
      console.log(`Trying ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      console.log(`Success ${modelName}`);
      return result.response.text();
    } catch (e) {
      console.log(`Fail ${modelName}: ${e.message.slice(0,120)}`);
    }
  }
  throw new Error("All models failed");
}

app.get('/health', (req,res)=>{
  res.json({
    status:"OK",
    time:new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"}),
    tavily: process.env.TAVILY_API_KEY ? "✅ ADDED" : "❌",
    gemini: process.env.GEMINI_API_KEY ? "✅ ADDED" : "❌"
  });
});

app.post('/api/chat', async (req,res)=>{
  try {
    const { message, category } = req.body;
    let prompt = message;
    if(category==='growth') prompt=`You are Sasikumar AI, TN startup expert. Tanglish 3 tips. User: ${message}`;
    if(category==='kavithai') prompt=`Tamil kavi. Write Tamil kavithai about ${message} in Tamil script.`;
    if(category==='kural') prompt=`Thirukkural for ${message} with Tanglish meaning.`;
    if(category==='ponmozhi') prompt=`Tamil motivational ponmozhi about ${message} Tamil+ Tanglish.`;
    const reply = await askGemini(prompt);
    res.json({ reply });
  } catch(e){
    res.json({ reply:`Error: ${e.message}`, error:true });
  }
});

app.get('*', (req,res)=>{
  res.sendFile(path.join(__dirname,'public','index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=> console.log(`Running ${PORT} ✅`));
