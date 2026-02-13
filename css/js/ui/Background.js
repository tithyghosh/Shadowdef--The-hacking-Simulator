/**
 * Background - Three.js cyber background
 * Effects:
 * - Slowly moving network nodes and links
 * - Floating binary sprites
 * - Faint horizontal scan line
 * - Random glitch flashes
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CONFIG } from '../data/config.js';

export class Background {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas not found: ${canvasId}`);
            return;
        }

        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.clock = new THREE.Clock();
        this.animationId = null;
        this.isRunning = false;

        this.config = CONFIG.BACKGROUND || {};
        this.nodeCount = Math.max(30, this.config.PARTICLE_COUNT || 80);
        this.connectionDistance = this.config.CONNECTION_DISTANCE || 200;

        this.worldHeight = 100;
        this.worldWidth = 100;

        this.nodes = [];
        this.nodePositions = null;
        this.nodeGeometry = null;
        this.haloGeometry = null;
        this.linkGeometry = null;
        this.linkPairsMax = this.nodeCount * 8;
        this.linkPositions = null;

        this.binarySprites = [];
        this.scanLine = null;
        this.glitchFlash = null;
        this.glitchBars = [];
        this.glitchTimer = 0;
        this.nextGlitchAt = 0.8 + Math.random() * 1.8;

        this.onResize = this.resize.bind(this);

        this.initThree();
        this.resize();
        window.addEventListener('resize', this.onResize);
    }

    initThree() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.setClearColor(0x060a24, 1);

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-50, 50, 50, -50, -100, 100);
        this.camera.position.z = 10;

        this.buildNetwork();
        this.buildBinarySprites();
        this.buildScanLine();
        this.buildGlitch();
    }

    buildNetwork() {
        this.nodePositions = new Float32Array(this.nodeCount * 3);
        this.nodeGeometry = new THREE.BufferGeometry();
        this.haloGeometry = new THREE.BufferGeometry();

        const baseSpeed = Math.max(0.03, this.config.PARTICLE_SPEED || 0.3) * 0.12;
        for (let i = 0; i < this.nodeCount; i++) {
            this.nodes.push({
                x: 0,
                y: 0,
                vx: (Math.random() - 0.5) * baseSpeed,
                vy: (Math.random() - 0.5) * baseSpeed,
                pulse: Math.random() * Math.PI * 2
            });
        }

        this.nodeGeometry.setAttribute('position', new THREE.BufferAttribute(this.nodePositions, 3));
        this.haloGeometry.setAttribute('position', new THREE.BufferAttribute(this.nodePositions, 3));

        const nodeMaterial = new THREE.PointsMaterial({
            color: 0x00f3ff,
            size: 3,
            sizeAttenuation: false,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending
        });
        const nodePoints = new THREE.Points(this.nodeGeometry, nodeMaterial);
        this.scene.add(nodePoints);

        const haloMaterial = new THREE.PointsMaterial({
            color: 0x7a4dff,
            size: 10,
            sizeAttenuation: false,
            transparent: true,
            opacity: 0.14,
            blending: THREE.AdditiveBlending
        });
        const haloPoints = new THREE.Points(this.haloGeometry, haloMaterial);
        this.scene.add(haloPoints);

        this.linkPositions = new Float32Array(this.linkPairsMax * 2 * 3);
        this.linkGeometry = new THREE.BufferGeometry();
        this.linkGeometry.setAttribute('position', new THREE.BufferAttribute(this.linkPositions, 3));
        this.linkGeometry.setDrawRange(0, 0);

        const linkMaterial = new THREE.LineBasicMaterial({
            color: 0x36b9ff,
            transparent: true,
            opacity: 0.22,
            blending: THREE.AdditiveBlending
        });
        const links = new THREE.LineSegments(this.linkGeometry, linkMaterial);
        this.scene.add(links);
    }

    buildBinarySprites() {
        const binaryCount = Math.min(70, Math.max(25, Math.floor(this.nodeCount * 0.55)));
        for (let i = 0; i < binaryCount; i++) {
            const texture = this.makeBinaryTexture();
            const material = new THREE.SpriteMaterial({
                map: texture,
                color: 0x9cecff,
                transparent: true,
                opacity: 0.18,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
            const sprite = new THREE.Sprite(material);
            sprite.userData = {
                drift: (Math.random() - 0.5) * 0.25,
                rise: 0.08 + Math.random() * 0.12,
                wobble: Math.random() * Math.PI * 2
            };
            sprite.scale.set(7 + Math.random() * 4, 3.2 + Math.random() * 2, 1);
            this.binarySprites.push(sprite);
            this.scene.add(sprite);
        }
    }

    makeBinaryTexture() {
        const c = document.createElement('canvas');
        c.width = 128;
        c.height = 64;
        const g = c.getContext('2d');
        g.clearRect(0, 0, c.width, c.height);
        g.font = 'bold 34px Consolas, monospace';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillStyle = 'rgba(150, 236, 255, 0.95)';
        const len = 2 + Math.floor(Math.random() * 5);
        let txt = '';
        for (let i = 0; i < len; i++) txt += Math.random() > 0.5 ? '1' : '0';
        g.fillText(txt, c.width / 2, c.height / 2);
        const tex = new THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        return tex;
    }

    buildScanLine() {
        const geom = new THREE.PlaneGeometry(1, 2.2);
        const mat = new THREE.MeshBasicMaterial({
            color: 0x1fd7ff,
            transparent: true,
            opacity: 0.12,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.scanLine = new THREE.Mesh(geom, mat);
        this.scene.add(this.scanLine);
    }

    buildGlitch() {
        const flashGeom = new THREE.PlaneGeometry(1, 1);
        const flashMat = new THREE.MeshBasicMaterial({
            color: 0x93d7ff,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        this.glitchFlash = new THREE.Mesh(flashGeom, flashMat);
        this.scene.add(this.glitchFlash);

        for (let i = 0; i < 5; i++) {
            const barGeom = new THREE.PlaneGeometry(1, 0.8 + Math.random() * 1.2);
            const barMat = new THREE.MeshBasicMaterial({
                color: i % 2 === 0 ? 0xff2d83 : 0x58dbff,
                transparent: true,
                opacity: 0,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
            const bar = new THREE.Mesh(barGeom, barMat);
            bar.visible = false;
            this.glitchBars.push(bar);
            this.scene.add(bar);
        }
    }

    resize() {
        if (!this.renderer || !this.canvas) return;

        const width = window.innerWidth;
        const height = window.innerHeight;
        this.renderer.setSize(width, height, false);

        this.worldWidth = (width / height) * this.worldHeight;
        this.camera.left = -this.worldWidth / 2;
        this.camera.right = this.worldWidth / 2;
        this.camera.top = this.worldHeight / 2;
        this.camera.bottom = -this.worldHeight / 2;
        this.camera.updateProjectionMatrix();

        // Re-seed node/sprite positions into current viewport bounds.
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].x = (Math.random() - 0.5) * this.worldWidth;
            this.nodes[i].y = (Math.random() - 0.5) * this.worldHeight;
        }
        for (let i = 0; i < this.binarySprites.length; i++) {
            const s = this.binarySprites[i];
            s.position.x = (Math.random() - 0.5) * this.worldWidth;
            s.position.y = (Math.random() - 0.5) * this.worldHeight;
        }

        this.scanLine.scale.set(this.worldWidth, 1, 1);
        this.glitchFlash.scale.set(this.worldWidth, this.worldHeight, 1);
        for (const bar of this.glitchBars) {
            bar.scale.set(this.worldWidth * (0.6 + Math.random() * 0.45), 1, 1);
            bar.position.x = (Math.random() - 0.5) * this.worldWidth * 0.2;
        }
    }

    updateNetwork(delta, elapsed) {
        const halfW = this.worldWidth / 2;
        const halfH = this.worldHeight / 2;
        const distScale = this.connectionDistance / 200;
        const threshold = 10 * distScale;

        for (let i = 0; i < this.nodes.length; i++) {
            const n = this.nodes[i];
            n.x += n.vx * delta * 60;
            n.y += n.vy * delta * 60;

            if (n.x < -halfW || n.x > halfW) n.vx *= -1;
            if (n.y < -halfH || n.y > halfH) n.vy *= -1;
            n.x = Math.max(-halfW, Math.min(halfW, n.x));
            n.y = Math.max(-halfH, Math.min(halfH, n.y));

            const p = i * 3;
            this.nodePositions[p] = n.x;
            this.nodePositions[p + 1] = n.y;
            this.nodePositions[p + 2] = 0;
        }

        this.nodeGeometry.attributes.position.needsUpdate = true;
        this.haloGeometry.attributes.position.needsUpdate = true;

        let cursor = 0;
        let segs = 0;
        for (let i = 0; i < this.nodes.length; i++) {
            const a = this.nodes[i];
            for (let j = i + 1; j < this.nodes.length; j++) {
                if (segs >= this.linkPairsMax) break;
                const b = this.nodes[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                if ((dx * dx + dy * dy) <= threshold * threshold) {
                    this.linkPositions[cursor++] = a.x;
                    this.linkPositions[cursor++] = a.y;
                    this.linkPositions[cursor++] = 0;
                    this.linkPositions[cursor++] = b.x;
                    this.linkPositions[cursor++] = b.y;
                    this.linkPositions[cursor++] = 0;
                    segs++;
                }
            }
        }
        this.linkGeometry.setDrawRange(0, segs * 2);
        this.linkGeometry.attributes.position.needsUpdate = true;

        // Subtle global pulse.
        const pulse = 0.18 + (Math.sin(elapsed * 0.8) + 1) * 0.06;
        this.scene.children.forEach((obj) => {
            if (obj.isLineSegments && obj.material) obj.material.opacity = pulse;
        });
    }

    updateBinarySprites(delta, elapsed) {
        const halfW = this.worldWidth / 2;
        const halfH = this.worldHeight / 2;

        for (const s of this.binarySprites) {
            const d = s.userData;
            s.position.y += d.rise * delta * 60;
            s.position.x += Math.sin(elapsed * 0.4 + d.wobble) * d.drift * delta * 60;
            if (s.position.y > halfH + 4) {
                s.position.y = -halfH - 4;
                s.position.x = (Math.random() - 0.5) * this.worldWidth;
            }
        }
    }

    updateScanLine(elapsed) {
        const t = (elapsed * 0.07) % 1;
        this.scanLine.position.y = (0.5 - t) * this.worldHeight;
        this.scanLine.material.opacity = 0.08 + Math.sin(elapsed * 4.2) * 0.015;
    }

    triggerGlitch() {
        this.glitchTimer = 0.08 + Math.random() * 0.06;
        this.glitchFlash.material.opacity = 0.08 + Math.random() * 0.12;

        for (const bar of this.glitchBars) {
            bar.visible = Math.random() > 0.45;
            bar.position.y = (Math.random() - 0.5) * this.worldHeight;
            bar.material.opacity = bar.visible ? 0.05 + Math.random() * 0.14 : 0;
        }
    }

    updateGlitch(delta, elapsed) {
        this.nextGlitchAt -= delta;
        if (this.nextGlitchAt <= 0) {
            this.triggerGlitch();
            this.nextGlitchAt = 0.8 + Math.random() * 2.6;
        }

        if (this.glitchTimer > 0) {
            this.glitchTimer -= delta;
            const fade = Math.max(0, this.glitchTimer * 9);
            this.glitchFlash.material.opacity *= (0.85 + fade * 0.02);
            for (const bar of this.glitchBars) {
                if (bar.visible) {
                    bar.material.opacity *= 0.76;
                    if (bar.material.opacity < 0.01) {
                        bar.visible = false;
                        bar.material.opacity = 0;
                    }
                }
            }
        } else {
            this.glitchFlash.material.opacity = Math.max(0, this.glitchFlash.material.opacity * 0.8);
        }

        // Rare tiny chromatic jitter.
        this.scene.position.x = Math.sin(elapsed * 47.0) * 0.02;
    }

    animate() {
        if (!this.isRunning || !this.renderer) return;

        const delta = Math.min(this.clock.getDelta(), 0.05);
        const elapsed = this.clock.elapsedTime;
        this.updateNetwork(delta, elapsed);
        this.updateBinarySprites(delta, elapsed);
        this.updateScanLine(elapsed);
        this.updateGlitch(delta, elapsed);

        this.renderer.render(this.scene, this.camera);
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.clock.start();
        this.animate();
        console.log('Background animation started (Three.js)');
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    pause() {
        this.stop();
    }

    resume() {
        this.start();
    }

    clear() {
        if (this.renderer) {
            this.renderer.clear();
        }
    }

    // Kept for compatibility with callers.
    setParticleCount(count) {
        this.nodeCount = Math.max(10, count | 0);
    }

    // Kept for compatibility with callers.
    setBackgroundColor(color) {
        if (!this.renderer) return;
        this.renderer.setClearColor(new THREE.Color(color), 1);
    }

    addParticleAt(x, y) {
        if (!this.nodes.length) return;
        const idx = Math.floor(Math.random() * this.nodes.length);
        const nx = ((x / window.innerWidth) - 0.5) * this.worldWidth;
        const ny = (0.5 - (y / window.innerHeight)) * this.worldHeight;
        this.nodes[idx].x = nx;
        this.nodes[idx].y = ny;
    }

    createBurst(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            this.addParticleAt(x + (Math.random() - 0.5) * 40, y + (Math.random() - 0.5) * 40);
        }
    }

    cleanupParticles() {}

    destroy() {
        this.stop();
        window.removeEventListener('resize', this.onResize);

        if (!this.scene) return;
        this.scene.traverse((obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach((m) => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
            if (obj.material && obj.material.map) obj.material.map.dispose();
        });

        if (this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }
    }
}

export class StaticBackground {
    static drawGrid() {}
    static drawCircuit() {}
}

