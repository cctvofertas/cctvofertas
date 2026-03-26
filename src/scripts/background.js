/**
 * CCTV OFERTAS - Advanced Security Network Background
 * High-performance Canvas animation with parallax, pulsing nodes, and mouse interaction.
 */

const initSecurityGrid = (canvasId) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouse = { x: -1000, y: -1000, radius: 200 };
    let frame = 0;

    const settings = {
        particleCount: 100,
        connectionDistance: 160,
        baseParticleSize: 1.2,
        velocity: 0.25,
        lineOpacity: 0.12,
        dotOpacity: 0.5,
        glowColor: '99, 102, 241', // Electric Indigo
        accentColor: '245, 158, 11' // Amber
    };

    const resize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Depth/Parallax factor (0.5 to 1.5)
            this.z = Math.random() * 1 + 0.5;
            this.vx = (Math.random() - 0.5) * settings.velocity * this.z;
            this.vy = (Math.random() - 0.5) * settings.velocity * this.z;
            this.size = settings.baseParticleSize * this.z;
            this.pulsePhase = Math.random() * Math.PI * 2;
            this.pulseSpeed = 0.02 + Math.random() * 0.03;
        }

        update() {
            // Parallax mouse effect
            let targetX = this.x + this.vx;
            let targetY = this.y + this.vy;

            if (mouse.x > 0) {
                const offsetX = (mouse.x - width / 2) * (this.z * 0.02);
                const offsetY = (mouse.y - height / 2) * (this.z * 0.02);
                targetX += offsetX * 0.1;
                targetY += offsetY * 0.1;
            }

            this.x = targetX;
            this.y = targetY;

            // Screen Wrap
            if (this.x < -50) this.x = width + 50;
            if (this.x > width + 50) this.x = -50;
            if (this.y < -50) this.y = height + 50;
            if (this.y > height + 50) this.y = -50;

            this.pulsePhase += this.pulseSpeed;
        }

        draw() {
            const pulse = (Math.sin(this.pulsePhase) + 1) / 2;
            const opacity = settings.dotOpacity * (0.5 + pulse * 0.5);
            
            // Draw Glow
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 4);
            gradient.addColorStop(0, `rgba(${settings.glowColor}, ${opacity})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
            ctx.fill();

            // Draw Core
            ctx.fillStyle = `rgba(${settings.glowColor}, ${opacity + 0.2})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const createParticles = () => {
        particles = [];
        for (let i = 0; i < settings.particleCount; i++) {
            particles.push(new Particle());
        }
    };

    const drawLines = () => {
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i];
                const p2 = particles[j];
                
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < settings.connectionDistance) {
                    // Lines also react to mouse
                    let mouseDist = 1;
                    if (mouse.x > 0) {
                        const mdx = mouse.x - (p1.x + p2.x) / 2;
                        const mdy = mouse.y - (p1.y + p2.y) / 2;
                        const d = Math.sqrt(mdx * mdx + mdy * mdy);
                        if (d < mouse.radius) {
                            mouseDist = 1 + (1 - d / mouse.radius);
                        }
                    }

                    const opacity = (1 - distance / settings.connectionDistance) * settings.lineOpacity * mouseDist;
                    ctx.strokeStyle = `rgba(${settings.glowColor}, ${opacity})`;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
    };

    const animate = () => {
        frame++;
        ctx.clearRect(0, 0, width, height);

        // Subtile glow pulse for the whole scene
        const scenePulse = (Math.sin(frame * 0.01) + 1) / 2;
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        drawLines();
        requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    resize();
    createParticles();
    animate();
};

export { initSecurityGrid };
