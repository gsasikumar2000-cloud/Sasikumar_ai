
(function(){
  const kurals=[
    ["1","அகர முதல எழுத்தெல்லாம் ஆதி / பகவன் முதற்றே உலகு","எல்லா எழுத்துகளுக்கும் ‘அ’ முதல் எழுத்தாக இருப்பது போல, உலகிற்கு இறைவனே முதன்மையானவன்.","Just as ‘A’ is the first of all letters, the Divine is the first cause of the world."],
    ["2","கற்றதனால் ஆய பயனென்கொல் வாலறிவன் / நற்றாள் தொழாஅர் எனின்","கற்ற கல்வி நல்ல அறிவையும் உயர்ந்த வாழ்வையும் தர வேண்டும்; இல்லையெனில் அதன் பயன் குறையும்.","Learning is truly useful when it leads to wisdom and a better life."],
    ["3","மலர்மிசை ஏகினான் மாணடி சேர்ந்தார் / நிலமிசை நீடுவாழ் வார்","உயர்ந்த நெறியைப் பின்பற்றுபவர்கள் நல்ல புகழுடன் நீண்ட காலம் வாழ்வார்கள்.","Those who follow the highest virtue live with lasting good repute."],
    ["4","வேண்டுதல் வேண்டாமை இலானடி சேர்ந்தார்க்கு / யாண்டும் இடும்பை இல","பற்றும் வெறுப்பும் இல்லாத உயர்ந்த நெறியைச் சேர்ந்தவர்களுக்கு துன்பம் குறையும்.","Those who live free from attachment and aversion find freedom from suffering."],
    ["5","இருள்சேர் இருவினையும் சேரா இறைவன் / பொருள்சேர் புகழ்புரிந்தார் மாட்டு","நல்லொழுக்கத்தையும் உயர்ந்த நெறியையும் போற்றுபவர்களை தீய விளைவுகள் அணுகாது.","Those who live by noble virtue avoid the harmful consequences of wrongdoing."]
  ];
  const day=Math.floor(Date.now()/86400000);
  const k=kurals[day%kurals.length];
  document.getElementById("dailyKural").innerHTML=
    '<div style="font-weight:700;margin:8px 0">குறள் எண் '+k[0]+'</div>'+
    '<div style="font-size:18px;line-height:1.7">'+k[1]+'</div>'+
    '<div style="margin-top:10px"><b>விளக்கம்:</b> '+k[2]+'</div>'+
    '<div style="margin-top:8px;opacity:.85"><b>English:</b> '+k[3]+'</div>';
})();
