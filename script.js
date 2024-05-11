document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.tablinks').click(); // Automatically click the first tab
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = populateVoiceList;
    }
});

function openTab(evt, tabName) {
    var tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    tablinks = document.getElementsByClassName("tablinks");
    
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function populateVoiceList() {
    const voices = synth.getVoices();
    return voices.find(voice => voice.name === "Microsoft Ryan Online (Natural) - English (United Kingdom)");
}

function appendMessage(sender, message) {
    const chatBox = document.getElementById('jarvis-box');
    const messageElement = document.createElement('div');
    messageElement.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function speak(text) {
    if (isMuted) return;
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = populateVoiceList();
    synth.speak(utterance);
}

document.getElementById('action-button').addEventListener('click', function() {
    const userInputField = document.getElementById('user-input');
    const userText = userInputField.value.trim();
    if (userText) {
        processUserInput(userText);
        userInputField.value = ''; // Clear the input field right after the button is pressed
    }
});

document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('action-button').click();
    }
});

function processUserInput(userInput) {
    appendMessage('user', userInput);
    speak(userInput);  // Speak out the user input for confirmation

    if (userInput.toLowerCase().includes('weather')) {
        getWeather(userInput);
    } else {
        sendToOpenAI(userInput);
    }
}

function getWeather(userInput) {
    const city = userInput.split(' ').slice(1).join(' ');
    fetch(`http://localhost:5000/weather?city=${encodeURIComponent(city)}`)
        .then(handleResponse)
        .catch(handleError);
}

function sendToOpenAI(userInput) {
    fetch('http://localhost:5000/get_response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_input: userInput })
    })
    .then(handleResponse)
    .catch(handleError);
}

function handleResponse(response) {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json().then(data => {
        if (data.message) {
            appendMessage('jarvis', data.message);
            speak(data.message);
        } else if (data.error) {
            appendMessage('jarvis', data.error);
        }
    });
}

function handleError(error) {
    console.error('Error:', error);
    appendMessage('jarvis', 'Sorry, there was an error processing your request.');
}

function startSpeechRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = function(event) {
        const speechResult = event.results[0][0].transcript;
        document.getElementById('user-input').value = speechResult; // Display the recognized text in the input field
        processUserInput(speechResult);
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
    };
}

document.getElementById('start-speech-recognition').addEventListener('click', startSpeechRecognition);
