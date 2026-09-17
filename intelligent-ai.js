const express = require("express");
const router = express.Router();

function detectMode(text = "") {
  const q = text.toLowerCase();

  if (/gold|தங்கம்|தங்க|22k|24k|916|carat|கேரட்/.test(q)) return "GOLD";
  if (/loan|emi|fd|rd|வட்டி|கடன்|லோன்/.test(q)) return "FINANCE";
  if (/bank|banking|வங்கி/.test(q)) return "BANKING";
  if (/job|வேலை|வேலைவாய்ப்பு/.test(q)) return "JOBS";
  if (/education|school|college|கல்வி|படிப்பு/.test(q)) return "EDUCATION";
  if (/news|செய்தி|செய்திகள்/.test(q)) return "NEWS";

  return "GENERAL";
}

console.log("✅ Intelligent AI route loaded: POST /api/intelligent-ai");

router.post("/api/intelligent-ai", async (req, res) => {
  try {
    const { message, source = "website" } = req.body || {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        success: false,
        error: "Message required"
      });
    }

    const text = String(message).trim();

    console.log("🧠 Intelligent AI:", source, "→", text);

    const response = await fetch(
      "http://127.0.0.1:" + (process.env.PORT || 3000) + "/api/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      }
    );

    const data = await response.json();

    res.json({
      success: true,
      app: "SASIKUMAR AI",
      source,
      mode: "AI_CORE",
      message: text,
      reply: data.reply || "பதில் கிடைக்கவில்லை.",
      aiSource: data.source || "unknown",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Intelligent AI error:", error);

    res.status(500).json({
      success: false,
      error: "AI processing error"
    });
  }
});

module.exports = router;
