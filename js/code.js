    
function onCvLoaded () {
    console.log('cv', cv);
    cv.onRuntimeInitialized = onReady;
}
const video = document.getElementById('video');
const actionBtn = document.getElementById('actionBtn');
const canv = document.getElementById('canvasOutput');
// const width = 300;
// const height = 225;
const width = video.width;
const height = video.height;
const FPS = 30;
let stream;
let streaming = false;
function onReady () {
    let src;
    let dst;
    const cap = new cv.VideoCapture(video);

    actionBtn.addEventListener('click', () => {
        if (streaming) {
            stop();
            actionBtn.textContent = 'Start';
        } else {
            start();
            actionBtn.textContent = 'Stop';
        }
    });

    function start () {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(_stream => {
            let src;
            let dst;
            stream = _stream;
            console.log('stream', stream);
            video.srcObject = stream;
            video.play();
            streaming = true;
            src = new cv.Mat(height, width, cv.CV_8UC4);
            dst = new cv.Mat(height, width, cv.CV_8UC1);
            setTimeout(processVideo, 0)
        })
        .catch(err => console.log(`An error occurred: ${err}`));
    }

    function stop () {
        if (video) {
            video.pause();
            video.srcObject = null;
        }
        if (stream) {
            stream.getVideoTracks()[0].stop();
        }
        streaming = false;
        delete src;
        delete dst;
    }

    function processVideo () {
        if (!streaming) {
            src.delete();
            dst.delete();
            return;
        }
        const begin = Date.now();
        cap.read(src)
        cv.cvtColor(src, dst, cv.COLOR_BGR2HSV);
        let low = new cv.Mat(src.rows, src.cols, src.type(), [30, 50, 0, 0]);
        let high = new cv.Mat(src.rows, src.cols, src.type(), [80, 255, 255, 255]);
        // let lowerGreen = new cv.Mat(1, 3, cv.CV_8U, [40, 40, 40]);
        // let upperGreen = new cv.Mat(1, 3, cv.CV_8U, [80, 255, 255]);
        cv.inRange(src, low, high, dst);
        cv.imshow('canvasOutput', dst);
        const delay = 1000/FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
    }
}