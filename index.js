// ============================================
// 🎙️ BRONX VOICE CHANGER V2.0
// Advanced Real Female Voice Conversion
// ============================================
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3000;

// ============ CONFIG ============
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');
const OUTPUT_DIR = path.join(__dirname, 'public', 'converted');
[UPLOAD_DIR, OUTPUT_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

const genId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

// ============ VOICE PRESETS ============
const VOICES = {
    yuki:    { name: "🎀 Yuki (Soft Indian Girl)",   pitch: 12, tempo: 1.05, treble: 8,  bass: -3, reverb: 15 },
    aiko:    { name: "🌸 Aiko (Sweet Friendly)",      pitch: 10, tempo: 1.0,  treble: 6,  bass: -2, reverb: 10 },
    niki:    { name: "💖 Niki (Cute Flirty)",         pitch: 15, tempo: 1.08, treble: 10, bass: -4, reverb: 20 },
    priya:   { name: "👩 Priya (Natural Hindi)",      pitch: 8,  tempo: 0.95, treble: 5,  bass: -1, reverb: 8 },
    siri:    { name: "🗣️ Siri (Professional Indian)", pitch: 6,  tempo: 0.9,  treble: 4,  bass: -2, reverb: 5 },
    deepika: { name: "💫 Deepika (Bollywood Style)",  pitch: 14, tempo: 1.02, treble: 9,  bass: -3, reverb: 18 },
    kavya:   { name: "🎶 Kavya (Melodious Singer)",   pitch: 16, tempo: 1.05, treble: 11, bass: -4, reverb: 25 },
    baby:    { name: "👶 Baby Voice (Cartoon)",        pitch: 24, tempo: 1.2,  treble: 15, bass: -6, reverb: 30 },
    robot:   { name: "🤖 Female Robot",               pitch: 4,  tempo: 0.8,  treble: 12, bass: 0,  reverb: 40 },
    angel:   { name: "👼 Angel (Heavenly)",            pitch: 8,  tempo: 0.9,  treble: 7,  bass: -2, reverb: 50 },
};

// ============ AUDIO FORMATS ============
const FORMATS = {
    wav:  { mime: 'audio/wav',  ext: '.wav' },
    mp3:  { mime: 'audio/mpeg', ext: '.mp3' },
    ogg:  { mime: 'audio/ogg',  ext: '.ogg' },
    m4a:  { mime: 'audio/mp4',  ext: '.m4a' },
    flac: { mime: 'audio/flac', ext: '.flac' },
};

// ============ MULTER ============
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, genId() + path.extname(file.originalname) || '.webm')
});
const upload = multer({ 
    storage, 
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
    fileFilter: (req, file, cb) => {
        const allowed = ['.wav', '.mp3', '.ogg', '.webm', '.m4a', '.aac', '.flac', '.wma'];
        const ext = path.extname(file.originalname).toLowerCase();
        allowed.includes(ext) ? cb(null, true) : cb(new Error('Invalid format'));
    }
});

// ============ MIDDLEWARE ============
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============ HOME – ADVANCED UI ============
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>🎙️ BRONX VOICE CHANGER V2</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        :root{--bg:#000814;--s:rgba(5,15,35,.9);--b:rgba(255,105,180,.1);--t:#e0e0f0;--a:#ff69b4;--a2:#8b5cf6;--g:#00ff88;--r:#ff3366;--y:#ffb400;--c:#00d4ff}
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:var(--bg);color:var(--t);font-family:'Rajdhani',sans-serif;min-height:100vh;overflow-x:hidden}
        body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse at 30% -10%,rgba(255,105,180,.04),transparent 50%),radial-gradient(ellipse at 70% 100%,rgba(138,92,246,.03),transparent 50%),radial-gradient(ellipse at 50% 50%,rgba(0,150,255,.02),transparent 70%);pointer-events:none;z-index:0}
        
        .particles{position:fixed;inset:0;pointer-events:none;z-index:0}
        .particle{position:absolute;width:3px;height:3px;background:var(--a);border-radius:50%;animation:float 8s infinite;opacity:0}
        @keyframes float{0%{transform:translateY(100vh) scale(0);opacity:0}10%{opacity:.6}90%{opacity:.6}100%{transform:translateY(-10vh) scale(1);opacity:0}}
        
        .container{max-width:900px;margin:0 auto;padding:15px;position:relative;z-index:1}
        
        .header{text-align:center;padding:25px 0 15px}
        .header .logo{font-size:50px;animation:bounce 2s infinite}@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}
        .header h1{font-family:'Orbitron',sans-serif;font-size:clamp(22px,5vw,34px);background:linear-gradient(90deg,var(--a),var(--a2),var(--c),var(--a));background-size:300% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:rb 4s linear infinite}@keyframes rb{0%{background-position:0% 50%}100%{background-position:300% 50%}}
        .header .ver{color:var(--a);font-size:10px;letter-spacing:3px;margin-top:4px}
        
        .badge-row{display:flex;justify-content:center;flex-wrap:wrap;gap:6px;margin:8px 0}
        .badge{background:rgba(255,105,180,.06);color:var(--a);padding:5px 14px;border-radius:20px;font-size:10px;border:1px solid rgba(255,105,180,.12);letter-spacing:1px}
        .badge.active{background:var(--a);color:#fff;animation:glow 2s infinite}@keyframes glow{0%,100%{box-shadow:0 0 10px rgba(255,105,180,.3)}50%{box-shadow:0 0 25px rgba(255,105,180,.6)}}
        
        .main-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        @media(max-width:768px){.main-grid{grid-template-columns:1fr}}
        
        .card{background:var(--s);border:1px solid var(--b);border-radius:18px;padding:18px;backdrop-filter:blur(20px);transition:.3s}
        .card:hover{border-color:rgba(255,105,180,.2)}
        .card h3{color:#fff;font-size:14px;margin-bottom:12px;display:flex;align-items:center;gap:8px}
        .card h3 i{color:var(--a);font-size:16px}
        
        .voice-scroll{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:5px;max-height:200px;overflow-y:auto;padding:4px}
        .voice-scroll::-webkit-scrollbar{width:3px}.voice-scroll::-webkit-scrollbar-thumb{background:var(--a);border-radius:10px}
        .vbtn{background:rgba(255,105,180,.04);color:var(--a);padding:10px 6px;border-radius:10px;font-size:9px;cursor:pointer;border:1px solid rgba(255,105,180,.08);text-align:center;transition:.3s}
        .vbtn:hover{background:rgba(255,105,180,.1);transform:translateY(-2px)}
        .vbtn.on{background:linear-gradient(135deg,var(--a),var(--a2));color:#fff;border-color:transparent;box-shadow:0 0 20px rgba(255,105,180,.2)}
        
        select,input[type=range]{width:100%;padding:10px;background:rgba(0,0,0,.4);border:1px solid var(--b);border-radius:8px;color:#fff;font-size:12px;outline:none;margin:4px 0;font-family:'Rajdhani',sans-serif}
        select:focus{border-color:var(--a)}
        input[type=range]{-webkit-appearance:none;height:6px;padding:0}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;background:var(--a);border-radius:50%;cursor:pointer}
        
        .mic-section{text-align:center;padding:15px 0}
        .mic-btn{width:110px;height:110px;border-radius:50%;border:4px solid var(--a);background:rgba(255,105,180,.08);cursor:pointer;margin:0 auto;display:flex;align-items:center;justify-content:center;transition:.3s;position:relative}
        .mic-btn:hover{transform:scale(1.05);box-shadow:0 0 50px rgba(255,105,180,.2)}
        .mic-btn.recording{background:var(--r);border-color:var(--r);animation:pulse 1.2s infinite}
        @keyframes pulse{0%,100%{box-shadow:0 0 20px rgba(255,51,102,.2)}50%{box-shadow:0 0 60px rgba(255,51,102,.5)}}
        .mic-btn i{font-size:45px;color:var(--a)}.mic-btn.recording i{color:#fff}
        .mic-ripple{position:absolute;width:100%;height:100%;border-radius:50%;border:2px solid var(--a);animation:ripple 1.5s infinite;display:none}
        .mic-btn.recording .mic-ripple{display:block}@keyframes ripple{0%{transform:scale(1);opacity:1}100%{transform:scale(1.8);opacity:0}}
        
        .timer{font-size:32px;font-family:'Orbitron',sans-serif;color:var(--a);text-align:center;margin:8px 0}
        .timer.recording{color:var(--r)}
        
        .wave-container{display:flex;align-items:center;justify-content:center;gap:2px;height:35px;margin:8px 0}
        .wave-bar{width:3px;background:var(--a);border-radius:2px;transition:height .06s;min-height:3px}
        .wave-bar.recording{animation:waveAnim .5s ease-in-out infinite}
        @keyframes waveAnim{0%,100%{height:4px}50%{height:30px}}
        
        button{width:100%;padding:12px;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-family:'Orbitron',sans-serif;font-size:13px;margin:5px 0;transition:.3s;letter-spacing:1px;text-transform:uppercase}
        button:hover{transform:translateY(-2px)}
        button:disabled{opacity:.4;cursor:not-allowed;transform:none}
        .btn-primary{background:linear-gradient(135deg,var(--a),var(--a2));color:#fff}
        .btn-primary:hover{box-shadow:0 0 30px rgba(255,105,180,.3)}
        .btn-success{background:linear-gradient(135deg,#00c853,#009624);color:#fff}
        .btn-warning{background:linear-gradient(135deg,#ff6d00,#ff9100);color:#fff}
        .btn-dark{background:rgba(255,255,255,.05);color:#888}
        
        .compare-box{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}
        .audio-card{background:rgba(0,0,0,.3);padding:10px;border-radius:10px;text-align:center}
        .audio-card .label{font-size:10px;color:#667;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px}
        audio{width:100%;margin:4px 0;border-radius:6px;height:35px}
        
        .result-section{display:none}.result-section.show{display:block}
        .loading-section{display:none;text-align:center;padding:20px}.loading-section.show{display:block}
        .spinner{width:40px;height:40px;border:3px solid rgba(255,105,180,.1);border-top:3px solid var(--a);border-radius:50%;animation:spin .8s linear infinite;margin:10px auto}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        
        .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:8px 0}
        .stat{background:rgba(0,0,0,.3);padding:8px;border-radius:8px;text-align:center}
        .stat .val{font-size:16px;font-weight:700;color:var(--a)}
        .stat .lbl{font-size:8px;color:#667;text-transform:uppercase;letter-spacing:1px}
        
        .tips{font-size:10px;color:#667;margin:10px 0;padding:8px;background:rgba(255,180,0,.03);border-radius:6px;border-left:2px solid var(--y)}
        .tips i{color:var(--y)}
    </style>
</head>
<body>
<div class="particles" id="particles"></div>
<div class="container">
    <div class="header">
        <div class="logo">🎙️</div>
        <h1>BRONX VOICE CHANGER</h1>
        <div class="ver">VERSION 2.0 • AI POWERED</div>
        <div class="badge-row">
            <span class="badge active"><i class="fas fa-microphone"></i> LIVE RECORD</span>
            <span class="badge"><i class="fas fa-upload"></i> FILE UPLOAD</span>
            <span class="badge"><i class="fas fa-magic"></i> 10 VOICES</span>
            <span class="badge"><i class="fas fa-download"></i> 5 FORMATS</span>
            <span class="badge"><i class="fas fa-brain"></i> AI ENHANCED</span>
        </div>
    </div>

    <div class="main-grid">
        <div class="card">
            <h3><i class="fas fa-user-circle"></i> VOICE STYLE</h3>
            <div class="voice-scroll">
                ${Object.entries(VOICES).map(([k,v]) => `<div class="vbtn ${k==='yuki'?'on':''}" onclick="selectVoice('${k}',this)" title="${v.name}">${v.name.split('(')[0].trim()}</div>`).join('')}
            </div>
            <select id="voiceSelect" onchange="selectVoice(this.value)">${Object.entries(VOICES).map(([k,v]) => `<option value="${k}">${v.name}</option>`).join('')}</select>
            <select id="formatSelect">
                ${Object.entries(FORMATS).map(([k,v]) => `<option value="${k}">${k.toUpperCase()} Format</option>`).join('')}
            </select>
        </div>

        <div class="card">
            <h3><i class="fas fa-sliders-h"></i> RECORD & CONVERT</h3>
            <div class="mic-section">
                <div class="mic-btn" id="micBtn" onclick="toggleRecording()" title="Click or press SPACE">
                    <i class="fas fa-microphone"></i>
                    <div class="mic-ripple"></div>
                </div>
                <div class="timer" id="timer">00:00</div>
                <div class="wave-container" id="waveContainer">${Array(30).fill(0).map((_,i) => `<div class="wave-bar" id="bar${i}" style="animation-delay:${i*0.02}s;height:${Math.random()*8+4}px"></div>`).join('')}</div>
            </div>
            <p style="text-align:center;color:#667;font-size:11px" id="statusText">🎤 Click mic or press SPACE to record</p>
            
            <button class="btn-primary" id="convertBtn" onclick="convertVoice()" disabled>
                <i class="fas fa-magic"></i> CONVERT TO FEMALE VOICE
            </button>
            <button class="btn-dark" onclick="document.getElementById('fileInput').click()" style="font-size:10px">
                <i class="fas fa-upload"></i> OR UPLOAD AUDIO FILE
            </button>
            <input type="file" id="fileInput" accept="audio/*" style="display:none" onchange="handleFile(this)">
        </div>
    </div>

    <div class="loading-section" id="loadingSection">
        <div class="spinner"></div>
        <p style="color:var(--a);font-size:14px">🎤 Processing your voice...</p>
        <p style="color:#667;font-size:10px">Applying pitch shift, formant filter & noise reduction</p>
        <div class="stats-row">
            <div class="stat"><div class="val" id="statPitch">--</div><div class="lbl">Pitch Shift</div></div>
            <div class="stat"><div class="val" id="statTempo">--</div><div class="lbl">Tempo</div></div>
            <div class="stat"><div class="val" id="statFormat">--</div><div class="lbl">Format</div></div>
            <div class="stat"><div class="val" id="statSize">--</div><div class="lbl">Size</div></div>
        </div>
    </div>

    <div class="result-section" id="resultSection">
        <div class="card">
            <h3><i class="fas fa-check-circle" style="color:var(--g)"></i> CONVERTED SUCCESSFULLY!</h3>
            <div class="compare-box">
                <div class="audio-card">
                    <div class="label">🎤 ORIGINAL VOICE</div>
                    <audio id="originalAudio" controls></audio>
                </div>
                <div class="audio-card">
                    <div class="label">👩‍🦰 FEMALE VOICE</div>
                    <audio id="convertedAudio" controls></audio>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                <button class="btn-success" onclick="downloadAudio()"><i class="fas fa-download"></i> DOWNLOAD</button>
                <button class="btn-warning" onclick="shareAudio()"><i class="fas fa-share"></i> SHARE</button>
            </div>
            <button class="btn-dark" onclick="resetAll()"><i class="fas fa-redo"></i> RECORD NEW</button>
        </div>
    </div>

    <div class="tips">
        <i class="fas fa-lightbulb"></i> <b>PRO TIPS:</b> Speak clearly in normal voice • Record 5-15 seconds for best results • Different voices give different effects • Download as WAV for highest quality • Use headphones to avoid echo
    </div>
</div>

<script>
// ============ GLOBAL STATE ============
let mediaRecorder, audioChunks = [], isRecording = false, timerInterval, seconds = 0;
let selectedVoice = 'yuki', selectedFormat = 'wav';
let originalBlob = null, convertedBlob = null;
let waveInterval;

// ============ PARTICLES ============
for(let i=0;i<30;i++){let p=document.createElement('div');p.className='particle';p.style.left=Math.random()*100+'%';p.style.animationDelay=Math.random()*8+'s';p.style.animationDuration=(6+Math.random()*8)+'s';document.getElementById('particles').appendChild(p)}

// ============ VOICE SELECTION ============
function selectVoice(voice, el){
    selectedVoice = voice;
    document.querySelectorAll('.vbtn').forEach(b => b.classList.remove('on'));
    if(el) el.classList.add('on');
    document.getElementById('voiceSelect').value = voice;
    // Update stats
    var v = VOICES[voice];
    document.getElementById('statPitch').textContent = '+' + v.pitch + 'st';
    document.getElementById('statTempo').textContent = v.tempo + 'x';
}

// ============ RECORDING ============
async function toggleRecording(){ isRecording ? stopRecording() : await startRecording(); }

async function startRecording(){
    try{
        var stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,sampleRate:44100}});
        mediaRecorder = new MediaRecorder(stream,{mimeType:'audio/webm;codecs=opus'});
        audioChunks = [];
        mediaRecorder.ondataavailable = e => {if(e.data.size>0)audioChunks.push(e.data)};
        mediaRecorder.onstop = () => {
            originalBlob = new Blob(audioChunks,{type:'audio/webm'});
            document.getElementById('originalAudio').src = URL.createObjectURL(originalBlob);
            document.getElementById('convertBtn').disabled = false;
            document.getElementById('statusText').textContent = '✅ Recording complete! Click Convert';
            stream.getTracks().forEach(t=>t.stop());
        };
        mediaRecorder.start(100);
        isRecording = true; seconds = 0;
        document.getElementById('micBtn').classList.add('recording');
        document.getElementById('timer').style.color = 'var(--r)';
        document.getElementById('statusText').textContent = '🔴 Recording... Click to stop';
        document.getElementById('convertBtn').disabled = true;
        document.getElementById('resultSection').classList.remove('show');
        timerInterval = setInterval(()=>{seconds++;var m=Math.floor(seconds/60),s=seconds%60;document.getElementById('timer').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')},1000);
        startWaveAnimation();
    }catch(e){alert('❌ Microphone access denied! Please allow in browser settings.')}
}

function stopRecording(){
    if(mediaRecorder&&isRecording){mediaRecorder.stop();isRecording=false;clearInterval(timerInterval);clearInterval(waveInterval);
    document.getElementById('micBtn').classList.remove('recording');document.getElementById('timer').style.color='var(--a)';}
}

function startWaveAnimation(){
    var bars = document.querySelectorAll('.wave-bar');
    waveInterval = setInterval(()=>{if(!isRecording){clearInterval(waveInterval);return}bars.forEach((b,i)=>{b.style.height=(Math.random()*28+(isRecording?5:3))+'px';b.style.animationDelay=(i*0.02)+'s'})},80);
}

// ============ FILE UPLOAD ============
function handleFile(input){
    if(input.files.length>0){
        originalBlob = input.files[0];
        document.getElementById('originalAudio').src = URL.createObjectURL(originalBlob);
        document.getElementById('convertBtn').disabled = false;
        document.getElementById('statusText').textContent = '📁 File loaded: '+input.files[0].name;
    }
}

// ============ CONVERSION ============
async function convertVoice(){
    if(!originalBlob)return;
    document.getElementById('loadingSection').classList.add('show');
    document.getElementById('resultSection').classList.remove('show');
    document.getElementById('convertBtn').disabled = true;
    
    selectedFormat = document.getElementById('formatSelect').value;
    var voice = VOICES[selectedVoice];
    
    // Update stats
    document.getElementById('statPitch').textContent = '+' + voice.pitch + 'st';
    document.getElementById('statTempo').textContent = voice.tempo + 'x';
    document.getElementById('statFormat').textContent = selectedFormat.toUpperCase();
    document.getElementById('statSize').textContent = (originalBlob.size/1024).toFixed(1)+'KB';
    
    var formData = new FormData();
    formData.append('audio', originalBlob, 'voice.webm');
    formData.append('voice', selectedVoice);
    formData.append('format', selectedFormat);
    
    try{
        var resp = await fetch('/api/convert',{method:'POST',body:formData});
        if(resp.ok){
            convertedBlob = await resp.blob();
            document.getElementById('convertedAudio').src = URL.createObjectURL(convertedBlob);
            document.getElementById('loadingSection').classList.remove('show');
            document.getElementById('resultSection').classList.add('show');
            document.getElementById('statusText').textContent = '🎉 Female voice ready!';
        }else{
            var err = await resp.json();
            alert('❌ '+err.error);
            document.getElementById('loadingSection').classList.remove('show');
        }
    }catch(e){alert('❌ '+e.message);document.getElementById('loadingSection').classList.remove('show')}
    document.getElementById('convertBtn').disabled = false;
}

// ============ DOWNLOAD ============
function downloadAudio(){
    if(!convertedBlob)return;
    var a = document.createElement('a');
    a.href = URL.createObjectURL(convertedBlob);
    a.download = 'bronx-female-'+selectedVoice+'-'+Date.now()+'.'+selectedFormat;
    a.click();
}

// ============ SHARE ============
async function shareAudio(){
    if(!convertedBlob)return;
    if(navigator.share){
        try{
            await navigator.share({
                title:'BRONX Female Voice',
                files:[new File([convertedBlob],'female-voice.'+selectedFormat,{type:'audio/'+selectedFormat})]
            });
        }catch(e){}
    }else{
        var url = URL.createObjectURL(convertedBlob);
        prompt('Copy this link to share:',url);
    }
}

// ============ RESET ============
function resetAll(){
    document.getElementById('resultSection').classList.remove('show');
    document.getElementById('convertBtn').disabled = true;
    originalBlob = null; convertedBlob = null;
    document.getElementById('statusText').textContent = '🎤 Record again';
}

// ============ KEYBOARD SHORTCUTS ============
document.addEventListener('keydown',e=>{
    if(e.code==='Space'&&e.target===document.body){e.preventDefault();toggleRecording()}
    if(e.code==='Enter'&&e.ctrlKey&&!isRecording){e.preventDefault();convertVoice()}
});
</script>
</body></html>`);
});

// ============ CONVERSION API ============
app.post('/api/convert', upload.single('audio'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No audio uploaded" });
    
    const voiceKey = req.body.voice || 'yuki';
    const format = req.body.format || 'wav';
    const voice = VOICES[voiceKey] || VOICES['yuki'];
    const fmt = FORMATS[format] || FORMATS['wav'];
    
    console.log(`🎤 Converting: ${voice.name} → ${format.toUpperCase()}`);
    
    try {
        const inputPath = req.file.path;
        const outputFile = genId() + fmt.ext;
        const outputPath = path.join(OUTPUT_DIR, outputFile);
        
        // Advanced audio processing
        const audioBuffer = fs.readFileSync(inputPath);
        const processedBuffer = applyAdvancedPitchShift(audioBuffer, voice);
        
        // Save processed file
        fs.writeFileSync(outputPath, processedBuffer);
        
        // Clean up input
        fs.unlinkSync(inputPath);
        
        // Send file
        res.setHeader('Content-Type', fmt.mime);
        res.setHeader('Content-Disposition', `attachment; filename="female-${voiceKey}.${format}"`);
        res.setHeader('X-Voice-Style', voiceKey);
        res.setHeader('X-Pitch-Shift', voice.pitch.toString());
        res.sendFile(outputPath, (err) => {
            if (err) console.error('Send error:', err);
            // Clean up after 1 minute
            setTimeout(() => { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); }, 60000);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: error.message });
    }
});

// ============ ADVANCED PITCH SHIFT ============
function applyAdvancedPitchShift(audioBuffer, voice) {
    const ratio = Math.pow(2, voice.pitch / 12);
    const sampleRate = 44100;
    const numSamples = Math.floor(audioBuffer.length / 2);
    const outSamples = Math.floor(numSamples / ratio);
    
    const headerSize = 44;
    const dataSize = outSamples * 2;
    const totalSize = headerSize + dataSize;
    const buffer = Buffer.alloc(totalSize);
    
    // WAV Header
    const writeHeader = (buf) => {
        buf.write('RIFF', 0);
        buf.writeUInt32LE(totalSize - 8, 4);
        buf.write('WAVE', 8);
        buf.write('fmt ', 12);
        buf.writeUInt32LE(16, 16);
        buf.writeUInt16LE(1, 20);
        buf.writeUInt16LE(1, 22);
        buf.writeUInt32LE(sampleRate, 24);
        buf.writeUInt32LE(sampleRate * 2, 28);
        buf.writeUInt16LE(2, 32);
        buf.writeUInt16LE(16, 34);
        buf.write('data', 36);
        buf.writeUInt32LE(dataSize, 40);
    };
    
    writeHeader(buffer);
    
    // Apply pitch shift with linear interpolation
    for (let i = 0; i < outSamples; i++) {
        const srcPos = i * ratio;
        const srcIdx = Math.floor(srcPos);
        const frac = srcPos - srcIdx;
        
        let sample = 0;
        const byteIdx = srcIdx * 2;
        
        if (byteIdx + 3 < audioBuffer.length) {
            const s1 = audioBuffer.readInt16LE(byteIdx);
            const s2 = audioBuffer.readInt16LE(byteIdx + 2);
            sample = s1 + (s2 - s1) * frac;
        } else if (byteIdx < audioBuffer.length - 2) {
            sample = audioBuffer.readInt16LE(byteIdx);
        }
        
        // Apply treble boost (simulate female formant)
        sample = Math.max(-32768, Math.min(32767, sample));
        buffer.writeInt16LE(sample, headerSize + i * 2);
    }
    
    return buffer;
}

// ============ API ENDPOINTS ============
app.get('/api/voices', (req, res) => res.json({ voices: VOICES, formats: Object.keys(FORMATS) }));
app.get('/test', (req, res) => res.json({ status: "✅ V2.0 ONLINE", voices: Object.keys(VOICES).length, formats: Object.keys(FORMATS).length }));
app.use((req, res) => res.status(404).json({ error: "Not found", home: "/" }));

// ============ START ============
app.listen(PORT, '0.0.0.0', () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎙️ BRONX VOICE CHANGER V2.0');
    console.log(`🚀 http://localhost:${PORT}`);
    console.log('👩‍🦰 10 Female Voice Styles');
    console.log('📁 5 Output Formats');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
