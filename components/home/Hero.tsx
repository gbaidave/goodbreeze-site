"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create particles
    const particleCount = 100;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 1.5 + 1,
    }));

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach((particle, i) => {
        // Move particle
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle sharper (no glow)
        ctx.fillStyle = "rgba(0, 173, 181, 0.9)";
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections between nearby particles
        particlesRef.current.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxLineDistance = 120;

          if (distance < maxLineDistance) {
            const opacity = (1 - distance / maxLineDistance) * 0.5;
            ctx.strokeStyle = `rgba(0, 173, 181, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-dark">
      {/* Animated particle network background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)" }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Brand headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
              Good Breeze AI
            </h1>

            {/* Value statement */}
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed">
              If your business isn&apos;t growing the way it should, the problems are usually in the systems, not the effort. Good Breeze AI surfaces what&apos;s holding you back. Then we fix it. Start with a free report.
            </p>

            {/* Specific outcomes */}
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-300">Your competitors are pulling ahead and you&apos;re not sure what&apos;s driving it</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-300">Your team is handling the same manual work every single day</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-300">You want to grow but you&apos;re already running at full capacity</p>
              </div>
            </div>

            {/* Single CTA */}
            <div className="flex justify-center mb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/tools"
                  className="group relative flex items-center justify-center px-10 py-5 bg-gradient-to-r from-primary via-accent-blue to-primary text-white text-lg font-bold rounded-full overflow-hidden shadow-2xl shadow-primary/50 border-2 border-white/60"
                  style={{ backgroundSize: "200% 100%" }}
                >
                  <span className="relative z-10">Get My Free Report</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-accent-blue via-primary to-accent-blue"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                    style={{ backgroundSize: "200% 100%" }}
                  />
                </Link>
              </motion.div>
            </div>

            {/* Trust indicator */}
            <p className="text-gray-400 text-sm text-center">
              Start with a free report. No account required. No credit card.
            </p>
          </motion.div>

          {/* Right: Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative group"
          >
            {/* Animated glow effect behind image */}
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-primary via-accent-blue to-accent-purple rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/20 group-hover:border-primary/50 transition-all duration-500">
              <Image
                src="/images/good-breeze-ai-business-owner-hero.webp"
                alt="Small business owner watching a focused team in a well-run operation — Good Breeze AI"
                width={800}
                height={600}
                className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent-purple/10 group-hover:from-primary/20 group-hover:to-accent-purple/20 transition-all duration-500" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
