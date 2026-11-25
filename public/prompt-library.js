/* SASIKUMAR AI — FULL PROMPT KNOWLEDGE LIBRARY */
(function () {
'use strict';

const executive = [
'PLAIN','PRO','FOUNDER','COACH','SKEPTIC','TEACHER',
'FIVE','TIGHT','LONGFORM','SELL','CALM','DIG','GUT',
'DEVIL','FIRSTPRINCIPLES','LONGGAME','WORKSPACE','BESTCASE',
'TRADEOFFS','REFRAME','ZOOMOUT','ZOOMIN','REMIX','TWIST',
'MASHUP','WILD','SAFE','NAME','OPENERS','STORY','METAPHOR',
'SERIES','HOOK','PITCH','GOALS','BUDGET','RISK','MARKET',
'PERSONA','ROADMAP','KPI','NEGOTIATE','SCALE','EXIT',
'TEACHME','QUIZ','RECAP','GAPS','SOURCES','DEBATE',
'HISTORY','FORECAST','JARGON','KIDSAFE','ONELINE','OUTLINE',
'CHECKLIST','TEMPLATE','TABLE','MATRIX','TIMELINE','BULLETS',
'JSON','FORM','SCRIPT','BRIEF','CODE','DEBUG','REFACTOR',
'COMMENT','TEST','EXPLAINIT','STEP','OPTIMIZE','CONVERT',
'SCHEMA','API','SECURE','COMPARE','PROCONS','DECIDE','ROOT',
'DATA','PATTERN','ASSUMPTION','VERIFY','COUNTER','SIMPLIFY',
'IMPROVE','AUTOMATE','REUSABLE','HABIT','FRAME','GRIDIT',
'REVERSE','ROLEPLAY','PUSHBACK','FINALCHECK','ALLIN'
];

const photo = [
'NATURALSKIN','SKINRETOUCH','PROFESSIONALRETOUCH',
'PORTRAITENHANCE','FACIALENHANCE','SHARPENFACE',
'SOFTPORTRAIT','PORTRAITPOLISH','PREMIUMTOUCH',
'LUXURY PORTRAIT','EDITORIALPORTRAIT','MAGAZINECOVER',
'FASHIONEDITORIAL','STREETPORTRAIT','CANDIDPORTRAIT',
'DRAMATICPORTRAIT','CREATIVEPORTRAIT','MOODYPORTRAIT',
'CINEMATICPORTRAIT','CINEMATICSELFIE','DSRLLOOK',
'4KPORTRAIT','PORTRAITBOKEH','INSTAGRAM PORTRAIT',
'VIRALPHOTOSHOOT','GOLDENHOUR','SUNSETPORTRAIT',
'SUNRISEPORTRAIT','NIGHTPORTRAIT','NEONPORTRAIT',
'SOFTGLOW','DREAMYGLOW','ETHEREALPORTRAIT',
'DRAMATICLIGHTING','SOFTLIGHTING','RIMLIGHTING',
'GOLDENLIGHTING','STUDIOLIGHTING','LOWKEYPORTRAIT',
'HIGHKEYPORTRAIT','BLACKANDWHITE','FILMLOOK',
'VINTAGEFILM','90SFILM','RETRPORTRAIT','ANALOGLOOK',
'KODAKLOOK','CINEMATICCOLOR','TEALORANGE','MATTEFINISH',
'HIGHCONTRAST','COLORGRADING','CINEMATICGRADING',
'FASHIONCOLORGRADE','LUXURY COLORGRADE','COLORPOP',
'NATURALCOLORS','COLORRESTORE','HDRBOOST',
'RESOLUTIONBOOST','OLDPHOTORESTORE','PHOTOCLEANUP',
'OBJECTREMOVE','BACKGROUNDCLEANUP','BACKGROUNDREPLACE',
'BACKGROUNDBLUR','DEPTHOFFIELD','LENSBLUR',
'RAINYCINEMATIC','MONSOONPORTRAIT','WINTERPORTRAIT',
'SUMMERPORTRAIT','AUTUMNPORTRAIT','SPRINGPORTRAIT',
'NATUREPORTRAIT','TRAVELPORTRAIT','TRAVELCINEMATIC',
'BEACHPORTRAIT','MOUNTAINPORTRAIT','CITYPORTRAIT',
'URBANLOOK','ARCHITECTUREPORTRAIT','CARCINEMATIC',
'BIKECINEMATIC','PRODUCTPHOTOGRAPHY','PRODUCTLUXURY',
'PRODUCTSTUDIO','SOCIALPHOTOGRAPHY','FLATLAYPHOTOGRAPHY',
'INSTAGRAMSTORY','REELCOVER','PROFILEPICTURE',
'PROFESSIONALHEADSHOT','CORPORATEPORTRAIT',
'LINKEDINHEADSHOT','YOUTUBETHUMBNAIL','WEDDINGPORTRAIT',
'FESTIVEPORTRAIT','TRADITIONALPORTRAIT','ROYALPORTRAIT'
];

const categories = [
'Business Growth','Marketing & Sales','Gold Business & Jewellery',
'Gold Appraisal','Agriculture & Farming','Finance & Accounting',
'Education & Research','Indian Legal Information',
'Website & App Development','AI Image & Poster Creation',
'AI Video Creation','YouTube & Social Media',
'News & Market Analysis','Productivity & Planning'
];

const descriptions = {
PLAIN:'Explain using simple words and easy examples.',
PRO:'Answer like an experienced professional in this field.',
FOUNDER:'Think like a business founder and focus on customers, value and growth.',
COACH:'Guide me step by step like a supportive mentor.',
SKEPTIC:'Identify problems, risks and weak assumptions before deciding.',
TEACHER:'Teach patiently with clear explanations and examples.',
DIG:'Research deeply and do not miss important details.',
DEVIL:'Challenge the idea and explain the opposing view.',
FIRSTPRINCIPLES:'Break the problem down to its basic facts and rebuild the solution.',
LONGGAME:'Think five years ahead and explain long-term consequences.',
PITCH:'Turn this into a short, persuasive business pitch.',
GOALS:'Convert this idea into measurable goals and actions.',
BUDGET:'Prepare a practical budget with cost breakdown.',
RISK:'Identify risks and explain how to reduce them.',
MARKET:'Analyze the target market and competitors.',
ROADMAP:'Create a step-by-step implementation timeline.',
KPI:'Define measurable performance indicators.',
TEACHME:'Teach me step by step and check my understanding.',
QUIZ:'Create practice questions with answers and explanations.',
RECAP:'Summarize the important points.',
CHECKLIST:'Convert this into an actionable checklist.',
TABLE:'Organize the information into a clear table.',
TIMELINE:'Arrange the tasks in chronological order.',
CODE:'Write clear, working code and explain how to use it.',
DEBUG:'Find the root cause of the error and suggest a safe fix.',
TEST:'Create tests and explain expected results.',
API:'Explain or design the API endpoints and data flow.',
SECURE:'Review security risks and recommend safer practices.',
COMPARE:'Compare the available options with advantages and disadvantages.',
DECIDE:'Evaluate options and recommend a reasoned decision.',
VERIFY:'Separate verified facts from assumptions and unknowns.',
AUTOMATE:'Design a practical automation workflow.',
FINALCHECK:'Review the result for missing details, errors and risks.',
ALLIN:'Provide a comprehensive answer with plan, examples, risks and next steps.'
};

const photoInstruction =
'Edit the uploaded photo according to this style. Preserve the person’s identity, facial features, natural proportions and realistic appearance. Apply the requested lighting, color, background or retouching effect carefully. Avoid unwanted face changes, artificial skin and invented details. If no photo is uploaded, explain what image is needed.';

function title(code) {
 return code.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
   .replace(/[_-]+/g, ' ')
   .toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
}

function makeItem(code, group, index) {
 const isPhoto = group === 'Photo Editing';
 const description = descriptions[code] ||
   (isPhoto ? photoInstruction :
   'Help with '+title(code)+'. Explain the concept, provide practical steps, examples, possible risks and useful next actions.');
 return {
  id: group === 'Photo Editing' ? 'PHOTO-'+(index+1) : 'EXEC-'+(index+1),
  shortForm: '/'+code.replace(/\s/g,''),
  name: title(code),
  category: group,
  tamil: isPhoto
   ? 'படத்தில் '+title(code)+' விளைவை இயல்பாகச் செய்ய உதவும் கட்டளை.'
   : 'இந்த கட்டளை மூலம் '+title(code)+' தொடர்பான விளக்கம் மற்றும் நடைமுறை வழிகாட்டல் பெறலாம்.',
  english: description,
  instruction: isPhoto ? photoInstruction :
   'Act as a knowledgeable '+title(code)+' assistant. '+description+
   ' Give accurate, structured and practical guidance. Explain important terms, assumptions, examples, limitations and next steps. Do not invent facts. If information is missing, ask a clear question. Answer in the user selected language.',
  example: isPhoto
   ? 'இந்தப் புகைப்படத்தில் '+title(code)+' effect பயன்படுத்தவும்.'
   : thisExample(code)
 };
}

function thisExample(code) {
 return ' /'+code+' எனது கேள்வி: இதை நடைமுறையில் எப்படி செய்வது? உதாரணங்களுடன் விளக்குங்கள்.';
}

const items = [
 ...executive.map((x,i)=>makeItem(x,'Executive Commands',i)),
 ...photo.map((x,i)=>makeItem(x,'Photo Editing',i))
];

const knowledgeItems = categories.map((name,i)=>({
 id:'KNOW-'+(i+1),
 shortForm:'/KNOW'+(i+1),
 name,
 category:'Knowledge',
 tamil:name+' பற்றிய முழுமையான தமிழ் வழிகாட்டல்.',
 english:'Provide practical knowledge, examples, important concepts and step-by-step guidance about '+name+'.',
 instruction:'Act as a knowledgeable '+name+' advisor. Explain fundamentals, practical methods, examples, costs or requirements when relevant, common mistakes, risks and next steps. Distinguish facts from estimates. Do not guarantee results. Answer in the selected language.',
 example:name+' பற்றி முழுமையாக விளக்குங்கள்.'
}));

const library = {
 name:'SASIKUMAR AI Prompt Knowledge Library',
 version:'1.0',
 commands:items,
 knowledge:knowledgeItems,
 categories:[...new Set(items.map(x=>x.category)),'Knowledge'],
 search(query) {
  const q=String(query||'').toLowerCase().replace('/','');
  return [...items,...knowledgeItems].filter(x=>
   [x.shortForm,x.name,x.category,x.tamil,x.english]
    .some(v=>String(v).toLowerCase().includes(q))
  );
 },
 get(shortForm) {
  const q=String(shortForm||'').toLowerCase();
  return [...items,...knowledgeItems].find(x=>
   x.shortForm.toLowerCase()===q
  )||null;
 }
};

window.SKPROMPTLIBRARY=library;
console.log('[SK Prompt Library] Loaded:',items.length,'commands +',knowledgeItems.length,'knowledge categories');
})();
