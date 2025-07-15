// Particle.js 粒子类，负责粒子的属性和行为
// 这个类用于表示游戏中的粒子特效（如碰撞、破碎时的动画）
class Particle {
  // 构造函数，初始化粒子的位置、大小、速度、方向、寿命和颜色
  constructor(x, y, size, speed, angle, life, color) {
    this.x = x;         // 粒子中心的x坐标
    this.y = y;         // 粒子中心的y坐标
    this.size = size;   // 粒子的大小
    this.speed = speed; // 粒子的移动速度
    this.angle = angle; // 粒子的移动方向（弧度）
    this.life = life;   // 粒子的剩余寿命（帧数）
    this.color = color; // 粒子的颜色
  }

  // 更新粒子的位置和寿命
  update() {
    this.x += cos(this.angle) * this.speed; // 按照角度和速度移动x
    this.y += sin(this.angle) * this.speed; // 按照角度和速度移动y
    this.life--; // 每帧寿命减1
  }

  // 绘制粒子的方法
  draw() {
    fill(this.color); // 设置粒子颜色
    noStroke();       // 不绘制边框
    ellipse(this.x, this.y, this.size); // 绘制粒子
  }
} 