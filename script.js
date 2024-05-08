// Function to open a specific tab and manage active tab state
function openTab(evt, tabName) {
    var tabcontent = document.getElementsByClassName("tabcontent");
    var tablinks = document.getElementsByClassName("tablinks");

    // Hide all tab contents
    for (let content of tabcontent) {
        content.style.display = "none";
    }

    // Remove "active" class from all tablinks
    for (let link of tablinks) {
        link.className = link.className.replace(" active", "");
    }

    // Show the current tab and add "active" class to the button that opened the tab
    document.getElementById(tabName). style.display = "block";
    evt.currentTarget.className += " active";

    // Ensure graph animation only starts when the Graphs tab is selected
    if (tabName === 'Graphs') {
        startGraphAnimation();
    }
}

// Initialize and animate graphs
function startGraphAnimation() {
    const canvas = document.getElementById('graphCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let time = 0;
        
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);
            
            for (let i = 0; i < canvas.width; i++) {
                ctx.lineTo(i, canvas.height / 2 + 50 * Math.sin((i + time) * 0.05));
            }

            ctx.strokeStyle = '#32CD32';
            ctx.lineWidth = 2;
            ctx.stroke();
            time += 1;
            
            requestAnimationFrame(draw);
        }

        draw();
    }
}

// Function to append message to chatbox
function appendMessage(sender, message) {
    const chatBox = document.getElementById('jarvis-box');
    const messageElement = document.createElement('div');
    messageElement.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest message
}

// Process user input
function processUserInput(userInput) {
    appendMessage('user', userInput);
    console.log("User input:", userInput); // Log to console for now
    // Here you can add your code to handle the user input, such as sending it to a server
    // For demo purposes, let's simulate a Jarvis response
    appendMessage('Jarvis', 'Received: ' + userInput);
}

document.addEventListener('DOMContentLoaded', function() {
    // Set default open tab and attach event listeners to tab buttons
    document.querySelector('.tablinks').click();

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
