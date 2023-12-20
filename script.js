const synth = window.speechSynthesis;
let userName = localStorage.getItem("jarvis-user-name") || "Guest";

document.getElementById('set-name').addEventListener('click', function() {
    userName = document.getElementById('user-name').value || "Guest";
    localStorage.setItem("jarvis-user-name", userName);
    alert(`Name set to ${userName}`);
});

document.getElementById('send-button').addEventListener('click', function() {
    processUserInput();
});

document.getElementById('speak-button').addEventListener('click', function() {
    let recognition = new webkitSpeechRecognition();
    recognition.onresult = function(event) {
        let speechInput = event.results[0][0].transcript;
        document.getElementById('user-input').value = speechInput;
        processUserInput();
    };
    recognition.start();
});

document.getElementById('clear-history').addEventListener('click', function() {
    localStorage.removeItem("jarvis-chat");
    document.getElementById('jarvis-box').innerHTML = '';
});

function processUserInput() {
    const userInput = document.getElementById('user-input').value.trim();
    if (!userInput) return;

    appendMessage('user', userInput);
    saveConversation(userInput, 'user');

    const response = generateResponse(userInput);
    if (response) {
        appendMessage('ai', response);
        saveConversation(response, 'ai');
        speak(response);
        showFeedbackButtons();
    }

    document.getElementById('user-input').value = ''; // Clear input field
}

function appendMessage(sender, message) {
    const jarvisBox = document.getElementById('jarvis-box');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
    const timestamp = new Date().toLocaleTimeString();
    messageDiv.innerHTML = `<strong>${sender === 'user' ? 'You' : 'Jarvis'}:</strong> ${message} <span class="timestamp">(${timestamp})</span>`;
    jarvisBox.appendChild(messageDiv);
}

function generateResponse(input) {
    input = input.toLowerCase();

    if (input.includes("hello") || input.includes("hi")) {
        return `Hello ${userName}! How can I assist you today?`;
    }

    if (input.includes("how") && input.includes("you")) {
        return `I'm just a program, so I'm always operating at optimal efficiency, ${userName}!`;
    }

    if (input.includes("weather")) {
        return `I'm not currently connected to weather services, ${userName}, but it's always a good idea to carry an umbrella!`;
    }

    if (input.includes("joke")) {
        const jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "Why did the scarecrow win an award? Because he was outstanding in his field!",
            "Why don't eggs tell jokes? They'd crack each other up."
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }

    if (input.includes("bye") || input.includes("goodbye")) {
        return `Goodbye ${userName}! Have a great day!`;
    }

    return `I'm not sure how to respond to that, ${userName}. Can you try asking something else?`;
}

function saveConversation(message, sender) {
    let conversation = JSON.parse(localStorage.getItem("jarvis-chat") || "[]");
    conversation.push({ message, sender, timestamp: new Date().toISOString() });
    localStorage.setItem("jarvis-chat", JSON.stringify(conversation));
}

function loadConversation() {
    let conversation = JSON.parse(localStorage.getItem("jarvis-chat") || "[]");
    conversation.forEach(msg => {
        appendMessage(msg.sender, msg.message);
    });
}

function speak(text) {
    if (synth.speaking) {
        console.error('SpeechSynthesis is already speaking.');
        return;
    }
    let utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
}

function showFeedbackButtons() {
    document.getElementById('feedback-buttons').style.display = 'block';
}

function provideFeedback(feedbackType) {
    console.log(`Feedback on last response: ${feedbackType}`);
    document.getElementById('feedback-buttons').style.display = 'none';
}

window.onload = loadConversation;
