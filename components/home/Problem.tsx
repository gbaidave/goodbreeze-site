"use client";

import { motion } from "framer-motion";

const problems = [
  {
    title: "You're Flying Blind on SEO",
    description: "Your competitors are ranking for keywords you don't even know exist. Every content decision is a shot in the dark, and you have no idea what's actually working for them.",
    iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    gradient: "from-primary to-accent-blue",
  },
  {
    title: "Manual Research Wastes Hours",
    description: "Pulling keyword data, crawling competitor pages, building spreadsheets — it takes hours, and you're never sure if you got it right. There's no time left to actually act on what you find.",
    iconPath: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    gradient: "from-accent-blue to-accent-purple",
  },
  {
    title: "You Don't Know What's Actually Broken",
    description: "Traffic is flat, but is it a technical issue? A content gap? The wrong keywords? Without a clear diagnosis, you keep guessing, and guessing costs you time and rankings.",
    iconPath: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    gradient: "from-accent-purple to-primary",
  },
];

export default function Problem() {
  return (
    <section className="py-24 px-6 sm:px-8 lg:px-12 bg-dark-800">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            Sound Familiar?
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Most growing businesses hit the same SEO wall. You know you need to improve — you just don't know exactly where to start.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative p-8 rounded-2xl bg-dark-700 border border-primary/20 hover:border-primary/50 transition-all duration-300 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-300" />
              <div className="relative z-10">
                <div className="mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <svg className="w-20 h-20 mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={problem.gradient === "from-primary to-accent-blue" ? "#00adb5" : problem.gradient === "from-accent-blue to-accent-purple" ? "#3b82f6" : "#a855f7"} />
                        <stop offset="100%" stopColor={problem.gradient === "from-primary to-accent-blue" ? "#3b82f6" : problem.gradient === "from-accent-blue to-accent-purple" ? "#a855f7" : "#00adb5"} />
                      </linearGradient>
                    </defs>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke={`url(#grad-${index})`} d={problem.iconPath} />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-primary text-center">
                  {problem.title}
                </h3>
                <p className="text-gray-300 leading-relaxed text-center">
                  {problem.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
