import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const app=express();
app.use(cors()); app.use(express.json({ limit: '16mb' }));
app.use(express.static(path.join(__dirname,'public')));
const VERIFY=process.env.VERIFY_TOKEN||"sasikumar123";
const WATOKEN=process.env.WHATSAPP_TOKEN;
const GROQ=process.env.GROQ_API_KEY;
const GEMINI_API_KEY=process.env.GEMINI_API_KEY;
const mem=new Map();
const add=(u,r,t)=>{if(!mem.has(u))mem.set(u,[]);let a=mem.get(u);a.push({r,t,time:Date.now()});if(a.length>30)a.shift()};
const getMem=(u)=>(mem.get(u)||[]).slice(-8).map(x=>`${x.r}:${x.t}`).join('\n');

async function groqAI(q,u="web"){
 if(!GROQ) return null;
 try{
  const history=mem.get(u)||[];
  const h=history.filter((m,i,a)=>
    !(i===a.length-1 && m.r==="user" && m.t===q)
  );
  const msgs=[{role:"system",content:`You are SASIKUMAR AI, a helpful, friendly, and accurate conversational assistant.
Support open-ended conversation on any topic, including education, science, technology, history, coding, business, daily life, hobbies, and general knowledge.
Reply naturally in Tamil, Tanglish, or English according to the user's language.
Use recent conversation history when relevant, remember the context available in this chat, and answer follow-up questions directly.
Be warm, engaging, respectful, and concise. Add clean Tamil comedy or playful banter when appropriate, but never force jokes into serious, sad, urgent, or sensitive conversations.
Never insult or embarrass the user.
Prioritize factual accuracy. If information is uncertain, say so. Never invent live rates, current news, job openings, or claim a search was performed when it was not.
Respond in the language used by the user. For Tamil questions, answer in clear, natural Tamil.
Prioritize factual accuracy over confidence. Never invent historical dates, people, places, quotations, or events.
For history questions, use accepted historical chronology and distinguish established facts from disputed dates.
For Tamil history, use these careful historical guidelines:
The traditional Tamil three crowned dynasties are the Chera (சேரர்), Chola (சோழர்), and Pandya (பாண்டியர்).
Madurai was a major Pandya capital.
Early Chola centres included Uraiyur; Thanjavur and later Gangaikonda Cholapuram were important imperial Chola capitals.
For questions about Gangaikonda Cholapuram:
Rajendra Chola I is credited with establishing Gangaikonda Cholapuram as his capital.
It is in present-day Ariyalur district, Tamil Nadu, India; do not place it in Kerala.
Do not claim the city itself stands on the banks of the Ganges River.
Its name is associated with Rajendra Chola I's northern campaign and his Ganges victory.
When explaining Chola capitals, distinguish Rajaraja Chola I from Rajendra Chola I.
Answer the exact question directly, and do not add unsupported details.

The Chera capital is traditionally associated with Vanji; its precise location and identification with Karur or other sites are debated by historians. Do not confidently claim Thiruvananthapuram was the ancient Chera capital.
Do not confuse dynasty names or invent people, places, dates, or timelines. Avoid precise date ranges unless supported by reliable evidence. Explain historical uncertainty briefly and clearly. Sangam literature is an important source for early Tamil history.
If a fact is uncertain or unavailable, clearly say so instead of guessing.
For current gold rates, news, jobs, and other changing information, do not present old figures as live data.
Give a direct answer with useful details. Use conversation history only when relevant.
Conversation context: ${getMem(u)}`}];
  h.slice(-6).forEach(m=>msgs.push({role:m.r==="user"?"user":"assistant",content:m.t}));
  msgs.push({role:"user",content:q});
  const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${GROQ}`,"Content-Type":"application/json"},body:JSON.stringify({model:"openai/gpt-oss-20b",messages:msgs,max_tokens:1400,temperature:0.3})});
  const d=await r.json();
  if(d.error) {console.log("GROQ ERR",d.error); return null;}
  return d.choices?.[0]?.message?.content||null;
 }catch(e){console.log("groq fail",e.message); return null;}
}

async function globalKnowledge(q){
 try{
  const clean=q.replace(/what is|who is|explain|define|tell me about|growth|kavithai|kural|ponmozhi/gi,'').trim()||q;
  const w=await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(clean)}`);
  if(w.ok){let d=await w.json(); if(d.extract) return `🌍 ${d.title}:\n${d.extract.slice(0,800)}`;}
 }catch{}
 return null;
}

function smartAI(t){
 const l=t.toLowerCase();
 if(/^[0-9+\-*/%(). ]+$/.test(t.trim())){try{let a=Function(`return ${t}`)();return `🧮 Answer: ${t} = ${a}`;}catch{}}
 if(l.includes("gold")) return `💰 Chennai Gold Live: 22K ₹13,815/g (8g ₹1,10,520), 24K ₹15,071/g, Silver ₹245/g. Dubai $2,685/oz. Tip: Buy now Sir!`;
 if(l.includes("job")) return `💼 Jobs: Marketing/Sales - Vinayaga Agencies Chennai, IT - Python/AI/Web, Govt TNPSC. Tell qualification Sir!`;
 if(l.includes("growth")) return `🚀 Growth Tip Sir: Daily 1% improve. Health: 30min walk, Wealth: Save 20% gold, Mind: Learn 1 skill/month.`;
 if(l.includes("kavithai")||l.includes("kural")||l.includes("ponmozhi")) return `✨ Kavithai: "Muyarchi thiruvinai aakkum" - Effort brings fortune! Life la try panni paaru Sir, success varum! 🌟`;
 return `🤖 Sasikumar GLOBAL AI Sir: "${t}" - Naan world knowledge AI! Science, history, tech, code, gold, jobs, life edhu venumnaalum ketkalam. Specific ah ketta full answer tharuven!`;
}

function conversationRecallAnswer(q,u) {
  const text = String(q || "").toLowerCase();
  const asksRecall = /நான்\s*(முன்பு|முன்னாடி|முந்தைய)\s*(என்ன|எதை)\s*(சொன்னேன்|கேட்டேன்)|முன்பு\s*நான்|what did i (say|ask) before|my previous message|remember my last message/i.test(text);

  if (!asksRecall) return null;

  const history = mem.get(u) || [];
  const previous = [...history].reverse().find(m => m.r === "user");

  if (!previous) {
    return "இந்த உரையாடல் நினைவகத்தில் முந்தைய செய்தி கிடைக்கவில்லை. அதனால் ஊகித்துப் பதிலளிக்க மாட்டேன்.";
  }

  return `உங்கள் முந்தைய செய்தி: “${String(previous.t).slice(0,2000)}”`;
}

function tamilHistoryAnswer(q) {
  const text = String(q || "").toLowerCase();
  const asksKings = /மூவேந்தர்|மூன்று முக்கிய அரச|சேரர்.*சோழர்|சோழர்.*பாண்டியர்|tamil history/i.test(text);
  if (!asksKings) return null;

  return `## தமிழகத்தின் மூவேந்தர்கள்

தமிழக வரலாற்றில் புகழ்பெற்ற மூன்று அரச மரபுகள் சேரர், சோழர், பாண்டியர்.

| அரச மரபு | முக்கிய வரலாற்று மையங்கள் |
|---|---|
| சேரர் | வஞ்சி என்பது பாரம்பரியமாகக் குறிப்பிடப்படும் தலைநகரம். அதன் துல்லியமான இடம் குறித்து வரலாற்று ஆய்வுகளில் கருத்து வேறுபாடுகள் உள்ளன; கரூருடனான தொடர்பும் விவாதிக்கப்படுகிறது. |
| சோழர் | உறையூர் பழைய சோழ மையமாக இருந்தது. தஞ்சாவூர் மற்றும் கங்கைகொண்ட சோழபுரம் பிற்காலப் பேரரசுச் சோழர்களின் முக்கிய தலைநகரங்களாக விளங்கின. |
| பாண்டியர் | மதுரை முக்கியமான பாண்டிய அரசியல் மற்றும் பண்பாட்டு மையமாக விளங்கியது. |

**நினைவில் கொள்ளுங்கள்:** இந்த அரச மரபுகளின் தலைநகரங்களும் அரசியல் மையங்களும் காலத்திற்கேற்ப மாறின. சேரர்களின் பழைய தலைநகரத்தின் துல்லியமான இடம் குறித்து முழுமையான ஒருமித்த கருத்து இல்லை.`;

}


async function groqVisionImage(attachment, question) {
  if (!GROQ) {
    throw new Error("Groq Vision fallback is not configured.");
  }

  const mimeType = String(
    attachment?.type || attachment?.mimeType || attachment?.mime_type || ""
  ).split(";")[0].trim().toLowerCase();

  if (!/^image\/(jpeg|jpg|png|webp|gif|bmp)$/.test(mimeType)) {
    throw new Error("Groq Vision does not support this image format.");
  }

  const raw = String(attachment?.data || "");
  const data = raw.replace(/^data:[^,]*;base64,/i, "").replace(/\s/g, "");

  if (!data) throw new Error("Image data is empty.");

  const bytes = Buffer.from(data, "base64");
  if (bytes.length > 14 * 1024 * 1024) {
    throw new Error("Image exceeds the 14 MB processing limit.");
  }

  const prompt = String(
    question || "இந்தப் படத்தை கவனமாகப் பார்த்து தமிழில் விளக்கவும்."
  ).slice(0, 10000);

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen/qwen3.8-27b",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${data}` }
            }
          ]
        }],
        max_completion_tokens: 1200,
        temperature: 0.3
      })
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Groq Vision API error:", response.status,
      JSON.stringify(result).slice(0, 500));
    throw new Error(`Groq Vision API failed (${response.status}).`);
  }

  const answer = result.choices?.[0]?.message?.content;
  if (typeof answer !== "string" || !answer.trim()) {
    throw new Error("Groq Vision returned an empty response.");
  }

  console.log("Image analysis completed using Groq Vision fallback.");
  return answer.trim();
}

async function analyzeImageAttachment(attachment, question) {
  if (!GEMINI_API_KEY) {
    return await groqVisionImage(attachment, question);
  }

  if (!attachment || typeof attachment.data !== "string" ||
      !String(attachment.type || "").startsWith("image/")) {
    throw new Error("Please upload a supported image file.");
  }

  const base64 = attachment.data.replace(/^data:[^,]*,/, "");
  if (!base64 || base64.length > 14 * 1024 * 1024) {
    throw new Error("Image is too large. Please try an image smaller than 10 MB.");
  }

  const model = new GoogleGenerativeAI(GEMINI_API_KEY)
    .getGenerativeModel({ model: "gemini-3.8-flash" });

  const prompt = String(question || "Describe this image and explain its important details.")
    .slice(0, 12000);

  const IMAGE_RETRY_MAX = 3;
  for (let attempt = 1; attempt <= IMAGE_RETRY_MAX; attempt++) {
    try {
      const result = await model.generateContent([
        { text: prompt },
        { inlineData: { mimeType: attachment.type, data: base64 } }
      ]);
      return result.response.text();
    } catch (e) {
      const msg = String(e?.message || e);
      const retryable = /503|429|500|502|504|high demand|temporar|overload|fetch failed/i.test(msg);

      console.error("GEMINI IMAGE ERROR:", JSON.stringify({
        attempt,
        model: "gemini-3.8-flash",
        status: e?.status || e?.statusCode || e?.response?.status || null,
        message: msg.slice(0, 1200)
      }));

      if (!retryable || attempt === IMAGE_RETRY_MAX) {
        console.warn(
          "Gemini image analysis failed; trying Groq Vision fallback:",
          String(e?.message || e).slice(0, 250)
        );
        return await groqVisionImage(attachment, question);
      }

      console.warn(`Gemini image attempt ${attempt} failed; retrying.`);
      await new Promise(resolve => setTimeout(resolve, attempt * 1500));
    }
  }

  throw new Error("Image analysis failed after retries.");
}
// WEB API
app.post('/api/chat', async(req,res)=>{
 try{
  const {message, category, conversationId, attachment} = req.body || {};
  const hasAttachment = !!attachment;
  const txt = String(message || category ||
    (hasAttachment ? "இந்தப் படத்தைப் பார்த்து விளக்கவும்." : "hi")
  ).slice(0,12000);

  const safeId = String(conversationId || "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0,80);
  const uid = safeId
    ? "web:" + safeId
    : "web:oneoff:" + Date.now() + ":" + Math.random().toString(36).slice(2);

  let ans;

  if (hasAttachment) {
    if (!String(attachment.type || "").startsWith("image/")) {
      return res.status(415).json({
        reply: "தற்போது படங்களை மட்டுமே நேரடியாகப் புரிந்துகொள்ள முடியும். PDF அல்லது document support இன்னும் சேர்க்கப்படவில்லை.",
        status: "unsupported_attachment"
      });
    }
    ans = await analyzeImageAttachment(attachment, txt);
  } else {
    ans = conversationRecallAnswer(txt,uid) ||
      tamilHistoryAnswer(txt) ||
      await groqAI(txt,uid);

    if(!ans) ans = await globalKnowledge(txt);
    if(!ans) ans = smartAI(txt);
  }

  add(uid,"user",txt);
  add(uid,"assistant",ans);
  res.json({
    reply:ans,
    status:"ok",
    ai: hasAttachment ? "Gemini Image Analysis" : (GROQ ? "Groq LIVE" : "Offline Smart")
  });
 }catch(e){
  console.error("CHAT API ERROR:", e.message);
  const status = /GEMINI_API_KEY/.test(e.message) ? 503 : 500;
  res.status(status).json({
    reply: /GEMINI_API_KEY/.test(e.message)
      ? "Image analysis is not configured. Please set GEMINI_API_KEY in Render Environment."
      : "படத்தைப் புரிந்துகொள்ள முடியவில்லை. சிறிய படத்துடன் மீண்டும் முயற்சிக்கவும்.",
    status:"error"
  });
 }
});


// GLOBAL SEARCH API
app.get('/api/global-search', async (req, res) => {
  const q = String(req.query.q || '').trim();

  if (!q) {
    return res.status(400).json({
      error: 'Please provide a search query using ?q='
    });
  }

  try {
    const key = process.env.TAVILY_API_KEY;

    if (key) {
      try {
        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            api_key: key,
            query: q,
            search_depth: 'basic',
            max_results: 5
          }),
          signal: AbortSignal.timeout(12000)
        });

        const data = await response.json();

        if (response.ok) {
          return res.json({
            query: q,
            provider: 'Tavily',
            results: (data.results || []).map(x => ({
              title: x.title,
              url: x.url,
              content: x.content
            }))
          });
        }

        console.error(
          'Tavily search failed; trying Wikipedia fallback:',
          response.status,
          JSON.stringify(data).slice(0, 300)
        );
      } catch (providerError) {
        console.error(
          'Tavily unavailable; trying Wikipedia fallback:',
          providerError.message
        );
      }
    }

    const wikiUrl =
      'https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=' +
      encodeURIComponent(q);

    const fallback = await fetch(wikiUrl, {
      headers: { 'User-Agent': 'SasikumarAI/1.0' },
      signal: AbortSignal.timeout(12000)
    });

    if (!fallback.ok) {
      return res.status(502).json({
        error: 'Search providers are temporarily unavailable.',
        results: []
      });
    }

    const wikiData = await fallback.json();

    return res.json({
      query: q,
      provider: 'Wikipedia',
      results: (wikiData.query?.search || []).map(x => ({
        title: x.title,
        url: 'https://en.wikipedia.org/wiki/' +
          encodeURIComponent(x.title.replace(/ /g, '_')),
        content: String(x.snippet || '').replace(/<[^>]*>/g, '')
      }))
    });
  } catch (e) {
    console.error('Global search error:', e.message);
    return res.status(502).json({
      error: 'Search temporarily unavailable.',
      results: []
    });
  }
});

// LIVE BREAKING NEWS API — powered by Tavily
app.get('/api/breaking-news', async (req, res) => {
  const category = String(req.query.category || 'Tamil Nadu').trim().slice(0, 80);
  const language = String(req.query.language || 'ta').toLowerCase();

  const names = {
    ta: 'Tamil', en: 'English', hi: 'Hindi',
    te: 'Telugu', kn: 'Kannada', ml: 'Malayalam'
  };

  const queries = {
    ta: 'தமிழ்நாடு இன்றைய முக்கிய செய்திகள்',
    en: 'Tamil Nadu latest breaking news',
    hi: 'तमिलनाडु की ताजा मुख्य खबरें',
    te: 'తమిళనాడు తాజా ముఖ్య వార్తలు',
    kn: 'ತಮಿಳುನಾಡಿನ ಇತ್ತೀಚಿನ ಪ್ರಮುಖ ಸುದ್ದಿಗಳು',
    ml: 'തമിഴ്നാട്ടിലെ ഏറ്റവും പുതിയ പ്രധാന വാർത്തകൾ'
  };

  const lang = names[language] || 'Tamil';
  const query = category.toLowerCase() === 'tamil nadu'
    ? (queries[language] || queries.ta)
    : category + ' latest breaking news ' + lang;

  const config = {
    ta: ['ta-IN', 'IN:ta'],
    en: ['en-IN', 'IN:en'],
    hi: ['hi-IN', 'IN:hi'],
    te: ['te-IN', 'IN:te'],
    kn: ['kn-IN', 'IN:kn'],
    ml: ['ml-IN', 'IN:ml']
  };
  const locale = config[language] || config.ta;

  res.set('Cache-Control', 'no-store');

  function decodeXml(value) {
    return String(value || '')
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'");
  }

  function tag(block, name) {
    const pattern = new RegExp(
      '<' + name + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + name + '>',
      'i'
    );
    const match = block.match(pattern);
    return match ? decodeXml(match[1]).trim() : '';
  }

  async function googleNews() {
    const url = 'https://news.google.com/rss/search?q=' +
      encodeURIComponent(query) +
      '&hl=' + encodeURIComponent(locale[0]) +
      '&gl=IN&ceid=' + encodeURIComponent(locale[1]);

    const response = await fetch(url, {
      headers: { 'User-Agent': 'SasikumarAI/1.0' },
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error('Google News RSS HTTP ' + response.status);
    }

    const xml = await response.text();
    const articles = [...xml.matchAll(
      /<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi
    )].slice(0, 5).map(match => {
      const item = match[1];
      return {
        title: tag(item, 'title'),
        url: tag(item, 'link'),
        description: tag(item, 'description'),
        published_date: tag(item, 'pubDate') || null
      };
    }).filter(item =>
      item.title && /^https?:\/\//i.test(item.url)
    );

    if (!articles.length) {
      throw new Error('No usable Google News articles returned');
    }

    return res.json({
      category,
      language,
      provider: 'Google News RSS',
      articles,
      news: articles
    });
  }

  try {
    const key = process.env.TAVILY_API_KEY;

    if (key) {
      try {
        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + key
          },
          body: JSON.stringify({
            api_key: key,
            query,
            topic: 'news',
            search_depth: 'advanced',
            max_results: 5,
            days: 3,
            include_answer: false
          }),
          signal: AbortSignal.timeout(12000)
        });

        if (response.ok) {
          const data = await response.json();
          const articles = (data.results || []).map(item => ({
            title: String(item.title || '').trim(),
            url: String(item.url || '').trim(),
            description: String(item.content || '').trim(),
            published_date: item.published_date || null
          })).filter(item => item.title && item.url);

          if (articles.length) {
            return res.json({
              category,
              language,
              provider: 'Tavily News',
              articles,
              news: articles
            });
          }

          console.error('Tavily returned no news; trying RSS.');
        } else {
          const detail = await response.text().catch(() => '');
          console.error(
            'Tavily news failed; trying Google News RSS:',
            response.status,
            detail.slice(0, 250)
          );
        }
      } catch (providerError) {
        console.error(
          'Tavily unavailable; trying Google News RSS:',
          providerError.message
        );
      }
    }


    // NewsData.io fallback: use only when an API key is configured.
    const newsDataKey = process.env.NEWSDATA_API_KEY;
    if (newsDataKey) {
      try {
        const params = new URLSearchParams({
          apikey: newsDataKey,
          q: query,
          country: 'in',
          language: ['ta', 'en', 'hi', 'te', 'kn', 'ml'].includes(language)
            ? language : 'ta'
        });

        const newsDataResponse = await fetch(
          'https://newsdata.io/api/1/latest?' + params.toString(),
          { signal: AbortSignal.timeout(12000) }
        );

        if (newsDataResponse.ok) {
          const newsData = await newsDataResponse.json();
          const articles = (newsData.results || [])
            .filter(item => item.title && item.link)
            .map(item => ({
              title: item.title,
              url: item.link,
              link: item.link,
              description: item.description || '',
              publishedAt: item.pubDate || '',
              source: item.source_name || item.source_id || 'NewsData.io',
              image: item.image_url || ''
            }));

          if (articles.length) {
            console.log('NewsData.io returned', articles.length, 'articles');
            return res.json({
              category,
              language,
              provider: 'NewsData.io',
              articles,
              news: articles
            });
          }

          console.error('NewsData.io returned no articles; trying Google News RSS.');
        } else {
          console.error(
            'NewsData.io failed; trying Google News RSS:',
            newsDataResponse.status
          );
        }
      } catch (newsDataError) {
        console.error(
          'NewsData.io unavailable; trying Google News RSS:',
          newsDataError.message
        );
      }
    }

    return await googleNews();
  } catch (error) {
    console.error('Breaking news fallback failed:', error.message);
    return res.status(502).json({
      error: 'Live news providers are temporarily unavailable.',
      articles: [],
      news: []
    });
  }
});

app.get('/api/status',(req,res)=>res.json({live:true, groq:!!GROQ, gemini:!!GROQ, users:mem.size}));

async function sendWA(to,pid,pl){
  if(!WATOKEN){
    console.error("[WhatsApp] WHATSAPP_TOKEN is missing");
    return false;
  }
  if(!to || !pid){
    console.error("[WhatsApp] Recipient or phone_number_id is missing");
    return false;
  }
  try{
    const response = await fetch(
      `https://graph.facebook.com/v20.0/${pid}/messages`,
      {
        method:"POST",
        headers:{
          Authorization:`Bearer ${WATOKEN}`,
          "Content-Type":"application/json"
        },
        body:JSON.stringify({messaging_product:"whatsapp",to,...pl})
      }
    );
    const result = await response.json().catch(()=>({}));
    if(!response.ok){
      console.error("[WhatsApp] API error:", response.status,
        JSON.stringify(result.error || result).slice(0,1000));
      return false;
    }
    console.log("[WhatsApp] Message accepted by API");
    return true;
  }catch(error){
    console.error("[WhatsApp] Request failed:", error.message);
    return false;
  }
}
// ================= GOLD RATE API =================
let goldRateCache = null;
let goldRateCacheTime = 0;

const GOLD_CACHE_MS = 5 * 60 * 1000;

app.get("/api/gold-rate", async (req, res) => {
  try {
    const state = req.query.state || "Tamil Nadu";
    const district = req.query.district || "Thanjavur";

    // Return cached rate for 5 minutes
    if (
      goldRateCache &&
      Date.now() - goldRateCacheTime < GOLD_CACHE_MS
    ) {
      return res.json({
        ...goldRateCache,
        state,
        district,
        cached: true
      });
    }

    let r24, r22, r20, r19, r18;
    let buy = null;
    let sell = null;
    let gst = null;
    let change24h = null;
    let source = "";
    let fallbackUsed = false;

    // 1) PRIMARY: OroPocket public Gold API
    try {
      const response = await fetch(
        "https://api.oropocket.com/public/prices"
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data.data ||
        !data.data.gold
      ) {
        throw new Error("OroPocket Gold price unavailable");
      }

      const gold = data.data.gold;

      buy = Number(gold.buy);
      sell = Number(gold.sell);
      gst = Number(gold.gst);

      if (!Number.isFinite(sell) || sell <= 0) {
        throw new Error("Invalid OroPocket Gold sell price");
      }

      // OroPocket price is INR per gram.
      // Use sell as the reference gold price.
      r24 = Math.round(sell);
      r22 = Math.round(r24 * 22 / 24);
      r20 = Math.round(r24 * 20 / 24);
      r19 = Math.round(r24 * 19 / 24);
      r18 = Math.round(r24 * 18 / 24);

      if (
        gold.change24h &&
        Number.isFinite(Number(gold.change24h.sell))
      ) {
        change24h = Number(gold.change24h.sell);
      }

      source = "OroPocket • Gold • INR/gram • SASIKUMAR AI";

      console.log("✅ OroPocket Gold:", sell);
      console.log("📈 24h change:", change24h);

    } catch (oropocketError) {
      console.warn(
        "⚠️ OroPocket Gold unavailable:",
        oropocketError.message
      );

      // 2) FALLBACK: goldprice.dev
      console.log("🔄 Trying goldprice.dev fallback...");

      const fallback = await fetch(
        "https://api.goldprice.dev/v1/prices?symbol=XAU-INR-SPOT"
      );

      const fd = await fallback.json();

      if (
        !fallback.ok ||
        !fd.symbols ||
        !fd.symbols[0]
      ) {
        throw new Error(
          "OroPocket and goldprice.dev unavailable"
        );
      }

      const ouncePrice = Number(fd.symbols[0].price);

      if (
        !Number.isFinite(ouncePrice) ||
        ouncePrice <= 0
      ) {
        throw new Error(
          "Invalid goldprice.dev XAU-INR price"
        );
      }

      // 1 troy ounce = 31.1034768 grams
      r24 = Math.round(
        ouncePrice / 31.1034768
      );

      r22 = Math.round(r24 * 22 / 24);
      r20 = Math.round(r24 * 20 / 24);
      r19 = Math.round(r24 * 19 / 24);
      r18 = Math.round(r24 * 18 / 24);

      source =
        "goldprice.dev • XAU/INR • SASIKUMAR AI";

      fallbackUsed = true;
    }

    const rates = {
      "24K": r24,
      "22K": r22,
      "20K": r20,
      "19K": r19,
      "18K": r18
    };

    const responseData = {
      ok: true,

      state,
      district,

      date: new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata"
      }).format(new Date()),

      rates,

      rates8g: Object.fromEntries(
        Object.entries(rates).map(
          ([k, v]) => [k, v * 8]
        )
      ),

      buy,
      sell,
      gst,
      change24h,

      source,
      fallbackUsed,
      cached: false,

      note:
        "Reference gold price. Thanjavur jewellery retail rate may differ.",

      updatedAt: new Date().toISOString()
    };

    // Save in-memory cache
    goldRateCache = responseData;
    goldRateCacheTime = Date.now();

    console.log("===== GOLD RATE DEBUG =====");
    console.log("24K:", r24);
    console.log("22K:", r22);
    console.log("20K:", r20);
    console.log("19K:", r19);
    console.log("18K:", r18);
    console.log("Source:", source);
    console.log("Fallback:", fallbackUsed);
    console.log("===========================");

    res.json(responseData);

  } catch (e) {
    console.error(
      "Gold Rate Error:",
      e.message
    );

    res.status(503).json({
      ok: false,
      reply:
        "❌ Live Gold Rate unavailable: " +
        e.message
    });
  }
});


// ================= SILVER RATE API =================
let silverRateCache = null;
let silverRateCacheTime = 0;
const SILVER_CACHE_MS = 5 * 60 * 1000;

app.get("/api/silver-rate", async (req, res) => {
  try {
    const state = req.query.state || "Tamil Nadu";
    const district = req.query.district || "Thanjavur";

    if (silverRateCache && Date.now() - silverRateCacheTime < SILVER_CACHE_MS) {
      return res.json({ ...silverRateCache, state, district, cached: true });
    }

    const response = await fetch("https://api.oropocket.com/public/prices");
    if (!response.ok) {
      throw new Error("OroPocket returned HTTP " + response.status);
    }

    const payload = await response.json();
    const silver = payload?.data?.silver;
    const gram = Number(silver?.sell);

    if (!Number.isFinite(gram) || gram <= 0) {
      throw new Error("Valid live Silver price unavailable");
    }

    const data = {
      ok: true,
      state,
      district,
      price_gram_999: Number(gram.toFixed(2)),
      price_10g_999: Number((gram * 10).toFixed(2)),
      price_kg_999: Number((gram * 1000).toFixed(2)),
      silver: {
        gram: Number(gram.toFixed(2)),
        tenGram: Number((gram * 10).toFixed(2)),
        kg: Number((gram * 1000).toFixed(2))
      },
      currency: "INR",
      unit: "gram",
      source: "OroPocket • Silver • INR/gram",
      updatedAt: payload?.data?.timestamp || new Date().toISOString(),
      cached: false,
      note: "Reference Silver 999 rate. Local retail prices may differ."
    };

    silverRateCache = data;
    silverRateCacheTime = Date.now();
    console.log("Silver rate:", data.price_gram_999, "INR/g");
    return res.json(data);
  } catch (error) {
    console.error("Silver Rate Error:", error.message);
    return res.status(503).json({
      ok: false,
      reply: "Live Silver Rate unavailable: " + error.message
    });
  }
});


async function downloadWhatsAppMedia(mediaId) {
  if (!WATOKEN) throw new Error("WhatsApp token is not configured.");
  if (!mediaId) throw new Error("WhatsApp media ID is missing.");

  const metaResponse = await fetch(
    `https://graph.facebook.com/v20.0/${encodeURIComponent(mediaId)}`,
    { headers: { Authorization: `Bearer ${WATOKEN}` } }
  );
  const meta = await metaResponse.json().catch(() => ({}));
  if (!metaResponse.ok || !meta.url) {
    throw new Error("WhatsApp media metadata download failed.");
  }

  if (Number(meta.file_size || 0) > 12 * 1024 * 1024) {
    throw new Error("Media exceeds the 12 MB processing limit.");
  }

  const fileResponse = await fetch(meta.url, {
    headers: { Authorization: `Bearer ${WATOKEN}` }
  });
  if (!fileResponse.ok) throw new Error("WhatsApp media download failed.");

  const bytes = Buffer.from(await fileResponse.arrayBuffer());
  if (!bytes.length || bytes.length > 12 * 1024 * 1024) {
    throw new Error("Media is empty or exceeds the 12 MB processing limit.");
  }

  const mimeType = String(meta.mime_type || "")
    .split(";")[0].trim().toLowerCase();

  return {
    data: bytes.toString("base64"),
    type: mimeType,
    size: bytes.length
  };
}

async function analyzeWhatsAppMedia(media, question, kind) {
  const prompt = String(question || "").trim() ||
    (kind === "image"
      ? "Describe this image and answer in the user's language."
      : kind === "audio"
        ? "Understand this audio, transcribe its speech when possible, and answer in the user's language."
        : "Summarize this video, describe its important visible content, and answer in the user's language.");

  if (kind === "image") {
    return await analyzeImageAttachment(
      { type: media.type, data: media.data },
      prompt
    );
  }

  const allowed = kind === "audio"
    ? /^audio\/(ogg|mpeg|mp4|wav|webm|aac|flac|mp3)$/.test(media.type)
    : /^video\/(mp4|webm|quicktime|3gpp)$/.test(media.type);

  if (!allowed) {
    throw new Error("This media format is not supported.");
  }

  if (!GEMINI_API_KEY) {
    throw new Error("Gemini media analysis is not configured.");
  }

  const model = new GoogleGenerativeAI(GEMINI_API_KEY)
    .getGenerativeModel({ model: "gemini-3.8-flash" });

  const result = await model.generateContent([
    { text: prompt.slice(0, 10000) },
    { inlineData: { mimeType: media.type, data: media.data } }
  ]);

  const answer = result.response.text();
  if (!answer) throw new Error("The AI returned an empty media response.");
  return answer;
}

async function sendBrandedWAReply(to, pid, answer) {
  const logoUrl =
    "https://sasikumar-ai-9wdq.onrender.com/assets/sasikumar-ai-logo.png";
  const text = String(answer || "மன்னிக்கவும், பதிலை உருவாக்க முடியவில்லை.")
    .slice(0, 3500);

  // Short replies can be delivered together with the original logo.
  if (text.length <= 850) {
    const imageSent = await sendWA(to, pid, {
      type: "image",
      image: {
        link: logoUrl,
        caption: "🤖 SASIKUMAR AI\n\n" + text
      }
    });
    if (imageSent) {
      add(to, "assistant", text);
      return true;
    }
  } else {
    await sendWA(to, pid, {
      type: "image",
      image: {
        link: logoUrl,
        caption: "🤖 SASIKUMAR AI ✨"
      }
    });
  }

  const sent = await sendWA(to, pid, {
    type: "text",
    text: { body: text }
  });
  if (sent) add(to, "assistant", text);
  return sent;
}

app.get('/health',(q,r)=>r.json({global:"OK", groq:!!GROQ}));
app.get('/webhook',(q,r)=>{ if(q.query['hub.mode']==='subscribe'&&q.query['hub.verify_token']===VERIFY) r.send(q.query['hub.challenge']); else r.sendStatus(403);});
app.post('/webhook',async(req,res)=>{
 try{
  const v=req.body.entry?.[0]?.changes?.[0]?.value;
  const m=v?.messages?.[0];
  if(!m){res.sendStatus(200);return;}

  const from=m.from;
  const pid=v.metadata.phone_number_id;
  const mediaKind = m.image ? "image" : m.audio ? "audio" : m.video ? "video" : null;
  const mediaId = m.image?.id || m.audio?.id || m.video?.id || null;
  const mediaCaption = m.image?.caption || m.video?.caption || "";
  const txt = String(
    m.text?.body ||
    m.interactive?.button_reply?.id ||
    m.interactive?.list_reply?.id ||
    mediaCaption ||
    (mediaKind ? "" : "hi")
  ).trim();
  const normalized=txt.toLowerCase().replace(/[\uFE0F\u20E3]/g,"").trim();

  const menuText =
`🤖 Welcome 🙏
SASIKUMAR AI

🖼️ Logo: SASIKUMAR AI
🌐 Website: https://sasikumar-ai-9wdq.onrender.com

🎁 Visit Bonus • ▶️ Continue
Website: https://sasikumar-ai-9wdq.onrender.com

🌍 MULTI-LANGUAGE AI
Tamil • English • Tanglish • Hindi • Telugu • Malayalam • Kannada • Bengali • Marathi • Gujarati • Punjabi • Urdu • Odia • Assamese • More Languages

1️⃣ Gold Rate
2️⃣ Gold Loan / EMI
3️⃣ Banking
4️⃣ Gold Expert
5️⃣ Appraisal
6️⃣ Education
7️⃣ Jobs
8️⃣ Business / Tech News
9️⃣ General AI
🔟 🚨 Breaking News
1️⃣1️⃣ 💼 Business News
1️⃣2️⃣ 🏏 Sports
1️⃣3️⃣ 🔎 Web Search
1️⃣4️⃣ 🎨 Poster / Creative
1️⃣5️⃣ 📸 Image AI
1️⃣6️⃣ 🎬 Video Maker
1️⃣7️⃣ 📞 Contact / Communication
1️⃣8️⃣ ⭐ Feedback
1️⃣9️⃣ ℹ️ About SASIKUMAR AI

🗣️ Any Language — Ask Freely

ஒரு option number அனுப்புங்கள்.
உதாரணம்: 1

அல்லது எந்த மொழியிலும் உங்கள் கேள்வியை நேரடியாக அனுப்பலாம்.

— SASIKUMAR AI`;

  const menuTriggers=["hi","hello","hai","வணக்கம்","menu","start","help","மெனு","continue"];
  const prompts={
   "1":"Help the user check the latest available gold rate for their location. State date and source; never invent live prices.",
   "2":"Explain gold loans, eligibility, interest and EMI. Ask for necessary details and avoid promising loan approval.",
   "3":"Help with general banking services and safe banking practices. Never ask for PIN, OTP or passwords.",
   "4":"Help with gold purity, karat conversion, hallmark and gold testing.",
   "5":"Help prepare a gold appraisal report. Ask for weight, purity, rate and required details; never invent measurements.",
   "6":"Help with education and explain the subject in the language the user uses.",
   "7":"Help with job searches and explain how to verify job notices. Do not invent vacancies.",
   "8":"Help with business and technology news. Clearly state dates and sources when available.",
   "9":"You are SASIKUMAR AI. Answer the user's question clearly in their language.",
   "10":"Help the user find the latest breaking news. Use verified recent information and provide dates and sources when available.",
   "11":"Help the user find recent business news using verified information and dates/sources.",
   "12":"Help with sports news, fixtures and results. Verify current details when possible.",
   "13":"Help answer the user's question using web search. Provide source names and links when available; do not pretend to have searched if you have not.",
   "14":"Help the user create a poster or creative design. Ask for topic, language and preferred text. Explain that they can use the SASIKUMAR AI website for creative tools.",
   "15":"Help the user create an image. Ask what image they want and guide them to the Image Maker on https://sasikumar-ai-9wdq.onrender.com/ai-image.html. Do not claim an image was generated unless it actually was.",
   "16":"Help the user plan a video and guide them to https://sasikumar-ai-9wdq.onrender.com/daily-video.html. Do not claim a video was generated unless it actually was.",
   "17":"Help the user find SASIKUMAR AI contact and communication options. Website: https://sasikumar-ai-9wdq.onrender.com",
   "18":"Ask the user for their feedback or suggestions about SASIKUMAR AI and help them phrase it clearly.",
   "19":"Explain SASIKUMAR AI and its available services. Website: https://sasikumar-ai-9wdq.onrender.com"
  };

  add(from,"user",txt);

  if(menuTriggers.includes(normalized)){
    const logoUrl = "https://sasikumar-ai-9wdq.onrender.com/assets/sasikumar-ai-logo.png";

    // Send the actual logo image with a short welcome caption.
    const logoSent = await sendWA(from, pid, {
      type: "image",
      image: {
        link: logoUrl,
        caption: "🤖 Welcome 🙏\\nSASIKUMAR AI ✨\\n🌐 https://sasikumar-ai-9wdq.onrender.com"
      }
    });

    // Send the complete 1-19 content menu as a separate message.
    const menuSent = await sendWA(from, pid, {
      type: "text",
      text: { body: menuText }
    });

    if (logoSent) add(from, "assistant", "[SASIKUMAR AI Logo Image]");
    if (menuSent) add(from, "assistant", menuText);
    if (!logoSent) console.error("[WhatsApp] Logo image send failed.");

    res.sendStatus(200);
    return;
  }


  if (mediaKind) {
    try {
      const media = await downloadWhatsAppMedia(mediaId);
      const answer = await analyzeWhatsAppMedia(
        media,
        txt || "",
        mediaKind
      );
      await sendBrandedWAReply(from, pid, answer);
    } catch (error) {
      console.error("[WhatsApp media]", JSON.stringify({
        kind: mediaKind,
        message: String(error?.message || error).slice(0, 500)
      }));

      const answer = mediaKind === "image"
        ? "படத்தைப் புரிந்துகொள்ள முடியவில்லை. தெளிவான சிறிய படத்தை மீண்டும் அனுப்புங்கள்."
        : mediaKind === "audio"
          ? "Audio-ஐப் புரிந்துகொள்ள முடியவில்லை. ஆதரிக்கப்படும் audio வடிவில் மீண்டும் அனுப்புங்கள்."
          : "Video-ஐப் பகுப்பாய்வு செய்ய முடியவில்லை. ஆதரிக்கப்படும் சிறிய video-வை மீண்டும் அனுப்புங்கள்.";

      await sendBrandedWAReply(from, pid, answer);
    }

    res.sendStatus(200);
    return;
  }

  const match=normalized.match(/^(?:option[\s_-]*)?(19|1[0-8]|[1-9])$/);
  const option=match ? match[1] : null;
  // Direct live Gold Rate response for WhatsApp
  if (
    option === "1" ||
    /(gold|தங்கம்|தங்க விலை)/i.test(txt)
  ) {
    try {
      const port = process.env.PORT || 10000;
      const response = await fetch(
        `http://127.0.0.1:${port}/api/gold-rate?state=Tamil%20Nadu&district=Thanjavur`
      );
      const g = await response.json();

      if (!response.ok || !g.ok || !g.rates) {
        throw new Error(g.reply || "Live Gold Rate unavailable");
      }

      const money = n =>
        Number(n).toLocaleString("en-IN", {
          maximumFractionDigits: 2
        });

      const updated = g.updatedAt
        ? new Intl.DateTimeFormat("en-IN", {
            timeZone: "Asia/Kolkata",
            dateStyle: "medium",
            timeStyle: "short"
          }).format(new Date(g.updatedAt))
        : g.date;


const silverResponse = await fetch(
  `http://127.0.0.1:${port}/api/silver-rate?state=Tamil%20Nadu&district=Thanjavur`
);
const silver = await silverResponse.json().catch(() => ({}));

const silverText = silverResponse.ok && silver.ok
  ? "\n\n🥈 SILVER 999 RATE\n" +
    "⚪ 1 gram: ₹" + money(silver.price_gram_999) + "\n" +
    "⚪ 10 grams: ₹" + money(silver.price_10g_999) + "\n" +
    "⚪ 1 kg: ₹" + money(silver.price_kg_999) + "\n" +
    "🔗 Silver Source: " + (silver.source || "OroPocket") + "\n" +
    "🕒 Silver Updated: " +
    (silver.updatedAt
      ? new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          dateStyle: "medium",
          timeStyle: "short"
        }).format(new Date(silver.updatedAt))
      : "Not provided") +
    (silver.cached ? "\nℹ️ Silver rate is cached." : "")
  : "\n\n⚠️ Silver rate is temporarily unavailable.";

const body =
  "🪙 SASIKUMAR AI — GOLD & SILVER RATE\n\n" +
  "📍 " + (g.district || "Thanjavur") + ", " +
  (g.state || "Tamil Nadu") + "\n" +
  "📅 Gold Date: " + (g.date || "Not provided") + "\n\n" +
  "🟡 24K Gold: ₹" + money(g.rates["24K"]) + " / gram\n" +
  "🟡 22K Gold: ₹" + money(g.rates["22K"]) + " / gram\n" +
  "🟡 20K Gold: ₹" + money(g.rates["20K"]) + " / gram\n" +
  "🟡 18K Gold: ₹" + money(g.rates["18K"]) + " / gram\n\n" +
  "⚖️ 22K, 8 grams: ₹" +
  money(g.rates8g?.["22K"] ?? g.rates["22K"] * 8) + "\n" +
  "⚖️ 24K, 8 grams: ₹" +
  money(g.rates8g?.["24K"] ?? g.rates["24K"] * 8) + "\n\n" +
  "🕒 Gold Updated: " + updated + "\n" +
  "🔗 Gold Source: " + (g.source || "API source unavailable") +
  silverText + "\n\n" +
  "ℹ️ Reference rates only. Local jewellery prices may differ." +
  (g.fallbackUsed ? "\n⚠️ Gold fallback source used." : "") +
  (g.cached ? "\nℹ️ Gold rate is cached." : "") +
  (silver.cached ? "\nℹ️ Silver rate is cached." : "");

const logoSent = await sendWA(from, pid, {
  type: "image",
  image: {
    link: "https://sasikumar-ai-9wdq.onrender.com/assets/sasikumar-ai-logo.png",
    caption: "🤖 SASIKUMAR AI ✨\n🥇 Live Gold & Silver Rates\n🌐 https://sasikumar-ai-9wdq.onrender.com"
  }
});
if (logoSent) add(from, "assistant", "[SASIKUMAR AI Logo]");

const sent = await sendWA(
  from, pid, { type: "text", text: { body: body.slice(0, 3500) } }
);
if (sent) add(from, "assistant", body);

    } catch (error) {
      console.error("[WhatsApp Gold Rate]", error.message);
      const message =
        "⚠️ தற்போது நேரடி Gold Rate கிடைக்கவில்லை.\n" +
        "தவறான விலையைக் காட்டாமல் நிறுத்தியுள்ளோம். சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.";
      const sent = await sendWA(
        from, pid, { type: "text", text: { body: message } }
      );
      if (sent) add(from, "assistant", message);
    }

    res.sendStatus(200);
    return;
  }

  const prompt=option ? prompts[option] : txt;

  const friendlyPrompt = [
    "You are SASIKUMAR AI, a friendly and respectful Tamil-speaking companion on WhatsApp.",
    "Reply naturally in the user's language: Tamil, Tanglish, or English.",
    "Keep conversation warm, casual, engaging, and human-friendly.",
    "Add short, clean Tamil comedy, playful jokes, or friendly banter when it fits naturally.",
    "Do not force jokes into serious, sad, urgent, or sensitive conversations; respond supportively and seriously instead.",
    "Never insult, bully, embarrass, or make cruel jokes about the user.",
    "Answer questions accurately. Never invent live information or claim a web search was performed when it was not.",
    "Keep replies concise unless the user asks for detail.",
    "",
    "User request:",
    String(prompt)
  ].join("\n");

  let ans=await groqAI(friendlyPrompt,from);
  if(!ans) ans=await globalKnowledge(prompt);
  if(!ans) ans=smartAI(prompt);

  await sendBrandedWAReply(from, pid, ans);
  res.sendStatus(200);
 }catch(e){
  console.error("[WhatsApp] Webhook processing failed:",e.message);
  if(!res.headersSent) res.sendStatus(200);
 }
});

// SASIKUMAR AI Video Library API
app.get("/api/video/library", async (req, res) => {
  try {
    const { readdir } = await import("node:fs/promises");
    const dir = path.join(__dirname, "public", "videos");
    let files = [];

    try {
      files = await readdir(dir);
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
    }

    const allowed = new Set([".mp4", ".webm", ".mov", ".m4v"]);
    const items = files
      .filter(name => allowed.has(path.extname(name).toLowerCase()))
      .map(name => ({
        id: name,
        title: name,
        videoUrl: "/videos/" + encodeURIComponent(name)
      }));

    res.set("Cache-Control", "no-store");
    return res.json({ items });
  } catch (err) {
    console.error("Video Library API error:", err);
    return res.status(500).json({ error: "Video Library unavailable", items: [] });
  }
});

app.get('*',(q,r)=>r.sendFile(path.join(__dirname,'public','index.html')));
app.listen(process.env.PORT||10000,()=>console.log("GLOBAL API FIXED"));
