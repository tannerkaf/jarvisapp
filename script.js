let isMuted = false;
const synth = window.speechSynthesis;

document.addEventListener('DOMContentLoaded', function () {
    populateVoiceList();
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = populateVoiceList;
    }
    testCommunication(); // Function call to test OpenAI and weather communication
});

function populateVoiceList() {
    const voices = synth.getVoices();
    const voiceSelect = document.getElementById('voice-selection');
    voiceSelect.innerHTML = '';
    voices.forEach(voice => {
        const option = document.createElement('option');
        option.textContent = voice.name + ' (' + voice.lang + ')';
        if (voice.name === localStorage.getItem('selectedVoice')) {
            option.selected = true;
        }
        voiceSelect.appendChild(option);
    });
}

document.getElementById('voice-selection').addEventListener('change', function () {
    localStorage.setItem('selectedVoice', this.value);
});

function appendMessage(sender, message) {
    const chatBox = document.getElementById('jarvis-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'jarvis-message');
    messageElement.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function speak(text) {
    if (isMuted) return;
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = synth.getVoices().find(voice => voice.name === localStorage.getItem('selectedVoice'));
    synth.speak(utterance);
}

function processUserInput(userInput) {
    appendMessage('user', userInput);
    if (userInput.toLowerCase().includes('weather')) {
        const city = userInput.split(' ').slice(1).join(' ');
        getWeather(city);
    } else {
        sendToOpenAI(userInput);
    }
}

function getWeather(city) {
    fetch(`http://127.0.0.1:5000/weather?city=${encodeURIComponent(city)}`)
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

function sendToOpenAI(userInput) {
    fetch('http://127.0.0.1:5000/get_response', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_input: userInput})
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

function testCommunication() {
    // Optionally implement this function to test sending predefined queries to both endpoints
    console.log("Testing communication with the Flask backend.");
}

// Speech recognition setup goes here
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

document.getElementById('action-button').addEventListener('click', function() {
   
