import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const publicPath = path.join(__dirname, 'public');
console.log('Checking public:', publicPath, fs.existsSync(publicPath));
console.log('Checking index:', path.join(publicPath,'index.html'), fs.existsSync(path.join(publicPath,'index.html')));
app.use(express.static(publicPath));
app.get('*', (req,res)=>{
  const filePath = path.join(publicPath,'index.html');
  if(fs.existsSync(filePath)){res.sendFile(filePath);}else{res.status(404).send('Not Found - public/index.html missing. Path: '+filePath);}
});
const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=> console.log(`GLOBAL API FIXED - Server http://localhost:${PORT} - File exists: ${fs.existsSync(path.join(publicPath,'index.html'))}`));
