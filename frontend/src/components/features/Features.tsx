import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  ShieldCheck,
  BarChart2,
  Workflow,
  Globe2,
  Cpu
} from 'lucide-react';

export const Features: React.FC = () => {
  const featuresList = [
    {
      icon: <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      title: 'Autonomous AI Workflows',
      description: 'Trigger intelligent actions, auto-assign leads, and automate follow-ups with customizable AI triggers.'
    },
    {
      icon: <BarChart2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: 'Predictive Analytics',
      description: 'Real-time forecasting and deep pipeline visibility powered by machine learning algorithms.'
    },
    {
      icon: <Globe2 className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
      title: 'Global Multi-Currency Sync',
      description: 'Operate across international regions with instant currency conversion and compliance tools.'
    },
    {
      icon: <Workflow className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />,
      title: 'Seamless Integrations',
      description: 'Connect with over 500+ enterprise tools including Salesforce, HubSpot, Slack, and Google Workspace.'
    },
    {
      icon: <Cpu className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: 'Real-Time Inventory Engine',
      description: 'Track stock, order fulfillments, and supplier logistics instantly with zero latency.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      title: 'SOC2 & GDPR Enterprise Security',
      description: 'Bank-grade 256-bit encryption, role-based access control, and complete audit logging.'
    }
  ];

  return (
    <section id="products" className="py-20 bg-slate-50/60 dark:bg-slate-950 relative border-t border-slate-100 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3.5 py-1.5 rounded-full border border-blue-100 dark:border-blue-800/80">
            ENTERPRISE CAPABILITIES
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 mb-5 tracking-tight font-['Plus_Jakarta_Sans']">
            Engineered for Modern Enterprise Growth
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Dezoryn Technologies replaces fragmented legacy software with a unified, high-performance platform designed for scale.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col items-start text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                {React.cloneElement(item.icon, {
                  className: 'w-6 h-6 transition-colors duration-300 group-hover:text-white'
                })}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-['Plus_Jakarta_Sans']">
                {item.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

