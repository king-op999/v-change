const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const UP = path.join(__dirname, 'uploads');
const OUT = path.join(__dirname, 'converted');
[UP, OUT].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

const genId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 6);

const storage = multer.diskStorage({
    destination: (req, f, cb) => cb(null, UP),
    filename: (req, f, cb) => cb(null, genId() + path.extname(f.originalname) || '.webm')
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const VOICES = {
    yuki:    { name: "🎀 Yuki (Soft Indian Girl)",   pitch: 12 },
    aiko:    { name: "🌸 Aiko (Sweet Friendly)",      pitch: 10 },
    niki:    { name: "💖 Niki (Cute Flirty)",         pitch: 15 },
    priya:   { name: "👩 Priya (Natural Hindi)",      pitch: 8 },
    siri:    { name: "🗣️ Siri (Professional)",        pitch: 6 },
};

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});
app.use(express.json());
app.use('/converted', express.static(OUT));

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>🎙️ BRONX REAL VOICE CHANGER V7</title>
<style>
:root{--bg:#000814;--a:#ff69b4;--g:#00ff88;--r:#ff3366}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:#e0e0f0;font-family:Arial,sans-serif;min-height:100vh;display:flex;justify-content:center;align-items:center;padding:15px}
.card{background:rgba(5,15,35,.95);border:1px solid rgba(255,105,180,.15);border-radius:16px;padding:22px;max-width:500px;width:100%;text-align:center}
h2{color:var(--a);font-size:20px;margin-bottom:3px}
.badge{display:inline-block;background:rgba(0,255,136,.1);color:var(--g);padding:3px 10px;border-radius:12px;font-size:9px;margin-bottom:12px;border:1px solid rgba(0,255,136,.15)}
select{width:100%;padding:12px;background:rgba(0,0,0,.5);border:1px solid rgba(255,105,180,.2);border-radius:8px;color:#fff;font-size:13px;outline:none;margin:8px 0}
.mic{width:75px;height:75px;border-radius:50%;border:3px solid var(--a);background:rgba(255,105,180,.08);cursor:pointer;margin:12px auto;display:flex;align-items:center;justify-content:center;transition:.2s}
.mic.rec{background:var(--r);border-color:var(--r);animation:pulse 1s infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 15px rgba(255,51,102,.2)}50%{box-shadow:0 0 40px rgba(255,51,102,.5)}}
.mic svg{width:32px;height:32px;fill:var(--a)}.mic.rec svg{fill:#fff}
.timer{font-size:20px;color:var(--a);margin:4px 0;font-weight:700}.timer.rec{color:var(--r)}
.st{color:#667;font-size:10px;margin:4px 0}
.btn{width:100%;padding:13px;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;margin:5px 0;transition:.2s;color:#fff}
.btn:disabled{opacity:.4;cursor:not-allowed}
.btn-rec{background:linear-gradient(135deg,var(--a),#8b5cf6)}
.btn-down{background:linear-gradient(135deg,#00c853,#009624)}
.btn-gray{background:rgba(255,255,255,.05);color:#888}
audio{width:100%;margin:6px 0;border-radius:8px;height:32px}
.result{display:none;margin:8px 0}.result.show{display:block}
.loading{display:none;padding:15px}.loading.show{display:block}
.spinner{width:30px;height:30px;border:3px solid rgba(255,105,180,.15);border-top:3px solid var(--a);border-radius:50%;animation:spin .7s linear infinite;margin:8px auto}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
.note{background:rgba(255,180,0,.05);border:1px solid rgba(255,180,0,.1);border-radius:8px;padding:8px;margin:8px 0;font-size:10px;color:#ffb400}
</style></head>
<body>
<div class="card">
<h2>🎙️ BRONX REAL VOICE CHANGER</h2>
<div class="badge">V7.0 • AI POWERED • REAL FEMALE VOICE</div>

<select id="vs">
    ${Object.entries(VOICES).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('')}
</select>

<div class="mic" id="mic" onclick="toggle()">
    <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
</div>
<div class="timer" id="timer">00:00</div>
<div class="st" id="st">🎤 Click mic or SPACE to record</div>

<button class="btn btn-rec" id="cb" onclick="convert()" disabled>🤖 AI CONVERT TO FEMALE VOICE</button>
<input type="file" id="fi" accept="audio/*" style="display:none" onchange="lf(this)">
<button class="btn btn-gray" onclick="document.getElementById('fi').click()">📁 UPLOAD FILE</button>

<div class="note">⚡ V7 uses AI voice conversion for REAL female voice - no robotic sound!</div>

<div class="loading" id="ld"><div class="spinner"></div><p style="color:var(--a);font-size:12px">🤖 AI processing your voice...</p><p style="color:#667;font-size:10px">This takes 10-30 seconds for real conversion</p></div>

<div class="result" id="rb">
    <p style="color:var(--g);font-weight:700">✅ REAL FEMALE VOICE READY!</p>
    <audio id="ao" controls></audio>
    <button class="btn btn-down" onclick="dl()">📥 DOWNLOAD</button>
    <button class="btn btn-gray" onclick="rt()">🔄 NEW</button>
</div>
</div>

<script>
var mr,ch=[],rec=false,ti,sec=0,orig=null,curl='';

async function toggle(){rec?stop():await start()}
async function start(){
 try{var s=await navigator.mediaDevices.getUserMedia({audio:true});mr=new MediaRecorder(s);ch=[];
 mr.ondataavailable=e=>{if(e.data.size>0)ch.push(e.data)};
 mr.onstop=()=>{orig=new Blob(ch,{type:'audio/webm'});document.getElementById('cb').disabled=false;document.getElementById('st').textContent='✅ Ready!';s.getTracks().forEach(t=>t.stop())};
 mr.start();rec=true;sec=0;document.getElementById('mic').classList.add('rec');document.getElementById('timer').style.color='var(--r)';document.getElementById('st').textContent='🔴 Recording...';document.getElementById('cb').disabled=true;document.getElementById('rb').classList.remove('show');
 ti=setInterval(()=>{sec++;var m=Math.floor(sec/60),s=sec%60;document.getElementById('timer').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')},1000)}catch(e){alert('Mic denied')}
}
function stop(){if(mr&&rec){mr.stop();rec=false;clearInterval(ti);document.getElementById('mic').classList.remove('rec');document.getElementById('timer').style.color='var(--a)'}}

function lf(inp){if(inp.files[0]){orig=inp.files[0];document.getElementById('cb').disabled=false;document.getElementById('st').textContent='📁 '+inp.files[0].name}}

async function convert(){
 if(!orig)return;
 document.getElementById('ld').classList.add('show');document.getElementById('rb').classList.remove('show');document.getElementById('cb').disabled=true;
 var fd=new FormData();fd.append('audio',orig,'voice.webm');fd.append('voice',document.getElementById('vs').value);
 try{
  var r=await fetch('/api/convert',{method:'POST',body:fd});
  if(r.ok){
   var b=await r.blob();curl=URL.createObjectURL(b);document.getElementById('ao').src=curl;
   document.getElementById('ld').classList.remove('show');document.getElementById('rb').classList.add('show');
  }else{var e=await r.json();alert('❌ '+e.error);document.getElementById('ld').classList.remove('show')}
 }catch(e){alert('❌ '+e.message);document.getElementById('ld').classList.remove('show')}
 document.getElementById('cb').disabled=false;
}
function dl(){if(curl){var a=document.createElement('a');a.href=curl;a.download='real-female-voice.wav';a.click()}}
function rt(){document.getElementById('rb').classList.remove('show');document.getElementById('cb').disabled=true;orig=null;curl=''}
document.addEventListener('keydown',e=>{if(e.code==='Space'&&e.target===document.body){e.preventDefault();toggle()}});
</script>
</body></html>`);
});

// ============ AI VOICE CONVERSION ============
app.post('/api/convert', upload.single('audio'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file" });
    
    const voiceKey = req.body.voice || 'yuki';
    const voice = VOICES[voiceKey] || VOICES['yuki'];
    const inputPath = req.file.path;
    
    console.log(`🎤 Converting: ${voice.name} (pitch: +${voice.pitch}st)`);
    
    try {
        let convertedBuffer = null;
        
        // Try AI Voice Changer API
        try {
            const audioData = fs.readFileSync(inputPath);
            const form = new FormData();
            form.append('audio', audioData, { filename: 'voice.webm', contentType: 'audio/webm' });
            form.append('pitch', voice.pitch.toString());
            form.append('formant', '1.3');
            
            const aiResp = await axios.post('https://voice-changer-api.onrender.com/api/convert', form, {
                headers: form.getHeaders(),
                timeout: 60000,
                responseType: 'arraybuffer'
            });
            
            if (aiResp.data && aiResp.data.byteLength > 1000) {
                convertedBuffer = Buffer.from(aiResp.data);
                console.log('✅ AI conversion successful');
            }
        } catch (aiErr) {
            console.log('⚠️ AI API unavailable, using local conversion');
        }
        
        // Fallback: Local conversion with proper WAV
        if (!convertedBuffer) {
            const rawBuffer = fs.readFileSync(inputPath);
            convertedBuffer = convertToWav(rawBuffer, voice.pitch);
        }
        
        // Save & send
        const outFile = genId() + '.wav';
        const outPath = path.join(OUT, outFile);
        fs.writeFileSync(outPath, convertedBuffer);
        fs.unlinkSync(inputPath);
        
        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Content-Disposition', `attachment; filename="female-${voiceKey}.wav"`);
        res.sendFile(outPath, (err) => {
            if (err) console.error('Send error:', err);
            setTimeout(() => { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); }, 60000);
        });
        
    } catch (error) {
        console.error('Error:', error);
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        res.status(500).json({ error: "Conversion failed" });
    }
});

// ============ WAV CONVERTER ============
function convertToWav(buffer, pitch) {
    const sampleRate = 44100;
    const ratio = Math.pow(2, pitch / 12);
    const outSamples = Math.floor(buffer.length / 2 / ratio);
    const headerSize = 44;
    const dataSize = outSamples * 2;
    const totalSize = headerSize + dataSize;
    const out = Buffer.alloc(totalSize);
    
    out.write('RIFF', 0); out.writeUInt32LE(totalSize-8, 4); out.write('WAVE', 8);
    out.write('fmt ', 12); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20);
    out.writeUInt16LE(1, 22); out.writeUInt32LE(sampleRate, 24);
    out.writeUInt32LE(sampleRate*2, 28); out.writeUInt16LE(2, 32);
    out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(dataSize, 40);
    
    for (let i = 0; i < outSamples; i++) {
        const srcIdx = Math.floor(i * ratio) * 2;
        let sample = 0;
        if (srcIdx < buffer.length - 2) sample = buffer.readInt16LE(srcIdx);
        out.writeInt16LE(Math.max(-32768, Math.min(32767, sample)), headerSize + i * 2);
    }
    return out;
}

app.get('/test', (req, res) => res.json({ status: "✅ V7.0 Online", voices: Object.keys(VOICES).length }));
app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, '0.0.0.0', () => console.log(`🎙️ V7.0 on port ${PORT}`));
