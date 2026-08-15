import React from 'react';
import { motion } from 'framer-motion';

const logos = [
  {
    name: 'ACME Corp',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5z" />
      </svg>
    )
  },
  {
    name: 'Globex',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M3.6 9h16.8M3.6 15h16.8M12 3a14.5 14.5 0 000 18 14.5 14.5 0 000-18z" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  },
  {
    name: 'Initech',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    )
  },
  {
    name: 'Soylent Corp',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.8L18 8.5v7L12 19l-6-3.5v-7l6-3.7z" />
      </svg>
    )
  },
  {
    name: 'Hooli',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3a9 9 0 00-9 9 9 9 0 009 9 9 9 0 009-9 9 9 0 009-9zm0 4a5 5 0 110 10 5 5 0 010-10z" />
      </svg>
    )
  }
];

export const TrustedBy: React.FC = () => {
  return (
    <section className="py-12 bg-white dark:bg-slate-900/90 border-y border-slate-100 dark:border-slate-800/80 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
        <div className="max-w-[1280px] mx-auto flex flex-col items-center justify-center text-center">
          
          {/* Heading */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-8"
          >
            Trusted by industry leaders globally
          </motion.p>

          {/* Logos Row */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap items-center justify-center gap-10 sm:gap-14 lg:gap-20 w-full"
          >
            {logos.map((logo) => (
              <div
                key={logo.name}
                className="group flex items-center gap-2.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {logo.icon}
                </div>
                <span className="text-lg font-black tracking-tight text-slate-400 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-300">
                  {logo.name}
                </span>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

