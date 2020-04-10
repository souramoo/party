import Peer from 'peerjs';

const Constants = require('../shared/constants');

let peer = null;
let clientId = null;
let myStream = null;
let inCall = [];

function setupRemoteStream(call, id) {
  if (!call) {
    peerHangUp(id, true);
    console.log(`Unable to call ${id}`);
    return;
  }
  call.on('stream', remoteStream => {
    // `stream` is the MediaStream of the remote peer.
    // Here you'd add it to an HTML video/canvas element.
    if (!document.getElementById(call.peer)) {
      const video = document.createElement('video');
      console.log(remoteStream);
      video.srcObject = remoteStream;
      video.id = call.peer;
      video.autoplay = true;
      video.playsinline = true;
      video.className = 'mirrored';
      const vidContainer = document.getElementById('videos-container');
      vidContainer.insertBefore(video, vidContainer.firstChild);

      // layout of videos
      fixVideoLayouts();
    }
  });
  call.on('close', () => {
    peerHangUp(call.peer);
  });
  call.on('error', () => {
    peerHangUp(call.peer);
  });
}

function fixVideoLayouts() {
  const othervideos = document.querySelectorAll('.mirrored');
  const myvideo = document.querySelectorAll('#videos-container #webcamHolder #webcamVideo');
  if (othervideos.length === 0) {
    myvideo[0].style.minWidth = '100%';
    myvideo[0].style.maxHeight = '60%';
  }
  if (othervideos.length === 1) { // one video full screen
    othervideos.forEach(el => {
      // eslint-disable-next-line no-param-reassign
      el.style.minWidth = '100%';
      // eslint-disable-next-line no-param-reassign
      el.style.maxHeight = '60%';
    });
    myvideo[0].style.minWidth = '50%';
    myvideo[0].style.maxHeight = '20%';
    document.getElementById('emojiHolder').style.width = '50%';
  } else { // two videos side by side
    const nearestSq = Math.round(Math.sqrt(othervideos.length + 1));
    othervideos.forEach(el => {
      // eslint-disable-next-line no-param-reassign
      el.style.minWidth = `${100 / nearestSq}%`;
      // eslint-disable-next-line no-param-reassign
      el.style.maxHeight = `${80 / nearestSq}%`;
    });
    myvideo[0].style.minWidth = `${100 / nearestSq}%`;
    myvideo[0].style.maxHeight = `${80 / nearestSq}%`;
    document.getElementById('emojiHolder').style.width = `${100 / nearestSq}%`;
  }
}

export function initMyStream(myId, ownStream) {
  clientId = myId;
  myStream = ownStream;
  peer = new Peer(`pb-${myId}`, {
    config: { iceServers: Constants.ICE_SERVERS },
  });
  peer.on('call', call => {
    call.answer(myStream);
    if (!inCall.includes(call.peer)) {
      inCall.push(call.peer);
    }
    setupRemoteStream(call, call.peer);
  });
  fixVideoLayouts();
}

export function peerCall(peerId) {
  const rtcPeerId = `pb-${peerId}`;
  if (!inCall.includes(rtcPeerId)) { // not already in a call
    if (clientId < peerId) { // break the deadlock on who should call
      inCall.push(rtcPeerId);
      setupRemoteStream(peer.call(rtcPeerId, myStream), rtcPeerId);
    }
  }
}

export function peerHangUp(peerId, dontAddPb) {
  const rtcPeerId = (dontAddPb ? peerId : `pb-${peerId}`);
  if (inCall.includes(rtcPeerId)) {
    // no longer in a call
    inCall = inCall.filter(item => item !== rtcPeerId);
    // close the stream and remove video
    const videoEl = document.getElementById(rtcPeerId);
    if (videoEl) {
      videoEl.remove();
    }
  }
}

export function hangUpIfNot(availIds) {
  // console.log(availIds)
  inCall.filter(el => (availIds.indexOf(el) < 0)).forEach(i => { peerHangUp(i, true); });
  // console.log(inCall)
}
