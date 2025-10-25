// 游戏常量定义
const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;
const MAX_SPEED = 50;

// 自动检测浏览器语言
function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('zh')) {
        return 'zh';
    } else {
        return 'en';
    }
}

// 语言相关变量
let currentLang = localStorage.getItem('snakeGameLang') || detectBrowserLanguage();
let translations = {};

// 预定义的语言对象
const languages = {
    zh: {
        "gameTitle": "贪吃蛇游戏",
        "score": "分数",
        "highScore": "最高分",
        "startGame": "开始游戏",
        "pauseGame": "暂停",
        "resumeGame": "继续",
        "restartGame": "重新开始",
        "instruction1": "游戏说明：使用方向键控制蛇的移动，吃到食物会变长并获得分数，碰到墙壁或自己的身体游戏结束。",
        "instruction2": "也可以使用WASD键或点击屏幕上的方向按钮控制蛇的移动。",
        "gameOver": "游戏结束",
        "yourScore": "你的分数",
        "playAgain": "再玩一次",
        "close": "关闭",
        "gamePaused": "游戏暂停",
        "continueGame": "继续游戏",
        "language": "语言",
        "chinese": "中文",
        "english": "English",
        "pressSpace": "按空格键暂停/继续"
    },
    en: {
        "gameTitle": "Snake Game",
        "score": "Score",
        "highScore": "High Score",
        "startGame": "Start Game",
        "pauseGame": "Pause",
        "resumeGame": "Resume",
        "restartGame": "Restart",
        "instruction1": "Instructions: Use arrow keys to control the snake's movement. Eat food to grow longer and score points. Game over if you hit the wall or yourself.",
        "instruction2": "You can also use WASD keys or tap the directional buttons on the screen to control the snake.",
        "gameOver": "Game Over",
        "yourScore": "Your Score",
        "playAgain": "Play Again",
        "close": "Close",
        "gamePaused": "Game Paused",
        "continueGame": "Continue Game",
        "language": "Language",
        "chinese": "中文",
        "english": "English",
        "pressSpace": "Press Space to pause/resume"
    }
};

// 获取DOM元素
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const restartButton = document.getElementById('restart-btn');
const directionButtons = document.querySelectorAll('.dir-btn');
const langButton = document.getElementById('lang-btn');
const langDropdown = document.getElementById('lang-dropdown');
const langZhOption = document.getElementById('lang-zh');
const langEnOption = document.getElementById('lang-en');
const gameTitle = document.querySelector('h1');
const instructions = document.querySelectorAll('.instructions p');
const scoreLabel = document.querySelector('.score');
const highScoreLabel = document.querySelector('.high-score');

// 游戏状态变量
let snake = [];
let food = {};
let direction = '';
let nextDirection = '';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let gameSpeed = INITIAL_SPEED;
let isPaused = false;
let isGameOver = false;

// 更新高分显示
highScoreElement.textContent = highScore;

// 加载语言
function loadLanguage(lang) {
    try {
        if (languages[lang]) {
            translations = languages[lang];
            currentLang = lang;
            localStorage.setItem('snakeGameLang', lang);
            document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
            updateUI();
        } else {
            console.error('Language not supported:', lang);
        }
    } catch (error) {
        console.error('Failed to load language:', error);
    }
}

// 更新UI文本
function updateUI() {
    // 更新基本文本
    gameTitle.textContent = translations.gameTitle || '贪吃蛇游戏';
    document.title = translations.gameTitle || '贪吃蛇游戏';
    langButton.textContent = translations.language || '语言';
    startButton.textContent = translations.startGame || '开始游戏';
    pauseButton.textContent = isPaused ? (translations.resumeGame || '继续') : (translations.pauseGame || '暂停');
    restartButton.textContent = translations.restartGame || '重新开始';
    
    // 更新分数标签
    scoreLabel.innerHTML = `${translations.score || '分数'}: <span id="score">${score}</span>`;
    highScoreLabel.innerHTML = `${translations.highScore || '最高分'}: <span id="high-score">${highScore}</span>`;
    
    // 更新说明文字
    if (instructions.length > 0) {
        instructions[0].textContent = translations.instruction1 || '游戏说明：使用方向键控制蛇的移动，吃到食物会变长并获得分数，碰到墙壁或自己的身体游戏结束。';
    }
    if (instructions.length > 1) {
        instructions[1].textContent = translations.instruction2 || '也可以使用WASD键或点击屏幕上的方向按钮控制蛇的移动。';
    }
    
    // 更新游戏结束和暂停覆盖层
    updateOverlayTexts();
}

// 更新覆盖层文本
function updateOverlayTexts() {
    const gameOverOverlay = document.querySelector('.game-over-overlay');
    if (gameOverOverlay) {
        const h2 = gameOverOverlay.querySelector('h2');
        const scoreText = gameOverOverlay.querySelector('p:nth-child(2)');
        const highScoreText = gameOverOverlay.querySelector('p:nth-child(3)');
        const playAgainBtn = gameOverOverlay.querySelector('#play-again-btn');
        const closeBtn = gameOverOverlay.querySelector('#close-game-over-btn');
        
        if (h2) h2.textContent = translations.gameOver || '游戏结束';
        if (scoreText) scoreText.innerHTML = `${translations.yourScore || '你的分数'}: <span id="final-score">${score}</span>`;
        if (highScoreText) highScoreText.innerHTML = `${translations.highScore || '最高分'}: <span>${highScore}</span>`;
        if (playAgainBtn) playAgainBtn.textContent = translations.playAgain || '再玩一次';
        if (closeBtn) closeBtn.textContent = translations.close || '关闭';
    }
    
    const pauseOverlay = document.querySelector('.pause-overlay');
    if (pauseOverlay) {
        const h2 = pauseOverlay.querySelector('h2');
        const resumeBtn = pauseOverlay.querySelector('#resume-btn');
        
        if (h2) h2.textContent = translations.gamePaused || '游戏暂停';
        if (resumeBtn) resumeBtn.textContent = translations.continueGame || '继续游戏';
    }
}

// 初始化游戏
function initGame() {
    // 设置画布大小
    canvas.width = GRID_SIZE * 20;
    canvas.height = GRID_SIZE * 20;
    
    // 重置游戏状态
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    gameSpeed = INITIAL_SPEED;
    isPaused = false;
    isGameOver = false;
    
    // 更新分数显示
    if (scoreElement) {
        scoreElement.textContent = score;
    } else {
        console.error('分数元素未找到');
    }
    
    // 生成第一个食物
    generateFood();
    
    // 渲染初始状态
    draw();
    
    // 更新按钮状态
    updateButtonStates();
    
    // 更新UI文本
    updateUI();
}

// 生成食物
function generateFood() {
    let newFood;
    // 确保食物不会生成在蛇身上
    do {
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / GRID_SIZE)),
            y: Math.floor(Math.random() * (canvas.height / GRID_SIZE))
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    food = newFood;
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        // 蛇头特殊颜色
        if (index === 0) {
            ctx.fillStyle = '#4CAF50';
        } else {
            // 蛇身体颜色渐变
            const brightness = 50 + (index * 5);
            ctx.fillStyle = `rgb(${brightness}, ${brightness + 100}, ${brightness})`;
        }
        
        // 绘制蛇段
        ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
        
        // 为蛇头添加眼睛
        if (index === 0) {
            ctx.fillStyle = 'white';
            // 根据方向调整眼睛位置
            if (direction === 'right') {
                ctx.fillRect(segment.x * GRID_SIZE + 12, segment.y * GRID_SIZE + 4, 3, 3);
                ctx.fillRect(segment.x * GRID_SIZE + 12, segment.y * GRID_SIZE + 12, 3, 3);
            } else if (direction === 'left') {
                ctx.fillRect(segment.x * GRID_SIZE + 4, segment.y * GRID_SIZE + 4, 3, 3);
                ctx.fillRect(segment.x * GRID_SIZE + 4, segment.y * GRID_SIZE + 12, 3, 3);
            } else if (direction === 'up') {
                ctx.fillRect(segment.x * GRID_SIZE + 4, segment.y * GRID_SIZE + 4, 3, 3);
                ctx.fillRect(segment.x * GRID_SIZE + 12, segment.y * GRID_SIZE + 4, 3, 3);
            } else if (direction === 'down') {
                ctx.fillRect(segment.x * GRID_SIZE + 4, segment.y * GRID_SIZE + 12, 3, 3);
                ctx.fillRect(segment.x * GRID_SIZE + 12, segment.y * GRID_SIZE + 12, 3, 3);
            }
        }
    });
    
    // 绘制食物
    ctx.fillStyle = '#FF5252';
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
    
    // 绘制食物的细节
    ctx.fillStyle = '#D32F2F';
    ctx.fillRect(food.x * GRID_SIZE + 4, food.y * GRID_SIZE + 4, 3, 3);
    ctx.fillRect(food.x * GRID_SIZE + 12, food.y * GRID_SIZE + 12, 3, 3);
    ctx.fillRect(food.x * GRID_SIZE + 4, food.y * GRID_SIZE + 12, 3, 3);
    ctx.fillRect(food.x * GRID_SIZE + 12, food.y * GRID_SIZE + 4, 3, 3);
}

// 更新游戏状态
function update() {
    if (isPaused || isGameOver) return;
    
    // 更新方向
    direction = nextDirection;
    
    // 创建新的蛇头
    const head = { ...snake[0] };
    
    // 根据方向移动蛇头
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // 检查碰撞
    // 边界碰撞
    if (head.x < 0 || head.x >= canvas.width / GRID_SIZE || 
        head.y < 0 || head.y >= canvas.height / GRID_SIZE) {
        gameOver();
        return;
    }
    
    // 自身碰撞
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    // 添加新头部
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        if (scoreElement) {
            scoreElement.textContent = score;
        } else {
            console.error('分数元素未找到');
        }
        
        // 更新最高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // 生成新食物
        generateFood();
        
        // 增加游戏速度
        if (gameSpeed > MAX_SPEED) {
            gameSpeed = Math.max(MAX_SPEED, gameSpeed - SPEED_INCREMENT);
            // 重新设置游戏循环以应用新速度
            clearInterval(gameLoop);
            gameLoop = setInterval(gameTick, gameSpeed);
        }
    } else {
        // 如果没吃到食物，移除尾部
        snake.pop();
    }
    
    // 绘制更新后的游戏状态
    draw();
}

// 游戏循环
function gameTick() {
    update();
}

// 添加按钮组样式
function addButtonGroupStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .button-group {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 20px;
        }
        .button-group button {
            padding: 10px 20px;
            font-size: 16px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            background-color: #4CAF50;
            color: white;
            transition: background-color 0.3s;
        }
        .button-group button:hover {
            background-color: #45a049;
        }
        .button-group button:last-child {
            background-color: #f44336;
        }
        .button-group button:last-child:hover {
            background-color: #d32f2f;
        }
    `;
    document.head.appendChild(style);
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    gameLoop = null;
    
    // 更新按钮状态
    updateButtonStates();
    
    // 显示游戏结束消息
    let overlay = document.querySelector('.game-over-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay game-over-overlay';
        const gameOverText = translations.gameOver || '游戏结束';
        const yourScoreText = translations.yourScore || '你的分数';
        const highScoreText = translations.highScore || '最高分';
        const playAgainText = translations.playAgain || '再玩一次';
        const closeText = translations.close || '关闭';
        
        overlay.innerHTML = `
            <div class="overlay-content">
                <h2>${gameOverText}</h2>
                <p>${yourScoreText}: <span id="final-score">${score}</span></p>
                <p>${highScoreText}: <span>${highScore}</span></p>
                <div class="button-group">
                    <button id="play-again-btn">${playAgainText}</button>
                    <button id="close-game-over-btn">${closeText}</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // 添加再玩一次按钮事件
    document.getElementById('play-again-btn').addEventListener('click', () => {
        overlay.classList.remove('active');
        isGameOver = false; // 确保游戏结束标志被重置
        startGame(); // 新的startGame函数会自动调用initGame
    });
        
        // 添加关闭按钮事件
        document.getElementById('close-game-over-btn').addEventListener('click', () => {
            overlay.classList.remove('active');
            isGameOver = false; // 重置游戏结束标志，允许再次开始游戏
            updateButtonStates();
        });
    } else {
        // 更新最终分数
        const finalScoreElement = document.getElementById('final-score');
        if (finalScoreElement) {
            finalScoreElement.textContent = score;
        }
        // 更新覆盖层文本
        updateOverlayTexts();
    }
    
    // 显示覆盖层
    overlay.classList.add('active');
}

// 开始游戏
function startGame(resetGame = true) {
    // 如果需要重置游戏状态，则调用initGame
    if (resetGame) {
        initGame();
    }
    
    if (gameLoop) return;
    
    gameLoop = setInterval(gameTick, gameSpeed);
    isPaused = false;
    
    // 更新按钮状态
    updateButtonStates();
}

// 暂停游戏
function pauseGame() {
    isPaused = !isPaused;
    
    // 更新按钮状态
    updateButtonStates();
    
    // 显示暂停消息
    let overlay = document.querySelector('.pause-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay pause-overlay';
        const gamePausedText = translations.gamePaused || '游戏暂停';
        const continueGameText = translations.continueGame || '继续游戏';
        
        overlay.innerHTML = `
            <div class="overlay-content">
                <h2>${gamePausedText}</h2>
                <button id="resume-btn">${continueGameText}</button>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // 添加继续按钮事件
        document.getElementById('resume-btn').addEventListener('click', () => {
            isPaused = false;
            overlay.classList.remove('active');
            updateButtonStates();
            // 从暂停状态恢复，不需要重置游戏状态
            if (!gameLoop) {
                startGame(false);
            }
        });
    } else if (isPaused) {
        // 更新覆盖层文本
        updateOverlayTexts();
    }
    
    if (isPaused) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

// 更新按钮状态
function updateButtonStates() {
    startButton.disabled = gameLoop !== null && !isGameOver;
    pauseButton.disabled = gameLoop === null || isGameOver;
    restartButton.disabled = gameLoop === null && !isGameOver;
    pauseButton.textContent = isPaused ? (translations.resumeGame || '继续') : (translations.pauseGame || '暂停');
}

// 设置方向
function setDirection(newDirection) {
    // 确保蛇不能直接反向移动
    if (
        (newDirection === 'up' && direction === 'down') ||
        (newDirection === 'down' && direction === 'up') ||
        (newDirection === 'left' && direction === 'right') ||
        (newDirection === 'right' && direction === 'left')
    ) {
        return;
    }
    
    nextDirection = newDirection;
    
    // 如果游戏还没开始，按下方向键就开始游戏
    if (gameLoop === null && !isGameOver) {
        startGame();
    }
}

// 事件监听器
// 键盘控制
function handleKeyDown(event) {
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            event.preventDefault();
            setDirection('up');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            event.preventDefault();
            setDirection('down');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            event.preventDefault();
            setDirection('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            event.preventDefault();
            setDirection('right');
            break;
        case ' ': // 空格键暂停/继续
            event.preventDefault();
            if (gameLoop !== null && !isGameOver) {
                pauseGame();
            }
            break;
    }
}

// 按钮控制
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', pauseGame);
restartButton.addEventListener('click', () => {
    clearInterval(gameLoop);
    gameLoop = null;
    initGame();
    startGame();
});

// 移动端方向按钮控制
directionButtons.forEach(button => {
    button.addEventListener('click', () => {
        setDirection(button.dataset.direction);
    });
});

// 触摸滑动控制（移动端）
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, false);

canvas.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, false);

function handleSwipe() {
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    // 确定哪个方向的移动更大
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // 水平滑动
        if (diffX > 0) {
            setDirection('right');
        } else {
            setDirection('left');
        }
    } else {
        // 垂直滑动
        if (diffY > 0) {
            setDirection('down');
        } else {
            setDirection('up');
        }
    }
}

// 添加语言选择按钮事件监听器
langButton.addEventListener('click', () => {
    langDropdown.classList.toggle('show');
});

// 点击页面其他地方关闭语言下拉菜单
document.addEventListener('click', (e) => {
    if (!langButton.contains(e.target) && !langDropdown.contains(e.target)) {
        langDropdown.classList.remove('show');
    }
});

// 语言选项点击事件
langZhOption.addEventListener('click', () => {
    loadLanguage('zh');
    langZhOption.classList.add('active');
    langEnOption.classList.remove('active');
    langDropdown.classList.remove('show');
});

langEnOption.addEventListener('click', () => {
    loadLanguage('en');
    langEnOption.classList.add('active');
    langZhOption.classList.remove('active');
    langDropdown.classList.remove('show');
});

// 添加键盘事件监听器
window.addEventListener('keydown', handleKeyDown);

// 窗口大小变化时重新调整画布
window.addEventListener('resize', () => {
    // 保持画布比例
    const container = document.querySelector('.game-container');
    const size = Math.min(container.clientWidth, container.clientHeight);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
});

// 初始化游戏并加载语言
function initializeApp() {
    loadLanguage(currentLang);
    // 添加按钮组样式
    addButtonGroupStyles();
    // 设置初始语言选项状态
    if (currentLang === 'zh') {
        langZhOption.classList.add('active');
        langEnOption.classList.remove('active');
    } else {
        langEnOption.classList.add('active');
        langZhOption.classList.remove('active');
    }
    initGame();
}

// 初始化应用
initializeApp();

// 触发一次窗口调整以设置初始画布大小
window.dispatchEvent(new Event('resize'));