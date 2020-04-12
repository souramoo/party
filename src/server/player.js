const ObjectClass = require('./object');
const Constants = require('../shared/constants');

class Player extends ObjectClass {
  constructor(id, profilePhoto, x, y, room) {
    super(id, x, y, 0, Constants.PLAYER_SPEED, 0);
    this.profilePhoto = profilePhoto;
    this.emote = 'neutral';
    this.room = room;
  }

  update(dt) {
    super.update(dt);
    this.x = Math.max(0, Math.min(Constants.MAP_SIZE, this.x));
    this.y = Math.max(0, Math.min(Constants.MAP_SIZE, this.y));
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
