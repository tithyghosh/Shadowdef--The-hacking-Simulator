/**
 * NetworkNav - Network navigation puzzle
 * Players navigate through an interconnected network of nodes
 */

import { CONFIG } from '../data/config.js';
import { AudioManager } from '../core/AudioManager.js';

export class NetworkNav {
    constructor(puzzleData, gameScreen) {
        this.gameScreen = gameScreen;
        this.audio = AudioManager.getInstance();
        
        // Puzzle configuration
        this.nodes = puzzleData.nodes || this.generateNetwork(puzzleData.nodeCount || 10);
        this.startNode = puzzleData.startNode || 0;
        this.endNode = puzzleData.endNode || (this.nodes.length - 1);
        this.maxHops = puzzleData.maxHops || 15;
        
        // State
        this.currentNode = this.startNode;
        this.path = [this.startNode];
        this.visited = new Set([this.startNode]);
        this.isComplete = false;
        
        console.log('🌐 Network navigation puzzle initialized:', this.nodes.length, 'nodes');
    }

    /**
     * Generate network structure
     * @param {number} nodeCount - Number of nodes
     * @returns {Array} Network nodes with connections
     */
    generateNetwork(nodeCount) {
        const nodes = [];
        
        // Create nodes
        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                id: i,
                connections: [],
                x: 0,
                y: 0
            });
        }
        
        // Position nodes in circular layout
        const centerX = 300;
        const centerY = 200;
        const radius = 150;
        
        nodes.forEach((node, i) => {
            const angle = (i / nodeCount) * Math.PI * 2;
            node.x = centerX + Math.cos(angle) * radius;
            node.y = centerY + Math.sin(angle) * radius;
        });
        
        // Create connections (each node connects to 2-3 neighbors)
        nodes.forEach((node, i) => {
            // Connect to next node
            if (i < nodeCount - 1) {
                node.connections.push(i + 1);
            }
            
            // Connect to node 2 steps ahead
            if (i < nodeCount - 2) {
                node.connections.push(i + 2);
            }
            
            // Add some cross connections for complexity
            if (i < nodeCount / 2) {
                const targetId = i + Math.floor(nodeCount / 2);
                if (targetId < nodeCount) {
                    node.connections.push(targetId);
                }
            }
        });
        
        return nodes;
    }

    /**
     * Initialize and render the puzzle
     * @param {HTMLElement} container - Container element
     */
    render(container) {
        container.innerHTML = `
            <div class="network-puzzle">
                <h2 class="puzzle-title">NETWORK NAVIGATION PROTOCOL</h2>
                
                <div class="puzzle-instructions">
                    <strong style="color: var(--cyber-blue);">MISSION:</strong>
                    <p style="margin-top: 10px; color: var(--text-secondary);">
                        Navigate from <span style="color: var(--cyber-green);">START</span> to 
                        <span style="color: var(--cyber-pink);">TARGET</span> node. 
                        Click connected nodes to move. Find the shortest path.
                    </p>
                </div>

                <div class="network-stats" style="display: flex; justify-content: space-around; margin-bottom: 20px; padding: 15px; background: var(--darker-bg); border: 1px solid var(--cyber-blue);">
                    <div style="text-align: center;">
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Hops</div>
                        <div style="color: var(--cyber-blue); font-size: 1.5rem;" id="network-hops">0</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Visited</div>
                        <div style="color: var(--cyber-purple); font-size: 1.5rem;" id="network-visited">1</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Max Hops</div>
                        <div style="color: var(--cyber-pink); font-size: 1.5rem;">${this.maxHops}</div>
                    </div>
                </div>
                
                <svg id="network-canvas" width="600" height="400" style="background: var(--darker-bg); border: 2px solid var(--cyber-blue); display: block; margin: 0 auto;">
                </svg>
                
                <div class="puzzle-actions" style="margin-top: 20px;">
                    <button class="btn btn-primary" id="network-reset">
                        RESET PATH
                    </button>
                    <button class="btn" id="network-hint">
                        SHOW CONNECTIONS
                    </button>
                </div>
            </div>
        `;

        this.drawNetwork();
        this.setupEventListeners();
    }

    /**
     * Draw network visualization
     */
    drawNetwork() {
        const svg = document.getElementById('network-canvas');
        if (!svg) return;

        svg.innerHTML = '';

        // Draw connections first (so they're behind nodes)
        this.nodes.forEach(node => {
            node.connections.forEach(targetId => {
                const target = this.nodes[targetId];
                
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', node.x);
                line.setAttribute('y1', node.y);
                line.setAttribute('x2', target.x);
                line.setAttribute('y2', target.y);
                line.setAttribute('stroke', '#8b5cf6');
                line.setAttribute('stroke-width', '2');
                line.setAttribute('opacity', '0.3');
                svg.appendChild(line);
            });
        });

        // Draw path lines
        for (let i = 0; i < this.path.length - 1; i++) {
            const fromNode = this.nodes[this.path[i]];
            const toNode = this.nodes[this.path[i + 1]];
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', fromNode.x);
            line.setAttribute('y1', fromNode.y);
            line.setAttribute('x2', toNode.x);
            line.setAttribute('y2', toNode.y);
            line.setAttribute('stroke', '#00f3ff');
            line.setAttribute('stroke-width', '3');
            svg.appendChild(line);
        }

        // Draw nodes
        this.nodes.forEach(node => {
            const isStart = node.id === this.startNode;
            const isEnd = node.id === this.endNode;
            const isCurrent = node.id === this.currentNode;
            const isVisited = this.visited.has(node.id);
            
            // Node circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', '20');
            circle.setAttribute('data-node', node.id);
            circle.style.cursor = 'pointer';
            
            if (isStart) {
                circle.setAttribute('fill', 'rgba(0, 255, 65, 0.3)');
                circle.setAttribute('stroke', '#00ff41');
            } else if (isEnd) {
                circle.setAttribute('fill', 'rgba(255, 0, 110, 0.3)');
                circle.setAttribute('stroke', '#ff006e');
            } else if (isCurrent) {
                circle.setAttribute('fill', 'rgba(0, 243, 255, 0.5)');
                circle.setAttribute('stroke', '#00f3ff');
            } else if (isVisited) {
                circle.setAttribute('fill', 'rgba(139, 92, 246, 0.3)');
                circle.setAttribute('stroke', '#8b5cf6');
            } else {
                circle.setAttribute('fill', 'rgba(15, 23, 42, 0.8)');
                circle.setAttribute('stroke', '#64748b');
            }
            
            circle.setAttribute('stroke-width', '2');
            svg.appendChild(circle);
            
            // Node label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y + 5);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#e2e8f0');
            text.setAttribute('font-size', '12');
            text.setAttribute('pointer-events', 'none');
            
            if (isStart) {
                text.textContent = 'S';
            } else if (isEnd) {
                text.textContent = 'E';
            } else {
                text.textContent = node.id;
            }
            
            svg.appendChild(text);
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const svg = document.getElementById('network-canvas');
        if (!svg) return;

        // Node click handler
        svg.addEventListener('click', (e) => {
            const circle = e.target.closest('circle');
            if (!circle) return;
            
            const nodeId = parseInt(circle.dataset.node);
            this.handleNodeClick(nodeId);
        });

        // Hover effects
        svg.addEventListener('mouseover', (e) => {
            const circle = e.target.closest('circle');
            if (!circle) return;
            
            circle.setAttribute('r', '25');
        });

        svg.addEventListener('mouseout', (e) => {
            const circle = e.target.closest('circle');
            if (!circle) return;
            
            circle.setAttribute('r', '20');
        });

        // Reset button
        const resetBtn = document.getElementById('network-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetPath());
        }

        // Hint button
        const hintBtn = document.getElementById('network-hint');
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

        const currentNodeData = this.nodes[this.currentNode];
        
        // Check if node is connected to current node
        if (!currentNodeData.connections.includes(nodeId)) {
            this.gameScreen.ui.showNotification('Not connected to current node!', 'warning');
            return;
        }

        // Check if going backwards
        if (this.path.length > 1 && this.path[this.path.length - 2] === nodeId) {
            // Allow going back one step
            this.path.pop();
            this.currentNode = nodeId;
        } else {
            // Move forward
            this.path.push(nodeId);
            this.currentNode = nodeId;
            this.visited.add(nodeId);
        }

        this.audio.playSound('typing');
        this.drawNetwork();
        this.updateStats();

        // Check for completion
        if (nodeId === this.endNode) {
            this.onSuccess();
        }

        // Check for hop limit
        if (this.path.length > this.maxHops) {
            this.onFailure();
        }

        // Update game screen
        this.gameScreen.updateAttempts(this.path.length - 1);
    }

    /**
     * Update statistics display
     */
    updateStats() {
        document.getElementById('network-hops').textContent = this.path.length - 1;
        document.getElementById('network-visited').textContent = this.visited.size;
    }

    /**
     * Reset path to start
     */
    resetPath() {
        this.path = [this.startNode];
        this.currentNode = this.startNode;
        this.visited = new Set([this.startNode]);
        
        this.drawNetwork();
        this.updateStats();
        this.audio.playButtonClick();
        this.gameScreen.ui.showNotification('Path reset', 'info');
    }

    /**
     * Show hint (highlight possible moves)
     */
    showHint() {
        if (this.isComplete) {
            this.gameScreen.ui.showNotification('Puzzle already complete!', 'info');
            return;
        }

        const currentNodeData = this.nodes[this.currentNode];
        
        // Temporarily highlight all connected nodes
        const svg = document.getElementById('network-canvas');
        currentNodeData.connections.forEach(connId => {
            const circle = svg.querySelector(`circle[data-node="${connId}"]`);
            if (circle) {
                const originalStroke = circle.getAttribute('stroke');
                circle.setAttribute('stroke', '#00ff41');
                circle.setAttribute('stroke-width', '4');
                
                setTimeout(() => {
                    circle.setAttribute('stroke', originalStroke);
                    circle.setAttribute('stroke-width', '2');
                }, 2000);
            }
        });

        this.audio.playHint();
        this.gameScreen.ui.showNotification('Connected nodes highlighted', 'info');
        
        // Record hint usage
        this.gameScreen.game.score.recordHint();
        this.gameScreen.updateHintsDisplay();
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
        this.gameScreen.ui.showNotification('Target node reached!', 'success');

        // Bonus for efficient path
        const efficiency = this.path.length / this.maxHops;
        if (efficiency < 0.6) {
            this.gameScreen.game.score.addPoints(500);
            this.gameScreen.ui.showNotification('Efficient route bonus! +500', 'success');
        }

        // Complete mission
        setTimeout(() => {
            this.gameScreen.completePuzzle(true);
        }, 1500);
    }

    /**
     * Handle failure (too many hops)
     */
    onFailure() {
        this.isComplete = true;
        this.audio.playFailure();

        this.gameScreen.ui.flashScreen('rgba(255, 0, 110, 0.2)', 300);
        this.gameScreen.ui.showNotification('Maximum hops exceeded!', 'error');

        setTimeout(() => {
            this.gameScreen.completePuzzle(false);
        }, 2000);
    }

    /**
     * Get puzzle statistics
     * @returns {Object} Puzzle stats
     */
    getStats() {
        return {
            hops: this.path.length - 1,
            nodesVisited: this.visited.size,
            totalNodes: this.nodes.length,
            completed: this.isComplete
        };
    }

    /**
     * Clean up puzzle
     */
    destroy() {
        const svg = document.getElementById('network-canvas');
        if (svg) {
            svg.replaceWith(svg.cloneNode(false));
        }
    }
}