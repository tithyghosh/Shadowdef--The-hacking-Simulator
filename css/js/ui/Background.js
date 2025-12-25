/**
 * Background - Animated particle background
 * Creates a cyberpunk-style animated canvas background
 */

import { CONFIG } from '../data/config.js';

export class Background {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas not found: ${canvasId}`);
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.isRunning = false;
        
        this.config = CONFIG.BACKGROUND;
        
        // Initialize
        this.resize();
        this.createParticles();
        
        // Setup resize listener
        window.addEventListener('resize', () => this.resize());
    }

    /**
     * Resize canvas to window size
     */
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Recreate particles to fill new screen size
        this.createParticles();
    }

    /**
     * Create particle system
     */
    createParticles() {
        this.particles = [];
        
        const count = CONFIG.PERFORMANCE.ENABLE_PARTICLES 
            ? this.config.PARTICLE_COUNT 
            : 30;
        
        // Calculate particle density based on screen size
        const screenArea = this.canvas.width * this.canvas.height;
        const baseArea = 1920 * 1080; // Base resolution
        const densityMultiplier = Math.sqrt(screenArea / baseArea);
        const adjustedCount = Math.floor(count * densityMultiplier * this.config.NETWORK_DENSITY);
        
        for (let i = 0; i < adjustedCount; i++) {
            this.particles.push(this.createParticle());
        }
        
        console.log(`🌐 Created ${adjustedCount} network particles for ${this.canvas.width}x${this.canvas.height}`);
    }

    /**
     * Create a single particle
     * @returns {Object} Particle object
     */
    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * this.config.PARTICLE_SPEED,
            vy: (Math.random() - 0.5) * this.config.PARTICLE_SPEED,
            size: Math.random() * 
                (this.config.PARTICLE_SIZE_MAX - this.config.PARTICLE_SIZE_MIN) + 
                this.config.PARTICLE_SIZE_MIN,
            opacity: Math.random() * 0.5 + 0.3
        };
    }

    /**
     * Update particle positions
     */
    updateParticles() {
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Bounce off walls
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx *= -1;
                particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy *= -1;
                particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            }
        });
    }

    /**
     * Draw particles and connections
     */
    drawParticles() {
        // Clear canvas with dark background
        this.ctx.fillStyle = 'rgba(10, 14, 39, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw network connections first (behind particles)
        this.drawNetworkConnections();
        
        // Draw particles on top
        this.drawNetworkNodes();
    }

    /**
     * Draw network connections between particles
     */
    drawNetworkConnections() {
        this.ctx.lineWidth = 1;

        for (let i = 0; i < this.particles.length; i++) {
            const p1 = this.particles[i];

            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.config.CONNECTION_DISTANCE) {
                    const opacity = (1 - (distance / this.config.CONNECTION_DISTANCE)) * 0.4;
                    
                    // Create gradient line for better visual effect
                    const gradient = this.ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                    gradient.addColorStop(0, `rgba(0, 243, 255, ${opacity * p1.opacity})`);
                    gradient.addColorStop(0.5, `rgba(139, 92, 246, ${opacity * 0.8})`);
                    gradient.addColorStop(1, `rgba(255, 0, 110, ${opacity * p2.opacity})`);
                    
                    this.ctx.strokeStyle = gradient;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    /**
     * Draw network nodes (particles)
     */
    drawNetworkNodes() {
        this.particles.forEach(particle => {
            // Main particle
            this.ctx.fillStyle = `rgba(0, 243, 255, ${particle.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(
                particle.x,
                particle.y,
                particle.size,
                0,
                Math.PI * 2
            );
            this.ctx.fill();

            // Enhanced glow effect
            const glowSize = particle.size * 4;
            const gradient = this.ctx.createRadialGradient(
                particle.x,
                particle.y,
                0,
                particle.x,
                particle.y,
                glowSize
            );
            
            const glowOpacity = particle.opacity * this.config.GLOW_INTENSITY;
            gradient.addColorStop(0, `rgba(0, 243, 255, ${glowOpacity})`);
            gradient.addColorStop(0.4, `rgba(139, 92, 246, ${glowOpacity * 0.6})`);
            gradient.addColorStop(1, 'rgba(0, 243, 255, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(
                particle.x,
                particle.y,
                glowSize,
                0,
                Math.PI * 2
            );
            this.ctx.fill();

            // Add pulsing effect for larger particles
            if (particle.size > 2.5) {
                const pulseSize = particle.size * 6;
                const pulseOpacity = (Math.sin(Date.now() * 0.003 + particle.x * 0.01) + 1) * 0.1 * particle.opacity;
                
                const pulseGradient = this.ctx.createRadialGradient(
                    particle.x,
                    particle.y,
                    0,
                    particle.x,
                    particle.y,
                    pulseSize
                );
                
                pulseGradient.addColorStop(0, `rgba(255, 0, 110, ${pulseOpacity})`);
                pulseGradient.addColorStop(1, 'rgba(255, 0, 110, 0)');
                
                this.ctx.fillStyle = pulseGradient;
                this.ctx.beginPath();
                this.ctx.arc(
                    particle.x,
                    particle.y,
                    pulseSize,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
            }
        });
    }

    /**
     * Animation loop
     */
    animate() {
        if (!this.isRunning) return;

        this.updateParticles();
        this.drawParticles();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Start animation
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.animate();
        console.log('🎨 Background animation started');
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
        console.log('🎨 Background animation stopped');
    }

    /**
     * Pause animation
     */
    pause() {
        this.isRunning = false;
    }

    /**
     * Resume animation
     */
    resume() {
        if (!this.isRunning) {
            this.start();
        }
    }

    /**
     * Clear canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Update particle count
     * @param {number} count - New particle count
     */
    setParticleCount(count) {
        this.config.PARTICLE_COUNT = count;
        this.createParticles();
    }

    /**
     * Change background color
     * @param {string} color - Background color
     */
    setBackgroundColor(color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Add particle at specific position (for effects)
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    addParticleAt(x, y) {
        const particle = this.createParticle();
        particle.x = x;
        particle.y = y;
        this.particles.push(particle);
    }

    /**
     * Create burst effect at position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} count - Particle count
     */
    createBurst(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 2;
            
            const particle = {
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3,
                opacity: 1,
                lifetime: 60 // frames
            };
            
            this.particles.push(particle);
        }
    }

    /**
     * Clean up expired particles
     */
    cleanupParticles() {
        this.particles = this.particles.filter(p => {
            if (p.lifetime !== undefined) {
                p.lifetime--;
                p.opacity = p.lifetime / 60;
                return p.lifetime > 0;
            }
            return true;
        });
    }

    /**
     * Destroy background and clean up
     */
    destroy() {
        this.stop();
        this.clear();
        window.removeEventListener('resize', () => this.resize());
    }
}

/**
 * Static background patterns (optional alternative to animated)
 */
export class StaticBackground {
    static drawGrid(canvas) {
        const ctx = canvas.getContext('2d');
        const gridSize = 50;
        
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    static drawCircuit(canvas) {
        const ctx = canvas.getContext('2d');
        const nodeCount = 20;
        
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.2)';
        ctx.fillStyle = 'rgba(0, 243, 255, 0.5)';
        ctx.lineWidth = 2;
        
        // Random circuit nodes
        for (let i = 0; i < nodeCount; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            
            // Draw node
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw connections
            if (i > 0) {
                const prevX = Math.random() * canvas.width;
                const prevY = Math.random() * canvas.height;
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(prevX, prevY);
                ctx.stroke();
            }
        }
    }
}