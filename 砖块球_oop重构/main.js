// main.js 游戏主入口，负责p5.js主循环和事件绑定
let game;

function setup() {
  const canvas = createCanvas(800, 600);
  canvas.parent('game-container');
  canvas.elt.style.borderRadius = '8px';
  game = new GameManager();
  game.setup();
  // 绑定按钮事件
  document.getElementById('start-btn').addEventListener('click', () => {
    if (game.gameState === 'start' || game.gameState === 'win' || game.gameState === 'gameover') {
      if (game.gameState === 'win' || game.gameState === 'gameover') {
        game.score = 0;
        game.lives = 3;
        game.setup();
      }
      game.startGame();
    }
  });
}

function draw() {
  game.update();
  game.draw();
}

function keyPressed() {
  if (keyCode === 32 && game.gameState === 'start') { // 空格键
    game.startGame();
  }
  if (key === 'r' || key === 'R') {
    if (game.gameState === 'gameover' || game.gameState === 'win') {
      game.score = 0;
      game.lives = 3;
      game.setup();
      game.startGame();
    }
  }
}

window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;