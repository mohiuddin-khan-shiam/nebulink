// Game Storage Manager
class GameStorage {
    constructor() {
        this.prefix = 'game_';
        this.defaultSettings = {
            musicVolume: 50,
            sfxVolume: 50,
            colorblindMode: false,
            highScores: [],
            unlockedLevels: [1],
            tutorialCompleted: false
        };
    }
    
    // Basic Storage Operations
    save(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
            return false;
        }
    }
    
    load(key) {
        try {
            const data = localStorage.getItem(this.prefix + key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
            return null;
        }
    }
    
    clear() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .forEach(key => localStorage.removeItem(key));
    }
    
    // Game Settings
    saveSettings(settings) {
        return this.save('settings', {
            ...this.getSettings(),
            ...settings
        });
    }
    
    getSettings() {
        const settings = this.load('settings');
        return settings ? { ...this.defaultSettings, ...settings } : this.defaultSettings;
    }
    
    // High Scores
    saveHighScore(score) {
        const highScores = this.getHighScores();
        highScores.push({
            score,
            date: new Date().toISOString(),
            level: this.getCurrentLevel()
        });
        
        // Sort by score (descending) and keep top 10
        highScores.sort((a, b) => b.score - a.score);
        highScores.splice(10);
        
        return this.save('highScores', highScores);
    }
    
    getHighScores() {
        return this.load('highScores') || [];
    }
    
    // Game Progress
    saveGameState(state) {
        return this.save('gameState', {
            ...state,
            timestamp: Date.now()
        });
    }
    
    getGameState() {
        return this.load('gameState');
    }
    
    // Level Progress
    unlockLevel(levelNumber) {
        const unlockedLevels = this.getUnlockedLevels();
        if (!unlockedLevels.includes(levelNumber)) {
            unlockedLevels.push(levelNumber);
            this.save('unlockedLevels', unlockedLevels);
        }
    }
    
    getUnlockedLevels() {
        return this.load('unlockedLevels') || [1];
    }
    
    setCurrentLevel(level) {
        return this.save('currentLevel', level);
    }
    
    getCurrentLevel() {
        return this.load('currentLevel') || 1;
    }
    
    // Player Stats
    savePlayerStats(stats) {
        return this.save('playerStats', {
            ...this.getPlayerStats(),
            ...stats
        });
    }
    
    getPlayerStats() {
        return this.load('playerStats') || {
            totalScore: 0,
            levelsCompleted: 0,
            playTime: 0,
            instrumentsUnlocked: []
        };
    }
    
    // Tutorial Progress
    setTutorialCompleted(completed = true) {
        return this.save('tutorialCompleted', completed);
    }
    
    isTutorialCompleted() {
        return this.load('tutorialCompleted') || false;
    }
    
    // Export/Import Save Data
    exportSaveData() {
        const saveData = {
            settings: this.getSettings(),
            highScores: this.getHighScores(),
            gameState: this.getGameState(),
            unlockedLevels: this.getUnlockedLevels(),
            playerStats: this.getPlayerStats(),
            tutorialCompleted: this.isTutorialCompleted(),
            version: '1.0.0'
        };
        
        return btoa(JSON.stringify(saveData));
    }
    
    importSaveData(data) {
        try {
            const saveData = JSON.parse(atob(data));
            
            // Validate save data
            if (!saveData.version) {
                throw new Error('Invalid save data format');
            }
            
            // Import all data
            this.saveSettings(saveData.settings);
            this.save('highScores', saveData.highScores);
            this.saveGameState(saveData.gameState);
            this.save('unlockedLevels', saveData.unlockedLevels);
            this.savePlayerStats(saveData.playerStats);
            this.setTutorialCompleted(saveData.tutorialCompleted);
            
            return true;
        } catch (e) {
            console.error('Failed to import save data:', e);
            return false;
        }
    }
    
    // Utility Methods
    hasStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }
    
    getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length;
            }
        }
        return total;
    }
}

export const storage = new GameStorage();
