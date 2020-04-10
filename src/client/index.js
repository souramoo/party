import { connect, play, getClientId } from './networking';
import { startRendering, stopRendering } from './render';
import { startCapturingInput, stopCapturingInput } from './input';
import { downloadAssets } from './assets';
import { initState } from './state';
import { setLeaderboardHidden } from './leaderboard';
import { initWebcam, setWebcamState, getMyFace, getStream } from './webcam';
import { initMyStream } from './webrtc';

// I'm using Bootstrap here for convenience, but I wouldn't recommend actually doing this for a real
// site. It's heavy and will slow down your site - either only use a subset of Bootstrap, or just
// write your own CSS.
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/main.css';

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
    setWebcamState(1);
    play(getMyFace());
    playMenu.classList.add('hidden');
    initState();
    setTimeout(startCapturingInput, 100);
    initMyStream(getClientId(), getStream());
    // startCapturingInput();
    startRendering();
    setLeaderboardHidden(true);
  };
}).catch(console.error);

function onGameOver() {
  stopCapturingInput();
  stopRendering();
  playMenu.classList.remove('hidden');
  setLeaderboardHidden(true);
  setWebcamState(0);
}
