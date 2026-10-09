class GeneralAI {
  constructor(){
    this.memory=[];
    this.knowledge={
      code: "I can code in any language Sir!",
      render: "Render deploy automatic!",
      github: "GitHub push auto!",
      tamil: "Vanakkam Sir! Tamil, English rendum theriyum!",
      general: "Naan General AI - ethuvum pannuven Sir!"
    };
  }
  think(input){
    this.memory.push(input);
    let lower=input.toLowerCase();
    if(lower.includes('code')||lower.includes('program')) return "💻 Code ready Sir! Enna language? JS, Python, HTML?";
    if(lower.includes('tamil')) return "🇮🇳 Vanakkam Sir! Ungaluku enna venum?";
    if(lower.includes('image')||lower.includes('photo')) return "🖼️ Image generate pannava Sir?";
    if(lower.includes('search')) return "🔍 Web search integrate pannidlam Sir!";
    if(lower.includes('auto')) return "🔄 Auto.sh running - 2min auto push ON!";
    return `🧠 General AI: "${input}" - Naan purinjikiten Sir! Ethuvum seiya ready! [Memory: ${this.memory.length} chats]`;
  }
  learn(){
    return `📚 Learning... Total chats: ${this.memory.length} | Status: Super Intelligent`;
  }
}
window.GAI = new GeneralAI();
