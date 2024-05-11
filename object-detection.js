async function loadAndPredict() {
    const img = new Image();
    img.src = 'path/to/sample.jpg'; // Make sure the image loads correctly
    img.onload = async () => {
        const net = await cocoSsd.load();
        const result = await net.detect(img);
        console.log(result);
    };
}
