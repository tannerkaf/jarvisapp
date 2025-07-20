let isMuted = false;
let voiceLogEnabled = false;
const synth = window.speechSynthesis;
let jarvisVoice = null;

function selectJarvisVoice() {
  const voices = synth.getVoices();
  jarvisVoice = voices.find(voice => voice.name.includes("Microsoft Ryan Online") || voice.name.includes("Ryan"));
  if (!jarvisVoice) {
    alert("Ryan voice not found.");
  }
}

function speak(text) {
  if (isMuted || !jarvisVoice) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = jarvisVoice;
  synth.speak(utterance);
  if (voiceLogEnabled) logToVoicePanel(text);
}

function appendMessage(sender, message) {
  const chatBox = document.getElementById("jarvis-box");
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");
  messageElement.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${message}`;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function streamMessage(text, callback) {
  let index = 0;
  const interval = setInterval(() => {
    if (index < text.length) {
      callback(text.slice(0, index + 1));
      index++;
    } else {
      clearInterval(interval);
    }
  }, 25);
}

function sendToOpenAI(userInput) {
  appendMessage("user", userInput);
  fetch("http://localhost:5000/get_response", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_input: userInput })
  })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        streamMessage(data.message, partial => {
          let el = document.querySelector(".jarvis-stream");
          if (!el) {
            el = document.createElement("div");
            el.classList.add("message", "jarvis-stream");
            document.getElementById("jarvis-box").appendChild(el);
          }
          el.textContent = `Jarvis: ${partial}`;
          document.getElementById("jarvis-box").scrollTop = document.getElementById("jarvis-box").scrollHeight;
        });
        speak(data.message);
      } else {
        appendMessage("jarvis", "Something went wrong.");
      }
    })
    .catch(err => {
      console.error("Error:", err);
      appendMessage("jarvis", "Error occurred.");
    });
}

function logToVoicePanel(text) {
  const logList = document.getElementById("voice-log-list");
  const li = document.createElement("li");
  li.textContent = text;
  logList.appendChild(li);
}

function startSpeechRecognition() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return alert("Speech not supported.");
  const recognition = new Recognition();
  recognition.lang = "en-US";
  recognition.start();
  recognition.onresult = e => {
    document.getElementById("user-input").value = e.results[0][0].transcript;
    document.getElementById("action-button").click();
  };
  recognition.onerror = e => console.error("Speech error:", e.error);
}

function toggleSettings() {
  document.getElementById("settings-panel").classList.toggle("hidden");
  document.getElementById("voice-log-panel").classList.add("hidden");
  document.getElementById("kc135-panel").classList.add("hidden");
}

function toggleKC135() {
  document.getElementById("kc135-panel").classList.toggle("hidden");
  document.getElementById("settings-panel").classList.add("hidden");
  document.getElementById("voice-log-panel").classList.add("hidden");
}

const kc135Data = [
  {
    header: "Flight Controls",
    content: "Spoilers (12), elevator, rudder, ailerons. Mechanical control via cables. TO: 1C-135(K)R(II)-2-12"
  },
  {
    header: "Fuel System",
    content: "Forward: 1-3, Aft: 4-5, Wing: 1L/1R, 2L/2R. Pumps (main & aux). Boom & receptacle. TOs: -2-6, -49JG-6"
  },
  {
    header: "Hydraulics",
    content: "System A: gear, flaps, brakes. System B: rudder, boom. Pressurized reservoirs. TO: -2-10"
  },
  {
    header: "Power & Bleed Air",
    content: "4 engine generators, APU & ext power. Bleed air (10th stage) for start & ECS"
  },
  {
    header: "Landing Gear",
    content: "Main: 4 per side, Nose: 2. Strut: 1100 PSI nitrogen. TO: -2-32"
  },
  {
    header: "TO Series",
    content: "-1: Flight Manual | -2: Maintenance Manual | -6: Inspections | -49JG: Job Guides | 00-20-1: Docs"
  },
  {
    header: "Common Tasks",
    content: "AFTO 781 usage, Red Xs, MICAP, ETIMS, G081, hot brakes, safety clearances"
  },
  {
    header: "Context",
    content: "~1,200 tasks per inspection. Avionics upgrades (Block 45), TO corrections logged regularly"
  }
];

function displayKC135(data) {
  const resultsDiv = document.getElementById("kc135-results");
  resultsDiv.innerHTML = "";
  data.forEach(entry => {
    const block = document.createElement("div");
    block.style.marginBottom = "15px";
    block.innerHTML = `<strong>${entry.header}</strong><br>${entry.content}`;
    resultsDiv.appendChild(block);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("user-input").addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("action-button").click();
    }
  });

  document.getElementById("glow-toggle").addEventListener("change", e => {
    document.body.classList.toggle("no-glow", !e.target.checked);
  });

  document.getElementById("voice-log-toggle").addEventListener("change", e => {
    voiceLogEnabled = e.target.checked;
    document.getElementById("voice-log-panel").classList.toggle("hidden", !e.target.checked);
  });

  document.getElementById("start-speech-recognition").addEventListener("click", startSpeechRecognition);

  document.getElementById("action-button").addEventListener("click", () => {
    const inputField = document.getElementById("user-input");
    const userText = inputField.value.trim();
    if (userText) {
      sendToOpenAI(userText);
      inputField.value = "";
    }
  });

  selectJarvisVoice();
  synth.onvoiceschanged = selectJarvisVoice;

  // KC-135 search
  const searchInput = document.getElementById("kc135-search");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();
      const filtered = kc135Data.filter(entry =>
        entry.header.toLowerCase().includes(query) || entry.content.toLowerCase().includes(query)
      );
      displayKC135(filtered);
    });
    displayKC135(kc135Data);
  }

  // Startup animation
  const startup = document.getElementById("startup-screen");
  setTimeout(() => {
    startup.style.opacity = 0;
    setTimeout(() => (startup.style.display = "none"), 1000);
  }, 1800);
});
