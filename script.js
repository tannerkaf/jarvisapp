let isMuted = false;
const synth = window.speechSynthesis;

// Function to populate voice selection dropdown
function populateVoiceList() {
    const voices = synth.getVoices();
    const voiceSelect = document.getElementById('voice-selection');

    voices.forEach(voice => {
        const option = document.createElement('option');
        option.textContent = voice.name;
        voiceSelect.appendChild(option);
    });
}

// Function to append messages to the chat
function appendMessage(sender, message) {
    const chatBox = document.getElementById('jarvis-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to handle text-to-speech
function speak(text) {
    if (isMuted) return;
    const selectedVoiceName = document.getElementById('voice-selection').value;
    const selectedVoice = synth.getVoices().find(voice => voice.name === selectedVoiceName);

    let utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }
    synth.speak(utterance);
}

// Function to process user input
function processUserInput(userInput) {
    appendMessage('user', userInput);
    
    if (userInput.toLowerCase().includes('weather')) {
        const city = userInput.split(' ').slice(1).join(' ');
        getWeather(city);
    } else {
        sendToOpenAI(userInput);
    }
}

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

// Function to send input to OpenAI API through the Flask backend
function sendToOpenAI(userInput) {
    fetch('http://127.0.0.1:5000/get_response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_input: userInput })
    })
    .then(response => response.json())
    .then(data => {
        appendMessage('jarvis', data.message);
        speak(data.message);
    })
    .catch(error => {
        console.error('Error:', error);
        appendMessage('jarvis', 'Sorry, there was an error processing your request.');
    });
}

// Event listeners
document.getElementById('action-button').addEventListener('click', function() {
    const userInputField = document.getElementById('user-input');
    const userText = userInputField.value.trim();
    if (userText) {
        processUserInput(userText);
        userInputField.value = '';
    }
});

document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('action-button').click();
    }
});

document.getElementById('stop-speech').addEventListener('click', function() {
    synth.cancel();
});

// Populate voice list when voices change
synth.onvoiceschanged = populateVoiceList;
