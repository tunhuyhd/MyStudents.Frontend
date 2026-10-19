'use client';

import { useEffect, useRef } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export default function ZodiacBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const drawingContext = ctx;

    const motionPreference = window.matchMedia(REDUCED_MOTION_QUERY);
    let particles: Particle[] = [];
    let animationFrameId: number | null = null;
    let isAnimating = false;
    let animationGeneration = 0;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 2.5 + 1.0;
        this.speedX = Math.random() * 0.15 - 0.075;
        this.speedY = Math.random() * 0.15 - 0.075;
        this.opacity = Math.random() * 0.8 + 0.3;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas!.width) this.x = 0;
        else if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0;
        else if (this.y < 0) this.y = canvas!.height;
      }

      draw() {
        drawingContext.fillStyle = `rgba(16, 185, 129, ${this.opacity})`;
        drawingContext.shadowBlur = 10;
        drawingContext.shadowColor = '#10b981';
        drawingContext.beginPath();
        drawingContext.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        drawingContext.fill();
        drawingContext.shadowBlur = 0;
      }
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      particles = [];
      const numberOfParticles = (canvas.width * canvas.height) / 7000;
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };

    const drawBackground = () => {
      drawingContext.clearRect(0, 0, canvas!.width, canvas!.height);

      const gradient = drawingContext.createRadialGradient(
        canvas!.width / 2, canvas!.height / 2, 0,
        canvas!.width / 2, canvas!.height / 2, canvas!.width,
      );
      gradient.addColorStop(0, '#060a08');
      gradient.addColorStop(1, '#020403');
      drawingContext.fillStyle = gradient;
      drawingContext.fillRect(0, 0, canvas!.width, canvas!.height);
    };

    const connect = () => {
      const maxDistance = 200;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = 1 - distance / maxDistance;
            drawingContext.strokeStyle = `rgba(16, 185, 129, ${opacity * 0.25})`;
            drawingContext.lineWidth = 0.5;
            drawingContext.beginPath();
            drawingContext.moveTo(particles[a].x, particles[a].y);
            drawingContext.lineTo(particles[b].x, particles[b].y);
            drawingContext.stroke();
          }
        }
      }
    };

    const drawScene = (updateParticles: boolean) => {
      drawBackground();
      particles.forEach((particle) => {
        if (updateParticles) particle.update();
        particle.draw();
      });
      connect();
    };

    const stopAnimation = () => {
      isAnimating = false;
      animationGeneration += 1;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    const animate = (generation: number) => {
      animationFrameId = null;
      if (!isAnimating || generation !== animationGeneration || motionPreference.matches) return;
      drawScene(true);
      animationFrameId = requestAnimationFrame(() => animate(generation));
    };

    const startAnimation = () => {
      if (motionPreference.matches || animationFrameId !== null) return;
      isAnimating = true;
      animationGeneration += 1;
      const generation = animationGeneration;
      drawScene(true);
      animationFrameId = requestAnimationFrame(() => animate(generation));
    };

    const drawStaticScene = () => {
      drawScene(false);
    };

    const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        stopAnimation();
        drawStaticScene();
      } else {
        startAnimation();
      }
    };

    const onResize = () => {
      resize();
      if (motionPreference.matches) {
        drawStaticScene();
      }
    };

    resize();
    init();
    if (motionPreference.matches) drawStaticScene();
    else startAnimation();

    window.addEventListener('resize', onResize);
    motionPreference.addEventListener('change', onMotionPreferenceChange);

    return () => {
      stopAnimation();
      window.removeEventListener('resize', onResize);
      motionPreference.removeEventListener('change', onMotionPreferenceChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 bg-[#020403]"
      style={{ filter: 'contrast(1.2) brightness(0.8)' }}
    />
  );
}
