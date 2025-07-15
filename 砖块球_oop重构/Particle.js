// Particle.js 粒子类，负责粒子的属性和行为
class Particle {
  constructor(x, y, size, speed, angle, life, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.angle = angle;
    this.life = life;
    this.color = color;
  }

  update() {
    this.x += cos(this.angle) * this.speed;
    this.y += sin(this.angle) * this.speed;
    this.life--;
  }

  draw() {
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.size);
  }
} 