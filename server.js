// Simple Backend for All Live Sir
const express = require('express');
const app = express();
app.use(express.static('.'));
app.use(express.static('public'));

app.get('/api/live', (req,res)=>{
res.json({
sports:{title:"விளையாட்டு செய்திகள்",live:"CSK vs MI - CSK Won"},
ponmozhi:{ta:"நேர்மை என்றும் உயர்வைத் தரும்",en:"Honesty always leads to dignity"},
thirukkural:{ta:"அறத்தான் வருவதே இன்பம்",en:"Virtue brings happiness"},
gold:{rate:"₹7,250/gram",date:new Date().toLocaleDateString()},
news:{title:"Breaking Tamil News Live"},
updated:new Date().toISOString()
});
});
app.listen(process.env.PORT||10000, ()=>console.log("Backend Live Sir"))
