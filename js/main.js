// Game Constants
const FPS = 60;
const FRAME_TIME = 1000 / FPS;

// Game State
let lastTime = 0;
let accumulator = 0;
let gameState = {
    player: { x: 0, y: 0 },
    entities: []
};

// Main Game Loop
function gameLoop(timestamp) {
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    // Prevent spiral of death
    if (deltaTime > 1000) deltaTime = FRAME_TIME;
    
    accumulator += deltaTime;
    
    while (accumulator >= FRAME_TIME) {
        update(FRAME_TIME);
        accumulator -= FRAME_TIME;
    }
    
    render();
    requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
    // Update game state here
}

function render() {
    // Render game here
}

// Initialize game
function init() {
    const canvas = document.getElementById('game-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Start game when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
