// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#5-client-rendering
import kd from 'keydrown';
import { debounce } from 'throttle-debounce';
import { getCurrentState } from './state';
import { getAsset } from './assets';
import { peerCall, peerHangUp, hangUpIfNot } from './webrtc';

const Constants = require('../shared/constants');

const { PLAYER_RADIUS, MAP_SIZE } = Constants;

let currentRenderState = 0;
const profileImgs = {};

// Get the canvas graphics context
const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d', { alpha: false });
setCanvasDimensions();

function setCanvasDimensions() {
  // On small screens (e.g. phones), we want to "zoom out" so players can still see at least
  // 800 in-game units of width.
  const scaleRatio = Math.max(1, 800 / window.innerWidth);
  canvas.width = scaleRatio * window.innerWidth / 2;
  canvas.height = scaleRatio * window.innerHeight;
}

window.addEventListener('resize', debounce(40, setCanvasDimensions));

function render() {
  const { me, others } = getCurrentState();
  if (!me) {
    return;
  }
  kd.tick();

  // Draw background
  renderBackground(me.x, me.y);

  // Draw boundaries
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.strokeRect(canvas.width / 2 - me.x, canvas.height / 2 - me.y, MAP_SIZE, MAP_SIZE);
  context.drawImage(
    getAsset('dolores.png'),
    canvas.width / 2 - me.x,
    canvas.height / 2 - me.y,
    MAP_SIZE,
    MAP_SIZE,
  );

  // Draw all players
  renderPlayer(me, me);
  others.forEach(renderPlayer.bind(null, me));
}

function renderBackground(x, y) {
  const backgroundX = MAP_SIZE / 2 - x + canvas.width / 2;
  const backgroundY = MAP_SIZE / 2 - y + canvas.height / 2;
  const backgroundGradient = context.createRadialGradient(
    backgroundX,
    backgroundY,
    MAP_SIZE / 10,
    backgroundX,
    backgroundY,
    MAP_SIZE / 2,
  );
  backgroundGradient.addColorStop(0, 'black');
  backgroundGradient.addColorStop(1, 'gray');
  context.fillStyle = backgroundGradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

// Renders a ship at the given coordinates
function renderPlayer(me, player) {
  const { id, x, y, direction, emote } = player;
  const canvasX = canvas.width / 2 + x - me.x;
  const canvasY = canvas.height / 2 + y - me.y;

  // Load the user photo (from cache if possible)
  let photo = null;
  if (!(id in profileImgs)) {
    photo = new Image();
    photo.src = `/photo/${id}`;
    profileImgs[id] = photo;
  } else {
    photo = profileImgs[id];
  }

  // Draw person
  context.save();
  context.translate(canvasX, canvasY);

  context.rotate(direction);

  if (photo.complete) {
    context.beginPath();
    context.arc(0, 0, PLAYER_RADIUS, 0, 6.28, false);
    context.closePath();
    context.clip();

    context.drawImage(
      photo,
      -PLAYER_RADIUS,
      -PLAYER_RADIUS,
      PLAYER_RADIUS * 2,
      PLAYER_RADIUS * 2,
    );
    context.arc(0, 0, PLAYER_RADIUS - 2, 0, 6.28, false);
    context.lineWidth = 5;
    context.stroke();
  }
  context.restore();
  context.save();


  context.translate(canvasX, canvasY);
  context.font = '50px serif';
  context.fillText(Constants.EMOJIS[emote], PLAYER_RADIUS / 2, PLAYER_RADIUS);
  context.restore();
}

function renderMainMenu() {
  if (currentRenderState === 0) {
    const t = Date.now() / 7500;
    const x = MAP_SIZE / 2 + 800 * Math.cos(t);
    const y = MAP_SIZE / 2 + 800 * Math.sin(t);
    renderBackground(x, y);
    window.requestAnimationFrame(renderMainMenu);
  }
}

function draw() {
  window.requestAnimationFrame(draw);

  if (currentRenderState === 0) {
    renderMainMenu();
  } else if (currentRenderState === 1) {
    render();
  }
}

function logicThread() {
  if (currentRenderState === 1) {
    // handle logic processing separate from canvas draw
    const { me, others } = getCurrentState();

    if (me) {
      others.forEach(videoCallLogic.bind(null, me));
      hangUpIfNot(others.map(a => `pb-${a.id}`));
    }

    setTimeout(logicThread, 500);
  }
}

function videoCallLogic(me, other) {
  const { id, x, y } = other;
  const distance = Math.sqrt(((me.x - x) ** 2) + ((me.y - y) ** 2));
  if (distance < Constants.CALL_DISTANCE) {
    peerCall(id);
  } else {
    peerHangUp(id);
  }
}

export function startRendering() {
  currentRenderState = 1;
  window.requestAnimationFrame(draw);
  setTimeout(logicThread);
}

export function stopRendering() {
  currentRenderState = 0;
}
