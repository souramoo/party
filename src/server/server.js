const fs = require('fs');
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const socketio = require('socket.io');

const Constants = require('../shared/constants');
const Game = require('./game');
const webpackConfig = require('../../webpack.dev.js');

// Setup an Express server
const app = express();

const publicdir = `${__dirname}/../../dist`;

app.use((req, res, next) => {
  if (req.path.indexOf('.') === -1) {
    const file = `${publicdir + req.path}.html`;
    fs.exists(file, exists => {
      if (exists) req.url += '.html';
      next();
    });
  } else next();
});
app.use(express.static('public'));

if (process.env.NODE_ENV === 'development') {
  // Setup Webpack for development
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler, { writeToDisk: true }));
} else {
  // Static serve the dist/ folder in production
  app.use(express.static('dist'));
}

// Listen on port
const port = process.env.PORT || 3000;
const server = app.listen(port);
console.log(`Server listening on port ${port}`);

// Setup socket.io
const io = socketio(server);

// Setup the Game
const game = new Game();

// Listen for socket.io connections
io.on('connection', socket => {
  console.log('Player connected!', socket.id);

  socket.on(Constants.MSG_TYPES.JOIN_GAME, joinGame);
  socket.on(Constants.MSG_TYPES.INPUT, handleInput);
  socket.on(Constants.MSG_TYPES.EMOTE, handleEmote);
  socket.on('disconnect', onDisconnect);
});

// faster webrtc peer connections

function joinGame(username) {
  game.addPlayer(this, username);
  io.sockets.emit(Constants.MSG_TYPES.BRDCST_PLAYER_ENTERED, game.getPlayers());
}

function handleInput(dir) {
  game.handleInput(this, dir.dir, dir.dis);
}

function handleEmote(emote) {
  game.handleEmote(this, emote);
}

function onDisconnect() {
  game.removePlayer(this);
  this.broadcast.emit(Constants.MSG_TYPES.BRDCST_PLAYER_LEFT, this.id);
  console.log(`Player left! ${this.id}`);
}

app.get('/photo/:id', (req, res) => {
  const im = game.getPhoto(req.params.id).split(',')[1];
  if (im) {
    const img = Buffer.from(im, 'base64');

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length,
    });
    res.end(img);
  } else {
    res.sendStatus(404);
  }
});
