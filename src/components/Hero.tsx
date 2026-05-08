import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { BrandLogo, Badge } from './ui/BrandElements';

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number }[] = [];
    const particleCount = navigator.hardwareConcurrency <= 2 ? 0 : 40;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      if (document.visibilityState === 'hidden') {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(178, 44, 62, 0.06)';
      ctx.lineWidth = 1;

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        particles.forEach((p2, j) => {
          if (i === j) return;
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section id="home" className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden pt-20">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 pointer-events-none" 
      />
      
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 1, ease: "easeOut" }}
           className="mb-4"
        >
          <BrandLogo className="text-[clamp(52px,10vw,120px)] leading-none animate-[pulse-glow_4s_ease-in-out_infinite]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col items-center gap-6"
        >
          <h2 className="font-brand text-brand-red tracking-[6px] text-[clamp(12px,2vw,18px)] uppercase">
            FEATURED BY RAYANJAINN
          </h2>
          
          <p className="font-sans italic text-text-muted text-[clamp(14px,1.8vw,20px)] leading-relaxed max-w-2xl">
            "Crafting Visual Stories That Hit Different"
          </p>

          <Badge />

          <div className="flex gap-4 mt-8">
            <a 
              href="#portfolio"
              className="bg-brand-red text-black font-brand px-8 py-3.5 rounded-sm uppercase tracking-wider hover:bg-brand-red-dark hover:shadow-[0_0_20px_rgba(178,44,62,0.4)] transition-all duration-300"
            >
              View My Work
            </a>
            <a 
              href="#contact"
              className="border border-brand-red text-brand-red font-brand px-8 py-3.5 rounded-sm uppercase tracking-wider hover:bg-brand-red hover:text-black transition-all duration-300"
            >
              Hire Me
            </a>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { text-shadow: 0 0 0px rgba(178,44,62,0); }
          50% { text-shadow: 0 0 20px rgba(178,44,62,0.5); }
        }
      `}</style>
    </section>
  );
}
