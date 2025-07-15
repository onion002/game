// 游戏常量
// BRICK_ROWS: 砖块的行数
// BRICK_COLS: 砖块的列数
// BRICK_WIDTH: 每个砖块的宽度
// BRICK_HEIGHT: 每个砖块的高度
// BRICK_PADDING: 砖块之间的间距
// BRICK_TOP_MARGIN: 砖块距离顶部的距离
// POWERUP_CHANCE: 砖块被打碎后掉落道具的概率
const BRICK_ROWS = 6; // 砖块行数
const BRICK_COLS = 13; // 砖块列数
const BRICK_WIDTH = 50; // 砖块宽度
const BRICK_HEIGHT = 20; // 砖块高度
const BRICK_PADDING = 10; // 砖块间距
const BRICK_TOP_MARGIN = 50; // 砖块距离顶部的距离
const POWERUP_CHANCE = 0.2; // 20%几率掉落道具

// 游戏对象
// paddle: 挡板对象
// ball: 球对象
// bricks: 砖块数组
// powerups: 道具数组
// particles: 粒子特效数组
// gameState: 游戏状态，'start', 'playing', 'win', 'gameover'
let paddle;
let ball;
let bricks = [];
let powerups = [];
let particles = [];
let gameState = 'start'; // start, playing, win, gameover

// 游戏状态
// score: 当前得分
// lives: 剩余生命值
// level: 当前游戏等级
// lastHitTime: 上次击中砖块的时间
let score = 0;
let lives = 3;
let level = 1;
let lastHitTime = 0;

// 颜色主题
// themes: 游戏主题颜色数组，包含多个主题
// currentTheme: 当前使用的主题索引
const themes = [
  ['#FF5722', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5'],
  ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107'],
  ['#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A']
];
let currentTheme = 0;

function setup() {
  const canvas = createCanvas(800, 600);
  canvas.parent('game-container');
  canvas.elt.style.borderRadius = '8px';
  
  resetGame();
  
  // 添加开始按钮事件
  document.getElementById('start-btn').addEventListener('click', startGame);
}

function draw() {
  background(0);
  
  // 更新和渲染游戏元素
  updatePaddle();
  updateBall();
  updatePowerups();
  updateParticles();
  renderBricks();
  
  // 绘制UI
  drawUI();
  
  // 处理游戏状态
  handleGameState();
}

// 重置游戏
// 重新设置挡板、球、砖块、道具和粒子特效
function resetGame() {
  paddle = {
    x: width / 2 - 50,
    y: height - 30,
    w: 100,
    h: 15,
    speed: 8
  };
  
  ball = {
    x: width / 2,
    y: height / 2,
    r: 10,
    xSpeed: 0,
    ySpeed: 0
  };
  
  bricks = [];
  powerups = [];
  particles = [];
  
  createBricks();
  
  lastHitTime = millis();
}

// 创建砖块
// 根据当前等级和砖块类型创建砖块
function createBricks() {
  for (let c = 0; c < BRICK_COLS; c++) {
    for (let r = 0; r < BRICK_ROWS; r++) {
      const brickType = level > 3 ? floor(random(1, 4)) : 1;
      
      bricks.push({
        x: c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_PADDING,
        y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_TOP_MARGIN,
        w: BRICK_WIDTH,
        h: BRICK_HEIGHT,
        status: 1, // 1: 正常, 0: 被摧毁
        type: brickType,
        hitCount: brickType
      });
    }
  }
}

// 开始游戏
// 初始化游戏状态，设置球的速度
function startGame() {
  gameState = 'playing';
  ball.xSpeed = random([-4, 4]);
  ball.ySpeed = -4;
  
  const overlay = document.getElementById('game-overlay');
  overlay.style.opacity = 0;
  overlay.style.pointerEvents = 'none';
}

// 更新挡板
// 根据左右方向键移动挡板，并绘制带光泽的挡板
function updatePaddle() {
  // 使用左右方向键移动挡板
  if (keyIsDown(LEFT_ARROW) && paddle.x > 0) {
    paddle.x -= paddle.speed;
  }
  if (keyIsDown(RIGHT_ARROW) && paddle.x < width - paddle.w) {
    paddle.x += paddle.speed;
  }
  
  // 绘制带光泽的挡板
  fill('#2196F3');
  rect(paddle.x, paddle.y, paddle.w, paddle.h, 7);
  
  // 挡板光泽效果
  fill('rgba(255, 255, 255, 0.3)');
  rect(paddle.x + 5, paddle.y + 2, paddle.w * 0.8, 4, 2);
}

// 更新球
// 移动球，处理球与边界和挡板的碰撞
function updateBall() {
  if (gameState !== 'playing') return;
  
  // 移动球
  ball.x += ball.xSpeed;
  ball.y += ball.ySpeed;
  
  // 球碰到左右边界反弹
  if (ball.x - ball.r < 0 || ball.x + ball.r > width) {
    ball.xSpeed *= -1;
    createImpactEffect(ball.x, ball.y, 15);
  }
  
  // 球碰到顶部反弹
  if (ball.y - ball.r < 0) {
    ball.ySpeed *= -1;
    createImpactEffect(ball.x, ball.y, 15);
  }
  
  // 球碰到挡板反弹
  if (ball.y + ball.r > paddle.y && 
      ball.y - ball.r < paddle.y + paddle.h &&
      ball.x > paddle.x && 
      ball.x < paddle.x + paddle.w) {
    
    // 计算反弹角度（基于击中挡板的位置）
    const hitPos = (ball.x - paddle.x) / paddle.w;
    const angle = map(hitPos, 0, 1, -QUARTER_PI, QUARTER_PI);
    
    ball.ySpeed = -abs(ball.ySpeed); // 确保向上反弹
    ball.xSpeed = 5 * sin(angle);
    
    // 增加难度（随着游戏进行球速加快）
    //const speedBoost = min(level * 0.2, 1.5);
    //ball.xSpeed *= (1 + speedBoost);
    //ball.ySpeed *= (1 + speedBoost);
    
    createImpactEffect(ball.x, ball.y, 30);
    lastHitTime = millis();
  }
  
  // 球掉到底部
  if (ball.y - ball.r > height) {
    lives--;
    createImpactEffect(ball.x, height, 50);
    
    if (lives <= 0) {
      gameState = 'gameover';
    } else {
      // 重置球的位置
      ball.x = width / 2;
      ball.y = height / 2;
      ball.xSpeed = 0;
      ball.ySpeed = 0;
      
      // 短暂暂停后继续游戏
      setTimeout(() => {
        if (gameState === 'playing') {
          ball.xSpeed = random([-4, 4]);
          ball.ySpeed = -4;
        }
      }, 1000);
    }
  }
  
  // 绘制带高光的球
  fill('#FFEB3B');
  ellipse(ball.x, ball.y, ball.r * 2);
  
  // 球的高光效果
  fill('rgba(255, 255, 255, 0.8)');
  ellipse(ball.x - ball.r * 0.3, ball.y - ball.r * 0.3, ball.r * 0.7);
}

// 渲染砖块
// 根据砖块状态和类型绘制砖块，包括3D效果、边框和光泽
function renderBricks() {
  bricks.forEach(brick => {
    if (brick.status === 1) {
      // 根据砖块类型设置颜色
      const color = themes[currentTheme][min(brick.type - 1, themes[0].length - 1)];
      
      // 3D效果砖块
      fill(color);
      rect(brick.x, brick.y, brick.w, brick.h, 4);
      
      // 砖块边框
      stroke(0);
      strokeWeight(1);
      noFill();
      rect(brick.x, brick.y, brick.w, brick.h, 4);
      noStroke();
      
      // 砖块光泽效果
      fill('rgba(255, 255, 255, 0.2)');
      rect(brick.x + 2, brick.y + 2, brick.w - 4, brick.h * 0.4, 2);
    }
  });
}

// 更新道具
// 更新道具的位置，检测与挡板的碰撞，并绘制道具
function updatePowerups() {
  // 更新道具位置
  for (let i = powerups.length - 1; i >= 0; i--) {
    powerups[i].y += 2;
    
    // 检测挡板接住道具
    if (powerups[i].y + 10 > paddle.y && 
        powerups[i].x > paddle.x && 
        powerups[i].x < paddle.x + paddle.w) {
      applyPowerup(powerups[i].type);
      powerups.splice(i, 1);
      continue;
    }
    
    // 道具掉出屏幕
    if (powerups[i].y > height) {
      powerups.splice(i, 1);
      continue;
    }
    
    // 绘制道具
    const typeColors = {
      'life': '#FF5252', 
      'expand': '#4CAF50', 
      'speedup': '#FFC107'
    };
    
    fill(typeColors[powerups[i].type] || '#9C27B0');
    ellipse(powerups[i].x, powerups[i].y, 20);
    
    // 道具图标
    fill(255);
    textSize(14);
    textAlign(CENTER, CENTER);
    if (powerups[i].type === 'life') {
      text('❤', powerups[i].x, powerups[i].y - 1);
    } else if (powerups[i].type === 'expand') {
      text('↔', powerups[i].x, powerups[i].y);
    } else {
      text('⚡', powerups[i].x, powerups[i].y);
    }
  }
}

// 应用道具效果
// 根据道具类型应用效果，并生成特效粒子
function applyPowerup(type) {
  // 特效粒子
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: paddle.x + paddle.w/2,
      y: paddle.y,
      size: random(3, 8),
      speed: random(1, 5),
      angle: random(TWO_PI),
      life: 60,
      color: type === 'life' ? '#FF5252' : 
             type === 'expand' ? '#4CAF50' : '#FFC107'
    });
  }
  
  if (type === 'life') {
    lives++;
  } else if (type === 'expand') {
    // 扩大挡板
    paddle.w = min(paddle.w * 1.3, 180);
    
    // 30秒后恢复
    setTimeout(() => {
      if (gameState === 'playing') paddle.w = 100;
    }, 10000);
  } else if (type === 'speedup') {
    // 球减速
    ball.xSpeed *= 0.8;
    ball.ySpeed *= 0.8;
  }
}

// 更新粒子特效
// 更新粒子特效的位置和生命周期，并绘制
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].x += cos(particles[i].angle) * particles[i].speed;
    particles[i].y += sin(particles[i].angle) * particles[i].speed;
    particles[i].life--;
    
    if (particles[i].life <= 0) {
      particles.splice(i, 1);
    } else {
      fill(particles[i].color);
      noStroke();
      ellipse(particles[i].x, particles[i].y, particles[i].size);
    }
  }
}

// 绘制UI
// 绘制分数、生命值、等级和连线效果
function drawUI() {
  // 绘制分数和生命值
  fill(255);
  textSize(24);
  textAlign(LEFT);
  text(`分数: ${score}`, 20, 30);
  textAlign(RIGHT);
  text(`生命: ${lives}`, width - 20, 30);
  
  // 绘制等级
  textAlign(CENTER);
  text(`等级: ${level}`, width / 2, 30);
  
  // 连线效果（最后击球时间）
  if (gameState === 'playing' && millis() - lastHitTime < 1000) {
    stroke(255, 200);
    strokeWeight(2);
    line(ball.x, ball.y, paddle.x + paddle.w/2, paddle.y);
    noStroke();
  }
}

// 处理游戏状态
// 根据当前游戏状态更新游戏元素，处理碰撞，更新分数和生命值
function handleGameState() {
  const overlay = document.getElementById('game-overlay');
  const title = document.getElementById('overlay-title');
  const message = document.getElementById('overlay-message');
  const startBtn = document.getElementById('start-btn');
  
  // 检测胜利
  const bricksLeft = bricks.filter(b => b.status === 1).length;
  if (bricksLeft === 0 && gameState === 'playing') {
    gameState = 'win';
  }
  
  switch (gameState) {
    case 'start':
      overlay.style.opacity = 1;
      overlay.style.pointerEvents = 'all';
      title.textContent = `打砖块 - 等级 ${level}`;
      message.textContent = '使用← →键移动挡板，按空格键发射球';
      startBtn.textContent = '开始游戏';
      break;
      
    case 'playing':
      // 处理球与砖块碰撞
      for (let i = bricks.length - 1; i >= 0; i--) {
        if (bricks[i].status === 1 && 
            ball.x + ball.r > bricks[i].x && 
            ball.x - ball.r < bricks[i].x + bricks[i].w &&
            ball.y + ball.r > bricks[i].y && 
            ball.y - ball.r < bricks[i].y + bricks[i].h) {
          
          // 减少砖块的耐久度
          bricks[i].hitCount--;
          
          if (bricks[i].hitCount <= 0) {
            bricks[i].status = 0;
            
            // 随机掉落道具
            if (random() < POWERUP_CHANCE) {
              const powerTypes = ['life', 'expand', 'speedup'];
              powerups.push({
                x: bricks[i].x + bricks[i].w/2,
                y: bricks[i].y + bricks[i].h/2,
                type: random(powerTypes)
              });
            }
            
            // 创建砖块破碎特效
            createBrickBreakEffect(bricks[i]);
          }
          
          // 确定碰撞方向并反弹
          const hitFromLeft = ball.x < bricks[i].x;
          const hitFromRight = ball.x > bricks[i].x + bricks[i].w;
          const hitFromTop = ball.y < bricks[i].y;
          const hitFromBottom = ball.y > bricks[i].y + bricks[i].h;
          
          if (hitFromLeft || hitFromRight) {
            ball.xSpeed *= -1;
          }
          if (hitFromTop || hitFromBottom) {
            ball.ySpeed *= -1;
          }
          
          // 更新分数
          score += 10 * level;
          lastHitTime = millis();
          break;
        }
      }
      break;
      
    case 'win':
      overlay.style.opacity = 1;
      overlay.style.pointerEvents = 'all';
      title.textContent = '胜利!';
      message.textContent = `你已完成等级 ${level}! 得分: ${score}`;
      startBtn.textContent = '下一关';
      
      // 增加等级
      level++;
      currentTheme = (currentTheme + 1) % themes.length;
      break;
      
    case 'gameover':
      overlay.style.opacity = 1;
      overlay.style.pointerEvents = 'all';
      title.textContent = '游戏结束';
      message.textContent = `最终得分: ${score}`;
      startBtn.textContent = '重新开始';
      level = 1;
      break;
  }
}

// 创建碰撞特效
// 在击中点生成粒子特效
function createImpactEffect(x, y, size) {
  for (let i = 0; i < 20; i++) {
    particles.push({
      x: x,
      y: y,
      size: random(2, 6),
      speed: random(1, 4),
      angle: random(TWO_PI),
      life: random(20, 40),
      color: color(255, random(150, 255), 0)
    });
  }
}

// 创建砖块破碎特效
// 在砖块破碎时生成多个粒子特效
function createBrickBreakEffect(brick) {
  const fragmentCount = 15;
  const fragmentColors = [
    color(255, 100, 100),
    color(255, 150, 100),
    color(255, 200, 100)
  ];
  
  for (let i = 0; i < fragmentCount; i++) {
    particles.push({
      x: brick.x + brick.w/2,
      y: brick.y + brick.h/2,
      size: random(6, 12),
      speed: random(1, 6),
      angle: random(TWO_PI),
      life: random(40, 80),
      color: fragmentColors[i % fragmentColors.length]
    });
  }
}

// 键盘事件
// 监听键盘输入，处理开始游戏、重置游戏和游戏状态
function keyPressed() {
  if (keyCode === 32 && gameState === 'start') { // 空格键
    startGame();
  }
  
  if (key === 'r' || key === 'R') {
    // 重置游戏
    if (gameState === 'gameover' || gameState === 'win') {
      score = 0;
      lives = 3;
      resetGame();
      startGame();
    }
  }
}
