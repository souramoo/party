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

  if (window.location.hash) {
    // Fragment exists
    document.getElementById('room-id').value = window.location.hash;
    document.getElementById('room-id').disabled = false;
    document.getElementById('radio-two').checked = true;
  } else {
    // Fragment doesn't exist
  }

  document.getElementById('radio-one').onclick = () => {
    document.getElementById('room-id').value = '#public';
    document.getElementById('room-id').disabled = true;
  };

  document.getElementById('radio-two').onclick = () => {
    document.getElementById('room-id').value = (window.location.hash ? window.location.hash : '#public');
    document.getElementById('room-id').disabled = false;
  };


  document.getElementById('radio-three').onclick = () => {
    const r = `#${Math.random().toString(36).substring(2, 7)}`;
    document.getElementById('room-id').value = r;
    document.getElementById('room-id').disabled = false;
    if (history.pushState) {
      history.pushState(null, null, r);
    } else {
      location.hash = r;
    }
  };
  document.getElementById('room-id').onkeyup = () => {
    let roomid = document.getElementById('room-id').value;
    if (!roomid.startsWith('#')) {
      roomid = `#${roomid}`;
      document.getElementById('room-id').value = roomid;
    }

    if (history.pushState) {
      history.pushState(null, null, roomid);
    } else {
      location.hash = roomid;
    }
  };
  playButton.onclick = () => {
    // Play!
    document.getElementById('game-canvas').style.display = 'block';
    document.getElementById('chatheads').style.display = 'block';
    document.body.style.backgroundColor = 'white';
    document.body.style.overflow = 'hidden';
    setWebcamState(1);
    play(getMyFace(), document.getElementById('room-id').value);
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
