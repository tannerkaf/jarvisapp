let useFrontCamera = true;
let detectionActive = true;
let model = null;

document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById("webcam");
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    const flipBtn = document.getElementById("flip-camera");
    const toggleBtn = document.getElementById("toggle-camera");
    const toggleDetectionBtn = document.getElementById("toggle-detection");
    const saveBtn = document.getElementById("save-snapshot");
    const uploadInput = document.getElementById("image-upload");
    const uploadCanvas = document.getElementById("upload-canvas");
    const uploadCtx = uploadCanvas.getContext("2d");

    flipBtn.addEventListener("click", () => {
        video.classList.toggle("flipped");
    });

    toggleBtn.addEventListener("click", () => {
        useFrontCamera = !useFrontCamera;
        startWebcam();
    });

    toggleDetectionBtn.addEventListener("click", () => {
        detectionActive = !detectionActive;
    });

    saveBtn.addEventListener("click", () => {
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = "snapshot.png";
        link.click();
    });

    uploadInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const img = new Image();
        img.onload = async () => {
            uploadCanvas.width = img.width;
            uploadCanvas.height = img.height;
            uploadCtx.drawImage(img, 0, 0);

            const predictions = await model.detect(uploadCanvas);
            drawDetections(uploadCtx, predictions);
            uploadCanvas.style.display = "block";
        };
        img.src = URL.createObjectURL(file);
    });

    async function startWebcam() {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: useFrontCamera ? "user" : "environment" }
        });
        video.srcObject = stream;

        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            video.play();
            detectFrame();
        };
    }

    function detectFrame() {
        if (!detectionActive || !model) {
            requestAnimationFrame(detectFrame);
            return;
        }

        model.detect(video).then(predictions => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            drawDetections(context, predictions);
            requestAnimationFrame(detectFrame);
        });
    }

    function drawDetections(ctx, predictions) {
        predictions.forEach(pred => {
            ctx.strokeStyle = "#00FFFF";
            ctx.lineWidth = 3;
            ctx.strokeRect(...pred.bbox);
            ctx.font = "16px Orbitron";
            ctx.fillStyle = "#00FFFF";
            ctx.fillText(pred.class, pred.bbox[0], pred.bbox[1] > 10 ? pred.bbox[1] - 5 : 10);
        });
    }

    cocoSsd.load().then(loadedModel => {
        model = loadedModel;
        startWebcam();
    });
});
