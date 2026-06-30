// ============================================
// 🎙️ BRONX VOICE CHANGER V3.0
// ULTIMATE KILLER UPDATE - ALL FIXED
// ============================================
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');
const OUTPUT_DIR = path.join(__dirname, 'public', 'converted');
[UPLOAD_DIR, OUTPUT_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

const genId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

// ============ 10 VOICE PRESETS ============
const VOICES = {
    yuki:    { name: "🎀 Yuki",    emoji: "🎀", pitch: 12, tempo: 1.05, desc: "Soft Indian Girl" },
    aiko:    { name: "🌸 Aiko",    emoji: "🌸", pitch: 10, tempo: 1.0,  desc: "Sweet Friendly" },
    niki:    { name: "💖 Niki",    emoji: "💖", pitch: 15, tempo: 1.08, desc: "Cute Flirty" },
    priya:   { name: "👩 Priya",   emoji: "👩", pitch: 8,  tempo: 0.95, desc: "Natural Hindi" },
    siri:    { name: "🗣️ Siri",    emoji: "🗣️", pitch: 6,  tempo: 0.9,  desc: "Professional" },
    deepika: { name: "💫 Deepika", emoji: "💫", pitch: 14, tempo: 1.02, desc: "Bollywood" },
    kavya:   { name: "🎶 Kavya",   emoji: "🎶", pitch: 16, tempo: 1.05, desc: "Melodious" },
    baby:    { name: "👶 Baby",    emoji: "👶", pitch: 24, tempo: 1.2,  desc: "Cartoon Voice" },
    robot:   { name: "🤖 Robot",   emoji: "🤖", pitch: 4,  tempo: 0.8,  desc: "Female Robot" },
    angel:   { name: "👼 Angel",   emoji: "👼", pitch: 8,  tempo: 0.9,  desc: "Heavenly Voice" },
};

const FORMATS = {
    wav:  { name: "WAV (Best Quality)", mime: 'audio/wav',  ext: '.wav' },
    mp3:  { name: "MP3 (Small Size)",   mime: 'audio/mpeg', ext: '.mp3' },
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, genId() + path.extname(file.originalname) || '.webm')
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============ HOME PAGE ============
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>🎙️ BRONX VOICE CHANGER V3</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        :root{--bg:#000814;--a:#ff69b4;--a2:#8b5cf6;--g:#00ff88;--r:#ff3366;--y:#ffb400;--c:#00d4ff}
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:var(--bg);color:#e0e0f0;font-family:'Rajdhani',sans-serif;min-height:100vh}
        body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse at 30% -10%,rgba(255,105,180,.04),transparent 50%),radial-gradient(ellipse at 70% 100%,rgba(138,92,246,.03),transparent 50%);pointer-events:none;z-index:0}
        .container{max-width:750px;margin:0 auto;padding:15px;position:relative;z-index:1}
        .header{text-align:center;padding:20px 0 10px}
        .header h1{font-family:'Orbitron',sans-serif;font-size:clamp(20px,5vw,30px);background:linear-gradient(90deg,var(--a),var(--a2),var(--c));background-size:200% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:rb 3s linear infinite}@keyframes rb{0%{background-position:0% 50%}100%{background-position:200% 50%}}
        .ver{color:var(--a);font-size:10px;letter-spacing:4px}
        .card{background:rgba(5,15,35,.9);border:1px solid rgba(255,105,180,.1);border-radius:14px;padding:16px;margin:10px 0;backdrop-filter:blur(10px)}
        .card h3{color:#fff;font-size:14px;margin-bottom:10px;display:flex;align-items:center;gap:8px}
        
        .voice-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:5px}
        @media(max-width:500px){.voice-grid{grid-template-columns:repeat(3,1fr)}}
        .vbtn{background:rgba(255,105,180,.04);color:#aaa;padding:10px 5px;border-radius:10px;font-size:9px;cursor:pointer;border:1px solid rgba(255,105,180,.08);text-align:center;transition:.2s}
        .vbtn:hover{background:rgba(255,105,180,.1);color:#fff}
        .vbtn.on{background:linear-gradient(135deg,var(--a),var(--a2));color:#fff;border-color:transparent;font-weight:700}
        .vbtn .emoji{font-size:20px;display:block;margin-bottom:2px}
        
        select{width:100%;padding:10px;background:rgba(0,0,0,.5);border:1px solid rgba(255,105,180,.15);border-radius:8px;color:#fff;font-size:12px;outline:none;margin:6px 0;font-family:'Rajdhani',sans-serif}
        
        .mic-section{text-align:center;padding:10px 0}
        .mic-btn{width:100px;height:100px;border-radius:50%;border:4px solid var(--a);background:rgba(255,105,180,.06);cursor:pointer;margin:0 auto;display:flex;align-items:center;justify-content:center;transition:.3s}
        .mic-btn:hover{transform:scale(1.05);box-shadow:0 0 40px rgba(255,105,180,.2)}
        .mic-btn.rec{background:var(--r);border-color:var(--r);animation:pulse 1s infinite}
        @keyframes pulse{0%,100%{box-shadow:0 0 15px rgba(255,51,102,.2)}50%{box-shadow:0 0 45px rgba(255,51,102,.5)}}
        .mic-btn svg{width:40px;height:40px;fill:var(--a)}.mic-btn.rec svg{fill:#fff}
        .timer{font-size:28px;font-family:'Orbitron',sans-serif;color:var(--a);margin:6px 0;font-weight:700}
        .timer.rec{color:var(--r)}
        .status{text-align:center;color:#667;font-size:11px;margin:4px 0}
        
        button{width:100%;padding:13px;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-family:'Orbitron',sans-serif;font-size:13px;margin:5px 0;transition:.3s;text-transform:uppercase;letter-spacing:1px}
        button:hover:not(:disabled){transform:translateY(-2px)}
        button:disabled{opacity:.4;cursor:not-allowed}
        .btn-convert{background:linear-gradient(135deg,var(--a),var(--a2));color:#fff}
        .btn-convert:hover:not(:disabled){box-shadow:0 0 30px rgba(255,105,180,.3)}
        .btn-download{background:linear-gradient(135deg,#00c853,#009624);color:#fff}
        .btn-reset{background:rgba(255,255,255,.05);color:#888}
        
        .result-box{display:none;margin:10px 0}
        .result-box.show{display:block}
        .compare{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}
        .acard{background:rgba(0,0,0,.3);padding:10px;border-radius:8px;text-align:center}
        .acard .lbl{font-size:10px;color:#667;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px}
        audio{width:100%;margin:4px 0;border-radius:6px;height:32px}
        
        .loading{display:none;text-align:center;padding:20px}
        .loading.show{display:block}
        .spinner{width:35px;height:35px;border:3px solid rgba(255,105,180,.1);border-top:3px solid var(--a);border-radius:50%;animation:spin .7s linear infinite;margin:8px auto}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        
        .stats-inline{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0}
        .stat-mini{background:rgba(0,0,0,.3);padding:8px;border-radius:6px;text-align:center}
        .stat-mini .v{font-size:15px;font-weight:700;color:var(--a)}
        .stat-mini .l{font-size:8px;color:#667;text-transform:uppercase}
        
        .voice-wave{display:flex;align-items:center;justify-content:center;gap:2px;height:25px;margin:6px 0}
        .voice-wave .bar{width:3px;background:var(--a);border-radius:2px;transition:height .05s;min-height:3px}
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>🎙️ BRONX VOICE CHANGER</h1>
        <div class="ver">VERSION 3.0 • ULTIMATE</div>
    </div>

    <div class="card">
        <h3>👩‍🦰 SELECT VOICE</h3>
        <div class="voice-grid">
            ${Object.entries(VOICES).map(([k,v]) => `<div class="vbtn ${k==='yuki'?'on':''}" onclick="sv('${k}',this)"><span class="emoji">${v.emoji}</span>${v.name.split(' ')[1]||v.name}</div>`).join('')}
        </div>
        <select id="vs" onchange="sv(this.value)">${Object.entries(VOICES).map(([k,v])=>`<option value="${k}">${v.emoji} ${v.name} - ${v.desc}</option>`).join('')}</select>
        <select id="fmt"><option value="wav">WAV (Best Quality)</option><option value="mp3">MP3 (Small Size)</option></select>
    </div>

    <div class="card">
        <h3>🎤 RECORD & CONVERT</h3>
        <div class="mic-section">
            <div class="mic-btn" id="mb" onclick="tr()"><svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg></div>
            <div class="timer" id="tm">00:00</div>
            <div class="voice-wave" id="wv">${Array(30).fill(0).map((_,i)=>`<div class="bar" id="b${i}" style="height:${Math.random()*8+3}px"></div>`).join('')}</div>
        </div>
        <div class="status" id="st">🎤 Click mic or SPACE to record</div>
        
        <div class="stats-inline">
            <div class="stat-mini"><div class="v" id="sp">--</div><div class="l">Pitch</div></div>
            <div class="stat-mini"><div class="v" id="ss">--</div><div class="l">Size</div></div>
            <div class="stat-mini"><div class="v" id="sf">--</div><div class="l">Format</div></div>
        </div>
        
        <button class="btn-convert" id="cb" onclick="cv()" disabled>🎙️ CONVERT TO FEMALE VOICE</button>
        <button class="btn-reset" onclick="document.getElementById('fi').click()">📁 UPLOAD FILE INSTEAD</button>
        <input type="file" id="fi" accept="audio/*" style="display:none" onchange="hf(this)">
    </div>

    <div class="loading" id="ld">
        <div class="spinner"></div>
        <p style="color:var(--a);font-size:13px">🎤 Converting with pitch shift...</p>
        <p style="color:#667;font-size:10px">This takes 5-15 seconds</p>
    </div>

    <div class="result-box" id="rb">
        <div class="card">
            <h3>✅ CONVERTED!</h3>
            <div class="compare">
                <div class="acard"><div class="lbl">🎤 ORIGINAL</div><audio id="oa" controls></audio></div>
                <div class="acard"><div class="lbl">👩‍🦰 FEMALE</div><audio id="ca" controls></audio></div>
            </div>
            <button class="btn-download" onclick="dl()">📥 DOWNLOAD FEMALE VOICE</button>
            <button class="btn-reset" onclick="rt()">🔄 RECORD NEW</button>
        </div>
    </div>
</div>

<script>
var mr,ch=[],rc=false,ti,sec=0,voice='yuki',orig=null,conv=null,wi;

function sv(v,el){voice=v;document.querySelectorAll('.vbtn').forEach(b=>b.classList.remove('on'));if(el)el.classList.add('on');document.getElementById('vs').value=v;var vd=VOICES[v];document.getElementById('sp').textContent='+'+vd.pitch+'st';document.getElementById('sf').textContent=document.getElementById('fmt').value.toUpperCase()}

async function tr(){rc?stop():await start()}
async function start(){
 try{var s=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
 mr=new MediaRecorder(s,{mimeType:'audio/webm;codecs=opus'});ch=[];
 mr.ondataavailable=e=>{if(e.data.size>0)ch.push(e.data)};
 mr.onstop=()=>{orig=new Blob(ch,{type:'audio/webm'});document.getElementById('oa').src=URL.createObjectURL(orig);document.getElementById('cb').disabled=false;document.getElementById('st').textContent='✅ Ready! Click Convert';document.getElementById('ss').textContent=(orig.size/1024).toFixed(1)+'KB';s.getTracks().forEach(t=>t.stop())};
 mr.start(100);rc=true;sec=0;document.getElementById('mb').classList.add('rec');document.getElementById('tm').style.color='var(--r)';document.getElementById('st').textContent='🔴 Recording...';document.getElementById('cb').disabled=true;document.getElementById('rb').classList.remove('show');
 ti=setInterval(()=>{sec++;var m=Math.floor(sec/60),ss=sec%60;document.getElementById('tm').textContent=String(m).padStart(2,'0')+':'+String(ss).padStart(2,'0')},1000);
 wi=setInterval(()=>{document.querySelectorAll('.voice-wave .bar').forEach(b=>b.style.height=(Math.random()*20+(rc?5:3))+'px')},70)}catch(e){alert('❌ Mic denied! Allow in browser settings.')}}
function stop(){if(mr&&rc){mr.stop();rc=false;clearInterval(ti);clearInterval(wi);document.getElementById('mb').classList.remove('rec');document.getElementById('tm').style.color='var(--a)'}}

function hf(inp){if(inp.files[0]){orig=inp.files[0];document.getElementById('oa').src=URL.createObjectURL(orig);document.getElementById('cb').disabled=false;document.getElementById('st').textContent='📁 '+inp.files[0].name;document.getElementById('ss').textContent=(orig.size/1024).toFixed(1)+'KB'}}

async function cv(){
 if(!orig)return;document.getElementById('ld').classList.add('show');document.getElementById('rb').classList.remove('show');document.getElementById('cb').disabled=true;
 var fmt=document.getElementById('fmt').value;
 var fd=new FormData();fd.append('audio',orig,'voice.webm');fd.append('voice',voice);fd.append('format',fmt);
 try{
  var r=await fetch('/api/convert',{method:'POST',body:fd});
  if(r.ok){conv=await r.blob();document.getElementById('ca').src=URL.createObjectURL(conv);document.getElementById('ld').classList.remove('show');document.getElementById('rb').classList.add('show');document.getElementById('st').textContent='🎉 Female voice ready!'}
  else{var e=await r.json();alert('❌ '+e.error);document.getElementById('ld').classList.remove('show')}
 }catch(e){alert('❌ '+e.message);document.getElementById('ld').classList.remove('show')}
 document.getElementById('cb').disabled=false}
function dl(){if(!conv)return;var a=document.createElement('a');a.href=URL.createObjectURL(conv);a.download='bronx-female-'+voice+'-'+Date.now()+'.'+document.getElementById('fmt').value;a.click()}
function rt(){document.getElementById('rb').classList.remove('show');document.getElementById('cb').disabled=true;orig=null;conv=null;document.getElementById('st').textContent='🎤 Record again'}
document.addEventListener('keydown',e=>{if(e.code==='Space'&&e.target===document.body){e.preventDefault();tr()}});

// Init
sv('yuki',document.querySelector('.vbtn'));
</script>
</body></html>`);
});

// ============ CONVERSION API ============
app.post('/api/convert', upload.single('audio'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No audio file" });
    
    const voiceKey = req.body.voice || 'yuki';
    const format = req.body.format || 'wav';
    const voice = VOICES[voiceKey] || VOICES['yuki'];
    
    console.log(`🎤 Converting: ${req.file.originalname} → ${voice.name} (${format})`);
    
    try {
        const inputPath = req.file.path;
        const audioBuffer = fs.readFileSync(inputPath);
        
        // Apply pitch shift
        const processedBuffer = applyPitchShift(audioBuffer, voice.pitch);
        
        // Save
        const outputFile = genId() + FORMATS[format].ext;
        const outputPath = path.join(OUTPUT_DIR, outputFile);
        fs.writeFileSync(outputPath, processedBuffer);
        
        // Clean input
        fs.unlinkSync(inputPath);
        
        // Send
        const fmt = FORMATS[format];
        res.setHeader('Content-Type', fmt.mime);
        res.setHeader('Content-Disposition', `attachment; filename="female-${voiceKey}.${format}"`);
        res.setHeader('X-Voice', voiceKey);
        res.setHeader('X-Pitch', voice.pitch.toString());
        res.sendFile(outputPath, () => {
            setTimeout(() => { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); }, 30000);
        });
        
        console.log(`✅ Done: ${voice.name}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: error.message });
    }
});

// ============ PITCH SHIFT ENGINE ============
function applyPitchShift(audioBuffer, semitones) {
    const ratio = Math.pow(2, semitones / 12);
    const sampleRate = 44100;
    const bytesPerSample = 2;
    const numSamples = Math.floor(audioBuffer.length / bytesPerSample);
    const outSamples = Math.floor(numSamples / ratio);
    
    const headerSize = 44;
    const dataSize = outSamples * bytesPerSample;
    const totalSize = headerSize + dataSize;
    const buffer = Buffer.alloc(totalSize);
    
    // Write WAV header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(totalSize - 8, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(1, 22); // Mono
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * bytesPerSample, 28);
    buffer.writeUInt16LE(bytesPerSample, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);
    
    // Write pitch-shifted samples with interpolation
    for (let i = 0; i < outSamples; i++) {
        const srcPos = i * ratio;
        const srcIdx = Math.floor(srcPos);
        const frac = srcPos - srcIdx;
        const byteIdx = srcIdx * bytesPerSample;
        
        let sample = 0;
        if (byteIdx + 3 < audioBuffer.length) {
            const s1 = audioBuffer.readInt16LE(byteIdx);
            const s2 = audioBuffer.readInt16LE(byteIdx + 2);
            sample = Math.round(s1 + (s2 - s1) * frac);
        } else if (byteIdx < audioBuffer.length - 1) {
            sample = audioBuffer.readInt16LE(byteIdx);
        }
        
        buffer.writeInt16LE(Math.max(-32768, Math.min(32767, sample)), headerSize + i * bytesPerSample);
    }
    
    return buffer;
}

// ============ ENDPOINTS ============
app.get('/api/voices', (req, res) => res.json({ voices: VOICES, formats: FORMATS }));
app.get('/test', (req, res) => res.json({ status: "✅ V3.0 ONLINE", voices: Object.keys(VOICES).length, uptime: process.uptime() }));
app.use((req, res) => res.status(404).json({ error: "Not found", home: "/" }));

app.listen(PORT, '0.0.0.0', () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎙️ BRONX VOICE CHANGER V3.0');
    console.log(`🚀 http://localhost:${PORT}`);
    console.log('👩‍🦰 10 Female Voices');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
});
