import { connect, play, getClientId } from './networking';
import { startRendering, stopRendering } from './render';
import { startCapturingInput, stopCapturingInput } from './input';
import { downloadAssets } from './assets';
import { initState } from './state';
import { initWebcam, setWebcamState, getMyFace, getStream } from './webcam';
import { initMyStream } from './webrtc';

const playMenu = document.getElementById('play-menu');
const playButton = document.getElementById('play-button');
const webcamInput = document.getElementById('webcamVideo');
const webcamCanvas = document.getElementById('webcamOverlay');

Promise.all([
  connect(onGameOver),
  downloadAssets(),
]).then(() => {
  playMenu.classList.remove('hidden');
  initWebcam(webcamInput, webcamCanvas);
  playButton.onclick = () => {
    // Play!
    document.getElementById("game-canvas").style.display="block";
    document.getElementById("chatheads").style.display="block";
    document.body.style.backgroundColor="white";
    setWebcamState(1);
    play(getMyFace());
    playMenu.classList.add('hidden');
    initState();
    setTimeout(startCapturingInput, 100);
    initMyStream(getClientId(), getStream());
    startRendering();
  };
}).catch(console.error);

function onGameOver() {
  stopCapturingInput();
  stopRendering();
  playMenu.classList.remove('hidden');
  setWebcamState(0);
}
