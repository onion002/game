// GameManager.js 游戏管理器类，负责整体游戏流程和对象管理
class GameManager {
  constructor() {
    // 游戏常量
    this.BRICK_ROWS = 6;
    this.BRICK_COLS = 14;
    this.BRICK_WIDTH = 50;
    this.BRICK_HEIGHT = 20;
    this.BRICK_PADDING = 10;
    this.BRICK_TOP_MARGIN = 50;
    this.POWERUP_CHANCE = 0.2;
    this.themes = [
      ['#FF5722', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5'],
      ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107'],
      ['#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A']
    ];
    this.currentTheme = 0;

    // 游戏对象
    this.paddle = null;
    this.ball = null;
    this.bricks = [];
    this.powerups = [];
    this.particles = [];

    // 游戏状态
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.lastHitTime = 0;
    this.gameState = 'start';
  }

  setup() {
    this.paddle = new Paddle(width / 2 - 50, height - 30, 100, 15, 8);
    this.ball = new Ball(width / 2, height / 2, 10);
    this.createBricks();
    this.powerups = [];
    this.particles = [];
    this.lastHitTime = millis();
  }

  createBricks() {
    this.bricks = [];
    for (let c = 0; c < this.BRICK_COLS; c++) {
      for (let r = 0; r < this.BRICK_ROWS; r++) {
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

  startGame() {
    this.gameState = 'playing';
    this.ball.launch();
    const overlay = document.getElementById('game-overlay');
    overlay.style.opacity = 0;
    overlay.style.pointerEvents = 'none';
  }

  update() {
    if (this.gameState === 'playing') {
      // 挡板移动
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
        if (this.powerups[i].y + 10 > this.paddle.y &&
            this.powerups[i].x > this.paddle.x &&
            this.powerups[i].x < this.paddle.x + this.paddle.w) {
          this.applyPowerup(this.powerups[i].type);
          this.powerups.splice(i, 1);
          continue;
        }
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
    this.handleGameState();
  }

  draw() {
    background(0);
    this.paddle.draw();
    this.ball.draw();
    this.bricks.forEach(b => b.draw(this.themes[this.currentTheme]));
    this.powerups.forEach(p => p.draw());
    this.particles.forEach(pt => pt.draw());
    this.drawUI();
  }

  handleBallCollisions() {
    // 球与边界
    if (this.ball.x - this.ball.r < 0 || this.ball.x + this.ball.r > width) {
      this.ball.xSpeed *= -1;
      this.createImpactEffect(this.ball.x, this.ball.y, 15);
    }
    if (this.ball.y - this.ball.r < 0) {
      this.ball.ySpeed *= -1;
      this.createImpactEffect(this.ball.x, this.ball.y, 15);
    }
    // 球与挡板
    if (this.ball.y + this.ball.r > this.paddle.y &&
        this.ball.y - this.ball.r < this.paddle.y + this.paddle.h &&
        this.ball.x > this.paddle.x &&
        this.ball.x < this.paddle.x + this.paddle.w) {
      const hitPos = (this.ball.x - this.paddle.x) / this.paddle.w;
      const angle = map(hitPos, 0, 1, -QUARTER_PI, QUARTER_PI);
      this.ball.ySpeed = -abs(this.ball.ySpeed);
      this.ball.xSpeed = 5 * sin(angle);
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
        this.gameState = 'gameover';
      } else {
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
        if (b.hit()) {
          if (random() < this.POWERUP_CHANCE) {
            const powerTypes = ['life', 'expand', 'speedup'];
            this.powerups.push(new Powerup(
              b.x + b.w / 2,
              b.y + b.h / 2,
              random(powerTypes)
            ));
          }
          this.createBrickBreakEffect(b);
        }
        // 碰撞反弹
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
        this.score += 10 * this.level;
        this.lastHitTime = millis();
        break;
      }
    }
  }

  applyPowerup(type) {
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
    if (type === 'life') {
      this.lives++;
    } else if (type === 'expand') {
      this.paddle.w = min(this.paddle.w * 1.3, 180);
      setTimeout(() => {
        if (this.gameState === 'playing') this.paddle.w = 100;
      }, 10000);
    } else if (type === 'speedup') {
      this.ball.xSpeed *= 0.8;
      this.ball.ySpeed *= 0.8;
    }
  }

  createImpactEffect(x, y, size) {
    for (let i = 0; i < 20; i++) {
      this.particles.push(new Particle(
        x, y, random(2, 6), random(1, 4), random(TWO_PI), random(20, 40), color(255, random(150, 255), 0)
      ));
    }
  }

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

  drawUI() {
    fill(255);
    textSize(24);
    textAlign(LEFT);
    text(`分数: ${this.score}`, 20, 30);
    textAlign(RIGHT);
    text(`生命: ${this.lives}`, width - 20, 30);
    textAlign(CENTER);
    text(`等级: ${this.level}`, width / 2, 30);
    if (this.gameState === 'playing' && millis() - this.lastHitTime < 1000) {
      stroke(255, 200);
      strokeWeight(2);
      line(this.ball.x, this.ball.y, this.paddle.x + this.paddle.w / 2, this.paddle.y);
      noStroke();
    }
  }

  handleGameState() {
    const overlay = document.getElementById('game-overlay');
    const title = document.getElementById('overlay-title');
    const message = document.getElementById('overlay-message');
    const startBtn = document.getElementById('start-btn');
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