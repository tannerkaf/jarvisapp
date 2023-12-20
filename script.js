let isMuted = false;
const synth = window.speechSynthesis;
let userName = localStorage.getItem("jarvis-user-name") || "Guest";
let selectedVoice = null;

// Menu and customization logic
document.getElementById('menu-button').addEventListener('click', function() {
    document.getElementById('menu-panel').style.display = 'block';
    populateVoiceList();
});

document.getElementById('apply-settings').addEventListener('click', function() {
    userName = document.getElementById('menu-user-name').value || userName;
    document.body.style.backgroundColor = document.getElementById('bg-color').value;

    const selectedVoiceName = document.getElementById('voice-selection').selectedOptions[0].getAttribute('data-name');
    selectedVoice = synth.getVoices().find(voice => voice.name === selectedVoiceName);

    document.getElementById('menu-panel').style.display = 'none';
});

document.getElementById('mute-toggle').addEventListener('click', function() {
    isMuted = !isMuted;
    document.getElementById('mute-toggle').textContent = isMuted ? 'Unmute' : 'Mute';
});

function populateVoiceList() {
    var voices = synth.getVoices();
    var voiceSelect = document.getElementById('voice-selection');
    voiceSelect.innerHTML = '';

    voices.forEach(voice => {
        var option = document.createElement('option');
        option.textContent = voice.name + ' (' + voice.lang + ')';
        option.setAttribute('data-name', voice.name);
        voiceSelect.appendChild(option);
    });
}

function speak(text) {
    if (synth.speaking || isMuted) return;
    let utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utterance.voice = selectedVoice;
    synth.speak(utterance);
}

window.speechSynthesis.onvoiceschanged = function() {
    populateVoiceList();
};

// Chatbot core logic
document.getElementById('set-name').addEventListener('click', function() {
    userName = document.getElementById('user-name').value || "Guest";
    localStorage.setItem("jarvis-user-name", userName);
    alert(`Name set to ${userName}`);
});

document.getElementById('send-button').addEventListener('click', function() {
    processUserInput();
});

document.getElementById('speak-button').addEventListener('click', function() {
    let recognition = new webkitSpeechRecognition();
    recognition.onresult = function(event) {
        let speechInput = event.results[0][0].transcript;
        document.getElementById('user-input').value = speechInput;
        processUserInput();
    };
    recognition.start();
});

document.getElementById('clear-history').addEventListener('click', function() {
    localStorage.removeItem("jarvis-chat");
    document.getElementById('jarvis-box').innerHTML = '';
});

function processUserInput() {
    const userInput = document.getElementById('user-input').value.trim();
    if (!userInput) return;

    appendMessage('user', userInput);
    saveConversation(userInput, 'user');

    const response = generateResponse(userInput);
    if (response) {
        appendMessage('ai', response);
        saveConversation(response, 'ai');
        speak(response);
        showFeedbackButtons();
    }

    document.getElementById('user-input').value = ''; // Clear input field
}

function appendMessage(sender, message) {
    const jarvisBox = document.getElementById('jarvis-box');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
    const timestamp = new Date().toLocaleTimeString();
    messageDiv.innerHTML = `<strong>${sender === 'user' ? 'You' : 'Jarvis'}:</strong> ${message} <span class="timestamp">(${timestamp})</span>`;
    jarvisBox.appendChild(messageDiv);
}

function generateResponse(input) {
    // Implement your response generation logic here
    return `I'm not sure how to respond to that, ${userName}. Can you try asking something else?`;
}

function saveConversation(message, sender) {
    let conversation = JSON.parse(localStorage.getItem("jarvis-chat") || "[]");
    conversation.push({ message, sender, timestamp: new Date().toISOString() });
    localStorage.setItem("jarvis-chat", JSON.stringify(conversation));
}

function loadConversation() {
    let conversation = JSON.parse(localStorage.getItem("jarvis-chat") || "[]");
    conversation.forEach(msg => {
        appendMessage(msg.sender, msg.message);
    });
}

function showFeedbackButtons() {
    document.getElementById('feedback-buttons').style.display = 'block';
}

function provideFeedback(feedbackType) {
    console.log(`Feedback on last response: ${feedbackType}`);
    document.getElementById('feedback-buttons').style.display = 'none';
}

window.onload = loadConversation;
