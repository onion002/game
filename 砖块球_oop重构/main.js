// main.js 游戏主入口，负责p5.js主循环和事件绑定
// 这个文件是游戏的入口，包含p5.js的setup、draw等主循环函数
let game; // 全局变量，保存游戏管理器实例

function setup() { // p5.js的setup函数，只会在页面加载时执行一次
  const canvas = createCanvas(800, 600); // 创建画布，大小为800x600像素
  canvas.parent('game-container'); // 将画布插入到页面的#game-container容器中
  canvas.elt.style.borderRadius = '8px'; // 设置画布圆角
  game = new GameManager(); // 创建游戏管理器实例
  game.setup(); // 初始化游戏
  document.getElementById('start-btn').addEventListener('click', () => { // 绑定按钮点击事件
    if (game.gameState === 'start' || game.gameState === 'win' || game.gameState === 'gameover') { // 只有在游戏未开始、胜利或结束时才响应按钮
      if (game.gameState === 'win' || game.gameState === 'gameover') { // 如果是胜利或结束界面
        game.score = 0; // 重置分数
        game.lives = 3; // 重置生命
        game.setup(); // 重新初始化游戏
      }
      game.startGame(); // 开始游戏
    }
  });
}

function draw() { // p5.js的draw函数，每帧自动调用
  game.update(); // 更新游戏状态
  game.draw(); // 绘制游戏画面
}

function keyPressed() { // 监听键盘按下事件
  if (keyCode === 32 && game.gameState === 'start') { // 按下空格键时，如果在开始界面，直接开始游戏
    game.startGame(); // 开始游戏
  }
  if (key === 'r' || key === 'R') { // 按下R键时，如果在胜利或结束界面
    if (game.gameState === 'gameover' || game.gameState === 'win') {
      game.score = 0; // 重置分数
      game.lives = 3; // 重置生命
      game.setup(); // 重新初始化游戏
      game.startGame(); // 开始游戏
    }
  }
} 