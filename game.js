// Game Renderer and Manager
class GameRenderer {
    constructor() {
        this.tetris = new TetrisGame();
        this.canvas = null;
        this.ctx = null;
        this.nextCanvas = null;
        this.nextCtx = null;
        this.lastTime = 0;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        // Get canvas elements
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextPieceCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        // Set up canvas properties
        this.setupCanvas();
        
        // Set up keyboard controls
        this.setupControls();
        
        // Initial render
        this.render();
    }
    
    setupCanvas() {
        // Enable image smoothing for better visuals
        this.ctx.imageSmoothingEnabled = true;
        this.nextCtx.imageSmoothingEnabled = true;
        
        // Set line styles
        this.ctx.lineWidth = 1;
        this.nextCtx.lineWidth = 1;
    }
    
    setupControls() {
        let keys = {};
        let keyRepeatDelay = 150;
        let keyRepeatRate = 50;
        let keyTimers = {};
        
        document.addEventListener('keydown', (e) => {
            const key = e.code || e.key;
            
            // Prevent default for game keys
            if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space', 'KeyP'].includes(key)) {
                e.preventDefault();
            }
            
            if (!keys[key]) {
                keys[key] = true;
                this.handleKeyPress(key);
                
                // Set up key repeat for movement keys
                if (['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(key)) {
                    keyTimers[key] = setTimeout(() => {
                        keyTimers[key] = setInterval(() => {
                            if (keys[key]) {
                                this.handleKeyPress(key);
                            }
                        }, keyRepeatRate);
                    }, keyRepeatDelay);
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const key = e.code || e.key;
            keys[key] = false;
            
            // Clear key repeat timer
            if (keyTimers[key]) {
                clearTimeout(keyTimers[key]);
                clearInterval(keyTimers[key]);
                delete keyTimers[key];
            }
        });
    }
    
    handleKeyPress(key) {
        if (!this.tetris.gameRunning) return;
        
        switch (key) {
            case 'ArrowLeft':
            case 'KeyA':
                this.tetris.movePiece(-1, 0);
                break;
                
            case 'ArrowRight':
            case 'KeyD':
                this.tetris.movePiece(1, 0);
                break;
                
            case 'ArrowDown':
            case 'KeyS':
                this.tetris.softDrop();
                break;
                
            case 'ArrowUp':
            case 'KeyW':
                this.tetris.rotatePieceClockwise();
                break;
                
            case 'Space':
                if (!this.tetris.paused) {
                    this.tetris.hardDrop();
                } else {
                    this.tetris.pauseGame();
                    this.updatePauseOverlay();
                }
                break;
                
            case 'KeyP':
                this.tetris.pauseGame();
                this.updatePauseOverlay();
                break;
        }
        
        // Re-render after any action
        this.render();
    }
    
    startGame() {
        this.tetris.startGame();
        this.lastTime = 0;
        this.gameLoop();
    }
    
    pauseGame() {
        this.tetris.pauseGame();
        this.updatePauseOverlay();
    }
    
    gameLoop(currentTime = 0) {
        if (!this.tetris.gameRunning) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update game logic
        this.tetris.update(deltaTime);
        
        // Render
        this.render();
        
        // Continue game loop
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    stopGame() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    render() {
        this.clearCanvas();
        this.drawBoard();
        this.drawGrid();
        this.drawGhostPiece();
        this.renderNextPiece();
    }
    
    clearCanvas() {
        // Clear main canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Clear next piece canvas
        this.nextCtx.fillStyle = '#000000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
    }
    
    drawBoard() {
        const boardState = this.tetris.getBoardState();
        const cellSize = this.tetris.CELL_SIZE;
        
        for (let row = 0; row < this.tetris.BOARD_HEIGHT; row++) {
            for (let col = 0; col < this.tetris.BOARD_WIDTH; col++) {
                const cell = boardState[row][col];
                if (cell) {
                    this.drawCell(this.ctx, col * cellSize, row * cellSize, cellSize, cell);
                }
            }
        }
    }
    
    drawGhostPiece() {
        if (!this.tetris.currentPiece || this.tetris.paused) return;
        
        const ghost = this.tetris.getGhostPosition();
        if (!ghost) return;
        
        const cellSize = this.tetris.CELL_SIZE;
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        
        for (let row = 0; row < ghost.blocks.length; row++) {
            for (let col = 0; col < ghost.blocks[row].length; col++) {
                if (ghost.blocks[row][col]) {
                    const x = (ghost.x + col) * cellSize;
                    const y = (ghost.y + row) * cellSize;
                    this.drawCell(this.ctx, x, y, cellSize, ghost.color, true);
                }
            }
        }
        
        this.ctx.restore();
    }
    
    drawGrid() {
        const cellSize = this.tetris.CELL_SIZE;
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 0.5;
        
        // Draw vertical lines
        for (let col = 0; col <= this.tetris.BOARD_WIDTH; col++) {
            const x = col * cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let row = 0; row <= this.tetris.BOARD_HEIGHT; row++) {
            const y = row * cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawCell(ctx, x, y, size, color, isGhost = false) {
        // Fill the cell
        ctx.fillStyle = color;
        ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
        
        if (!isGhost) {
            // Add 3D effect with gradients
            const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
            gradient.addColorStop(0, this.lightenColor(color, 40));
            gradient.addColorStop(1, this.darkenColor(color, 40));
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
            
            // Add border highlight
            ctx.strokeStyle = this.lightenColor(color, 60);
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 1.5, y + 1.5, size - 3, size - 3);
        }
    }
    
    renderNextPiece() {
        if (!this.tetris.nextPiece) return;
        
        const piece = this.tetris.nextPiece;
        const cellSize = 20; // Smaller cells for next piece preview
        const offsetX = (this.nextCanvas.width - piece.blocks[0].length * cellSize) / 2;
        const offsetY = (this.nextCanvas.height - piece.blocks.length * cellSize) / 2;
        
        for (let row = 0; row < piece.blocks.length; row++) {
            for (let col = 0; col < piece.blocks[row].length; col++) {
                if (piece.blocks[row][col]) {
                    const x = offsetX + col * cellSize;
                    const y = offsetY + row * cellSize;
                    this.drawCell(this.nextCtx, x, y, cellSize, piece.color);
                }
            }
        }
    }
    
    // Utility functions for color manipulation
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
            (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
            (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    }
    
    updateUI(stats) {
        document.getElementById('score').textContent = stats.score.toLocaleString();
        document.getElementById('level').textContent = stats.level;
        document.getElementById('lines').textContent = stats.lines;
    }
    
    updatePauseOverlay() {
        const overlay = document.getElementById('pauseOverlay');
        if (this.tetris.paused) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
    
    onGameOver(score, level, lines) {
        this.stopGame();
        
        // Update final stats
        document.getElementById('finalScore').textContent = score.toLocaleString();
        document.getElementById('finalLevel').textContent = level;
        document.getElementById('finalLines').textContent = lines;
        
        // Show game over screen
        setTimeout(() => {
            this.showScreen('gameOverScreen');
        }, 1000);
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
    }
}

// Global game instance
window.gameInstance = null;
