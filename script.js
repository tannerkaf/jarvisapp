let isMuted = false;
const synth = window.speechSynthesis;
let selectedVoice;

// Selects the specific voice
function selectVoice(voiceName) {
    const voices = synth.getVoices();
    selectedVoice = voices.find(voice => voice.name === voiceName);
    if (!selectedVoice) {
        console.log(`Voice "${voiceName}" not found. Using default voice.`);
    } else {
        console.log(`Using voice: ${selectedVoice.name}`);
    }
}

// Appends messages to the chat
function appendMessage(sender, message) {
    const chatBox = document.getElementById('jarvis-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Speaks the text using the selected voice
function speak(text) {
    if (isMuted || !selectedVoice) return;
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    synth.speak(utterance);
}

// Sends user input to the OpenAI API or fetches weather depending on the command
function processUserInput(userInput) {
    appendMessage('user', userInput);
    if (userInput.toLowerCase().includes('weather')) {
        // Extracts the city from the command and fetches weather information
        const city = userInput.split(' ').slice(1).join(' ');
        getWeather(city);
    } else {
        // Sends the input to OpenAI for a response
        sendToOpenAI(userInput);
    }
}

// Fetches weather data from the backend
function getWeather(city) {
    fetch(`http://localhost:5000/weather?city=${encodeURIComponent(city)}`)
        .then(response => response.json())
        .then(data => {
            const weatherMessage = `Weather in ${data.city}: ${data.temperature}°C, ${data.description}.`;
            appendMessage('jarvis', weatherMessage);
            speak(weatherMessage);
        })
        .catch(error => {
            console.error('Error:', error);
            appendMessage('jarvis', 'Sorry, there was an error processing your request.');
        });
}

// Sends input to the OpenAI API through the Flask backend
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
        speak(data.message);
    })
    .catch(error => {
        console.error('Error:', error);
        appendMessage('jarvis', 'Sorry, there was an error processing your request.');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Automatically selects the desired voice
    selectVoice("Microsoft Ryan Online (Natural) - English (United Kingdom)");
    synth.onvoiceschanged = () => selectVoice("Microsoft Ryan Online (Natural) - English (United Kingdom)");

    // Adds event listener to the "Send/Speak" button
    document.getElementById('action-button').addEventListener('click', function() {
        const userInputField = document.getElementById('user-input');
        const userText = userInputField.value.trim();
        if (userText) {
            processUserInput(userText);
            userInputField.value = ''; // Clears the input field
        }
    });

    // Navigation to the Object Detection page
    document.getElementById('to-object-detection').addEventListener('click', function() {
        window.location.href = 'object-detection.html';
    });
});
