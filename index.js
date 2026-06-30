// ============================================
// 🎙️ BRONX REAL VOICE CHANGER
// Pitch Shift + Formant Change in Browser
// ============================================
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = process.env.PORT || 3000;

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname) || '.webm')
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const VOICE_STYLES = {
    yuki:    { name: "🎀 Yuki (Soft Indian Girl)",   pitch: 1.8,  formant: 1.4 },
    aiko:    { name: "🌸 Aiko (Sweet & Friendly)",    pitch: 1.6,  formant: 1.3 },
    niki:    { name: "💖 Niki (Cute & Flirty)",       pitch: 2.0,  formant: 1.5 },
    priya:   { name: "👩 Priya (Natural Hindi)",      pitch: 1.5,  formant: 1.25 },
    siri:    { name: "🗣️ Siri (Professional)",        pitch: 1.4,  formant: 1.2 },
    deepika: { name: "💫 Deepika (Bollywood)",        pitch: 1.7,  formant: 1.35 },
    kavya:   { name: "🎶 Kavya (Melodious)",          pitch: 1.9,  formant: 1.45 },
};

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

// ============ HOME PAGE ============
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>🎙️ BRONX REAL VOICE CHANGER</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root{--bg:#000a14;--s:rgba(5,15,35,.85);--b:rgba(255,105,180,.1);--t:#d0d8f0;--a:#ff69b4;--g:#00ff88;--r:#ff3366}
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:var(--bg);color:var(--t);font-family:'Rajdhani',sans-serif;min-height:100vh}
        body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse at 50% -20%,rgba(255,105,180,.06),transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(138,43,226,.04),transparent 50%);pointer-events:none;z-index:0}
        .container{max-width:750px;margin:0 auto;padding:20px;position:relative;z-index:1}
        .header{text-align:center;padding:30px 0 20px}
        .header h1{font-family:'Orbitron',sans-serif;font-size:clamp(22px,5vw,34px);background:linear-gradient(90deg,#ff69b4,#8b00ff,#0096ff,#ff0080);background-size:300% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:rainbow 4s linear infinite}@keyframes rainbow{0%{background-position:0% 50%}100%{background-position:300% 50%}}
        .header p{color:#667;font-size:13px}
        .badge{display:inline-block;background:rgba(255,105,180,.08);color:var(--a);padding:4px 14px;border-radius:20px;font-size:10px;border:1px solid rgba(255,105,180,.15);margin:3px}
        .card{background:var(--s);border:1px solid var(--b);border-radius:16px;padding:20px;margin:14px 0;backdrop-filter:blur(20px)}
        .card h3{color:#fff;font-size:16px;margin-bottom:12px;font-family:'Orbitron',sans-serif}
        select{width:100%;padding:12px;background:rgba(0,0,0,.5);border:1px solid var(--b);border-radius:10px;color:#fff;font-size:13px;outline:none;margin:6px 0;font-family:'Rajdhani',sans-serif}
        select:focus{border-color:var(--a)}
        
        .mic-btn{width:120px;height:120px;border-radius:50%;border:4px solid var(--a);background:rgba(255,105,180,.1);cursor:pointer;transition:.3s;margin:0 auto;display:flex;align-items:center;justify-content:center}
        .mic-btn:hover{transform:scale(1.05);box-shadow:0 0 40px rgba(255,105,180,.3)}
        .mic-btn.recording{background:var(--r);border-color:var(--r);animation:pulse 1.5s infinite}
        .mic-btn svg{width:50px;height:50px;fill:var(--a)}
        .mic-btn.recording svg{fill:#fff}
        @keyframes pulse{0%,100%{box-shadow:0 0 20px rgba(255,51,102,.3)}50%{box-shadow:0 0 60px rgba(255,51,102,.6)}}
        .timer{font-size:36px;font-family:'Orbitron',sans-serif;color:var(--a);text-align:center;margin:10px 0}
        .timer.recording{color:var(--r)}
        .status{font-size:14px;color:#667;text-align:center;margin:6px 0}
        
        button{width:100%;padding:14px;background:linear-gradient(135deg,#ff69b4,#8b00ff);color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-family:'Orbitron',sans-serif;font-size:14px;margin:6px 0;transition:.3s}
        button:hover{transform:scale(1.02);box-shadow:0 0 30px rgba(255,105,180,.3)}
        button:disabled{opacity:.5;cursor:not-allowed;transform:none}
        button.green{background:linear-gradient(135deg,#00c853,#009624)}
        button.orange{background:linear-gradient(135deg,#ff6d00,#ff9100)}
        
        .voice-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:6px;margin:8px 0}
        .voice-btn{background:rgba(255,105,180,.06);color:var(--a);padding:8px;border-radius:12px;font-size:10px;cursor:pointer;border:1px solid rgba(255,105,180,.12);text-align:center;transition:.3s}
        .voice-btn:hover,.voice-btn.active{background:rgba(255,105,180,.15);color:#fff;border-color:var(--a)}
        
        audio{width:100%;margin:8px 0;border-radius:10px;background:rgba(0,0,0,.3)}
        .result-box{display:none;margin:10px 0;text-align:center}
        .result-box.show{display:block}
        .compare{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}
        .compare div{background:rgba(0,0,0,.3);padding:12px;border-radius:10px}
        .compare p{font-size:10px;color:#667;margin-bottom:4px}
        
        .voice-wave{display:flex;align-items:center;justify-content:center;gap:2px;height:30px;margin:10px 0}
        .voice-wave .bar{width:3px;background:var(--a);border-radius:2px;transition:height .08s}
        
        @media(max-width:600px){.mic-btn{width:90px;height:90px}.mic-btn svg{width:35px;height:35px}}
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>🎙️ BRONX REAL VOICE CHANGER</h1>
        <p>🎤 Male → 👩‍🦰 Female Voice (Real Pitch + Formant Shift)</p>
        <div style="margin-top:10px">
            ${Object.keys(VOICE_STYLES).map(k => `<span class="badge">${VOICE_STYLES[k].name.split(' ')[0]}</span>`).join('')}
        </div>
    </div>

    <div class="card">
        <h3>🎤 SELECT FEMALE VOICE</h3>
        <div class="voice-grid">
            ${Object.entries(VOICE_STYLES).map(([k,v]) => 
                `<div class="voice-btn ${k==='yuki'?'active':''}" onclick="selVoice('${k}',this)">${v.name.split(' ')[0]}</div>`
            ).join('')}
        </div>
        <select id="voiceStyle" onchange="selVoice(this.value, document.querySelector('.voice-btn.active'))">
            ${Object.entries(VOICE_STYLES).map(([k,v]) => `<option value="${k}">${v.name}</option>`).join('')}
        </select>
    </div>

    <div class="card">
        <h3>🎙️ RECORD YOUR VOICE</h3>
        <div class="mic-btn" id="micBtn" onclick="toggleRecording()">
            <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
        </div>
        <div class="timer" id="timer">00:00</div>
        <div class="voice-wave" id="voiceWave">${Array(25).fill(0).map((_,i) => `<div class="bar" id="bar${i}" style="height:${Math.random()*10+3}px"></div>`).join('')}</div>
        <div class="status" id="status">🎤 Click mic to start recording (or press SPACE)</div>
        
        <button id="convertBtn" onclick="convertToFemale()" disabled>🎙️ CONVERT TO FEMALE VOICE</button>
        <div class="status" id="convertStatus" style="display:none;color:#ffb400">⏳ Converting...</div>
        
        <div class="result-box" id="resultBox">
            <p style="color:var(--g);font-weight:700;font-size:15px">✅ VOICE CONVERTED!</p>
            <div class="compare">
                <div>
                    <p>🎤 ORIGINAL VOICE</p>
                    <audio id="originalAudio" controls></audio>
                </div>
                <div>
                    <p>👩‍🦰 FEMALE VOICE</p>
                    <audio id="convertedAudio" controls></audio>
                </div>
            </div>
            <button class="green" onclick="downloadConverted()">📥 DOWNLOAD FEMALE VOICE</button>
            <button class="orange" onclick="retry()">🔄 RECORD AGAIN</button>
        </div>
    </div>

    <p style="text-align:center;color:#667;font-size:10px;padding:10px">Created by BRONX_ULTRA</p>
</div>

<script>
var mediaRecorder, audioChunks = [], isRecording = false, timerInterval, seconds = 0;
var selectedStyle = 'yuki', originalBlob = null, convertedBlob = null;
var audioCtx = null;

// ============ VOICE SELECT ============
function selVoice(voice, el) {
    selectedStyle = voice;
    document.querySelectorAll('.voice-btn').forEach(b => b.classList.remove('active'));
    if(el) el.classList.add('active');
    document.getElementById('voiceStyle').value = voice;
}

// ============ TOGGLE RECORDING ============
async function toggleRecording() {
    if (isRecording) { stopRecording(); } else { await startRecording(); }
}

async function startRecording() {
    try {
        var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioCtx = new AudioContext();
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
        audioChunks = [];
        
        mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
        
        mediaRecorder.onstop = async () => {
            originalBlob = new Blob(audioChunks, { type: 'audio/webm' });
            document.getElementById('originalAudio').src = URL.createObjectURL(originalBlob);
            document.getElementById('convertBtn').disabled = false;
            document.getElementById('status').textContent = '✅ Recording complete! Click Convert';
            stream.getTracks().forEach(t => t.stop());
        };
        
        mediaRecorder.start(100);
        isRecording = true;
        seconds = 0;
        
        document.getElementById('micBtn').classList.add('recording');
        document.getElementById('timer').classList.add('recording');
        document.getElementById('status').textContent = '🔴 Recording... Click to stop';
        document.getElementById('convertBtn').disabled = true;
        document.getElementById('resultBox').classList.remove('show');
        
        timerInterval = setInterval(() => { seconds++; updateTimer(); }, 1000);
        animateBars();
        
    } catch(e) { alert('❌ Microphone access denied!'); }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        clearInterval(timerInterval);
        document.getElementById('micBtn').classList.remove('recording');
        document.getElementById('timer').classList.remove('recording');
    }
}

function updateTimer() {
    var m = Math.floor(seconds/60), s = seconds%60;
    document.getElementById('timer').textContent = String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}

function animateBars() {
    var bars = document.querySelectorAll('.voice-wave .bar');
    var iv = setInterval(() => {
        if(!isRecording){clearInterval(iv);return}
        bars.forEach(b => b.style.height = (Math.random()*25+3)+'px');
    }, 80);
}

// ============ REAL VOICE CONVERSION (PITCH + FORMANT) ============
async function convertToFemale() {
    if (!originalBlob) return;
    
    document.getElementById('convertStatus').style.display = 'block';
    document.getElementById('convertBtn').disabled = true;
    
    try {
        var style = VOICE_STYLES[selectedStyle];
        var arrayBuffer = await originalBlob.arrayBuffer();
        var audioCTX = new AudioContext();
        var audioBuffer = await audioCTX.decodeAudioData(arrayBuffer);
        
        // Create offline context for processing
        var offlineCtx = new OfflineAudioContext(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );
        
        var source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;
        
        // === PITCH SHIFT (Playback rate change) ===
        source.playbackRate.value = style.pitch;
        
        // === FORMANT SHIFT (Filter to sound more feminine) ===
        var filter = offlineCtx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = 3500;  // Boost high frequencies (female voice range)
        filter.Q.value = 0.5;
        filter.gain.value = 8;  // Boost by 8dB
        
        var filter2 = offlineCtx.createBiquadFilter();
        filter2.type = 'highshelf';
        filter2.frequency.value = 2500;
        filter2.gain.value = 6;
        
        // === Compressor for smoothness ===
        var compressor = offlineCtx.createDynamicsCompressor();
        compressor.threshold.value = -24;
        compressor.knee.value = 30;
        compressor.ratio.value = 12;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;
        
        // Connect chain
        source.connect(filter);
        filter.connect(filter2);
        filter2.connect(compressor);
        compressor.connect(offlineCtx.destination);
        
        source.start(0);
        
        // Render
        var renderedBuffer = await offlineCtx.startRendering();
        
        // Convert to WAV blob
        convertedBlob = audioBufferToWav(renderedBuffer);
        
        document.getElementById('convertedAudio').src = URL.createObjectURL(convertedBlob);
        document.getElementById('convertStatus').style.display = 'none';
        document.getElementById('resultBox').classList.add('show');
        document.getElementById('status').textContent = '🎉 Female voice ready!';
        
    } catch(e) {
        console.error(e);
        alert('❌ Conversion error: ' + e.message);
        document.getElementById('convertStatus').style.display = 'none';
        document.getElementById('convertBtn').disabled = false;
    }
}

// ============ AUDIO BUFFER TO WAV ============
function audioBufferToWav(buffer) {
    var numChannels = buffer.numberOfChannels;
    var sampleRate = buffer.sampleRate;
    var format = 1; // PCM
    var bitDepth = 16;
    var bytesPerSample = bitDepth / 8;
    var blockAlign = numChannels * bytesPerSample;
    var dataLength = buffer.length * blockAlign;
    var headerLength = 44;
    var totalLength = headerLength + dataLength;
    
    var arrayBuffer = new ArrayBuffer(totalLength);
    var view = new DataView(arrayBuffer);
    
    // WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, totalLength - 8, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);
    
    var offset = 44;
    for (var i = 0; i < buffer.length; i++) {
        for (var ch = 0; ch < numChannels; ch++) {
            var sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
            sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(offset, sample, true);
            offset += 2;
        }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
    for (var i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// ============ DOWNLOAD ============
function downloadConverted() {
    if (!convertedBlob) return;
    var a = document.createElement('a');
    a.href = URL.createObjectURL(convertedBlob);
    a.download = 'bronx-female-' + selectedStyle + '-' + Date.now() + '.wav';
    a.click();
}

function retry() {
    document.getElementById('resultBox').classList.remove('show');
    document.getElementById('convertBtn').disabled = true;
    document.getElementById('status').textContent = '🎤 Click mic to record again';
    originalBlob = null;
    convertedBlob = null;
}

// ============ KEYBOARD SHORTCUT ============
document.addEventListener('keydown', e => {
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        toggleRecording();
    }
});
</script>
</body></html>`);
});

// ============ API ============
app.post('/api/convert', upload.single('audio'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file" });
    
    const audioBuffer = fs.readFileSync(req.file.path);
    fs.unlinkSync(req.file.path);
    
    res.setHeader('Content-Type', 'audio/wav');
    res.send(audioBuffer);
});

app.get('/styles', (req, res) => res.json({ styles: VOICE_STYLES }));
app.get('/test', (req, res) => res.json({ status: "✅ Voice Changer Online" }));
app.use((req, res) => res.status(404).json({ error: "Not found", home: "/" }));

app.listen(PORT, '0.0.0.0', () => console.log(`🎙️ Voice Changer on port ${PORT}`));
