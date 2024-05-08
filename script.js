// Function to append message to chatbox
function appendMessage(sender, message) {
    const chatBox = document.getElementById('jarvis-box');
    const messageElement = document.createElement('div');
    messageElement.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest message
}

// Process user input and send it to the Flask backend
function processUserInput(userInput) {
    appendMessage('user', userInput);

    // Sending data to Flask backend
    fetch('/get_response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_input: userInput })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            appendMessage('Jarvis', data.message);
        } else if (data.error) {
            appendMessage('Jarvis', data.error);  // Handle any errors that the Flask app sends back
        }
    })
    .catch(error => {
        console.error('Error:', error);
        appendMessage('Jarvis', 'Sorry, there was an error processing your request.');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.tablinks').click(); // Open the first tab by default

    const sendButton = document.getElementById('action-button');
    sendButton.addEventListener('click', function() {
        const userInputField = document.getElementById('user-input');
        const userText = userInputField.value.trim();
        if (userText) {
            processUserInput(userText);
            userInputField.value = ''; // Clear input field after sending
        }
    });
});
