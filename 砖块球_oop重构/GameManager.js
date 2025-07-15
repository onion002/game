// GameManager.js 游戏管理器类，负责整体游戏流程和对象管理
// 这个类用于管理游戏的所有对象、状态和主流程
class GameManager { // 定义GameManager类，管理整个游戏
  constructor() { // 构造函数，初始化所有游戏参数和对象
    this.BRICK_ROWS = 6; // 砖块行数
    this.BRICK_COLS = 14; // 砖块列数
    this.BRICK_WIDTH = 50; // 砖块宽度
    this.BRICK_HEIGHT = 20; // 砖块高度
    this.BRICK_PADDING = 10; // 砖块间距
    this.BRICK_TOP_MARGIN = 50; // 砖块距离顶部的距离
    this.POWERUP_CHANCE = 0.2; // 砖块掉落道具的概率
    this.themes = [ // 多套主题颜色
      ['#FF5722', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5'],
      ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107'],
      ['#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A']
    ];
    
    this.currentTheme = 0; // 当前主题索引
  //游戏对象
    this.paddle = null; // 挡板对象
    this.ball = null; // 球对象
    this.bricks = []; // 砖块数组
    this.powerups = []; // 道具数组
    this.particles = []; // 粒子特效数组
  //游戏分数
    this.score = 0; // 当前分数
    this.lives = 3; // 剩余生命
    this.level = 1; // 当前关卡
    this.lastHitTime = 0; // 上次击球时间
    this.gameState = 'start'; // 游戏状态（start, playing, win, gameover）
  }
  // 初始化/重置游戏对象
  setup() { 
    this.paddle = new Paddle(width / 2 - 50, height - 30, 100, 15, 8); // 创建挡板
    this.ball = new Ball(width / 2, height / 2, 10); // 创建球
    this.createBricks(); // 创建砖块
    this.powerups = []; // 清空道具
    this.particles = []; // 清空粒子
    this.lastHitTime = millis(); // 记录当前时间
  }
// 创建所有砖块
  createBricks() { 
    this.bricks = []; // 清空砖块数组
    for (let c = 0; c < this.BRICK_COLS; c++) { // 遍历每一列
      for (let r = 0; r < this.BRICK_ROWS; r++) { // 遍历每一行
        const brickType = this.level > 3 ? floor(random(1, 4)) : 1; // 关卡高时砖块类型更丰富
        this.bricks.push(new Brick(
          c * (this.BRICK_WIDTH + this.BRICK_PADDING) + this.BRICK_PADDING, // 计算砖块x坐标
          r * (this.BRICK_HEIGHT + this.BRICK_PADDING) + this.BRICK_TOP_MARGIN, // 计算砖块y坐标
          this.BRICK_WIDTH, // 砖块宽度
          this.BRICK_HEIGHT, // 砖块高度
          brickType, // 砖块类型
          this.themes[this.currentTheme] // 当前主题颜色
        ));
      }
    }
  }
// 开始游戏，发射球并隐藏覆盖层
  startGame() { // 开始游戏，发射球并隐藏覆盖层
    this.gameState = 'playing'; // 设置游戏状态为playing
    this.ball.launch(); // 发射球
    const overlay = document.getElementById('game-overlay'); // 获取覆盖层元素
    overlay.style.opacity = 0; // 隐藏覆盖层
    overlay.style.pointerEvents = 'none'; // 禁止覆盖层交互
  }
// 游戏主更新逻辑，每帧调用
  update() {
    if (this.gameState === 'playing') { // 只有在playing状态下才更新
      let dir = 0; // 挡板移动方向
      if (keyIsDown(LEFT_ARROW)) dir -= 1; // 按左键向左
      if (keyIsDown(RIGHT_ARROW)) dir += 1; // 按右键向右
      this.paddle.move(dir); // 挡板移动
      this.ball.update(); // 球移动
      this.handleBallCollisions(); // 处理球的碰撞
      for (let i = this.powerups.length - 1; i >= 0; i--) { // 更新所有道具
        this.powerups[i].update(); // 道具下落
        if (this.powerups[i].y + 10 > this.paddle.y && // 检查是否被挡板接住
            this.powerups[i].x > this.paddle.x &&
            this.powerups[i].x < this.paddle.x + this.paddle.w) {
          this.applyPowerup(this.powerups[i].type); // 应用道具效果
          this.powerups.splice(i, 1); // 移除道具
          continue;
        }
        if (this.powerups[i].y > height) { // 掉出屏幕则移除
          this.powerups.splice(i, 1);
          continue;
        }
      }
      for (let i = this.particles.length - 1; i >= 0; i--) { // 更新所有粒子
        this.particles[i].update(); // 粒子移动
        if (this.particles[i].life <= 0) { // 粒子寿命结束则移除
          this.particles.splice(i, 1);
        }
      }
    }
    this.handleGameState(); // 处理游戏状态切换
  }
 // 游戏主绘制逻辑，每帧调用
  draw() { 
    background(0); // 清空画布
    this.paddle.draw(); // 绘制挡板
    this.ball.draw(); // 绘制球
    this.bricks.forEach(b => b.draw(this.themes[this.currentTheme])); // 绘制所有砖块
    this.powerups.forEach(p => p.draw()); // 绘制所有道具
    this.particles.forEach(pt => pt.draw()); // 绘制所有粒子
    this.drawUI(); // 绘制分数、生命等UI
  }
// 处理球与边界、挡板、砖块的碰撞
  handleBallCollisions() { 
    if (this.ball.x - this.ball.r < 0 || this.ball.x + this.ball.r > width) { // 球碰到左右边界
      this.ball.xSpeed *= -1; // 反弹
      this.createImpactEffect(this.ball.x, this.ball.y, 15); // 生成粒子特效
    }
    if (this.ball.y - this.ball.r < 0) { // 球碰到顶部
      this.ball.ySpeed *= -1; // 反弹
      this.createImpactEffect(this.ball.x, this.ball.y, 15); // 生成粒子特效
    }
    if (this.ball.y + this.ball.r > this.paddle.y && // 球碰到挡板
        this.ball.y - this.ball.r < this.paddle.y + this.paddle.h &&
        this.ball.x > this.paddle.x &&
        this.ball.x < this.paddle.x + this.paddle.w) {
      const hitPos = (this.ball.x - this.paddle.x) / this.paddle.w; // 计算击中位置
      const angle = map(hitPos, 0, 1, -QUARTER_PI, QUARTER_PI); // 计算反弹角度
      this.ball.ySpeed = -abs(this.ball.ySpeed); // 向上反弹
      this.ball.xSpeed = 5 * sin(angle); // 根据击中位置调整x速度
      const speedBoost = min(this.level * 0.1, 1.3); // 随关卡提升球速
      this.ball.xSpeed *= (1 + speedBoost);
      this.ball.ySpeed *= (1 + speedBoost);
      this.createImpactEffect(this.ball.x, this.ball.y, 30); // 生成粒子特效
      this.lastHitTime = millis(); // 记录击球时间
    }
    if (this.ball.y - this.ball.r > height) { // 球掉到底部
      this.lives--; // 生命减1
      this.createImpactEffect(this.ball.x, height, 50); // 生成粒子特效
      if (this.lives <= 0) { // 没有生命了
        this.gameState = 'gameover'; // 游戏结束
      } else {
        this.ball.x = width / 2; // 重置球位置
        this.ball.y = height / 2;
        this.ball.xSpeed = 0;
        this.ball.ySpeed = 0;
        setTimeout(() => { // 暂停后继续
          if (this.gameState === 'playing') {
            this.ball.launch(); // 重新发射球
          }
        }, 1000);
      }
    }
    for (let i = this.bricks.length - 1; i >= 0; i--) { // 球与砖块
      const b = this.bricks[i]; // 当前砖块
      if (b.status === 1 &&
          this.ball.x + this.ball.r > b.x &&
          this.ball.x - this.ball.r < b.x + b.w &&
          this.ball.y + this.ball.r > b.y &&
          this.ball.y - this.ball.r < b.y + b.h) {
        if (b.hit()) { // 砖块被打碎
          if (random() < this.POWERUP_CHANCE) { // 随机掉落道具
            const powerTypes = ['life', 'expand', 'speedup']; // 道具类型
            this.powerups.push(new Powerup(
              b.x + b.w / 2, // 道具x坐标
              b.y + b.h / 2, // 道具y坐标
              random(powerTypes) // 随机类型
            ));
          }
          this.createBrickBreakEffect(b); // 砖块破碎特效
        }
        const hitFromLeft = this.ball.x < b.x; // 判断碰撞方向
        const hitFromRight = this.ball.x > b.x + b.w;
        const hitFromTop = this.ball.y < b.y;
        const hitFromBottom = this.ball.y > b.y + b.h;
        if (hitFromLeft || hitFromRight) {
          this.ball.xSpeed *= -1; // 横向反弹
        }
        if (hitFromTop || hitFromBottom) {
          this.ball.ySpeed *= -1; // 纵向反弹
        }
        this.score += 10 * this.level; // 增加分数
        this.lastHitTime = millis(); // 记录击球时间
        break; // 一次只处理一个砖块
      }
    }
  }
// 应用道具效果
  applyPowerup(type) { 
    for (let i = 0; i < 50; i++) { // 生成粒子特效
      this.particles.push(new Particle(
        this.paddle.x + this.paddle.w / 2, // 粒子x坐标
        this.paddle.y, // 粒子y坐标
        random(3, 8), // 粒子大小
        random(1, 5), // 粒子速度
        random(TWO_PI), // 粒子方向
        60, // 粒子寿命
        type === 'life' ? '#FF5252' : type === 'expand' ? '#4CAF50' : '#FFC107' // 粒子颜色
      ));
    }
    // 生命道具
    if (type === 'life') { 
      this.lives++; // 增加生命
      // 扩展道具
    } else if (type === 'expand') { 
      this.paddle.w = min(this.paddle.w * 1.3, 180); // 扩大挡板
      setTimeout(() => { // 10秒后恢复
        if (this.gameState === 'playing') this.paddle.w = 100;
      }, 10000);
      // 减速道具
    } else if (type === 'speedup') { 
      this.ball.xSpeed *= 0.8; // 球减速
      this.ball.ySpeed *= 0.8;
    }
  }
// 生成碰撞粒子特效
  createImpactEffect(x, y, size) { 
    for (let i = 0; i < 20; i++) { // 生成20个粒子
      this.particles.push(new Particle(
        x, y, random(2, 6), random(1, 4), random(TWO_PI), random(20, 40), color(255, random(150, 255), 0)
      ));
    }
  }
// 生成砖块破碎粒子特效
  createBrickBreakEffect(brick) { 
    const fragmentCount = 15; // 粒子数量
    const fragmentColors = [ // 粒子颜色
      color(255, 100, 100),
      color(255, 150, 100),
      color(255, 200, 100)
    ];
    for (let i = 0; i < fragmentCount; i++) { // 生成粒子
      this.particles.push(new Particle(
        brick.x + brick.w / 2, // 粒子x坐标
        brick.y + brick.h / 2, // 粒子y坐标
        random(6, 12), // 粒子大小
        random(1, 6), // 粒子速度
        random(TWO_PI), // 粒子方向
        random(40, 80), // 粒子寿命
        fragmentColors[i % fragmentColors.length] // 粒子颜色
      ));
    }
  }
// 绘制分数、生命、等级等UI
  drawUI() { 
    fill(255); // 设置字体颜色
    textSize(24); // 设置字体大小
    textAlign(LEFT); // 左对齐
    text(`分数: ${this.score}`, 20, 30); // 显示分数
    textAlign(RIGHT); // 右对齐
    text(`生命: ${this.lives}`, width - 20, 30); // 显示生命
    textAlign(CENTER); // 居中对齐
    text(`等级: ${this.level}`, width / 2, 30); // 显示等级
    if (this.gameState === 'playing' && millis() - this.lastHitTime < 1000) { // 连线特效
      stroke(255, 200); // 设置线颜色
      strokeWeight(2); // 设置线宽
      line(this.ball.x, this.ball.y, this.paddle.x + this.paddle.w / 2, this.paddle.y); // 绘制连线
      noStroke(); // 取消线
    }
  }
// 处理游戏状态切换和覆盖层显示
  handleGameState() { 
    const overlay = document.getElementById('game-overlay'); // 获取覆盖层
    const title = document.getElementById('overlay-title'); // 获取标题
    const message = document.getElementById('overlay-message'); // 获取提示信息
    const startBtn = document.getElementById('start-btn'); // 获取按钮
    const bricksLeft = this.bricks.filter(b => b.status === 1).length; // 剩余砖块数
    if (bricksLeft === 0 && this.gameState === 'playing') { // 通关
      this.gameState = 'win'; // 设置为胜利
    }
    switch (this.gameState) { // 根据状态切换界面
      case 'start': // 开始界面
        overlay.style.opacity = 1; // 显示覆盖层
        overlay.style.pointerEvents = 'all'; // 允许交互
        title.textContent = `打砖块 - 等级 ${this.level}`; // 设置标题
        message.textContent = '使用← →键移动挡板，按空格键发射球'; // 设置提示
        startBtn.textContent = '开始游戏'; // 设置按钮
        break;
      case 'playing': // 游戏进行中
        break;
      case 'win': // 胜利界面
        overlay.style.opacity = 1; // 显示覆盖层
        overlay.style.pointerEvents = 'all'; // 允许交互
        title.textContent = '胜利!'; // 设置标题
        message.textContent = `你已完成等级 ${this.level}! 得分: ${this.score}`; // 设置提示
        startBtn.textContent = '下一关'; // 设置按钮
        this.level++; // 关卡+1
        this.currentTheme = (this.currentTheme + 1) % this.themes.length; // 切换主题
        break;
      case 'gameover': // 游戏结束界面
        overlay.style.opacity = 1; // 显示覆盖层
        overlay.style.pointerEvents = 'all'; // 允许交互
        title.textContent = '游戏结束'; // 设置标题
        message.textContent = `最终得分: ${this.score}`; // 设置提示
        startBtn.textContent = '重新开始'; // 设置按钮
        this.level = 1; // 关卡重置
        break;
    }
  }
} 