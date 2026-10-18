'use client';

import React, { useEffect, useRef } from 'react';

interface ChristmasCanvasEffectsProps {
  showSnow: boolean;
  showSparkles: boolean;
}

interface Flake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  drift: number;
  driftSpeed: number;
  opacity: number;
  color: string;
}

interface Sparkle {
  x: number;
  y: number;
  size: number;
  maxSize: number;
  alpha: number;
  phase: number;
  speed: number;
  color: string;
}

export default function ChristmasCanvasEffects({
  showSnow,
  showSparkles
}: ChristmasCanvasEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!showSnow && !showSparkles) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isPaused = false;

    // Detectar preferencias de accesibilidad
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return;
    }

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Cantidad equilibrada y visible según pantalla
    const isMobile = width < 768;
    const flakeCount = showSnow ? (isMobile ? 35 : 70) : 0;
    const sparkleCount = showSparkles ? (isMobile ? 12 : 24) : 0;

    // Paleta Lumira Beauty: Blanco puro, rosa suave empolvado, champán delicado
    const flakeColors = [
      'rgba(255, 255, 255,',
      'rgba(255, 245, 252,',
      'rgba(255, 230, 242,',
      'rgba(254, 248, 235,'
    ];

    const flakes: Flake[] = [];
    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.8 + 1.2,
        speed: Math.random() * 1.2 + 0.6,
        drift: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 0.018 + 0.006,
        opacity: Math.random() * 0.4 + 0.6,
        color: flakeColors[Math.floor(Math.random() * flakeColors.length)]
      });
    }

    const sparkleColors = ['#FFFFFF', '#FDF8E8', '#FFEBF4', '#F9E2B8', '#FFD1E6'];
    const sparkles: Sparkle[] = [];
    for (let i = 0; i < sparkleCount; i++) {
      sparkles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0,
        maxSize: Math.random() * 5 + 4,
        alpha: 0,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.024 + 0.012,
        color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)]
      });
    }

    const draw4PointStar = (
      context: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      size: number,
      color: string,
      alpha: number
    ) => {
      context.save();
      context.translate(cx, cy);
      context.globalAlpha = Math.max(0, Math.min(1, alpha));
      context.fillStyle = color;
      context.shadowColor = '#FF94C2';
      context.shadowBlur = 8;

      context.beginPath();
      const arm = size;
      const inner = size * 0.22;
      context.moveTo(0, -arm);
      context.quadraticCurveTo(0, -inner, inner, 0);
      context.quadraticCurveTo(0, inner, 0, arm);
      context.quadraticCurveTo(0, inner, -inner, 0);
      context.quadraticCurveTo(0, -inner, 0, -arm);
      context.fill();

      // Centro blanco brillante luminoso
      context.beginPath();
      context.arc(0, 0, inner * 0.9, 0, Math.PI * 2);
      context.fillStyle = '#FFFFFF';
      context.fill();

      context.restore();
    };

    const handleVisibility = () => {
      isPaused = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const render = () => {
      if (!isPaused) {
        ctx.clearRect(0, 0, width, height);

        // 1. Renderizar Nieve
        if (showSnow) {
          for (let i = 0; i < flakes.length; i++) {
            const f = flakes[i];
            f.y += f.speed;
            f.drift += f.driftSpeed;
            f.x += Math.sin(f.drift) * 0.75;

            // Re-envolver al salir del viewport
            if (f.y > height + 10) {
              f.y = -10;
              f.x = Math.random() * width;
            }
            if (f.x > width + 10) {
              f.x = -10;
            } else if (f.x < -10) {
              f.x = width + 10;
            }

            ctx.beginPath();
            ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
            ctx.fillStyle = `${f.color} ${f.opacity})`;
            // Sombra suave en rosa para que contraste tanto en fondos blancos como oscuros
            ctx.shadowColor = 'rgba(214, 51, 108, 0.4)';
            ctx.shadowBlur = f.radius > 2.5 ? 4 : 2;
            ctx.fill();
          }
        }

        // 2. Renderizar Destellos Luminosos
        if (showSparkles) {
          for (let i = 0; i < sparkles.length; i++) {
            const s = sparkles[i];
            s.phase += s.speed;
            const sinVal = Math.sin(s.phase);
            s.alpha = Math.max(0, sinVal * 0.95);
            s.size = Math.max(0, sinVal * s.maxSize);

            if (s.phase > Math.PI * 2) {
              s.phase = 0;
              s.x = Math.random() * width;
              s.y = Math.random() * height;
            }

            if (s.alpha > 0.05 && s.size > 0.5) {
              draw4PointStar(ctx, s.x, s.y, s.size, s.color, s.alpha);
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
      }
    };
  }, [showSnow, showSparkles]);

  if (!showSnow && !showSparkles) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[65] w-full h-full"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    />
  );
}
