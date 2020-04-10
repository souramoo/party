import * as faceapi from 'face-api.js';
import { emote } from './networking';

const Constants = require('../shared/constants');

let webcamState = 0;
let webcamElement = null;
let myFace = '';
let isFace = -1;
let prevEmote = null;
let stream = null;

export async function initWebcam(webcamEl, canvasEl) {
  webcamElement = webcamEl;
  stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  webcamElement.onloadedmetadata = () => {
    setWebcamState(0);
    onWebcamPlay(webcamEl, canvasEl);
  };
  const videoEl = webcamEl;
  videoEl.srcObject = stream;
  document.getElementById('play-button').innerHTML = 'Just show your face to start! :)';
  document.getElementById('webcamDisabled').innerHTML = '';

  var video_button = document.createElement("button");
video_button.innerHTML = '<i class="fas fa-video" aria-hidden="true"></i>';

video_button.onclick = function(){
  stream.getVideoTracks()[0].enabled = !(stream.getVideoTracks()[0].enabled);
  video_button.innerHTML = '<i class="fas fa-video'+(stream.getVideoTracks()[0].enabled ? '' : '-slash')+'" aria-hidden="true"></i>';
}

var audio_button = document.createElement("button");
audio_button.innerHTML = '<i class="fas fa-microphone" aria-hidden="true"></i>';

audio_button.onclick = function(){
  stream.getAudioTracks()[0].enabled = !(stream.getAudioTracks()[0].enabled);
  audio_button.innerHTML = '<i class="fas fa-microphone'+(stream.getAudioTracks()[0].enabled ? '' : '-slash')+'" aria-hidden="true"></i>';
}

document.getElementById("controls").appendChild(video_button);
document.getElementById("controls").appendChild(audio_button);

}

export function getStream() {
  return stream;
}

export function getMyFace() {
  return myFace;
}

export function setWebcamState(state) {
  webcamState = state;
  if (webcamState === 0) {
    document.getElementById('webcamLogin').appendChild(document.getElementById('webcamHolder'));
  } else if (state === 1) {
    document.getElementById('videos-container').appendChild(document.getElementById('webcamHolder'));
  }
}

export async function onWebcamPlay(videoEl, canvas) {
  let refreshRate = 600;
  if (webcamState === 0) {
    refreshRate = 0;
  }

  if (videoEl.paused || videoEl.ended) {
    return setTimeout(() => onWebcamPlay(videoEl, canvas), refreshRate);
  }

  const result = await faceapi.detectSingleFace(videoEl,
    new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.6 }))
    .withFaceLandmarks(true).withFaceExpressions();

  if (result) {
    clearTimeout(isFace);
    document.getElementById('play-button').disabled = false;
    document.getElementById('play-button').innerText = '👍 CLICK HERE TO START!';
    isFace = setTimeout(() => {
      isFace = false;
      document.getElementById('play-button').disabled = true;
      document.getElementById('play-button').innerText = 'Please show your face first :(';
    }, 1000);
    const dims = faceapi.matchDimensions(canvas, videoEl, true);
    const resized = faceapi.resizeResults(result.detection, dims);
    // faceapi.draw.drawDetections(canvas,);
    const box = {
      x: dims.width - (resized.box.x),
      y: resized.box.y,
      width: -resized.box.width,
      height: resized.box.height,
    };
    const drawOptions = {
      label: 'You',
      lineWidth: 2,
    };

    const currEmote = result.expressions.asSortedArray()[0].expression;

    // if we are to log in
    if (webcamState === 0) {
      // get the face found and save it for later
      const regionsToExtract = [
        new faceapi.Rect(resized.box.x - 50,
          resized.box.y - 50,
          resized.box.width + 100,
          resized.box.height + 100),
      ];
      const canvases = await faceapi.extractFaces(videoEl, regionsToExtract);
      myFace = canvases[0].toDataURL();

      // draw to indicate what we found
      const drawBox = new faceapi.draw.DrawBox(box, drawOptions);
      drawBox.draw(canvas);
    }
    document.getElementById('emojiHolder').innerHTML = Constants.EMOJIS[currEmote];
    if (prevEmote !== currEmote) {
      emote(currEmote);
    }
    prevEmote = currEmote;
  }

  return setTimeout(() => onWebcamPlay(videoEl, canvas), refreshRate);
}
