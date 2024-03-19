let isMuted = false;
const synth = window.speechSynthesis;

// Populate voice selection when the page loads and when voices are loaded
function populateVoiceList() {
    const voices = synth.getVoices();
    const voiceSelect = document.getElementById('voice-selection');
    const storedVoice = localStorage.getItem('selectedVoice');

    voiceSelect.innerHTML = '';
    voices.forEach(voice => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        if (voice.name === storedVoice) {
            option.selected = true;
        }
        voiceSelect.appendChild(option);
    });

    if (voices.length === 0) {
        synth.onvoiceschanged = populateVoiceList;
    }
}

// Append messages to the chat
function appendMessage(sender, message) {
    const chatBox = document.getElementById('jarvis-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'jarvis-message');
    messageElement.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Handle text-to-speech
function speak(text) {
    if (isMuted) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = synth.getVoices().find(voice => voice.name === document.getElementById('voice-selection').value);
    if (selectedVoice) utterance.voice = selectedVoice;
    synth.speak(utterance);
}

// Process user input
function processUserInput(userInput) {
    appendMessage('user', userInput);
    if (userInput.toLowerCase().startsWith('weather')) {
        const city = userInput.split(' ').slice(1).join(' ');
        getWeather(city);
    } else {
        sendToOpenAI(userInput);
    }
}

// Fetch weather data
function getWeather(city) {
    fetch(`http://localhost:5000/weather?city=${encodeURIComponent(city)}`)
    .then(response => response.json())
    .then(data => {
        if (data.error) appendMessage('jarvis', 'Sorry, I could not fetch the weather.');
        else {
            const weatherMessage = `Weather in ${data.city}: ${data.temperature}°C, ${data.description}.`;
            appendMessage('jarvis', weatherMessage);
            speak(weatherMessage);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Send input to OpenAI through Flask backend
function sendToOpenAI(userInput) {
    fetch('http://localhost:5000/get_response', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user_input: userInput })
    })
    .then(response => response.json())
    .then(data => {
        appendMessage('jarvis', data.message);
        speak(data.message);
    })
    .catch(error => console.error('Error:', error));
}

// Speech recognition functionality
function startSpeechRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();
    recognition.onresult = event => {
        const speechResult = event.results[0][0].transcript;
        processUserInput(speechResult);
    };
    recognition.onerror = event => console.error('Speech recognition error:', event.error);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    populateVoiceList();
});

document.getElementById('action-button').addEventListener('click', () => {
    const userInputField = document.getElementById('user-input');
    const userText = userInputField.value.trim();
    if (userText) {
        processUserInput(userText);
        userInputField.value = '';
    }
});

document.getElementById('user-input').addEventListener('keypress', event => {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('action-button').click();
    }
});

document.getElementById('voice-selection').addEventListener('change', () => {
    localStorage.setItem('selectedVoice', document.getElementById('voice-selection').value);
});

document.getElementById('start-speech-recognition').addEventListener('click', startSpeechRecognition);
