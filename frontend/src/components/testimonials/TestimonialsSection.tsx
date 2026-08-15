import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

import { API_URL, apiFetch } from '../../config/api.config';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const API = `${API_URL}/testimonials?enabled=true`;


interface Testimonial {
  id: string;
  name: string;
  company: string;
  designation: string;
  review: string;
  rating: number;
  photo: string | null;
}

const StarRow: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
    ))}
  </div>
);

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const COLORS = [
  'from-blue-500 to-cyan-500',
  'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-indigo-500 to-blue-500',
];

export const TestimonialsSection: React.FC = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    apiFetch(API)
      .then(r => r.json())
      .then(data => { if (data.success && data.data.length > 0) setItems(data.data); })
      .catch(() => {});
  }, []);

  // Auto-advance
  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => {
      setDirection(1);
      setActiveIdx(i => (i + 1) % items.length);
    }, 5000);
    return () => clearInterval(t);
  }, [items]);

  const goTo = (idx: number) => {
    setDirection(idx > activeIdx ? 1 : -1);
    setActiveIdx(idx);
  };
  const prev = () => { setDirection(-1); setActiveIdx(i => (i - 1 + items.length) % items.length); };
  const next = () => { setDirection(1); setActiveIdx(i => (i + 1) % items.length); };

  if (items.length === 0) return null;

  const current = items[activeIdx];
  const colorGrad = COLORS[activeIdx % COLORS.length];

  return (
    <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">

        {/* Section heading */}
        <div className="text-center mb-14">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-xs font-extrabold text-amber-600 dark:text-amber-400 mb-4">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />CUSTOMER STORIES
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Loved by teams<br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">across every industry</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            See why over 2,400 companies trust Dezoryn to run their business operations.
          </motion.p>
        </div>

        {/* Main testimonial card */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div key={current.id}
                custom={direction}
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -60 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 p-8 md:p-10">

                {/* Top left quote icon */}
                <div className={`absolute top-6 right-8 w-12 h-12 rounded-2xl bg-gradient-to-br ${colorGrad} flex items-center justify-center opacity-15`}>
                  <Quote className="w-6 h-6 text-white" />
                </div>

                {/* Stars */}
                <StarRow rating={current.rating} />

                {/* Review text */}
                <blockquote className="mt-5 text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                  "{current.review}"
                </blockquote>

                {/* Author */}
                <div className="mt-8 flex items-center gap-4">
                  {current.photo ? (
                    <img src={resolveMediaUrl(current.photo)} alt={current.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-800 shadow-md shrink-0" />
                  ) : (
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorGrad} flex items-center justify-center text-white font-black text-base shadow-md shrink-0`}>
                      {getInitials(current.name)}
                    </div>
                  )}
                  <div>
                    <p className="font-black text-slate-900 dark:text-white text-sm">{current.name}</p>
                    {current.designation && <p className="text-xs text-slate-500 dark:text-slate-400">{current.designation}</p>}
                    {current.company && (
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-md bg-gradient-to-r ${colorGrad} text-white text-[10px] font-extrabold`}>
                        {current.company}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          {items.length > 1 && (
            <div className="flex items-center justify-between mt-8">
              {/* Prev / Next */}
              <div className="flex items-center gap-2">
                <button type="button" onClick={prev}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600 flex items-center justify-center cursor-pointer transition shadow-sm">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button type="button" onClick={next}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600 flex items-center justify-center cursor-pointer transition shadow-sm">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {items.map((_, i) => (
                  <button key={i} type="button" onClick={() => goTo(i)}
                    className={`rounded-full transition-all cursor-pointer ${
                      i === activeIdx
                        ? `w-6 h-2.5 bg-gradient-to-r ${colorGrad}`
                        : 'w-2.5 h-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                    }`} />
                ))}
              </div>

              {/* Counter */}
              <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500">
                {activeIdx + 1} / {items.length}
              </span>
            </div>
          )}
        </div>

        {/* Avatar row */}
        {items.length > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10 flex-wrap">
            {items.map((item, i) => (
              <button key={item.id} type="button" onClick={() => goTo(i)}
                title={item.name}
                className={`transition-all cursor-pointer ${i === activeIdx ? 'scale-110 ring-2 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-950 ring-emerald-500 rounded-xl' : 'opacity-50 hover:opacity-80 hover:scale-105'}`}>
                {item.photo ? (
                  <img src={resolveMediaUrl(item.photo)} alt={item.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                ) : (
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center text-white font-black text-xs`}>
                    {getInitials(item.name)}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
