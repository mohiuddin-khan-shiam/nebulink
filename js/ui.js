class UIManager {
    constructor() {
        this.elements = {};
        this.layer = document.getElementById('ui-layer');
        this.activeMenus = new Set();
        this.tooltips = new Map();
        this.animations = new Map();
    }
    
    createElement(id, type = 'div', parent = this.layer) {
        const element = document.createElement(type);
        element.id = id;
        element.className = 'ui-element';
        parent.appendChild(element);
        this.elements[id] = element;
        return element;
    }
    
    showMenu(menuId, data = {}) {
        if (!this.elements[menuId]) {
            this.createMenu(menuId, data);
        }
        
        this.elements[menuId].style.display = 'block';
        this.activeMenus.add(menuId);
        
        this.animateElement(this.elements[menuId], 'fadeIn');
    }
    
    hideMenu(menuId) {
        if (this.elements[menuId]) {
            this.animateElement(this.elements[menuId], 'fadeOut', () => {
                this.elements[menuId].style.display = 'none';
                this.activeMenus.delete(menuId);
            });
        }
    }
    
    createMenu(menuId, data) {
        const menu = this.createElement(menuId);
        menu.className = 'game-menu';
        
        switch (menuId) {
            case 'main-menu':
                this.createMainMenu(menu, data);
                break;
            case 'pause-menu':
                this.createPauseMenu(menu, data);
                break;
            case 'settings-menu':
                this.createSettingsMenu(menu, data);
                break;
            case 'tutorial':
                this.createTutorial(menu, data);
                break;
        }
    }
    
    updateHUD(data) {
        this.updateScore(data.score);
        this.updateCombo(data.combo);
        this.updateEnergy(data.energy);
        this.updateLevel(data.level);
    }
    
    updateScore(score) {
        if (!this.elements.score) {
            const scoreElement = this.createElement('score');
            scoreElement.className = 'hud hud-top';
        }
        this.elements.score.textContent = `Score: ${score}`;
    }
    
    updateCombo(combo) {
        if (!this.elements.combo) {
            const comboElement = this.createElement('combo');
            comboElement.className = 'hud hud-top';
        }
        this.elements.combo.textContent = `Combo: ${combo}x`;
        
        if (combo > 1) {
            this.animateElement(this.elements.combo, 'pulse');
        }
    }
    
    updateEnergy(energy) {
        if (!this.elements.energy) {
            const energyElement = this.createElement('energy');
            energyElement.className = 'hud hud-bottom';
        }
        this.elements.energy.textContent = `Energy: ${energy}%`;
        
        const color = energy > 50 ? '#00ff9d' : energy > 25 ? '#ffcc00' : '#ff4444';
        this.elements.energy.style.color = color;
    }
    
    updateLevel(level) {
        if (!this.elements.level) {
            const levelElement = this.createElement('level');
            levelElement.className = 'hud hud-top';
        }
        this.elements.level.textContent = `Level: ${level}`;
    }
    
    showTooltip(element, text) {
        const tooltip = this.createElement('tooltip');
        tooltip.textContent = text;
        tooltip.className = 'tooltip';
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width/2}px`;
        tooltip.style.top = `${rect.bottom + 10}px`;
        
        this.tooltips.set(element, tooltip);
    }
    
    hideTooltip(element) {
        const tooltip = this.tooltips.get(element);
        if (tooltip) {
            tooltip.remove();
            this.tooltips.delete(element);
        }
    }
    
    animateElement(element, animationName, callback) {
        const keyframes = this.getAnimationKeyframes(animationName);
        const options = {
            duration: 300,
            easing: 'ease-out',
            fill: 'forwards'
        };
        
        const animation = element.animate(keyframes, options);
        this.animations.set(element, animation);
        
        animation.onfinish = () => {
            this.animations.delete(element);
            if (callback) callback();
        };
    }
    
    getAnimationKeyframes(animationName) {
        switch (animationName) {
            case 'fadeIn':
                return [
                    { opacity: 0, transform: 'scale(0.95)' },
                    { opacity: 1, transform: 'scale(1)' }
                ];
            case 'fadeOut':
                return [
                    { opacity: 1, transform: 'scale(1)' },
                    { opacity: 0, transform: 'scale(0.95)' }
                ];
            case 'pulse':
                return [
                    { transform: 'scale(1)' },
                    { transform: 'scale(1.2)' },
                    { transform: 'scale(1)' }
                ];
            default:
                return [];
        }
    }
    
    createMainMenu(menu, data) {
        menu.innerHTML = `
            <h1>Intergalactic Jazz Circuit</h1>
            <button class="button" id="start-game">Start Game</button>
            <button class="button" id="settings">Settings</button>
            <button class="button" id="tutorial">Tutorial</button>
        `;
        
        menu.querySelector('#start-game').addEventListener('click', () => {
            this.hideMenu('main-menu');
        });
        
        menu.querySelector('#settings').addEventListener('click', () => {
            this.showMenu('settings-menu');
        });
        
        menu.querySelector('#tutorial').addEventListener('click', () => {
            this.showMenu('tutorial');
        });
    }
    
    createPauseMenu(menu, data) {
        menu.innerHTML = `
            <h2>Game Paused</h2>
            <button class="button" id="resume">Resume</button>
            <button class="button" id="restart">Restart</button>
            <button class="button" id="quit">Quit to Menu</button>
        `;
        
        menu.querySelector('#resume').addEventListener('click', () => {
            this.hideMenu('pause-menu');
        });
    }
    
    createSettingsMenu(menu, data) {
        menu.innerHTML = `
            <h2>Settings</h2>
            <div class="setting">
                <label>Music Volume</label>
                <input type="range" id="music-volume" min="0" max="100" value="50">
            </div>
            <div class="setting">
                <label>Sound Effects</label>
                <input type="range" id="sfx-volume" min="0" max="100" value="50">
            </div>
            <div class="setting">
                <label>Color Blind Mode</label>
                <input type="checkbox" id="colorblind-mode">
            </div>
            <button class="button" id="back">Back</button>
        `;
        
        menu.querySelector('#back').addEventListener('click', () => {
            this.hideMenu('settings-menu');
        });
    }
    
    createTutorial(menu, data) {
        menu.innerHTML = `
            <h2>How to Play</h2>
            <div class="tutorial-content">
                <p>Welcome to Intergalactic Jazz Circuit!</p>
                <p>Place circuit components to create musical patterns.</p>
                <p>Match the rhythm to power your space colony.</p>
            </div>
            <button class="button" id="start-tutorial">Start Tutorial</button>
        `;
        
        menu.querySelector('#start-tutorial').addEventListener('click', () => {
            this.hideMenu('tutorial');
        });
    }
}

export const ui = new UIManager();
