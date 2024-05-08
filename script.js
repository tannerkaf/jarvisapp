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

function startGraphAnimation() {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    let xPos = 0;

    function draw() {
        if (xPos > canvas.width) {
            xPos = 0;
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas for new drawing
        }
        ctx.fillStyle = 'rgba(0, 51, 0, 0.4)'; // Semi-transparent overlay to create a fading effect
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(xPos, canvas.height / 2);
        ctx.lineTo(xPos + 10, canvas.height / 2 + Math.random() * 100 - 50);
        ctx.strokeStyle = '#32CD32';
        ctx.lineWidth = 2;
        ctx.stroke();
        xPos += 10;
        requestAnimationFrame(draw); // Call draw again for the next frame
    }
    draw();
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.tablinks').click(); // Automatically open the first tab
    startGraphAnimation(); // Start the graph animation when the page loads
});
