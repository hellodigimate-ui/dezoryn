import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, AlertCircle, Send, Sparkles } from 'lucide-react';

import { API_URL, apiFetch } from '../../config/api.config';

const API_NEWSLETTER = `${API_URL}/newsletter/subscribe`;


type State = 'idle' | 'loading' | 'success' | 'error';

export const FooterNewsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState('');

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setState('error');
      setMessage('Please enter a valid email address.');
      return;
    }
    setState('loading');
    try {
      const res = await apiFetch(API_NEWSLETTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setState('success');
        setMessage(data.message || "You're subscribed! Welcome aboard 🎉");
        setEmail('');
      } else {
        setState('error');
        setMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setState('error');
      setMessage('Could not connect. Please try again later.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 mb-10 shadow-md group/nl"
    >
      {/* Background glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover/nl:from-blue-500/4 group-hover/nl:to-cyan-500/4 transition-all duration-500 pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Left: copy */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
            >
              <Sparkles className="w-4 h-4 text-cyan-500" />
            </motion.div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Newsletter</span>
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight mb-1">
            Stay ahead of the curve
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs">
            Get product updates, enterprise insights, and AI workflow tips delivered to your inbox.
          </p>
        </div>

        {/* Right: form */}
        <div className="w-full sm:w-auto sm:min-w-[320px]">
          <AnimatePresence mode="wait">
            {state === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold">{message}</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-2.5"
              >
                {/* Input row */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
                      placeholder="you@company.com"
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 bg-slate-50 dark:bg-slate-800/80 border transition-all duration-200 outline-none focus:ring-2 ${
                        state === 'error'
                          ? 'border-red-400 dark:border-red-500 focus:ring-red-400/30'
                          : 'border-slate-200 dark:border-slate-700 focus:border-cyan-400 dark:focus:border-cyan-500 focus:ring-cyan-400/20'
                      }`}
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={state === 'loading'}
                    whileHover={{ scale: state === 'loading' ? 1 : 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 transition-all duration-200 cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {state === 'loading' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Subscribe
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {state === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {message}
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-[10px] text-slate-400 dark:text-slate-600">
                  No spam. Unsubscribe anytime. We respect your privacy.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default FooterNewsletter;
