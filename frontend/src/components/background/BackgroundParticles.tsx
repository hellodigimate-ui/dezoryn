import React, { useEffect, useRef } from 'react';

export const BackgroundParticles: React.FC = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Optimized Particle Array (22 lightweight items)
    const particleCount = 22;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.35 + 0.1,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: (Math.random() - 0.5) * 0.25,
      pulseSpeed: Math.random() * 0.015 + 0.004
    }));

    const render = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Pulse alpha
        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.002;

        ctx.fillStyle = `rgba(37, 99, 235, ${Math.max(0.05, Math.min(0.4, p.alpha))})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    let startTimer = setTimeout(() => {
      render();
    }, 150);

    return () => {
      clearTimeout(startTimer);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden transform-gpu">
      {/* Soft Radial Blue Gradient Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-blue-100/30 via-sky-50/40 to-transparent dark:from-blue-950/25 dark:via-slate-950/40 dark:to-transparent rounded-full blur-3xl opacity-60 transition-colors duration-300" />
      <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
      
      {/* Tiny Ambient Floating Particles Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50" />
    </div>
  );
});

