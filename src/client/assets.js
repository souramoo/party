import * as faceapi from 'face-api.js';

const ASSET_NAMES = [
  'dolores.png',
];

const assets = {};
const downloadPromise = Promise.all(ASSET_NAMES.map(downloadAsset), faceapi.nets.tinyFaceDetector.loadFromUri('/models'), faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'), faceapi.nets.faceExpressionNet.loadFromUri('/models'));

function downloadAsset(assetName) {
  return new Promise(resolve => {
    const asset = new Image();
    asset.onload = () => {
      console.log(`Downloaded ${assetName}`);
      assets[assetName] = asset;
      resolve();
    };
    asset.src = `/assets/${assetName}`;
  });
}

export const downloadAssets = () => downloadPromise;

export const getAsset = assetName => assets[assetName];
