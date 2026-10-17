/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { CanvasThemeType, AnimationControlsConfig } from '../utils/visualStudioData';

interface AnimatedCharacterBackdropProps {
  canvasTheme: CanvasThemeType;
  wallpaperUrl: string;
  videoUrl?: string;
  isStatic?: boolean;
  reducedMotion?: boolean;
  dimmer?: number;
  blur?: number;
  brightness?: number;
  saturation?: number;
  scaling?: 'cover' | 'contain' | 'fill';
  controls?: Partial<AnimationControlsConfig>;
  activeThemeId?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  maxLife: number;
  life: number;
}

export default function AnimatedCharacterBackdrop({
  canvasTheme,
  wallpaperUrl,
  videoUrl,
  isStatic = false,
  reducedMotion = false,
  dimmer = 30,
  blur = 0,
  brightness = 100,
  saturation = 100,
  scaling = 'cover',
  controls,
}: AnimatedCharacterBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  const isAnimated = !isStatic && !reducedMotion && controls?.enabled !== false && canvasTheme !== 'none';
  const intensity = controls?.intensity === 'low' ? 0.5 : controls?.intensity === 'high' ? 1.8 : 1.0;
  const speed = controls?.speed ?? 1.0;
  const energyColor = controls?.energyColor;

  // Clean atmospheric particle canvas simulation (No avatars or character silhouettes)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    let matrixCols: number[] = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];

      if (canvasTheme === 'matrix' || canvasTheme === 'digital-rain') {
        const cols = Math.floor(canvas.width / 20);
        matrixCols = [];
        for (let i = 0; i < cols; i++) {
          matrixCols[i] = Math.random() * -100;
        }
      } else if (
        canvasTheme === 'aurora' ||
        canvasTheme === 'nebula' ||
        canvasTheme === 'fireflies' ||
        canvasTheme === 'embers' ||
        canvasTheme === 'cyberpunk' ||
        canvasTheme === 'warp-speed' ||
        canvasTheme === 'thunder'
      ) {
        const count = Math.round(50 * intensity);
        for (let i = 0; i < count; i++) {
          const defaultColor =
            canvasTheme === 'embers'
              ? '#f59e0b'
              : canvasTheme === 'fireflies'
              ? '#fbbf24'
              : canvasTheme === 'nebula'
              ? '#818cf8'
              : canvasTheme === 'cyberpunk'
              ? '#c084fc'
              : '#06b6d4';

          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5 * speed,
            vy: -(Math.random() * 0.6 + 0.2) * speed,
            size: Math.random() * 2.5 + 1,
            alpha: Math.random() * 0.7 + 0.2,
            color: energyColor || defaultColor,
            maxLife: 220,
            life: Math.random() * 220,
          });
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min(32, now - lastTime) / 16;
      lastTime = now;

      if (!isAnimated) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Atmospheric Code Stream / Matrix
      if (canvasTheme === 'matrix' || canvasTheme === 'digital-rain') {
        ctx.fillStyle = 'rgba(0, 240, 255, 0.65)';
        ctx.font = '12px "JetBrains Mono", monospace';
        const characters = '0123456789ABCDEF<>/*+~-';

        for (let i = 0; i < matrixCols.length; i++) {
          const char = characters.charAt(Math.floor(Math.random() * characters.length));
          const x = i * 20;
          const y = matrixCols[i];

          ctx.fillText(char, x, y);

          if (y > canvas.height && Math.random() > 0.985) {
            matrixCols[i] = 0;
          } else {
            matrixCols[i] += 10 * speed * dt;
          }
        }
      } else if (particles.length > 0) {
        // Floating ambient study particles & stars
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life += dt;

          if (p.life >= p.maxLife || p.y < -20 || p.x < -20 || p.x > canvas.width + 20) {
            p.x = Math.random() * canvas.width;
            p.y = canvas.height + 10;
            p.life = 0;
            p.alpha = Math.random() * 0.7 + 0.2;
          }

          const currentAlpha = p.alpha * Math.sin((p.life / p.maxLife) * Math.PI);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, Math.min(1, currentAlpha));
          ctx.shadowBlur = p.size * 3;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1.0;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [canvasTheme, isAnimated, intensity, speed, energyColor]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {/* ================= ATMOSPHERIC VIDEO WALLPAPER LAYER ================= */}
      {videoUrl && !videoFailed ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoFailed(true)}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{
            filter: `blur(${blur}px) brightness(${brightness}%) saturate(${saturation}%)`,
          }}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
        </video>
      ) : wallpaperUrl ? (
        /* ================= STATIC WALLPAPER IMAGE ================= */
        <img
          src={wallpaperUrl}
          alt="Wallpaper"
          className="absolute inset-0 w-full h-full transition-opacity duration-700"
          style={{
            objectFit: scaling,
            filter: `blur(${blur}px) brightness(${brightness}%) saturate(${saturation}%)`,
          }}
          onError={e => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        /* Minimal Pure Dark Background Fallback */
        <div className="absolute inset-0 w-full h-full bg-[#030407]" />
      )}

      {/* ================= HARDWARE ACCELERATED CANVAS FX LAYER ================= */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* ================= BACKGROUND DIMMER & VIGNETTE ================= */}
      <div
        className="absolute inset-0 pointer-events-none z-[2] transition-colors duration-300"
        style={{ backgroundColor: `rgba(0, 0, 0, ${dimmer / 100})` }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-[3]"
        style={{
          background: 'radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.7) 100%)',
        }}
      />
    </div>
  );
}
