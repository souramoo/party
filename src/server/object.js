class Object {
  constructor(id, x, y, dir, speed, dis) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.direction = dir;
    this.speed = speed;
    this.distance = dis;
  }

  update(dt) {
    const dx = dt * this.speed * Math.sin(this.direction);
    const dy = dt * this.speed * Math.cos(this.direction);
    if (this.distance > 0) {
      this.x += dx;
      this.y -= dy;
      this.distance -= Math.sqrt((dx ** 2) + (dy ** 2));
    }
  }

  distanceTo(object) {
    const dx = this.x - object.x;
    const dy = this.y - object.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  setDirection(dir) {
    this.direction = dir;
  }

  setDistance(dis) {
    this.distance = dis;
  }

  serializeForUpdate() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
    };
  }
}

module.exports = Object;
