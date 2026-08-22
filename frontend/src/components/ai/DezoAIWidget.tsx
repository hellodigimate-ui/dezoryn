import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Sparkles,
  X,
  Send,
  MessageSquare,
  Calendar,
  PhoneCall,
  Ticket,
  BookOpen,
  HelpCircle,
  LayoutDashboard,
  GraduationCap,
  Tag,
  Briefcase,
  Layers,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Zap,
  CheckCircle2,
  Sun,
  Moon
} from 'lucide-react';
import { apiFetch } from '../../config/api.config';

import { useNavigation } from '../../utils/NavigationContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  quickReplies?: { label: string; action: () => void }[];
  cta?: { label: string; route?: string; link?: string; onClick?: () => void };
}

export const openDezoAI = (query?: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-dezo-ai', { detail: { query } }));
  }
};

export const DezoAIWidget: React.FC = React.memo(() => {
  const { navigateTo } = useNavigation();
  const { settings: siteSettings } = useSiteSettings();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const fabMenuRef = React.useRef<HTMLDivElement>(null);
  const fabLeaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFabWrapperEnter = () => {
    if (fabLeaveTimer.current) clearTimeout(fabLeaveTimer.current);
    setFabMenuOpen(true);
  };
  const handleFabWrapperLeave = () => {
    fabLeaveTimer.current = setTimeout(() => setFabMenuOpen(false), 350);
  };

  // Also close menu when clicking outside
  useEffect(() => {
    if (!fabMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (fabMenuRef.current && !fabMenuRef.current.contains(e.target as Node)) {
        setFabMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [fabMenuOpen]);

  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'ticket' | 'faq'>('home');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [widgetTheme, setWidgetTheme] = useState<'dark' | 'light'>('dark');

  const [botName, setBotName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dezo-ai-chatbot-name') || 'DezoAI';
    }
    return 'DezoAI';
  });

  useEffect(() => {
    const fetchSettings = () => {
      apiFetch('/ai/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.chatbotName) {
            setBotName(data.data.chatbotName);
          }
        })
        .catch(() => {
          const local = localStorage.getItem('dezo-ai-chatbot-name');
          if (local) setBotName(local);
        });
    };

    fetchSettings();

    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail?.chatbotName) {
        setBotName(detail.chatbotName);
      }
    };

    window.addEventListener('dezo-ai-settings-updated', handleUpdate);
    return () => window.removeEventListener('dezo-ai-settings-updated', handleUpdate);
  }, []);

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  // Sync widget theme with document dark mode & window resize
  useEffect(() => {
    setMounted(true);

    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
      setWidgetTheme(isDark ? 'dark' : 'light');
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Listen for open-dezo-ai global trigger events across the app
  useEffect(() => {
    const handleOpenAI = (e: Event) => {
      setIsOpen(true);
      setActiveTab('chat');
      const detail = (e as CustomEvent)?.detail;
      if (detail?.query) {
        handleSendMessage(detail.query);
      }
    };

    window.addEventListener('open-dezo-ai', handleOpenAI);
    return () => window.removeEventListener('open-dezo-ai', handleOpenAI);
  }, []);

  const toggleWidgetTheme = () => {
    setWidgetTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = widgetTheme === 'dark';

  // Compute strict viewport drag constraints so widget cannot leave screen bounds
  const pillConstraints = {
    left: -(windowSize.width - 64 - 36),
    right: 0,
    top: -(windowSize.height - 64 - 36),
    bottom: 0
  };




  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard navigation & ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Initial typing welcome lines
  const welcomeLines = [
    "Hello 👋",
    `Welcome to ${siteSettings.websiteName || 'Dezoryn Technologies'}.`,
    `I'm ${botName}.`,
    "How can I help you today?"
  ];
  const [visibleWelcomeLines, setVisibleWelcomeLines] = useState<number>(0);

  useEffect(() => {
    if (isOpen && visibleWelcomeLines < welcomeLines.length) {
      const timer = setTimeout(() => {
        setVisibleWelcomeLines(prev => prev + 1);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [isOpen, visibleWelcomeLines]);

  // Initial Chat Messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `Welcome to ${siteSettings.websiteName || 'Dezoryn Technologies'}! I'm ${botName}, your assistant. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        { label: "Book a Demo", action: () => navigateTo('/book-demo') },
        { label: "View Pricing", action: () => navigateTo('/pricing') },
        { label: "Contact Us", action: () => navigateTo('/contact-sales') }
      ]
    }
  ]);

  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome-1') {
        return [{
          ...prev[0],
          text: `Welcome to ${siteSettings.websiteName || 'Dezoryn Technologies'}! I'm ${botName}, your assistant. How can I help you today?`,
        }];
      }
      return prev;
    });
  }, [botName, siteSettings.websiteName]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, activeTab]);

  // Quick Action items
  const quickActions = [
    {
      id: 'crm',
      title: 'Platform Features',
      icon: LayoutDashboard,
      color: isDark ? 'from-blue-500/20 to-cyan-500/20 text-cyan-400' : 'from-blue-100 to-cyan-100 text-cyan-700',
      query: 'Tell me about the Dezoryn Technologies Platform features.'
    },
    {
      id: 'erp',
      title: 'School ERP',
      icon: GraduationCap,
      color: isDark ? 'from-purple-500/20 to-indigo-500/20 text-purple-400' : 'from-purple-100 to-indigo-100 text-purple-700',
      query: 'What modules are included in the School ERP software?'
    },
    {
      id: 'pricing',
      title: 'Pricing & Plans',
      icon: Tag,
      color: isDark ? 'from-emerald-500/20 to-teal-500/20 text-emerald-400' : 'from-emerald-100 to-teal-100 text-emerald-700',
      query: 'What are the Dezoryn Technologies subscription plans and pricing details?'
    },
    {
      id: 'careers',
      title: 'Careers',
      icon: Briefcase,
      color: isDark ? 'from-amber-500/20 to-orange-500/20 text-amber-400' : 'from-amber-100 to-orange-100 text-amber-700',
      query: 'What job openings and career opportunities are available at Dezoryn Technologies?'
    },
    {
      id: 'integrations',
      title: 'Integrations',
      icon: Layers,
      color: isDark ? 'from-pink-500/20 to-rose-500/20 text-pink-400' : 'from-pink-100 to-rose-100 text-pink-700',
      query: 'Which third-party services and APIs does Dezoryn Technologies integrate with?'
    },
    {
      id: 'demo',
      title: 'Book a Demo',
      icon: Calendar,
      color: isDark ? 'from-cyan-500/20 to-blue-500/20 text-cyan-400' : 'from-cyan-100 to-blue-100 text-cyan-700',
      query: 'How can I schedule a live 1-on-1 product demo?'
    }
  ];

  // Popular Question chips
  const popularQuestions = [
    "How much does CRM cost?",
    "Can I schedule a demo?",
    "Do you offer API integrations?",
    "Which ERP modules are available?",
    "How do I migrate my existing data?"
  ];

  // Support Action cards
  const supportActions = [
    {
      id: 'live-chat',
      title: 'Live Chat',
      desc: 'Connect with DezoAI instant engine',
      icon: MessageSquare,
      color: isDark ? 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30' : 'text-cyan-600 bg-cyan-50 border-cyan-200',
      onClick: () => setActiveTab('chat')
    },
    {
      id: 'book-demo',
      title: 'Book Product Demo',
      desc: 'Schedule a 1-on-1 personalized walkthrough',
      icon: Calendar,
      color: isDark ? 'text-purple-400 bg-purple-950/40 border-purple-500/30' : 'text-purple-600 bg-purple-50 border-purple-200',
      onClick: () => navigateTo('/book-demo')
    },
    {
      id: 'contact-sales',
      title: 'Contact Us',
      desc: 'Speak directly with our enterprise team',
      icon: PhoneCall,
      color: isDark ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' : 'text-emerald-600 bg-emerald-50 border-emerald-200',
      onClick: () => navigateTo('/contact-sales')
    },
    {
      id: 'raise-ticket',
      title: 'Raise Support Ticket',
      desc: 'Submit a ticket to our 24/7 support desk',
      icon: Ticket,
      color: isDark ? 'text-amber-400 bg-amber-950/40 border-amber-500/30' : 'text-amber-600 bg-amber-50 border-amber-200',
      onClick: () => setActiveTab('ticket')
    },
    {
      id: 'faqs',
      title: 'FAQs',
      desc: 'Frequently asked questions',
      icon: BookOpen,
      color: isDark ? 'text-pink-400 bg-pink-950/40 border-pink-500/30' : 'text-pink-600 bg-pink-50 border-pink-200',
      onClick: () => setActiveTab('faq')
    }
  ];

  // FAQ list
  const faqs = [
    {
      q: "What makes Dezoryn Technologies different from traditional software platforms?",
      a: "Dezoryn Technologies combines AI-driven lead scoring, automated sales pipelines, omnichannel communications, and built-in School ERP governance into a unified enterprise platform."
    },
    {
      q: "How does the free trial work?",
      a: "You get full enterprise access for 14 days with no credit card required. You can invite unlimited team members and test all automation workflows."
    },
    {
      q: "Can I migrate existing contacts and deal data?",
      a: "Yes! Dezoryn Technologies includes one-click migration wizards for Salesforce, HubSpot, Zoho, Excel/CSV, and SQL databases."
    },
    {
      q: "Is Dezoryn Technologies SOC-2 and GDPR compliant?",
      a: "Absolutely. We enforce end-to-end 256-bit encryption, role-based security control, automated daily backups, and strict data privacy compliance."
    }
  ];

  // Simulated AI Knowledge Base & Response Generator
  const generateAIResponse = (userQuery: string): { text: string; cta?: { label: string; route?: string } } => {
    const q = userQuery.toLowerCase();
    
    if (q.includes('cost') || q.includes('price') || q.includes('pricing') || q.includes('plan')) {
      return {
        text: "Dezoryn Technologies offers scalable plans tailored to growing teams and enterprises:\n\n• **Starter**: ₹2,499/user/mo (Essential CRM & Lead Tracking)\n• **Professional**: ₹5,999/user/mo (Advanced AI Pipeline & Automations)\n• **Enterprise**: Custom volume pricing with dedicated SLA, custom ERP integrations & 24/7 manager.",
        cta: { label: "Explore Detailed Pricing", route: "/pricing" }
      };
    }
    
    if (q.includes('demo') || q.includes('schedule') || q.includes('book')) {
      return {
        text: "You can schedule a personalized 1-on-1 live product demo with our solution architects! We'll walk you through automated pipelines, AI scoring, and custom ERP integration.",
        cta: { label: "Book a Demo Now", route: "/book-demo" }
      };
    }

    if (q.includes('erp') || q.includes('school') || q.includes('education')) {
      return {
        text: "Dezo School ERP includes 15+ specialized modules:\n\n• Student Information & Admissions\n• Fee Management & Billing\n• Examination & Report Cards\n• Parent-Teacher Portal\n• Transport & Asset Tracking",
        cta: { label: "View All ERP Products", route: "/products" }
      };
    }

    if (q.includes('api') || q.includes('integration') || q.includes('connect')) {
      return {
        text: "Dezoryn Technologies supports over 100+ native integrations including WhatsApp Business, Gmail, Outlook, Stripe, Zapier, Slack, and REST APIs for custom webhooks.",
        cta: { label: "Explore Marketplace", route: "/products" }
      };
    }

    if (q.includes('migrate') || q.includes('switch') || q.includes('import')) {
      return {
        text: "Migration to Dezoryn Technologies is effortless! Our automated import wizard lets you import CSV/Excel data or sync directly from Salesforce, HubSpot, and Zoho with zero downtime.",
        cta: { label: "Contact Migration Specialist", route: "/contact-sales" }
      };
    }

    if (q.includes('job') || q.includes('career') || q.includes('hiring') || q.includes('opening') || q.includes('position') || q.includes('work')) {
      return {
        text: "Dezoryn Technologies is hiring! We currently have open positions across Engineering & AI, Product & Design, Sales, and Customer Success:\n\n• **Senior Full-Stack AI Engineer** (₹13,00,000 - ₹17,00,000)\n• **Lead Product Designer** (₹11,50,000 - ₹15,00,000)\n• **Enterprise Sales Account Executive** (₹12,00,000 - ₹16,00,000)\n• **AI Research Scientist** (₹15,00,000 - ₹20,00,000)",
        cta: { label: "View All Job Openings", route: "/careers" }
      };
    }

    return {
      text: `DezoAI has processed your request regarding "${userQuery}". Dezoryn Technologies delivers end-to-end sales pipeline automation, real-time analytics, and intelligent customer engagement tailored to high-growth organizations.`,
      cta: { label: "Contact Sales Specialist", route: "/contact-sales" }
    };
  };

  // Submit User Message
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setActiveTab('chat');
    setIsTyping(true);

    // Dynamic AI response stream delay
    setTimeout(() => {
      const responseData = generateAIResponse(text);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: responseData.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cta: responseData.cta ? {
          label: responseData.cta.label,
          onClick: () => responseData.cta?.route && navigateTo(responseData.cta.route as any)
        } : undefined
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 900);
  };

  // Submit Support Ticket state
  const [ticketForm, setTicketForm] = useState({ name: '', email: '', subject: '', priority: 'Medium', message: '' });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setTicketForm({ name: '', email: '', subject: '', priority: 'Medium', message: '' });
      setActiveTab('chat');
      setMessages(prev => [
        ...prev,
        {
          id: `ticket-confirm-${Date.now()}`,
          sender: 'bot',
          text: `✅ Support Ticket #${Math.floor(100000 + Math.random() * 900000)} has been created successfully! Our team will reach out to ${ticketForm.email || 'your email'} within 2 hours.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* FLOATING BUTTON */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="dezo-icon-button"
            drag
            dragConstraints={pillConstraints}
            dragElastic={0.05}
            dragMomentum={true}
            whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
            initial={{ opacity: 0, scale: 0.7, y: 15 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ opacity: { duration: 0.25 }, scale: { duration: 0.25 } }}
            aria-label="Toggle DezoAI Quick Menu"
            role="region"
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 99999,
              pointerEvents: 'auto',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            className="relative select-none"
          >
            {/* Wrapper div — hover OR click opens menu, leave closes after 350ms */}
            <div
              ref={fabMenuRef}
              className="relative"
              onMouseEnter={handleFabWrapperEnter}
              onMouseLeave={handleFabWrapperLeave}
            >

            {/* ── Click-to-open quick-action panel ── */}
            <div
              className={`absolute bottom-[80px] right-0 w-56 transition-all duration-300 ease-out origin-bottom-right ${
                fabMenuOpen
                  ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                  : 'opacity-0 translate-y-3 scale-95 pointer-events-none'
              }`}
            >
              <div className={`rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-2xl ${
                isDark
                  ? 'bg-slate-900/95 border-cyan-500/25 shadow-cyan-500/10'
                  : 'bg-white/98 border-slate-200/80 shadow-slate-300/40'
              }`}>
                {/* Header */}
                <div className={`px-4 py-3 border-b flex items-center gap-2.5 ${
                  isDark ? 'border-slate-800/80 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                    />
                    <span className={`text-[11px] font-black uppercase tracking-widest ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>DezoAI</span>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    {/* Typing dots */}
                    {[0, 0.18, 0.36].map((delay, i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay }}
                        className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-cyan-400' : 'bg-cyan-500'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* "Need help?" label */}
                <div className={`px-4 pt-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Need help?
                </div>

                {/* Quick action links */}
                {[
                  { label: 'Book Demo', icon: '🗓️', query: 'I want to book a demo', color: 'from-cyan-500 to-blue-600' },
                  { label: 'Product Questions', icon: '💡', query: 'I have product questions', color: 'from-blue-500 to-indigo-600' },
                  { label: 'Documentation', icon: '📚', query: 'Show me the documentation', color: 'from-indigo-500 to-purple-600' },
                  { label: 'Live Support', icon: '🎧', query: 'I need live support', color: 'from-purple-500 to-pink-500' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => { openDezoAI(item.query); setFabMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-200 group/item cursor-pointer border-none bg-transparent ${
                      isDark
                        ? 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                        : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span className={`flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br ${item.color} text-white text-sm shadow-md flex-shrink-0 group-hover/item:scale-110 transition-transform duration-200`}>
                      {item.icon}
                    </span>
                    <span className="text-xs font-semibold">{item.label}</span>
                    <span className={`ml-auto text-[10px] opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 ${
                      isDark ? 'text-cyan-400' : 'text-cyan-600'
                    }`}>→</span>
                  </button>
                ))}

                {/* Open full chat */}
                <div className={`px-3 pb-3 pt-2 border-t mt-1 ${isDark ? 'border-slate-800/60' : 'border-slate-100'}`}>
                  <button
                    type="button"
                    onClick={() => { setIsOpen(true); setFabMenuOpen(false); }}
                    className={`w-full py-2 rounded-xl text-[11px] font-black uppercase tracking-wider text-white cursor-pointer border-none bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-cyan-500/30`}
                  >
                    Open Full Chat ✨
                  </button>
                </div>
              </div>

              {/* Panel caret arrow pointing to button */}
              <div className="flex justify-end pr-5 -mt-px">
                <div className={`w-3 h-3 rotate-45 border-r border-b ${
                  isDark ? 'bg-slate-900/95 border-slate-800/80' : 'bg-white/98 border-slate-200/80'
                }`} />
              </div>
            </div>

            {/* ── Main FAB button ── */}
            <div
              onClick={(e) => { e.stopPropagation(); setFabMenuOpen(prev => !prev); }}
              style={{ cursor: 'pointer' }}
              className={`relative flex items-center justify-center w-12 h-12 sm:w-[60px] sm:h-[60px] rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-blue-600 to-purple-600 transition-transform duration-300 hover:scale-105 transform-gpu ${
                isDark
                  ? 'shadow-[0_0_20px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.7)]'
                  : 'shadow-[0_6px_20px_rgba(6,182,212,0.35)] hover:shadow-[0_10px_30px_rgba(6,182,212,0.5)]'
              }`}
            >
              {/* Inner frosted glass */}
              <div className={`w-full h-full rounded-full flex items-center justify-center relative overflow-hidden backdrop-blur-md ${
                isDark ? 'bg-slate-950/90' : 'bg-white/95 shadow-inner'
              }`}>
                <div className={`absolute inset-0 bg-gradient-to-tr opacity-80 ${
                  isDark ? 'from-cyan-500/25 via-blue-500/15 to-purple-500/25' : 'from-cyan-400/20 via-blue-400/10 to-purple-400/20'
                }`} />
                <div className="relative z-10">
                  <Bot className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-200 ${
                    isDark ? 'text-cyan-300' : 'text-cyan-600'
                  }`} />
                </div>
              </div>

              {/* Online status dot */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4 z-20">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" style={{ animationDuration: '3s' }} />
                <span className={`relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 shadow-[0_0_10px_rgba(16,185,129,0.9)] ${
                  isDark ? 'border-slate-950' : 'border-white'
                }`} />
              </span>
            </div>
            </div>{/* end fabMenuRef wrapper */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* EXPANDED PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="dezo-panel"
            role="dialog"
            aria-label={`${botName} Assistant`}
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            style={{
              position: 'fixed',
              bottom: '96px',
              right: '16px',
              width: 'min(360px, calc(100vw - 32px))',
              height: `min(560px, calc(100vh - 112px))`,
              zIndex: 99999,
              pointerEvents: 'auto',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            className={`rounded-[20px] backdrop-blur-2xl flex flex-col overflow-hidden select-none ${
              isDark
                ? 'bg-slate-950/90 border border-cyan-500/35 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_40px_rgba(6,182,212,0.2)]'
                : 'bg-white/95 border border-cyan-500/30 shadow-[0_15px_40px_rgba(0,0,0,0.12),0_0_30px_rgba(6,182,212,0.18)] text-slate-800'
            }`}
          >

            {/* Top Drag Grip Bar */}
            <div className={`w-full py-1 cursor-grab active:cursor-grabbing flex justify-center border-b ${
              isDark ? 'bg-slate-950/80 border-slate-900' : 'bg-slate-100/90 border-slate-200'
            }`}>
              <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-slate-700/60' : 'bg-slate-300'}`} />
            </div>

            {/* Ambient Background Aurora & Radial Effects */}
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none animate-pulse-glow ${
              isDark ? 'bg-gradient-to-b from-cyan-500/15 via-blue-600/10 to-transparent' : 'bg-gradient-to-b from-cyan-400/20 via-blue-400/15 to-transparent'
            }`} />
            <div className={`absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
              isDark ? 'bg-gradient-to-t from-purple-600/15 via-indigo-600/10 to-transparent' : 'bg-gradient-to-t from-purple-400/15 via-indigo-400/10 to-transparent'
            }`} />

            {/* Glowing Border Beam Effect */}
            <div className={`absolute inset-0 rounded-[20px] pointer-events-none border ${
              isDark ? 'border-cyan-400/20 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]' : 'border-cyan-500/20 shadow-[inset_0_0_12px_rgba(6,182,212,0.08)]'
            }`} />

            {/* ---------------------------------------------------- */}
            {/* PANEL HEADER                                         */}
            {/* ---------------------------------------------------- */}
            <div className={`relative z-20 flex items-center justify-between px-4 py-3 border-b backdrop-blur-md ${
              isDark ? 'border-slate-800/80 bg-slate-950/60' : 'border-slate-200/90 bg-white/80'
            }`}>
              <div className="flex items-center gap-2.5">
                {/* Bot Avatar with Halo */}
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1px] shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                  <div className={`w-full h-full rounded-full flex items-center justify-center ${
                    isDark ? 'bg-slate-900' : 'bg-slate-900 text-white'
                  }`}>
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                  </div>
                </div>

                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-bold bg-clip-text text-transparent ${
                      isDark
                        ? 'bg-gradient-to-r from-white via-slate-100 to-cyan-300'
                        : 'bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-600'
                    }`}>
                      {botName} Assistant
                    </span>
                    {/* Live Online Badge */}
                    <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded-full flex items-center gap-1 ${
                      isDark
                        ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/30'
                        : 'text-emerald-700 bg-emerald-50 border border-emerald-300'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </span>
                  </div>
                  <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Enterprise Help & AI Support
                  </span>
                </div>
              </div>

              {/* Action Buttons: Theme Toggle, Reset & Close */}
              <div className="flex items-center gap-1">
                {/* Sun / Moon Light & Dark Theme Toggle Button */}
                <button
                  onClick={toggleWidgetTheme}
                  title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
                  className={`p-1 rounded-full transition-all ${
                    isDark
                      ? 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-purple-600 hover:bg-slate-200/80'
                  }`}
                >
                  {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
                </button>

                {activeTab === 'chat' && (
                  <button
                    onClick={() => {
                      setMessages([
                        {
                          id: `welcome-${Date.now()}`,
                          sender: 'bot',
                          text: "Conversation reset! How can DezoAI assist you now?",
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                      ]);
                    }}
                    title="Reset Conversation"
                    className={`p-1 rounded-full transition-all ${
                      isDark
                        ? 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
                        : 'text-slate-600 hover:text-cyan-600 hover:bg-slate-200/80'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Assistant (ESC)"
                  className={`p-1 rounded-full transition-all hover:rotate-90 duration-200 ${
                    isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* PANEL NAVIGATION TABS                                */}
            {/* ---------------------------------------------------- */}
            <div className={`relative z-20 flex items-center px-3 py-1.5 border-b gap-1 text-[11px] font-semibold ${
              isDark ? 'border-slate-800/50 bg-slate-900/40' : 'border-slate-200/80 bg-slate-100/60'
            }`}>
              <button
                onClick={() => setActiveTab('home')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeTab === 'home'
                    ? isDark
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-cyan-700 border border-cyan-500/40 shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  activeTab === 'chat'
                    ? isDark
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-cyan-700 border border-cyan-500/40 shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                AI Chat
              </button>
              <button
                onClick={() => setActiveTab('ticket')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  activeTab === 'ticket'
                    ? isDark
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-cyan-700 border border-cyan-500/40 shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Ticket className="w-3 h-3" />
                Ticket
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  activeTab === 'faq'
                    ? isDark
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-cyan-700 border border-cyan-500/40 shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <HelpCircle className="w-3 h-3" />
                FAQ
              </button>
            </div>

            {/* ---------------------------------------------------- */}
            {/* MAIN CONTENT CONTAINER                               */}
            {/* ---------------------------------------------------- */}
            <div className="relative z-10 flex-1 overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
              
              {/* TAB 1: HOME DASHBOARD */}
              {activeTab === 'home' && (
                <div className="space-y-4">
                  {/* Sequential Typing Welcome Animation */}
                  <div className={`p-3 rounded-xl border shadow-md relative overflow-hidden ${
                    isDark
                      ? 'bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-cyan-950/30 border-cyan-500/25'
                      : 'bg-gradient-to-br from-cyan-50/90 via-slate-50 to-blue-50/60 border-cyan-200'
                  }`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
                    <div className="space-y-1">
                      {welcomeLines.slice(0, visibleWelcomeLines).map((line, idx) => (
                        <motion.p
                          key={idx}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`text-xs ${
                            idx === 0
                              ? isDark ? 'font-bold text-cyan-300 text-sm' : 'font-bold text-cyan-600 text-sm'
                              : idx === 3
                              ? isDark ? 'font-semibold text-white' : 'font-semibold text-slate-900'
                              : isDark ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          {line}
                        </motion.p>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions Grid */}
                  <div>
                    <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      <Zap className="w-3 h-3 text-cyan-500" />
                      Quick Actions
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {quickActions.map(qa => {
                        const Icon = qa.icon;
                        return (
                          <motion.button
                            key={qa.id}
                            whileHover={{ y: -2, scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleSendMessage(qa.query)}
                            className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left group ${
                              isDark
                                ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-850'
                                : 'bg-white/90 border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50 shadow-sm'
                            }`}
                          >
                            <div className={`p-1.5 rounded-md bg-gradient-to-br ${qa.color} border border-slate-700/30 group-hover:scale-105 transition-transform`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className={`text-[11px] font-semibold transition-colors ${
                              isDark ? 'text-slate-200 group-hover:text-cyan-300' : 'text-slate-800 group-hover:text-cyan-600'
                            }`}>
                              {qa.title}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Popular Questions (Chips) */}
                  <div>
                    <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      <Sparkles className="w-3 h-3 text-purple-500" />
                      Popular Questions
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {popularQuestions.map((q, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleSendMessage(q)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all shadow-sm ${
                            isDark
                              ? 'bg-slate-900/80 border-cyan-500/20 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-200'
                              : 'bg-white/90 border-slate-200 text-slate-700 hover:text-cyan-700 hover:border-cyan-400 hover:bg-cyan-50'
                          }`}
                        >
                          {q}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Support Actions Cards */}
                  <div>
                    <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      <MessageSquare className="w-3 h-3 text-emerald-500" />
                      Support Options
                    </h4>
                    <div className="space-y-1.5">
                      {supportActions.map(action => {
                        const Icon = action.icon;
                        return (
                          <motion.button
                            key={action.id}
                            whileHover={{ x: 3 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={action.onClick}
                            className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-left group ${
                              isDark
                                ? 'bg-slate-900/50 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-850/80'
                                : 'bg-white/90 border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/40 shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`p-2 rounded-lg border ${action.color}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex flex-col">
                                <span className={`text-xs font-bold transition-colors ${
                                  isDark ? 'text-slate-100 group-hover:text-cyan-300' : 'text-slate-900 group-hover:text-cyan-600'
                                }`}>
                                  {action.title}
                                </span>
                                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {action.desc}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className={`w-3.5 h-3.5 transition-all ${
                              isDark
                                ? 'text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-0.5'
                                : 'text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-0.5'
                            }`} />
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AI CHAT FEED */}
              {activeTab === 'chat' && (
                <div className="space-y-3">
                  {messages.map(msg => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end gap-1.5 max-w-[90%]">
                        {msg.sender === 'bot' && (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1px] flex-shrink-0">
                            <div className={`w-full h-full rounded-full flex items-center justify-center ${
                              isDark ? 'bg-slate-950' : 'bg-slate-900 text-white'
                            }`}>
                              <Bot className="w-3 h-3 text-cyan-300" />
                            </div>
                          </div>
                        )}

                        <div
                          className={`p-3 rounded-xl text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                              : isDark
                              ? 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.text}</p>

                          {/* Quick CTA button in bot response */}
                          {msg.cta && (
                            <button
                              onClick={msg.cta.onClick}
                              className={`mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                isDark
                                  ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
                                  : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-300'
                              }`}
                            >
                              {msg.cta.label}
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      <span className={`text-[9px] mt-0.5 px-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </span>
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1.5"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1px]">
                        <div className={`w-full h-full rounded-full flex items-center justify-center ${
                          isDark ? 'bg-slate-950' : 'bg-slate-900 text-white'
                        }`}>
                          <Bot className="w-3 h-3 text-cyan-300" />
                        </div>
                      </div>
                      <div className={`p-2.5 rounded-xl text-xs flex items-center gap-1 border ${
                        isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                      }`}>
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping delay-150" />
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping delay-300" />
                        <span className={`ml-1 font-medium text-[10px] ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`}>
                          DezoAI is analyzing...
                        </span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              )}

              {/* TAB 3: RAISE SUPPORT TICKET */}
              {activeTab === 'ticket' && (
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg border ${
                    isDark ? 'bg-slate-900/80 border-cyan-500/20' : 'bg-white border-cyan-300 shadow-sm'
                  }`}>
                    <h4 className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      <Ticket className="w-3.5 h-3.5 text-cyan-500" />
                      Submit a Support Ticket
                    </h4>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Our enterprise support team responds within 2 business hours.
                    </p>
                  </div>

                  {ticketSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-5 rounded-xl border text-center space-y-2 ${
                        isDark ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                      }`}
                    >
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                      <h4 className={`text-xs font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                        Ticket Submitted!
                      </h4>
                      <p className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        We have received your ticket request. Confirmation details sent to your inbox.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleTicketSubmit} className="space-y-2.5 text-xs">
                      <div>
                        <label className={`block font-semibold mb-0.5 text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Your Name</label>
                        <input
                          type="text"
                          required
                          value={ticketForm.name}
                          onChange={e => setTicketForm({ ...ticketForm, name: e.target.value })}
                          placeholder="John Doe"
                          className={`w-full px-2.5 py-1.5 rounded-lg border transition-all focus:outline-none ${
                            isDark
                              ? 'bg-slate-900 border-slate-800 text-slate-200 focus:border-cyan-400'
                              : 'bg-white border-slate-200 text-slate-900 focus:border-cyan-500 shadow-sm'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block font-semibold mb-0.5 text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Work Email</label>
                        <input
                          type="email"
                          required
                          value={ticketForm.email}
                          onChange={e => setTicketForm({ ...ticketForm, email: e.target.value })}
                          placeholder="john@company.com"
                          className={`w-full px-2.5 py-1.5 rounded-lg border transition-all focus:outline-none ${
                            isDark
                              ? 'bg-slate-900 border-slate-800 text-slate-200 focus:border-cyan-400'
                              : 'bg-white border-slate-200 text-slate-900 focus:border-cyan-500 shadow-sm'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block font-semibold mb-0.5 text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Subject</label>
                        <input
                          type="text"
                          required
                          value={ticketForm.subject}
                          onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })}
                          placeholder="Issue description..."
                          className={`w-full px-2.5 py-1.5 rounded-lg border transition-all focus:outline-none ${
                            isDark
                              ? 'bg-slate-900 border-slate-800 text-slate-200 focus:border-cyan-400'
                              : 'bg-white border-slate-200 text-slate-900 focus:border-cyan-500 shadow-sm'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block font-semibold mb-0.5 text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Message</label>
                        <textarea
                          rows={2}
                          required
                          value={ticketForm.message}
                          onChange={e => setTicketForm({ ...ticketForm, message: e.target.value })}
                          placeholder="Provide details about your query..."
                          className={`w-full px-2.5 py-1.5 rounded-lg border transition-all focus:outline-none resize-none ${
                            isDark
                              ? 'bg-slate-900 border-slate-800 text-slate-200 focus:border-cyan-400'
                              : 'bg-white border-slate-200 text-slate-900 focus:border-cyan-500 shadow-sm'
                          }`}
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 rounded-lg font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:shadow-cyan-500/25 transition-all"
                      >
                        Submit Ticket
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 4: FREQUENTLY ASKED QUESTIONS */}
              {activeTab === 'faq' && (
                <div className="space-y-2.5">
                  <div className={`p-2.5 rounded-lg border ${
                    isDark ? 'bg-slate-900/80 border-cyan-500/20' : 'bg-white border-cyan-300 shadow-sm'
                  }`}>
                    <h4 className={`text-xs font-bold flex items-center gap-1 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                      <HelpCircle className="w-3.5 h-3.5" />
                      Frequently Asked Questions
                    </h4>
                  </div>
                  {faqs.map((item, idx) => (
                    <div key={idx} className={`p-2.5 rounded-lg border space-y-1 ${
                      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <h5 className={`text-xs font-bold flex items-start gap-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <span className="text-cyan-500">Q:</span> {item.q}
                      </h5>
                      <p className={`text-[10px] leading-relaxed pl-3.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* ---------------------------------------------------- */}
            {/* BOTTOM STICKY CHAT INPUT                             */}
            {/* ---------------------------------------------------- */}
            <div className={`relative z-20 p-3 border-t backdrop-blur-md ${
              isDark ? 'border-slate-800/80 bg-slate-950/80' : 'border-slate-200/90 bg-white/95'
            }`}>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-center"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="Ask anything..."
                  className={`w-full py-2 pl-3.5 pr-10 text-xs rounded-full border transition-all duration-300 focus:outline-none ${
                    isInputFocused
                      ? isDark
                        ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] bg-slate-900 text-slate-100'
                        : 'border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.2)] bg-white text-slate-900'
                      : isDark
                      ? 'bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-500 hover:border-slate-700'
                      : 'bg-slate-100 border-slate-200 text-slate-900 placeholder:text-slate-400 hover:border-slate-300'
                  }`}
                />

                {/* Send Button: Gradient circle + Paper plane icon */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={!inputValue.trim()}
                  className={`absolute right-1 p-1.5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md transition-opacity ${
                    inputValue.trim() ? 'opacity-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3 h-3" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
});

export default DezoAIWidget;
