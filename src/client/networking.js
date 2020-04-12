import io from 'socket.io-client';
import { throttle } from 'throttle-debounce';
import { processGameUpdate, processPlayerEntered, processPlayerLeft } from './state';
// import { getStream } from './webcam';

const Constants = require('../shared/constants');

let clientId = '';

const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
const socket = io(`${socketProtocol}://${window.location.host}`, { reconnection: false });

const connectedPromise = new Promise(resolve => {
  socket.on('connect', () => {
    console.log('Connected to server!');
    clientId = socket.id;
    resolve();
  });
});

export const getClientId = () => clientId;

export const connect = onGameOver => (
  connectedPromise.then(() => {
    // Register callbacks
    socket.on(Constants.MSG_TYPES.GAME_UPDATE, processGameUpdate);
    socket.on(Constants.MSG_TYPES.BRDCST_PLAYER_ENTERED, processPlayerEntered);
    socket.on(Constants.MSG_TYPES.BRDCST_PLAYER_LEFT, processPlayerLeft);
    socket.on(Constants.MSG_TYPES.GAME_OVER, onGameOver);
    socket.on('disconnect', () => {
      console.log('Disconnected from server.');
      /* getStream().getTracks().forEach(track => {
        track.stop();
      }); */
      document.getElementById('disconnect-modal').classList.remove('hidden');
      document.getElementById('reconnect-button').onclick = () => {
        window.location.reload();
      };
    });
  })
);

export const play = (username, room) => {
  socket.emit(Constants.MSG_TYPES.JOIN_GAME, { username, room });
};

export const emote = emotion => {
  socket.emit(Constants.MSG_TYPES.EMOTE, emotion);
};

export const updateDirection = throttle(20, (dir, dis) => {
  socket.emit(Constants.MSG_TYPES.INPUT, { dir, dis });
});
