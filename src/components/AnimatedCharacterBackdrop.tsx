/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CanvasThemeType, AnimationControlsConfig } from '../utils/visualStudioData';
import { Loader2, AlertCircle, X, RotateCcw } from 'lucide-react';

export const VERIFIED_DEFAULT_WALLPAPER = '/wallpapers/jp_tokyo_cyberpunk.jpg';

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
  onWallpaperFallback?: (fallbackUrl: string) => void;
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
  onWallpaperFallback,
}: AnimatedCharacterBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  // Wallpaper Loading, Fallback & Crossfade State
  const [activeImageSrc, setActiveImageSrc] = useState<string>(() => wallpaperUrl || VERIFIED_DEFAULT_WALLPAPER);
  const [previousWorkingSrc, setPreviousWorkingSrc] = useState<string>(() => wallpaperUrl || VERIFIED_DEFAULT_WALLPAPER);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorInfo, setErrorInfo] = useState<{ message: string; failedUrl: string } | null>(null);
  const [isCrossfading, setIsCrossfading] = useState<boolean>(false);

  // Preload and validate wallpaper when wallpaperUrl prop changes
  useEffect(() => {
    // If no wallpaper is desired (pure canvas / dark theme)
    if (!wallpaperUrl) {
      setActiveImageSrc('');
      setIsLoading(false);
      setErrorInfo(null);
      return;
    }

    // If target URL is already the active source, nothing to do
    if (wallpaperUrl === activeImageSrc && !errorInfo) {
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setErrorInfo(null);

    const img = new Image();
    img.src = wallpaperUrl;

    img.onload = () => {
      if (isCancelled) return;
      setIsCrossfading(true);
      setPreviousWorkingSrc(activeImageSrc || VERIFIED_DEFAULT_WALLPAPER);
      setActiveImageSrc(wallpaperUrl);
      setIsLoading(false);
      setErrorInfo(null);
      setTimeout(() => setIsCrossfading(false), 400);
    };

    img.onerror = () => {
      if (isCancelled) return;
      setIsLoading(false);
      // Keep previous working wallpaper, do not blank out screen
      setErrorInfo({
        message: 'Could not load requested wallpaper image.',
        failedUrl: wallpaperUrl,
      });
      // If we don't even have a valid current wallpaper, fall back to verified default
      if (!activeImageSrc) {
        setActiveImageSrc(VERIFIED_DEFAULT_WALLPAPER);
      }
    };

    return () => {
      isCancelled = true;
    };
  }, [wallpaperUrl]);

  // Retry loading current wallpaper
  const handleRetry = useCallback(() => {
    if (!errorInfo) return;
    const targetUrl = errorInfo.failedUrl;
    setErrorInfo(null);
    setIsLoading(true);

    const retryImg = new Image();
    // Append timestamp cache-buster if external URL
    const cacheBuster = targetUrl.startsWith('http')
      ? `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}t=${Date.now()}`
      : targetUrl;
    retryImg.src = cacheBuster;

    retryImg.onload = () => {
      setActiveImageSrc(targetUrl);
      setPreviousWorkingSrc(targetUrl);
      setIsLoading(false);
      setErrorInfo(null);
    };

    retryImg.onerror = () => {
      setIsLoading(false);
      setErrorInfo({
        message: 'Retry failed. Retaining current wallpaper.',
        failedUrl: targetUrl,
      });
    };
  }, [errorInfo]);

  // Fallback to verified local wallpaper
  const handleUseDefault = useCallback(() => {
    setErrorInfo(null);
    setActiveImageSrc(VERIFIED_DEFAULT_WALLPAPER);
    setPreviousWorkingSrc(VERIFIED_DEFAULT_WALLPAPER);
    if (onWallpaperFallback) {
      onWallpaperFallback(VERIFIED_DEFAULT_WALLPAPER);
    }
  }, [onWallpaperFallback]);

  const isAnimated = !isStatic && !reducedMotion && controls?.enabled !== false && canvasTheme !== 'none';
  const intensity = controls?.intensity === 'low' ? 0.5 : controls?.intensity === 'high' ? 1.8 : 1.0;
  const speed = controls?.speed ?? 1.0;
  const energyColor = controls?.energyColor;

  // Clean atmospheric particle canvas simulation
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
      ) : activeImageSrc ? (
        /* ================= STATIC & DYNAMIC WALLPAPER IMAGE ================= */
        <img
          key={activeImageSrc}
          src={activeImageSrc}
          alt="Dashboard Wallpaper"
          className={`absolute inset-0 w-full h-full transition-all duration-700 ${
            isCrossfading ? 'opacity-80 scale-[1.01]' : 'opacity-100 scale-100'
          }`}
          style={{
            objectFit: scaling,
            filter: `blur(${blur}px) brightness(${brightness}%) saturate(${saturation}%)`,
          }}
          onError={() => {
            // If active image unexpectedly fails after mounting, fall back to previous or local default
            if (activeImageSrc !== VERIFIED_DEFAULT_WALLPAPER) {
              setActiveImageSrc(VERIFIED_DEFAULT_WALLPAPER);
            }
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

      {/* ================= LOADING INDICATOR ================= */}
      {isLoading && (
        <div className="fixed bottom-4 right-4 z-40 bg-black/80 backdrop-blur-md border border-cyan-400/40 text-cyan-300 px-3.5 py-2 rounded-2xl text-xs flex items-center gap-2.5 shadow-2xl animate-in fade-in zoom-in-95 pointer-events-auto">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          <span className="font-medium tracking-wide">Applying wallpaper...</span>
        </div>
      )}

      {/* ================= ERROR NOTIFICATION WITH RETRY & DEFAULT ================= */}
      {errorInfo && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900/90 backdrop-blur-md border border-rose-500/50 text-white px-4 py-2.5 rounded-2xl text-xs flex items-center gap-3 shadow-2xl pointer-events-auto max-w-md animate-in slide-in-from-bottom-3 duration-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <div className="flex-1 min-w-0 pr-1">
            <p className="font-semibold text-rose-300 text-xs truncate">Image unavailable</p>
            <p className="text-[10px] text-slate-300/80">Retained previous wallpaper</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleRetry}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg text-[10px] font-bold text-white transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Retry</span>
            </button>
            <button
              onClick={handleUseDefault}
              className="px-2.5 py-1 bg-cyan-500/25 hover:bg-cyan-500/35 border border-cyan-500/40 text-cyan-300 rounded-lg text-[10px] font-bold transition cursor-pointer"
            >
              Default
            </button>
            <button
              onClick={() => setErrorInfo(null)}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
