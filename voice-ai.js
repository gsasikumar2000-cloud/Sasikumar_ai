const express = require("express");
const router = express.Router();

router.post("/api/voice-ai", async (req, res) => {
  try {
    const { text = "" } = req.body || {};

    if (!String(text).trim()) {
      return res.status(400).json({
        success: false,
        error: "Voice text required"
      });
    }

    const response = await fetch("http://localhost:" + (process.env.PORT || 3000) + "/api/intelligent-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: String(text).trim(),
        source: "voice"
      })
    });

    const data = await response.json();

    res.json({
      success: true,
      app: "SASIKUMAR AI",
      source: "voice",
      mode: data.mode,
      reply: data.reply
    });
  } catch (error) {
    console.error("Voice AI error:", error);
    res.status(500).json({
      success: false,
      error: "Voice AI connection error"
    });
  }
});

module.exports = router;
