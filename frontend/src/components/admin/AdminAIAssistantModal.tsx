import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Sliders,
  RotateCcw,
  Key,
  CheckCircle2
} from 'lucide-react';
import { apiFetch } from '../../config/api.config';


export interface AISettingsState {
  chatbotName: string;
  tone: string;
  systemPrompt: string;
  apiKey: string;
  model: string;
  temperature: number;
}

export type AIGenerateType = 'hero' | 'product' | 'faq' | 'testimonial' | 'seo' | 'cta';

interface AdminAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: AIGenerateType;
  initialTopic?: string;
  onInsertField?: (fieldType: string, value: any) => void;
}

export const AdminAIAssistantModal: React.FC<AdminAIAssistantModalProps> = ({
  isOpen,
  onClose,
  initialType = 'hero',
  initialTopic = '',
  onInsertField,
}) => {
  const [activeTab, setActiveTab] = useState<AIGenerateType | 'settings'>(initialType);
  const [topic, setTopic] = useState(initialTopic);
  const [context, setContext] = useState('');
  const [selectedTone, setSelectedTone] = useState('Enterprise & Persuasive');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Assistant Settings State
  const [settings, setSettings] = useState<AISettingsState>({
    chatbotName: 'Dezo AI Copilot',
    tone: 'Enterprise & Persuasive',
    systemPrompt: 'You are an elite enterprise B2B SaaS copywriter and brand marketing AI assistant for Dezoryn Technologies.',
    apiKey: '',
    model: 'gpt-4o-mini',
    temperature: 0.7,
  });

  useEffect(() => {
    if (initialType) setActiveTab(initialType);
  }, [initialType]);

  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
  }, [initialTopic]);

  // Load Settings from API / LocalStorage on mount
  useEffect(() => {
    apiFetch('/ai/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings((prev) => ({
            ...prev,
            ...data.data,
            chatbotName: data.data.chatbotName || prev.chatbotName,
          }));
        }
      })
      .catch(() => {
        const saved = localStorage.getItem('dezo-ai-settings');
        if (saved) {
          try {
            setSettings(JSON.parse(saved));
          } catch (e) {
            // ignore
          }
        }
      });
  }, []);

  const handleSaveSettings = async () => {
    localStorage.setItem('dezo-ai-settings', JSON.stringify(settings));
    localStorage.setItem('dezo-ai-chatbot-name', settings.chatbotName);
    
    // Broadcast event so DezoAIWidget updates instantly
    window.dispatchEvent(new CustomEvent('dezo-ai-settings-updated', { detail: settings }));

    try {
      await apiFetch('/ai/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
    } catch {
      // fallback saved in localStorage
    }

    setStatusNotice(`✅ AI Assistant settings saved! Name updated to "${settings.chatbotName}"`);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleGenerate = async () => {
    if (activeTab === 'settings') return;
    setIsLoading(true);
    setGeneratedData(null);
    setStatusNotice(null);

    try {
      // Mock / Offline smart generation with simulated API latency if offline fallback or API call
      setTimeout(() => {
        const result = generateSmartOfflineCopy(activeTab, topic, selectedTone, context);
        setGeneratedData(result);
        setIsLoading(false);
        setStatusNotice('✨ High-converting copy generated successfully!');
      }, 700);
    } catch (err: any) {
      setIsLoading(false);
      setStatusNotice('❌ Generation failed. Using fallback generator.');
    }
  };

  const generateSmartOfflineCopy = (
    type: AIGenerateType,
    topicQuery: string,
    _tone: string,
    _ctx: string
  ) => {
    const t = topicQuery.trim() || 'Dezoryn Platform';

    switch (type) {
      case 'hero':
        return {
          badgeText: `DEZORYN 3.0 • ${t.toUpperCase()}`,
          mainHeading: `Autonomous Operations for ${t}`,
          gradientHeading: `Engineered for Infinite Scale`,
          description: `Transform how your organization operates with ${t}. Eliminate manual bottlenecks, automate key workflows, and boost productivity with AI-driven intelligence.`,
          primaryBtnText: `Explore ${t}`,
          secondaryBtnText: 'Schedule VIP Demo',
        };

      case 'product':
        return {
          title: `${t} Suite`,
          subtitle: `Next-generation operational intelligence built for high-growth enterprises.`,
          description: `The ${t} platform combines real-time data orchestration, automated task distribution, and bank-grade security into a seamless operating hub.`,
          features: [
            `Automated workflow engine for ${t}`,
            'Bank-grade 256-bit encryption & SOC-2 compliance',
            'Real-time executive metrics & custom dashboards',
            'Instant multi-channel integration & webhooks',
          ],
        };

      case 'faq':
        return [
          {
            question: `How quickly can our team deploy ${t}?`,
            answer: `${t} is designed for rapid onboarding. Standard enterprise deployment takes under 24 hours with zero pipeline downtime.`,
            category: 'Onboarding',
          },
          {
            question: `Is ${t} compliant with strict data privacy regulations?`,
            answer: `Yes. We strictly enforce GDPR, HIPAA, and SOC-2 Type II audit standards with automated daily snapshot backups.`,
            category: 'Security',
          },
          {
            question: `Can we customize ${t} permissions for different departments?`,
            answer: `Absolutely. Enjoy granular Role-Based Access Control (RBAC) to restrict access by department, role, or team level.`,
            category: 'Permissions',
          },
        ];

      case 'testimonial':
        return {
          name: 'Sarah Jenkins',
          designation: 'Chief Technology Officer',
          company: 'Aetheria Cloud Systems',
          review: `Integrating ${t} was a complete game-changer. We reduced operational overhead by 48% within 60 days while delivering 3x faster response times for clients.`,
          rating: 5,
        };

      case 'seo':
        return {
          metaTitle: `${t} | Autonomous Enterprise Operating Platform`,
          metaDescription: `Empower your enterprise with ${t}. Harness automated workflows, real-time analytics, and SOC-2 compliant security.`,
          keywords: `${t}, enterprise platform, business automation, AI workflows, SaaS operating system`,
        };

      case 'cta':
        return {
          bannerHeadline: `Ready to Scale Operations with ${t}?`,
          subtext: 'Join 500+ market leaders automating workflows with Dezoryn. 14-day free trial, no credit card required.',
          primaryBtnText: 'Get Started Free',
          secondaryBtnText: 'Book Product Walkthrough',
        };

      default:
        return null;
    }
  };

  const handleInsert = (key: string, value: any) => {
    if (onInsertField) {
      onInsertField(key, value);
      setStatusNotice(`⚡ Inserted into ${key} field!`);
    } else {
      navigator.clipboard.writeText(typeof value === 'object' ? JSON.stringify(value, null, 2) : value);
      setStatusNotice(`📋 Copied value to clipboard!`);
    }
  };

  if (!isOpen) return null;

  const toneOptions = [
    'Enterprise & Persuasive',
    'Creative & Inspiring',
    'Technical & Precise',
    'Minimalist & Modern',
    'Urgent & Action-Oriented',
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md font-['Plus_Jakarta_Sans',sans-serif]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Top Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-purple-600 p-[2px] shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-950 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {settings.chatbotName}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    AI Engine Ready
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Generate high-converting CMS copy & insert into form fields with 1 click
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Generator Tabs */}
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/30 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {[
              { id: 'hero', label: '🎯 Hero Copy' },
              { id: 'product', label: '📦 Product' },
              { id: 'faq', label: '❓ FAQ Generator' },
              { id: 'testimonial', label: '💬 Testimonials' },
              { id: 'seo', label: '🔍 SEO Meta' },
              { id: 'cta', label: '🚀 CTA Text' },
              { id: 'settings', label: '⚙️ Settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {statusNotice && (
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-xs font-bold flex items-center justify-between animate-fade-in">
                <span>{statusNotice}</span>
                <X className="w-4 h-4 cursor-pointer" onClick={() => setStatusNotice(null)} />
              </div>
            )}

            {activeTab === 'settings' ? (
              /* Chatbot Settings Panel */
              <div className="space-y-5 max-w-2xl mx-auto">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-500" />
                    Customize AI Chatbot Persona & Model Settings
                  </h4>

                  {/* Chatbot Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      AI Assistant Name
                    </label>
                    <input
                      type="text"
                      value={settings.chatbotName}
                      onChange={(e) => setSettings({ ...settings, chatbotName: e.target.value })}
                      placeholder="e.g. Dezo AI Copilot"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  {/* OpenAI API Key */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>OpenAI API Key (Optional)</span>
                      <span className="text-[10px] text-slate-400">Uses smart offline engine if empty</span>
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={settings.apiKey}
                        onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                        placeholder="sk-proj-••••••••••••••••••••"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Tone of Voice */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Default Tone of Voice
                    </label>
                    <select
                      value={settings.tone}
                      onChange={(e) => setSettings({ ...settings, tone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                    >
                      {toneOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Model Choice */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      OpenAI Model
                    </label>
                    <select
                      value={settings.model}
                      onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="gpt-4o-mini">gpt-4o-mini (Fast & Recommended)</option>
                      <option value="gpt-4o">gpt-4o (High Intelligence)</option>
                      <option value="gpt-3.5-turbo">gpt-3.5-turbo (Standard)</option>
                    </select>
                  </div>

                  {/* System Prompt / Persona */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      System Instructions / Persona Prompt
                    </label>
                    <textarea
                      rows={3}
                      value={settings.systemPrompt}
                      onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                      className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-extrabold text-xs transition shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    Save Assistant Settings
                  </button>
                </div>
              </div>
            ) : (
              /* Generator Form & Output */
              <div className="space-y-6">
                {/* Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Topic / Product Name / Focus Keyword
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Enterprise AI Operating System"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Tone of Voice
                    </label>
                    <select
                      value={selectedTone}
                      onChange={(e) => setSelectedTone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                    >
                      {toneOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Additional Context or Custom Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="e.g. Focus on ROI, zero maintenance, and 24/7 reliability"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {settings.chatbotName} is generating copy...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate {activeTab.toUpperCase()} Copy Suggestions
                    </>
                  )}
                </button>

                {/* Output Previews */}
                {generatedData && (
                  <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Generated Copy Result
                      </h4>
                      <button
                        type="button"
                        onClick={handleGenerate}
                        className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Regenerate
                      </button>
                    </div>

                    {/* Rendering Structured Cards based on Active Type */}
                    {activeTab === 'hero' && (
                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400">Badge Text</span>
                          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">{generatedData.badgeText}</span>
                            <button
                              type="button"
                              onClick={() => handleInsert('badgeText', generatedData.badgeText)}
                              className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[11px] font-bold hover:bg-cyan-500/20 transition cursor-pointer"
                            >
                              ⚡ Insert Badge
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400">Main Heading</span>
                          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-xs font-black text-slate-900 dark:text-white">{generatedData.mainHeading}</span>
                            <button
                              type="button"
                              onClick={() => handleInsert('mainHeading', generatedData.mainHeading)}
                              className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[11px] font-bold hover:bg-cyan-500/20 transition cursor-pointer"
                            >
                              ⚡ Insert Heading
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400">Gradient Highlight</span>
                          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-xs font-black text-cyan-500">{generatedData.gradientHeading}</span>
                            <button
                              type="button"
                              onClick={() => handleInsert('gradientHeading', generatedData.gradientHeading)}
                              className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[11px] font-bold hover:bg-cyan-500/20 transition cursor-pointer"
                            >
                              ⚡ Insert Gradient
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400">Description Subtitle</span>
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{generatedData.description}</p>
                            <button
                              type="button"
                              onClick={() => handleInsert('description', generatedData.description)}
                              className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[11px] font-bold hover:bg-cyan-500/20 transition cursor-pointer"
                            >
                              ⚡ Insert Description
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'product' && (
                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">{generatedData.title}</h5>
                          <span className="text-xs font-bold text-cyan-500">{generatedData.subtitle}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300">{generatedData.description}</p>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-500">Key Features</span>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {generatedData.features?.map((f: string, idx: number) => (
                              <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleInsert('product', generatedData)}
                          className="w-full py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-extrabold text-xs transition cursor-pointer"
                        >
                          ⚡ Insert Full Product Copy into CMS
                        </button>
                      </div>
                    )}

                    {activeTab === 'faq' && Array.isArray(generatedData) && (
                      <div className="space-y-3">
                        {generatedData.map((faq, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white">Q: {faq.question}</span>
                              <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold">{faq.category}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">A: {faq.answer}</p>
                            <button
                              type="button"
                              onClick={() => handleInsert('faq', faq)}
                              className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[11px] font-bold hover:bg-cyan-500/20 transition cursor-pointer"
                            >
                              ⚡ Insert FAQ Pair
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'testimonial' && (
                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">{generatedData.name}</span>
                            <span className="text-xs text-slate-500 block">{generatedData.designation} @ {generatedData.company}</span>
                          </div>
                          <span className="text-amber-400 font-bold text-xs">★★★★★ ({generatedData.rating}/5)</span>
                        </div>
                        <p className="text-xs italic text-slate-700 dark:text-slate-300">"{generatedData.review}"</p>
                        <button
                          type="button"
                          onClick={() => handleInsert('testimonial', generatedData)}
                          className="w-full py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-bold text-xs transition cursor-pointer"
                        >
                          ⚡ Insert Testimonial Review
                        </button>
                      </div>
                    )}

                    {activeTab === 'seo' && (
                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-500">Meta Title</span>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{generatedData.metaTitle}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-500">Meta Description</span>
                          <p className="text-xs text-slate-700 dark:text-slate-300">{generatedData.metaDescription}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-500">Keywords</span>
                          <p className="text-xs text-cyan-500 font-mono">{generatedData.keywords}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleInsert('seo', generatedData)}
                          className="w-full py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-extrabold text-xs transition cursor-pointer"
                        >
                          ⚡ Insert SEO Meta Tags
                        </button>
                      </div>
                    )}

                    {activeTab === 'cta' && (
                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                        <h5 className="text-xs font-black text-slate-900 dark:text-white">{generatedData.bannerHeadline}</h5>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{generatedData.subtext}</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleInsert('primaryBtnText', generatedData.primaryBtnText)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-extrabold cursor-pointer"
                          >
                            Primary: {generatedData.primaryBtnText}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInsert('secondaryBtnText', generatedData.secondaryBtnText)}
                            className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold cursor-pointer"
                          >
                            Secondary: {generatedData.secondaryBtnText}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
