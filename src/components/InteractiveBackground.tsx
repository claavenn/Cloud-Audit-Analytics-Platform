import React, { useEffect, useRef } from "react";

export const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking with smooth interpolation
    let mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isHovering: false,
      radius: 170,
    };

    // Scroll tracking
    let scrollY = window.scrollY;
    let targetScrollY = window.scrollY;
    let scrollVelocity = 0;
    let lastScrollY = window.scrollY;

    // Detect dark mode
    let isDark = document.documentElement.classList.contains("dark");
    const observer = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains("dark");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // Particle nodes for audit network constellation
    interface Particle {
      x: number;
      y: number;
      originX: number;
      originY: number;
      vx: number;
      vy: number;
      size: number;
      colorType: number; // 0: indigo, 1: purple, 2: cyan, 3: emerald
      pulsePhase: number;
      pulseSpeed: number;
    }

    const particleCount = Math.min(Math.floor((width * height) / 18000), 75);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const px = Math.random() * width;
      const py = Math.random() * height;
      particles.push({
        x: px,
        y: py,
        originX: px,
        originY: py,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: Math.random() * 2.2 + 1.2,
        colorType: Math.floor(Math.random() * 4),
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    // Interactive ripples generated on scroll or clicks
    interface Ripple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      alpha: number;
      color: string;
    }
    const ripples: Ripple[] = [];

    const addRipple = (x: number, y: number, color?: string) => {
      ripples.push({
        x,
        y,
        radius: 10,
        maxRadius: 180,
        alpha: 0.35,
        color: color || (isDark ? "rgba(99, 102, 241, " : "rgba(79, 70, 229, "),
      });
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isHovering = true;
    };

    const handleMouseLeave = () => {
      mouse.isHovering = false;
    };

    let scrollTimeout: NodeJS.Timeout | null = null;
    const handleScroll = () => {
      targetScrollY = window.scrollY;
      const currentScroll = window.scrollY;
      scrollVelocity = (currentScroll - lastScrollY) * 0.6;
      lastScrollY = currentScroll;

      // Emit subtle scroll ripples periodically
      if (Math.abs(scrollVelocity) > 8 && ripples.length < 5) {
        addRipple(
          mouse.x || width / 2,
          Math.min(Math.max(mouse.y || height / 2, 80), height - 80),
          isDark ? "rgba(129, 140, 248, " : "rgba(99, 102, 241, "
        );
      }

      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        scrollVelocity = 0;
      }, 150);
    };

    const handleClick = (e: MouseEvent) => {
      addRipple(e.clientX, e.clientY, isDark ? "rgba(168, 85, 247, " : "rgba(124, 58, 237, ");
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("click", handleClick, { passive: true });

    // Main animation loop
    let tick = 0;
    const render = () => {
      tick++;

      // Smooth interpolation for mouse and scroll
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;
      scrollY += (targetScrollY - scrollY) * 0.15;
      const scrollOffset = (scrollY * 0.2) % height;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw glowing interactive cursor aura
      if (mouse.isHovering) {
        const auraGradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          mouse.radius * 1.5
        );
        if (isDark) {
          auraGradient.addColorStop(0, "rgba(99, 102, 241, 0.12)");
          auraGradient.addColorStop(0.5, "rgba(168, 85, 247, 0.05)");
          auraGradient.addColorStop(1, "rgba(99, 102, 241, 0)");
        } else {
          auraGradient.addColorStop(0, "rgba(99, 102, 241, 0.09)");
          auraGradient.addColorStop(0.5, "rgba(56, 189, 248, 0.04)");
          auraGradient.addColorStop(1, "rgba(99, 102, 241, 0)");
        }
        ctx.fillStyle = auraGradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Animate and draw ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 3.5;
        r.alpha -= 0.008;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `${r.color}${r.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Update & render particles
      const colors = isDark
        ? [
            "rgba(129, 140, 248, ", // Indigo
            "rgba(192, 132, 252, ", // Purple
            "rgba(56, 189, 248, ",  // Cyan
            "rgba(52, 211, 153, ",  // Emerald
          ]
        : [
            "rgba(79, 70, 229, ",  // Indigo
            "rgba(147, 51, 234, ",  // Purple
            "rgba(14, 165, 233, ",  // Sky
            "rgba(16, 185, 129, ",  // Emerald
          ];

      // Update positions
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulsePhase += p.pulseSpeed;

        // Base motion
        p.x += p.vx;
        p.y += p.vy - scrollVelocity * 0.04;

        // Wrap around boundaries with smooth transition
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Interactive mouse repulsion & attraction
        if (mouse.isHovering) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            // Interactive push effect away from cursor
            const force = (1 - dist / mouse.radius) * 1.8;
            p.x -= (dx / dist) * force;
            p.y -= (dy / dist) * force;
          }
        }
      }

      // 4. Draw connection lines between nearby particles
      const maxDist = 110;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * (isDark ? 0.18 : 0.12);
            ctx.strokeStyle = isDark
              ? `rgba(148, 163, 184, ${lineAlpha})`
              : `rgba(99, 102, 241, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 5. Draw connection lines from cursor to close particles (Interactive Neural Mesh!)
      if (mouse.isHovering) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius * 0.95) {
            const proximityFactor = 1 - dist / (mouse.radius * 0.95);
            const lineAlpha = proximityFactor * (isDark ? 0.45 : 0.3);

            // Radiant gradient line towards cursor
            const grad = ctx.createLinearGradient(p.x, p.y, mouse.x, mouse.y);
            grad.addColorStop(0, `${colors[p.colorType]}${lineAlpha * 0.8})`);
            grad.addColorStop(1, isDark ? `rgba(255, 255, 255, ${lineAlpha})` : `rgba(79, 70, 229, ${lineAlpha})`);

            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.2 * proximityFactor;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();

            // Highlight node when linked to cursor
            ctx.fillStyle = isDark ? "#ffffff" : "#4f46e5";
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (1 + proximityFactor * 0.8), 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 6. Render the particle points
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const pulse = 0.5 + 0.5 * Math.sin(p.pulsePhase);
        const baseAlpha = isDark ? 0.35 + pulse * 0.35 : 0.25 + pulse * 0.25;

        // Outer soft glow
        ctx.fillStyle = `${colors[p.colorType]}${baseAlpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Inner solid core
        ctx.fillStyle = `${colors[p.colorType]}${baseAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("click", handleClick);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Dynamic Interactive HTML5 Canvas for Constellation & Wave Interactions */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Decorative Interactive Background Meshes & Ambient Glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/20 to-slate-100/30 dark:from-transparent dark:via-slate-950/20 dark:to-slate-900/30 pointer-events-none" />

      {/* Top Ambient Glow Orb */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[48rem] h-[26rem] rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/8 to-transparent dark:from-indigo-600/15 dark:via-purple-600/10 dark:to-transparent blur-3xl pointer-events-none" />
    </div>
  );
};
