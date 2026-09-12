"use client";

import { useEffect, useRef } from "react";

type NodeP = { x: number; y: number; vx: number; vy: number };

export function HeroScene() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const pointer = { x: 0.72, y: 0.28 };
    const nodes: NodeP[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!nodes.length) {
        const count = Math.round((width * height) / 18000);
        for (let i = 0; i < count; i++) {
          nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.28,
            vy: (Math.random() - 0.5) * 0.28,
          });
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = (e.clientX - r.left) / r.width;
      pointer.y = (e.clientY - r.top) / r.height;
    };

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      const gx = pointer.x * width;
      const gy = pointer.y * height;
      const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, 420);
      glow.addColorStop(0, "rgba(26,152,251,0.22)");
      glow.addColorStop(0.45, "rgba(24,87,236,0.08)");
      glow.addColorStop(1, "rgba(24,87,236,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      nodes.forEach((n) => {
        if (!reduce) {
          n.x += n.vx;
          n.y += n.vy;
          n.vx += (gx - n.x) * 0.000012;
          n.vy += (gy - n.y) * 0.000012;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
        }
      });

      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < 140) {
            ctx.strokeStyle = `rgba(25,219,253,${(1 - d / 140) * 0.18})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n, i) => {
        if (i % 7 === 0) {
          ctx.fillStyle = "rgba(24,87,236,0.55)";
          ctx.fillRect(n.x - 2, n.y - 2, 4, 4);
        } else {
          ctx.fillStyle = i % 3 === 0 ? "rgba(25,219,253,0.9)" : "rgba(255,255,255,0.72)";
          ctx.beginPath();
          ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
