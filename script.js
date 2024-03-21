let isMuted = false;
const synth = window.speechSynthesis;

document.addEventListener('DOMContentLoaded', () => {
    populateVoiceList();
    synth.onvoiceschanged = populateVoiceList;
});

function populateVoiceList() {
    const voiceSelect = document.getElementById('voice-selection');
    const voices = synth.getVoices();
    voiceSelect.innerHTML = voices.map(voice => `<option value="${voice.name}">${voice.name} (${voice.lang})</option>`).join('');
    voiceSelect.value = localStorage.getItem('selectedVoice') || voices[0].name;
}

function appendMessage(sender, message) {
    const chatBox = document.getElementById('jarvis-box');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    messageElement.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function speak(text) {
    if (isMuted) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = synth.getVoices().find(voice => voice.name === document.getElementById('voice-selection').value);
    synth.speak(utterance);
}

function processUserInput(userInput) {
    appendMessage('user', userInput);
    if (userInput.toLowerCase().startsWith('weather')) {
        const city = userInput.split(' ').slice(1).join(' ');
        getWeather(city);
    } else {
        sendToOpenAI(userInput);
    }
}

function getWeather(city) {
    fetch(`/weather?city=${encodeURIComponent(city)}`)
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                appendMessage('jarvis', data.message);
            } else {
                const message = `Weather in ${city}: ${data.temperature}°C, ${data.description}.`;
                appendMessage('jarvis', message);
                speak(message);
            }
        })
        .catch(error => console.error('Error:', error));
}

function sendToOpenAI(userInput) {
    fetch('/get_response', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_input: userInput})
    })
        .then(response => response.json())
        .then(data => {
            appendMessage('jarvis', data.message);
            speak(data.message);
        })
        .catch(error => console.error('Error:', error));
}

document.getElementById('action-button').addEventListener('click
