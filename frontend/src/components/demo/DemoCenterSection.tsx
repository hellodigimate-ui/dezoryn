import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Cross, Hotel, Building2, ShoppingBag, Factory,
  Truck, Landmark, Play, CheckCircle2, Tv, Sparkles, X, ChevronRight
} from 'lucide-react';

import { API_URL, apiFetch } from '../../config/api.config';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const API_DEMOS = `${API_URL}/demos?active=true`;


export interface ProductDemo {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category?: string;
}

const DEFAULT_DEMOS: ProductDemo[] = [
  {
    id: 'demo-1',
    title: 'SchoolyCore Demo',
    description: 'Complete Education Management & Student Lifecycle Suite.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop',
    category: 'Education',
  },
  {
    id: 'demo-2',
    title: 'Hospital Management Demo',
    description: 'Next-Gen EHR, OPD Billing & Patient Workflow Platform.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop',
    category: 'Healthcare',
  },
  {
    id: 'demo-3',
    title: 'HRMS Demo',
    description: 'AI Payroll, Attendance Tracking & Employee Performance Hub.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
    category: 'Enterprise',
  },
  {
    id: 'demo-4',
    title: 'InventoryPro Demo',
    description: 'Real-Time Supply Chain & Multi-Warehouse Automation.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop',
    category: 'Logistics',
  },
];

const INDUSTRIES = [
  { name: 'Education', icon: GraduationCap },
  { name: 'Healthcare', icon: Cross },
  { name: 'Hospitality', icon: Hotel },
  { name: 'Real Estate', icon: Building2 },
  { name: 'Retail', icon: ShoppingBag },
  { name: 'Manufacturing', icon: Factory },
  { name: 'Logistics', icon: Truck },
  { name: 'Government', icon: Landmark },
];

// Resolve relative /uploads/ URLs to the backend server
const getVideoUrl = (url: string) => resolveMediaUrl(url);

export const DemoCenterSection: React.FC = () => {
  const [demos, setDemos] = useState<ProductDemo[]>(DEFAULT_DEMOS);
  const [activeDemo, setActiveDemo] = useState<ProductDemo>(DEFAULT_DEMOS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [allDemosModal, setAllDemosModal] = useState<boolean>(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    product: 'SchoolyCore',
    organization: '',
    usersCount: '',
  });
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchDemos = async () => {
      try {
        const res = await apiFetch(API_DEMOS);
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setDemos(data.data);
          setActiveDemo(data.data[0]);
        }
      } catch {
        // use default fallback
      }
    };
    fetchDemos();
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
      setTimeout(() => setFormSubmitted(false), 5000);
      setForm({
        name: '',
        mobile: '',
        email: '',
        product: 'SchoolyCore',
        organization: '',
        usersCount: '',
      });
    }, 1000);
  };

  return (
    <section className="py-20 bg-[#0B1120] text-white font-['Plus_Jakarta_Sans',sans-serif] border-t border-slate-800/80 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Column 1: INDUSTRIES WE SERVE (3 Cols) */}
          <div className="lg:col-span-3 p-6 sm:p-7 rounded-3xl bg-slate-900/90 backdrop-blur-md border border-slate-800/80 shadow-2xl flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-black uppercase text-blue-400 tracking-wider mb-2 block">
                INDUSTRIES WE SERVE
              </span>
              <h3 className="text-sm text-slate-400 font-medium mb-6">
                Tailored enterprise solutions designed for core verticals.
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {INDUSTRIES.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-600/10 transition duration-300 group cursor-default"
                    >
                      <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white transition truncate">
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2: DEMO CENTER (5 Cols) */}
          <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-slate-900/90 backdrop-blur-md border border-slate-800/80 shadow-2xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-black uppercase text-blue-400 tracking-wider">
                  DEMO CENTER
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Live Preview
                </span>
              </div>
              <h3 className="text-sm text-slate-400 font-medium mb-4">
                Watch Our Product Demos
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* Main Active Video Player Card */}
                <div className="sm:col-span-7 relative rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 aspect-video shadow-lg group">
                  {isPlaying ? (
                    <video
                      key={activeDemo.id}
                      src={getVideoUrl(activeDemo.videoUrl)}
                      controls
                      autoPlay
                      preload="auto"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <img
                        src={getVideoUrl(activeDemo.thumbnailUrl || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop')}
                        alt={activeDemo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setIsPlaying(true)}
                          className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-xl shadow-blue-600/40 transition transform hover:scale-110 cursor-pointer"
                        >
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-white truncate border border-slate-800">
                        {activeDemo.title}
                      </div>
                    </>
                  )}
                </div>

                {/* Playlist Side items */}
                <div className="sm:col-span-5 space-y-2">
                  {demos.slice(0, 4).map((demo) => {
                    const isSelected = activeDemo.id === demo.id;
                    return (
                      <button
                        key={demo.id}
                        type="button"
                        onClick={() => {
                          setActiveDemo(demo);
                          setIsPlaying(false);
                        }}
                        className={`w-full flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer text-xs font-extrabold truncate ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-md'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <Tv className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                        <span className="truncate">{demo.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* View All Demos Button */}
            <button
              type="button"
              onClick={() => setAllDemosModal(true)}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-xl shadow-blue-600/25 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>View All Demos</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Column 3: GET FREE DEMO (4 Cols) */}
          <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-slate-900/90 backdrop-blur-md border border-slate-800/80 shadow-2xl flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-black uppercase text-blue-400 tracking-wider mb-1 block">
                GET FREE DEMO
              </span>
              <h3 className="text-xs text-slate-400 font-medium mb-5">
                Fill the form and our team will connect with you.
              </h3>

              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    required
                    value={form.mobile}
                    onChange={e => setForm({ ...form, mobile: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
                  />
                  <select
                    value={form.product}
                    onChange={e => setForm({ ...form, product: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300 outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {demos.map(d => (
                      <option key={d.id} value={d.title}>{d.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Organization / School / Company"
                    required
                    value={form.organization}
                    onChange={e => setForm({ ...form, organization: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
                  />
                  <input
                    type="number"
                    placeholder="Number of Users"
                    value={form.usersCount}
                    onChange={e => setForm({ ...form, usersCount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl shadow-blue-600/30 transition cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? 'Scheduling Demo...' : 'Submit Request & Schedule Demo'}
                </button>
              </form>

              {formSubmitted && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Demo request submitted successfully!</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* All Demos Gallery Modal */}
      <AnimatePresence>
        {allDemosModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Full Demo Catalog</span>
                </div>
                <button onClick={() => setAllDemosModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {demos.map(demo => (
                  <div
                    key={demo.id}
                    onClick={() => {
                      setActiveDemo(demo);
                      setIsPlaying(true);
                      setAllDemosModal(false);
                    }}
                    className="group p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition cursor-pointer space-y-3"
                  >
                    <div className="w-full h-40 rounded-xl bg-slate-900 overflow-hidden relative border border-slate-800">
                      <img src={getVideoUrl(demo.thumbnailUrl || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop')} alt={demo.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-white group-hover:text-blue-400 transition">{demo.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{demo.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
