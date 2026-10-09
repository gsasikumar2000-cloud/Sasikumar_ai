const {
  default: makeWASocket,
  useMultiFileAuthState,
  downloadContentFromMessage
} = require("@whiskeysockets/baileys");

const qrcode = require("qrcode-terminal");
const P = require("pino");

// ===============================
// Tamil + Tanglish + English
// Language Detection
// ===============================
function detectLanguage(text) {
  const t = text.toLowerCase().trim();

  // Tamil Unicode
  const hasTamil = /[\u0B80-\u0BFF]/.test(t);

  // Common Tanglish words
  const tanglishWords = [
    "vanakkam",
    "nandri",
    "epdi",
    "eppadi",
    "irukeenga",
    "irukinga",
    "enna",
    "ennanga",
    "enna panra",
    "enna panreenga",
    "saapteengala",
    "saptiya",
    "saptacha",
    "romba",
    "nalla",
    "venum",
    "vendam",
    "inga",
    "anga",
    "enga",
    "ungal",
    "unga",
    "neenga",
    "naan",
    "naanga",
    "seri",
    "sari",
    "illai",
    "illa",
    "aama",
    "ama",
    "mudiya",
    "theriyuma",
    "puriyala",
    "sollunga",
    "parunga",
    "paarunga"
  ];

  const hasTanglish = tanglishWords.some(word =>
    t.includes(word)
  );

  // Common English words
  const englishWords = [
    "hello",
    "hi",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
    "how are you",
    "what are you doing",
    "thank you",
    "thanks",
    "please",
    "yes",
    "no",
    "okay",
    "ok",
    "help",
    "price",
    "gold",
    "silver",
    "rate",
    "today",
    "recharge",
    "booking",
    "job",
    "education"
  ];

  const hasEnglish = englishWords.some(word =>
    t.includes(word)
  );

  // Tamil + English/Tanglish
  if (hasTamil && (hasTanglish || hasEnglish)) {
    return "mixed";
  }

  if (hasTamil) {
    return "tamil";
  }

  if (hasTanglish) {
    return "tanglish";
  }

  if (hasEnglish) {
    return "english";
  }

  // Default
  return "english";
}


// ===============================
// Start WhatsApp Bot
// ===============================
async function startBot() {
  const { state, saveCreds } =
    await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  if (!state.creds.registered) {
    const phoneNumber = process.env.WHATSAPP_PHONE_NUMBER;

    if (phoneNumber) {
      setTimeout(async () => {
        try {
          const code = await sock.requestPairingCode(phoneNumber);
          console.log("📱 WhatsApp Pairing Code:", code);
        } catch (pairingError) {
          console.log(
            "❌ WhatsApp Pairing Code Error:",
            pairingError.message
          );
        }
      }, 3000);
    } else {
      console.log("⚠️ WHATSAPP_PHONE_NUMBER not set → QR pairing enabled");
    }
  }

  // Connection
  sock.ev.on("connection.update", (update) => {
    const { connection, qr } = update;

    if (qr) {
      console.log("📱 WhatsApp QR Scan:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ SASIKUMAR AI WhatsApp Bot Connected");
    }

    if (connection === "close") {
      console.log("❌ WhatsApp disconnected. Restarting...");
      setTimeout(startBot, 5000);
    }
  });


  // ===============================
  // Incoming Messages
  // ===============================
  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const msg = messages[0];

      if (!msg.message || msg.key.fromMe) return;

      const jid = msg.key.remoteJid;

      // ===============================
      // WhatsApp VOICE MESSAGE
      // ===============================
      const audioMessage =
        msg.message.audioMessage;

      let text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        "";

      if (audioMessage) {
        console.log("🎤 Voice message received");

        try {
          const stream = await downloadContentFromMessage(
            audioMessage,
            "audio"
          );

          const chunks = [];

          for await (const chunk of stream) {
            chunks.push(chunk);
          }

          const audioBuffer = Buffer.concat(chunks);

          console.log(
            "🎤 Voice downloaded:",
            audioBuffer.length,
            "bytes"
          );

          const voiceMime =
            String(audioMessage.mimetype || "audio/ogg").split(";")[0];

          console.log("🎤 Voice MIME:", voiceMime);

          const voicePrompt =
            "The user sent a WhatsApp voice message. " +
            "First understand/transcribe the spoken request internally, " +
            "then answer the user's request clearly. " +
            "Do not explain the transcription process.";

          let voiceReply;

          try {
            voiceReply = await askAI(
              voicePrompt,
              "",
              {
                data: audioBuffer.toString("base64"),
                type: voiceMime
              }
            );

            if (!voiceReply || !voiceReply.trim()) {
              voiceReply = "மன்னிக்கவும் 🙏 Voice message-க்கு பதில் கிடைக்கவில்லை.";
            }
          } catch (voiceAIError) {
            console.log(
              "❌ Voice AI Error:",
              voiceAIError.message
            );

            voiceReply =
              "மன்னிக்கவும் 🙏 Voice message-ஐ தற்போது AI மூலம் புரிந்துகொள்ள முடியவில்லை.";
          }

          await sock.sendMessage(jid, {
            text: voiceReply
          });

          return;
        } catch (voiceError) {
          console.log(
            "❌ Voice download error:",
            voiceError.message
          );

          await sock.sendMessage(jid, {
            text: "மன்னிக்கவும் 🙏 Voice message-ஐ பெற முடியவில்லை."
          });

          return;
        }
      }

      if (!text.trim()) return;

      const lower = text.toLowerCase();

      const language = detectLanguage(text);

      console.log(
        `📩 Message: ${text} | Language: ${language}`
      );

      // ===============================
      // SASIKUMAR AI MULTI-LANGUAGE REPLY
      // ===============================
      let reply = "";

      try {
        reply = await askAI(
          text,
          language,
          null
        );

        if (!reply || !reply.trim()) {
          reply = "Sorry, I could not generate a reply.";
        }
      } catch (aiError) {
        console.log("⚠️ AI Reply Error:", aiError.message);

        if (language === "tamil" || language === "tanglish") {
          reply = "மன்னிக்கவும் 🙏 தற்போது AI பதில் கிடைக்கவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.";
        } else {
          reply = "Sorry 🙏 SASIKUMAR AI is temporarily unable to reply. Please try again later.";
        }
      }

      await sock.sendMessage(jid, {
        text: reply
      });

    } catch (error) {
      console.log("❌ Message Error:", error.message);
    }
  });
}

startBot();
