// Tetris Game Logic
class TetrisGame {
    constructor() {
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.CELL_SIZE = 30;
        
        // Game state
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = false;
        this.paused = false;
        this.dropTime = 0;
        this.dropSpeed = 1000; // milliseconds
        
        // Initialize empty board
        this.initBoard();
        
        // Define Tetromino pieces
        this.pieces = {
            'I': {
                blocks: [
                    [[1,1,1,1]]
                ],
                color: '#00FFFF'
            },
            'O': {
                blocks: [
                    [[1,1],
                     [1,1]]
                ],
                color: '#FFFF00'
            },
            'T': {
                blocks: [
                    [[0,1,0],
                     [1,1,1]]
                ],
                color: '#800080'
            },
            'S': {
                blocks: [
                    [[0,1,1],
                     [1,1,0]]
                ],
                color: '#00FF00'
            },
            'Z': {
                blocks: [
                    [[1,1,0],
                     [0,1,1]]
                ],
                color: '#FF0000'
            },
            'J': {
                blocks: [
                    [[1,0,0],
                     [1,1,1]]
                ],
                color: '#0000FF'
            },
            'L': {
                blocks: [
                    [[0,0,1],
                     [1,1,1]]
                ],
                color: '#FFA500'
            }
        };
        
        this.pieceTypes = Object.keys(this.pieces);
    }
    
    initBoard() {
        this.board = [];
        for (let row = 0; row < this.BOARD_HEIGHT; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.BOARD_WIDTH; col++) {
                this.board[row][col] = null;
            }
        }
    }
    
    getRandomPiece() {
        const type = this.pieceTypes[Math.floor(Math.random() * this.pieceTypes.length)];
        const pieceData = this.pieces[type];
        
        return {
            type: type,
            blocks: JSON.parse(JSON.stringify(pieceData.blocks[0])), // Deep copy
            color: pieceData.color,
            x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(pieceData.blocks[0][0].length / 2),
            y: 0,
            rotation: 0
        };
    }
    
    startGame() {
        this.initBoard();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = true;
        this.paused = false;
        this.dropSpeed = Math.max(100, 1000 - (this.level - 1) * 100);
        
        this.currentPiece = this.getRandomPiece();
        this.nextPiece = this.getRandomPiece();
        
        this.updateDisplay();
    }
    
    pauseGame() {
        this.paused = !this.paused;
    }
    
    isValidPosition(piece, dx = 0, dy = 0, rotation = null) {
        const blocks = rotation !== null ? this.rotatePiece(piece, rotation) : piece.blocks;
        const newX = piece.x + dx;
        const newY = piece.y + dy;
        
        for (let row = 0; row < blocks.length; row++) {
            for (let col = 0; col < blocks[row].length; col++) {
                if (blocks[row][col]) {
                    const boardX = newX + col;
                    const boardY = newY + row;
                    
                    // Check boundaries
                    if (boardX < 0 || boardX >= this.BOARD_WIDTH || 
                        boardY >= this.BOARD_HEIGHT) {
                        return false;
                    }
                    
                    // Check collision with placed pieces
                    if (boardY >= 0 && this.board[boardY][boardX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    rotatePiece(piece, rotation) {
        const blocks = piece.blocks;
        const size = blocks.length;
        let rotated = [];
        
        // Initialize rotated array
        for (let i = 0; i < blocks[0].length; i++) {
            rotated[i] = [];
            for (let j = 0; j < blocks.length; j++) {
                rotated[i][j] = 0;
            }
        }
        
        // Rotate 90 degrees clockwise
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < blocks[row].length; col++) {
                rotated[col][size - 1 - row] = blocks[row][col];
            }
        }
        
        return rotated;
    }
    
    movePiece(dx, dy) {
        if (!this.gameRunning || this.paused || !this.currentPiece) return false;
        
        if (this.isValidPosition(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            return true;
        }
        return false;
    }
    
    rotatePieceClockwise() {
        if (!this.gameRunning || this.paused || !this.currentPiece) return false;
        
        const rotatedBlocks = this.rotatePiece(this.currentPiece, 1);
        
        // Try rotating at current position
        if (this.isValidPosition(this.currentPiece, 0, 0, 1)) {
            this.currentPiece.blocks = rotatedBlocks;
            return true;
        }
        
        // Try wall kicks
        const kicks = [[-1, 0], [1, 0], [0, -1], [-2, 0], [2, 0]];
        for (let kick of kicks) {
            if (this.isValidPosition(this.currentPiece, kick[0], kick[1], 1)) {
                this.currentPiece.blocks = rotatedBlocks;
                this.currentPiece.x += kick[0];
                this.currentPiece.y += kick[1];
                return true;
            }
        }
        
        return false;
    }
    
    hardDrop() {
        if (!this.gameRunning || this.paused || !this.currentPiece) return;
        
        let dropDistance = 0;
        while (this.movePiece(0, 1)) {
            dropDistance++;
        }
        
        // Add bonus points for hard drop
        this.score += dropDistance * 2;
        
        this.placePiece();
    }
    
    softDrop() {
        if (this.movePiece(0, 1)) {
            this.score += 1; // Bonus point for soft drop
            return true;
        }
        return false;
    }
    
    placePiece() {
        if (!this.currentPiece) return;
        
        // Place the piece on the board
        for (let row = 0; row < this.currentPiece.blocks.length; row++) {
            for (let col = 0; col < this.currentPiece.blocks[row].length; col++) {
                if (this.currentPiece.blocks[row][col]) {
                    const boardX = this.currentPiece.x + col;
                    const boardY = this.currentPiece.y + row;
                    
                    if (boardY >= 0 && boardY < this.BOARD_HEIGHT && 
                        boardX >= 0 && boardX < this.BOARD_WIDTH) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        
        // Check for completed lines
        this.checkLines();
        
        // Generate next piece
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.getRandomPiece();
        
        // Check game over
        if (!this.isValidPosition(this.currentPiece)) {
            this.gameOver();
        }
        
        this.updateDisplay();
    }
    
    checkLines() {
        let linesCleared = 0;
        let linesToClear = [];
        
        // Find completed lines
        for (let row = this.BOARD_HEIGHT - 1; row >= 0; row--) {
            let isComplete = true;
            for (let col = 0; col < this.BOARD_WIDTH; col++) {
                if (!this.board[row][col]) {
                    isComplete = false;
                    break;
                }
            }
            if (isComplete) {
                linesToClear.push(row);
                linesCleared++;
            }
        }
        
        // Clear completed lines
        if (linesCleared > 0) {
            // Remove cleared lines
            for (let row of linesToClear) {
                this.board.splice(row, 1);
                this.board.unshift(new Array(this.BOARD_WIDTH).fill(null));
            }
            
            // Update statistics
            this.lines += linesCleared;
            
            // Calculate score based on lines cleared simultaneously
            const lineBonus = [0, 40, 100, 300, 1200];
            this.score += lineBonus[linesCleared] * this.level;
            
            // Level progression
            const newLevel = Math.floor(this.lines / 10) + 1;
            if (newLevel > this.level) {
                this.level = newLevel;
                this.dropSpeed = Math.max(100, 1000 - (this.level - 1) * 50);
            }
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        this.saveHighScore();
        
        // Trigger game over event
        if (window.gameInstance && window.gameInstance.onGameOver) {
            window.gameInstance.onGameOver(this.score, this.level, this.lines);
        }
    }
    
    saveHighScore() {
        const highScores = this.getHighScores();
        const newScore = {
            score: this.score,
            level: this.level,
            lines: this.lines,
            date: new Date().toLocaleDateString()
        };
        
        highScores.push(newScore);
        highScores.sort((a, b) => b.score - a.score);
        highScores.splice(10); // Keep only top 10
        
        localStorage.setItem('tetrisHighScores', JSON.stringify(highScores));
    }
    
    getHighScores() {
        try {
            const scores = localStorage.getItem('tetrisHighScores');
            return scores ? JSON.parse(scores) : [];
        } catch (e) {
            return [];
        }
    }
    
    update(deltaTime) {
        if (!this.gameRunning || this.paused || !this.currentPiece) return;
        
        this.dropTime += deltaTime;
        
        if (this.dropTime >= this.dropSpeed) {
            if (!this.movePiece(0, 1)) {
                this.placePiece();
            }
            this.dropTime = 0;
        }
    }
    
    updateDisplay() {
        // This will be called by the renderer to update UI
        if (window.gameInstance && window.gameInstance.updateUI) {
            window.gameInstance.updateUI({
                score: this.score,
                level: this.level,
                lines: this.lines
            });
        }
    }
    
    // Get board state for rendering
    getBoardState() {
        // Create a copy of the board
        let displayBoard = this.board.map(row => [...row]);
        
        // Add current piece to display board
        if (this.currentPiece && this.gameRunning && !this.paused) {
            for (let row = 0; row < this.currentPiece.blocks.length; row++) {
                for (let col = 0; col < this.currentPiece.blocks[row].length; col++) {
                    if (this.currentPiece.blocks[row][col]) {
                        const boardX = this.currentPiece.x + col;
                        const boardY = this.currentPiece.y + row;
                        
                        if (boardY >= 0 && boardY < this.BOARD_HEIGHT && 
                            boardX >= 0 && boardX < this.BOARD_WIDTH) {
                            displayBoard[boardY][boardX] = this.currentPiece.color;
                        }
                    }
                }
            }
        }
        
        return displayBoard;
    }
    
    // Get ghost piece position for preview
    getGhostPosition() {
        if (!this.currentPiece) return null;
        
        let ghostY = this.currentPiece.y;
        while (this.isValidPosition(this.currentPiece, 0, ghostY - this.currentPiece.y + 1)) {
            ghostY++;
        }
        
        return {
            ...this.currentPiece,
            y: ghostY
        };
    }
}
