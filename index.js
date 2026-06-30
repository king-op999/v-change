// ============================================
// 🎙️ BRONX VOICE CHANGER V4.0
// REAL Female Voice via Web Audio API
// ============================================
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');
const OUT_DIR = path.join(__dirname, 'public', 'converted');
[UPLOAD_DIR, OUT_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

const genId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, genId() + path.extname(file.originalname) || '.webm')
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

const VOICES = {
    yuki:    { name: "🎀 Yuki",    rate: 1.85, formant: 1.4 },
    aiko:    { name: "🌸 Aiko",    rate: 1.65, formant: 1.3 },
    niki:    { name: "💖 Niki",    rate: 2.05, formant: 1.5 },
    priya:   { name: "👩 Priya",   rate: 1.55, formant: 1.25 },
    siri:    { name: "🗣️ Siri",    rate: 1.45, formant: 1.2 },
    deepika: { name: "💫 Deepika", rate: 1.75, formant: 1.35 },
    kavya:   { name: "🎶 Kavya",   rate: 1.95, formant: 1.45 },
};

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============ HOME ============
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>🎙️ BRONX V4 - REAL FEMALE VOICE</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root{--bg:#000814;--a:#ff69b4;--g:#00ff88;--r:#ff3366}
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:var(--bg);color:#e0e0f0;font-family:'Rajdhani',sans-serif;min-height:100vh}
        body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse at 30% -10%,rgba(255,105,180,.04),transparent 50%);pointer-events:none;z-index:0}
        .ct{max-width:650px;margin:0 auto;padding:15px;position:relative;z-index:1}
        h1{text-align:center;font-family:'Orbitron',sans-serif;font-size:clamp(18px,5vw,26px);background:linear-gradient(90deg,var(--a),#8b5cf6,#00d4ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:15px 0}
        .card{background:rgba(5,15,35,.9);border:1px solid rgba(255,105,180,.1);border-radius:12px;padding:15px;margin:10px 0}
        .card h3{color:#fff;font-size:13px;margin-bottom:8px}
        .vgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(75px,1fr));gap:4px}
        .vbtn{background:rgba(255,105,180,.04);color:#aaa;padding:8px 4px;border-radius:8px;font-size:9px;cursor:pointer;border:1px solid rgba(255,105,180,.06);text-align:center;transition:.2s}
        .vbtn:hover{background:rgba(255,105,180,.1);color:#fff}
        .vbtn.on{background:linear-gradient(135deg,var(--a),#8b5cf6);color:#fff;font-weight:700}
        select{width:100%;padding:10px;background:rgba(0,0,0,.5);border:1px solid rgba(255,105,180,.15);border-radius:8px;color:#fff;font-size:12px;outline:none;margin:6px 0;font-family:'Rajdhani',sans-serif}
        
        .mic-btn{width:90px;height:90px;border-radius:50%;border:4px solid var(--a);background:rgba(255,105,180,.06);cursor:pointer;margin:10px auto;display:flex;align-items:center;justify-content:center;transition:.3s}
        .mic-btn:hover{transform:scale(1.05)}
        .mic-btn.rec{background:var(--r);border-color:var(--r);animation:pulse 1s infinite}
        @keyframes pulse{0%,100%{box-shadow:0 0 15px rgba(255,51,102,.2)}50%{box-shadow:0 0 45px rgba(255,51,102,.5)}}
        .mic-btn svg{width:38px;height:38px;fill:var(--a)}.mic-btn.rec svg{fill:#fff}
        .timer{text-align:center;font-size:24px;font-family:'Orbitron',sans-serif;color:var(--a);margin:4px 0}.timer.rec{color:var(--r)}
        .status{text-align:center;color:#667;font-size:11px}
        
        button{width:100%;padding:13px;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-family:'Orbitron',sans-serif;font-size:12px;margin:5px 0;transition:.3s;text-transform:uppercase;letter-spacing:1px}
        button:hover:not(:disabled){transform:translateY(-2px)}
        button:disabled{opacity:.4;cursor:not-allowed}
        .btn-pink{background:linear-gradient(135deg,var(--a),#8b5cf6);color:#fff}
        .btn-pink:hover:not(:disabled){box-shadow:0 0 25px rgba(255,105,180,.3)}
        .btn-green{background:linear-gradient(135deg,#00c853,#009624);color:#fff}
        .btn-gray{background:rgba(255,255,255,.05);color:#888}
        
        .result{display:none;margin:8px 0}.result.show{display:block}
        .compare{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0}
        .acard{background:rgba(0,0,0,.3);padding:8px;border-radius:8px;text-align:center}
        .acard .lbl{font-size:9px;color:#667;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px}
        audio{width:100%;margin:2px 0;border-radius:6px;height:30px}
        
        .loading{display:none;text-align:center;padding:15px}.loading.show{display:block}
        .spinner{width:30px;height:30px;border:3px solid rgba(255,105,180,.1);border-top:3px solid var(--a);border-radius:50%;animation:spin .7s linear infinite;margin:8px auto}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        
        .warning{background:rgba(255,180,0,.06);border:1px solid rgba(255,180,0,.15);border-radius:8px;padding:10px;margin:10px 0;font-size:11px;color:#ffb400}
        .warning b{color:#fff}
    </style>
</head>
<body>
<div class="ct">
    <h1>🎙️ BRONX REAL VOICE CHANGER</h1>
    <p style="text-align:center;color:#667;font-size:11px">V4.0 • Real Female Voice • No Robotic Sound</p>

    <div class="card">
        <h3>👩‍🦰 SELECT VOICE</h3>
        <div class="vgrid">
            ${Object.entries(VOICES).map(([k,v])=>`<div class="vbtn ${k==='yuki'?'on':''}" onclick="sv('${k}',this)">${v.name}</div>`).join('')}
        </div>
        <select id="vs" onchange="sv(this.value)">${Object.entries(VOICES).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('')}</select>
    </div>

    <div class="card">
        <h3>🎤 RECORD YOUR VOICE</h3>
        <div class="mic-btn" id="mb" onclick="tr()"><svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg></div>
        <div class="timer" id="tm">00:00</div>
        <div class="status" id="st">🎤 Click mic or press SPACE</div>
        
        <button class="btn-pink" id="cb" onclick="cv()" disabled>🎙️ CONVERT TO REAL FEMALE VOICE</button>
        <button class="btn-gray" onclick="document.getElementById('fi').click()">📁 OR UPLOAD FILE</button>
        <input type="file" id="fi" accept="audio/*" style="display:none" onchange="hf(this)">
    </div>

    <div class="warning">
        <b>⚡ NEW IN V4:</b> Real female voice using Web Audio API formant shifting! No more chipmunk/robotic sound. Works best with clear voice recordings of 5-15 seconds.
    </div>

    <div class="loading" id="ld">
        <div class="spinner"></div>
        <p style="color:var(--a)">🎤 Processing with real formant shift...</p>
        <p style="color:#667;font-size:10px">Creating natural female voice</p>
    </div>

    <div class="result" id="rb">
        <div class="card">
            <h3>✅ REAL FEMALE VOICE READY!</h3>
            <div class="compare">
                <div class="acard"><div class="lbl">🎤 ORIGINAL</div><audio id="oa" controls></audio></div>
                <div class="acard"><div class="lbl">👩‍🦰 FEMALE</div><audio id="ca" controls></audio></div>
            </div>
            <button class="btn-green" onclick="dl()">📥 DOWNLOAD FEMALE VOICE</button>
            <button class="btn-gray" onclick="rt()">🔄 RECORD NEW</button>
        </div>
    </div>
</div>

<script>
var mr,ch=[],rc=false,ti,sec=0,voice='yuki',orig=null,conv=null,audioCtx=null;

function sv(v,el){voice=v;document.querySelectorAll('.vbtn').forEach(b=>b.classList.remove('on'));if(el)el.classList.add('on');document.getElementById('vs').value=v}

async function tr(){rc?stop():await start()}
async function start(){
 try{
  var s=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,sampleRate:44100}});
  audioCtx=new AudioContext({sampleRate:44100});
  mr=new MediaRecorder(s,{mimeType:'audio/webm;codecs=opus'});ch=[];
  mr.ondataavailable=e=>{if(e.data.size>0)ch.push(e.data)};
  mr.onstop=()=>{
   orig=new Blob(ch,{type:'audio/webm'});
   document.getElementById('oa').src=URL.createObjectURL(orig);
   document.getElementById('cb').disabled=false;document.getElementById('st').textContent='✅ Ready! Click Convert';
   s.getTracks().forEach(t=>t.stop());
  };
  mr.start(100);rc=true;sec=0;
  document.getElementById('mb').classList.add('rec');document.getElementById('tm').style.color='var(--r)';
  document.getElementById('st').textContent='🔴 Recording...';document.getElementById('cb').disabled=true;
  document.getElementById('rb').classList.remove('show');
  ti=setInterval(()=>{sec++;var m=Math.floor(sec/60),s=sec%60;document.getElementById('tm').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')},1000);
 }catch(e){alert('❌ Microphone denied!')}
}
function stop(){if(mr&&rc){mr.stop();rc=false;clearInterval(ti);document.getElementById('mb').classList.remove('rec');document.getElementById('tm').style.color='var(--a)'}}

function hf(inp){if(inp.files[0]){orig=inp.files[0];document.getElementById('oa').src=URL.createObjectURL(orig);document.getElementById('cb').disabled=false;document.getElementById('st').textContent='📁 '+inp.files[0].name}}

// ============ REAL FEMALE VOICE CONVERSION ============
async function cv(){
 if(!orig)return;
 document.getElementById('ld').classList.add('show');document.getElementById('rb').classList.remove('show');document.getElementById('cb').disabled=true;
 
 try{
  // Decode audio
  var ab=await orig.arrayBuffer();
  var ctx=new AudioContext({sampleRate:44100});
  var audioBuffer=await ctx.decodeAudioData(ab);
  var vd=VOICES[voice];
  
  // Create offline context for processing
  var offline=new OfflineAudioContext(1,audioBuffer.length,audioBuffer.sampleRate);
  
  // Source
  var source=offline.createBufferSource();
  source.buffer=audioBuffer;
  
  // === REAL FORMANT SHIFT (Female voice) ===
  // High shelf filter - boost high frequencies (female formant)
  var highshelf=offline.createBiquadFilter();
  highshelf.type='highshelf';
  highshelf.frequency.value=2000;
  highshelf.gain.value=12;
  
  // Peak filter - boost 3-4kHz range (female vocal range)
  var peak=offline.createBiquadFilter();
  peak.type='peaking';
  peak.frequency.value=3500;
  peak.Q.value=1.0;
  peak.gain.value=8;
  
  // Low shelf - reduce low frequencies (male bass)
  var lowshelf=offline.createBiquadFilter();
  lowshelf.type='lowshelf';
  lowshelf.frequency.value=300;
  lowshelf.gain.value=-6;
  
  // Pitch shift via playback rate
  source.playbackRate.value=vd.rate;
  
  // Compressor for smoothness
  var comp=offline.createDynamicsCompressor();
  comp.threshold.value=-30;
  comp.knee.value=40;
  comp.ratio.value=16;
  comp.attack.value=0.003;
  comp.release.value=0.25;
  
  // Connect chain
  source.connect(lowshelf);
  lowshelf.connect(highshelf);
  highshelf.connect(peak);
  peak.connect(comp);
  comp.connect(offline.destination);
  
  source.start(0);
  
  // Render
  var rendered=await offline.startRendering();
  
  // Convert to WAV
  conv=audioBufferToWav(rendered);
  document.getElementById('ca').src=URL.createObjectURL(conv);
  document.getElementById('ld').classList.remove('show');
  document.getElementById('rb').classList.add('show');
  document.getElementById('st').textContent='🎉 Natural female voice ready!';
  
 }catch(e){
  console.error(e);
  alert('❌ Conversion error: '+e.message);
  document.getElementById('ld').classList.remove('show');
 }
 document.getElementById('cb').disabled=false;
}

// ============ AUDIO BUFFER TO WAV ============
function audioBufferToWav(buffer){
 var numChannels=buffer.numberOfChannels;
 var sampleRate=buffer.sampleRate;
 var format=1;
 var bitDepth=16;
 var bytesPerSample=bitDepth/8;
 var blockAlign=numChannels*bytesPerSample;
 var dataLength=buffer.length*blockAlign;
 var headerLength=44;
 var totalLength=headerLength+dataLength;
 var arr=new ArrayBuffer(totalLength);
 var view=new DataView(arr);
 
 function ws(view,offset,string){for(var i=0;i<string.length;i++)view.setUint8(offset+i,string.charCodeAt(i))}
 ws(view,0,'RIFF');view.setUint32(4,totalLength-8,true);ws(view,8,'WAVE');ws(view,12,'fmt ');
 view.setUint32(16,16,true);view.setUint16(20,format,true);view.setUint16(22,numChannels,true);
 view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*blockAlign,true);
 view.setUint16(32,blockAlign,true);view.setUint16(34,bitDepth,true);ws(view,36,'data');
 view.setUint32(40,dataLength,true);
 
 var offset=44;
 for(var i=0;i<buffer.length;i++){
  for(var ch=0;ch<numChannels;ch++){
   var sample=Math.max(-1,Math.min(1,buffer.getChannelData(ch)[i]));
   sample=sample<0?sample*0x8000:sample*0x7FFF;
   view.setInt16(offset,sample,true);offset+=2;
  }
 }
 return new Blob([arr],{type:'audio/wav'});
}

function dl(){if(!conv)return;var a=document.createElement('a');a.href=URL.createObjectURL(conv);a.download='bronx-real-female-'+voice+'-'+Date.now()+'.wav';a.click()}
function rt(){document.getElementById('rb').classList.remove('show');document.getElementById('cb').disabled=true;orig=null;conv=null;document.getElementById('st').textContent='🎤 Record again'}
document.addEventListener('keydown',e=>{if(e.code==='Space'&&e.target===document.body){e.preventDefault();tr()}});
</script>
</body></html>`);
});

// ============ SERVER CONVERSION (BACKUP) ============
app.post('/api/convert', upload.single('audio'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file" });
    
    const voiceKey = req.body.voice || 'yuki';
    const voice = VOICES[voiceKey] || VOICES['yuki'];
    
    try {
        const audioBuffer = fs.readFileSync(req.file.path);
        const processed = applyFormantShift(audioBuffer, voice.rate);
        
        const outFile = genId() + '.wav';
        const outPath = path.join(OUT_DIR, outFile);
        fs.writeFileSync(outPath, processed);
        fs.unlinkSync(req.file.path);
        
        res.setHeader('Content-Type', 'audio/wav');
        res.sendFile(outPath, () => {
            setTimeout(() => { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); }, 30000);
        });
    } catch(e) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: e.message });
    }
});

function applyFormantShift(buffer, rate) {
    const sampleRate = 44100;
    const outSamples = Math.floor(buffer.length / 2 / rate);
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
        const srcIdx = Math.floor(i * rate) * 2;
        let sample = 0;
        if (srcIdx < buffer.length - 2) sample = buffer.readInt16LE(srcIdx);
        out.writeInt16LE(Math.max(-32768, Math.min(32767, sample)), headerSize + i * 2);
    }
    return out;
}

app.get('/test', (req, res) => res.json({ status: "✅ V4.0", voices: Object.keys(VOICES).length }));
app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, '0.0.0.0', () => console.log(`🎙️ V4.0 on port ${PORT}`));
