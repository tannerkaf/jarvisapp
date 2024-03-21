let isMuted = false;
const synth = window.speechSynthesis;

document.addEventListener('DOMContentLoaded', () => {
  populateVoiceList();
  synth.onvoiceschanged = populateVoiceList;
});

function populateVoiceList() {
  const voices = synth.getVoices();
  const voiceSelect = document.getElementById('voice-selection');
  voiceSelect.innerHTML = '';

  voices.forEach(voice => {
    const option = document.createElement('option');
    option.textContent = `${voice.name} (${voice.lang})`;
    option.value = voice.name;
    voiceSelect.appendChild(option);
  });

  // Set the voice selection to the previously saved voice, if available
  const savedVoice = localStorage.getItem('selectedVoice');
  if(savedVoice) {
    voiceSelect.value = savedVoice;
  }
}

function appendMessage(sender, message) {
  const chatBox = document.getElementById('jarvis-box');
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender);
  messageElement.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${message}`;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function speak(text) {
  if (isMuted) return;
  const utterance = new SpeechSynthesisUtterance(text);
  const selectedVoiceName = document.getElementById('voice-selection').value;
  utterance.voice = synth.getVoices().find(voice => voice.name === selectedVoiceName);
  synth.speak(utterance);
}

function processUserInput(userInput) {
  appendMessage('user', userInput);
  if (userInput.toLowerCase().includes('weather')) {
    const city = userInput.split(' ').slice(1).join(' ');
    getWeather(city);
  } else {
    sendToOpenAI(userInput);
  }
}

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

function sendToOpenAI(userInput) {
  fetch('/get_response', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

document.getElementById('action-button').addEventListener('click', function() {
  const userInput = document.getElementById('user-input').value.trim();
  if (userInput) {
    processUserInput(userInput);
    document.getElementById('user-input').value = ''; // Clear the input after sending
  }
});

document.getElementById('voice-selection').addEventListener('change', function() {
  localStorage.setItem('selectedVoice', this.value); // Save the selected voice
});

// Speech recognition setup
const startSpeechRecognition = () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript;
    processUserInput(speechResult);
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
  };
};

document.getElementById('start-speech-recognition').addEventListener('click', startSpeechRecognition);
