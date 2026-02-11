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
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent-blue to-accent-purple bg-clip-text text-transparent">
            Meet Your Automation Partner
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Built by someone who uses the systems he sells
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/20">
              <Image
                src="/images/dave-profile.jpg"
                alt="Dave Silverstein, Founder of Good Breeze AI"
                width={600}
                height={600}
                className="w-full h-auto"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent-purple/10" />
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute -bottom-6 -right-6 bg-dark-700/95 backdrop-blur-lg border border-primary/30 rounded-xl p-6 shadow-lg"
            >
              <div className="text-2xl font-bold text-primary">Eats His Own Cooking</div>
              <div className="text-sm text-gray-300">Built on Real-World Use</div>
            </motion.div>
          </motion.div>

          {/* Right: Bio */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-3xl font-bold text-white mb-2">Dave Silverstein</h3>
            <p className="text-xl text-primary mb-6">Founder @ Good Breeze AI</p>

            <div className="space-y-4 text-gray-300 mb-8">
              <p>
                Dave isn't building theoretical solutions. Every system Good Breeze AI offers is battle tested in his own operations first.
              </p>
              <p>
                He's a business operator who mastered technology out of necessity. When he couldn't find automation tools that actually worked for real businesses, he built them himself. Then he realized other SMBs had the same problems.
              </p>
              <p>
                The competitive analyzer? He uses it for client calls. The proposal system? Powers his own sales process. The workflow automation? Runs his entire operation. If it doesn't work for him, he won't sell it to you.
              </p>
            </div>

            {/* Quote */}
            <div className="border-l-4 border-primary pl-6 py-2">
              <p className="text-lg italic text-gray-300">
                "I build the systems I wish existed when I was drowning in manual work. If it saves me time and makes me money, it'll do the same for you."
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
