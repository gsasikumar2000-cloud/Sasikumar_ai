
const dailyMessages = [
  "📢 இன்று SASIKUMAR AI-யை பயன்படுத்துங்கள் — கல்வி, கணக்கீடு, AI உதவி மற்றும் பல பயனுள்ள கருவிகள் ஒரே இடத்தில்!",
  "🪙 தங்கம் & வெள்ளி தொடர்பான கணக்கீடுகள் மற்றும் தகவல்களுக்கு SASIKUMAR AI-யைப் பயன்படுத்துங்கள்.",
  "📚 மாணவர்களுக்கான Q&A, Learning மற்றும் Education AI சேவைகள் SASIKUMAR AI-ல் கிடைக்கின்றன.",
  "💰 EMI, வட்டி, Loan மற்றும் Finance கணக்கீடுகளை எளிதாக செய்ய SASIKUMAR AI Tool Kit-ஐ பயன்படுத்துங்கள்.",
  "🤖 உங்கள் கேள்விகளை Tamil அல்லது English-ல் கேளுங்கள் — SASIKUMAR AI உதவ தயாராக உள்ளது.",
  "🧰 Calculation, Finance, Gold, Business, Study, AI மற்றும் பல Smart Tools — SASIKUMAR AI Tool Kit-ல்!",
  "🌟 SASIKUMAR AI — தினசரி தகவல்கள், Learning, Finance, Gold மற்றும் Smart AI Tools அனைத்தும் ஒரே website-ல்!"
];

const dailyColors = [
  ["#1565c0","#42a5f5"],
  ["#6a1b9a","#ab47bc"],
  ["#00695c","#26a69a"],
  ["#ef6c00","#ffa726"],
  ["#283593","#5c6bc0"],
  ["#2e7d32","#66bb6a"],
  ["#ad1457","#ec407a"]
];

const today = new Date();
const start = new Date(today.getFullYear(),0,1);
const dayIndex = Math.floor((today-start)/86400000) % 7;

document.getElementById("dailyMessageText").textContent =
  dailyMessages[dayIndex];

const colors = dailyColors[dayIndex];
document.getElementById("dailyScrollingMessage").style.background =
  `linear-gradient(90deg,${colors[0]},${colors[1]})`;
