// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#6-client-input-%EF%B8%8F
import kd from 'keydrown';
import { updateDirection } from './networking';

let leftMouseButtonOnlyDown = false;

function setLeftButtonState(e) {
  leftMouseButtonOnlyDown = e.buttons === undefined ?
    e.which === 1 :
    // eslint-disable-next-line no-bitwise
    (e.buttons & 1) === 1;
}

function onMouseInput(e) {
  setLeftButtonState(e);
  if (leftMouseButtonOnlyDown && e.clientX < window.innerWidth / 2) {
    handleInput(e.clientX, e.clientY);
  }
}
function onClickInput(e) {
  if (e.clientX < window.innerWidth / 2) {
    handleInput(e.clientX, e.clientY);
  }
}

function onTouchInput(e) {
  const touch = e.touches[0];
  handleInput(touch.clientX, touch.clientY);
}

function handleInput(x, y) {
  const dir = Math.atan2(x - window.innerWidth / 4, window.innerHeight / 2 - y);
  const dis = Math.sqrt(((window.innerWidth / 4 - x) ** 2) + ((window.innerHeight / 2 - y) ** 2));

  updateDirection(dir, dis);
}

function onKeyInput() {
  const up = kd.UP.isDown();
  const down = kd.DOWN.isDown();
  const left = kd.LEFT.isDown();
  const right = kd.RIGHT.isDown();

  let sumAngles = (left ? 270 : 0) + (right ? 90 : 0) + (down ? 180 : 0);
  const numKeys = ((left ? 1 : 0) + (right ? 1 : 0) + (up ? 1 : 0) + (down ? 1 : 0));

  if (up && left) {
    sumAngles = 270 + 360;
  }

  const dir = sumAngles / numKeys / 180 * Math.PI;

  updateDirection(dir, 5);
}

export function startCapturingInput() {
  window.addEventListener('mousemove', onMouseInput);
  window.addEventListener('mousdown', onMouseInput);

  window.addEventListener('click', onClickInput);
  window.addEventListener('touchstart', onTouchInput);
  window.addEventListener('touchmove', onTouchInput);
  // window.addEventListener('keydown', onKeyInput);

  kd.UP.down(onKeyInput);
  kd.DOWN.down(onKeyInput);
  kd.LEFT.down(onKeyInput);
  kd.RIGHT.down(onKeyInput);
}

export function stopCapturingInput() {
  window.removeEventListener('mousemove', onMouseInput);
  window.removeEventListener('mousedown', onMouseInput);

  window.removeEventListener('click', onClickInput);
  window.removeEventListener('touchstart', onTouchInput);
  window.removeEventListener('touchmove', onTouchInput);


  kd.UP.unbindDown();
  kd.DOWN.unbindDown();
  kd.LEFT.unbindDown();
  kd.RIGHT.unbindDown();
  // window.removeEventListener('keydown', onKeyInput);
}
