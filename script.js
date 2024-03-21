let isMuted = false;
const synth = window.speechSynthesis;

document.addEventListener('DOMContentLoaded', function () {
    populateVoiceList();
    // Ensure the voice list is populated again when voices are loaded
    synth.onvoiceschanged = populateVoiceList;
});

function populateVoiceList() {
    const voiceSelect = document.getElementById('voice-selection');
    const voices = synth.getVoices();
    voiceSelect.innerHTML = '';
    voices.forEach(voice => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = voice.name;
        voiceSelect.appendChild(option);
    });
    voiceSelect.value = localStorage.getItem('selectedVoice') || voices[0].name;
}

// Function to append messages to the chat box
function appendMessage(sender, message) {
    const chatBox = document.getElementById('jarvis-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Keep the latest message in view
}

// Function to handle text-to-speech
function speak(text) {
    if (isMuted) return; // Check if mute is enabled
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = synth.getVoices().find(voice => voice.name === document.getElementById('voice-selection').value);
    synth.speak(utterance);
}

// Function to process user input
function processUserInput(userInput) {
    appendMessage('user', userInput); // Display user input in chat
    // Decide if the input is for weather or a general query
    if (userInput.toLowerCase().includes('weather')) {
        const city = userInput.split(' ').slice(1).join(' '); // Extract city from input
        getWeather(city);
    } else {
        sendToOpenAI(userInput);
    }
}

// Function to fetch weather data from Flask backend
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
        .catch(error => console.error('Error fetching weather:', error));
}

// Function to send user input to the Flask backend for OpenAI processing
function sendToOpenAI(userInput) {
    fetch('http://127.0.0.1:5000/get_response', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user_input: userInput })
    })
        .then(response => response.json())
        .then(data => {
            appendMessage('jarvis', data.message); // Display AI response in chat
            speak(data.message); // Read out the AI response
        })
        .catch(error => console.error('Error sending to OpenAI:', error));
}

// Event listener for the send button
document.getElementById('action-button').addEventListener('click', function() {
    const userInputField = document.getElementById('user-input');
    const userText = userInputField.value.trim();
    if (userText) {
        processUserInput(userText);
        userInputField.value = ''; // Clear the input field
    }
});

// Save the selected voice for future use
document.getElementById('voice-selection').addEventListener('change', function() {
    localStorage.setItem('selectedVoice', this.value);
});

// Optional: Implement speech recognition as needed
