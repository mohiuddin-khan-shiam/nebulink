// Game Constants
const FPS = 60;
const FRAME_TIME = 1000 / FPS;
const BPM = 120; // Base tempo for rhythm game
const BEAT_INTERVAL = 60000 / BPM; // Convert BPM to milliseconds

// Game State
let lastTime = 0;
let accumulator = 0;
let gameState = {
    currentLevel: 1,
    score: 0,
    combo: 0,
    maxCombo: 0,
    player: {
        x: 0,
        y: 0,
        energy: 100,
        instruments: []
    },
    entities: [],
    rhythm: {
        currentBeat: 0,
        totalBeats: 16,
        lastBeatTime: 0,
        isPlaying: false
    },
    ui: {
        showMenu: false,
        showTutorial: true,
        showSettings: false
    }
};

// Audio Context
let audioContext;
let masterGain;

// Main Game Loop
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
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
    if (gameState.rhythm.isPlaying) {
        updateRhythm(deltaTime);
    }
    
    updateEntities(deltaTime);
    checkCollisions();
    updateUI();
}

function updateRhythm(deltaTime) {
    const currentTime = performance.now();
    const timeSinceLastBeat = currentTime - gameState.rhythm.lastBeatTime;
    
    if (timeSinceLastBeat >= BEAT_INTERVAL) {
        gameState.rhythm.currentBeat = (gameState.rhythm.currentBeat + 1) % gameState.rhythm.totalBeats;
        gameState.rhythm.lastBeatTime = currentTime;
        
        // Trigger beat events
        onBeat(gameState.rhythm.currentBeat);
    }
}

function onBeat(beatNumber) {
    // Check for player actions on this beat
    checkPlayerActions(beatNumber);
    
    // Update visual feedback
    updateBeatVisuals(beatNumber);
    
    // Play beat sound
    playBeatSound(beatNumber);
}

function updateEntities(deltaTime) {
    gameState.entities.forEach(entity => {
        if (entity.update) {
            entity.update(deltaTime);
        }
    });
}

function checkCollisions() {
    // Implement collision detection for circuit components
}

function updateUI() {
    // Update HUD elements
    updateHUD();
    
    // Update menus if visible
    if (gameState.ui.showMenu) {
        updateMenu();
    }
    
    if (gameState.ui.showTutorial) {
        updateTutorial();
    }
}

function render() {
    const ctx = getCanvasContext();
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw background
    drawBackground(ctx);
    
    // Draw game entities
    drawEntities(ctx);
    
    // Draw UI elements
    drawUI(ctx);
}

// Canvas setup and rendering
function getCanvasContext() {
    const canvas = document.getElementById('game-canvas');
    return canvas ? canvas.getContext('2d') : null;
}

function drawBackground(ctx) {
    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(1, '#1a0033');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        const size = Math.random() * 2;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawEntities(ctx) {
    // Draw game entities
    gameState.entities.forEach(entity => {
        if (entity.draw) {
            entity.draw(ctx);
        }
    });
}

function drawUI(ctx) {
    // Draw UI elements
    const uiLayer = document.getElementById('ui-layer');
    if (uiLayer) {
        // Update UI elements
        updateScoreDisplay();
        updateComboDisplay();
        updateEnergyDisplay();
    }
}

// UI Updates
function updateScoreDisplay() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = `Score: ${gameState.score}`;
    }
}

function updateComboDisplay() {
    const comboElement = document.getElementById('combo');
    if (comboElement) {
        comboElement.textContent = `Combo: ${gameState.combo}x`;
    }
}

function updateEnergyDisplay() {
    const energyElement = document.getElementById('energy');
    if (energyElement) {
        energyElement.textContent = `Energy: ${gameState.player.energy}%`;
    }
}

// Initialize game
async function init() {
    console.log('Initializing game...');
    
    // Setup canvas
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    setupCanvas(canvas);
    
    // Initialize audio
    try {
        await initAudio();
    } catch (error) {
        console.error('Failed to initialize audio:', error);
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Load saved game state
    loadGameState();
    
    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
    
    // Start game loop
    console.log('Starting game loop...');
    requestAnimationFrame(gameLoop);
}

async function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
}

function setupCanvas(canvas) {
    // Set initial size
    resizeCanvas(canvas);
    
    // Handle window resize
    window.addEventListener('resize', () => resizeCanvas(canvas));
}

function resizeCanvas(canvas) {
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Maintain 16:9 aspect ratio
    const aspectRatio = 16 / 9;
    let width = containerWidth;
    let height = containerWidth / aspectRatio;
    
    if (height > containerHeight) {
        height = containerHeight;
        width = containerHeight * aspectRatio;
    }
    
    canvas.width = width;
    canvas.height = height;
}

function setupEventListeners() {
    // Keyboard controls
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Mouse/Touch controls
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        
        // Touch events
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', handleTouchMove);
        canvas.addEventListener('touchend', handleTouchEnd);
    }
}

function handleKeyDown(event) {
    // Handle keyboard input
    switch(event.key) {
        case ' ':
            // Space bar - activate rhythm
            break;
        case 'p':
        case 'P':
            // P - pause game
            togglePause();
            break;
        case 'm':
        case 'M':
            // M - toggle music
            toggleMusic();
            break;
    }
}

function handleKeyUp(event) {
    // Handle key release
}

function handleMouseDown(event) {
    // Handle mouse click
}

function handleMouseMove(event) {
    // Handle mouse movement
}

function handleMouseUp(event) {
    // Handle mouse release
}

function handleTouchStart(event) {
    // Handle touch start
}

function handleTouchMove(event) {
    // Handle touch move
}

function handleTouchEnd(event) {
    // Handle touch end
}

function togglePause() {
    // Toggle game pause state
}

function toggleMusic() {
    // Toggle music on/off
}

function loadGameState() {
    // Load saved game state from localStorage
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        try {
            const parsedState = JSON.parse(savedState);
            gameState = { ...gameState, ...parsedState };
        } catch (error) {
            console.error('Failed to load game state:', error);
        }
    }
}

// Start game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    init().catch(error => {
        console.error('Failed to initialize game:', error);
    });
});
