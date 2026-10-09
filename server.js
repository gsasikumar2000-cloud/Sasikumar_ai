const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("GEMINI Key loaded:", !!process.env.GEMINI_API_KEY);

// WORKING MODELS LIST - tried and tested
const WORKING_MODELS = [
  "gemini-1.5-flash-001",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-pro"
];

async function askGemini(prompt, type="growth") {
  for (const modelName of WORKING_MODELS) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log(`Success with ${modelName}`);
      return text;
    } catch (e) {
      console.log(`Failed ${modelName}: ${e.message.slice(0,100)}`);
      continue;
    }
  }
  throw new Error("All Gemini models failed - check API key quota");
}

app.get('/health', (req,res)=>{
  res.json({
    status:"OK",
    time:new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"}),
    tavily: process.env.TAVILY_API_KEY ? "✅ ADDED" : "❌ MISSING",
    gemini: process.env.GEMINI_API_KEY ? "✅ ADDED" : "❌ MISSING"
  });
});

app.post('/api/chat', async (req,res)=>{
  try {
    const { message, category } = req.body;
    let prompt = message;
    
    if(category === 'growth') prompt = `You are Sasikumar AI, Tamil Nadu startup growth expert. Answer in Tanglish, give 3 actionable tips. User: ${message}`;
    if(category === 'kavithai') prompt = `You are Tamil poet. Write beautiful Tamil kavithai about: ${message}. In Tamil script.`;
    if(category === 'kural') prompt = `Give Thirukkural related to: ${message} with meaning in Tanglish.`;
    if(category === 'ponmozhi') prompt = `Give Tamil ponmozhi/motivational quote about: ${message} in Tamil + Tanglish.`;
    
    const reply = await askGemini(prompt, category);
    res.json({ reply, model: "working" });
  } catch(e){
    console.error("CHAT ERROR:", e.message);
    res.json({ reply: `Error: ${e.message}`, error:true });
  }
});

app.get('*', (req,res)=>{
  res.sendFile(path.join(__dirname,'public','index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=> console.log(`Running ${PORT} ✅`));
