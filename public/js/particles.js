document.addEventListener('DOMContentLoaded', () => {
    let canvas = document.getElementById('particleCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'particleCanvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '0';
        canvas.style.opacity = '0.40';
        document.body.prepend(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const cols = 60;
    const rows = 40;
    const stepX = 28;
    const stepY = 22;
    let step = 0;

    function renderHalftoneWave() {
        ctx.clearRect(0, 0, width, height);
        step += 0.012;

        const startX = width * 0.42;
        const startY = height * 0.40;

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const diagonalFactor = (i * 0.08 + j * 0.09);
                const wave1 = Math.sin(diagonalFactor + step) * 22;
                const wave2 = Math.cos(diagonalFactor * 0.85 + step * 0.75) * 16;
                const z = wave1 + wave2;

                const scale = 1 / (1 - z * 0.002);
                const posX = startX + (i + j * 0.35) * stepX * scale;
                const posY = startY + (j - i * 0.18) * stepY * scale - (z * 0.9);

                if (posX > width * 0.35 && posX < width + 50 && posY > -50 && posY < height + 50) {
                    const radius = Math.max(0.4, (z + 45) * 0.025);
                    const rightFade = Math.min(1, Math.max(0.1, (posX - width * 0.35) / (width * 0.3)));
                    const alpha = Math.min(0.65, Math.max(0.05, ((z + 50) / 100) * rightFade));

                    ctx.beginPath();
                    ctx.arc(posX, posY, radius, 0, Math.PI * 2);

                    if (z > 18) {
                        ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
                    } else {
                        ctx.fillStyle = `rgba(24, 24, 27, ${alpha})`;
                    }
                    ctx.fill();
                }
            }
        }

        requestAnimationFrame(renderHalftoneWave);
    }

    renderHalftoneWave();
});
