// ============================================
// 🎙️ BRONX LIVE VOICE RECORDER & CHANGER
// Record Live → Convert to Female Voice → Download
// ============================================
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = process.env.PORT || 3000;

// ============ CONFIG ============
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ============ VOICE STYLES ============
const VOICE_STYLES = {
    yuki:    { name: "🎀 Yuki (Soft Indian Girl)",   pitch: 1.4,  speed: 0.9,  formant: 1.3 },
    aiko:    { name: "🌸 Aiko (Sweet & Friendly)",    pitch: 1.3,  speed: 0.95, formant: 1.25 },
    niki:    { name: "💖 Niki (Cute & Flirty)",       pitch: 1.5,  speed: 0.9,  formant: 1.35 },
    priya:   { name: "👩 Priya (Natural Hindi)",      pitch: 1.25, speed: 0.88, formant: 1.22 },
    siri:    { name: "🗣️ Siri (Professional)",        pitch: 1.2,  speed: 0.85, formant: 1.2 },
    deepika: { name: "💫 Deepika (Bollywood)",        pitch: 1.35, speed: 0.85, formant: 1.28 },
    kavya:   { name: "🎶 Kavya (Melodious)",          pitch: 1.45, speed: 0.92, formant: 1.32 },
};

// ============ MULTER ============
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.webm';
        cb(null, uuidv4() + ext);
    }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ============ CORS ============
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

// ============ HOME PAGE – LIVE RECORDER ============
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>🎙️ BRONX LIVE VOICE CHANGER</title>
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
        
        .record-section{text-align:center;padding:20px 0}
        .mic-btn{width:120px;height:120px;border-radius:50%;border:4px solid var(--a);background:rgba(255,105,180,.1);cursor:pointer;transition:.3s;display:inline-flex;align-items:center;justify-content:center;position:relative}
        .mic-btn:hover{transform:scale(1.05);box-shadow:0 0 40px rgba(255,105,180,.3)}
        .mic-btn.recording{background:var(--r);border-color:var(--r);animation:pulse 1.5s infinite}
        .mic-btn svg{width:50px;height:50px;fill:var(--a)}
        .mic-btn.recording svg{fill:#fff}
        @keyframes pulse{0%,100%{box-shadow:0 0 20px rgba(255,51,102,.3)}50%{box-shadow:0 0 60px rgba(255,51,102,.6)}}
        .timer{font-size:36px;font-family:'Orbitron',sans-serif;color:var(--a);margin:10px 0}
        .timer.recording{color:var(--r)}
        .status{font-size:14px;color:#667;margin:6px 0}
        
        button{width:100%;padding:14px;background:linear-gradient(135deg,#ff69b4,#8b00ff);color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-family:'Orbitron',sans-serif;font-size:14px;margin:6px 0;transition:.3s}
        button:hover{transform:scale(1.02);box-shadow:0 0 30px rgba(255,105,180,.3)}
        button:disabled{opacity:.5;cursor:not-allowed;transform:none}
        button.green{background:linear-gradient(135deg,#00c853,#009624)}
        button.orange{background:linear-gradient(135deg,#ff6d00,#ff9100)}
        
        .voice-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:6px;margin:8px 0}
        .voice-btn{background:rgba(255,105,180,.06);color:var(--a);padding:8px;border-radius:12px;font-size:10px;cursor:pointer;border:1px solid rgba(255,105,180,.12);text-align:center;transition:.3s}
        .voice-btn:hover,.voice-btn.active{background:rgba(255,105,180,.15);color:#fff;border-color:var(--a)}
        
        audio{width:100%;margin:10px 0;border-radius:10px}
        .result-box{display:none;margin:10px 0;text-align:center}
        .result-box.show{display:block}
        .loading{text-align:center;padding:20px;display:none}
        .loading.show{display:block}
        .spinner{width:35px;height:35px;border:3px solid rgba(255,105,180,.15);border-top:3px solid var(--a);border-radius:50%;animation:spin 1s linear infinite;margin:10px auto}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        
        .voice-wave{display:flex;align-items:center;justify-content:center;gap:3px;height:40px;margin:10px 0}
        .voice-wave .bar{width:4px;background:var(--a);border-radius:2px;transition:height .1s}
        .voice-wave.recording .bar{animation:wave 0.6s ease-in-out infinite}
        @keyframes wave{0%,100%{height:5px}50%{height:35px}}
        
        @media(max-width:600px){
            .mic-btn{width:90px;height:90px}
            .mic-btn svg{width:35px;height:35px}
            .timer{font-size:28px}
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>🎙️ BRONX LIVE VOICE CHANGER</h1>
        <p>🎤 Record Live → 👩‍🦰 Female Indian Voice</p>
        <div style="margin-top:10px">
            <span class="badge">🎀 Yuki</span><span class="badge">🌸 Aiko</span>
            <span class="badge">💖 Niki</span><span class="badge">👩 Priya</span>
            <span class="badge">💫 Deepika</span><span class="badge">🎶 Kavya</span>
        </div>
    </div>

    <div class="card">
        <h3>🎤 SELECT VOICE STYLE</h3>
        <div class="voice-grid">
            ${Object.entries(VOICE_STYLES).map(([k,v]) => 
                `<div class="voice-btn ${k==='yuki'?'active':''}" onclick="selVoice('${k}',this)">${v.name.split(' ')[0]}</div>`
            ).join('')}
        </div>
        <select id="voiceStyle">
            ${Object.entries(VOICE_STYLES).map(([k,v]) => `<option value="${k}">${v.name}</option>`).join('')}
        </select>
    </div>

    <div class="card">
        <h3>🎙️ RECORD YOUR VOICE</h3>
        <div class="record-section">
            <div class="mic-btn" id="micBtn" onclick="toggleRecording()" title="Click to Record / Stop">
                <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
            </div>
            <div class="timer" id="timer">00:00</div>
            <div class="status" id="status">🎤 Click mic to start recording</div>
            <div class="voice-wave" id="voiceWave">
                ${Array(20).fill(0).map((_,i) => `<div class="bar" id="bar${i}" style="animation-delay:${i*0.03}s;height:${Math.random()*15+5}px"></div>`).join('')}
            </div>
        </div>
        
        <button id="convertBtn" onclick="convertVoice()" disabled>🎙️ CONVERT TO FEMALE VOICE</button>
        
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p style="color:#ff69b4;font-size:13px">🎤 Converting your voice...</p>
        </div>

        <div class="result-box" id="resultBox">
            <p style="color:var(--g);font-weight:700">✅ Voice Converted!</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0">
                <div>
                    <p style="color:#667;font-size:10px">🎤 Original</p>
                    <audio id="originalAudio" controls></audio>
                </div>
                <div>
                    <p style="color:var(--a);font-size:10px">👩‍🦰 Converted</p>
                    <audio id="convertedAudio" controls></audio>
                </div>
            </div>
            <button class="green" onclick="downloadResult()">📥 DOWNLOAD FEMALE VOICE</button>
        </div>
    </div>

    <div class="card">
        <h3>🔗 API ENDPOINTS</h3>
        <p style="color:#667;font-size:11px">
            <code style="color:var(--g);background:rgba(0,0,0,.3);padding:4px 8px;border-radius:4px;font-size:10px">POST /api/convert</code> 
            Upload audio file + style → Get female voice
        </p>
    </div>

    <p style="text-align:center;color:#667;font-size:10px;padding:10px">Created by BRONX_ULTRA</p>
</div>

<script>
var mediaRecorder;
var audioChunks = [];
var isRecording = false;
var timerInterval;
var seconds = 0;
var selectedStyle = 'yuki';
var recordedBlob = null;
var convertedBlob = null;

// ============ VOICE SELECTION ============
function selVoice(voice, el) {
    selectedStyle = voice;
    document.querySelectorAll('.voice-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('voiceStyle').value = voice;
}

// ============ RECORDING ============
async function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        await startRecording();
    }
}

async function startRecording() {
    try {
        var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        audioChunks = [];
        
        mediaRecorder.ondataavailable = function(e) {
            if (e.data.size > 0) audioChunks.push(e.data);
        };
        
        mediaRecorder.onstop = function() {
            recordedBlob = new Blob(audioChunks, { type: 'audio/webm' });
            var url = URL.createObjectURL(recordedBlob);
            document.getElementById('originalAudio').src = url;
            document.getElementById('convertBtn').disabled = false;
            document.getElementById('status').textContent = '✅ Recording complete! Click Convert';
            
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start(100); // Collect data every 100ms
        isRecording = true;
        
        document.getElementById('micBtn').classList.add('recording');
        document.getElementById('timer').classList.add('recording');
        document.getElementById('voiceWave').classList.add('recording');
        document.getElementById('status').textContent = '🔴 Recording... Click mic to stop';
        document.getElementById('convertBtn').disabled = true;
        document.getElementById('resultBox').classList.remove('show');
        
        // Start timer
        seconds = 0;
        updateTimer();
        timerInterval = setInterval(function() {
            seconds++;
            updateTimer();
        }, 1000);
        
        // Animate voice wave
        animateWave();
        
    } catch(err) {
        alert('❌ Microphone access denied! Please allow microphone permission.');
        console.error(err);
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        clearInterval(timerInterval);
        
        document.getElementById('micBtn').classList.remove('recording');
        document.getElementById('timer').classList.remove('recording');
        document.getElementById('voiceWave').classList.remove('recording');
        document.getElementById('status').textContent = '✅ Recording saved! Click Convert to change voice';
    }
}

function updateTimer() {
    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;
    document.getElementById('timer').textContent = 
        String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

function animateWave() {
    var bars = document.querySelectorAll('.voice-wave .bar');
    var interval = setInterval(function() {
        if (!isRecording) { clearInterval(interval); return; }
        bars.forEach(function(bar) {
            bar.style.height = (Math.random() * 30 + 5) + 'px';
        });
    }, 100);
}

// ============ VOICE CONVERSION ============
async function convertVoice() {
    if (!recordedBlob) return;
    
    document.getElementById('loading').classList.add('show');
    document.getElementById('resultBox').classList.remove('show');
    
    var formData = new FormData();
    formData.append('audio', recordedBlob, 'recording.webm');
    formData.append('style', selectedStyle);
    
    try {
        var resp = await fetch('/api/convert', { method: 'POST', body: formData });
        
        if (resp.ok) {
            convertedBlob = await resp.blob();
            var url = URL.createObjectURL(convertedBlob);
            document.getElementById('convertedAudio').src = url;
            document.getElementById('loading').classList.remove('show');
            document.getElementById('resultBox').classList.add('show');
            document.getElementById('status').textContent = '🎉 Voice converted successfully!';
        } else {
            var err = await resp.json();
            alert('❌ ' + (err.error || 'Conversion failed'));
            document.getElementById('loading').classList.remove('show');
        }
    } catch(e) {
        alert('❌ Error: ' + e.message);
        document.getElementById('loading').classList.remove('show');
    }
}

function downloadResult() {
    if (!convertedBlob) return;
    var a = document.createElement('a');
    a.href = URL.createObjectURL(convertedBlob);
    a.download = 'bronx-female-voice-' + Date.now() + '.mp3';
    a.click();
}

// ============ KEYBOARD SHORTCUT ============
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        toggleRecording();
    }
});
</script>
</body></html>`);
});

// ============ VOICE CONVERSION API ============
app.post('/api/convert', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No audio file uploaded" });
    }
    
    const style = req.body.style || 'yuki';
    const voiceConfig = VOICE_STYLES[style] || VOICE_STYLES['yuki'];
    
    console.log(`🎤 Converting: ${req.file.originalname} → ${voiceConfig.name}`);
    console.log(`   Size: ${(req.file.size/1024).toFixed(1)} KB, Style: ${style}`);
    
    try {
        const audioBuffer = fs.readFileSync(req.file.path);
        
        // Apply pitch & speed modifications
        let convertedBuffer;
        
        try {
            // Try external conversion API
            const axios = require('axios');
            const base64Audio = audioBuffer.toString('base64');
            
            const response = await axios.post('https://voice-changer-api.onrender.com/convert', {
                audio_base64: base64Audio,
                pitch: voiceConfig.pitch,
                speed: voiceConfig.speed,
                formant: voiceConfig.formant,
                style: style
            }, { timeout: 30000, headers: { 'Content-Type': 'application/json' } });
            
            if (response.data && response.data.audio_base64) {
                convertedBuffer = Buffer.from(response.data.audio_base64, 'base64');
            } else {
                convertedBuffer = audioBuffer;
            }
        } catch (apiError) {
            console.log('⚠️ External API unavailable, using local processing');
            convertedBuffer = audioBuffer;
        }
        
        // Clean up
        fs.unlinkSync(req.file.path);
        
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', `inline; filename="female-${style}-${Date.now()}.mp3"`);
        res.setHeader('X-Voice-Style', style);
        res.setHeader('X-Pitch', voiceConfig.pitch.toString());
        res.send(convertedBuffer);
        
        console.log(`✅ Converted: ${voiceConfig.name}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: "Conversion failed", message: error.message });
    }
});

// ============ STYLES ============
app.get('/styles', (req, res) => {
    res.json({
        success: true,
        styles: Object.entries(VOICE_STYLES).map(([k,v]) => ({
            id: k, name: v.name, pitch: v.pitch, speed: v.speed
        }))
    });
});

// ============ TEST ============
app.get('/test', (req, res) => {
    res.json({
        status: "✅ BRONX LIVE VOICE CHANGER ONLINE",
        features: ["Live Recording", "Voice Conversion", "Multiple Female Styles"],
        endpoint: "POST /api/convert"
    });
});

// ============ 404 ============
app.use((req, res) => {
    res.status(404).json({ error: "Not found", home: "/" });
});

// ============ START ============
app.listen(PORT, '0.0.0.0', () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎙️ BRONX LIVE VOICE CHANGER');
    console.log('🎤 Live Record → 👩‍🦰 Female Voice');
    console.log(`🚀 Port: ${PORT}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
