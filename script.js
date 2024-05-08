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
    document.getElementById(tabName).style.display = "block";
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
        let xPos = 0;
        let yPos = canvas.height / 2;

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(0, 51, 0, 0.4)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.moveTo(xPos, yPos);
            
            // Increment or decrement y position slightly for variation
            yPos += Math.random() * 20 - 10;
            xPos += 20; // Slower x increment

            ctx.lineTo(xPos, yPos);
            ctx.strokeStyle = '#32CD32';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Reset at the end of canvas
            if (xPos > canvas.width) {
                xPos = 0;
                yPos = canvas.height / 2;
            }

            requestAnimationFrame(draw);
        }

        draw();
    }
}

// Process user input
function processUserInput(userInput) {
    console.log("User input:", userInput); // Log to console for now
    // Here you should add your code to handle the user input, such as sending it to a server or processing it directly.
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
