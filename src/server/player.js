const ObjectClass = require('./object');
const Constants = require('../shared/constants');

class Player extends ObjectClass {
  constructor(id, username, x, y, room) {
    super(id, x, y, 0, Constants.PLAYER_SPEED, 0);
    this.username = username;
    this.fireCooldown = 0;
    this.emote = 'neutral';
    this.room = room;
  }

  // Returns a newly created bullet, or null.
  update(dt) {
    super.update(dt);

    // Make sure the player stays in bounds
    this.x = Math.max(0, Math.min(Constants.MAP_SIZE, this.x));
    this.y = Math.max(0, Math.min(Constants.MAP_SIZE, this.y));

    this.fireCooldown -= dt;

    return null;
  }


  setEmote(emote) {
    this.emote = emote;
  }

  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      direction: this.direction,
      distance: this.distance,
      emote: this.emote,
      room: this.room,
    };
  }
}

module.exports = Player;
