import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req,res)=>{
  res.json({
    status: 'OK',
    tavily: process.env.TAVILY_API_KEY ? '✅ ADDED' : '❌ Add in Render',
    gemini: process.env.GEMINI_API_KEY ? '✅ ADDED' : '❌ Add in Render',
    time: new Date().toLocaleString('en-IN')
  });
});

app.get('/api/gold', async (req,res)=>{
  if(!process.env.TAVILY_API_KEY) return res.json({mode:'DEMO', gold:'₹6,245/g'});
  try{
    const r = await fetch('https://api.tavily.com/search',{method:'POST',headers:{'Content-Type':'application/json'},body: JSON.stringify({api_key: process.env.TAVILY_API_KEY, query:'Chennai gold price today', max_results:3, include_answer:true})});
    res.json(await r.json());
  }catch(e){res.json({error:e.message});}
});

app.post('/api/growth', async (req,res)=>{
  const q = req.body.query || 'growth';
  let gText = 'Growth plan for: '+q;
  if(process.env.GEMINI_API_KEY){
    try{
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent('Give 3 growth tips for: '+q+' in Tanglish');
      gText = result.response.text();
    }catch(e){gText = 'Error: '+e.message;}
  }
  res.json({gemini: gText});
});

app.get('*', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', ()=> console.log('Running '+PORT));
