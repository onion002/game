// Brick.js 砖块类，负责砖块的属性和行为
// 这个类用于表示游戏中的每一块砖
class Brick {
  // 构造函数，初始化砖块的位置、宽高、类型和主题颜色
  constructor(x, y, w, h, type, theme) {
    this.x = x;         // 砖块左上角的x坐标
    this.y = y;         // 砖块左上角的y坐标
    this.w = w;         // 砖块的宽度
    this.h = h;         // 砖块的高度
    this.type = type;   // 砖块类型（决定耐久度和颜色）
    this.status = 1;    // 砖块状态（1表示存在，0表示被打碎）
    this.hitCount = type; // 砖块剩余耐久度
    this.theme = theme; // 当前主题颜色数组
  }

  // 绘制砖块的方法
  draw() {
    if (this.status === 1) { // 只绘制未被打碎的砖块
      // 根据砖块类型选择颜色
      const color = this.theme[min(this.type - 1, this.theme.length - 1)];
      fill(color); // 设置砖块主色
      rect(this.x, this.y, this.w, this.h, 4); // 绘制砖块
      // 砖块边框
      stroke(0);
      strokeWeight(1);
      noFill();
      rect(this.x, this.y, this.w, this.h, 4);
      noStroke();
      // 砖块高光效果
      fill('rgba(255,255,255,0.2)');
      rect(this.x + 2, this.y + 2, this.w - 4, this.h * 0.4, 2);
    }
  }

  // 砖块被击中的方法，返回是否被完全打碎
  hit() {
    this.hitCount--; // 耐久度减1
    if (this.hitCount <= 0) {
      this.status = 0; // 标记为被打碎
      return true;     // 返回true表示砖块被消除
    }
    return false;      // 返回false表示砖块还存在
  }
} 