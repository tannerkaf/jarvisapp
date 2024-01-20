let isMuted = false;
const synth = window.speechSynthesis;
let userName = localStorage.getItem("jarvis-user-name") || "Guest";
let backgroundColor = localStorage.getItem("jarvis-bg-color") || "#ffffff";
document.body.style.backgroundColor = backgroundColor;

function speak(text) {
    synth.cancel(); // Stop any ongoing speech

    let utterance = new SpeechSynthesisUtterance(text);
    let voices = synth.getVoices();
    let ryanVoice = voices.find(voice => voice.name === 'Microsoft Ryan UK English');

    if (ryanVoice) {
        utterance.voice = ryanVoice;
    } else {
        console.warn('Microsoft Ryan UK English voice not found. Using default voice.');
    }

    synth.speak(utterance);
}

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

document.getElementById('start-speech-recognition').addEventListener('click', function() {
    var recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';

    recognition.onresult = function(event) {
        var speechResult = event.results[0][0].transcript;
        document.getElementById('user-input').value = speechResult;
    };

    recognition.start();
});

document.getElementById('stop-speech').addEventListener('click', function() {
    synth.cancel(); // Stops the speech synthesis
});

function processUserInput(userInput) {
    showLoadingIndicator(true);
    fetch('http://127.0.0.1:5000/get_response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_input: userInput })
    })
    .then(response => response.json())
    .then(data => {
        appendMessage('user', userInput);
        appendMessage('jarvis', data.message);
        showLoadingIndicator(false);
        if (!isMuted) {
            speak(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showLoadingIndicator(false);
    });
}

function showLoadingIndicator(show) {
    document.getElementById('loading-indicator').style.display = show ? 'block' : 'none';
}

function appendMessage(sender, message) {
    const chatBox = document.getElementById('jarvis-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}
