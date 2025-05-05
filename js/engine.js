// Game Engine Classes

// Physics and collision detection
class PhysicsEngine {
    constructor() {
        this.gravity = 0.5;
        this.friction = 0.8;
        this.elasticity = 0.5;
    }
    
    update(entity, deltaTime) {
        if (entity.isStatic) return;
        
        // Apply gravity if entity is affected by it
        if (entity.affectedByGravity) {
            entity.velocityY += this.gravity;
        }
        
        // Apply friction
        entity.velocityX *= this.friction;
        entity.velocityY *= this.friction;
        
        // Update position
        entity.x += entity.velocityX * deltaTime;
        entity.y += entity.velocityY * deltaTime;
        
        // Apply boundaries
        this.applyBoundaries(entity);
    }
    
    applyBoundaries(entity) {
        if (entity.x < 0) {
            entity.x = 0;
            entity.velocityX *= -this.elasticity;
        }
        if (entity.x + entity.width > entity.bounds.width) {
            entity.x = entity.bounds.width - entity.width;
            entity.velocityX *= -this.elasticity;
        }
        if (entity.y < 0) {
            entity.y = 0;
            entity.velocityY *= -this.elasticity;
        }
        if (entity.y + entity.height > entity.bounds.height) {
            entity.y = entity.bounds.height - entity.height;
            entity.velocityY *= -this.elasticity;
        }
    }
    
    checkCollision(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }
    
    resolveCollision(a, b) {
        // Calculate collision normal
        const dx = (b.x + b.width/2) - (a.x + a.width/2);
        const dy = (b.y + b.height/2) - (a.y + a.height/2);
        const angle = Math.atan2(dy, dx);
        
        // Calculate relative velocity
        const relativeVelocityX = a.velocityX - b.velocityX;
        const relativeVelocityY = a.velocityY - b.velocityY;
        
        // Calculate impulse
        const impulse = 2 * (relativeVelocityX * Math.cos(angle) + relativeVelocityY * Math.sin(angle)) /
                       (1/a.mass + 1/b.mass);
        
        // Apply impulse
        if (!a.isStatic) {
            a.velocityX -= (impulse * Math.cos(angle)) / a.mass;
            a.velocityY -= (impulse * Math.sin(angle)) / a.mass;
        }
        if (!b.isStatic) {
            b.velocityX += (impulse * Math.cos(angle)) / b.mass;
            b.velocityY += (impulse * Math.sin(angle)) / b.mass;
        }
    }
}

// Rhythm Engine
class RhythmEngine {
    constructor(bpm = 120) {
        this.bpm = bpm;
        this.beatInterval = 60000 / bpm;
        this.currentBeat = 0;
        this.totalBeats = 16;
        this.lastBeatTime = 0;
        this.isPlaying = false;
        this.beatCallbacks = new Map();
    }
    
    start() {
        this.isPlaying = true;
        this.lastBeatTime = performance.now();
    }
    
    stop() {
        this.isPlaying = false;
    }
    
    update(currentTime) {
        if (!this.isPlaying) return;
        
        const timeSinceLastBeat = currentTime - this.lastBeatTime;
        if (timeSinceLastBeat >= this.beatInterval) {
            this.currentBeat = (this.currentBeat + 1) % this.totalBeats;
            this.lastBeatTime = currentTime;
            this.triggerBeatCallbacks();
        }
    }
    
    onBeat(beatNumber, callback) {
        if (!this.beatCallbacks.has(beatNumber)) {
            this.beatCallbacks.set(beatNumber, []);
        }
        this.beatCallbacks.get(beatNumber).push(callback);
    }
    
    triggerBeatCallbacks() {
        const callbacks = this.beatCallbacks.get(this.currentBeat) || [];
        callbacks.forEach(callback => callback());
    }
    
    setBPM(bpm) {
        this.bpm = bpm;
        this.beatInterval = 60000 / bpm;
    }
}

// Circuit Engine
class CircuitEngine {
    constructor() {
        this.components = new Map();
        this.connections = new Set();
    }
    
    addComponent(component) {
        this.components.set(component.id, component);
    }
    
    removeComponent(componentId) {
        this.components.delete(componentId);
        // Remove associated connections
        this.connections.forEach(connection => {
            if (connection.from === componentId || connection.to === componentId) {
                this.connections.delete(connection);
            }
        });
    }
    
    connect(fromId, toId) {
        const connection = { from: fromId, to: toId };
        this.connections.add(connection);
        return connection;
    }
    
    disconnect(fromId, toId) {
        this.connections.forEach(connection => {
            if (connection.from === fromId && connection.to === toId) {
                this.connections.delete(connection);
            }
        });
    }
    
    update() {
        // Update all components
        this.components.forEach(component => {
            if (component.update) {
                component.update();
            }
        });
        
        // Process connections
        this.connections.forEach(connection => {
            const fromComponent = this.components.get(connection.from);
            const toComponent = this.components.get(connection.to);
            
            if (fromComponent && toComponent) {
                toComponent.receiveSignal(fromComponent.getOutput());
            }
        });
    }
}

// Create and export engine instances
export const physics = new PhysicsEngine();
export const rhythm = new RhythmEngine();
export const circuit = new CircuitEngine();
