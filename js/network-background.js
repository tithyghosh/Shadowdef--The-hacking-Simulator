// Simple Network Background for Loading Screen
class SimpleNetworkBackground {
    constructor(canvasId) {
        console.log('🌐 Creating SimpleNetworkBackground with canvas ID:', canvasId);
        
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`❌ Canvas not found: ${canvasId}`);
            return;
        }

        console.log('✅ Canvas found:', this.canvas);
        console.log('Canvas initial size:', this.canvas.width, 'x', this.canvas.height);

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('❌ Could not get 2D context');
            return;
        }

        console.log('✅ 2D context obtained');

        this.nodes = [];
        this.connections = [];
        this.animationId = null;
        this.isRunning = false;
        
        this.config = {
            nodeCount: 25,
            maxConnections: 3,
            connectionDistance: 250,
            nodeSpeed: 0.1,
            nodeSize: 1.5,
            colors: {
                primary: 'rgba(0, 243, 255, 0.6)',
                secondary: 'rgba(139, 92, 246, 0.4)',
                accent: 'rgba(255, 0, 110, 0.3)'
            }
        };
        
        this.resize();
        this.createNodes();
        this.createConnections();
        
        // Test draw to verify canvas is working
        console.log('🎨 Testing canvas draw...');
        this.ctx.fillStyle = 'rgba(0, 243, 255, 0.5)';
        this.ctx.fillRect(50, 50, 100, 100);
        console.log('✅ Test rectangle drawn');
        
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        console.log('🔄 Resizing canvas...');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        console.log('New canvas size:', this.canvas.width, 'x', this.canvas.height);
        this.createNodes();
        this.createConnections();
    }

    createNodes() {
        this.nodes = [];
        
        for (let i = 0; i < this.config.nodeCount; i++) {
            this.nodes.push({
                id: i,
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.config.nodeSpeed,
                vy: (Math.random() - 0.5) * this.config.nodeSpeed,
                size: this.config.nodeSize + Math.random() * 1,
                opacity: 0.4 + Math.random() * 0.4,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
    }

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

    getDistance(node1, node2) {
        const dx = node1.x - node2.x;
        const dy = node1.y - node2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    updateNodes() {
        this.nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;

            if (node.x < 0 || node.x > this.canvas.width) {
                node.vx *= -1;
                node.x = Math.max(0, Math.min(this.canvas.width, node.x));
            }
            if (node.y < 0 || node.y > this.canvas.height) {
                node.vy *= -1;
                node.y = Math.max(0, Math.min(this.canvas.height, node.y));
            }

            node.pulsePhase += 0.015;
        });

        if (Math.random() < 0.008) {
            this.createConnections();
        }
    }

    draw() {
        this.ctx.fillStyle = 'rgba(10, 14, 39, 0.03)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawConnections();
        this.drawNodes();
    }

    drawConnections() {
        this.connections.forEach(connection => {
            const node1 = this.nodes[connection.node1];
            const node2 = this.nodes[connection.node2];
            
            if (!node1 || !node2) return;

            const currentDistance = this.getDistance(node1, node2);
            if (currentDistance > this.config.connectionDistance) return;

            const opacity = connection.strength * 0.4;
            const pulse = Math.sin(Date.now() * 0.0008 + connection.pulseOffset) * 0.3 + 0.7;

            const gradient = this.ctx.createLinearGradient(
                node1.x, node1.y, node2.x, node2.y
            );
            
            gradient.addColorStop(0, `rgba(0, 243, 255, ${opacity * pulse})`);
            gradient.addColorStop(0.5, `rgba(139, 92, 246, ${opacity * pulse * 0.7})`);
            gradient.addColorStop(1, `rgba(255, 0, 110, ${opacity * pulse * 0.5})`);

            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 0.8 + connection.strength * 0.5;
            this.ctx.beginPath();
            this.ctx.moveTo(node1.x, node1.y);
            this.ctx.lineTo(node2.x, node2.y);
            this.ctx.stroke();
        });
    }

    drawNodes() {
        this.nodes.forEach(node => {
            const pulse = Math.sin(node.pulsePhase) * 0.3 + 0.7;
            const currentSize = node.size * pulse;
            const currentOpacity = node.opacity * pulse;

            this.ctx.fillStyle = `rgba(0, 243, 255, ${currentOpacity})`;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, currentSize, 0, Math.PI * 2);
            this.ctx.fill();

            const glowSize = currentSize * 3;
            const gradient = this.ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, glowSize
            );
            
            gradient.addColorStop(0, `rgba(0, 243, 255, ${currentOpacity * 0.6})`);
            gradient.addColorStop(0.5, `rgba(139, 92, 246, ${currentOpacity * 0.3})`);
            gradient.addColorStop(1, 'rgba(0, 243, 255, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    animate() {
        if (!this.isRunning) return;

        this.updateNodes();
        this.draw();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
        if (this.isRunning) {
            console.log('⚠️ Network background already running');
            return;
        }
        
        console.log('🚀 Starting network background animation...');
        this.isRunning = true;
        this.animate();
        console.log('✅ Network background started successfully');
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        console.log('🌐 Network background stopped');
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}