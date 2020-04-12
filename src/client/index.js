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
const roomIdInput = document.getElementById('room-id');

function initRoomCodeEntry() {
  if (window.location.hash) {
    roomIdInput.value = window.location.hash;
    roomIdInput.disabled = false;
    document.getElementById('radio-two').checked = true;
  }

  document.getElementById('radio-one').onclick = () => {
    roomIdInput.value = '#public';
    roomIdInput.disabled = true;
  };

  document.getElementById('radio-two').onclick = () => {
    roomIdInput.value = (window.location.hash ? window.location.hash : '#public');
    roomIdInput.disabled = false;
  };


  document.getElementById('radio-three').onclick = () => {
    const r = `#${Math.random().toString(36).substring(2, 7)}`;
    roomIdInput.value = r;
    roomIdInput.disabled = false;
    if (window.history.pushState) {
      window.history.pushState(null, null, r);
    } else {
      window.location.hash = r;
    }
  };
  roomIdInput.onkeyup = () => {
    let roomid = roomIdInput.value;
    if (!roomid.startsWith('#')) {
      roomid = `#${roomid}`;
      roomIdInput.value = roomid;
    }

    if (window.history.pushState) {
      window.history.pushState(null, null, roomid);
    } else {
      window.location.hash = roomid;
    }
  };
}

function fixStyleForGame() {
  document.getElementById('game-canvas').style.display = 'block';
  document.getElementById('chatheads').style.display = 'block';
  document.body.style.backgroundColor = 'white';
  document.body.style.overflow = 'hidden';
  document.body.style.overscrollBehavior = 'none';
}

Promise.all([
  connect(onGameOver),
  downloadAssets(),
]).then(() => {
  playMenu.classList.remove('hidden');
  initWebcam(webcamInput, webcamCanvas);
  initRoomCodeEntry();
  playButton.onclick = () => {
    // Play!
    fixStyleForGame();
    setWebcamState(1);
    play(getMyFace(), roomIdInput.value);
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
