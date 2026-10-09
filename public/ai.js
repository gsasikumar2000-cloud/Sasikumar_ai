const AI = {
  chat: async (msg) => {
    const replies = {
      hi: "Vanakkam Sir! Sasikumar AI ready! 🚀",
      ponmozhi: "💎 Ponmozhi 2min la ready Sir - Live card on the way!",
      cricket: "🏏 Live Score API connected - Score update pannidlam!",
      deploy: "Render auto deploy ON - 2min la live!"
    };
    let m = msg.toLowerCase();
    for(let k in replies) if(m.includes(k)) return replies[k];
    return `🤖 AI: "${msg}" received Sir - Processing intelligently...`;
  },
  autoThink: () => {
    console.log("🧠 Sasikumar AI Thinking...");
    setInterval(() => {
      document.title = "🤖 AI Live " + new Date().toLocaleTimeString();
    }, 2000);
  }
};
AI.autoThink();
