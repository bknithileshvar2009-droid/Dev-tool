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
  type?: 'ember' | 'rune' | 'smoke' | 'spark' | 'ring';
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
  activeThemeId,
}: AnimatedCharacterBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  const isAnimated = !isStatic && !reducedMotion && controls?.enabled !== false;
  const intensity = controls?.intensity === 'low' ? 0.5 : controls?.intensity === 'high' ? 1.8 : 1.0;
  const speed = controls?.speed ?? 1.0;
  const energyColor = controls?.energyColor;

  const isDoomTheme =
    canvasTheme === 'doom-animated' ||
    activeThemeId === 'hero-doctor-doom';
  const isIronManTheme =
    canvasTheme === 'ironman-animated' ||
    activeThemeId === 'hero-iron-man';
  const isStandoffTheme =
    canvasTheme === 'doom-vs-ironman-animated' ||
    activeThemeId === 'hero-doom-vs-ironman';
  const isCivilWarTheme =
    canvasTheme === 'civil-war-animated' ||
    activeThemeId === 'hero-civil-war';

  // Canvas Particle & Energy Simulation
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

      if (isDoomTheme) {
        const count = Math.round(45 * intensity);
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * (canvas.width * 0.45),
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.4) * 0.6 * speed,
            vy: -(Math.random() * 0.8 + 0.3) * speed,
            size: Math.random() * 3.5 + 1,
            alpha: Math.random() * 0.7 + 0.2,
            color: energyColor || (Math.random() > 0.3 ? '#10b981' : '#34d399'),
            maxLife: 200,
            life: Math.random() * 200,
            type: Math.random() > 0.4 ? 'rune' : 'smoke',
          });
        }
      } else if (isIronManTheme) {
        const count = Math.round(50 * intensity);
        for (let i = 0; i < count; i++) {
          particles.push({
            x: canvas.width * 0.55 + Math.random() * (canvas.width * 0.45),
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.8 * speed,
            vy: -(Math.random() * 1.2 + 0.4) * speed,
            size: Math.random() * 2.5 + 0.8,
            alpha: Math.random() * 0.8 + 0.2,
            color: energyColor || (Math.random() > 0.5 ? '#00f0ff' : Math.random() > 0.3 ? '#fbbf24' : '#ef4444'),
            maxLife: 180,
            life: Math.random() * 180,
            type: Math.random() > 0.5 ? 'spark' : 'ember',
          });
        }
      } else if (isStandoffTheme) {
        const count = Math.round(60 * intensity);
        for (let i = 0; i < count; i++) {
          const isLeft = Math.random() > 0.5;
          particles.push({
            x: isLeft ? Math.random() * (canvas.width * 0.38) : canvas.width * 0.62 + Math.random() * (canvas.width * 0.38),
            y: Math.random() * canvas.height,
            vx: (isLeft ? (Math.random() - 0.3) : (Math.random() - 0.7)) * 0.7 * speed,
            vy: -(Math.random() * 1.0 + 0.4) * speed,
            size: Math.random() * 3 + 1,
            alpha: Math.random() * 0.75 + 0.2,
            color: isLeft ? (energyColor || '#10b981') : '#00f0ff',
            maxLife: 190,
            life: Math.random() * 190,
            type: isLeft ? 'rune' : 'spark',
          });
        }
      } else if (canvasTheme === 'matrix' || canvasTheme === 'digital-rain') {
        const cols = Math.floor(canvas.width / 20);
        matrixCols = [];
        for (let i = 0; i < cols; i++) {
          matrixCols[i] = Math.random() * -100;
        }
      } else if (canvasTheme === 'aurora' || canvasTheme === 'nebula' || canvasTheme === 'fireflies' || canvasTheme === 'embers') {
        const count = Math.round(55 * intensity);
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5 * speed,
            vy: (Math.random() - 0.5) * 0.5 * speed,
            size: Math.random() * 3 + 1,
            alpha: Math.random() * 0.8 + 0.2,
            color: canvasTheme === 'embers' ? '#ef4444' : canvasTheme === 'fireflies' ? '#fbbf24' : '#38bdf8',
            maxLife: 200,
            life: Math.random() * 200,
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

      // 1. DOCTOR DOOM LATVERIAN GREEN ENERGY & RUNIC SMOKE
      if (isDoomTheme) {
        const pulse = Math.sin(now * 0.002 * speed) * 0.2 + 0.8;
        const helmX = canvas.width * 0.2;
        const helmY = canvas.height * 0.45;

        // Ambient emerald Latverian glow orb behind mask
        const doomGlow = ctx.createRadialGradient(helmX, helmY, 10, helmX, helmY, canvas.height * 0.55);
        doomGlow.addColorStop(0, `rgba(16, 185, 129, ${0.18 * pulse * intensity})`);
        doomGlow.addColorStop(0.5, `rgba(5, 150, 105, ${0.08 * pulse * intensity})`);
        doomGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = doomGlow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Mystic rune particle simulation
        particles.forEach(p => {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life += dt;

          if (p.life > p.maxLife || p.y < -20 || p.x < -20 || p.x > canvas.width * 0.55) {
            p.x = helmX + (Math.random() - 0.5) * 260;
            p.y = helmY + 80 + Math.random() * 100;
            p.life = 0;
            p.alpha = Math.random() * 0.7 + 0.2;
          }

          const currentAlpha = Math.sin((p.life / p.maxLife) * Math.PI) * p.alpha;
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = currentAlpha;
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.restore();
        });
      }

      // 2. IRON MAN ARC REACTOR CYAN PULSE & GOLD/CRIMSON SPARKS
      else if (isIronManTheme) {
        const pulse = Math.sin(now * 0.0035 * speed) * 0.25 + 0.75;
        const arcX = canvas.width * 0.78;
        const arcY = canvas.height * 0.42;

        // Arc reactor cyan-white radiant core
        const arcGlow = ctx.createRadialGradient(arcX, arcY, 5, arcX, arcY, canvas.height * 0.48);
        arcGlow.addColorStop(0, `rgba(0, 240, 255, ${0.28 * pulse * intensity})`);
        arcGlow.addColorStop(0.3, `rgba(6, 182, 212, ${0.12 * pulse * intensity})`);
        arcGlow.addColorStop(0.7, `rgba(239, 68, 68, ${0.05 * pulse * intensity})`);
        arcGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = arcGlow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Repulsor ring expansion wave
        const ringRadius = ((now * 0.08 * speed) % 240) + 20;
        const ringAlpha = (1 - ringRadius / 260) * 0.22 * intensity;
        ctx.save();
        ctx.beginPath();
        ctx.arc(arcX, arcY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 240, 255, ${ringAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Rising embers & sparks
        particles.forEach(p => {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life += dt;

          if (p.life > p.maxLife || p.y < -20 || p.x < canvas.width * 0.45) {
            p.x = arcX + (Math.random() - 0.5) * 180;
            p.y = arcY + 40 + Math.random() * 80;
            p.life = 0;
            p.alpha = Math.random() * 0.85 + 0.15;
          }

          const currentAlpha = Math.sin((p.life / p.maxLife) * Math.PI) * p.alpha;
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = currentAlpha;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
        });
      }

      // 3. DOCTOR DOOM VS IRON MAN CINEMATIC STANDOFF DUAL CLASH
      else if (isStandoffTheme) {
        const leftPulse = Math.sin(now * 0.002 * speed) * 0.2 + 0.8;
        const rightPulse = Math.cos(now * 0.003 * speed) * 0.25 + 0.75;
        const doomX = canvas.width * 0.16;
        const doomY = canvas.height * 0.45;
        const ironX = canvas.width * 0.84;
        const ironY = canvas.height * 0.45;

        // Left Doom emerald aura
        const doomAura = ctx.createRadialGradient(doomX, doomY, 10, doomX, doomY, canvas.height * 0.5);
        doomAura.addColorStop(0, `rgba(16, 185, 129, ${0.2 * leftPulse * intensity})`);
        doomAura.addColorStop(0.5, `rgba(5, 150, 105, ${0.07 * leftPulse * intensity})`);
        doomAura.addColorStop(1, 'transparent');
        ctx.fillStyle = doomAura;
        ctx.fillRect(0, 0, canvas.width * 0.5, canvas.height);

        // Right Iron Man cyan/crimson arc aura
        const ironAura = ctx.createRadialGradient(ironX, ironY, 10, ironX, ironY, canvas.height * 0.5);
        ironAura.addColorStop(0, `rgba(0, 240, 255, ${0.22 * rightPulse * intensity})`);
        ironAura.addColorStop(0.4, `rgba(239, 68, 68, ${0.08 * rightPulse * intensity})`);
        ironAura.addColorStop(1, 'transparent');
        ctx.fillStyle = ironAura;
        ctx.fillRect(canvas.width * 0.5, 0, canvas.width * 0.5, canvas.height);

        // Center sky atmospheric clash arc (never obstructing the study clock)
        const clashX = canvas.width * 0.5;
        const clashY = canvas.height * 0.15;
        const clashGlow = ctx.createRadialGradient(clashX, clashY, 5, clashX, clashY, 160);
        clashGlow.addColorStop(0, `rgba(255, 255, 255, ${0.12 * Math.sin(now * 0.005) * intensity})`);
        clashGlow.addColorStop(0.5, `rgba(16, 185, 129, ${0.06 * intensity})`);
        clashGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = clashGlow;
        ctx.fillRect(canvas.width * 0.35, 0, canvas.width * 0.3, canvas.height * 0.3);

        // Standoff particles on both flanks
        particles.forEach(p => {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life += dt;

          const isLeft = p.color.includes('185') || p.color.includes('green') || p.color.includes('10b981');
          if (p.life > p.maxLife || p.y < -20) {
            p.x = isLeft ? doomX + (Math.random() - 0.5) * 200 : ironX + (Math.random() - 0.5) * 200;
            p.y = (isLeft ? doomY : ironY) + 40 + Math.random() * 80;
            p.life = 0;
            p.alpha = Math.random() * 0.75 + 0.2;
          }

          const currentAlpha = Math.sin((p.life / p.maxLife) * Math.PI) * p.alpha;
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = currentAlpha;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
        });
      }

      // 4. MATRIX / DIGITAL RAIN
      else if (canvasTheme === 'matrix' || canvasTheme === 'digital-rain') {
        ctx.fillStyle = 'rgba(3, 4, 7, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = energyColor || (canvasTheme === 'digital-rain' ? '#00f0ff' : '#22c55e');
        ctx.font = '13px monospace';
        matrixCols.forEach((y, i) => {
          const char = String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96));
          ctx.fillText(char, i * 20, y);
          if (y > canvas.height && Math.random() > 0.975) {
            matrixCols[i] = 0;
          } else {
            matrixCols[i] = y + 16 * speed * intensity;
          }
        });
      }

      // 5. AURORA BOREALIS
      else if (canvasTheme === 'aurora') {
        const t = now * 0.0008 * speed * intensity;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(0, canvas.height * 0.5);
          for (let x = 0; x <= canvas.width; x += 40) {
            const y = Math.sin(x * 0.003 + t + i) * 70 + Math.sin(x * 0.007 - t) * 35 + (canvas.height * 0.4 + i * 45);
            ctx.lineTo(x, y);
          }
          ctx.lineTo(canvas.width, canvas.height);
          ctx.lineTo(0, canvas.height);
          ctx.closePath();
          ctx.fillStyle = i === 0 ? 'rgba(52, 211, 153, 0.08)' : i === 1 ? 'rgba(56, 189, 248, 0.06)' : 'rgba(168, 85, 247, 0.05)';
          ctx.fill();
        }
      }

      // 6. GENERAL PARTICLES (Nebula / Fireflies / Embers)
      else if (particles.length > 0) {
        particles.forEach(p => {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [
    canvasTheme,
    activeThemeId,
    isAnimated,
    intensity,
    speed,
    energyColor,
    isDoomTheme,
    isIronManTheme,
    isStandoffTheme,
  ]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {/* ================= OPTIMIZED VIDEO BACKGROUND ================= */}
      {videoUrl && !videoFailed && !isStatic ? (
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
        /* ================= STATIC WALLPAPER IMAGE (WITH ERROR FALLBACK) ================= */
        <img
          src={wallpaperUrl}
          alt="Wallpaper"
          className="absolute inset-0 w-full h-full transition-opacity duration-700"
          style={{
            objectFit: scaling,
            filter: `blur(${blur}px) brightness(${brightness}%) saturate(${saturation}%)`,
          }}
          onError={e => {
            // Elegant fallback gradient if image fails to load
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : null}

      {/* ================= CINEMATIC CHARACTER SILHOUETTES / ART LAYER ================= */}
      {/* 1. DOCTOR DOOM CHARACTER SILHOUETTE (LEFT FLANK / CUSTOM FOCAL) */}
      {isDoomTheme && (
        <div
          className={`absolute bottom-0 top-0 w-full lg:w-1/2 pointer-events-none transition-transform duration-700 ${
            controls?.focalPosition === 'center' ? 'left-1/4' : controls?.focalPosition === 'right' ? 'right-0' : 'left-0'
          } ${isAnimated ? 'animate-pulse' : ''}`}
          style={{
            opacity: ((controls?.overlayOpacity ?? 88) / 100),
            transform: `scale(${(controls?.characterScale ?? 100) / 100})`,
            transformOrigin: controls?.focalPosition === 'right' ? 'bottom right' : 'bottom left',
            maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 45%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 45%, transparent 100%)',
          }}
        >
          {/* Stylized vector representation of Doctor Doom Titanium Mask and Emerald Hood */}
          <svg viewBox="0 0 800 1000" className="w-full h-full max-h-screen object-cover fill-current text-[#0c1a14]/90" preserveAspectRatio="xMinYMid meet">
            <defs>
              <linearGradient id="doomMetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#475569" stopOpacity="0.85" />
                <stop offset="35%" stopColor="#1e293b" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#0f172a" stopOpacity="0.98" />
                <stop offset="100%" stopColor="#052e16" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="doomHoodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#065f46" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#022c22" stopOpacity="0.96" />
                <stop offset="100%" stopColor="#02140d" stopOpacity="0.98" />
              </linearGradient>
              <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Latverian Emerald Hood & Cowl */}
            <path
              d="M120,100 C280,30 460,80 520,240 C560,360 540,540 500,720 C460,880 400,1000 320,1000 L0,1000 L0,220 C40,160 80,120 120,100 Z"
              fill="url(#doomHoodGrad)"
              stroke="rgba(16, 185, 129, 0.3)"
              strokeWidth="2"
            />

            {/* Doctor Doom Titanium Mask Armor Plate */}
            <path
              d="M200,240 C280,210 380,210 440,250 C480,290 490,380 470,480 C450,560 410,640 330,680 C260,700 210,640 180,520 C160,400 170,270 200,240 Z"
              fill="url(#doomMetalGrad)"
              stroke="rgba(203, 213, 225, 0.45)"
              strokeWidth="3"
            />

            {/* Glowing Emerald Eyes */}
            <ellipse cx="270" cy="360" rx="24" ry="10" fill={energyColor || '#10b981'} filter="url(#emeraldGlow)" opacity="0.95" />
            <ellipse cx="370" cy="360" rx="24" ry="10" fill={energyColor || '#10b981'} filter="url(#emeraldGlow)" opacity="0.95" />

            {/* Rivets and Mask Seams */}
            <circle cx="210" cy="270" r="4" fill="#cbd5e1" opacity="0.7" />
            <circle cx="430" cy="270" r="4" fill="#cbd5e1" opacity="0.7" />
            <circle cx="320" cy="650" r="5" fill="#cbd5e1" opacity="0.7" />
            <path d="M320,380 L320,580 M270,520 L370,520 M260,560 L380,560" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* 2. IRON MAN CHARACTER SILHOUETTE (RIGHT FLANK / CUSTOM FOCAL) */}
      {isIronManTheme && (
        <div
          className={`absolute bottom-0 top-0 w-full lg:w-1/2 pointer-events-none transition-transform duration-700 ${
            controls?.focalPosition === 'center' ? 'right-1/4' : controls?.focalPosition === 'left' ? 'left-0' : 'right-0'
          } ${isAnimated ? 'animate-pulse' : ''}`}
          style={{
            opacity: ((controls?.overlayOpacity ?? 90) / 100),
            transform: `scale(${(controls?.characterScale ?? 100) / 100})`,
            transformOrigin: controls?.focalPosition === 'left' ? 'bottom left' : 'bottom right',
            maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 45%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 45%, transparent 100%)',
          }}
        >
          <svg viewBox="0 0 800 1000" className="w-full h-full max-h-screen object-cover ml-auto" preserveAspectRatio="xMaxYMid meet">
            <defs>
              <linearGradient id="ironCrimsonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#991b1b" stopOpacity="0.95" />
                <stop offset="40%" stopColor="#dc2626" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#450a0a" stopOpacity="0.98" />
              </linearGradient>
              <linearGradient id="ironGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#d97706" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#78350f" stopOpacity="0.95" />
              </linearGradient>
              <filter id="arcCyanGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Iron Man Mark 85 Torso & Shoulder Armor */}
            <path
              d="M480,260 C540,140 680,100 800,160 L800,1000 L380,1000 C340,860 380,680 420,520 C440,420 460,340 480,260 Z"
              fill="url(#ironCrimsonGrad)"
              stroke="rgba(239, 68, 68, 0.45)"
              strokeWidth="2"
            />

            {/* Gold Faceplate / Chest Accent Plate */}
            <path
              d="M520,300 C580,240 660,240 700,300 C740,360 740,460 710,540 C670,610 570,620 520,560 C490,500 480,380 520,300 Z"
              fill="url(#ironGoldGrad)"
              stroke="rgba(251, 191, 36, 0.55)"
              strokeWidth="2.5"
            />

            {/* Triangular / Circular Arc Reactor */}
            <circle cx="560" cy="620" r="32" fill={energyColor || '#00f0ff'} filter="url(#arcCyanGlow)" opacity="0.95" />
            <polygon points="560,598 584,638 536,638" fill="#ffffff" opacity="0.9" />
            <circle cx="560" cy="620" r="44" stroke={energyColor || '#00f0ff'} strokeWidth="2" fill="none" opacity="0.6" strokeDasharray="6,4" />

            {/* Slit Cyan Helmet Eyes */}
            <polygon points="560,360 600,364 590,374 560,368" fill={energyColor || '#00f0ff'} filter="url(#arcCyanGlow)" />
            <polygon points="630,364 670,360 670,368 640,374" fill={energyColor || '#00f0ff'} filter="url(#arcCyanGlow)" />
          </svg>
        </div>
      )}

      {/* 3. DOCTOR DOOM VS IRON MAN STANDOFF (DUAL SPLIT FLANKS, CENTER VOID) */}
      {isStandoffTheme && (
        <div className="absolute inset-0 w-full h-full pointer-events-none flex justify-between overflow-hidden">
          {/* Left Flank: Doctor Doom facing center */}
          <div
            className={`w-1/2 lg:w-5/12 h-full pointer-events-none relative ${isAnimated ? 'animate-pulse' : ''}`}
            style={{
              opacity: ((controls?.overlayOpacity ?? 82) / 100),
              transform: `scale(${(controls?.characterScale ?? 100) / 100})`,
              transformOrigin: 'bottom left',
              maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 50%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 50%, transparent 100%)',
            }}
          >
            <div className="absolute left-6 top-1/4 w-72 h-96 rounded-full bg-emerald-600/20 blur-3xl" />
            <svg viewBox="0 0 800 1000" className="w-full h-full max-h-screen object-cover" preserveAspectRatio="xMinYMid meet">
              <defs>
                <linearGradient id="standoffDoomHood" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#065f46" stopOpacity="0.92" />
                  <stop offset="100%" stopColor="#021f15" stopOpacity="0.98" />
                </linearGradient>
                <linearGradient id="standoffDoomMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#64748b" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#1e293b" stopOpacity="0.98" />
                  <stop offset="100%" stopColor="#064e3b" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              <path d="M120,100 C280,30 460,80 520,240 C560,360 540,540 500,720 C460,880 400,1000 320,1000 L0,1000 L0,220 Z" fill="url(#standoffDoomHood)" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="2" />
              <path d="M200,240 C280,210 380,210 440,250 C480,290 490,380 470,480 C450,560 410,640 330,680 C260,700 210,640 180,520 C160,400 170,270 200,240 Z" fill="url(#standoffDoomMetal)" stroke="rgba(203, 213, 225, 0.5)" strokeWidth="2.5" />
              <ellipse cx="270" cy="360" rx="22" ry="9" fill="#10b981" filter="drop-shadow(0 0 8px #10b981)" opacity="0.95" />
              <ellipse cx="370" cy="360" rx="22" ry="9" fill="#10b981" filter="drop-shadow(0 0 8px #10b981)" opacity="0.95" />
            </svg>
          </div>

          {/* Right Flank: Iron Man facing center */}
          <div
            className={`w-1/2 lg:w-5/12 h-full pointer-events-none relative ${isAnimated ? 'animate-pulse' : ''}`}
            style={{
              opacity: ((controls?.overlayOpacity ?? 85) / 100),
              transform: `scale(${(controls?.characterScale ?? 100) / 100})`,
              transformOrigin: 'bottom right',
              maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, transparent 100%)',
            }}
          >
            <div className="absolute right-6 top-1/4 w-72 h-96 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="absolute right-12 top-1/3 w-64 h-64 rounded-full bg-red-600/15 blur-3xl" />
            <svg viewBox="0 0 800 1000" className="w-full h-full max-h-screen object-cover ml-auto" preserveAspectRatio="xMaxYMid meet">
              <defs>
                <linearGradient id="standoffIronCrimson" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#b91c1c" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#450a0a" stopOpacity="0.98" />
                </linearGradient>
                <linearGradient id="standoffIronGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#78350f" stopOpacity="0.95" />
                </linearGradient>
              </defs>
              <path d="M480,260 C540,140 680,100 800,160 L800,1000 L380,1000 C340,860 380,680 420,520 C440,420 460,340 480,260 Z" fill="url(#standoffIronCrimson)" stroke="rgba(239, 68, 68, 0.45)" strokeWidth="2" />
              <path d="M520,300 C580,240 660,240 700,300 C740,360 740,460 710,540 C670,610 570,620 520,560 C490,500 480,380 520,300 Z" fill="url(#standoffIronGold)" stroke="rgba(251, 191, 36, 0.55)" strokeWidth="2" />
              <circle cx="560" cy="620" r="30" fill="#00f0ff" filter="drop-shadow(0 0 10px #00f0ff)" opacity="0.95" />
              <polygon points="560,360 600,364 590,374 560,368" fill="#00f0ff" filter="drop-shadow(0 0 6px #00f0ff)" />
              <polygon points="630,364 670,360 670,368 640,374" fill="#00f0ff" filter="drop-shadow(0 0 6px #00f0ff)" />
            </svg>
          </div>
        </div>
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
