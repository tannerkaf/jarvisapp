document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.tablinks').click(); // Automatically click the first tab
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populateVoiceList;
    }
});

let latestDetections = []; // Store the latest detection results

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

async function initializeCamera() {
    const video = document.getElementById('webcam');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        await initializeObjectDetection();
    }
}

async function initializeObjectDetection() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const net = await cocoSsd.load();
    console.log('COCO-SSD model loaded.');

    const detectFrame = async () => {
        const predictions = await net.detect(video);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        predictions.forEach(prediction => {
            context.strokeStyle = 'red';
            context.lineWidth = 4;
            context.strokeRect(...prediction.bbox);
            context.fillStyle = 'red';
            context.fillText(`${prediction.class} (${Math.round(prediction.score * 100)}%)`, prediction.bbox[0], prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10);
        });
        latestDetections = predictions.map(p => p.class); // Store latest detections
        requestAnimationFrame(detectFrame);
    };

    detectFrame();
}

function describeScene() {
    if (latestDetections.length === 0) {
        return "I don't see anything notable right now.";
    }
    return "I see " + latestDetections.join(", ") + ".";
}

document.getElementById('action-button').addEventListener('click', function() {
    const userInputField = document.getElementById('user-input');
    const userText = userInputField.value.trim().toLowerCase();
    if (userText === "what do you see" || userText === "what are you looking at") {
        const description = describeScene();
        appendMessage('jarvis', description);
    } else {
        processUserInput(userText);
    }
    userInputField.value = ''; // Clear the input field right after the button is pressed
});
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.tablinks').click(); // Automatically click the first tab
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populateVoiceList;
    }
});

let latestDetections = []; // Store the latest detection results

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

async function initializeCamera() {
    const video = document.getElementById('webcam');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        await initializeObjectDetection();
    }
}

async function initializeObjectDetection() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const net = await cocoSsd.load();
    console.log('COCO-SSD model loaded.');

    const detectFrame = async () => {
        const predictions = await net.detect(video);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        predictions.forEach(prediction => {
            context.strokeStyle = 'red';
            context.lineWidth = 4;
            context.strokeRect(...prediction.bbox);
            context.fillStyle = 'red';
            context.fillText(`${prediction.class} (${Math.round(prediction.score * 100)}%)`, prediction.bbox[0], prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10);
        });
        latestDetections = predictions.map(p => p.class); // Store latest detections
        requestAnimationFrame(detectFrame);
    };

    detectFrame();
}

function describeScene() {
    if (latestDetections.length === 0) {
        return "I don't see anything notable right now.";
    }
    return "I see " + latestDetections.join(", ") + ".";
}

document.getElementById('action-button').addEventListener('click', function() {
    const userInputField = document.getElementById('user-input');
    const userText = userInputField.value.trim().toLowerCase();
    userInputField.value = ''; // Clear the input field right after the button is pressed
    if (userText === "what do you see" || userText === "what are you looking at") {
        const description = describeScene();
        appendMessage('jarvis', description);
    } else {
        processUserInput(userText);
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
        appendMessage('jarvis', "Sorry, there was an error processing your request.");
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
