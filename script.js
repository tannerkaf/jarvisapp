document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.tablinks').click(); // Automatically click the first tab
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populateVoiceList;
    }
});

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    if (tabName === 'ObjectDetection') {
        initializeCamera();
    }
}

function initializeCamera() {
    const video = document.getElementById('webcam');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                video.srcObject = stream;
            })
            .catch(function(error) {
                console.error('Error accessing the webcam:', error);
            });
    }
}

document.getElementById('action-button').addEventListener('click', function() {
    const userInputField = document.getElementById('user-input');
    const userText = userInputField.value.trim().toLowerCase();
    userInputField.value = ''; // Clear the input field right after the button is pressed

    if (userText === "what do you see" || userText === "analyze the current view" || userText === "describe what's in front of you") {
        captureAndAnalyzeImage(); // Handle vision-related commands
    } else {
        processUserInput(userText); // Handle other general commands or chat inputs
    }
});

document.getElementById('uploadForm').addEventListener('submit', function (e) {
    e.preventDefault();
    
    const formData = new FormData();
    const imageFile = document.getElementById('imageUpload').files[0];
    formData.append('image', imageFile);

    fetch('/analyze_image', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            displayObjects(data.objects);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

document.getElementById('analyze-live-button').addEventListener('click', function() {
    captureAndAnalyzeImage();
});

function captureAndAnalyzeImage() {
    const video = document.getElementById('webcam');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append('image', blob);
        fetch('/analyze_image', { method: 'POST', body: formData })
            .then(response => response.json())
            .then(data => {
                appendMessage('Jarvis', data.objects.join(', '));
            })
            .catch(error => {
                console.error('Error analyzing image:', error);
                appendMessage('Jarvis', 'Sorry, I encountered an error analyzing the image.');
            });
    });
}

function displayObjects(objects) {
    const objectsContainer = document.getElementById('objectsContainer');
    objectsContainer.innerHTML = '';
    objects.forEach(obj => {
        const objElement = document.createElement('div');
        objElement.textContent = obj;
        objectsContainer.appendChild(objElement);
    });
}

function appendMessage(sender, message) {
    const chatBox = document.getElementById('jarvis-box');
    const messageElement = document.createElement('div');
    messageElement.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    if (sender === 'jarvis') {
        speak(message);
    }
}

function speak(text) {
    var synth = window.speechSynthesis;
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectVoice();
    synth.speak(utterance);
}

function selectVoice() {
    var voices = window.speechSynthesis.getVoices();
    return voices.find(voice => voice.name === "Microsoft Ryan Online (Natural) - English (United Kingdom)") || voices[0];
}

document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('action-button').click();
    }
});

function processUserInput(userInput) {
    appendMessage('user', userInput);

    if (userInput.toLowerCase().includes('weather')) {
        const city = userInput.split(' ').slice(1).join(' ');
        getWeather(city);
    } else {
        sendToOpenAI(userInput);
    }
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
        if (data.message) {
            appendMessage('jarvis', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function startSpeechRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('user-input').value = transcript; // Display recognized speech in input field
        processUserInput(transcript);
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
    };
}

document.getElementById('start-speech-recognition').addEventListener('click', startSpeechRecognition);
// ENTER key triggers Send
document.getElementById("user-input").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        document.getElementById("action-button").click();
    }
});

// Rebind speech recognition if broken
document.getElementById("start-speech-recognition").addEventListener("click", () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Speech recognition not supported in this browser.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = function (event) {
        const result = event.results[0][0].transcript;
        document.getElementById("user-input").value = result;
        document.getElementById("action-button").click();
    };

    recognition.onerror = function (event) {
        console.error("Speech recognition error:", event.error);
    };
});
