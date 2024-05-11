let useFrontCamera = true;

document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const flipCameraButton = document.getElementById('flip-camera');
    const toggleCameraButton = document.getElementById('toggle-camera');

    flipCameraButton.addEventListener('click', () => {
        video.classList.toggle('flipped');
    });

    toggleCameraButton.addEventListener('click', () => {
        useFrontCamera = !useFrontCamera;
        startWebcam();
    });

    startWebcam();

    function startWebcam() {
        navigator.mediaDevices.getUserMedia({
            video: { facingMode: useFrontCamera ? 'user' : 'environment' }
        }).then(stream => {
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                video.play();
                detectFrame();
            };
        }).catch(error => {
            console.error('Error accessing the camera:', error);
        });
    }

    function detectFrame() {
        cocoSsd.load().then(model => {
            model.detect(video).then(predictions => {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                predictions.forEach(prediction => {
                    context.strokeStyle = '#00FFFF';
                    context.lineWidth = 4;
                    context.strokeRect(...prediction.bbox);
                    context.fillStyle = '#00FFFF';
                    context.fillText(prediction.class, prediction.bbox[0], prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10);
                });
                requestAnimationFrame(detectFrame);
            });
        }).catch(error => {
            console.error("Failed to load the model:", error);
        });
    }
});
