const shortid = require('shortid');
const ObjectClass = require('./object');
const Constants = require('../shared/constants');

class Emote extends ObjectClass {
  constructor(parentID, x, y, time, type) {
    super(shortid(), x, y, 0, 100, 200);
    this.parentID = parentID;
    this.time = 100;
    this.type = type;
  }

  // Returns true if the bullet should be destroyed
  update(dt) {
    super.update(dt);
    this.time -= 1;
    return this.x < 0 || this.x > Constants.MAP_SIZE || this.y < 0 ||
      this.y > Constants.MAP_SIZE || this.time < 0;
  }

  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      emote: this.type,
      time: this.time,
    };
  }
}

module.exports = Emote;
