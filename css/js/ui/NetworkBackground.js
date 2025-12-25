/**
 * NetworkBackground - Animated network lines for loading screen
 */

import { CONFIG } from '../data/config.js';

export class NetworkBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas not found: ${canvasId}`);
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        this.animationId = null;
        this.isRunning = false;
        
        this.config = {
            nodeCount: 30,
            maxConnections: 4,
            connectionDistance: 300,
            nodeSpeed: 0.15,
            nodeSize: 2,
            glowIntensity: 1.0,
            colors: {
                primary: 'rgba(0, 243, 255, 0.9)',
                secondary: 'rgba(139, 92, 246, 0.7)',
                accent: 'rgba(255, 0, 110, 0.5)'
            }
        };
        
        // Initialize
        this.resize();
        this.createNodes();
        this.createConnections();
        
        // Setup resize listener
        window.addEventListener('resize', () => this.resize());
    }

    /**
     * Resize canvas to window size
     */
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Recreate nodes for new screen size
        this.createNodes();
        this.createConnections();
    }

    /**
     * Create network nodes
     */
    createNodes() {
        this.nodes = [];
        
        for (let i = 0; i < this.config.nodeCount; i++) {
            this.nodes.push({
                id: i,
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.config.nodeSpeed,
                vy: (Math.random() - 0.5) * this.config.nodeSpeed,
                size: this.config.nodeSize + Math.random() * 2,
                opacity: 0.5 + Math.random() * 0.5,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
    }

    /**
     * Create connections between nearby nodes
     */
    createConnections() {
        this.connections = [];
        
        for (let i = 0; i < this.nodes.length; i++) {
            const node1 = this.nodes[i];
            let connectionCount = 0;
            
            for (let j = i + 1; j < this.nodes.length; j++) {
                if (connectionCount >= this.config.maxConnections) break;
                
                const node2 = this.nodes[j];
                const distance = this.getDistance(node1, node2);
                
                if (distance < this.config.connectionDistance) {
                    this.connections.push({
                        node1: i,
                        node2: j,
                        strength: 1 - (distance / this.config.connectionDistance),
                        pulseOffset: Math.random() * Math.PI * 2
                    });
                    connectionCount++;
                }
            }
        }
    }

    /**
     * Calculate distance between two nodes
     */
    getDistance(node1, node2) {
        const dx = node1.x - node2.x;
        const dy = node1.y - node2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Update node positions
     */
    updateNodes() {
        this.nodes.forEach(node => {
            // Update position
            node.x += node.vx;
            node.y += node.vy;

            // Bounce off walls
            if (node.x < 0 || node.x > this.canvas.width) {
                node.vx *= -1;
                node.x = Math.max(0, Math.min(this.canvas.width, node.x));
            }
            if (node.y < 0 || node.y > this.canvas.height) {
                node.vy *= -1;
                node.y = Math.max(0, Math.min(this.canvas.height, node.y));
            }

            // Update pulse phase
            node.pulsePhase += 0.02;
        });

        // Recreate connections periodically for dynamic network
        if (Math.random() < 0.01) {
            this.createConnections();
        }
    }

    /**
     * Draw the network
     */
    draw() {
        // Clear canvas with very subtle fade effect for loading screen
        this.ctx.fillStyle = 'rgba(10, 14, 39, 0.02)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections
        this.drawConnections();
        
        // Draw nodes
        this.drawNodes();
    }

    /**
     * Draw network connections
     */
    drawConnections() {
        this.connections.forEach(connection => {
            const node1 = this.nodes[connection.node1];
            const node2 = this.nodes[connection.node2];
            
            if (!node1 || !node2) return;

            // Calculate current distance for dynamic opacity
            const currentDistance = this.getDistance(node1, node2);
            if (currentDistance > this.config.connectionDistance) return;

            const opacity = connection.strength * 0.6;
            const pulse = Math.sin(Date.now() * 0.001 + connection.pulseOffset) * 0.3 + 0.7;

            // Create gradient line
            const gradient = this.ctx.createLinearGradient(
                node1.x, node1.y, node2.x, node2.y
            );
            
            gradient.addColorStop(0, `rgba(0, 243, 255, ${opacity * pulse})`);
            gradient.addColorStop(0.5, `rgba(139, 92, 246, ${opacity * pulse * 0.8})`);
            gradient.addColorStop(1, `rgba(255, 0, 110, ${opacity * pulse * 0.6})`);

            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 1 + connection.strength;
            this.ctx.beginPath();
            this.ctx.moveTo(node1.x, node1.y);
            this.ctx.lineTo(node2.x, node2.y);
            this.ctx.stroke();
        });
    }

    /**
     * Draw network nodes
     */
    drawNodes() {
        this.nodes.forEach(node => {
            const pulse = Math.sin(node.pulsePhase) * 0.3 + 0.7;
            const currentSize = node.size * pulse;
            const currentOpacity = node.opacity * pulse;

            // Main node
            this.ctx.fillStyle = `rgba(0, 243, 255, ${currentOpacity})`;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, currentSize, 0, Math.PI * 2);
            this.ctx.fill();

            // Glow effect
            const glowSize = currentSize * 4;
            const gradient = this.ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, glowSize
            );
            
            gradient.addColorStop(0, `rgba(0, 243, 255, ${currentOpacity * 0.8})`);
            gradient.addColorStop(0.4, `rgba(139, 92, 246, ${currentOpacity * 0.4})`);
            gradient.addColorStop(1, 'rgba(0, 243, 255, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
            this.ctx.fill();

            // Extra glow for larger nodes
            if (node.size > 3) {
                const extraGlowSize = currentSize * 8;
                const extraGradient = this.ctx.createRadialGradient(
                    node.x, node.y, 0,
                    node.x, node.y, extraGlowSize
                );
                
                extraGradient.addColorStop(0, `rgba(255, 0, 110, ${currentOpacity * 0.3})`);
                extraGradient.addColorStop(1, 'rgba(255, 0, 110, 0)');
                
                this.ctx.fillStyle = extraGradient;
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, extraGlowSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    /**
     * Animation loop
     */
    animate() {
        if (!this.isRunning) return;

        this.updateNodes();
        this.draw();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Start animation
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.animate();
        console.log('🌐 Network background started');
    }

    /**
     * Stop animation
     */
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        console.log('🌐 Network background stopped');
    }

    /**
     * Clear canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Add data pulse effect
     */
    addDataPulse(startNodeId, endNodeId) {
        const startNode = this.nodes[startNodeId];
        const endNode = this.nodes[endNodeId];
        
        if (!startNode || !endNode) return;

        // Create animated pulse along connection
        const pulse = {
            startX: startNode.x,
            startY: startNode.y,
            endX: endNode.x,
            endY: endNode.y,
            progress: 0,
            speed: 0.02,
            size: 3,
            opacity: 1,
            lifetime: 100
        };

        // Add to pulse array (you'd need to add this to the class)
        if (!this.pulses) this.pulses = [];
        this.pulses.push(pulse);
    }

    /**
     * Create network burst effect
     */
    createBurst(x, y) {
        // Add temporary nodes for burst effect
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = 2;
            
            this.nodes.push({
                id: this.nodes.length,
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 1,
                opacity: 1,
                pulsePhase: 0,
                lifetime: 60,
                isBurst: true
            });
        }
    }

    /**
     * Clean up expired nodes
     */
    cleanupNodes() {
        this.nodes = this.nodes.filter(node => {
            if (node.lifetime !== undefined) {
                node.lifetime--;
                if (node.isBurst) {
                    node.opacity = node.lifetime / 60;
                }
                return node.lifetime > 0;
            }
            return true;
        });
    }

    /**
     * Destroy and clean up
     */
    destroy() {
        this.stop();
        this.clear();
        window.removeEventListener('resize', () => this.resize());
    }
}