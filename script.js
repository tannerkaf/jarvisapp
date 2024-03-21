let isMuted = false;
const synth = window.speechSynthesis;

document.addEventListener('DOMContentLoaded', () => {
  populateVoiceList();
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = populateVoiceList;
  }
  document.getElementById('action-button').addEventListener('click', processInput);
  document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      processInput();
    }
  });
  document.getElementById('start-speech-recognition').addEventListener('click', startSpeechRecognition);
});

function populateVoiceList() {
  const voiceSelect = document.getElementById('voice-selection');
  voiceSelect.innerHTML = '';
  synth.getVoices().forEach((voice) => {
    const option = document.createElement('option');
    option.textContent = `${voice.name} (${voice.lang})`;
    option.value = voice.name;
    voiceSelect.appendChild(option);
  });
  voiceSelect.value = localStorage.getItem('selectedVoice') || synth.getVoices()[0].name;
}

function processInput() {
  const userInput = document.getElementById('user-input').value.trim();
  if (userInput) {
    appendMessage('You', userInput);
    if (userInput.toLowerCase().includes('weather')) {
      getWeather(userInput.split(' ').slice(1).join(' '));
    } else {
      askJarvis(userInput);
    }
    document.getElementById('user-input').value = ''; // Clear the input field
  }
}

function getWeather(city) {
  fetch(`/weather?city=${encodeURIComponent(city)}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        appendMessage('Jarvis', 'Sorry, I could not fetch the weather.');
      } else {
        const message = `The weather in ${data.city} is ${data.description} with a temperature of ${data.temperature}°C.`;
        appendMessage('Jarvis', message);
        speak(message);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      appendMessage('Jarvis', 'Sorry, there was an error processing your request.');
    });
}

function askJarvis(query) {
  fetch('/get_response', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_input: query })
  })
    .then((response) => response.json())
    .then((data) => {
      appendMessage('Jarvis', data.message);
      speak(data.message);
    })
    .catch((error) => {
      console.error('Error:', error);
      appendMessage('Jarvis', 'Sorry, there was an error processing your request.');
    });
}

function appendMessage(sender, text) {
  const chatBox = document.getElementById('jarvis-box');
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender.toLowerCase());
  messageDiv.textContent = `${sender}: ${text}`;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function speak(text) {
  if (!isMuted) {
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoiceName = localStorage.getItem('selectedVoice');
    utterance.voice = synth.getVoices().find((voice) => voice.name === selectedVoiceName);
    synth.speak(utterance);
  }
}

function startSpeechRecognition() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = function(event) {
    const speechResult = event.results[0][0].transcript;
    document.getElementById('user-input').value = speechResult;
    processInput();
  };

  recognition.onerror = function(event) {
    console.error('Speech recognition error:', event.error);
  };
}
