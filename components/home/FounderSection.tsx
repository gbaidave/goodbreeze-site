"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function FounderSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-800 via-dark-900 to-dark-800" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            Meet Your Automation Partner
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Built by a business operator who relies on automation daily
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/20 max-w-[280px] lg:max-w-[340px] mx-auto">
              <Image
                src="/images/dave-silverstein-good-breeze-ai-founder.webp"
                alt="Dave Silverstein, founder of Good Breeze AI"
                width={600}
                height={800}
                className="w-full h-auto"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent-purple/10" />
            </div>
          </motion.div>

          {/* Right: Bio */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-3xl font-bold text-white mb-2">Dave Silverstein</h3>
            <p className="text-xl text-primary mb-6">Founder: Good Breeze AI</p>

            <div className="space-y-4 text-gray-300 mb-8">
              <p>
                Hi, I'm Dave. I'm not building theoretical solutions. Every system Good Breeze AI offers is battle tested in real operations first.
              </p>
              <p>
                As a business operator who mastered technology out of necessity, I built automation tools when existing solutions fell short for real businesses. When I realized other SMBs were struggling with the same problems, Good Breeze AI was born.
              </p>
              <p>
                The competitive analyzer? I use it daily for client calls. The proposal system? It powers my entire sales process. The workflow automation? It runs my whole operation. If a system doesn't deliver value internally, I won't offer it to clients.
              </p>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
