// Brick.js 砖块类，负责砖块的属性和行为
class Brick {
  constructor(x, y, w, h, type, theme) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type;
    this.status = 1;
    this.hitCount = type;
    this.theme = theme;
  }

  draw() {
    if (this.status === 1) {
      const color = this.theme[min(this.type - 1, this.theme.length - 1)];
      fill(color);
      rect(this.x, this.y, this.w, this.h, 4);
      // 砖块边框
      stroke(0);
      strokeWeight(1);
      noFill();
      rect(this.x, this.y, this.w, this.h, 4);
      noStroke();
      // 砖块光泽效果
      fill('rgba(255,255,255,0.2)');
      rect(this.x + 2, this.y + 2, this.w - 4, this.h * 0.4, 2);
    }
  }

  hit() {
    this.hitCount--;
    if (this.hitCount <= 0) {
      this.status = 0;
      return true;
    }
    return false;
  }
} 