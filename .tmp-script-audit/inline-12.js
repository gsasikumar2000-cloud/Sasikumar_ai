
function educationAsk(service){
  const input=document.querySelector("#chat input, #chat textarea, input[type='text'], textarea");
  if(input){
    input.value=service+" பற்றி கல்வி உதவி வேண்டும்";
    input.dispatchEvent(new Event("input",{bubbles:true}));
    input.focus();
    const chat=document.getElementById("chat");
    if(chat) chat.scrollIntoView({behavior:"smooth"});
  }else{
    alert(service+" பற்றி SASIKUMAR AI-யிடம் கேளுங்கள்.");
  }
}
