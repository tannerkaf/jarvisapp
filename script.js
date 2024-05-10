let isMuted = false;
const synth = window.speechSynthesis;

// Function to set a specific voice
function setVoice() {
    const voices = synth.getVoices();
    const selectedVoice = voices.find(voice => voice.name === "Microsoft Ryan Online (Natural) - English (United Kingdom)");
    return selectedVoice;
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
    utterance.voice = setVoice();
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
document.addEventListener('DOMContentLoaded', function () {
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = setVoice;
    }
});

document.getElementById('action-button').addEventListener('click', function() {
    const userInputField = document.getElementById('user-input');
    const userText = userInputField.value.trim();
    if (userText) {
        processUserInput(userText);
        userInputField.value = ''; // Clear input field after sending
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
