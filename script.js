let isMuted = false;
const synth = window.speechSynthesis;
let recognizing = false;
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

function populateVoiceList() {
    const voiceSelect = document.getElementById('voice-selection');
    voiceSelect.innerHTML = '';
    voices.forEach(voice => {
        const option = document.createElement('option');
        option.textContent = voice.name + (voice.default ? ' (default)' : '');
        option.setAttribute('data-lang', voice.lang);
        option.setAttribute('data-name', voice.name);
        voiceSelect.appendChild(option);
    });
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
    let utterance = new SpeechSynthesisUtterance(text);
    const selectedVoiceName = document.getElementById('voice-selection').selectedOptions[0].getAttribute('data-name');
    utterance.voice = synth.getVoices().find(voice => voice.name === selectedVoiceName);
    synth.speak(utterance);
}

function processUserInput(userInput) {
    appendMessage('user', userInput);
    if (userInput.trim().toLowerCase() === 'show object detection') {
        window.location.href = '/object-detection.html'; // Assuming this is the correct path
    } else if (userInput.trim().toLowerCase().startsWith('generate image:')) {
        const prompt = userInput.trim().substring('generate image:'.length).trim();
        generateImageWithDalle(prompt);
    } else {
        sendToOpenAI(userInput);
    }
}

function sendToOpenAI(userInput) {
    // Implementation remains the same
}

function startSpeechRecognition() {
    // Implementation remains the same
}

document.addEventListener('DOMContentLoaded', function() {
    populateVoiceList();
    synth.onvoiceschanged = populateVoiceList;

    document.getElementById('action-button').addEventListener('click', sendUserInput);
    document.getElementById('start-speech-recognition').addEventListener('click', toggleSpeechRecognition);
    document.getElementById('voice-selection').addEventListener('change', function() {
        localStorage.setItem('selectedVoice', this.value);
        updateVoiceSelection();
    });
    
    updateVoiceSelection(); // Set the voice selection based on localStorage
});

function populateVoiceList() {
    const voiceSelect = document.getElementById('voice-selection');
    voiceSelect.innerHTML = '';
    synth.getVoices().forEach(voice => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = voice.name;
        voiceSelect.appendChild(option);
    });
    voiceSelect.value = localStorage.getItem('selectedVoice') || synth.getVoices()[0].name;
}

function sendUserInput() {
    const userInputField = document.getElementById('user-input');
    const userInput = userInputField.value.trim();
    if (userInput) {
        appendMessage('user', userInput);
        processCommand(userInput);
        userInputField.value = '';
    }
}

function appendMessage(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    messageElement.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    if (sender === 'jarvis' && !isMuted) {
        speakResponse(message);
    }
}

function processCommand(command) {
    if (command.toLowerCase().startsWith('weather')) {
        const city = command.split(' ').slice(1).join(' ');
        fetchWeather(city);
    } else {
        fetchOpenAIResponse(command);
    }
}

function fetchOpenAIResponse(userInput) {
    fetch('/get_response', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user_input: userInput })
    })
    .then(response => response.json())
    .then(data => {
        appendMessage('jarvis', data.message);
    })
    .catch(error => {
        console.error('Error fetching OpenAI response:', error);
        appendMessage('jarvis', 'Sorry, there was an error processing your request.');
    });
}

function fetchWeather(city) {
    fetch(`/weather?city=${encodeURIComponent(city)}`)
    .then(response => response.json())
    .then(data => {
        appendMessage('jarvis', `Weather in ${city}: ${data.temperature}°C, ${data.description}.`);
    })
    .catch(error => {
        console.error('Error fetching weather:', error);
        appendMessage('jarvis', 'Sorry, I could not fetch the weather.');
    });
}

function speakResponse(message) {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.voice = synth.getVoices().find(voice => voice.name === localStorage.getItem('selectedVoice'));
    synth.speak(utterance);
}

function toggleSpeechRecognition() {
    if (recognizing) {
        recognition.stop();
        recognizing = false;
        return;
    }
    recognition.lang = 'en-US';
    recognition.start();
    recognizing = true;

    recognition.onresult = event => {
        const speechResult = event.results[0][0].transcript;
        appendMessage('user', speechResult);
        processCommand(speechResult);
    };

    recognition.onend = () => recognizing = false;
    recognition.onerror = event => console.error('Speech recognition error:', event.error);
}

function updateVoiceSelection() {
    const selectedVoice = localStorage.getItem('selectedVoice');
    if (selectedVoice) {
        document.getElementById('voice-selection').value = selectedVoice;
    }
}
