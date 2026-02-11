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
            {/* Problem-focused headline with keyword at beginning */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
              <span className="block bg-gradient-to-r from-primary via-accent-blue to-accent-purple bg-clip-text text-transparent">
                AI Automation for SMBs:
              </span>
              Stop Watching Your Team Drown in Busywork
            </h1>

            {/* Clear outcome promise */}
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed">
              We help SMBs reclaim 20+ hours per week by automating the repetitive work that's keeping you from growing—without the tech headaches or massive hiring costs.
            </p>

            {/* Specific pain points */}
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-300">Stop losing leads because follow-ups slip through the cracks</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-300">Free your team from tedious data entry and manual processes</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-300">Scale your revenue without scaling your headcount (or headaches)</p>
              </div>
            </div>

            {/* Super prominent CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/tools"
                  className="group relative flex items-center justify-center px-10 py-5 bg-gradient-to-r from-primary via-accent-blue to-primary text-white text-lg font-bold rounded-full overflow-hidden shadow-2xl shadow-primary/50"
                  style={{ backgroundSize: "200% 100%" }}
                >
                  <span className="relative z-10">Try Free Tools Now</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-accent-blue via-primary to-accent-blue"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                    style={{ backgroundSize: "200% 100%" }}
                  />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/contact"
                  className="flex items-center justify-center px-10 py-5 border-4 border-primary text-primary text-lg font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-xl shadow-primary/30"
                >
                  Talk to a Human
                </Link>
              </motion.div>
            </div>

            {/* Trust indicator */}
            <p className="text-gray-400 text-sm">
              No tech jargon. No empty promises. Just practical automation that actually works.
            </p>
          </motion.div>

          {/* Right: Hero Image with results */}
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
                src="/images/hero-image.jpg"
                alt="Business owner overwhelmed with manual work"
                width={800}
                height={600}
                className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent-purple/10 group-hover:from-primary/20 group-hover:to-accent-purple/20 transition-all duration-500" />
            </div>

            {/* Results cards with animated glow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute -bottom-4 -left-4 bg-dark-700/95 backdrop-blur-lg border border-primary/30 rounded-xl p-5 shadow-lg hover:shadow-primary/50 hover:scale-110 transition-all duration-300 cursor-pointer group/card"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover/card:from-primary/10 group-hover/card:to-transparent rounded-xl transition-all duration-300" />
              <div className="relative z-10">
                <div className="text-3xl font-bold text-primary mb-1">20+ hrs</div>
                <div className="text-sm text-gray-300">Reclaimed per week</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="absolute -top-4 -right-4 bg-dark-700/95 backdrop-blur-lg border border-accent-blue/30 rounded-xl p-5 shadow-lg hover:shadow-accent-blue/50 hover:scale-110 transition-all duration-300 cursor-pointer group/card"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/0 to-accent-blue/0 group-hover/card:from-accent-blue/10 group-hover/card:to-transparent rounded-xl transition-all duration-300" />
              <div className="relative z-10">
                <div className="text-3xl font-bold text-accent-blue mb-1">$0</div>
                <div className="text-sm text-gray-300">New hires needed</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
