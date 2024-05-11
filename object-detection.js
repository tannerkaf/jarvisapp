document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    async function setupCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
        }
        const stream = await navigator.mediaDevices.getUserMedia({
            'audio': false,
            'video': {
                facingMode: 'user',
                width: 640,
                height: 480
            },
        });
        video.srcObject = stream;

        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                resolve(video);
            };
        });
    }

    async function loadAndPredict() {
        const net = await cocoSsd.load();
        console.log('COCO-SSD model loaded.');

        video.addEventListener('loadeddata', async () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            while (true) {
                const result = await net.detect(video);
                
                context.clearRect(0, 0, canvas.width, canvas.height);
                result.forEach(prediction => {
                    context.beginPath();
                    context.rect(...prediction.bbox);
                    context.lineWidth = 1;
                    context.strokeStyle = 'green';
                    context.fillStyle = 'green';
                    context.stroke();
                    context.fillText(prediction.class + ': ' + (prediction.score * 100).toFixed(2) + '%', prediction.bbox[0], prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10);
                });
                await tf.nextFrame();
            }
        });
    }

    setupCamera().then(loadAndPredict).catch(e => {
        console.error(e);
        alert('Error loading the camera. Please check console for details.');
    });
});
