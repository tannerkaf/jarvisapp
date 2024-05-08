document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page by opening the first tab
    document.querySelector('.tablinks').click();

    // Set up the send button to process user input when clicked
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

// Function to process user input
function processUserInput(userInput) {
    console.log("Processing user input: ", userInput); // Output user input to console for debugging
    appendMessage('user', userInput); // Display user input in the chatbox

    // Simulate sending data to a server and getting a response
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
            appendMessage('Jarvis', data.message);  // Display the response from the server
        } else if (data.error) {
            appendMessage('Jarvis', 'Error: ' + data.error);  // Display any errors that were received
        }
    })
    .catch(error => {
        console.error('Error:', error);
        appendMessage('Jarvis', 'Sorry, there was an error processing your request.');  // Inform the user there was an error
    });
}

// Function to append messages to the chatbox
function appendMessage(sender, message) {
    const chatBox = document.getElementById('jarvis-box');
    const messageElement = document.createElement('div');
    messageElement.textContent = `${sender === 'user' ? 'You' : sender}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;  // Automatically scroll to the newest message
}
