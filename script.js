// --- Jarvis core ---
let voiceLogEnabled = false;
const synth = window.speechSynthesis;
let jarvisVoice = null;

function selectJarvisVoice() {
  const voices = synth.getVoices();
  jarvisVoice = voices.find(v => v.name.includes("Microsoft Ryan Online") || v.name.includes("Ryan"));
}
function speak(text) {
  if (!jarvisVoice) return;
  const u = new SpeechSynthesisUtterance(text);
  u.voice = jarvisVoice;
  synth.speak(u);
  if (voiceLogEnabled) logToVoicePanel(text);
}
function appendMessage(sender, msg) {
  const cb = document.getElementById("jarvis-box");
  const m = document.createElement("div");
  m.classList.add("message");
  m.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${msg}`;
  cb.appendChild(m);
  cb.scrollTop = cb.scrollHeight;
}
function streamMessage(text, cbk) {
  let i = 0;
  const interval = setInterval(() => {
    if (i < text.length) { cbk(text.slice(0, i+1)); i++; }
    else clearInterval(interval);
  }, 25);
}
function sendToOpenAI(inp) {
  appendMessage("user", inp);
  fetch("http://localhost:5000/get_response", {
    method: "POST", headers: {"Content-Type": "application/json"},
    body: JSON.stringify({user_input: inp})
  }).then(r => r.json()).then(data => {
    if (data.message) {
      streamMessage(data.message, partial => {
        let e = document.querySelector(".jarvis-stream");
        if (!e) {
          e = document.createElement("div");
          e.classList.add("message", "jarvis-stream");
          document.getElementById("jarvis-box").appendChild(e);
        }
        e.textContent = `Jarvis: ${partial}`;
        document.getElementById("jarvis-box").scrollTop = document.getElementById("jarvis-box").scrollHeight;
      });
      speak(data.message);
    } else appendMessage("jarvis", "Unexpected error");
  }).catch(() => appendMessage("jarvis", "Fetch error"));
}
function logToVoicePanel(txt) {
  const ul = document.getElementById("voice-log-list");
  const li = document.createElement("li");
  li.textContent = txt;
  ul.appendChild(li);
}
function startSpeechRecognition() {
  const R = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!R) return alert("Speech not supported");
  const rec = new R();
  rec.lang = "en-US";
  rec.start();
  rec.onresult = e => {
    document.getElementById("user-input").value = e.results[0][0].transcript;
    document.getElementById("action-button").click();
  };
}

// Panel toggles
function toggleSettings(){
  document.getElementById("settings-panel").classList.toggle("hidden");
  document.getElementById("voice-log-panel").classList.add("hidden");
  document.getElementById("kc135-panel").classList.add("hidden");
}
function toggleKC135(){
  document.getElementById("kc135-panel").classList.toggle("hidden");
  document.getElementById("settings-panel").classList.add("hidden");
  document.getElementById("voice-log-panel").classList.add("hidden");
}

// --- KC-135 Data ---
const kc135Data = [
  {header:"Specifications", content:"Engines: CFM56‑2 turbofans; Wingspan:130 ft 10 in; Length:136 ft 3 in; MTOW:322,500 lb; Fuel offload ~200,000 lb; Ceiling:50,000 ft."},
  {header:"Maintenance & Inspections", content:"Preflight(valid 72h), Thruflight, Post‑flight, Periodic 24 months/1800 h (~1200 tasks). TOs:1C‑135‑6 series."},
  {header:"Technical Orders", content:"‑1 Flight manual | ‑2 Maintenance manual | ‑6 Scheduled insp | ‑49JG Job Guides | 00‑20‑1 Doc procedures."},
  {header:"Flight Controls", content:"Spoilers(12), elevator, ailerons, rudder. TO:1C‑135(K)R(II)‑2‑12."},
  {header:"Fuel System", content:"Forward tanks1‑3, Aft4‑5, Wing1L/1R 2L/2R; Main/aux pumps, boom/receptacle. TOs:‑2‑6, ‑49JG‑6."},
  {header:"Hydraulics", content:"Systems A(gear/flaps/brakes), B(rudder/boom), bleed‑air reservoirs. TO:‑2‑10."},
  {header:"Power & Bleed Air", content:"4 engine generators, APU/ext power, bleed air from 10th stage for start/ECS."},
  {header:"Landing Gear", content:"Main(4/side), Nose2, Strut≈1100 PSI N₂. TO:‑2‑32."},
  {header:"Avionics Upgrades", content:"PACER CRAG (late ’90s), Block 45 (glass cockpit, 2010s)."},
  {header:"Related Aircraft", content:"KC‑10 Extender (356k lb fuel), KC‑46A Pegasus (212k lb fuel, WARP pods)."},
  {header:"Historical Context", content:"Service since 1956; still ~400 in service 2025; multiple modernizations keep jets flying decades past A‑model."}
];

function displayKC135(data){
  const dv = document.getElementById("kc135-results");
  dv.innerHTML="";
  data.forEach(e=>{
    const b = document.createElement("div");
    b.style.marginBottom="15px";
    b.innerHTML=`<strong>${e.header}</strong><br>${e.content}`;
    dv.appendChild(b);
  });
}

// Event setup
document.addEventListener("DOMContentLoaded", ()=>{
  document.getElementById("user-input").addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); document.getElementById("action-button").click(); } });
  document.getElementById("action-button").addEventListener("click", ()=>{
    const txt=document.getElementById("user-input").value.trim();
    if(txt){ sendToOpenAI(txt); document.getElementById("user-input").value=""; }
  });
  document.getElementById("start-speech-recognition").addEventListener("click", startSpeechRecognition);
  document.getElementById("glow-toggle").addEventListener("change",e=> document.body.classList.toggle("no-glow",!e.target.checked));
  document.getElementById("voice-log-toggle").addEventListener("change",e=>{
    voiceLogEnabled=e.target.checked;
    document.getElementById("voice-log-panel").classList.toggle("hidden",!voiceLogEnabled);
  });

  // KC‑135 search
  const si=document.getElementById("kc135-search");
  if(si){
    si.addEventListener("input",()=>{
      const q=si.value.toLowerCase();
      displayKC135(kc135Data.filter(e=> e.header.toLowerCase().includes(q) || e.content.toLowerCase().includes(q)));
    });
    displayKC135(kc135Data);
  }

  selectJarvisVoice();
  synth.onvoiceschanged=selectJarvisVoice;

  // Startup fade
  const ss=document.getElementById("startup-screen");
  setTimeout(()=>{ ss.style.opacity=0; setTimeout(()=>ss.style.display="none",1000); },1800);
});
