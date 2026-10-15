
(function(){
  const quotes=[
    ["முயற்சி திருவினையாக்கும்.","Effort makes success possible."],
    ["கற்றது கைமண் அளவு; கல்லாதது உலகளவு.","What we know is little; what we have yet to learn is vast."],
    ["ஒற்றுமையே பலம்.","Unity is strength."],
    ["நேர்மை என்றும் உயர்வைத் தரும்.","Honesty always leads to dignity."],
    ["நல்ல எண்ணம் நல்ல செயலாகும்.","Good thoughts lead to good actions."]
  ];
  const day=Math.floor(Date.now()/86400000);
  const q=quotes[day%quotes.length];
  document.getElementById("livePonmozhigalText").innerHTML=
    '<div style="font-size:20px;font-weight:800;line-height:1.7">'+q[0]+'</div>'+
    '<div style="margin-top:10px;opacity:.9">'+q[1]+'</div>';
})();
