// Physics and collision detection
class PhysicsEngine {
    constructor() {
        this.gravity = 0.5;
    }
    
    update(entity, deltaTime) {
        // Apply gravity
        entity.velocityY += this.gravity;
        
        // Update position
        entity.x += entity.velocityX * deltaTime;
        entity.y += entity.velocityY * deltaTime;
    }
    
    checkCollision(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }
}

export const physics = new PhysicsEngine();
