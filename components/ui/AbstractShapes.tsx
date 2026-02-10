"use client";

import { motion } from "framer-motion";

export function FloatingCircles() {
  return (
    <>
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl opacity-20"
        animate={{
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-accent-purple rounded-full blur-3xl opacity-20"
        animate={{
          y: [0, -40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 w-64 h-64 bg-accent-blue rounded-full blur-3xl opacity-10"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </>
  );
}

export function GridPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 173, 181, 0.1)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

export function WaveDivider({ flip = false }) {
  return (
    <div className={`absolute left-0 right-0 ${flip ? 'top-0 rotate-180' : 'bottom-0'}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
        <path
          fill="currentColor"
          className="text-dark-800"
          d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
        />
      </svg>
    </div>
  );
}

export function DotPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" className="text-primary" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  );
}
