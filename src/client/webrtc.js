import Peer from 'peerjs';

let peer = null;
let clientId = null;
let myStream = null;
let inCall = [];

function setupRemoteStream(call) {
  call.on('stream', remoteStream => {
    // `stream` is the MediaStream of the remote peer.
    // Here you'd add it to an HTML video/canvas element.
    console.log("ANSWERED")
    if(!document.getElementById(call.peer)) {
    const video = document.createElement('video');
    console.log(remoteStream)
    video.srcObject = remoteStream;
    video.id = call.peer;
    video.autoplay = true;
    video.playsinline = true;
    video.className="mirrored";
    document.getElementById('videos-container').appendChild(video);
    }
  });
  call.on('close', () => {
    peerHangUp(call.peer);
  });
  call.on('error', err => {
    peerHangUp(call.peer);
  });
}

export function initMyStream(myId, ownStream) {
  clientId = myId;
  myStream = ownStream;
  peer = new Peer(`pb-${myId}`, {
    config: { iceServers: [
      { url: 'stun:stun.l.google.com:19302' },
      {
        url: 'turn:numb.viagenie.ca',
        credential: 'muazkh',
        username: 'webrtc@live.com',
      },
    ] },
  });
  peer.on('call', call => {
    call.answer(myStream);
    if (!inCall.includes(call.id)) {
      inCall.push(call.id);
    }
    inCall.push(call.peer);
    setupRemoteStream(call);
  });
}

export function peerCall(peerId) {
  const rtcPeerId = `pb-${peerId}`;
  if (!inCall.includes(rtcPeerId)) { // not already in a call
    if (clientId < peerId) { // break the deadlock on who should call
      inCall.push(rtcPeerId);
      setupRemoteStream(peer.call(rtcPeerId, myStream));
    }
  }
}

export function peerHangUp(peerId) {
  const rtcPeerId = `pb-${peerId}`;
  if (inCall.includes(rtcPeerId)) {
    // no longer in a call
    inCall = inCall.filter(item => item !== rtcPeerId);
    // close the stream and remove video
    let videoEl = document.getElementById(rtcPeerId)
    if (videoEl) {
        videoEl.remove();
    }
  }
}
