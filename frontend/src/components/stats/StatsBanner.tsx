import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Building, 
  Layers, 
  Headphones, 
  ShieldCheck, 
  Bot 
} from 'lucide-react';
import { openDezoAI } from '../ai/DezoAIWidget';
import { useNavigation } from '../../utils/NavigationContext';
import { apiFetch } from '../../config/api.config';

export const StatsBanner: React.FC = React.memo(() => {
  const { navigateTo } = useNavigation();
  const [establishedYear, setEstablishedYear] = useState('2020');

  useEffect(() => {
    apiFetch('/timeline')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const foundItem = data.data.find((i: any) =>
            i.title?.toLowerCase().includes('found') ||
            i.title?.toLowerCase().includes('establish')
          ) || data.data[0];
          if (foundItem?.year) {
            setEstablishedYear(foundItem.year);
          }
        }
      })
      .catch(() => {});
  }, []);

  const stats = [
    {
      icon: <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      value: establishedYear,
      label: 'Year Established',
      route: '/about'
    },
    {
      icon: <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      value: '10,000+',
      label: 'Happy Users',
      route: '/about'
    },
    {
      icon: <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      value: '100+',
      label: 'Clients',
      route: '/about'
    },
    {
      icon: <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      value: '15+',
      label: 'Products',
      route: '/marketplace'
    },
    {
      icon: <Headphones className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      value: '24/7',
      label: 'Support',
      route: '/help'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      value: '99.9%',
      label: 'Uptime',
      route: '/status'
    }
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 mt-10 mb-24">
      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
        className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transform-gpu border border-slate-200/90 dark:border-slate-800 rounded-[28px] p-6 lg:p-8 shadow-xl shadow-blue-900/10 dark:shadow-slate-950/70 flex flex-col xl:flex-row items-center justify-between gap-6 lg:gap-8 transition-colors duration-300 overflow-hidden"
      >
        {/* Stats items grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 flex-1 w-full min-w-0">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              onClick={() => navigateTo(stat.route as any)}
              className="flex items-center gap-3 sm:gap-3.5 min-w-0 cursor-pointer group hover:scale-105 transition-transform"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50/90 dark:bg-slate-800/90 border border-blue-100/90 dark:border-slate-700/80 flex items-center justify-center shrink-0 shadow-xs group-hover:border-blue-500/50 transition-colors">
                {stat.icon}
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight font-['Plus_Jakarta_Sans'] truncate group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                  {stat.value}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 leading-tight truncate">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Far Right: AI Assistant Badge */}
        <div className="xl:pl-8 border-t xl:border-t-0 xl:border-l border-slate-200/80 dark:border-slate-800 flex items-center gap-4 sm:gap-6 w-full xl:w-auto justify-between xl:justify-start pt-6 xl:pt-0 shrink-0">
          <div 
            onClick={() => openDezoAI()} 
            className="flex items-center gap-3 sm:gap-4 min-w-0 cursor-pointer group"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 relative shrink-0 group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] flex items-center gap-1.5 truncate group-hover:text-blue-500 transition-colors">
                AI Assistant
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                Hello! How can I help you today?
              </span>
            </div>
          </div>

          <button 
            onClick={() => openDezoAI()}
            className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/25 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            Chat Now
          </button>
        </div>
      </motion.div>
    </div>
  );
});


