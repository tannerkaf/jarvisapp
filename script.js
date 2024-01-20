let isMuted = false;
const synth = window.speechSynthesis;
let userName = localStorage.getItem("jarvis-user-name") || "Guest";
let selectedVoice = localStorage.getItem("jarvis-selected-voice");
let backgroundColor = localStorage.getItem("jarvis-bg-color") || "#ffffff";

document.body.style.backgroundColor = backgroundColor;

document.getElementById('action-button').addEventListener('click', function() {
    const userInputField = document.getElementById('user-input');
    const userText = userInputField.value.trim();
    if (userText) {
        processUserInput(userText);
        userInputField.value = '';
    }
});

function processUserInput(userInput) {
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
        if (!isMuted) {
            speak(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

function appendMessage(sender, message) {
    const chatBox = document.getElementById('jarvis-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function speak(text) {
    let utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
        utterance.voice = synth.getVoices().find(voice => voice.name === selectedVoice);
    }
    synth.speak(utterance);
}

// Add additional functionalities (e.g., menu options) here
