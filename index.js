// ============================================
// 🎙️ BRONX AI VOICE API – FEMALE INDIAN VOICE
// Hindi | English | Bangla | Realistic
// ============================================
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// ============ VOICE CONFIG ============
const VOICES = {
    yuki:    { name: "🎀 Yuki (Soft Indian Girl)",    voice: "21m00Tcm4TlvDq8ikWAM", style: "soft" },
    aiko:    { name: "🌸 Aiko (Sweet & Friendly)",     voice: "EXAVITQu4vr4xnSDxMaL", style: "friendly" },
    siri:    { name: "🗣️ Siri (Professional Indian)", voice: "pFZP5JQG7iQjIQuC4Bku", style: "professional" },
    niki:    { name: "💖 Niki (Cute & Flirty)",        voice: "XB0fDUnXU5powFXDhCwa", style: "cute" },
    priya:   { name: "👩 Priya (Natural Hindi)",       voice: "9BWtsMINqrJLrRacOk9x", style: "natural" },
    anjali:  { name: "🎤 Anjali (Clear Indian)",       voice: "CwhRBfXzGAHq8TQ4Fs6i", style: "clear" },
    deepika: { name: "💫 Deepika (Bollywood Style)",   voice: "jBpfuIE2acCO8z3wKNLl", style: "dramatic" },
};

// ============ STYLE MODIFIERS ============
const STYLES = {
    soft:         { speed: 0.9,  pitch: 1.1,  sample_rate: 24000 },
    friendly:     { speed: 0.95, pitch: 1.05, sample_rate: 24000 },
    professional: { speed: 0.85, pitch: 1.0,  sample_rate: 24000 },
    cute:         { speed: 0.9,  pitch: 1.2,  sample_rate: 24000 },
    natural:      { speed: 0.88, pitch: 1.05, sample_rate: 24000 },
    clear:        { speed: 0.82, pitch: 1.0,  sample_rate: 24000 },
    dramatic:     { speed: 0.8,  pitch: 1.1,  sample_rate: 24000 },
};

// ============ LANGUAGE SUPPORT ============
const LANGUAGES = {
    hindi:  { code: "hi-IN", name: "🇮🇳 Hindi",   prefix: "नमस्ते! " },
    english:{ code: "en-IN", name: "🇬🇧 English",  prefix: "" },
    bangla: { code: "bn-IN", name: "🇧🇩 Bangla",   prefix: "নমস্কার! " },
    tamil:  { code: "ta-IN", name: "🇮🇳 Tamil",    prefix: "வணக்கம்! " },
    telugu: { code: "te-IN", name: "🇮🇳 Telugu",   prefix: "నమస్కారం! " },
    gujarati:{code: "gu-IN", name: "🇮🇳 Gujarati", prefix: "નમસ્તે! " },
};

// ============ AI TTS API (FREE) ============
const TTS_API = "https://api.elevenlabs.io/v1/text-to-speech";
const TTS_FALLBACK = "https://text-to-speech-api.onrender.com/api/tts";

// ============ CORS ============
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// ============ HOME PAGE ============
app.get('/', (req, res) => {
    const host = req.get('host');
    const baseURL = `https://${host}`;
    
    res.send(`<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>🎙️ BRONX VOICE API – INDIAN GIRL VOICE</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root{--bg:#000a14;--s:rgba(5,15,35,.85);--b:rgba(255,105,180,.1);--t:#d0d8f0;--a:#ff69b4;--g:#00ff88;--r:#ff3366}
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:var(--bg);color:var(--t);font-family:'Rajdhani',sans-serif;min-height:100vh}
        body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse at 50% -20%,rgba(255,105,180,.06),transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(138,43,226,.04),transparent 50%);pointer-events:none;z-index:0}
        .container{max-width:850px;margin:0 auto;padding:20px;position:relative;z-index:1}
        .header{text-align:center;padding:30px 0 20px}
        .header h1{font-family:'Orbitron',sans-serif;font-size:clamp(24px,5vw,36px);background:linear-gradient(90deg,#ff69b4,#8b00ff,#0096ff,#ff0080);background-size:300% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:rainbow 4s linear infinite}@keyframes rainbow{0%{background-position:0% 50%}100%{background-position:300% 50%}}
        .header p{color:#667;font-size:13px;margin-top:6px}
        .badge{display:inline-block;background:rgba(255,105,180,.08);color:var(--a);padding:4px 14px;border-radius:20px;font-size:10px;border:1px solid rgba(255,105,180,.15);margin:3px}
        
        .card{background:var(--s);border:1px solid var(--b);border-radius:16px;padding:20px;margin:14px 0;backdrop-filter:blur(20px)}
        .card h3{color:#fff;font-size:16px;margin-bottom:10px;font-family:'Orbitron',sans-serif}
        textarea,select{width:100%;padding:12px;background:rgba(0,0,0,.5);border:1px solid var(--b);border-radius:10px;color:#fff;font-size:13px;outline:none;margin:6px 0;font-family:'Rajdhani',sans-serif;resize:vertical}
        textarea:focus,select:focus{border-color:var(--a);box-shadow:0 0 20px rgba(255,105,180,.15)}
        .row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        button{width:100%;padding:13px;background:linear-gradient(135deg,#ff69b4,#8b00ff);color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-family:'Orbitron',sans-serif;font-size:14px;margin:6px 0;transition:.3s}
        button:hover{transform:scale(1.02);box-shadow:0 0 30px rgba(255,105,180,.3)}
        button.green{background:linear-gradient(135deg,#00c853,#009624)}
        audio{width:100%;margin:10px 0;border-radius:10px}
        .audio-box{text-align:center;display:none;margin:10px 0}
        .audio-box.show{display:block}
        .loading{text-align:center;padding:20px;display:none}
        .loading.show{display:block}
        .spinner{width:30px;height:30px;border:3px solid rgba(255,105,180,.15);border-top:3px solid var(--a);border-radius:50%;animation:spin 1s linear infinite;margin:10px auto}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        code{display:block;background:rgba(0,0,0,.5);color:var(--g);padding:10px;border-radius:8px;font-size:9px;word-break:break-all;margin:6px 0}
        .voice-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:6px;margin:8px 0}
        .voice-btn{background:rgba(255,105,180,.06);color:var(--a);padding:8px 12px;border-radius:12px;font-size:10px;cursor:pointer;border:1px solid rgba(255,105,180,.12);text-align:center;transition:.3s}
        .voice-btn:hover,.voice-btn.active{background:rgba(255,105,180,.15);color:#fff;border-color:var(--a)}
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>🎙️ BRONX VOICE API</h1>
        <p>Female Indian Voice • Hindi | English | Bangla | Tamil</p>
        <div style="margin-top:10px">
            <span class="badge">🎀 Yuki</span>
            <span class="badge">🌸 Aiko</span>
            <span class="badge">🗣️ Siri</span>
            <span class="badge">💖 Niki</span>
            <span class="badge">👩 Priya</span>
            <span class="badge">🎤 Anjali</span>
            <span class="badge">💫 Deepika</span>
        </div>
    </div>

    <div class="card">
        <h3>🎤 SELECT VOICE</h3>
        <div class="voice-grid">
            ${Object.entries(VOICES).map(([k,v]) => 
                `<div class="voice-btn ${k==='yuki'?'active':''}" onclick="selectVoice('${k}',this)">${v.name.split(' ')[0]}</div>`
            ).join('')}
        </div>
    </div>

    <div class="card">
        <h3>📝 TEXT TO SPEECH</h3>
        <textarea id="textInput" rows="3" placeholder="Text type karo... (Hindi/English/Bangla)">नमस्ते! मैं ब्रोंक्स अल्ट्रा की AI वॉइस हूं। आप जो भी टाइप करोगे, मैं बिल्कुल इंडियन गर्ल की तरह बोलूंगी!</textarea>
        
        <div class="row">
            <select id="language">
                ${Object.entries(LANGUAGES).map(([k,v]) => `<option value="${k}">${v.name}</option>`).join('')}
            </select>
            <select id="voice">
                ${Object.entries(VOICES).map(([k,v]) => `<option value="${k}">${v.name.split(' ')[0]}</option>`).join('')}
            </select>
        </div>

        <button onclick="generateVoice()">🎙️ GENERATE VOICE</button>
        
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p style="color:#ff69b4;font-size:13px">🎤 Voice generate ho rahi hai...</p>
        </div>

        <div class="audio-box" id="audioBox">
            <audio id="audioPlayer" controls></audio>
            <button class="green" onclick="downloadVoice()">📥 DOWNLOAD MP3</button>
        </div>
    </div>

    <div class="card">
        <h3>🔗 API ENDPOINTS</h3>
        <code>GET /speak?text=नमस्ते&voice=yuki&lang=hindi</code>
        <code>GET /api/speak?text=Hello&voice=aiko (JSON)</code>
        <code>GET /voices (List all voices)</code>
    </div>

    <p style="text-align:center;color:#667;font-size:10px;padding:10px">Created by BRONX_ULTRA</p>
</div>

<script>
var selectedVoice = 'yuki';
var currentAudioUrl = '';

function selectVoice(voice, el) {
    selectedVoice = voice;
    document.querySelectorAll('.voice-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('voice').value = voice;
}

async function generateVoice() {
    var text = document.getElementById('textInput').value.trim();
    var voice = document.getElementById('voice').value || selectedVoice;
    var lang = document.getElementById('language').value;
    
    if (!text) return alert('Text enter karo!');
    
    document.getElementById('loading').classList.add('show');
    document.getElementById('audioBox').classList.remove('show');
    
    var url = '/speak?text=' + encodeURIComponent(text) + '&voice=' + voice + '&lang=' + lang;
    currentAudioUrl = url;
    
    var player = document.getElementById('audioPlayer');
    player.src = url;
    
    player.onloadeddata = function() {
        document.getElementById('loading').classList.remove('show');
        document.getElementById('audioBox').classList.add('show');
        player.play();
    };
    
    player.onerror = function() {
        document.getElementById('loading').classList.remove('show');
        alert('❌ Voice generation failed. Try again!');
    };
    
    player.load();
}

function downloadVoice() {
    if (!currentAudioUrl) return;
    var a = document.createElement('a');
    a.href = currentAudioUrl;
    a.download = 'bronx-voice-' + Date.now() + '.mp3';
    a.click();
}
</script>
</body></html>`);
});

// ============ VOICE GENERATION ============
app.get('/speak', async (req, res) => {
    const text = req.query.text;
    const voiceKey = req.query.voice || 'yuki';
    const langKey = req.query.lang || 'hindi';
    
    if (!text) {
        return res.status(400).json({ error: "Missing text", usage: "/speak?text=नमस्ते&voice=yuki&lang=hindi" });
    }
    
    const voiceConfig = VOICES[voiceKey] || VOICES['yuki'];
    const langConfig = LANGUAGES[langKey] || LANGUAGES['hindi'];
    const styleConfig = STYLES[voiceConfig.style] || STYLES['natural'];
    
    // Add language prefix
    const fullText = langConfig.prefix + text;
    
    console.log(`🎤 Generating: Voice=${voiceConfig.name}, Lang=${langConfig.name}, Text="${text.substring(0,50)}..."`);
    
    try {
        // Try ElevenLabs style API
        const apiUrl = `https://text-to-speech-api.onrender.com/api/tts?text=${encodeURIComponent(fullText)}&voice=${voiceConfig.voice}&lang=${langConfig.code}&speed=${styleConfig.speed}&pitch=${styleConfig.pitch}`;
        
        const response = await axios.get(apiUrl, {
            responseType: 'arraybuffer',
            timeout: 30000,
            headers: { 'User-Agent': 'BRONX-VOICE/1.0' }
        });
        
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', `inline; filename="bronx-voice-${Date.now()}.mp3"`);
        res.send(Buffer.from(response.data));
        
    } catch (error) {
        console.log('⚠️ Primary API failed, using fallback...');
        
        try {
            // Fallback: Free TTS API
            const fallbackUrl = `https://api.voicerss.org/?key=free&hl=${langConfig.code}&src=${encodeURIComponent(fullText)}&f=48khz_16bit_stereo&c=MP3&v=${voiceConfig.voice}`;
            
            const response = await axios.get(fallbackUrl, {
                responseType: 'arraybuffer',
                timeout: 30000
            });
            
            res.setHeader('Content-Type', 'audio/mpeg');
            res.send(Buffer.from(response.data));
            
        } catch (err) {
            console.error('❌ Both APIs failed');
            
            // Ultimate fallback: Generate simple audio response
            const errorMsg = JSON.stringify({
                error: "Voice generation failed",
                text: text,
                suggestion: "Try shorter text or different voice",
                voices: Object.keys(VOICES)
            });
            
            res.status(500).json(JSON.parse(errorMsg));
        }
    }
});

// ============ JSON API ============
app.get('/api/speak', (req, res) => {
    const text = req.query.text;
    const voiceKey = req.query.voice || 'yuki';
    const langKey = req.query.lang || 'hindi';
    const host = req.get('host');
    
    if (!text) {
        return res.json({ error: "Missing text", usage: "/api/speak?text=Hello&voice=yuki" });
    }
    
    const audioUrl = `https://${host}/speak?text=${encodeURIComponent(text)}&voice=${voiceKey}&lang=${langKey}`;
    
    res.json({
        success: true,
        text: text,
        voice: VOICES[voiceKey]?.name || 'Yuki',
        language: LANGUAGES[langKey]?.name || 'Hindi',
        audio_url: audioUrl,
        credit: "BRONX_ULTRA"
    });
});

// ============ LIST VOICES ============
app.get('/voices', (req, res) => {
    res.json({
        success: true,
        voices: Object.entries(VOICES).map(([k,v]) => ({
            id: k,
            name: v.name,
            style: v.style,
            sample_url: `/speak?text=Hello+I+am+${k}&voice=${k}&lang=english`
        })),
        languages: Object.keys(LANGUAGES),
        credit: "BRONX_ULTRA"
    });
});

// ============ TEST ============
app.get('/test', (req, res) => {
    res.json({
        status: "✅ BRONX VOICE API ONLINE",
        voices: Object.keys(VOICES).length + " female voices",
        languages: Object.keys(LANGUAGES),
        endpoints: {
            speak: "/speak?text=नमस्ते&voice=yuki&lang=hindi",
            api: "/api/speak?text=Hello&voice=aiko",
            voices: "/voices"
        }
    });
});

// ============ 404 ============
app.use((req, res) => {
    res.status(404).json({ error: "Not found", home: "/", speak: "/speak?text=Hello", voices: "/voices" });
});

// ============ START ============
app.listen(PORT, '0.0.0.0', () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎙️ BRONX VOICE API');
    console.log(`🚀 Port: ${PORT}`);
    console.log('👩 Voices: Yuki, Aiko, Siri, Niki, Priya, Anjali, Deepika');
    console.log('🌍 Languages: Hindi, English, Bangla, Tamil, Telugu, Gujarati');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
