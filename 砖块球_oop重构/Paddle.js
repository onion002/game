// Paddle.js 挡板类，负责挡板的属性和行为
class Paddle {
  constructor(x, y, w, h, speed) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.speed = speed;
  }

  move(dir) {
    this.x += dir * this.speed;
    this.x = constrain(this.x, 0, width - this.w);
  }

  draw() {
    fill('#2196F3');
    rect(this.x, this.y, this.w, this.h, 7);
    fill('rgba(255,255,255,0.3)');
    rect(this.x + 5, this.y + 2, this.w * 0.8, 4, 2);
  }
} 