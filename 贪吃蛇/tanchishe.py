import pygame
import random
import sys

# ======================
# 游戏全局配置类 (封装常量)
# ======================
class GameConfig:
    # 使用常量避免魔法数字，便于统一修改
    SCREEN_WIDTH = 800
    SCREEN_HEIGHT = 600
    GRID_SIZE = 20  # 网格大小（蛇身和食物的尺寸）
    RENDER_FPS = 60      # 画面刷新帧率
    SNAKE_SPEED = 10     # 蛇每秒移动多少次
    
    # 颜色配置（RGB元组）
    COLORS = {
        "BLACK": (0, 0, 0),
        "WHITE": (255, 255, 255),
        "RED": (255, 0, 0),
        "GREEN": (0, 255, 0),
        "BLUE": (0, 120, 255),
        "GOLD": (255, 215, 0)
    }

# ======================
# 蛇类（核心对象）
# ======================
class Snake:
    def __init__(self):
        """初始化蛇的状态"""
        # 蛇身由坐标列表表示，每个元素是(x, y)网格坐标
        self.body = [
            (GameConfig.SCREEN_WIDTH // 2, GameConfig.SCREEN_HEIGHT // 2),
            (GameConfig.SCREEN_WIDTH // 2 - GameConfig.GRID_SIZE, GameConfig.SCREEN_HEIGHT // 2),
            (GameConfig.SCREEN_WIDTH // 2 - 2 * GameConfig.GRID_SIZE, GameConfig.SCREEN_HEIGHT // 2)
        ]
        self.direction = (1, 0)  # 初始向右移动 (x方向+1, y方向不变)
        self.grow = False         # 标记是否需要增长（吃到食物时触发）
        self.color = GameConfig.COLORS["GREEN"]
    
    def move(self):
        """移动蛇：在头部添加新位置，根据grow标志决定是否删除尾部"""
        # 1. 计算新头部位置（当前头部坐标 + 方向向量 * 网格尺寸）
        head_x, head_y = self.body[0]
        new_x = head_x + self.direction[0] * GameConfig.GRID_SIZE
        new_y = head_y + self.direction[1] * GameConfig.GRID_SIZE
        
        # 2. 边界穿越（从左边穿到右边，右边穿到左边，上下同理）
        new_x %= GameConfig.SCREEN_WIDTH
        new_y %= GameConfig.SCREEN_HEIGHT
        
        # 3. 在列表头部插入新位置
        self.body.insert(0, (new_x, new_y))
        
        # 4. 如果不需要增长，则删除尾部位置
        if not self.grow:
            self.body.pop()
        else:
            self.grow = False  # 重置增长标志
    
    def change_direction(self, new_direction):
        """改变移动方向（避免180度转向）"""
        # 禁止直接反向（例如：向右移动时不能直接改为向左）
        if (new_direction[0] * -1, new_direction[1] * -1) != self.direction:
            self.direction = new_direction
    
    def check_collision(self):
        """检查是否撞到自己（头部与身体其他部分重叠）"""
        head = self.body[0]
        return head in self.body[1:]  # 头部出现在身体其他部分即碰撞
    
    def eat_food(self, food):
        """检查是否吃到食物（头部与食物位置重合）"""
        return self.body[0] == food.position
    
    def draw(self, surface):
        """绘制蛇身（头部用不同颜色）"""
        for i, pos in enumerate(self.body):
            # 头部用金色，身体用绿色
            color = GameConfig.COLORS["GOLD"] if i == 0 else self.color
            rect = pygame.Rect(pos[0], pos[1], GameConfig.GRID_SIZE, GameConfig.GRID_SIZE)
            pygame.draw.rect(surface, color, rect)
            pygame.draw.rect(surface, GameConfig.COLORS["BLACK"], rect, 1)  # 黑色边框

# ======================
# 食物类（独立对象）
# ======================
class Food:
    def __init__(self, snake_body):
        """初始化食物位置（确保不在蛇身上）"""
        self.position = self.generate_position(snake_body)
        self.color = GameConfig.COLORS["RED"]
    
    def generate_position(self, snake_body):
        """生成随机位置（避开蛇身）"""
        while True:
            # 1. 在网格坐标范围内生成随机位置
            x = random.randrange(0, GameConfig.SCREEN_WIDTH, GameConfig.GRID_SIZE)
            y = random.randrange(0, GameConfig.SCREEN_HEIGHT, GameConfig.GRID_SIZE)
            new_pos = (x, y)
            
            # 2. 确保食物不会出现在蛇身上
            if new_pos not in snake_body:
                return new_pos
    
    def draw(self, surface):
        """绘制食物（红色方块）"""
        rect = pygame.Rect(self.position[0], self.position[1], GameConfig.GRID_SIZE, GameConfig.GRID_SIZE)
        pygame.draw.rect(surface, self.color, rect)
        pygame.draw.rect(surface, GameConfig.COLORS["BLACK"], rect, 1)  # 黑色边框

# ======================
# 游戏主控制器类
# ======================
class GameController:
    def __init__(self):
        """初始化游戏引擎和对象"""
        pygame.init()
        self.screen = pygame.display.set_mode((GameConfig.SCREEN_WIDTH, GameConfig.SCREEN_HEIGHT))
        pygame.display.set_caption("OOP贪吃蛇")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.SysFont(None, 36)
        
        # 创建游戏对象
        self.snake = Snake()
        self.food = Food(self.snake.body)
        self.score = 0
        self.game_over = False
        
        # 蛇移动计时器
        self.snake_move_interval = 1000 // GameConfig.SNAKE_SPEED  # 毫秒
        self.last_move_time = pygame.time.get_ticks()
    
    def handle_events(self):
        """处理用户输入事件"""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            
            # 键盘方向键控制
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_UP:
                    self.snake.change_direction((0, -1))  # 上
                elif event.key == pygame.K_DOWN:
                    self.snake.change_direction((0, 1))   # 下
                elif event.key == pygame.K_LEFT:
                    self.snake.change_direction((-1, 0)) # 左
                elif event.key == pygame.K_RIGHT:
                    self.snake.change_direction((1, 0))   # 右
                elif event.key == pygame.K_r and self.game_over:
                    self.__init__()  # 重置游戏
    
    def update(self):
        """更新游戏状态（非游戏结束时调用）"""
        if not self.game_over:
            now = pygame.time.get_ticks()
            if now - self.last_move_time >= self.snake_move_interval:
                self.snake.move()
                self.last_move_time = now

                # 碰撞检测
                if self.snake.check_collision():
                    self.game_over = True

                # 吃到食物逻辑
                if self.snake.eat_food(self.food):
                    self.snake.grow = True
                    self.score += 10
                    self.food = Food(self.snake.body)  # 生成新食物
    
    def draw(self):
        """绘制整个游戏画面"""
        self.screen.fill(GameConfig.COLORS["BLACK"])
        
        # 绘制网格线（辅助观察）
        for x in range(0, GameConfig.SCREEN_WIDTH, GameConfig.GRID_SIZE):
            pygame.draw.line(self.screen, (50, 50, 50), (x, 0), (x, GameConfig.SCREEN_HEIGHT))
        for y in range(0, GameConfig.SCREEN_HEIGHT, GameConfig.GRID_SIZE):
            pygame.draw.line(self.screen, (50, 50, 50), (0, y), (GameConfig.SCREEN_WIDTH, y))
        
        # 绘制游戏对象
        self.food.draw(self.screen)
        self.snake.draw(self.screen)
        
        # 绘制分数
        score_text = self.font.render(f"分数: {self.score}", True, GameConfig.COLORS["WHITE"])
        self.screen.blit(score_text, (10, 10))
        
        # 绘制FPS
        fps = int(self.clock.get_fps())
        fps_text = self.font.render(f"FPS: {fps}", True, GameConfig.COLORS["WHITE"])
        self.screen.blit(fps_text, (10, 40))
        
        # 游戏结束提示
        if self.game_over:
            game_over_text = self.font.render("游戏结束! 按R键重新开始", True, GameConfig.COLORS["RED"])
            self.screen.blit(game_over_text, (GameConfig.SCREEN_WIDTH // 2 - 180, GameConfig.SCREEN_HEIGHT // 2))
        
        pygame.display.flip()
    
    def run(self):
        """游戏主循环"""
        while True:
            self.handle_events()
            self.update()
            self.draw()
            self.clock.tick(GameConfig.RENDER_FPS)

# ======================
# 程序入口
# ======================
if __name__ == "__main__":
    game = GameController()
    game.run()