class UIManager {
    constructor() {
        this.elements = {};
        this.layer = document.getElementById('ui-layer');
    }
    
    createElement(id, type = 'div', parent = this.layer) {
        const element = document.createElement(type);
        element.id = id;
        parent.appendChild(element);
        this.elements[id] = element;
        return element;
    }
    
    showMenu(menuId) {
        // Show/hide menu logic
    }
    
    updateScore(score) {
        if (!this.elements.score) {
            this.createElement('score');
            this.elements.score.style.position = 'absolute';
            this.elements.score.style.top = '20px';
            this.elements.score.style.right = '20px';
            this.elements.score.style.color = 'white';
            this.elements.score.style.fontFamily = 'Arial';
            this.elements.score.style.fontSize = '24px';
        }
        this.elements.score.textContent = `Score: ${score}`;
    }
}

export const ui = new UIManager();
