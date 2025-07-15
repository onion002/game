// Ball.js 球类，负责球的属性和行为
// 这个类用于表示游戏中的小球
class Ball { // 定义Ball类，表示游戏中的小球
  constructor(x, y, r) { // 构造函数，初始化球的位置、半径和速度
    this.x = x; // 球心的x坐标
    this.y = y; // 球心的y坐标
    this.r = r; // 球的半径
    this.xSpeed = 0; // 球的x方向速度
    this.ySpeed = 0; // 球的y方向速度
  }

  launch() { // 发射球的方法，设置初始速度
    this.xSpeed = random([-4, 4]); // 随机选择向左或向右
    this.ySpeed = -4; // 向上发射
  }

  update() { // 更新球的位置
    this.x += this.xSpeed; // 根据速度更新x坐标
    this.y += this.ySpeed; // 根据速度更新y坐标
    // 边界检测和反弹逻辑在GameManager中处理
  }

  draw() { // 绘制球的方法
    fill('#FFEB3B'); // 设置球的主色
    ellipse(this.x, this.y, this.r * 2); // 绘制球
    fill('rgba(255,255,255,0.8)'); // 设置高光颜色
    ellipse(this.x - this.r * 0.3, this.y - this.r * 0.3, this.r * 0.7); // 绘制球的高光
  }
} 