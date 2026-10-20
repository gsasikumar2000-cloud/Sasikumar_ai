import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 10000;

const jobDbPool = process.env.DATABASE_URL
  ? new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000
    })
  : null;

app.use(express.json({limit:'16mb'}));
app.use((req,res,next)=>{
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.sendStatus(200);
  next();
});
const publicPath = path.join(__dirname,'public');
const WA_TOKEN = process.env.WHATSAPP_TOKEN || '';
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID || process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WA_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'sasikumar_ai_verify_2026';

const WELCOME_MENU = `🤖 SASIKUMAR AI — MAIN MENU

🌐 Website: https://sasikumar-ai-9wdq.onrender.com

1. 🤖 SASIKUMAR AI — AI Assistant
2. 🪙 Live Gold & Silver Rate
3. 🧮 Gold Loan / EMI Calculator
4. 🏦 Banking Services
5. 💎 Gold Expert
6. 📋 Gold Appraisal
7. 🎓 Education
8. 💼 Jobs & Careers
9. 💻 Business & Technology News
10. 📰 Breaking News
11. 🧠 General AI Chat
12. 🎨 Poster & Creative Design
13. 🖼️ AI Image Maker
14. 🎬 Video Maker
15. 🔍 Global Web Search
16. 🏏 Sports Updates
17. 📖 Daily Thirukkural
18. 📝 Tamil Kavithai
19. 🌹 Ponmozhigal
20. 💡 Thathuvam
21. 🔥 Motivation
22. 🌍 Leadership History
23. 🎧 Audio & Video Songs Hub
24. 📻 Live FM Radio
25. ✂️ Audio / Video Song Cutter
26. 📱 Mobile App Download
27. 🚀 Business Ideas
28. 🛠️ AI Tools
29. 🌐 Website Services
30. 📞 Contact & Customer Feedback
31. 📚 ALL CONTENT — Complete Services & Details
32. 🎭 Tamil Comedy & Movie Fun
33. 🌾 Agriculture — விவசாய உதவியாளர்

0. 🏠 Main Menu

Any language-la unga question-ai type pannalaam.
Option number anuppi service select pannunga.

— SASIKUMAR AI`;

const MENU_REPLIES = {
  '1': () => `🤖 AI ASSISTANT — ASK ANYTHING!

🙏 Vanakkam Nanbare! 😊

💬 Ask your questions directly in:
தமிழ் • Tanglish • English • हिंदी
and other languages.

🧠 HOW I CAN HELP YOU

📚 Education
Lessons, exam preparation, maths and explanations.

✍️ Writing & Translation
Letters, messages, summaries and translations.

💻 Technology & Coding
Computer help, programming and website guidance.

💼 Jobs & Career
Resume preparation, interview practice and career guidance.

🌍 General Knowledge
Science, everyday questions and useful information.

💡 Ideas & Creativity
Content ideas, writing assistance and brainstorming.

📝 Type your question directly in WhatsApp.
I'll try to provide a clear and helpful answer.

🌐 SASIKUMAR AI Website:
https://sasikumar-ai-9wdq.onrender.com

🔙 Type 0 for Main Menu`,
  '2': () => `🪙 LIVE GOLD & SILVER RATE
📍 Tamil Nadu • Thanjavur

🟡 LIVE GOLD RATE — PER GRAM
24K (999): Check live API
22K (916): Check live API
20K: Check live API
19K: Check live API
18K (750): Check live API

⚪ LIVE SILVER 999 RATE
1 gram: Check live API
8 grams: Check live API
10 grams: Check live API
1 kilogram: Check live API

🔄 Live API links:
Gold: https://sasikumar-ai-9wdq.onrender.com/api/gold-rate?state=Tamil%20Nadu&district=Thanjavur
Silver: https://sasikumar-ai-9wdq.onrender.com/api/silver-rate?state=Tamil%20Nadu&district=Thanjavur

🌐 Website: https://sasikumar-ai-9wdq.onrender.com/gold-silver.html

⚠️ WhatsApp menu provides API links for verified current rates. Prices can change; local jewellery rates may differ due to GST, making charges and other costs.

🔙 Type 0 for Main Menu`,
  '3': () => `🟡 GOLD LOAN • 🧮 LOAN CALCULATIONS

GOLD LOAN — தங்கக் கடன்
• தங்கத்தின் எடை மற்றும் தூய்மை அடிப்படையில் மதிப்பீடு.
• 18K / 20K / 22K / 24K தங்க விவரங்களை அனுப்பலாம்.
• உண்மையான கடன் தொகை வங்கி/NBFC விதிமுறைகள் மற்றும் நகை மதிப்பீட்டைப் பொறுத்தது.
• தங்கக் கடன் பெறுவதை உறுதி செய்யும் வாக்குறுதி அல்ல.

EMI CALCULATOR
இந்த வடிவத்தில் அனுப்புங்கள்:
EMI 100000 12 12

இதன் பொருள்:
கடன் தொகை ₹1,00,000 • வருட வட்டி 12% • காலம் 12 மாதங்கள்.

உங்கள் தொகை, வருட வட்டி %, மாதங்கள் ஆகியவற்றை மாற்றி அனுப்பலாம்.
உதாரணம்: EMI 50000 10.5 24

🌐 Calculator: https://sasikumar-ai-9wdq.onrender.com/loan-calculator.html
🔙 Type 0 for Main Menu`,
  '4': () => `🏦 SASIKUMAR AI — BANKING SERVICES

1️⃣ BANK ACCOUNT
• Savings Account / Current Account
• Zero-Balance Account பற்றிய வழிகாட்டுதல்
• கணக்கு திறப்பதற்கான ஆவணங்கள்

2️⃣ ATM / DEBIT CARD
• ATM மற்றும் Debit Card பயன்பாடு
• PIN பாதுகாப்பு மற்றும் Card Block வழிகாட்டுதல்

3️⃣ BANK LOANS
• Personal Loan / Home Loan
• Education Loan / Business Loan
• Gold Loan பற்றிய வழிகாட்டுதல்

4️⃣ EMI CALCULATOR
• கடன் தொகை, வருட வட்டி, மாதங்கள் கொடுத்து EMI கணக்கிடலாம்.
• உதாரணம்: EMI 100000 12 12

5️⃣ FD / RD
• Fixed Deposit மற்றும் Recurring Deposit விவரங்கள்
• வட்டி மற்றும் முதிர்வுத் தொகை பற்றிய வழிகாட்டுதல்

6️⃣ UPI / INTERNET BANKING
• UPI, Mobile Banking, Net Banking
• பாதுகாப்பான டிஜிட்டல் பணப்பரிவர்த்தனை

7️⃣ KYC
• அடையாளம் மற்றும் முகவரிச் சான்றுகள் பற்றிய தகவல்
• தேவையான ஆவணங்களை வங்கியிடம் உறுதிப்படுத்தவும்.

8️⃣ BANK COMPLAINT SUPPORT
• வங்கியில் புகார் அளிக்கும் வழிமுறை
• தீர்வு கிடைக்காவிட்டால் RBI அதிகாரப்பூர்வ வழிகாட்டுதலைப் பார்க்கவும்.

🔐 OTP, UPI PIN, ATM PIN, Password ஆகியவற்றை யாரிடமும் பகிர வேண்டாம்.
⚠️ வட்டி, கட்டணம், தகுதி ஆகியவை வங்கி விதிமுறைகளைப் பொறுத்தவை.
🌐 Website: https://sasikumar-ai-9wdq.onrender.com
🔙 Type 0 for Main Menu`,
  '5': () => `💎 SASIKUMAR AI — GOLD EXPERT

🟡 GOLD PURITY
• 24K = 999 fineness (சுமார் 99.9% தங்கம்)
• 22K = 916 fineness (சுமார் 91.6% தங்கம்)
• 20K = 833 fineness (சுமார் 83.3% தங்கம்)
• 18K = 750 fineness (75% தங்கம்)

💎 BIS HALLMARK & HUID
• BIS Hallmark மற்றும் HUID குறியீட்டைச் சரிபார்க்கவும்.
• HUID-ஐ BIS Care செயலியில் சரிபார்க்கவும்.
• Hallmark மட்டும் பார்த்து வாங்காமல், bill-ல் purity மற்றும் net weight உள்ளதா பார்க்கவும்.

⚖️ GOLD WEIGHT
• Gross weight = நகையின் மொத்த எடை.
• Net gold weight = கற்கள் மற்றும் பிற பொருட்களின் எடையை நீக்கிய தங்க எடை.
• கற்கள் உள்ள நகைகளில் net gold weight-ஐ விற்பனையாளரிடம் உறுதிப்படுத்தவும்.

🧮 GOLD VALUE ESTIMATE
• தங்க மதிப்பீடு = நிகர தங்க எடை × அந்த purity-க்கான ஒரு கிராம் விலை.
• Making charges, wastage, GST மற்றும் கடை விதிமுறைகள் கூடுதல் செலவாக இருக்கலாம்.
• இது வழிகாட்டும் கணக்கீடு மட்டுமே; உறுதியான வாங்கல்/விற்பனை விலை அல்ல.

🏦 GOLD LOAN
• கடன் தொகை தங்கத்தின் நிகர எடை, தூய்மை மற்றும் கடன் வழங்குநரின் விதிமுறைகளைப் பொறுத்தது.
• வட்டி, கட்டணம் மற்றும் திருப்பிச் செலுத்தும் நிபந்தனைகளை எழுத்தில் உறுதிப்படுத்தவும்.

⚠️ முக்கியம்
• சந்தேகம் இருந்தால் அங்கீகரிக்கப்பட்ட மையத்தில் தங்கத்தின் தூய்மையைச் சோதிக்கவும்.
• உண்மையான மதிப்பு மற்றும் தற்போதைய விலையை நகைக்கடை/கடன் வழங்குநரிடம் உறுதிப்படுத்தவும்.

🌐 Website: https://sasikumar-ai-9wdq.onrender.com/gold-silver.html
🔙 Type 0 for Main Menu`,
  '6': () => `🤖 SASIKUMAR AI
💎 GOLD APPRAISAL & TESTING GUIDE

⚖️ 1. GOLD PURITY — FINENESS
• 24K: 999 — approximately 99.9%
• 22K: 916 — approximately 91.6%
• 20K: 833 — approximately 83.3%
• 18K: 750 — approximately 75.0%
• 14K: 585 — approximately 58.5%

🧪 2. ACID TEST — COLOUR GUIDE
• Test-stone streak colour and its reaction depend on the acid and test method.
• Streak remains: the sample may resist that particular test solution.
• Streak fades or disappears: the metal may react with the solution.
• Colour alone cannot confirm gold karat or purity.
⚠️ Gold-testing acids are corrosive. Use appropriate professional safety precautions.

🧂 3. COMMON SALT TEST
• Ordinary salt (NaCl) alone cannot reliably determine gold purity.
• A colour change is not proof of 24K, 22K or 18K gold.
• Do not assign a karat based on salt colour.

⚖️ 4. DENSITY TEST
• Pure gold density: approximately 19.32 g/cm³.
• Jewellery alloys, stones, hollow parts and internal metals can affect results.
• Density is an estimate, not final proof of purity.

📋 5. APPRAISAL REPORT
Weight • Purity • Estimated value • Testing guidance
For an estimate, send weight in grams, known purity and the current gold rate.

🌐 SASIKUMAR AI Website:
https://sasikumar-ai-9wdq.onrender.com

⚠️ AI guidance is an estimate, not a final certificate. Professional testing is required for confirmation.
🔙 Type 0 for Main Menu`,
  '7': () => `🤖 SASIKUMAR AI
🎓 EDUCATION & AI STUDY ASSISTANT

📚 COURSES
School • Diploma • UG • PG • Engineering • Science

🤖 AI QUESTIONS & ANSWERS
Send your educational questions to AI.
Get simple explanations and study guidance.

🌐 AI WEB RESEARCH
Send research questions to AI for help exploring topics, finding information and understanding results.
Verify important facts with reliable sources.

🧮 AI MATHS SOLVER
Maths problems, equations and step-by-step explanations.

📝 AI EXAM PREPARATION
Practice questions, revision and study guidance.

🎓 SCHOLARSHIPS
Scholarship information and eligibility guidance.

💼 CAREER GUIDANCE
Courses, higher studies and career options.

🌐 EDUCATION Q&A PAGE
https://sasikumar-ai-9wdq.onrender.com/education/qa.html

📐 MATHS & EQUATIONS
https://sasikumar-ai-9wdq.onrender.com/education/equations.html

🏠 MAIN WEBSITE
https://sasikumar-ai-9wdq.onrender.com

⚠️ Verify admissions, exam dates and scholarship details with official authorities.
🔙 Type 0 for Main Menu`,
  '8': () => `🤖 SASIKUMAR AI
💼 JOBS & CAREERS

🔎 JOB SEARCH & CAREER GUIDANCE
Resume • Interview preparation • Career options

📝 JOB SEEKER REGISTRATION
https://sasikumar-ai-9wdq.onrender.com/jobs/register.html

🏢 EMPLOYER REGISTRATION
https://sasikumar-ai-9wdq.onrender.com/jobs/employer.html

🇮🇳 OFFICIAL GOVERNMENT JOB WEBSITES

1. 🇮🇳 National Career Service (NCS)
https://www.ncs.gov.in/

2. 🏛️ Tamil Nadu PSC (TNPSC)
https://www.tnpsc.gov.in/

3. 👮 Tamil Nadu Uniformed Services Recruitment Board (TNUSRB)
https://www.tnusrb.tn.gov.in/

4. 🚆 Railway Recruitment Boards (RRB)
https://www.rrbcdg.gov.in/

5. 📝 Staff Selection Commission (SSC)
https://ssc.gov.in/

6. 🎓 Union Public Service Commission (UPSC)
https://upsc.gov.in/

7. 🏦 Institute of Banking Personnel Selection (IBPS)
https://www.ibps.in/

8. 📮 India Post
https://www.indiapost.gov.in/

🌐 ALL JOBS & CAREERS
https://sasikumar-ai-9wdq.onrender.com/jobs/index.html

⚠️ SAFETY NOTICE
• Check the official recruitment notification before applying.
• Verify qualification, age limit, application deadline and fees.
• Never pay unofficial agents or trust guaranteed-job promises.
• Vacancy availability changes; these links do not guarantee a job.

🔙 Type 0 for Main Menu`,
  '9': () => `🤖 SASIKUMAR AI
📰 BUSINESS, TECHNOLOGY & LIVE NEWS

🗞️ NEWS CATEGORIES
🇮🇳 Tamil Nadu News
🇮🇳 India National News
🌍 World News
💼 Business & Economy
💻 Technology, Science & AI
🏏 Sports News

🌐 LIVE TAMIL NEWS
https://sasikumar-ai-9wdq.onrender.com/live-news.html

🔎 NEWS & RESEARCH
Send a news topic, location or subject.
Verify current details with reliable sources.

⚠️ NEWS NOTICE
News availability and update times may vary.
Cross-check important information with reliable sources.

🔙 Type 0 for Main Menu`,
  '10': () => `📰 BREAKING NEWS
Tamil breaking news updates-kku request pannunga.
Type 0 for Main Menu`,
  '11': () => `🤖 SASIKUMAR AI
🧠 A TO Z GENERAL AI — QUESTIONS & ANSWERS

📚 EDUCATION & LEARNING
School, College, Diploma, UG, PG and exam preparation.

🔬 SCIENCE & TECHNOLOGY
Science, physics, chemistry, biology and technology.

➗ MATHS & PROBLEM SOLVING
Calculations, equations and step-by-step explanations.

💻 CODING & PROGRAMMING
HTML, CSS, JavaScript, Python, debugging and project guidance.

✍️ WRITING & LANGUAGES
Essays, letters, grammar, translation and summaries.

🌍 GENERAL KNOWLEDGE & RESEARCH
History, geography, concepts, research and explanations.

💼 BUSINESS & FINANCE EDUCATION
Business ideas, budgeting and financial concepts.

🎨 CREATIVITY & DAILY HELP
Ideas, planning, productivity and creative writing.

🌐 MULTILINGUAL AI
Ask questions in Tamil, English or other supported languages.

💬 HOW TO USE
Type your question directly in this WhatsApp chat.
Ask follow-up questions to understand the answer.

⚠️ Important information should be verified with reliable sources.
AI answers may contain errors.

🔙 Type 0 for Main Menu`,
  '12': () => `🎨 POSTER & CREATIVE DESIGN
Festival posters, business posters and creative design ideas.
Website: https://sasikumar-ai-9wdq.onrender.com
Type 0 for Main Menu`,
  '13': () => `🖼️ AI IMAGE MAKER
Image creation ideas and prompts.
https://sasikumar-ai-9wdq.onrender.com/ai-image.html
Type 0 for Main Menu`,
  '14': () => `🎬 VIDEO MAKER
Video creation and promotional video guidance.
https://sasikumar-ai-9wdq.onrender.com/ai-video.html
Type 0 for Main Menu`,
  '15': () => `🤖 SASIKUMAR AI
🌐 GLOBAL WEB SEARCH & RESEARCH

🔎 WEB SEARCH
Ask a topic or question to search for relevant online information.

📰 CURRENT INFORMATION
Research recent developments, news and public information.

🎓 EDUCATION & RESEARCH
Explore concepts, study topics and research questions.

💻 TECHNOLOGY & AI
Research programming, software, science and AI topics.

💼 BUSINESS & MARKET RESEARCH
Explore companies, products, industries and business trends.

📚 FACT-CHECKING
Compare information from multiple reliable sources when available.

🔗 SOURCES & LINKS
Review available source links and publication dates.

💬 HOW TO USE
Send your search query directly in this WhatsApp chat.
Be specific about the topic, location or date.

⚠️ Search results may be incomplete or outdated.
Verify important facts using official and reliable sources.

🔙 Type 0 for Main Menu`,
  '16': () => `🤖 SASIKUMAR AI
🏆 A–Z SPORTS UPDATES

🌐 SPORTS HUB
https://sasikumar-ai-9wdq.onrender.com/sports/

🎮 SPORTS GAMES
https://sasikumar-ai-9wdq.onrender.com/sports/games/


🏏 CRICKET
Live scores, fixtures, results, tournaments and statistics.

⚽ FOOTBALL
Match scores, leagues, fixtures and results.

🏸 BADMINTON & 🎾 TENNIS
Matches, tournaments, results and rankings.

🏀 BASKETBALL & 🏐 VOLLEYBALL
Fixtures, scores and match results.

🥇 OLYMPICS & INTERNATIONAL SPORTS
Major tournaments and international competitions.

🇮🇳 INDIAN SPORTS
Indian teams, national competitions and athlete updates.

📅 MATCH SCHEDULES
Upcoming matches, dates and tournament information.

🏆 RANKINGS & STATISTICS
Points tables, team standings and player statistics.

🔴 LIVE SCORE UPDATES
Ask for a sport, team, tournament or match.
Live information depends on available data sources.

🔗 OFFICIAL SOURCES
Check official league and tournament websites for confirmed results.

⚠️ Scores and schedules may change.
Verify important updates with official sources.

🔙 Type 0 for Main Menu`,
  '17': () => `🤖 SASIKUMAR AI
📖 DAILY THIRUKKURAL — திருக்குறள்

🌟 தினமும் திருக்குறள் கற்கலாம்!
• குறள் மற்றும் குறள் எண்
• எளிய தமிழ் விளக்கம்
• English meaning
• வாழ்க்கைப் பாடம்

🌐 THIRUKKURAL PAGE
https://sasikumar-ai-9wdq.onrender.com/thirukkural.html

🔢 குறள் எண் மூலம் தேட புதிய பக்கத்தைத் திறக்கவும்.
குறிப்பு: தற்போது 1–5 குறள்களின் விவரங்கள் மட்டும் பக்கத்தில் உள்ளன.

🔙 Type 0 for Main Menu`,
  '18': () => `🤖 SASIKUMAR AI
📝 TAMIL KAVITHAI — கவிதை உலகம்

❤️ காதல் கவிதைகள்
🤝 நட்புக் கவிதைகள்
💔 சோகக் கவிதைகள்
👩 அம்மா கவிதைகள்
👨 அப்பா கவிதைகள்
🌹 வாழ்க்கைக் கவிதைகள்
💪 தன்னம்பிக்கைக் கவிதைகள்
🎂 பிறந்தநாள் வாழ்த்துக் கவிதைகள்
🌧️ இயற்கை மற்றும் மழைக் கவிதைகள்
💐 திருமண வாழ்த்துக் கவிதைகள்
🎓 மாணவர் கவிதைகள்

🔎 கவிதைகளைத் தேடவும்.
📋 கவிதைகளை Copy செய்யவும்.
📤 நண்பர்களுடன் Share செய்யவும்.

🌐 முழு கவிதைப் பக்கம்:
https://sasikumar-ai-9wdq.onrender.com/kavithai.html

🏠 Home: https://sasikumar-ai-9wdq.onrender.com/
Type 0 for Main Menu`,
  '19': () => `🤖 SASIKUMAR AI
🌹 TAMIL PONMOZHIGAL — தமிழ் பொன்மொழிகள்

💎 பொன்மொழி 1:
"முயற்சி திருவினையாக்கும்."
📖 அர்த்தம்: தொடர்ந்து முயற்சி செய்தால் வெற்றியை அடையலாம்.

💎 பொன்மொழி 2:
"ஒற்றுமையே பலம்."
📖 அர்த்தம்: ஒன்றிணைந்து செயல்பட்டால் வலிமையும் வெற்றியும் கிடைக்கும்.

💎 பொன்மொழி 3:
"கற்றது கைமண் அளவு; கல்லாதது உலகளவு."
📖 அர்த்தம்: நாம் கற்றவை குறைவு; இன்னும் கற்க வேண்டியவை அதிகம்.

💎 பொன்மொழி 4:
"பொறுமை கடலினும் பெரிது."
📖 அர்த்தம்: பொறுமையுடன் செயல்பட்டால் சிக்கல்களைச் சமாளிக்கலாம்.

💎 பொன்மொழி 5:
"நல்ல எண்ணங்கள் நல்ல செயல்களுக்கு வழிகாட்டும்."
📖 அர்த்தம்: நல்ல சிந்தனை நமது செயல்களையும் வாழ்க்கையையும் மேம்படுத்தும்.

🌐 மேலும் படிக்க:
https://sasikumar-ai-9wdq.onrender.com/

🏠 Home: https://sasikumar-ai-9wdq.onrender.com/
Type 0 for Main Menu`,
  '20': () => `🤖 SASIKUMAR AI
💡 தமிழ் தத்துவங்கள் — THATHUVAM

📖 ஒவ்வொரு அறிஞரையும் திறக்கவும்:

1. திருவள்ளுவர்
https://sasikumar-ai-9wdq.onrender.com/thathuvam.html#thiruvalluvar

2. புத்தர்
https://sasikumar-ai-9wdq.onrender.com/thathuvam.html#buddha

3. சுவாமி விவேகானந்தர்
https://sasikumar-ai-9wdq.onrender.com/thathuvam.html#vivekananda

4. மகாத்மா காந்தி
https://sasikumar-ai-9wdq.onrender.com/thathuvam.html#gandhi

5. அப்துல் கலாம்
https://sasikumar-ai-9wdq.onrender.com/thathuvam.html#abdul-kalam

6. டாக்டர் பி.ஆர். அம்பேத்கர்
https://sasikumar-ai-9wdq.onrender.com/thathuvam.html#ambedkar

7. அவ்வையார்
https://sasikumar-ai-9wdq.onrender.com/thathuvam.html#avvaiyar

8. சாக்ரடீஸ்
https://sasikumar-ai-9wdq.onrender.com/thathuvam.html#socrates

9. நெல்சன் மண்டேலா
https://sasikumar-ai-9wdq.onrender.com/thathuvam.html#mandela

10. ஆல்பர்ட் ஐன்ஸ்டீன்
https://sasikumar-ai-9wdq.onrender.com/thathuvam.html#einstein

11. கன்பூசியஸ்
https://sasikumar-ai-9wdq.onrender.com/thathuvam.html#confucius

🏠 Home:
https://sasikumar-ai-9wdq.onrender.com/

Type 0 for Main Menu`,
  '21': () => `🤖 SASIKUMAR AI
🌟 DAILY MOTIVATION | தினசரி ஊக்கம்

💪 இன்றைய ஊக்கச் செய்தி:
இன்று நீங்கள் எடுக்கும் சிறிய முயற்சிதான் நாளைய பெரிய வெற்றிக்கு அடித்தளம்!

🌱 தோல்வியைக் கண்டு பயப்படாதீர்கள். ஒவ்வொரு தோல்வியும் ஒரு புதிய பாடத்தைக் கற்றுத் தருகிறது.

🎯 தினமும் புதிதாகக் கற்றுக்கொள்ளுங்கள்.
⏰ நேரத்தைப் பயனுள்ளதாகப் பயன்படுத்துங்கள்.
🔥 உங்கள் திறமையை நம்புங்கள்; முயற்சியைத் தொடருங்கள்.

🇬🇧 MOTIVATION IN ENGLISH
“Small steps every day lead to big achievements.”
Believe in yourself. Learn from mistakes. Stay focused and keep improving.

🌞 TODAY'S CHALLENGE:
இன்று உங்கள் இலக்கை நோக்கி ஒரு சிறிய செயலையாவது செய்து முடிக்கவும்!

🌐 https://sasikumar-ai-9wdq.onrender.com
Type 0 for Main Menu`,
  '22': () => `🌍 LEADERSHIP HISTORY
Indian and world leaders history patri kelunga.
https://sasikumar-ai-9wdq.onrender.com/indian-leadership.html
Type 0 for Main Menu`,
  '23': () => `🎧 AUDIO & VIDEO SONGS HUB
Audio/video hub:
https://sasikumar-ai-9wdq.onrender.com/audio-video-hub.html
Type 0 for Main Menu`,
  '24': () => `📻 LIVE FM RADIO
FM radio hub:
https://sasikumar-ai-9wdq.onrender.com/audio-video-hub.html
Type 0 for Main Menu`,
  '25': () => `✂️ AUDIO / VIDEO SONG CUTTER
Audio cutter tools:
https://sasikumar-ai-9wdq.onrender.com/audio-video-hub.html
Type 0 for Main Menu`,
  '26': () => `📱 SASIKUMAR AI — ANDROID APP

⬇️ DOWNLOAD APK:
https://sasikumar-ai-9wdq.onrender.com/downloads/sasikumar-ai.apk

🌐 OFFICIAL WEBSITE:
https://sasikumar-ai-9wdq.onrender.com

📦 App: SASIKUMAR AI
📱 Android App Download
⚠️ Install the APK only if you trust this app and its source.

Type 0 for Main Menu`,
  '27': () => `🚀 BUSINESS & STARTUP SERVICES
🚀 வணிகம் மற்றும் தொடக்கநிறுவன சேவைகள்

💼 GROW YOUR BUSINESS WITH US
💼 எங்களுடன் உங்கள் வணிகத்தை வளர்த்திடுங்கள்

1️⃣ Business & Startup Guidance
வணிகம் மற்றும் தொடக்கநிறுவன வழிகாட்டுதல்

2️⃣ Retail Marketing
சில்லறை விற்பனை சந்தைப்படுத்தல்

3️⃣ Pay2All Services
Pay2All சேவைகள்

4️⃣ Affiliate Marketing
இணைப்பு சந்தைப்படுத்தல்

5️⃣ Referral Business
பரிந்துரை வணிகம்

6️⃣ FMCG Agency Services
FMCG முகவர் சேவைகள்

7️⃣ Business Consulting
வணிக ஆலோசனை

8️⃣ Communication Services
தொடர்பு சேவைகள்

9️⃣ Email Support
மின்னஞ்சல் ஆதரவு

📱 CONTACT US
☎️ 98944 40400

📧 EMAIL
✉️ gsasikumar2000@gmail.com

🌐 OFFICIAL WEBSITE
https://sasikumar-ai-9wdq.onrender.com

💡 Start • Connect • Market • Grow!
💡 தொடங்குங்கள் • இணைந்திடுங்கள் • சந்தைப்படுத்துங்கள் • வளருங்கள்!

📩 மேலும் விவரங்களுக்கு எங்களைத் தொடர்புகொள்ளுங்கள்.

Type 0 for Main Menu`,
  '28': () => `🛠️ SASIKUMAR AI — AI TOOLS
🤖 செயற்கை நுண்ணறிவு கருவிகள்

1️⃣ AI Chat & Assistant
🤖 கேள்விகளுக்குப் பதில் மற்றும் AI உதவியாளர்

2️⃣ AI Writing & Content Creation
✍️ கட்டுரைகள், கடிதங்கள் மற்றும் உள்ளடக்கம் உருவாக்குதல்

3️⃣ AI Image & Poster Creator
🎨 படங்கள், போஸ்டர்கள் மற்றும் விளம்பர வடிவமைப்பு

4️⃣ AI Video Maker
🎬 வீடியோ உருவாக்கும் வழிகாட்டுதல்

5️⃣ AI Web Search
🌐 இணையத் தேடல் மற்றும் தகவல் அறிதல்

6️⃣ Document & PDF Assistant
📄 ஆவணங்கள் மற்றும் PDF உதவி

7️⃣ Voice Assistant
🎙️ குரல் வழி உதவி

8️⃣ Website & Code Creator
💻 இணையதளம் மற்றும் நிரலாக்க உதவி

9️⃣ Education & Learning Tools
📚 கல்வி மற்றும் கற்றல் உதவி

🔟 AI Productivity Tools
⚡ வேலைத்திறன் மற்றும் நேர மேலாண்மை உதவி

💡 மேலே உள்ள AI கருவிகளை SASIKUMAR AI இணையதளத்தில் பயன்படுத்துங்கள்:
🌐 https://sasikumar-ai-9wdq.onrender.com

📩 மேலும் உதவி தேவைப்பட்டால் உங்கள் கேள்வியை அனுப்புங்கள்.

Type 0 for Main Menu`,
  '29': () => `🌐 SASIKUMAR AI — WEBSITE SERVICES
🌐 இணையதள சேவைகள்

1️⃣ Website Design
🎨 இணையதள வடிவமைப்பு

2️⃣ Website Development
💻 இணையதளம் உருவாக்குதல்

3️⃣ Mobile-Friendly Websites
📱 மொபைலுக்கு ஏற்ற இணையதளங்கள்

4️⃣ Business Websites
🏢 வணிக இணையதளங்கள்

5️⃣ Landing Pages
📄 விளம்பர மற்றும் தயாரிப்பு பக்கங்கள்

6️⃣ Website Content & Updates
✍️ இணையதள உள்ளடக்கம் மற்றும் புதுப்பிப்புகள்

7️⃣ Website Maintenance Guidance
🛠️ இணையதள பராமரிப்பு வழிகாட்டுதல்

8️⃣ AI Website Creation
🤖 AI உதவியுடன் இணையதளம் உருவாக்கும் வழிகாட்டுதல்

🌐 SASIKUMAR AI Website:
https://sasikumar-ai-9wdq.onrender.com

📩 Website சேவை தொடர்பான உங்கள் தேவையை செய்தியாக அனுப்புங்கள்.

Type 0 for Main Menu`,
  '30': () => `📞 CONTACT & CUSTOMER FEEDBACK
Contact: https://sasikumar-ai-9wdq.onrender.com/communication.html
Feedback: https://sasikumar-ai-9wdq.onrender.com/customer-feedback.html
Type 0 for Main Menu`,
  '31': () => `📚 ALL CONTENT — COMPLETE SERVICES
SASIKUMAR AI menu options 1–32 cover AI chat, Gold/Silver, loan/EMI, banking, appraisal, education, jobs, news, creative tools, search, sports, Tamil content, audio/video, business ideas and website services.
Website: https://sasikumar-ai-9wdq.onrender.com/all-menus.html
Type 0 for Main Menu`,
  '32': () => `😂 SASIKUMAR AI — TAMIL COMEDY & MOVIE FUN

🎭 தமிழ் காமெடி — பழைய மற்றும் புதிய திரைப்படங்கள்
🎬 திரைப்படங்கள் • நடிகர்கள் • காமெடி காட்சிகள்
💬 பஞ்ச் • காதல் • நட்பு • மாஸ் வசனங்கள்

🔎 Movie & Dialogue Search:
https://sasikumar-ai-9wdq.onrender.com/tamil-comedy.html

✍️ உங்கள் சொந்த புதிய வசனத்தை உருவாக்கவும்!
📺 YouTube திரைப்படத் தேடலும் இதில் உள்ளது.

📻 Audio & Video Hub:
https://sasikumar-ai-9wdq.onrender.com/audio-video-hub.html

🌐 SASIKUMAR AI:
https://sasikumar-ai-9wdq.onrender.com

Type 0 for Main Menu`,

  '33': () => `🤖 SASIKUMAR AI
🌾 AGRICULTURE — விவசாய உதவியாளர்

🌱 பயிர் சாகுபடி
🌿 மண் வளம் மற்றும் உரங்கள்
🐛 பூச்சி மற்றும் நோய் மேலாண்மை
💧 நீர்ப்பாசன வழிகாட்டுதல்
🌦️ வானிலைத் தகவல்கள்
💰 விவசாயச் சந்தை விலைகள்
🏛️ அரசு விவசாயத் திட்டங்கள்
🐄 கால்நடை வளர்ப்பு
🤖 AI விவசாய வழிகாட்டுதல்

🌐 Agriculture Page:
https://sasikumar-ai-9wdq.onrender.com/agriculture.html

Type 0 for Main Menu`
};
async function getLiveGoldSilverWhatsAppReply() {
  const goldUrl = 'https://sasikumar-ai-9wdq.onrender.com/api/gold-rate?state=Tamil%20Nadu&district=Thanjavur';
  const silverUrl = 'https://sasikumar-ai-9wdq.onrender.com/api/silver-rate?state=Tamil%20Nadu&district=Thanjavur';
  const websiteUrl = 'https://sasikumar-ai-9wdq.onrender.com/gold-silver.html';

  try {
    const [gold, silver] = await Promise.all([
      skGetLiveGoldRates(),
      skGetLiveSilverRate()
    ]);

    if (
      !gold?.ok ||
      !gold?.rates ||
      !['24K', '22K', '20K', '19K', '18K'].every(
        key => Number.isFinite(Number(gold.rates[key])) && Number(gold.rates[key]) > 0
      ) ||
      !silver?.ok ||
      ![
        silver.price_gram_999,
        silver.price_8g_999,
        silver.price_10g_999,
        silver.price_kg_999
      ].every(value => Number.isFinite(Number(value)) && Number(value) > 0)
    ) {
      throw new Error('Live rate data is incomplete or unavailable');
    }

    const money = value => Number(value).toLocaleString('en-IN', {
      maximumFractionDigits: 2
    });

    const formatTime = value => value
      ? new Date(value).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      : 'Not provided by API';

    return `🪙 LIVE GOLD & SILVER RATE
📍 Tamil Nadu • Thanjavur

🟡 GOLD RATE — PER GRAM
24K (999): ₹${money(gold.rates['24K'])}
22K (916): ₹${money(gold.rates['22K'])}
20K: ₹${money(gold.rates['20K'])}
19K: ₹${money(gold.rates['19K'])}
18K (750): ₹${money(gold.rates['18K'])}

⚪ SILVER 999 RATE
1 gram: ₹${money(silver.price_gram_999)}
8 grams: ₹${money(silver.price_8g_999)}
10 grams: ₹${money(silver.price_10g_999)}
1 kilogram: ₹${money(silver.price_kg_999)}

🕒 Gold updated: ${formatTime(gold.updatedAt)}
🕒 Silver updated: ${formatTime(silver.updatedAt)}
📊 Gold source: ${gold.source || 'Live API'}
📊 Silver source: ${silver.source || 'Live API'}

🌐 Website: ${websiteUrl}
🔄 Gold API: ${goldUrl}
🔄 Silver API: ${silverUrl}

⚠️ Reference prices only. Jewellery shop prices may differ due to GST, making charges and other costs.

🔙 Type 0 for Main Menu`;
  } catch (error) {
    console.error('[WhatsApp Gold/Silver] Live rate fetch failed:', error.message || error);
    return `🪙 LIVE GOLD & SILVER RATE

⚠️ Live rates are temporarily unavailable. Please try again shortly. No estimated prices are shown.

🔄 Gold API: ${goldUrl}
🔄 Silver API: ${silverUrl}
🌐 Website: ${websiteUrl}

🔙 Type 0 for Main Menu`;
  }
}

function getMenuReply(num){const fn=MENU_REPLIES[num];return fn?fn():null;}

function getWhatsAppEMIReply(message) {
  const m = String(message || '').trim().match(/^EMI\s+([\d,]+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d{1,3})$/i);
  if (!m) return null;
  const principal = Number(m[1].replace(/,/g, ''));
  const annualRate = Number(m[2]);
  const months = Number(m[3]);
  if (!Number.isFinite(principal) || !Number.isFinite(annualRate) ||
      principal <= 0 || principal > 1000000000 ||
      annualRate < 0 || annualRate > 100 || months < 1 || months > 600) {
    return '⚠️ சரியான விவரங்களை அனுப்புங்கள். உதாரணம்: EMI 100000 12 12';
  }
  const r = annualRate / 1200;
  const emi = r === 0 ? principal / months :
    principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
  const total = emi * months;
  const money = n => '₹' + n.toLocaleString('en-IN', {maximumFractionDigits: 2, minimumFractionDigits: 2});
  return `🤖 SASIKUMAR AI — EMI CALCULATION
💰 Loan Amount: ${money(principal)}
📈 Annual Interest: ${annualRate}%
📅 Tenure: ${months} months
🧮 Monthly EMI: ${money(emi)}
💵 Total Payment: ${money(total)}
📊 Total Interest: ${money(total - principal)}

⚠️ Estimate only; fees and lender terms may change the final amount.
🌐 Calculator: https://sasikumar-ai-9wdq.onrender.com/loan-calculator.html
🔙 Type 0 for Main Menu`;
}
function detectLang(q){try{if(/[\u0B80-\u0BFF]/.test(q))return 'ta';return 'en';}catch(e){return 'en';}}
function getGeneralReply(q,lang){const time=new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'});if(q.toLowerCase().includes('gold'))return `💰 GOLD RATE\nVerified current rate-ai /api/gold-la check pannunga.\nhttps://sasikumar-ai-9wdq.onrender.com/api/gold\nType 0 for Menu`;return `🌍 General AI - ${time}\nYou: "${q}"\nType 0 for Menu or 1-33`; }

app.get('/api/status',(req,res)=>{res.json({status:'WHATSAPP MENU 33 OPTIONS LIVE OK',version:'7.3 Menu',options:33,time:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})});});
app.get('/api/whatsapp/menu',(req,res)=>{
  res.set('Cache-Control','no-store');
  res.json({
    welcome: '🤖 SASIKUMAR AI — 33 Services',
    total: 33,
    menuImage: 'https://sasikumar-ai-9wdq.onrender.com/assets/whatsapp-menu.png'
  });
});
app.get('/api/gold', async (req,res)=>{try{const d=await skGetLiveGoldRates();res.set('Cache-Control','no-store');res.json({'24k_per_g':d.rates['24K'],'22k_per_g':d.rates['22K'],rates:d.rates,source:d.source,fallbackUsed:d.fallbackUsed,updatedAt:d.updatedAt,note:d.note});}catch(e){console.error('[Gold API] Request failed:',e.message);res.status(503).json({ok:false,error:'Live Gold Rate temporarily unavailable.'});}});
app.get('/api/services',(req,res)=>{res.json({services:[{id:1,name:'Gold Rate',ta:'தங்க விலை',icon:'💰'},{id:2,name:'Gold Loan',ta:'தங்க கடன்',icon:'🏦'},{id:3,name:'Banking',ta:'வங்கி',icon:'🏧'},{id:4,name:'Gold Expert',ta:'தங்க நிபுணர்',icon:'👨‍🏫'},{id:5,name:'Appraisal',ta:'மதிப்பீடு',icon:'🔍'},{id:6,name:'Education',ta:'கல்வி',icon:'📚'},{id:7,name:'Jobs',ta:'வேலை',icon:'💼'},{id:8,name:'Business Tech News',ta:'வணிக செய்தி',icon:'💼'},{id:9,name:'General AI',ta:'பொது AI',icon:'🧠'},{id:10,name:'Breaking News',ta:'முக்கிய செய்தி',icon:'🚨'},{id:11,name:'Business News',ta:'வணிக செய்தி',icon:'💼'},{id:12,name:'Sports',ta:'விளையாட்டு',icon:'🏏'},{id:13,name:'Web Search',ta:'இணைய தேடல்',icon:'🔎'},{id:14,name:'Poster Creative',ta:'போஸ்டர்',icon:'🎨'},{id:15,name:'Image AI',ta:'பட AI',icon:'📸'},{id:16,name:'Video Maker',ta:'வீடியோ',icon:'🎬'},{id:17,name:'Contact',ta:'தொடர்பு',icon:'📞'},{id:18,name:'Feedback',ta:'கருத்து',icon:'⭐'},{id:19,name:'About',ta:'பற்றி',icon:'ℹ️'},{id:20,name:'Tamil News Videos',ta:'தமிழ் செய்தி',icon:'📰'}]});});


/* SASIKUMAR AI GLOBAL CHAT API */
app.post('/api/chat', async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();
    const category = String(req.body?.category || 'General AI').slice(0, 100);
    const attachment = req.body?.attachment;

    if (!message && !attachment) {
      return res.status(400).json({
        reply: 'தயவுசெய்து உங்கள் கேள்வியை உள்ளிடுங்கள்.',
        answer: 'தயவுசெய்து உங்கள் கேள்வியை உள்ளிடுங்கள்.'
      });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        reply: 'AI server configuration error: GROQ_API_KEY is missing.',
        answer: 'AI server configuration error: GROQ_API_KEY is missing.'
      });
    }

    let userMessage = message;
    let imageData = '';
    let attachmentText = '';

    if (attachment && typeof attachment === 'object') {
      const fileName = String(
        attachment.name || attachment.filename || 'uploaded file'
      ).slice(0, 200);

      const data = typeof attachment.data === 'string'
        ? attachment.data
        : '';

      if (data) {
        if (data.length > 14 * 1024 * 1024) {
          return res.status(413).json({
            reply: 'படம் மிகவும் பெரியது. சிறிய படத்தைத் தேர்ந்தெடுக்கவும்.',
            answer: 'படம் மிகவும் பெரியது. சிறிய படத்தைத் தேர்ந்தெடுக்கவும்.'
          });
        }

        if (!/^data:image\/(jpeg|png|webp);base64,/i.test(data)) {
          return res.status(400).json({
            reply: 'JPG, PNG அல்லது WebP படத்தைத் தேர்ந்தெடுக்கவும்.',
            answer: 'JPG, PNG அல்லது WebP படத்தைத் தேர்ந்தெடுக்கவும்.'
          });
        }

        imageData = data;
      }

      if (typeof attachment.text === 'string' && attachment.text.trim()) {
        if (attachment.text.length > 120000) {
          return res.status(413).json({
            reply: 'ஆவணம் மிகவும் பெரியது. சிறிய TXT அல்லது CSV கோப்பைப் பயன்படுத்தவும்.',
            answer: 'ஆவணம் மிகவும் பெரியது. சிறிய TXT அல்லது CSV கோப்பைப் பயன்படுத்தவும்.'
          });
        }
        attachmentText = attachment.text;
      }

      if (attachmentText) {
        userMessage += (userMessage ? '\n\n' : '') +
          'Attached document: ' + fileName + '\n' + attachmentText;
      } else if (!imageData) {
        userMessage += (userMessage ? '\n\n' : '') +
          '[User attached: ' + fileName +
          '. The file contents were not provided.]';
      }
    } else if (attachment) {
      userMessage += (userMessage ? '\n\n' : '') +
        '[User attached a file, but its contents were not provided.]';
    }

    if (!userMessage && !imageData) {
      return res.status(400).json({
        reply: 'கேள்வி அல்லது ஆதரிக்கப்படும் கோப்பை அனுப்புங்கள்.',
        answer: 'கேள்வி அல்லது ஆதரிக்கப்படும் கோப்பை அனுப்புங்கள்.'
      });
    }

    const requestModel = imageData
      ? 'qwen/qwen3.8-27b'
      : 'openai/gpt-oss-20b';

    const requestContent = imageData
      ? [
          {
            type: 'text',
            text: (userMessage || 'இந்தப் படத்தை ஆய்வு செய்து தமிழில் விளக்கவும்.') +
              '\nபடத்தில் தெரியும் தகவல்களை மட்டும் அடிப்படையாகக் கொண்டு பதிலளிக்கவும். ' +
              'பயிர் நோயை உறுதியாகக் கண்டறிய முடியாவிட்டால் அதைக் குறிப்பிடவும்.'
          },
          {
            type: 'image_url',
            image_url: { url: imageData }
          }
        ]
      : userMessage;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);

    let upstream;
    try {
      upstream = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: requestModel,
            messages: [
              {
                role: 'system',
                content:
                  'You are SASIKUMAR AI, a helpful multilingual assistant. ' +
                  'Respond in the language used by the user, including Tamil, English, or Tanglish. ' +
                  'Give clear, accurate and useful answers. ' +
                  'For current information that you cannot verify, be transparent. ' +
                  'For agriculture questions, give cautious practical guidance and recommend local agricultural officers when needed. Do not diagnose crop diseases with certainty from limited symptoms or images. Ask for crop, growth stage, location, symptoms, and recent weather or irrigation details when relevant. Do not invent pesticide or fungicide names, doses, mixtures, or application schedules. Recommend chemicals only when the crop, pest or disease, product label, and locally approved guidance support their use. Never suggest off-label use or mixing chemicals without authoritative guidance. Prioritize field observation, soil testing, integrated pest management, and official agricultural extension advice. State uncertainty clearly and recommend a local agricultural officer or KVK when diagnosis is unclear. ' +
                  'For Indian agriculture questions, KVK means Krishi Vigyan Kendra, not Kerala Village Kendra. Recommend the relevant state agriculture department or a relevant local KVK. Do not invent the names or locations of agricultural offices. Never invent KVK names, addresses, phone numbers, or contact details. Never show placeholder phone numbers such as xxxx. Recommend a specific KVK only when its name and contact information are verified from an official source. Do not promise to provide verified contact details unless an official source can actually be checked. If verification is unavailable, clearly say that the details cannot be verified in this response and direct the user to the state agriculture department or an official KVK directory. Ask for the district when needed, but never imply that the district alone verifies contact details. When asking for a PIN, use the term postal PIN code. Otherwise, ask for the users district or recommend contacting the state agriculture department without guessing office details. ' +
                  'The requested service category is: ' + category + '.'
              },
              {
                role: 'user',
                content: requestContent
              }
            ],
            temperature: 0.7,
            max_completion_tokens: 2048
          }),
          signal: controller.signal
        }
      );
    } finally {
      clearTimeout(timer);
    }

    const result = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      console.error(
        'Groq API error:',
        upstream.status,
        result?.error?.message || 'Upstream request failed'
      );

      const errorMessage =
        upstream.status === 401
          ? 'AI API authentication failed. Please check the server API key.'
          : upstream.status === 429
          ? 'AI service is busy or its usage limit was reached. Please try again later.'
          : 'AI service returned an error (HTTP ' + upstream.status + '). Please try again.';

      return res.status(502).json({
        reply: errorMessage,
        answer: errorMessage
      });
    }

    const reply = result?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(502).json({
        reply: 'AI-யிடமிருந்து பதில் கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.',
        answer: 'AI-யிடமிருந்து பதில் கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.'
      });
    }

    return res.json({ reply, answer: reply, api: 'Groq AI' });
  } catch (error) {
    console.error('Chat API error:', error.name || 'Error', error.message || '');

    const message =
      error.name === 'AbortError'
        ? 'AI பதில் பெற அதிக நேரமாகிறது. மீண்டும் முயற்சிக்கவும்.'
        : 'AI இணைப்பில் பிழை ஏற்பட்டது. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.';

    return res.status(500).json({ reply: message, answer: message });
  }
});

app.post('/api/ai-reply',(req,res)=>{
  try{
    const q=(req.body.question||'').trim();
    if(!q) return res.json({answer:WELCOME_MENU,api:'Welcome Menu'});
    if(q==='0' || q.toLowerCase()==='menu' || ['hi','hello','vanakkam','start'].includes(q.toLowerCase())) return res.json({answer:WELCOME_MENU,api:'Welcome Menu'});
    const direct=q.match(/^\s*(3[01]|[12][0-9]|[0-9])\s*$/);
    if(direct){
      const num=direct[1];
      if(num==='0') return res.json({answer:WELCOME_MENU,api:'Welcome Menu'});
      const reply=getMenuReply(num);
      if(reply) return res.json({answer:reply,api:`Option ${num}`,option:num});
    }
    res.json({answer:getGeneralReply(q,detectLang(q)),api:'General'});
  }catch(e){res.json({answer:WELCOME_MENU});}
});


// SK_WA_FRIENDLY_COMEDY_AI_V1
async function getWhatsAppAIReply(question, mode = 'normal') {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return 'மன்னிக்கவும் நண்பா 😊 AI சேவை இப்போது கிடைக்கவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்.';
  }

  const systemPrompt = mode === 'friendly'
    ? 'You are SASIKUMAR AI, a warm, friendly and respectful conversation partner. Match the user language (Tamil, English or Tanglish). Be kind, natural and concise. Never claim to be human.'
    : 'You are SASIKUMAR AI. Answer the user helpfully, accurately and respectfully. Match the user language (Tamil, English or Tanglish). If unsure about current facts, be transparent. Keep WhatsApp replies concise.';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: String(question).slice(0, 4000) }
          ],
          temperature: 0.7,
          max_completion_tokens: 700
        }),
        signal: controller.signal
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[WhatsApp AI]', response.status,
        data?.error?.message || 'AI request failed');
      return 'மன்னிக்கவும் நண்பா 😊 இப்போது AI பதில் கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.';
    }

    return data?.choices?.[0]?.message?.content?.trim() ||
      'மன்னிக்கவும் நண்பா 😊 பதில் கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.';
  } catch (error) {
    console.error('[WhatsApp AI]', error.message || error);
    return 'மன்னிக்கவும் நண்பா 😊 AI இணைப்பில் தற்காலிகப் பிழை. மீண்டும் முயற்சிக்கவும்.';
  } finally {
    clearTimeout(timer);
  }
}

app.get('/api/whatsapp/webhook',(req,res)=>{const mode=req.query['hub.mode'];const token=req.query['hub.verify_token'];const challenge=req.query['hub.challenge'];if(mode==='subscribe' && token===WA_VERIFY_TOKEN) res.status(200).send(challenge); else res.sendStatus(403);});

// SK_WA_LEADERSHIP_TAMIL_BREAKING_NEWS_V1
async function getTamilBreakingNews() {
  const now = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata'
  });

  try {
    const response = await fetch(
      'https://sasikumar-ai-9wdq.onrender.com/api/breaking-news?category=Tamil%20Nadu',
      { signal: AbortSignal.timeout(25000) }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.ok !== true) {
      console.error(
        '[Tamil Breaking News] Live API error:',
        response.status,
        String(data.error || 'Unknown error').slice(0, 200)
      );
      return '📰 தமிழ் முக்கியச் செய்திகள்\n\n' +
        'தற்போதைய செய்திகளைப் பெற முடியவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்.\n' +
        '🌐 https://sasikumar-ai-9wdq.onrender.com/live-news.html\n' +
        '🤖 SASIKUMAR AI';
    }

    const articles = Array.isArray(data.articles) ? data.articles : [];

    if (!articles.length) {
      return '📰 இப்போது செய்திகள் கிடைக்கவில்லை. பின்னர் முயற்சிக்கவும்.\n' +
        '🌐 https://sasikumar-ai-9wdq.onrender.com/live-news.html\n' +
        '🤖 SASIKUMAR AI';
    }

    let out = '🤖 SASIKUMAR AI\n' +
      '📰 தமிழ் முக்கியச் செய்திகள்\n' +
      '🕒 ' + now + '\n\n';

    for (const [i, item] of articles.slice(0, 5).entries()) {
      out += `${i + 1}. ${String(item.title || 'செய்தி').slice(0, 220)}\n`;
      if (item.url && (String(item.url).startsWith('https://') || String(item.url).startsWith('http://'))) {
        out += item.url + '\n';
      }
      out += '\n';
    }

    out += '🌐 மேலும் செய்திகள்: https://sasikumar-ai-9wdq.onrender.com/live-news.html\n' +
      '🤖 SASIKUMAR AI';

    return out.slice(0, 3500);
  } catch (error) {
    console.error('[Tamil Breaking News] Live API fetch error:', error.message || error);
    return '📰 செய்திகளைப் பெறுவதில் தற்காலிகப் பிழை. மீண்டும் முயற்சிக்கவும்.\n' +
      '🌐 https://sasikumar-ai-9wdq.onrender.com/live-news.html\n' +
      '🤖 SASIKUMAR AI';
  }
}

app.post('/api/whatsapp/webhook',async(req,res)=>{
  try{
    const body=req.body;
    if(body.object!=='whatsapp_business_account') return res.sendStatus(404);

    const msg=body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if(!msg) return res.sendStatus(200);

    const from=msg.from;
    const trimmed=(msg.text?.body||'').trim();
    const lower=trimmed.toLowerCase();

const isWelcome = !trimmed || trimmed === '0' ||
  ['menu', 'manu', 'start', 'மெனு'].includes(lower);

let reply = WELCOME_MENU;

if (!isWelcome) {
  const num = trimmed.match(/^\s*(3[0-3]|[12][0-9]|[0-9])\s*$/);

  if (num) {
    reply = num[1] === '10'
      ? await getTamilBreakingNews()
      : num[1] === '2'
        ? await getLiveGoldSilverWhatsAppReply()
        : (getMenuReply(num[1]) || WELCOME_MENU);
  } else if (/^(hi|hello|hey|வணக்கம்|ஹாய்|ஹலோ)[\s!.]*$/i.test(trimmed)) {
    reply = /[\u0B80-\u0BFF]/.test(trimmed)
      ? 'வணக்கம் நண்பா! 😊❤️ எப்படி இருக்கீங்க? என்ன உதவி வேண்டும்?'
      : 'Hey friend! 😊❤️ How are you today? How can I help?';
  } else if (/^EMI\b/i.test(trimmed) && getWhatsAppEMIReply(trimmed)) {
    reply = getWhatsAppEMIReply(trimmed);
  } else if (/gold\s*loan|தங்கக்\s*கடன்|நகைக்\s*கடன்/i.test(trimmed)) {
    reply = `🟡 GOLD LOAN SUPPORT
தங்கத்தின் நிகர எடை (கிராம்), தூய்மை (18K/20K/22K/24K) ஆகியவற்றை அனுப்புங்கள்.
கடன் மதிப்பீடு கடன் வழங்குநரின் விதிமுறைகள் மற்றும் நகைச் சோதனையைப் பொறுத்தது.
🌐 Gold & Silver: https://sasikumar-ai-9wdq.onrender.com/gold-silver.html
⚠️ இது ஆரம்ப வழிகாட்டுதல் மட்டுமே; கடன் ஒப்புதல் உறுதி அல்ல.
🔙 Type 0 for Main Menu`;
  } else if (/human\s*support|live\s*support|contact\s*support|மனித\s*உதவி|நேரடி\s*உதவி/i.test(trimmed)) {
    reply = `👨‍💻 SASIKUMAR AI — HUMAN SUPPORT
உங்கள் கேள்வி அல்லது பிரச்சினையை விவரமாக அனுப்புங்கள்.
📩 Contact: https://sasikumar-ai-9wdq.onrender.com/communication.html
⭐ Feedback: https://sasikumar-ai-9wdq.onrender.com/customer-feedback.html
குறிப்பு: நேரடி மனித பதில் ஆதரவு குழு கிடைப்பதைப் பொறுத்தது.
🔙 Type 0 for Main Menu`;
  } else if (/loan\s*calculat|emi\s*calculat|கடன்\s*கணக்கீடு/i.test(trimmed)) {
    reply = getMenuReply('3');
  } else if (/tamil\s*(breaking\s*)?news|breaking\s*news|தமிழ்.*செய்தி|முக்கியச் செய்திகள்/i.test(trimmed)) {
    reply = await getTamilBreakingNews();
  } else if (/\b(kavithai|poem|poetry)\b|கவிதை|கவிதைகள்/i.test(trimmed)) {
    reply = getMenuReply('18');
  } else if (/\b(ponmozhigal|ponmozhi|quotes?|proverbs?)\b|பொன்மொழி|பொன்மொழிகள்/i.test(trimmed)) {
    reply = getMenuReply('19');
  } else if (/\b(thathuvam|philosophy)\b|தத்துவம்|வாழ்க்கைத் தத்துவம்/i.test(trimmed)) {
    reply = getMenuReply('20');
  } else if (/\b(thirukkural|kural)\b|திருக்குறள்/i.test(trimmed)) {
    reply = getMenuReply('17');
  } else if (/\b(motivation|motivational)\b|ஊக்கம்|தன்னம்பிக்கை/i.test(trimmed)) {
    reply = getMenuReply('21');
  } else if (/audio\s*(and|&)\s*video\s*hub|audio.video.hub|audio|songs?|music|video\s*hub|movie\s*videos?|பாடல்கள்?|ஆடியோ|வீடியோ ஹப்|ஒலி/i.test(trimmed)) {
    reply = getMenuReply('23');
  } else if (/\b(comedy|joke|funny|laugh|next)\b|காமெடி|ஜோக்|நகைச்சுவை/i.test(trimmed)) {
    const jokes = [
      '😂 ஆசிரியர்: ஏன் லேட்டா வந்தாய்? மாணவர்: சார், கனவில் பள்ளிக்கு வந்தேன்; அதனால் நிஜத்தில் லேட்டாகிவிட்டது! 🤣',
      '🤣 நண்பன்: என் மொபைல் என்னை ரொம்ப நேசிக்குது! மற்றவன்: எப்படி? நண்பன்: எப்போதும் என்னைக் கட்டிப்பிடிச்சு சார்ஜ் கேட்குது! 😂📱',
      '😄 மருத்துவர்: தினமும் உடற்பயிற்சி செய்யுங்கள். நோயாளி: சரி டாக்டர், இனிமேல் உடற்பயிற்சி வீடியோக்களை தினமும் பார்ப்பேன்! 😂',
      '😂 கணவர்: இன்று சாப்பாட்டில் என்ன ஸ்பெஷல்? மனைவி: உங்களுக்காக அன்புடன் செய்தேன்! கணவர்: அதனால்தான் உப்புக்கூட அன்பாக அதிகமா இருக்கா? 🤣'
    ];
    reply = jokes[Math.floor(Math.random() * jokes.length)] +
      '\n\n😄 இன்னொரு காமெடிக்கு Next அனுப்புங்கள்!';
  } else if (/\bfriendly\b|நண்பா|நண்பரே/i.test(trimmed)) {
    reply = await getWhatsAppAIReply(trimmed, 'friendly');
  } else {
    reply = await getWhatsAppAIReply(trimmed, 'normal');
  }
}
if(WA_TOKEN && WA_PHONE_ID){
      const sendWA=async(payload)=>{
        const r=await fetch(
          `https://graph.facebook.com/v20.0/${WA_PHONE_ID}/messages`,
          {
            method:'POST',
            headers:{
              'Authorization':`Bearer ${WA_TOKEN}`,
              'Content-Type':'application/json'
            },
            body:JSON.stringify({
              messaging_product:'whatsapp',
              to:from,
              ...payload
            })
          }
        );
        const data=await r.json().catch(()=>({}));
        if(!r.ok) console.error('[WhatsApp send]',r.status,JSON.stringify(data).slice(0,400));
        return r.ok;
      };

      // One branded image message for every WhatsApp reply.
      const answerText = String(reply || WELCOME_MENU);

      if (isWelcome) {
        const now = new Date();
        const date = now.toLocaleDateString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit', month: 'long', year: 'numeric'
        });
        const time = now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit', minute: '2-digit', hour12: true
        });

        const welcomeCaption = [
          '🤖 SASIKUMAR AI',
          '',
          '🙏 வணக்கம் நண்பரே! Welcome!',
          '',
          '🌍 தமிழ் • English • हिंदी • తెలుగు • മലയാളം • ಕನ್ನಡ மற்றும் பல மொழிகளில் சேவை.',
          '',
          '💬 உங்கள் கேள்வியை நேரடியாக அனுப்புங்கள்.',
          '',
          '📋 32 சேவைகள் கொண்ட Complete Menu அடுத்த படத்தில் உள்ளது.',
          '',
          '🌐 Website: https://sasikumar-ai-9wdq.onrender.com',
          '',
          '📅 தேதி: ' + date,
          '🕒 நேரம்: ' + time + ' IST',
          '',
          '🤖 SASIKUMAR AI — உங்கள் டிஜிட்டல் உதவியாளர் ❤️'
        ].join('\n');

        await sendWA({
          type: 'image',
          image: {
            link: 'https://sasikumar-ai-9wdq.onrender.com/assets/sasikumar-ai-logo.png',
            caption: welcomeCaption
          }
        });

        await new Promise(resolve => setTimeout(resolve, 800));

        const menuCaption = [
          '🤖 SASIKUMAR AI — COMPLETE MENU',
          '1. AI Assistant',
          '2. Live Gold & Silver Rate',
          '3. Gold Loan / EMI Calculator',
          '4. Banking Services',
          '5. Gold Expert',
          '6. Gold Appraisal',
          '7. Education',
          '8. Jobs & Careers',
          '9. Business & Technology News',
          '10. Breaking News',
          '11. General AI Chat',
          '12. Poster & Creative Design',
          '13. AI Image Maker',
          '14. Video Maker',
          '15. Global Web Search',
          '16. Sports Updates',
          '17. Daily Thirukkural',
          '18. Tamil Kavithai',
          '19. Ponmozhigal',
          '20. Thathuvam',
          '21. Motivation',
          '22. Leadership History',
          '23. Audio & Video Songs Hub',
          '24. Live FM Radio',
          '25. Audio / Video Song Cutter',
          '26. Mobile App Download',
          '27. Business Ideas',
          '28. AI Tools',
          '29. Website Services',
          '30. Contact & Customer Feedback',
          '31. All Content — Complete Services',
          '32. Tamil Comedy & Movie Fun',
          '33. Agriculture — விவசாய உதவியாளர்',
          '0. Main Menu',
          'Send an option number to select a service.'
        ].join('\n');

        await sendWA({
          type: 'text',
          text: {
            body: menuCaption
          }
        });
      } else {
        const caption = ('🤖 SASIKUMAR AI\n' + answerText).substring(0, 1000);
        const imageUrl = 'https://sasikumar-ai-9wdq.onrender.com/assets/sasikumar-ai-logo.png';

        await sendWA({
          type: 'image',
          image: {
            link: imageUrl,
            caption: caption
          }
        });
      }
    }
    res.sendStatus(200);
  }catch(e){
    console.error('[WhatsApp webhook]',e.message||e);
    res.sendStatus(500);
  }
});

app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { to, message, phone } = req.body || {};
    const target = to || phone;

    if (!target || !message) {
      return res.status(400).json({
        success: false,
        error: 'Need phone and message'
      });
    }

    let clean = String(target).replace(/[^0-9]/g, '');
    if (clean.length === 10) clean = '91' + clean;

    if (clean.length < 11 || clean.length > 15) {
      return res.status(400).json({
        success: false,
        error: 'Invalid recipient phone number'
      });
    }

    if (!WA_TOKEN || !WA_PHONE_ID) {
      const link = `https://wa.me/${clean}?text=${encodeURIComponent(String(message))}`;
      return res.status(503).json({
        success: false,
        demo: true,
        error: 'WhatsApp Cloud API is not configured',
        wa_link: link,
        to: clean
      });
    }

    const resp = await fetch(
      `https://graph.facebook.com/v20.0/${WA_PHONE_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WA_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: clean,
          type: 'text',
          text: { body: String(message).substring(0, 4000) }
        })
      }
    );

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      console.error('WhatsApp Cloud API error:', resp.status,
        data.error?.code || 'unknown');
      return res.status(resp.status >= 400 && resp.status < 600 ? resp.status : 502)
        .json({
          success: false,
          real_api: true,
          error: data.error?.message || 'WhatsApp message send failed',
          error_code: data.error?.code || null
        });
    }

    return res.json({
      success: true,
      real_api: true,
      data
    });
  } catch (e) {
    console.error('WhatsApp send route error:', e.message);
    return res.status(500).json({
      success: false,
      error: 'Internal WhatsApp send error'
    });
  }
});
app.post('/api/whatsapp/share',(req,res)=>{
  const {message,phone}=req.body;const text=message||WELCOME_MENU;
  let clean=(phone||'').replace(/[^0-9]/g,''); if(clean.length===10) clean='91'+clean;
  const link=clean?`https://wa.me/${clean}?text=${encodeURIComponent(text)}`:`https://wa.me/?text=${encodeURIComponent(text)}`;
  res.json({wa_link:link});
});


// SASIKUMAR AI GLOBAL WEB SEARCH API
app.get('/api/global-search', async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const query = String(req.query.q || '').trim();

  if (!query) {
    return res.status(400).json({
      error: 'Please enter a search query.',
      results: []
    });
  }

  if (query.length > 500) {
    return res.status(400).json({
      error: 'Search query is too long.',
      results: []
    });
  }

  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: 'Web Search is not configured. Please set TAVILY_API_KEY.',
      results: []
    });
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: 'basic',
        max_results: 8,
        include_answer: false
      }),
      signal: AbortSignal.timeout(25000)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Tavily Search HTTP error:', response.status);
      const googleUrl = 'https://www.google.com/search?q=' + encodeURIComponent(query);
      return res.json({
        query,
        fallback: 'google',
        error: 'Tavily search is unavailable. Continue with Google Search.',
        results: [{
          title: 'Google Search — ' + query,
          url: googleUrl,
          content: 'Tap this result to open current Google search results.'
        }]
      });
    }

    const results = (Array.isArray(data.results) ? data.results : [])
      .map(item => ({
        title: String(item.title || 'Search result'),
        url: String(item.url || ''),
        content: String(item.content || item.snippet || '')
      }))
      .filter(item => item.url.startsWith('https://') || item.url.startsWith('http://'));

    return res.json({ query, results });
  } catch (error) {
    console.error('Global Search request failed:', error.message);
    return res.status(502).json({
      error: 'Web Search is temporarily unavailable. Please try again.',
      results: []
    });
  }
});
// END SASIKUMAR AI GLOBAL WEB SEARCH API



// SK_LIVE_TAMIL_NEWS_JSON_API_V1
app.get('/api/breaking-news', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');

  const key = process.env.NEWSDATA_API_KEY;
  if (!key || !key.trim()) {
    return res.status(503).json({
      ok: false,
      error: 'News API key is not configured.',
      articles: []
    });
  }

  const requested = String(req.query.category || 'tamil-nadu')
    .trim().toLowerCase().replace(/\s+/g, '-');

  const configs = {
    'tamil-nadu': {
      label: 'Tamil Nadu',
      country: 'in',
      language: 'ta',
      q: 'தமிழ்நாடு OR இந்தியா'
    },
    'india': {
      label: 'India',
      country: 'in',
      language: 'en'
    },
    'world': {
      label: 'World',
      language: 'en',
      category: 'world'
    },
    'business': {
      label: 'Business',
      country: 'in',
      language: 'en',
      category: 'business'
    },
    'technology': {
      label: 'Technology',
      country: 'in',
      language: 'en',
      category: 'technology'
    },
    'sports': {
      label: 'Sports',
      country: 'in',
      language: 'en',
      category: 'sports'
    }
  };

  const config = configs[requested];

  if (!config) {
    return res.status(400).json({
      ok: false,
      error: 'Invalid news category.',
      supportedCategories: Object.keys(configs),
      articles: []
    });
  }

  try {
    const values = {
      apikey: key.trim(),
      language: config.language
    };

    if (config.country) values.country = config.country;
    if (config.category) values.category = config.category;
    if (config.q) values.q = config.q;

    const params = new URLSearchParams(values);

    const response = await fetch(
      'https://newsdata.io/api/1/latest?' + params.toString(),
      { signal: AbortSignal.timeout(20000) }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.status === 'error') {
      const errorInfo =
        data.results || data.message || data.error || 'Unknown provider error';

      console.error(
        '[Live News] NewsData error:',
        response.status,
        JSON.stringify(errorInfo).slice(0, 300)
      );

      return res.status(502).json({
        ok: false,
        error: 'News provider is temporarily unavailable.',
        category: config.label,
        articles: []
      });
    }

    const articles = (Array.isArray(data.results) ? data.results : [])
      .filter(item =>
        item &&
        item.title &&
        item.link &&
        /^https?:\/\//i.test(String(item.link))
      )
      .slice(0, 5)
      .map(item => ({
        title: String(item.title).slice(0, 250),
        url: String(item.link),
        content: String(item.description || '').slice(0, 500),
        published_date: item.pubDate || null
      }));

    return res.json({
      ok: true,
      provider: 'NewsData.io',
      category: config.label,
      language: config.language,
      updatedAt: new Date().toISOString(),
      articles
    });
  } catch (error) {
    console.error('[Live News] Request failed:', error.message || error);

    return res.status(502).json({
      ok: false,
      error: 'News search temporarily failed.',
      articles: []
    });
  }
});
// END SK_LIVE_TAMIL_NEWS_JSON_API_V1



// SK_REAL_GOLD_SILVER_API_V1
const SK_GOLD_SILVER_CACHE_MS = 5 * 60 * 1000;
let skLiveGoldCache = null;
let skLiveGoldCacheTime = 0;
let skLiveSilverCache = null;
let skLiveSilverCacheTime = 0;

async function skGetLiveGoldRates() {
  if (skLiveGoldCache && Date.now() - skLiveGoldCacheTime < SK_GOLD_SILVER_CACHE_MS) {
    return { ...skLiveGoldCache, cached: true };
  }

  let r24, source, fallbackUsed = false, buy = null, sell = null, gst = null;
  let change24h = null;

  try {
    const response = await fetch(
      "https://api.oropocket.com/public/prices",
      { signal: AbortSignal.timeout(12000) }
    );
    const data = await response.json();
    const gold = data && data.data && data.data.gold;
    const value = Number(gold && gold.sell);

    if (!response.ok || !gold || !Number.isFinite(value) || value <= 0) {
      throw new Error("OroPocket gold price unavailable or invalid");
    }

    r24 = Math.round(value);
    buy = Number.isFinite(Number(gold.buy)) ? Number(gold.buy) : null;
    sell = value;
    gst = Number.isFinite(Number(gold.gst)) ? Number(gold.gst) : null;
    change24h = gold.change24h || null;
    source = "OroPocket • Gold • INR/gram";
  } catch (primaryError) {
    console.warn("[Gold Rate] OroPocket failed:", primaryError.message);

    const response = await fetch(
      "https://api.goldprice.dev/v1/prices?symbol=XAU-INR-SPOT",
      { signal: AbortSignal.timeout(12000) }
    );
    const data = await response.json();
    const ouncePrice = Number(data && data.symbols && data.symbols[0] && data.symbols[0].price);

    if (!response.ok || !Number.isFinite(ouncePrice) || ouncePrice <= 0) {
      throw new Error("Live Gold providers unavailable");
    }

    r24 = Math.round(ouncePrice / 31.1034768);
    source = "goldprice.dev • XAU/INR";
    fallbackUsed = true;
  }

  const rates = {
    "24K": r24,
    "22K": Math.round(r24 * 22 / 24),
    "20K": Math.round(r24 * 20 / 24),
    "19K": Math.round(r24 * 19 / 24),
    "18K": Math.round(r24 * 18 / 24)
  };

  skLiveGoldCache = {
    ok: true,
    rates,
    gold24k: rates["24K"],
    gold22k: rates["22K"],
    "24k_per_g": rates["24K"],
    "22k_per_g": rates["22K"],
    buy,
    sell,
    gst,
    change24h,
    source,
    fallbackUsed,
    updatedAt: new Date().toISOString(),
    note: "Reference gold price. Local jewellery retail rates may differ."
  };
  skLiveGoldCacheTime = Date.now();

  return { ...skLiveGoldCache, cached: false };
}

async function skGetLiveSilverRate() {
  if (skLiveSilverCache && Date.now() - skLiveSilverCacheTime < SK_GOLD_SILVER_CACHE_MS) {
    return { ...skLiveSilverCache, cached: true };
  }

  const response = await fetch(
    "https://api.oropocket.com/public/prices",
    { signal: AbortSignal.timeout(12000) }
  );
  const data = await response.json();
  const silver = data && data.data && data.data.silver;
  const priceGram = Number(silver && silver.sell);

  if (!response.ok || !silver || !Number.isFinite(priceGram) || priceGram <= 0) {
    throw new Error("Live Silver provider unavailable or returned invalid data");
  }

  const round = n => Math.round(n * 100) / 100;

  skLiveSilverCache = {
    ok: true,
    price_gram_999: round(priceGram),
    price_10g_999: round(priceGram * 10),
    price_8g_999: round(priceGram * 8),
    price_kg_999: round(priceGram * 1000),
    silver: {
      gram: round(priceGram),
      tenGram: round(priceGram * 10),
      eightGram: round(priceGram * 8),
      kg: round(priceGram * 1000)
    },
    source: "OroPocket • Silver • INR/gram",
    fallbackUsed: false,
    updatedAt: new Date().toISOString(),
    note: "Reference silver sell price. Local retail rates may differ."
  };
  skLiveSilverCacheTime = Date.now();

  return { ...skLiveSilverCache, cached: false };
}

app.get("/api/gold-rate", async (req, res) => {
  try {
    const rates = await skGetLiveGoldRates();
    res.set("Cache-Control", "no-store");
    res.json({
      ...rates,
      state: req.query.state || "Tamil Nadu",
      district: req.query.district || "Thanjavur",
      date: new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata" }).format(new Date())
    });
  } catch (error) {
    console.error("[Gold Rate] Request failed:", error.message || error);
    res.status(503).json({
      ok: false,
      error: "Live Gold Rate temporarily unavailable.",
      source: null
    });
  }
});

app.get("/api/silver-rate", async (req, res) => {
  try {
    const rates = await skGetLiveSilverRate();
    res.set("Cache-Control", "no-store");
    res.json({
      ...rates,
      state: req.query.state || "Tamil Nadu",
      district: req.query.district || "Thanjavur",
      date: new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata" }).format(new Date())
    });
  } catch (error) {
    console.error("[Silver Rate] Request failed:", error.message || error);
    res.status(503).json({
      ok: false,
      state: req.query.state || "Tamil Nadu",
      district: req.query.district || "Thanjavur",
      error: "Live Silver Rate temporarily unavailable."
    });
  }
});
// END SK_REAL_GOLD_SILVER_API_V1

// SK_HIDE_OLD_20_OPTION_MENU_V1
app.get('/whatsapp-menu.html', (req, res) => res.redirect(302, '/'));
// END SK_HIDE_OLD_20_OPTION_MENU_V1

app.use(express.static(publicPath));

// SK_JOB_REGISTRATION_API_V1
function skJobText(value, max) {
  return typeof value === 'string' ? value.trim() : '';
}

function skValidMobile(value) {
  return /^[+\d()\s-]{7,20}$/.test(value) &&
    (value.match(/\d/g) || []).length >= 7;
}

app.post('/api/jobs/seeker', async (req, res) => {
  if (!jobDbPool) {
    return res.status(503).json({
      ok: false, error: 'Registration service is not configured.'
    });
  }

  const b = req.body || {};
  const name = skJobText(b.name, 101);
  const mobile = skJobText(b.mobile, 21);
  const email = skJobText(b.email, 151);
  const location = skJobText(b.location, 101);
  const education = skJobText(b.education, 51);
  const experience = skJobText(b.experience, 51);
  const jobType = skJobText(b.jobtype, 51);
  const skills = skJobText(b.skills, 1001);

  if (b.consent !== true) {
    return res.status(400).json({
      ok: false, error: 'Please agree to the privacy notice before registering.'
    });
  }

  if (!name || name.length > 100 ||
      !mobile || mobile.length > 20 || !skValidMobile(mobile) ||
      !location || location.length > 100 ||
      !education || education.length > 50 ||
      !jobType || jobType.length > 50 ||
      experience.length > 50 || skills.length > 1000 ||
      email.length > 150 ||
      (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return res.status(400).json({
      ok: false, error: 'Please check the registration details and try again.'
    });
  }

  const allowedEducation = [
    '10th', '12th', 'ITI', 'Diploma', 'UG Degree',
    'PG Degree', 'Engineering', 'Other'
  ];
  const allowedExperience = [
    'Fresher', 'Less than 1 year', '1–3 years',
    '3–5 years', 'More than 5 years'
  ];
  const allowedJobTypes = [
    'Private Job', 'Government Job', 'Full Time',
    'Part Time', 'Work From Home', 'Internship'
  ];

  if (!allowedEducation.includes(education) ||
      !allowedExperience.includes(experience) ||
      !allowedJobTypes.includes(jobType)) {
    return res.status(400).json({
      ok: false, error: 'Please select valid qualification, experience and job type.'
    });
  }

  try {
    const result = await jobDbPool.query(
      `INSERT INTO public.job_seekers
       (full_name, mobile, email, location, education, experience, job_type, skills)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, created_at`,
      [name, mobile, email || null, location, education,
       experience, jobType, skills || null]
    );

    return res.status(201).json({
      ok: true,
      message: 'Registration received successfully. Your application is pending review.',
      referenceId: result.rows[0].id,
      status: 'pending'
    });
  } catch (err) {
    console.error('[Job Seeker Registration] Database error:', err.message);
    return res.status(503).json({
      ok: false, error: 'Registration could not be saved right now. Please try again later.'
    });
  }
});

app.post('/api/jobs/employer', async (req, res) => {
  if (!jobDbPool) {
    return res.status(503).json({
      ok: false, error: 'Registration service is not configured.'
    });
  }

  const b = req.body || {};
  const company = skJobText(b.company, 151);
  const contact = skJobText(b.contact, 101);
  const mobile = skJobText(b.mobile, 21);
  const email = skJobText(b.email, 151);
  const location = skJobText(b.location, 151);
  const title = skJobText(b.title, 151);
  const qualification = skJobText(b.qualification, 201);
  const salary = skJobText(b.salary, 101);
  const jobType = skJobText(b.jobtype, 51);
  const description = skJobText(b.description, 2001);
  const applyUrl = skJobText(b.apply, 301);
  const vacancies = Number(b.vacancies);

  if (b.consent !== true) {
    return res.status(400).json({
      ok: false, error: 'Please agree to the privacy notice before registering.'
    });
  }

  if (!company || company.length > 150 ||
      !contact || contact.length > 100 ||
      !mobile || mobile.length > 20 || !skValidMobile(mobile) ||
      !location || location.length > 150 ||
      !title || title.length > 150 ||
      !Number.isInteger(vacancies) || vacancies < 1 || vacancies > 100000 ||
      qualification.length > 200 || salary.length > 100 ||
      description.length > 2000 || applyUrl.length > 300 ||
      email.length > 150 ||
      (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return res.status(400).json({
      ok: false, error: 'Please check the company and vacancy details and try again.'
    });
  }

  const allowedJobTypes = [
    'Full Time', 'Part Time', 'Contract', 'Internship', 'Work From Home'
  ];

  if (!allowedJobTypes.includes(jobType)) {
    return res.status(400).json({
      ok: false, error: 'Please select a valid job type.'
    });
  }

  if (applyUrl) {
    try {
      const parsed = new URL(applyUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid protocol');
    } catch {
      return res.status(400).json({
        ok: false, error: 'Please enter a valid HTTP or HTTPS application website.'
      });
    }
  }

  try {
    const result = await jobDbPool.query(
      `INSERT INTO public.employer_registrations
       (company, contact_person, mobile, email, location, job_title,
        vacancies, qualification, salary, job_type, description, apply_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING id, created_at`,
      [company, contact, mobile, email || null, location, title,
       vacancies, qualification || null, salary || null, jobType,
       description || null, applyUrl || null]
    );

    return res.status(201).json({
      ok: true,
      message: 'Vacancy submission received. It will remain pending until reviewed.',
      referenceId: result.rows[0].id,
      status: 'pending'
    });
  } catch (err) {
    console.error('[Employer Registration] Database error:', err.message);
    return res.status(503).json({
      ok: false, error: 'Vacancy could not be saved right now. Please try again later.'
    });
  }
});
// END SK_JOB_REGISTRATION_API_V1

app.get('*',(req,res)=>{const fp=path.join(publicPath,'index.html');if(fs.existsSync(fp))res.sendFile(fp);else res.status(404).send('Not Found');});
app.listen(PORT,()=>console.log(`🤖 33 OPTIONS WHATSAPP MENU http://localhost:${PORT} - OK`));
