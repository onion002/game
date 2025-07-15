// Powerup.js 道具类，负责道具的属性和行为
// 这个类用于表示游戏中掉落的各种道具
class Powerup { // 定义Powerup类，表示游戏中的道具
  constructor(x, y, type) { // 构造函数，初始化道具的位置和类型
    this.x = x; // 道具中心的x坐标
    this.y = y; // 道具中心的y坐标
    this.type = type; // 道具类型（如'life'、'expand'、'speedup'）
    this.radius = 10; // 道具的半径
    this.speed = 2; // 道具下落速度
  }

  update() { // 更新道具的位置（向下移动）
    this.y += this.speed; // 每帧向下移动一定距离
  }

  draw() { // 绘制道具的方法
    const typeColors = { // 不同类型道具对应不同颜色
      'life': '#FF5252', // 生命道具为红色
      'expand': '#4CAF50', // 扩展道具为绿色
      'speedup': '#FFC107' // 减速道具为黄色
    };
    fill(typeColors[this.type] || '#9C27B0'); // 设置道具主色
    ellipse(this.x, this.y, 20); // 绘制道具圆形
    fill(255); // 设置图标颜色为白色
    textSize(14); // 设置字体大小
    textAlign(CENTER, CENTER); // 设置文字居中
    if (this.type === 'life') { // 根据类型绘制不同的图标
      text('❤', this.x, this.y - 1); // 生命道具显示爱心
    } else if (this.type === 'expand') {
      text('↔', this.x, this.y); // 扩展道具显示左右箭头
    } else {
      text('⚡', this.x, this.y); // 其他道具显示闪电
    }
  }
} 