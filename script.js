document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.tablinks').click(); // Automatically click the first tab
});

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function appendMessage(sender, message) {
    const chatBox = document.getElementById('jarvis-box');
    const messageElement = document.createElement('div');
    messageElement.textContent = `${sender === 'user' ? 'You' : 'Jarvis'}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById('action-button').addEventListener('click', function() {
    const userInputField = document.getElementById('user-input');
    const userText = userInputField.value.trim();
    userInputField.value = ''; // Clear the input field right after the button is pressed
    if (userText) {
        appendMessage('user', userText);
        fetch('/get_response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_input: userText })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            appendMessage('jarvis', data.message);
        })
        .catch(error => {
            console.error('Error:', error);
            appendMessage('jarvis', 'Sorry, there was an error processing your request.');
        });
    }
});

document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('action-button').click();
    }
});
