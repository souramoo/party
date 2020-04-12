const _ = require('lodash');
const Constants = require('../shared/constants');
const Player = require('./player');

class Game {
  constructor() {
    this.sockets = {};
    this.players = {};
    this.bullets = [];
    this.lastUpdateTime = Date.now();
    this.shouldSendUpdate = false;
    setInterval(this.update.bind(this), 1000 / 40);
  }

  addPlayer(socket, joinData) {
    this.sockets[socket.id] = socket;
    const { username: profilePhoto, room } = joinData;
    console.log(room);

    // Generate a position to start this player at.
    const x = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
    const y = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
    this.players[socket.id] = new Player(socket.id, profilePhoto, x, y, room);
  }

  removePlayer(socket) {
    delete this.sockets[socket.id];
    delete this.players[socket.id];
  }

  handleInput(socket, dir, dis) {
    if (this.players[socket.id]) {
      this.players[socket.id].setDirection(dir);
      this.players[socket.id].setDistance(dis);
    }
  }

  handleEmote(socket, emote) {
    if (this.players[socket.id]) {
      this.players[socket.id].setEmote(emote);
    }
  }

  update() {
    // Calculate time elapsed
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    // Update each player
    Object.keys(this.sockets).forEach(playerID => {
      const player = this.players[playerID];
      player.update(dt);
    });

    // Send a game update to each player every other time
    if (this.shouldSendUpdate) {
      Object.keys(this.sockets).forEach(playerID => {
        const socket = this.sockets[playerID];
        const player = this.players[playerID];
        const update = this.createUpdate(player);
        if (!_.isEqual(player.lastUpdate, update)) {
          socket.emit(Constants.MSG_TYPES.GAME_UPDATE, { t: Date.now(), ...update });
          player.lastUpdate = update;
        }
      });
      this.shouldSendUpdate = false;
    } else {
      this.shouldSendUpdate = true;
    }
  }

  getLeaderboard() {
    return Object.values(this.players)
      .sort((p1, p2) => p2.score - p1.score)
      .slice(0, 5)
      .map(p => ({ username: p.username, score: Math.round(p.score) }));
  }

  getPhoto(id) {
    return (this.players[id] ? this.players[id].username : '');
  }

  getPlayers() {
    return Object.keys(this.players).map(k => ({ id: k, room: this.players[k].room }));
  }

  createUpdate(player) {
    let nearbyPlayers = Object.values(this.players).filter(
      p => p !== player && p.room === player.room,
    );

    if (nearbyPlayers.length > 5) { // add distance check in eek
      nearbyPlayers = Object.values(this.players).filter(
        p => p !== player &&
        p.distanceTo(player) <= Constants.MAP_SIZE / 2 &&
        p.room === player.room,
      );
    }

    return {
      me: player.serializeForUpdate(),
      others: nearbyPlayers.map(p => p.serializeForUpdate()),
    };
  }
}

module.exports = Game;
