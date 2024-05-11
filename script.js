let isMuted = false;
const synth = window.speechSynthesis;

// Function to populate voice selection dropdown
function populateVoiceList() {
    const voices = synth.getVoices();
    const voiceSelect = document.getElementById('voice-selection');
    voiceSelect.innerHTML = '';
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
    let utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = synth.getVoices().find(voice => voice.name === document.getElementById('voice-selection').value);
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

// Fetch weather data from Flask backend
function getWeather(city) {
    fetch(`http://localhost:5000/weather?city=${encodeURIComponent(city)}`)
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

// Send input to OpenAI API through Flask backend
function sendToOpenAI(userInput) {
    fetch('http://localhost:5000/get_response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_input: userInput })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.message) {
            appendMessage('jarvis', data.message);
            speak(data.message);
        } else if (data.error) {
            appendMessage('jarvis', data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        appendMessage('jarvis', 'Sorry, there was an error processing your request.');
    });
}

// Speech recognition functionality
function startSpeechRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = function(event) {
        const speechResult = event.results[0][0].transcript;
        processUserInput(speechResult);
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
    };
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    populateVoiceList();
    synth.onvoiceschanged = populateVoiceList;
});

document.getElementById('action-button').addEventListener('click', function() {
    const userInputField = document.getElementById('user-input');
    const userText = userInputField.value.trim();
    if (userText) {
        processUserInput(userText);
        userInputField.value = ''; // Clear the input field right after sending
    }
});

document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('action-button').click();
    }
});

document.getElementById('start-speech-recognition').addEventListener('click', function() {
    startSpeechRecognition();
});
