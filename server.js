require("dotenv").config();

const express = require("express");
const path = require("path");
const { tavily } = require("@tavily/core");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({limit:"1mb"}));
app.use(express.static(path.join(__dirname,"public")));

let geminiClient = null;

async function askGemini(message){
  if(!process.env.GEMINI_API_KEY)
    throw new Error("GEMINI_API_KEY missing");

  if(!geminiClient){
    const {GoogleGenAI} = await import("@google/genai");
    geminiClient = new GoogleGenAI({
      apiKey:process.env.GEMINI_API_KEY
    });
  }

  const response = await geminiClient.interactions.create({
    model:"gemini-3.8-flash",
    input:
      "You are SASIKUMAR AI. Answer directly and clearly. " +
      "Support Tamil and English. " +
      "For gold appraisal questions provide practical accurate answers. " +
      "Do not invent current information.\n\nUser:\n"+message
  });

  return response.output_text || "பதில் கிடைக்கவில்லை.";
}

async function webSearch(query){
  try{
    if(!process.env.TAVILY_API_KEY){
      console.log("⚠️ TAVILY_API_KEY missing");
      return null;
    }

    const tvly=tavily({
      apiKey:process.env.TAVILY_API_KEY
    });

    const result=await tvly.search(query,{
      search_depth:"basic",
      max_results:5,
      include_answer:true
    });

    if(result.answer)
      return "🌐 Web Search\n\n"+result.answer;

    if(!result.results?.length)
      return null;

    return "🌐 Web Search Results\n\n"+
      result.results.slice(0,5).map((r,i)=>
        `${i+1}. ${r.title||"Result"}\n${r.content||""}\n${r.url||""}`
      ).join("\n\n");

  }catch(e){
    console.error("Tavily Error:",e.message);
    return null;
  }
}

function goldAnswer(message){
  const q=String(message||"").toLowerCase();

  if(
    q.includes("22k")||
    q.includes("22ct")||
    q.includes("22 carat")||
    q.includes("916")||
    q.includes("22 காரட்")
  ){
    if(q.includes("density")||q.includes("அடர்த்தி"))
      return "🪙 22K / 916 Gold\n\nPurity: 91.6%\nFineness: 916\nApprox. density: 17.5–17.8 g/cm³";

    return "🪙 22K / 916 Gold\n\nPurity: 91.6%\nFineness: 916\n1 சவரன் = 8 gram";
  }

  if(q.includes("24k")||q.includes("24ct")||q.includes("24 carat")){
    if(q.includes("density")||q.includes("அடர்த்தி"))
      return "🪙 24K Gold\n\nPurity: பொதுவாக 99.9%\nFineness: 999\nDensity: சுமார் 19.3 g/cm³";

    return "🪙 24K Gold\n\nPurity: பொதுவாக 99.9%\nFineness: 999";
  }

  if(q.includes("23k")||q.includes("23ct")||q.includes("23 carat"))
    return "🪙 23K Gold\n\nPurity: சுமார் 95.8%\nFineness: சுமார் 958";

  if(q.includes("21k")||q.includes("21ct")||q.includes("21 carat")){
    if(q.includes("density")||q.includes("அடர்த்தி"))
      return "🪙 21K Gold\n\nPurity: சுமார் 87.5%\nFineness: 875\nDensity: சுமார் 16.8–17.3 g/cm³";

    return "🪙 21K Gold\n\nPurity: சுமார் 87.5%\nFineness: 875";
  }

  if(q.includes("20k")||q.includes("20ct")||q.includes("20 carat"))
    return "🪙 20K Gold\n\nPurity: சுமார் 83.3%\nFineness: சுமார் 833";

  if(q.includes("18k")||q.includes("18ct")||q.includes("18 carat"))
    return "🪙 18K Gold\n\nPurity: 75%\nFineness: 750";

  return null;
}


function isGoldRateIntent(message){
  const q=String(message||"").toLowerCase().trim();

  return (
    q.includes("gold rate") ||
    q.includes("gold price") ||
    q.includes("gold today") ||
    q.includes("tamil nadu gold") ||
    q.includes("chennai gold") ||
    q.includes("22k gold") ||
    q.includes("24k gold") ||
    q.includes("916 gold") ||
    q.includes("தங்க விலை") ||
    q.includes("தங்கத்தின் விலை") ||
    q.includes("தங்கம் விலை") ||
    q.includes("தங்க ரேட்") ||
    q.includes("இன்றைய தங்க விலை")
  );
}

async function getLiveGoldRate(){
  const rate24=15666;
  const rate22=14360;
  const rate20=13055;
  const rate19=12404;
  const rate18=12130;

  return {
    rate24, rate22, rate20, rate19, rate18,
    rate24_8g:rate24*8,
    rate22_8g:rate22*8,
    rate20_8g:rate20*8,
    rate19_8g:rate19*8,
    rate18_8g:rate18*8
  };
}

function formatGoldRateAnswer(g){
  if(!g) return null;

  return "🪙 Chennai / Tamil Nadu Live Gold Rate\n\n"+
    "22K / 916: ₹"+(g.rate22||0).toLocaleString("en-IN")+" / gram\n"+
    "24K: ₹"+(g.rate24||0).toLocaleString("en-IN")+" / gram\n\n"+
    "⚖️ 22K / 916 — 8 gram: ₹"+(g.rate22_8g||0).toLocaleString("en-IN")+"\n"+
    "⚖️ 24K — 8 gram: ₹"+(g.rate24_8g||0).toLocaleString("en-IN")+"\n\n"+
    "📊 SASIKUMAR AI • Model Rate • 07.09.2026";
}

function needsWeb(message){
  return /news|latest|today|current|breaking|search|price|rate|weather|cricket|sports|Tamil Nadu|India|Tamil|செய்தி|இன்று|தற்போது|சமீபத்திய|நேரலை|தகவல்|தேடு|தேடல்|விலை|வானிலை|கிரிக்கெட்/i.test(message);
}

app.post("/api/chat",async(req,res)=>{
  const message=String(req.body?.message||"").trim();

  if(!message)
    return res.status(400).json({
      reply:"❗ கேள்வியை உள்ளிடுங்கள்."
    });

  console.log("👤 Question:",message);

  if(isGoldRateIntent(message)){
    try{
      const live=await getLiveGoldRate();

      if(live){
        return res.json({
          reply:formatGoldRateAnswer(live),
          source:"gold-live"
        });
      }
    }catch(e){
      console.error("Gold Live Error:",e.message);
    }
  }

  const local=goldAnswer(message);

  if(local)
    return res.json({
      reply:local,
      source:"local"
    });

  if(needsWeb(message)){
    const web=await webSearch(message);

    if(web)
      return res.json({
        reply:web,
        source:"web"
      });
  }

  try{
    const answer=await askGemini(message);

    return res.json({
      reply:answer,
      source:"gemini"
    });

  }catch(error){

    console.error("Gemini Error:",error.message);

    const m=String(error?.message||"").toLowerCase();

    if(
      error?.status===429||
      m.includes("429")||
      m.includes("quota")||
      m.includes("resource exhausted")
    ){

      console.log("🔄 Gemini quota → Tavily");

      const web=await webSearch(message);

      if(web)
        return res.json({
          reply:web+"\n\nℹ️ Gemini quota காரணமாக Web Search பயன்படுத்தப்பட்டது.",
          source:"web-fallback"
        });

      return res.json({
        reply:"⚠️ Gemini quota தற்போது முடிந்துள்ளது. Web Search-லும் பதில் கிடைக்கவில்லை.",
        source:"quota"
      });
    }

    const web=await webSearch(message);

    if(web)
      return res.json({
        reply:web,
        source:"web-fallback"
      });

    return res.json({
      reply:"❌ SASIKUMAR AI தற்போது பதில் வழங்க முடியவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்.",
      source:"error"
    });
  }
});



app.get("/api/state-news",async(req,res)=>{
  try{
    const state=String(req.query.state||"TN").trim();
    const district=String(req.query.district||"").trim();
    const states={TN:"Tamil Nadu",KL:"Kerala",KA:"Karnataka",AP:"Andhra Pradesh",TS:"Telangana",MH:"Maharashtra",GJ:"Gujarat",RJ:"Rajasthan",WB:"West Bengal",UP:"Uttar Pradesh",MP:"Madhya Pradesh",OD:"Odisha",PB:"Punjab",HR:"Haryana",BR:"Bihar",JH:"Jharkhand",AS:"Assam",CG:"Chhattisgarh",UK:"Uttarakhand",HP:"Himachal Pradesh",GA:"Goa",TR:"Tripura",ML:"Meghalaya",MN:"Manipur",NL:"Nagaland",AR:"Arunachal Pradesh",SK:"Sikkim",MZ:"Mizoram"};
    const stateName=states[state]||state;
    const place=district?`${district}, ${stateName}`:stateName;
    const web=await webSearch(`${place} latest news today important news`);
    if(!web)return res.status(503).json({ok:false,reply:"⚠️ மாநில செய்திகள் தற்போது கிடைக்கவில்லை."});
    const lines=String(web).split(/?
/).map(x=>x.trim()).filter(Boolean).slice(0,10);
    res.json({ok:true,state:stateName,district:district||"All Districts",reply:lines.join("
"),source:"Tavily Web Search"});
  }catch(e){
    console.error("State News Error:",e.message);
    res.status(500).json({ok:false,reply:"❌ State News search error."});
  }
});

app.get("/api/gold-rate",(req,res)=>{
  const r={"24K":15666,"22K":14360,"20K":13055,"19K":12404,"18K":12130};
  res.json({ok:true,date:"07.09.2026",rates:r,rates8g:Object.fromEntries(Object.entries(r).map(([k,v])=>[k,v*8]))});
});
app.get("/api/status",(req,res)=>{
  res.json({app:"SASIKUMAR AI",gemini:process.env.GEMINI_API_KEY?"READY":"MISSING",tavily:process.env.TAVILY_API_KEY?"READY":"MISSING",port:PORT});
});

app.get("/",(req,res)=>{
  res.sendFile(path.join(__dirname,"public","index.html"));
});

app.listen(PORT,()=>{
  console.log("");
  console.log("================================");
  console.log("🤖 SASIKUMAR AI");
  console.log("================================");
  console.log("✅ Server running");
  console.log("🌐 http://localhost:"+PORT);
  console.log(process.env.GEMINI_API_KEY?"🤖 Gemini: READY":"⚠️ Gemini: MISSING");
  console.log(process.env.TAVILY_API_KEY?"🌐 Tavily: READY":"⚠️ Tavily: MISSING");
  console.log("🪙 Gold AI: ACTIVE");
  console.log("================================");
});
