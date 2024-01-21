let isMuted = false;
const synth = window.speechSynthesis;

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
    synth.speak(utterance);
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

// Function to process user input
function processUserInput(userInput) {
    appendMessage('user', userInput);

    if (userInput.toLowerCase().startsWith('weather ')) {
        const city = userInput.substring(8); // Extract city name
        getWeather(city); // Fetch and display weather
    } else {
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
