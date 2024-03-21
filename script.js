let isMuted = false;
const synth = window.speechSynthesis;

function populateVoiceList() {
    const voiceSelect = document.getElementById('voice-selection');
    voiceSelect.innerHTML = '';
    voices.forEach(voice => {
        const option = document.createElement('option');
        option.textContent = voice.name + (voice.default ? ' (default)' : '');
        option.setAttribute('data-lang', voice.lang);
        option.setAttribute('data-name', voice.name);
        voiceSelect.appendChild(option);
    });
}

function appendMessage(sender, message) {
    const chatBox = document.getElementById('jarvis-box');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    messageElement.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function speak(text) {
    if (isMuted) return;
    let utterance = new SpeechSynthesisUtterance(text);
    const selectedVoiceName = document.getElementById('voice-selection').selectedOptions[0].getAttribute('data-name');
    utterance.voice = synth.getVoices().find(voice => voice.name === selectedVoiceName);
    synth.speak(utterance);
}

function processUserInput(userInput) {
    appendMessage('user', userInput);
    if (userInput.trim().toLowerCase() === 'show object detection') {
        window.location.href = '/object-detection.html'; // Assuming this is the correct path
    } else if (userInput.trim().toLowerCase().startsWith('generate image:')) {
        const prompt = userInput.trim().substring('generate image:'.length).trim();
        generateImageWithDalle(prompt);
    } else {
        sendToOpenAI(userInput);
    }
}

function sendToOpenAI(userInput) {
    // Implementation remains the same
}

function startSpeechRecognition() {
    // Implementation remains the same
}

document.addEventListener('DOMContentLoaded', function() {
    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }
    document.getElementById('action-button').addEventListener('click', function() {
        const userInput = document.getElementById('user-input').value;
        processUserInput(userInput);
        document.getElementById('user-input').value = ''; // Clear the input field
    });
    document.getElementById('user-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('action-button').click();
        }
    });
});

function generateImageWithDalle(prompt) {
    console.log('Generating image with DALL·E for prompt:', prompt);
    // Fetch call to your Flask backend to generate an image with DALL·E
    fetch('/generate_image', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({prompt: prompt})
    })
    .then(response => response.json())
    .then(data => {
        if (data.image_url) {
            const imgElement = document.getElementById('generated-image');
            if (imgElement) {
                imgElement.src = data.image_url;
                imgElement.style.display = 'block';
            }
        } else {
            console.error('Failed to generate image:', data.error);
        }
    })
    .catch(error => {
        console.error('Error generating image:', error);
    });
}
