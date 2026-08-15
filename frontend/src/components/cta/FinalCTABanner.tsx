import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, QrCode } from 'lucide-react';
import { openDezoAI } from '../ai/DezoAIWidget';

export const FinalCTABanner: React.FC = () => {
  return (
    <section className="py-14 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-8 p-8 sm:p-10 rounded-3xl bg-slate-50/90 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          
          {/* Left Text */}
          <div className="flex flex-col text-left max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 font-['Plus_Jakarta_Sans']">
              READY TO TRANSFORM YOUR BUSINESS?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal">
              Book a demo today and explore the power of our software solutions.
            </p>
          </div>

          {/* Center Button & Right QR Code Box */}
          <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto justify-between lg:justify-end">
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="#book-demo"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition"
            >
              <span>Book a Free Demo</span>
              <ArrowRight className="w-4 h-4" />
            </motion.a>

            {/* QR Code / Chat Now Container */}
            <div 
              onClick={() => openDezoAI()} 
              className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer hover:border-blue-500 transition-colors group"
            >
              <div className="w-12 h-12 bg-slate-900 text-white flex items-center justify-center rounded-lg group-hover:bg-blue-600 transition-colors">
                <QrCode className="w-8 h-8" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight font-['Plus_Jakarta_Sans']">
                  Scan or Click
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight font-['Plus_Jakarta_Sans']">
                  AI Support
                </span>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5 group-hover:underline">
                  Chat Now
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
