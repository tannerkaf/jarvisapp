let isMuted = false;
let voiceLogEnabled = false;
const synth = window.speechSynthesis;
let jarvisVoice = null;

// Lock to Microsoft Ryan UK voice
function selectJarvisVoice() {
    const voices = synth.getVoices();
    jarvisVoice = voices.find(voice => voice.name.includes("Microsoft Ryan Online") || voice.name.includes("Ryan"));
    if (!jarvisVoice) {
        alert("Ryan voice not found. Please select it in your system TTS settings.");
    }
}

// Speak function with optional voice log
function speak(text) {
    if (isMuted || !jarvisVoice) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = jarvisVoice;
    synth.speak(utterance);

    if (voiceLogEnabled) {
        logToVoicePanel(text);
    }
}

// Append message to chat
function appendMessage(sender, message) {
    const chatBox = document.getElementById("jarvis-box");
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Stream-style typing simulation
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

// Send message to Flask backend
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
            let jarvisResponse = "";
            streamMessage(data.message, (partial) => {
                const existing = document.querySelector(".jarvis-stream");
                if (existing) {
                    existing.textContent = `Jarvis: ${partial}`;
                } else {
                    const streamEl = document.createElement("div");
                    streamEl.classList.add("message", "jarvis-stream");
                    streamEl.textContent = `Jarvis: ${partial}`;
                    document.getElementById("jarvis-box").appendChild(streamEl);
                }
                document.getElementById("jarvis-box").scrollTop = document.getElementById("jarvis-box").scrollHeight;
            });

            speak(data.message);
        } else {
            appendMessage("jarvis", "Something went wrong.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        appendMessage("jarvis", "An error occurred while processing your request.");
    });
}

// Voice log
function logToVoicePanel(text) {
    const logList = document.getElementById("voice-log-list");
    const li = document.createElement("li");
    li.textContent = text;
    logList.appendChild(li);
}

// Speech recognition
function startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Speech recognition not supported in this browser.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = function(event) {
        const speechResult = event.results[0][0].transcript;
        document.getElementById("user-input").value = speechResult;
        document.getElementById("action-button").click();
    };

    recognition.onerror = function(event) {
        console.error("Speech recognition error:", event.error);
    };
}

// UI Toggle
function toggleSettings() {
    const panel = document.getElementById("settings-panel");
    panel.classList.toggle("hidden");
}

// Glow toggle
document.addEventListener("DOMContentLoaded", () => {
    // Enter key support
    const input = document.getElementById("user-input");
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            document.getElementById("action-button").click();
        }
    });

    // Glow effect toggle
    const glowToggle = document.getElementById("glow-toggle");
    glowToggle.addEventListener("change", () => {
        document.body.classList.toggle("no-glow", !glowToggle.checked);
    });

    // Voice log toggle
    const voiceToggle = document.getElementById("voice-log-toggle");
    voiceToggle.addEventListener("change", () => {
        voiceLogEnabled = voiceToggle.checked;
        const panel = document.getElementById("voice-log-panel");
        panel.classList.toggle("hidden", !voiceToggle.checked);
    });

    // Speech button
    document.getElementById("start-speech-recognition").addEventListener("click", startSpeechRecognition);

    // Send button
    document.getElementById("action-button").addEventListener("click", () => {
        const inputField = document.getElementById("user-input");
        const userText = inputField.value.trim();
        if (userText) {
            sendToOpenAI(userText);
            inputField.value = "";
        }
    });

    // Lock to Ryan voice
    selectJarvisVoice();
    synth.onvoiceschanged = selectJarvisVoice;

    // Startup screen
    const startup = document.getElementById("startup-screen");
    setTimeout(() => {
        startup.style.opacity = 0;
        setTimeout(() => startup.style.display = "none", 1000);
    }, 1800);
});
