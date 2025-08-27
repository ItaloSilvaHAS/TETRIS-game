// Main Renderer Process - UI Management and Event Handling
class TetrisApp {
    constructor() {
        this.gameRenderer = null;
        this.settings = {
            musicVolume: 50,
            sfxVolume: 70,
            startingLevel: 1
        };
        
        this.init();
    }
    
    init() {
        // Load settings
        this.loadSettings();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup high scores display
        this.updateHighScoresDisplay();
        
        // Initialize game renderer
        this.gameRenderer = new GameRenderer();
        this.gameRenderer.onGameOver = this.onGameOver.bind(this);
        this.gameRenderer.updateUI = this.updateGameUI.bind(this);
        
        // Set global reference
        window.gameInstance = this.gameRenderer;
        
        console.log('Tetris app initialized');
    }
    
    setupEventListeners() {
        // Main menu buttons
        document.getElementById('startGame').addEventListener('click', () => {
            this.startNewGame();
        });
        
        document.getElementById('showSettings').addEventListener('click', () => {
            this.showScreen('settingsMenu');
        });
        
        document.getElementById('showHighScores').addEventListener('click', () => {
            this.updateHighScoresDisplay();
            this.showScreen('highScoresScreen');
        });
        
        document.getElementById('quitGame').addEventListener('click', () => {
            this.quitGame();
        });
        
        // Settings menu
        document.getElementById('backToMain').addEventListener('click', () => {
            this.saveSettings();
            this.showScreen('mainMenu');
        });
        
        // Settings controls
        const musicVolumeSlider = document.getElementById('musicVolume');
        const sfxVolumeSlider = document.getElementById('sfxVolume');
        const startingLevelSelect = document.getElementById('startingLevel');
        
        musicVolumeSlider.addEventListener('input', (e) => {
            this.settings.musicVolume = parseInt(e.target.value);
            document.getElementById('musicVolumeValue').textContent = e.target.value + '%';
        });
        
        sfxVolumeSlider.addEventListener('input', (e) => {
            this.settings.sfxVolume = parseInt(e.target.value);
            document.getElementById('sfxVolumeValue').textContent = e.target.value + '%';
        });
        
        startingLevelSelect.addEventListener('change', (e) => {
            this.settings.startingLevel = parseInt(e.target.value);
        });
        
        // Game controls
        document.getElementById('resumeGame').addEventListener('click', () => {
            this.gameRenderer.pauseGame();
        });
        
        document.getElementById('backToMainFromPause').addEventListener('click', () => {
            this.gameRenderer.stopGame();
            this.showScreen('mainMenu');
        });
        
        // Game over screen
        document.getElementById('playAgain').addEventListener('click', () => {
            this.startNewGame();
        });
        
        document.getElementById('backToMainFromGameOver').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
        
        // High scores screen
        document.getElementById('backToMainFromHighScores').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // ESC to pause or return to menu
            if (e.key === 'Escape') {
                if (this.isGameScreenActive()) {
                    this.gameRenderer.pauseGame();
                } else if (!this.isMainMenuActive()) {
                    this.showScreen('mainMenu');
                }
            }
            
            // Enter to start game from main menu
            if (e.key === 'Enter' && this.isMainMenuActive()) {
                this.startNewGame();
            }
        });
        
        // Handle Electron menu events
        if (typeof require !== 'undefined') {
            const { ipcRenderer } = require('electron');
            
            ipcRenderer.on('new-game', () => {
                this.startNewGame();
            });
            
            ipcRenderer.on('toggle-pause', () => {
                if (this.gameRenderer && this.isGameScreenActive()) {
                    this.gameRenderer.pauseGame();
                }
            });
        }
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('tetrisSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.log('Could not load settings:', e);
        }
        
        // Apply settings to UI
        this.applySettingsToUI();
    }
    
    saveSettings() {
        try {
            localStorage.setItem('tetrisSettings', JSON.stringify(this.settings));
        } catch (e) {
            console.log('Could not save settings:', e);
        }
    }
    
    applySettingsToUI() {
        document.getElementById('musicVolume').value = this.settings.musicVolume;
        document.getElementById('musicVolumeValue').textContent = this.settings.musicVolume + '%';
        
        document.getElementById('sfxVolume').value = this.settings.sfxVolume;
        document.getElementById('sfxVolumeValue').textContent = this.settings.sfxVolume + '%';
        
        document.getElementById('startingLevel').value = this.settings.startingLevel;
    }
    
    startNewGame() {
        this.showScreen('gameScreen');
        
        // Apply starting level setting
        if (this.gameRenderer) {
            this.gameRenderer.tetris.level = this.settings.startingLevel;
            this.gameRenderer.startGame();
        }
    }
    
    onGameOver(score, level, lines) {
        // This is called by the game renderer when game ends
        setTimeout(() => {
            this.updateHighScoresDisplay();
        }, 100);
    }
    
    updateGameUI(stats) {
        // Update the game UI elements
        document.getElementById('score').textContent = stats.score.toLocaleString();
        document.getElementById('level').textContent = stats.level;
        document.getElementById('lines').textContent = stats.lines;
    }
    
    updateHighScoresDisplay() {
        const highScoresList = document.getElementById('highScoresList');
        const scores = this.getHighScores();
        
        if (scores.length === 0) {
            highScoresList.innerHTML = '<div class="high-score-item"><div>No high scores yet!</div></div>';
            return;
        }
        
        let html = '';
        scores.forEach((score, index) => {
            html += `
                <div class="high-score-item">
                    <span class="score-rank">${index + 1}</span>
                    <div class="score-details">
                        <div class="score-value">${score.score.toLocaleString()}</div>
                        <div class="score-info">Level ${score.level} • ${score.lines} lines</div>
                    </div>
                    <span class="score-date">${score.date}</span>
                </div>
            `;
        });
        
        highScoresList.innerHTML = html;
    }
    
    getHighScores() {
        try {
            const scores = localStorage.getItem('tetrisHighScores');
            return scores ? JSON.parse(scores) : [];
        } catch (e) {
            return [];
        }
    }
    
    showScreen(screenId) {
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
        
        // Update pause overlay when showing game screen
        if (screenId === 'gameScreen' && this.gameRenderer) {
            this.gameRenderer.updatePauseOverlay();
        }
    }
    
    isGameScreenActive() {
        return document.getElementById('gameScreen').classList.contains('active');
    }
    
    isMainMenuActive() {
        return document.getElementById('mainMenu').classList.contains('active');
    }
    
    quitGame() {
        if (typeof require !== 'undefined') {
            const { remote } = require('electron');
            if (remote && remote.app) {
                remote.app.quit();
            }
        } else {
            // Fallback for non-Electron environments
            window.close();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tetrisApp = new TetrisApp();
});

// Handle window focus/blur for auto-pause
window.addEventListener('blur', () => {
    if (window.gameInstance && window.gameInstance.tetris.gameRunning && !window.gameInstance.tetris.paused) {
        window.gameInstance.pauseGame();
    }
});

// Additional utility functions
window.addEventListener('beforeunload', () => {
    if (window.tetrisApp) {
        window.tetrisApp.saveSettings();
    }
});

// Performance monitoring (development only)
if (process.env.NODE_ENV === 'development') {
    let frameCount = 0;
    let lastFPSUpdate = 0;
    
    function updateFPS() {
        frameCount++;
        const now = performance.now();
        
        if (now - lastFPSUpdate >= 1000) {
            console.log('FPS:', frameCount);
            frameCount = 0;
            lastFPSUpdate = now;
        }
        
        requestAnimationFrame(updateFPS);
    }
    
    requestAnimationFrame(updateFPS);
}
