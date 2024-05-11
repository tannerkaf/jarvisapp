document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('webcam');

    function startWebcam() {
        navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.play();
        }).catch(error => {
            console.error('Error accessing the camera:', error);
        });
    }

    startWebcam();
});
