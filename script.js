document.getElementById('action-button').addEventListener('click', function() {
    const userInputField = document.getElementById('user-input');
    const userText = userInputField.value.trim();
    if (userText) {
        processUserInput(userText);
        userInputField.value = ''; // Clear input field after sending
    }
});

function processUserInput(userInput) {
    const chatBox = document.getElementById('jarvis-box');
    const messageElement = document.createElement('div');
    messageElement.textContent = `You: ${userInput}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest message
    // Add simulated response from Jarvis
    setTimeout(() => {
        const responseElement = document.createElement('div');
        responseElement.textContent = `Jarvis: Processing '${userInput}'...`;
        chatBox.appendChild(responseElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 500);
}
