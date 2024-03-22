let isMuted = false;
const synth = window.speechSynthesis;
let selectedVoice;

document.addEventListener('DOMContentLoaded', function() {
    // Attempt to select the desired voice once voices are loaded
    selectVoice("Microsoft Ryan Online (Natural) - English (United Kingdom)");

    synth.onvoiceschanged = () => {
        selectVoice("Microsoft Ryan Online (Natural) - English (United Kingdom)");
    };

    document.getElementById('action-button').addEventListener('click', function() {
        const userInputField = document.getElementById('user-input');
        const userText = userInputField.value.trim();
        if (userText) {
            processUserInput(userText);
            userInputField.value = ''; // Clear input field
        }
    });

    document.getElementById('user-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Stop the form from submitting
            document.getElementById('action-button').click();
        }
    });

    document.getElementById('start-speech-recognition').addEventListener('click', startSpeechRecognition);
});

function selectVoice(voiceName) {
    const voices = synth.getVoices();
    selectedVoice = voices.find(voice => voice.name === voiceName);

    if (!selectedVoice) {
        console.log(`Voice "${voiceName}" not found. Using default voice.`);
    } else {
        console.log(`Using voice: ${selectedVoice.name}`);
    }
}

function speak(text) {
    if (isMuted || !selectedVoice) return;

    let utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    synth.speak(utterance);
}

function appendMessage(sender, message) {
    const chatBox = document.getElementById('jarvis-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    if (sender === 'jarvis' && !isMuted) speak(message);
}

function processUserInput(userInput) {
    appendMessage('user', userInput);
    sendToOpenAI(userInput);
}

function sendToOpenAI(userInput) {
    fetch('http://localhost:5000/get_response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_input: userInput })
    })
    .then(response => response.json())
    .then(data => {
        appendMessage('jarvis', data.message);
    })
    .catch(error => {
        console.error('Error:', error);
        appendMessage('jarvis', 'Sorry, there was an error processing your request.');
    });
}

function startSpeechRecognition() {
    if (recognizing) {
        recognition.stop();
        return;
    }
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
