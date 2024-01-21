let isMuted = false;
const synth = window.speechSynthesis;
let selectedVoiceName = localStorage.getItem('jarvis-selected-voice') || 'Google UK English Male'; // Default voice

// Function to populate voice selection dropdown
function populateVoiceList() {
    const voices = synth.getVoices();
    const voiceSelect = document.getElementById('voice-select'); // Your dropdown ID

    voices.forEach(voice => {
        const option = document.createElement('option');
        option.textContent = voice.name + ' (' + voice.lang + ')';
        if (voice.name === selectedVoiceName) {
            option.selected = true;
        }
        voiceSelect.appendChild(option);
    });
}

// Function to append messages to the chat
function appendMessage(sender, message) {
    const chatBox = document.getElementById('jarvis-box'); // Your chat display element ID
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to handle text-to-speech
function speak(text) {
    if (isMuted) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = synth.getVoices().find(voice => voice.name === selectedVoiceName);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }
    synth.speak(utterance);
}

// Event listener for voice selection change
document.getElementById('voice-select').addEventListener('change', function() {
    selectedVoiceName = this.value;
    localStorage.setItem('jarvis-selected-voice', selectedVoiceName);
});

// Function to fetch weather data from the Flask backend
function getWeather(city) {
    fetch(`/weather?city=${encodeURIComponent(city)}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                appendMessage('jarvis', 'Sorry, I could not fetch the weather.');
            } else {
                const weatherMessage = `Weather in ${data.city}: ${data.temperature}°C, ${data.description}.`;
                appendMessage('jarvis', weatherMessage);
                speak(weatherMessage);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            appendMessage('jarvis', 'Sorry, there was an error processing your request.');
        });
}

// Function to process user input
function processUserInput(userInput) {
    appendMessage('user', userInput);
    
    if (userInput.toLowerCase().includes('weather')) {
        const cityMatch = userInput.match(/weather in (\w+)/i);
        const city = cityMatch ? cityMatch[1] : 'London'; // Default city
        getWeather(city);
    } else {
        // Your existing code for other requests...
    }
}

// Event listener for user input
document.getElementById('action-button').addEventListener('click', function() {
    const userInputField = document.getElementById('user-input');
    const userText = userInputField.value.trim();
    if (userText) {
        processUserInput(userText);
        userInputField.value = '';
    }
});

// Listen for Enter key in the text input
document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('action-button').click();
    }
});

// Populate the voice list when the speechSynthesis voices change
synth.onvoiceschanged = populateVoiceList;
