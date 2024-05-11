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

    if (tabName === 'ObjectDetection') {
        initializeObjectDetection();
    }
}

async function initializeObjectDetection() {
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
}

document.getElementById('action-button').addEventListener('click', function() {
    console.log('Send button clicked');
    // Add your sending logic here
});

document.getElementById('start-speech-recognition').addEventListener('click', function() {
    console.log('Speech recognition started');
    // Add your speech recognition logic here
});
