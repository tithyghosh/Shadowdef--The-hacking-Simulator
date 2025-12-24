/**
 * FirewallBypass - Network navigation puzzle
 * Players must create a path from start to end node avoiding firewalls
 */

import { CONFIG } from '../data/config.js';
import { AudioManager } from '../core/AudioManager.js';

export class FirewallBypass {
    constructor(puzzleData, gameScreen) {
        this.gameScreen = gameScreen;
        this.audio = AudioManager.getInstance();
        
        // Puzzle configuration
        this.gridSize = puzzleData.gridSize || 6;
        this.blockedNodes = new Set(puzzleData.blockedNodes || []);
        this.startNode = puzzleData.startNode || 0;
        this.endNode = puzzleData.endNode || (this.gridSize * this.gridSize - 1);
        this.maxMoves = puzzleData.maxMoves || 50;
        
        // State
        this.path = [this.startNode];
        this.currentNode = this.startNode;
        this.isComplete = false;
        this.moves = 0;
        
        console.log('🛡️ Firewall puzzle initialized:', this.gridSize, 'x', this.gridSize);
    }

    /**
     * Initialize and render the puzzle
     * @param {HTMLElement} container - Container element
     */
    render(container) {
        container.innerHTML = `
            <div class="firewall-puzzle">
                <h2 class="puzzle-title">FIREWALL BYPASS PROTOCOL</h2>
                
                <div class="puzzle-instructions">
                    <strong style="color: var(--cyber-blue);">MISSION:</strong>
                    <p style="margin-top: 10px; color: var(--text-secondary);">
                        Navigate from the <span style="color: var(--cyber-green);">START</span> node 
                        to the <span style="color: var(--cyber-pink);">TARGET</span> node. 
                        Avoid <span style="color: var(--cyber-pink);">BLOCKED</span> nodes (firewalls). 
                        Click adjacent nodes to move.
                    </p>
                </div>

                <div class="firewall-stats" style="display: flex; justify-content: space-between; margin-bottom: 20px; padding: 15px; background: var(--darker-bg); border: 1px solid var(--cyber-blue);">
                    <div>
                        <span style="color: var(--text-secondary);">Moves:</span>
                        <span style="color: var(--cyber-blue); font-size: 1.5rem; margin-left: 10px;" id="firewall-moves">0</span>
                    </div>
                    <div>
                        <span style="color: var(--text-secondary);">Path Length:</span>
                        <span style="color: var(--cyber-blue); font-size: 1.5rem; margin-left: 10px;" id="path-length">1</span>
                    </div>
                </div>
                
                <div class="firewall-grid" id="firewall-grid">
                    ${this.createGrid()}
                </div>
                
                <div class="puzzle-actions">
                    <button class="btn btn-primary" id="firewall-reset">
                        RESET PATH
                    </button>
                    <button class="btn" id="firewall-hint">
                        SHOW HINT
                    </button>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.updateDisplay();
    }

    /**
     * Create grid HTML
     * @returns {string} Grid HTML
     */
    createGrid() {
        let html = '';
        const totalNodes = this.gridSize * this.gridSize;
        
        // Calculate grid columns dynamically
        const grid = document.createElement('style');
        grid.textContent = `
            .firewall-grid {
                display: grid;
                grid-template-columns: repeat(${this.gridSize}, 1fr);
                gap: 10px;
                margin-bottom: 20px;
                max-width: 600px;
            }
        `;
        document.head.appendChild(grid);
        
        for (let i = 0; i < totalNodes; i++) {
            const isStart = i === this.startNode;
            const isEnd = i === this.endNode;
            const isBlocked = this.blockedNodes.has(i);
            const isInPath = this.path.includes(i);
            const isCurrent = i === this.currentNode;
            
            let classes = ['firewall-node'];
            let label = i;
            
            if (isStart) {
                classes.push('start');
                label = 'START';
            } else if (isEnd) {
                classes.push('end');
                label = 'END';
            } else if (isBlocked) {
                classes.push('blocked');
                label = '🔒';
            } else if (isCurrent) {
                classes.push('current');
            } else if (isInPath) {
                classes.push('path');
            }
            
            html += `
                <div class="${classes.join(' ')}" data-node="${i}">
                    ${label}
                </div>
            `;
        }
        
        return html;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Node click handlers
        const nodes = document.querySelectorAll('.firewall-node');
        nodes.forEach(node => {
            node.addEventListener('click', () => {
                const nodeId = parseInt(node.dataset.node);
                this.handleNodeClick(nodeId);
            });
        });

        // Reset button
        const resetBtn = document.getElementById('firewall-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetPath());
        }

        // Hint button
        const hintBtn = document.getElementById('firewall-hint');
        if (hintBtn) {
            hintBtn.addEventListener('click', () => this.showHint());
        }
    }

    /**
     * Handle node click
     * @param {number} nodeId - Clicked node ID
     */
    handleNodeClick(nodeId) {
        if (this.isComplete) return;

        // Can't click blocked nodes
        if (this.blockedNodes.has(nodeId)) {
            this.gameScreen.ui.showNotification('Cannot move to blocked node!', 'error');
            this.audio.playFailure();
            return;
        }

        // Can only move to adjacent nodes
        if (!this.isAdjacent(this.currentNode, nodeId)) {
            this.gameScreen.ui.showNotification('Can only move to adjacent nodes!', 'warning');
            return;
        }

        // Check if going backwards in path
        const prevIndex = this.path.indexOf(nodeId);
        if (prevIndex !== -1) {
            // Going back - remove nodes after this point
            this.path = this.path.slice(0, prevIndex + 1);
            this.currentNode = nodeId;
        } else {
            // Moving forward - add to path
            this.path.push(nodeId);
            this.currentNode = nodeId;
        }

        this.moves++;
        this.audio.playSound('typing');
        
        // Update display
        this.updateDisplay();

        // Check if reached end
        if (nodeId === this.endNode) {
            this.onSuccess();
        }

        // Update stats in game screen
        this.gameScreen.updateAttempts(this.moves);
    }

    /**
     * Check if two nodes are adjacent
     * @param {number} node1 - First node
     * @param {number} node2 - Second node
     * @returns {boolean} Are adjacent
     */
    isAdjacent(node1, node2) {
        const row1 = Math.floor(node1 / this.gridSize);
        const col1 = node1 % this.gridSize;
        const row2 = Math.floor(node2 / this.gridSize);
        const col2 = node2 % this.gridSize;

        // Adjacent if difference is 1 in row OR column (not diagonal)
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);

        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    /**
     * Update visual display
     */
    updateDisplay() {
        const nodes = document.querySelectorAll('.firewall-node');
        
        nodes.forEach(node => {
            const nodeId = parseInt(node.dataset.node);
            
            // Remove all state classes
            node.classList.remove('current', 'path');
            
            // Add current state
            if (nodeId === this.currentNode && nodeId !== this.endNode) {
                node.classList.add('current');
            } else if (this.path.includes(nodeId) && nodeId !== this.startNode && nodeId !== this.endNode) {
                node.classList.add('path');
            }
        });

        // Update stats
        document.getElementById('firewall-moves').textContent = this.moves;
        document.getElementById('path-length').textContent = this.path.length;
    }

    /**
     * Reset path to start
     */
    resetPath() {
        this.path = [this.startNode];
        this.currentNode = this.startNode;
        this.updateDisplay();
        this.audio.playButtonClick();
        this.gameScreen.ui.showNotification('Path reset', 'info');
    }

    /**
     * Show hint (highlight next valid move)
     */
    showHint() {
        if (this.isComplete) {
            this.gameScreen.ui.showNotification('Puzzle already complete!', 'info');
            return;
        }

        // Simple hint: show one valid adjacent node
        const validMoves = this.getValidMoves(this.currentNode);
        
        if (validMoves.length === 0) {
            this.gameScreen.ui.showNotification('No valid moves! Try resetting.', 'warning');
            return;
        }

        // Highlight a random valid move
        const hintNode = validMoves[Math.floor(Math.random() * validMoves.length)];
        const nodeElement = document.querySelector(`[data-node="${hintNode}"]`);
        
        if (nodeElement) {
            nodeElement.style.animation = 'pulse 1s ease-in-out 3';
            setTimeout(() => {
                nodeElement.style.animation = '';
            }, 3000);
        }

        this.audio.playHint();
        this.gameScreen.ui.showNotification('Hint: Check the pulsing node', 'info');
        
        // Record hint usage
        this.gameScreen.game.score.recordHint();
        this.gameScreen.updateHintsDisplay();
    }

    /**
     * Get valid moves from current position
     * @param {number} fromNode - Starting node
     * @returns {Array} Array of valid node IDs
     */
    getValidMoves(fromNode) {
        const validMoves = [];
        const totalNodes = this.gridSize * this.gridSize;

        for (let i = 0; i < totalNodes; i++) {
            if (this.isAdjacent(fromNode, i) && !this.blockedNodes.has(i)) {
                validMoves.push(i);
            }
        }

        return validMoves;
    }

    /**
     * Handle successful completion
     */
    onSuccess() {
        this.isComplete = true;
        this.audio.playSuccess();

        // Flash screen green
        this.gameScreen.ui.flashScreen('rgba(0, 255, 65, 0.2)', 300);

        // Show success message
        this.gameScreen.ui.showNotification('Firewall bypassed!', 'success');

        // Calculate bonus for efficient path
        const optimalPath = this.calculateOptimalPathLength();
        if (this.path.length <= optimalPath + 2) {
            this.gameScreen.game.score.addPoints(500);
            this.gameScreen.ui.showNotification('Optimal path bonus! +500', 'success');
        }

        // Complete mission
        setTimeout(() => {
            this.gameScreen.completePuzzle(true);
        }, 1500);
    }

    /**
     * Calculate optimal path length (simple BFS)
     * @returns {number} Optimal path length
     */
    calculateOptimalPathLength() {
        // Simple estimate: Manhattan distance
        const startRow = Math.floor(this.startNode / this.gridSize);
        const startCol = this.startNode % this.gridSize;
        const endRow = Math.floor(this.endNode / this.gridSize);
        const endCol = this.endNode % this.gridSize;

        return Math.abs(endRow - startRow) + Math.abs(endCol - startCol) + 1;
    }

    /**
     * Get puzzle statistics
     * @returns {Object} Puzzle stats
     */
    getStats() {
        return {
            moves: this.moves,
            pathLength: this.path.length,
            optimalPath: this.calculateOptimalPathLength(),
            completed: this.isComplete
        };
    }

    /**
     * Clean up puzzle
     */
    destroy() {
        // Remove event listeners
        const nodes = document.querySelectorAll('.firewall-node');
        nodes.forEach(node => {
            node.replaceWith(node.cloneNode(true));
        });
    }
}