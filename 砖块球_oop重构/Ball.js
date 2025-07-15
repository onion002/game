// Ball.js 球类，负责球的属性和行为
class Ball {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.xSpeed = 0;
    this.ySpeed = 0;
  }

  launch() {
    this.xSpeed = random([-4, 4]);
    this.ySpeed = -4;
  }

  update() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
    // 边界检测和反弹逻辑将在GameManager中处理
  }

  draw() {
    fill('#FFEB3B');
    ellipse(this.x, this.y, this.r * 2);
    fill('rgba(255,255,255,0.8)');
    ellipse(this.x - this.r * 0.3, this.y - this.r * 0.3, this.r * 0.7);
  }
} 