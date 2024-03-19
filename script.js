let isMuted = false;
const synth = window.speechSynthesis;

document.addEventListener('DOMContentLoaded', function() {
  populateVoiceList();
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = populateVoiceList;
  }
});

function populateVoiceList() {
  const voices = synth.getVoices();
  const voiceSelect = document.getElementById('voice-selection');
  voiceSelect.innerHTML = '';
  voices.forEach(voice => {
    const option = document.createElement('option');
    option.textContent = voice.name + ' (' + voice.lang + ')';
    if (voice.name === localStorage.getItem('selectedVoice')) {
      option.selected = true;
    }
    voiceSelect.appendChild(option);
  });
}

document.getElementById('voice-selection').addEventListener('change', function() {
  localStorage.setItem('selectedVoice', this.value);
});

function appendMessage(sender, message) {
  const chatBox = document.getElementById('jarvis-box');
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'jarvis-message');
  messageElement.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${message}`;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function speak(text) {
  if (isMuted) return;
  let utterance = new SpeechSynthesisUtterance(text);
  const selectedVoice = synth.getVoices().find(voice => voice.name === localStorage.getItem('selectedVoice'));
  if (selectedVoice) utterance.voice = selectedVoice;
  synth.speak(utterance);
}

function processUserInput(userInput) {
  appendMessage('user', userInput);
  if (userInput.toLowerCase().includes('weather')) {
    const city = userInput.split(' ').slice(2).join(' ');
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
    headers: {'Content-Type': 'application/json'},
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

function startSpeechRecognition() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();
  recognition.onresult = function(event) {
    const speechResult = event.results[0][0].transcript;
    processUserInput(speechResult);
  };
  recognition.onerror = function(event) {
    console.error('Speech recognition error:', event.error);
  };
}

document.getElementById('action-button').addEventListener('click', function() {
  const userInputField = document.getElementById('user-input');
  const userText = userInputField.value.trim();
  if (userText) {
    processUserInput(userText);
    userInputField.value = '';
  }
});

document.getElementById('user-input').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    document.getElementById('action-button').click();
  }
});

document.getElementById('start-speech-recognition').addEventListener('click', startSpeechRecognition);
