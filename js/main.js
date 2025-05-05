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

// Entity Classes
class CircuitComponent {
    constructor({ id, type, x, y, properties }) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 60;
        this.properties = properties || {};
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
    }
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        // Draw different shapes based on type
        if (this.type === 'rhythmSource') {
            ctx.beginPath();
            ctx.arc(0, 0, 30, 0, Math.PI * 2);
            ctx.fillStyle = this.properties.color || '#00ff9d';
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.moveTo(-15, -15); ctx.lineTo(15, 15);
            ctx.moveTo(-15, 15); ctx.lineTo(15, -15);
            ctx.stroke();
        } else if (this.type === 'rhythmTarget') {
            ctx.beginPath();
            ctx.arc(0, 0, 30, 0, Math.PI * 2);
            ctx.fillStyle = this.properties.color || '#ff00ff';
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.moveTo(-10, 0); ctx.lineTo(10, 0);
            ctx.moveTo(0, -10); ctx.lineTo(0, 10);
            ctx.stroke();
        } else if (this.type === 'rhythmNode') {
            ctx.beginPath();
            ctx.arc(0, 0, 25, 0, Math.PI * 2);
            ctx.fillStyle = this.properties.color || '#ffcc00';
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }
        ctx.restore();
    }
    containsPoint(x, y) {
        // Simple circle hit test
        const dx = x - this.x;
        const dy = y - this.y;
        const r = this.type === 'rhythmNode' ? 25 : 30;
        return dx * dx + dy * dy <= r * r;
    }
}

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
    
    // Load the first level
    await loadLevel('level01');
    
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

// Drag-and-drop logic
let draggingComponent = null;

function handleMouseDown(event) {
    const { offsetX, offsetY } = getCanvasRelative(event);
    for (let i = gameState.entities.length - 1; i >= 0; i--) {
        const entity = gameState.entities[i];
        if (entity.containsPoint(offsetX, offsetY)) {
            draggingComponent = entity;
            entity.isDragging = true;
            entity.offsetX = offsetX - entity.x;
            entity.offsetY = offsetY - entity.y;
            // Bring to front
            gameState.entities.splice(i, 1);
            gameState.entities.push(entity);
            break;
        }
    }
}

function handleMouseMove(event) {
    if (!draggingComponent) return;
    const { offsetX, offsetY } = getCanvasRelative(event);
    draggingComponent.x = offsetX - draggingComponent.offsetX;
    draggingComponent.y = offsetY - draggingComponent.offsetY;
}

function handleMouseUp(event) {
    if (draggingComponent) {
        draggingComponent.isDragging = false;
        draggingComponent = null;
    }
}

function getCanvasRelative(event) {
    const canvas = document.getElementById('game-canvas');
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (event.touches && event.touches.length) {
        x = event.touches[0].clientX - rect.left;
        y = event.touches[0].clientY - rect.top;
    } else {
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
    }
    // Scale to canvas size
    x *= canvas.width / rect.width;
    y *= canvas.height / rect.height;
    return { offsetX: x, offsetY: y };
}

// Touch events
function handleTouchStart(event) { handleMouseDown(event); }
function handleTouchMove(event) { handleMouseMove(event); event.preventDefault(); }
function handleTouchEnd(event) { handleMouseUp(event); }

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

// Level Loading
async function loadLevel(levelId = 'level01') {
    const res = await fetch(`levels/${levelId}.json`);
    const level = await res.json();
    gameState.entities = [];
    // Add placed components
    for (const comp of level.components) {
        gameState.entities.push(new CircuitComponent(comp));
    }
    // Add available components (place at bottom for drag)
    let x = 100;
    for (const comp of level.availableComponents) {
        gameState.entities.push(new CircuitComponent({
            id: `available-${Math.random()}`,
            type: comp.type,
            x,
            y: 600,
            properties: comp.properties
        }));
        x += 100;
    }
}

// Start game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    init().catch(error => {
        console.error('Failed to initialize game:', error);
    });
});
