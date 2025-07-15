// Powerup.js 道具类，负责道具的属性和行为
class Powerup {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.radius = 10;
    this.speed = 2;
  }

  update() {
    this.y += this.speed;
  }

  draw() {
    const typeColors = {
      'life': '#FF5252',
      'expand': '#4CAF50',
      'speedup': '#FFC107'
    };
    fill(typeColors[this.type] || '#9C27B0');
    ellipse(this.x, this.y, 20);
    fill(255);
    textSize(14);
    textAlign(CENTER, CENTER);
    if (this.type === 'life') {
      text('❤', this.x, this.y - 1);
    } else if (this.type === 'expand') {
      text('↔', this.x, this.y);
    } else {
      text('⚡', this.x, this.y);
    }
  }
} 