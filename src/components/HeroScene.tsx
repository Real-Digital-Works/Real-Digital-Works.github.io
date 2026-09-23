"use client";

import { useEffect, useRef } from "react";

const FADE_MS = 500;
const HOLD_MS = 12000;
const GAP_MS = 100;
const CYCLE_MS = FADE_MS + HOLD_MS + FADE_MS + GAP_MS;

function fadeAt(elapsed: number) {
  const t = elapsed % CYCLE_MS;
  if (t < FADE_MS) return t / FADE_MS;
  if (t < FADE_MS + HOLD_MS) return 1;
  if (t < FADE_MS + HOLD_MS + FADE_MS) {
    return 1 - (t - FADE_MS - HOLD_MS) / FADE_MS;
  }
  return 0;
}

export function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let start = performance.now();
    let visible = true;
    let light = document.documentElement.getAttribute("data-theme") === "light";

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, width * dpr);
      canvas.height = Math.max(1, height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const paint = (now: number) => {
      const { width, height } = canvas.getBoundingClientRect();
      const t = (now - start) / 1000;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = light ? "#eef2f7" : "#121820";
      ctx.fillRect(0, 0, width, height);

      const x1 = (0.78 + Math.sin(t * 0.18) * 0.06) * width;
      const y1 = (0.16 + Math.cos(t * 0.13) * 0.05) * height;
      const key = ctx.createRadialGradient(x1, y1, 0, x1, y1, Math.max(width, height) * 0.55);
      key.addColorStop(0, light ? "rgba(24,87,236,0.22)" : "rgba(26,152,251,0.42)");
      key.addColorStop(0.35, light ? "rgba(26,152,251,0.12)" : "rgba(24,87,236,0.16)");
      key.addColorStop(1, "rgba(24,87,236,0)");
      ctx.fillStyle = key;
      ctx.fillRect(0, 0, width, height);

      const x2 = (0.22 + Math.cos(t * 0.11) * 0.08) * width;
      const y2 = (0.72 + Math.sin(t * 0.09) * 0.07) * height;
      const fill = ctx.createRadialGradient(x2, y2, 0, x2, y2, width * 0.42);
      fill.addColorStop(0, light ? "rgba(11,127,168,0.12)" : "rgba(25,219,253,0.14)");
      fill.addColorStop(1, "rgba(25,219,253,0)");
      ctx.fillStyle = fill;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalCompositeOperation = light ? "multiply" : "lighter";
      ctx.translate(width * 0.55, height * 0.4);
      ctx.rotate(-0.18 + Math.sin(t * 0.07) * 0.04);
      const leak = ctx.createLinearGradient(-width, 0, width, 0);
      leak.addColorStop(0, "rgba(24,87,236,0)");
      leak.addColorStop(0.5, `rgba(26,152,251,${0.07 + Math.sin(t * 0.4) * 0.03})`);
      leak.addColorStop(1, "rgba(24,87,236,0)");
      ctx.fillStyle = leak;
      ctx.fillRect(-width, -height * 0.08, width * 2, height * 0.16);
      ctx.restore();
    };

    const tick = (now: number) => {
      if (!visible) return;
      paint(now);
      wrap.style.opacity = String(fadeAt(now - start));
      raf = requestAnimationFrame(tick);
    };

    resize();

    if (reduce) {
      paint(start);
      wrap.style.opacity = "1";
      return;
    }

    wrap.style.opacity = "0";
    raf = requestAnimationFrame(tick);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          start = performance.now() - ((performance.now() - start) % CYCLE_MS);
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.05 },
    );
    io.observe(wrap);

    const onVis = () => {
      if (document.hidden) {
        visible = false;
        cancelAnimationFrame(raf);
      } else {
        visible = true;
        raf = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    const onTheme = () => {
      light = document.documentElement.getAttribute("data-theme") === "light";
    };
    window.addEventListener("rdw:theme", onTheme);
    const mo = new MutationObserver(onTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("rdw:theme", onTheme);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="hero-plate pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
