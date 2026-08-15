import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  Smartphone,
  Lock,
  Brain,
  Activity,
  Cloud,
  Layers,
  Headphones
} from 'lucide-react';
import { openDezoAI } from '../ai/DezoAIWidget';
import { useNavigation } from '../../utils/NavigationContext';

interface FeatureItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  badge: string;
  route?: string;
  isChat?: boolean;
}

export const BottomFeatureStrip: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const features: FeatureItem[] = [
    {
      id: 'f1',
      title: 'Live Chat Support',
      subtitle: 'Talk to our experts 24/7',
      icon: <MessageSquare className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />,
      accent: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
      badge: 'LIVE',
      isChat: true
    },
    {
      id: 'f2',
      title: 'Easy Subscription',
      subtitle: 'Flexible & scalable pricing',
      icon: <CreditCard className="w-4 h-4 text-blue-500 dark:text-blue-400" />,
      accent: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
      badge: 'FLEX',
      route: '/pricing'
    },
    {
      id: 'f3',
      title: 'Secure Payments',
      subtitle: '100% Encrypted Gateway',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />,
      accent: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
      badge: 'SAFE',
      route: '/privacy'
    },
    {
      id: 'f4',
      title: 'Instant Access',
      subtitle: 'Get Started Immediately',
      icon: <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
      accent: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
      badge: 'FAST',
      route: '/book-demo'
    },
    {
      id: 'f5',
      title: 'Mobile Friendly',
      subtitle: 'Responsive on all devices',
      icon: <Smartphone className="w-4 h-4 text-purple-500 dark:text-purple-400" />,
      accent: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
      badge: 'MOBILE',
      route: '/about'
    },
    {
      id: 'f6',
      title: 'Enterprise Security',
      subtitle: 'SOC-2 & 256-bit AES',
      icon: <Lock className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />,
      accent: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
      badge: 'SOC2',
      route: '/privacy'
    },
    {
      id: 'f7',
      title: 'AI Powered',
      subtitle: 'Predictive agentic copilot',
      icon: <Brain className="w-4 h-4 text-pink-500 dark:text-pink-400" />,
      accent: 'border-pink-500/30 bg-pink-500/10 text-pink-400',
      badge: 'AI v4.2',
      route: '/products'
    },
    {
      id: 'f8',
      title: '99.99% Uptime',
      subtitle: 'Guaranteed Availability SLA',
      icon: <Activity className="w-4 h-4 text-teal-500 dark:text-teal-400" />,
      accent: 'border-teal-500/30 bg-teal-500/10 text-teal-400',
      badge: 'SLA',
      route: '/status'
    },
    {
      id: 'f9',
      title: 'Cloud Hosted',
      subtitle: 'Multi-Region AWS & GCP',
      icon: <Cloud className="w-4 h-4 text-sky-500 dark:text-sky-400" />,
      accent: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
      badge: 'CLOUD',
      route: '/api-docs'
    },
    {
      id: 'f10',
      title: 'Multi Tenant',
      subtitle: 'Isolated microservice pods',
      icon: <Layers className="w-4 h-4 text-violet-500 dark:text-violet-400" />,
      accent: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
      badge: 'SAAS',
      route: '/services'
    },
    {
      id: 'f11',
      title: '24/7 Support',
      subtitle: 'Dedicated solution architects',
      icon: <Headphones className="w-4 h-4 text-rose-500 dark:text-rose-400" />,
      accent: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
      badge: '24/7',
      route: '/help'
    }
  ];

  // Triplicate the list for seamless continuous infinite marquee looping
  const marqueeItems = [...features, ...features, ...features];

  return (
    <section 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="py-5 bg-white/80 dark:bg-slate-900/80 border-y border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl relative overflow-hidden transition-colors duration-300 font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* Gradient Fade Masks (Left & Right Edges) */}
      <div className="absolute top-0 bottom-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-white dark:from-slate-950 via-white/80 dark:via-slate-900/90 to-transparent z-20 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-white dark:from-slate-950 via-white/80 dark:via-slate-900/90 to-transparent z-20 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 relative z-10">
        {/* Continuous Left-to-Right Marquee Loop */}
        <div className="overflow-hidden flex items-center">
          <motion.div
            animate={{ x: isHovered ? 0 : ['-50%', '0%'] }}
            transition={{
              repeat: Infinity,
              duration: 40,
              ease: 'linear'
            }}
            className="flex items-center gap-4 sm:gap-6 shrink-0"
          >
            {marqueeItems.map((f, idx) => (
              <motion.div
                key={`${f.id}-${idx}`}
                whileHover={{ scale: 1.03, y: -1 }}
                onClick={() => {
                  if (f.isChat) {
                    openDezoAI();
                  } else if (f.route) {
                    navigateTo(f.route as any);
                  }
                }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 hover:border-blue-500/40 dark:hover:border-cyan-400/40 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer shrink-0 group"
              >
                {/* Icon Container with Soft Pulse Animation */}
                <div className={`p-2 rounded-xl border ${f.accent} shrink-0 relative flex items-center justify-center`}>
                  <motion.div
                    animate={{ scale: [1, 1.18, 1], opacity: [0.85, 1, 0.85] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: (idx % 5) * 0.4 }}
                  >
                    {f.icon}
                  </motion.div>
                </div>

                {/* Text Labels */}
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors whitespace-nowrap">
                      {f.title}
                    </span>
                    <span className="px-1.5 py-0.2 text-[9px] font-black rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider border border-slate-200/80 dark:border-transparent">
                      {f.badge}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap mt-0.5">
                    {f.subtitle}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
