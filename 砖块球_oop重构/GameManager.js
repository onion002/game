// GameManager.js 游戏管理器类，负责整体游戏流程和对象管理
// 这个类用于管理游戏的所有对象、状态和主流程
class GameManager {
  // 构造函数，初始化所有游戏参数和对象
  constructor() {
    // 游戏常量（砖块行列数、尺寸、间距、主题等）
    this.BRICK_ROWS = 6;         // 砖块行数
    this.BRICK_COLS = 14;        // 砖块列数
    this.BRICK_WIDTH = 50;       // 砖块宽度
    this.BRICK_HEIGHT = 20;      // 砖块高度
    this.BRICK_PADDING = 10;     // 砖块间距
    this.BRICK_TOP_MARGIN = 50;  // 砖块距离顶部的距离
    this.POWERUP_CHANCE = 0.2;   // 砖块掉落道具的概率
    this.themes = [              // 多套主题颜色
      ['#FF5722', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5'],
      ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107'],
      ['#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A']
    ];
    this.currentTheme = 0;       // 当前主题索引

    // 游戏对象
    this.paddle = null;          // 挡板对象
    this.ball = null;            // 球对象
    this.bricks = [];            // 砖块数组
    this.powerups = [];          // 道具数组
    this.particles = [];         // 粒子特效数组

    // 游戏状态
    this.score = 0;              // 当前分数
    this.lives = 3;              // 剩余生命
    this.level = 1;              // 当前关卡
    this.lastHitTime = 0;        // 上次击球时间
    this.gameState = 'start';    // 游戏状态（start, playing, win, gameover）
  }

  // 初始化/重置游戏对象
  setup() {
    this.paddle = new Paddle(width / 2 - 50, height - 30, 100, 15, 8); // 创建挡板
    this.ball = new Ball(width / 2, height / 2, 10);                   // 创建球
    this.createBricks();                                               // 创建砖块
    this.powerups = [];                                                // 清空道具
    this.particles = [];                                               // 清空粒子
    this.lastHitTime = millis();                                       // 记录当前时间
  }

  // 创建所有砖块
  createBricks() {
    this.bricks = [];
    for (let c = 0; c < this.BRICK_COLS; c++) {
      for (let r = 0; r < this.BRICK_ROWS; r++) {
        // 关卡高时砖块类型更丰富
        const brickType = this.level > 3 ? floor(random(1, 4)) : 1;
        this.bricks.push(new Brick(
          c * (this.BRICK_WIDTH + this.BRICK_PADDING) + this.BRICK_PADDING,
          r * (this.BRICK_HEIGHT + this.BRICK_PADDING) + this.BRICK_TOP_MARGIN,
          this.BRICK_WIDTH,
          this.BRICK_HEIGHT,
          brickType,
          this.themes[this.currentTheme]
        ));
      }
    }
  }

  // 开始游戏，发射球并隐藏覆盖层
  startGame() {
    this.gameState = 'playing';
    this.ball.launch();
    const overlay = document.getElementById('game-overlay');
    overlay.style.opacity = 0;
    overlay.style.pointerEvents = 'none';
  }

  // 游戏主更新逻辑，每帧调用
  update() {
    if (this.gameState === 'playing') {
      // 挡板移动（根据键盘方向）
      let dir = 0;
      if (keyIsDown(LEFT_ARROW)) dir -= 1;
      if (keyIsDown(RIGHT_ARROW)) dir += 1;
      this.paddle.move(dir);
      // 球移动
      this.ball.update();
      this.handleBallCollisions();
      // 道具更新
      for (let i = this.powerups.length - 1; i >= 0; i--) {
        this.powerups[i].update();
        // 检查是否被挡板接住
        if (this.powerups[i].y + 10 > this.paddle.y &&
            this.powerups[i].x > this.paddle.x &&
            this.powerups[i].x < this.paddle.x + this.paddle.w) {
          this.applyPowerup(this.powerups[i].type);
          this.powerups.splice(i, 1);
          continue;
        }
        // 掉出屏幕则移除
        if (this.powerups[i].y > height) {
          this.powerups.splice(i, 1);
          continue;
        }
      }
      // 粒子更新
      for (let i = this.particles.length - 1; i >= 0; i--) {
        this.particles[i].update();
        if (this.particles[i].life <= 0) {
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
    this.ball.draw();   // 绘制球
    this.bricks.forEach(b => b.draw(this.themes[this.currentTheme])); // 绘制所有砖块
    this.powerups.forEach(p => p.draw()); // 绘制所有道具
    this.particles.forEach(pt => pt.draw()); // 绘制所有粒子
    this.drawUI(); // 绘制分数、生命等UI
  }

  // 处理球与边界、挡板、砖块的碰撞
  handleBallCollisions() {
    // 球与左右边界
    if (this.ball.x - this.ball.r < 0 || this.ball.x + this.ball.r > width) {
      this.ball.xSpeed *= -1; // 反弹
      this.createImpactEffect(this.ball.x, this.ball.y, 15);
    }
    // 球与顶部
    if (this.ball.y - this.ball.r < 0) {
      this.ball.ySpeed *= -1; // 反弹
      this.createImpactEffect(this.ball.x, this.ball.y, 15);
    }
    // 球与挡板
    if (this.ball.y + this.ball.r > this.paddle.y &&
        this.ball.y - this.ball.r < this.paddle.y + this.paddle.h &&
        this.ball.x > this.paddle.x &&
        this.ball.x < this.paddle.x + this.paddle.w) {
      // 计算反弹角度
      const hitPos = (this.ball.x - this.paddle.x) / this.paddle.w;
      const angle = map(hitPos, 0, 1, -QUARTER_PI, QUARTER_PI);
      this.ball.ySpeed = -abs(this.ball.ySpeed); // 向上反弹
      this.ball.xSpeed = 5 * sin(angle);        // 根据击中位置调整x速度
      // 随关卡提升球速
      const speedBoost = min(this.level * 0.2, 1.5);
      this.ball.xSpeed *= (1 + speedBoost);
      this.ball.ySpeed *= (1 + speedBoost);
      this.createImpactEffect(this.ball.x, this.ball.y, 30);
      this.lastHitTime = millis();
    }
    // 球掉到底部
    if (this.ball.y - this.ball.r > height) {
      this.lives--;
      this.createImpactEffect(this.ball.x, height, 50);
      if (this.lives <= 0) {
        this.gameState = 'gameover'; // 游戏结束
      } else {
        // 重置球位置，暂停后继续
        this.ball.x = width / 2;
        this.ball.y = height / 2;
        this.ball.xSpeed = 0;
        this.ball.ySpeed = 0;
        setTimeout(() => {
          if (this.gameState === 'playing') {
            this.ball.launch();
          }
        }, 1000);
      }
    }
    // 球与砖块
    for (let i = this.bricks.length - 1; i >= 0; i--) {
      const b = this.bricks[i];
      if (b.status === 1 &&
          this.ball.x + this.ball.r > b.x &&
          this.ball.x - this.ball.r < b.x + b.w &&
          this.ball.y + this.ball.r > b.y &&
          this.ball.y - this.ball.r < b.y + b.h) {
        if (b.hit()) { // 砖块被打碎
          // 随机掉落道具
          if (random() < this.POWERUP_CHANCE) {
            const powerTypes = ['life', 'expand', 'speedup'];
            this.powerups.push(new Powerup(
              b.x + b.w / 2,
              b.y + b.h / 2,
              random(powerTypes)
            ));
          }
          this.createBrickBreakEffect(b); // 砖块破碎特效
        }
        // 判断碰撞方向并反弹
        const hitFromLeft = this.ball.x < b.x;
        const hitFromRight = this.ball.x > b.x + b.w;
        const hitFromTop = this.ball.y < b.y;
        const hitFromBottom = this.ball.y > b.y + b.h;
        if (hitFromLeft || hitFromRight) {
          this.ball.xSpeed *= -1;
        }
        if (hitFromTop || hitFromBottom) {
          this.ball.ySpeed *= -1;
        }
        this.score += 10 * this.level; // 增加分数
        this.lastHitTime = millis();
        break; // 一次只处理一个砖块
      }
    }
  }

  // 应用道具效果
  applyPowerup(type) {
    // 生成粒子特效
    for (let i = 0; i < 50; i++) {
      this.particles.push(new Particle(
        this.paddle.x + this.paddle.w / 2,
        this.paddle.y,
        random(3, 8),
        random(1, 5),
        random(TWO_PI),
        60,
        type === 'life' ? '#FF5252' : type === 'expand' ? '#4CAF50' : '#FFC107'
      ));
    }
    // 根据道具类型应用效果
    if (type === 'life') {
      this.lives++; // 增加生命
    } else if (type === 'expand') {
      this.paddle.w = min(this.paddle.w * 1.3, 180); // 扩大挡板
      setTimeout(() => {
        if (this.gameState === 'playing') this.paddle.w = 100;
      }, 10000); // 10秒后恢复
    } else if (type === 'speedup') {
      this.ball.xSpeed *= 0.8; // 球减速
      this.ball.ySpeed *= 0.8;
    }
  }

  // 生成碰撞粒子特效
  createImpactEffect(x, y, size) {
    for (let i = 0; i < 20; i++) {
      this.particles.push(new Particle(
        x, y, random(2, 6), random(1, 4), random(TWO_PI), random(20, 40), color(255, random(150, 255), 0)
      ));
    }
  }

  // 生成砖块破碎粒子特效
  createBrickBreakEffect(brick) {
    const fragmentCount = 15;
    const fragmentColors = [
      color(255, 100, 100),
      color(255, 150, 100),
      color(255, 200, 100)
    ];
    for (let i = 0; i < fragmentCount; i++) {
      this.particles.push(new Particle(
        brick.x + brick.w / 2,
        brick.y + brick.h / 2,
        random(6, 12),
        random(1, 6),
        random(TWO_PI),
        random(40, 80),
        fragmentColors[i % fragmentColors.length]
      ));
    }
  }

  // 绘制分数、生命、等级等UI
  drawUI() {
    fill(255);
    textSize(24);
    textAlign(LEFT);
    text(`分数: ${this.score}`, 20, 30);
    textAlign(RIGHT);
    text(`生命: ${this.lives}`, width - 20, 30);
    textAlign(CENTER);
    text(`等级: ${this.level}`, width / 2, 30);
    // 连线特效（显示最近一次击球的连线）
    if (this.gameState === 'playing' && millis() - this.lastHitTime < 1000) {
      stroke(255, 200);
      strokeWeight(2);
      line(this.ball.x, this.ball.y, this.paddle.x + this.paddle.w / 2, this.paddle.y);
      noStroke();
    }
  }

  // 处理游戏状态切换和覆盖层显示
  handleGameState() {
    const overlay = document.getElementById('game-overlay');
    const title = document.getElementById('overlay-title');
    const message = document.getElementById('overlay-message');
    const startBtn = document.getElementById('start-btn');
    // 检查是否通关
    const bricksLeft = this.bricks.filter(b => b.status === 1).length;
    if (bricksLeft === 0 && this.gameState === 'playing') {
      this.gameState = 'win';
    }
    switch (this.gameState) {
      case 'start':
        overlay.style.opacity = 1;
        overlay.style.pointerEvents = 'all';
        title.textContent = `打砖块 - 等级 ${this.level}`;
        message.textContent = '使用← →键移动挡板，按空格键发射球';
        startBtn.textContent = '开始游戏';
        break;
      case 'playing':
        // 游戏进行中不显示覆盖层
        break;
      case 'win':
        overlay.style.opacity = 1;
        overlay.style.pointerEvents = 'all';
        title.textContent = '胜利!';
        message.textContent = `你已完成等级 ${this.level}! 得分: ${this.score}`;
        startBtn.textContent = '下一关';
        this.level++;
        this.currentTheme = (this.currentTheme + 1) % this.themes.length;
        break;
      case 'gameover':
        overlay.style.opacity = 1;
        overlay.style.pointerEvents = 'all';
        title.textContent = '游戏结束';
        message.textContent = `最终得分: ${this.score}`;
        startBtn.textContent = '重新开始';
        this.level = 1;
        break;
    }
  }
} 