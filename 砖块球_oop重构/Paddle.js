// Paddle.js 挡板类，负责挡板的属性和行为
// 这个类用于表示游戏中的挡板（玩家控制的板子）
class Paddle {
  // 构造函数，初始化挡板的位置、宽高和速度
  constructor(x, y, w, h, speed) {
    this.x = x;       // 挡板左上角的x坐标
    this.y = y;       // 挡板左上角的y坐标
    this.w = w;       // 挡板的宽度
    this.h = h;       // 挡板的高度
    this.speed = speed; // 挡板的移动速度
  }

  // 挡板移动方法，dir为方向（-1表示左，1表示右，0表示不动）
  move(dir) {
    this.x += dir * this.speed; // 根据方向和速度改变x坐标
    // 保证挡板不会移出画布边界
    this.x = constrain(this.x, 0, width - this.w);
  }

  // 绘制挡板的方法
  draw() {
    fill('#2196F3'); // 设置挡板主色
    rect(this.x, this.y, this.w, this.h, 7); // 绘制带圆角的矩形挡板
    fill('rgba(255,255,255,0.3)'); // 设置高光颜色
    rect(this.x + 5, this.y + 2, this.w * 0.8, 4, 2); // 绘制挡板高光
  }
} 