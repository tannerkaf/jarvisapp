document.addEventListener('DOMContentLoaded', async function() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    async function setupCamera() {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                resolve(video);
            };
        });
    }

    async function loadModel() {
        const net = await cocoSsd.load();
        console.log('COCO-SSD model loaded.');
        return net;
    }

    async function detectFrame(net) {
        const predictions = await net.detect(video);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        predictions.forEach(prediction => {
            context.strokeStyle = 'red';
            context.lineWidth = 4;
            context.strokeRect(...prediction.bbox);
            context.fillStyle = 'red';
            context.fillText(`${prediction.class} (${Math.round(prediction.score * 100)}%)`, prediction.bbox[0], prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10);
        });
        requestAnimationFrame(() => detectFrame(net));
    }

    const videoReady = await setupCamera();
    video.play();
    const model = await loadModel();
    detectFrame(model);
});
