document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    let currentStream = null;
    let useFrontCamera = true;

    function startWebcam() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => {
                track.stop();
            });
        }

        navigator.mediaDevices.getUserMedia({
            video: { facingMode: useFrontCamera ? 'user' : 'environment' }
        }).then(stream => {
            currentStream = stream;
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                adjustVideoCanvasSize();
                detectObjects();
            };
        }).catch(error => {
            console.error('Error accessing the camera:', error);
        });
    }

    function adjustVideoCanvasSize() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    }

    function detectObjects() {
        cocoSsd.load().then(model => {
            const onFrame = () => {
                model.detect(video).then(predictions => {
                    renderPredictions(predictions);
                    requestAnimationFrame(onFrame);
                });
            };
            onFrame();
        });
    }

    function renderPredictions(predictions) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        predictions.forEach(prediction => {
            context.strokeStyle = '#00FFFF';
            context.lineWidth = 4;
            context.strokeRect(...prediction.bbox);
            context.fillStyle = '#00FFFF';
            context.fillText(`${prediction.class}: ${Math.round(prediction.score * 100)}%`, prediction.bbox[0], prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 15);
        });
    }

    document.getElementById('toggle-camera').addEventListener('click', () => {
        useFrontCamera = !useFrontCamera;
        startWebcam();
    });

    startWebcam();
});
