import React, { useState, useEffect } from 'react';

import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Search,
  ArrowRight,
  CheckCircle2,
  X,
  Sparkles,
  Laptop,
  HeartPulse,
  GraduationCap,
  Palmtree,
  Zap,
  Send,
  Globe,
  Brain,
  TrendingUp,
  Code2,
  ShieldCheck,
  Layers,
  Palette,
  Megaphone,
  Headphones,
  Settings,
  Bookmark,
  Calendar,
  UserCheck
} from 'lucide-react';

const AnimatedStatCounter: React.FC<{ value: number; suffix?: string; decimals?: number }> = ({
  value,
  suffix = '',
  decimals = 0
}) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1800;
    const steps = 40;
    const stepTime = duration / steps;
    const increment = value / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCurrentValue(value);
        clearInterval(timer);
      } else {
        setCurrentValue(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {decimals > 0 ? currentValue.toFixed(decimals) : Math.floor(currentValue)}
      {suffix}
    </span>
  );
};

export interface CareersCMSConfig {
  hero: {
    badgeText: string;
    headlinePrefix: string;
    gradientWords: string;
    description: string;
    viewPositionsBtnText: string;
    lifeAtDezorynBtnText: string;
    stats: Array<{ label: string; target: number; suffix: string; decimals: number }>;
    engineVersion: string;
    engineStatus: string;
    engineLatency: string;
    vectorQPS: string;
    accuracySLA: string;
  };
  whyJoin: {
    badgeText: string;
    title: string;
    subtitle: string;
    benefits: Array<{
      id: string;
      title: string;
      desc: string;
      gradient: string;
      badge: string;
      iconName: string;
    }>;
  };
  teamsSection: {
    badgeText: string;
    title: string;
    subtitle: string;
    teams: Array<{
      id: string;
      name: string;
      desc: string;
      teamSize: string;
      openings: number;
      gradient: string;
      color: string;
      borderColor: string;
      iconName: string;
    }>;
  };
  gallerySection: {
    badgeText: string;
    title: string;
    subtitle: string;
    items: Array<{
      id: string;
      title: string;
      category: string;
      tag: string;
      img: string;
      desc: string;
    }>;
  };
}

export const DEFAULT_CAREERS_CMS: CareersCMSConfig = {
  hero: {
    badgeText: 'Careers at Dezoryn Technologies',
    headlinePrefix: 'Build the Future of',
    gradientWords: 'Enterprise AI, Predictive Automation & Campus Technology',
    description: 'Dezoryn Technologies builds autonomous AI agent infrastructure, enterprise CRM platforms, and campus ERP management suites powering institutions worldwide.',
    viewPositionsBtnText: 'View Open Positions',
    lifeAtDezorynBtnText: 'Life at Dezoryn',
    stats: [
      { label: 'Employees', target: 150, suffix: '+', decimals: 0 },
      { label: 'Countries', target: 15, suffix: '', decimals: 0 },
      { label: 'Employee Rating', target: 4.9, suffix: ' / 5.0', decimals: 1 },
      { label: 'Retention Rate', target: 96, suffix: '%', decimals: 0 }
    ],
    engineVersion: 'DezoAI Engine v4.2',
    engineStatus: 'Multi-Tenant Cluster Active',
    engineLatency: '12ms Latency',
    vectorQPS: '2.4M QPS',
    accuracySLA: '99.8% SLA'
  },
  whyJoin: {
    badgeText: 'CULTURE & BENEFITS',
    title: 'Why Join Dezoryn Technologies?',
    subtitle: 'We empower world-class builders with top-tier compensation, complete autonomy, frontier AI research tools, and unmatched work-life balance.',
    benefits: [
      {
        id: 'b1',
        iconName: 'Globe',
        title: 'Remote First',
        desc: 'Work from anywhere in the world with flexible core hours, asynchronous workflows, and home office stipends.',
        gradient: 'from-cyan-500 to-blue-600',
        badge: 'FLEXIBLE WORK'
      },
      {
        id: 'b2',
        iconName: 'Brain',
        title: 'AI Research',
        desc: 'Pioneer novel multi-agent LLM systems, autonomous copilot engines, and domain-fine-tuned model architectures.',
        gradient: 'from-purple-500 to-indigo-600',
        badge: 'FRONTIER LABS'
      },
      {
        id: 'b3',
        iconName: 'GraduationCap',
        title: 'Learning Budget',
        desc: '₹1,60,000 annual stipend for technical courses, books, certifications, and international tech conferences.',
        gradient: 'from-emerald-500 to-teal-600',
        badge: 'GROWTH STIPEND'
      },
      {
        id: 'b4',
        iconName: 'DollarSign',
        title: 'Competitive Salary',
        desc: 'Top-tier base pay benchmarked to tier-1 markets, plus high-upside equity stock options in high-growth SaaS.',
        gradient: 'from-amber-500 to-orange-600',
        badge: 'EQUITY & BONUSES'
      },
      {
        id: 'b5',
        iconName: 'HeartPulse',
        title: 'Health Insurance',
        desc: '100% company-covered medical, dental, and vision insurance for you and your dependents with wellness perks.',
        gradient: 'from-rose-500 to-pink-600',
        badge: 'FULL COVERAGE'
      },
      {
        id: 'b6',
        iconName: 'TrendingUp',
        title: 'Career Growth',
        desc: 'Clear, merit-based promotion tracks, 1-on-1 executive mentorship, and leadership fast-track pathways.',
        gradient: 'from-blue-600 to-cyan-400',
        badge: 'LEADERSHIP PATH'
      },
      {
        id: 'b7',
        iconName: 'Laptop',
        title: 'Latest Hardware',
        desc: 'Brand-new M3 Max MacBook Pro, dual 4K monitors, ergonomic setup, and hardware upgrade cycle every 2 years.',
        gradient: 'from-indigo-500 to-purple-600',
        badge: 'TOP GEAR'
      },
      {
        id: 'b8',
        iconName: 'Palmtree',
        title: 'Annual Retreats',
        desc: 'All-expenses-paid annual team retreats in tropical destinations like Bali, Lisbon, and Costa Rica.',
        gradient: 'from-emerald-400 to-cyan-500',
        badge: 'WORLD RETREATS'
      }
    ]
  },
  teamsSection: {
    badgeText: 'ORGANIZATION & DEPARTMENTS',
    title: 'Meet Our Teams',
    subtitle: 'Discover the interdisciplinary teams crafting the next generation of autonomous enterprise software and campus technology.',
    teams: [
      {
        id: 'engineering',
        name: 'Engineering',
        iconName: 'Code2',
        desc: 'Architect high-throughput multi-tenant SaaS platforms, distributed vector databases, and real-time CRM pipelines.',
        teamSize: '45+ Engineers',
        openings: 4,
        gradient: 'from-blue-600 to-cyan-500',
        color: 'text-cyan-400',
        borderColor: 'hover:border-cyan-500/50'
      },
      {
        id: 'ai-research',
        name: 'AI Research',
        iconName: 'Brain',
        desc: 'Pioneer novel autonomous agentic frameworks, fine-tune open-weights models, and push commercial LLM boundaries.',
        teamSize: '18+ Scientists',
        openings: 2,
        gradient: 'from-purple-600 to-indigo-500',
        color: 'text-purple-400',
        borderColor: 'hover:border-purple-500/50'
      },
      {
        id: 'product',
        name: 'Product',
        iconName: 'Layers',
        desc: 'Define feature roadmaps, bridge deep technical capabilities with user empathy, and scale enterprise product strategy.',
        teamSize: '14+ PMs',
        openings: 3,
        gradient: 'from-cyan-500 to-teal-500',
        color: 'text-cyan-300',
        borderColor: 'hover:border-cyan-400/50'
      },
      {
        id: 'design',
        name: 'Design',
        iconName: 'Palette',
        desc: 'Craft intuitive 3D visualizations, sleek glassmorphism UI components, micro-interactions, and design systems.',
        teamSize: '12+ Designers',
        openings: 2,
        gradient: 'from-pink-500 to-rose-500',
        color: 'text-pink-400',
        borderColor: 'hover:border-pink-500/50'
      },
      {
        id: 'sales',
        name: 'Sales',
        iconName: 'Briefcase',
        desc: 'Partner with Fortune 500 decision-makers and global universities to deploy Dezoryn enterprise SaaS suites.',
        teamSize: '35+ Sales Reps',
        openings: 5,
        gradient: 'from-amber-500 to-orange-500',
        color: 'text-amber-400',
        borderColor: 'hover:border-amber-500/50'
      },
      {
        id: 'marketing',
        name: 'Marketing',
        iconName: 'Megaphone',
        desc: 'Drive global developer brand awareness, technical content strategies, product launches, and demand gen.',
        teamSize: '16+ Marketers',
        openings: 2,
        gradient: 'from-emerald-500 to-green-500',
        color: 'text-emerald-400',
        borderColor: 'hover:border-emerald-500/50'
      },
      {
        id: 'customer-success',
        name: 'Customer Success',
        iconName: 'Headphones',
        desc: 'Ensure zero-friction enterprise onboarding, campus IT integrations, 99.99% uptime compliance, and user adoption.',
        teamSize: '22+ Specialists',
        openings: 3,
        gradient: 'from-indigo-600 to-blue-500',
        color: 'text-indigo-400',
        borderColor: 'hover:border-indigo-500/50'
      },
      {
        id: 'operations',
        name: 'Operations',
        iconName: 'Settings',
        desc: 'Empower our global remote team with seamless people ops, talent acquisition, legal compliance, and finance infrastructure.',
        teamSize: '10+ Ops Leaders',
        openings: 1,
        gradient: 'from-violet-600 to-purple-500',
        color: 'text-violet-400',
        borderColor: 'hover:border-violet-500/50'
      }
    ]
  },
  gallerySection: {
    badgeText: 'CULTURE & MOMENTS',
    title: 'Life Behind the Screens',
    subtitle: 'From global hackathons to international retreats, explore the culture, moments, and people that make Dezoryn extraordinary.',
    items: [
      {
        id: 'office',
        title: 'San Francisco HQ & Glass Hubs',
        category: 'OFFICE ENVIRONMENT',
        tag: 'Office',
        img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
        desc: 'State-of-the-art workstations, ergonomic setup, and high-speed fiber internet.'
      },
      {
        id: 'hackathons',
        title: '24-Hour Agentic AI Hackathon',
        category: 'INNOVATION',
        tag: 'Hackathons',
        img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
        desc: 'Engineers & researchers competing to build autonomous agentic tools overnight.'
      },
      {
        id: 'workshops',
        title: 'LLM Architecture & Fine-Tuning Workshops',
        category: 'LEARNING',
        tag: 'Workshops',
        img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
        desc: 'Weekly knowledge-sharing sessions on distributed systems and RLHF fine-tuning.'
      },
      {
        id: 'retreats',
        title: 'Annual Team Retreat in Bali',
        category: 'CULTURE & TRAVEL',
        tag: 'Retreats',
        img: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
        desc: 'Connecting our global remote team in tropical paradise for bonding & surfing.'
      },
      {
        id: 'collaboration',
        title: 'Whiteboard Product Brainstorming',
        category: 'TEAMWORK',
        tag: 'Collaboration',
        img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        desc: 'Cross-functional teams sketching UX wireframes and backend data schemas together.'
      },
      {
        id: 'presentations',
        title: 'Global Tech Keynote & Demo Day',
        category: 'KEYNOTE',
        tag: 'Presentations',
        img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
        desc: 'Unveiling new Dezoryn AI Copilot capabilities live to enterprise leaders.'
      },
      {
        id: 'team-lunch',
        title: 'Friday Global Team Lunch',
        category: 'SOCIAL',
        tag: 'Team Lunch',
        img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        desc: 'Catered gourmet meals, coffee chats, and casual team hangouts across hubs.'
      },
      {
        id: 'celebrations',
        title: 'Series B & Product Release Milestone',
        category: 'CELEBRATIONS',
        tag: 'Celebrations',
        img: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
        desc: 'Popping champagne and celebrating major product shipping milestones together.'
      }
    ]
  }
};

export interface JobOpening {
  id: string;
  title: string;
  department: 'Engineering & AI' | 'Product & Design' | 'Sales & Marketing' | 'Customer Success';
  location: string;
  workType: 'Remote' | 'Hybrid' | 'On-Site';
  employmentType: string;
  salary: string;
  postedDate: string;
  experience: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  featured?: boolean;
  hiringManager?: {
    name: string;
    role: string;
    avatar: string;
  };
}

const JOB_OPENINGS: JobOpening[] = [
  {
    id: 'ai-eng-01',
    title: 'Senior Full-Stack AI Engineer',
    department: 'Engineering & AI',
    location: 'Remote (US/EU/APAC)',
    workType: 'Remote',
    employmentType: 'Full-Time',
    salary: '₹13,00,000 - ₹17,00,000',
    postedDate: '2 days ago',
    experience: '4+ Years',
    featured: true,
    description: 'Lead the architectural design and implementation of DezoAI copilot workflows, multi-agent frameworks, and real-time CRM predictive engines.',
    responsibilities: [
      'Architect scalable agentic workflows integrating Large Language Models with enterprise CRM data stores.',
      'Develop reactive front-end dashboards in React, TypeScript, and Tailwind CSS.',
      'Optimize API response latencies and vector embedding retrievals for sub-50ms query times.',
      'Collaborate with AI Researchers to deploy fine-tuned domain models for School ERP governance.'
    ],
    requirements: [
      'Strong proficiency in TypeScript, React, Node.js, and Python.',
      'Hands-on experience with OpenAI APIs, LangChain, LlamaIndex, or custom vector databases (Pinecone/Qdrant).',
      'Proven track record of shipping production SaaS web applications.',
      'Deep understanding of microservices architecture, Docker, and PostgreSQL.'
    ],
    skills: ['TypeScript', 'React', 'Python', 'LLMs', 'Node.js', 'Vector DB']
  },
  {
    id: 'product-designer-02',
    title: 'Lead Product Designer (UI/UX)',
    department: 'Product & Design',
    location: 'Hybrid (San Francisco, CA)',
    workType: 'Hybrid',
    employmentType: 'Full-Time',
    salary: '₹11,50,000 - ₹15,00,000',
    postedDate: '3 days ago',
    experience: '5+ Years',
    featured: true,
    description: 'Craft beautiful, high-converting enterprise interfaces, interactive 3D visualizations, and intuitive design systems for Dezoryn Technologies.',
    responsibilities: [
      'Own the end-to-end design lifecycle from user research wireframes to pixel-perfect Figma components.',
      'Develop micro-animations and smooth transition guidelines for complex ERP dashboards.',
      'Conduct usability tests with sales teams, enterprise managers, and campus administrators.',
      'Maintain and evolve the unified Dezo Design System.'
    ],
    requirements: [
      'Expertise in Figma, Framer, and modern prototyping tools.',
      'A stunning portfolio demonstrating complex SaaS/B2B data dashboard design.',
      'Understanding of modern CSS, Tailwind design tokens, and web animation principles.',
      'Exceptional communication and user-empathy skills.'
    ],
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping', 'User Research']
  },
  {
    id: 'sales-mgr-03',
    title: 'Enterprise Sales Account Executive',
    department: 'Sales & Marketing',
    location: 'Remote (North America)',
    workType: 'Remote',
    employmentType: 'Full-Time',
    salary: '₹12,00,000 - ₹16,00,000 + Uncapped OTE',
    postedDate: '1 week ago',
    experience: '3+ Years',
    featured: false,
    description: 'Drive new revenue expansion by closing mid-market and enterprise CRM & School ERP contracts across global markets.',
    responsibilities: [
      'Manage full sales cycles from qualified lead qualification to contract execution.',
      'Deliver tailored product demonstrations highlighting AI scoring and ERP automation.',
      'Partner with Solution Architects to respond to enterprise RFPs and custom SLA queries.',
      'Maintain strong pipeline hygiene in Dezoryn Technologies.'
    ],
    requirements: [
      '3+ years of successful SaaS B2B sales experience with proven quota attainment.',
      'Familiarity with CRM platforms, ERP software, or EdTech industry vertical.',
      'Strong consultative closing skills and executive-level pitch confidence.',
      'Self-starter mindset comfortable in a high-growth environment.'
    ],
    skills: ['B2B SaaS Sales', 'Enterprise CRM', 'Consultative Selling', 'Pipeline Mgmt']
  },
  {
    id: 'backend-arch-04',
    title: 'Senior Backend Systems Architect',
    department: 'Engineering & AI',
    location: 'Remote (Global)',
    workType: 'Remote',
    employmentType: 'Full-Time',
    salary: '₹14,00,000 - ₹18,50,000',
    postedDate: '4 days ago',
    experience: '6+ Years',
    featured: true,
    description: 'Architect multi-tenant backend infrastructure capable of handling millions of daily CRM transactions with high availability.',
    responsibilities: [
      'Design distributed microservices, message queues, and real-time WebSocket pipelines.',
      'Optimize complex PostgreSQL database queries, indexing, and transactional partitioning.',
      'Implement enterprise SOC-2 security protocols, encryption at rest/transit, and role-based access control.',
      'Mentor junior engineers and champion CI/CD DevOps best practices.'
    ],
    requirements: [
      'Mastery of Go, Node.js, or Rust with deep PostgreSQL and Redis expertise.',
      'Experience scaling high-throughput distributed systems in AWS/GCP.',
      'Familiarity with Kubernetes, Docker, Terraform, and event-driven architectures (Kafka/NATS).',
      'Strong CS fundamentals in data structures, concurrency, and security.'
    ],
    skills: ['Go', 'Node.js', 'PostgreSQL', 'Redis', 'Kubernetes', 'AWS']
  },
  {
    id: 'customer-success-05',
    title: 'School ERP Customer Success Specialist',
    department: 'Customer Success',
    location: 'Hybrid (New York / Remote)',
    workType: 'Hybrid',
    employmentType: 'Full-Time',
    salary: '₹8,50,000 - ₹11,00,000',
    postedDate: '5 days ago',
    experience: '2+ Years',
    featured: false,
    description: 'Guide educational institutions through seamless Dezo School ERP onboarding, module configuration, and ongoing success.',
    responsibilities: [
      'Lead interactive onboarding workshops for campus administrators, teachers, and registrars.',
      'Configure student database structures, fee billing rules, and examination reporting modules.',
      'Monitor customer health scores and proactively prevent account churn.',
      'Gather feature requests to inform the Product roadmap.'
    ],
    requirements: [
      'Prior experience in EdTech customer success, account management, or SaaS training.',
      'Excellent presentation skills and empathy for non-technical users.',
      'Ability to troubleshoot configuration workflows calmly under pressure.',
      'Bachelor degree or equivalent practical experience.'
    ],
    skills: ['EdTech', 'Customer Success', 'Product Onboarding', 'SaaS Training']
  },
  {
    id: 'ai-research-06',
    title: 'AI Research Scientist (Agentic Intelligence)',
    department: 'Engineering & AI',
    location: 'Remote (US / EU)',
    workType: 'Remote',
    employmentType: 'Full-Time',
    salary: '₹15,00,000 - ₹20,00,000 + Stock Options',
    postedDate: 'Just now',
    experience: '3+ Years',
    featured: true,
    description: 'Pioneer novel autonomous agent architectures and domain-specific fine-tuning for predictive enterprise workflow execution.',
    responsibilities: [
      'Conduct original research on multi-agent collaboration, memory retrieval, and planning algorithms.',
      'Fine-tune open-weight models (Llama 3, Mistral) on structured business decision datasets.',
      'Publish research findings and translate benchmarks into production copilot features.',
      'Evaluate model safety, hallucination suppression, and alignment techniques.'
    ],
    requirements: [
      'PhD or Master degree in Computer Science, Machine Learning, or related quantitative field.',
      'Strong publication record or hands-on research experience in LLMs/RLHF.',
      'Deep fluency in PyTorch, Transformers, vLLM, and LoRA/QLoRA fine-tuning.',
      'Passionate about pushing agentic AI limits in commercial SaaS.'
    ],
    skills: ['PyTorch', 'Agentic AI', 'LLM Fine-Tuning', 'Transformers', 'Python']
  }
];

import { API_URL, apiFetch } from '../../config/api.config';

const API_JOBS = `${API_URL}/jobs`;


const renderIconByName = (name: string, className: string = 'w-5 h-5') => {
  switch (name) {
    case 'Globe': return <Globe className={className} />;
    case 'Brain': return <Brain className={className} />;
    case 'GraduationCap': return <GraduationCap className={className} />;
    case 'DollarSign': return <DollarSign className={className} />;
    case 'HeartPulse': return <HeartPulse className={className} />;
    case 'TrendingUp': return <TrendingUp className={className} />;
    case 'Laptop': return <Laptop className={className} />;
    case 'Palmtree': return <Palmtree className={className} />;
    case 'Code2': return <Code2 className={className} />;
    case 'Layers': return <Layers className={className} />;
    case 'Palette': return <Palette className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'Megaphone': return <Megaphone className={className} />;
    case 'Headphones': return <Headphones className={className} />;
    case 'Settings': return <Settings className={className} />;
    default: return <Sparkles className={className} />;
  }
};

export const CareersSection: React.FC = () => {
  const [cmsConfig, setCmsConfig] = useState<CareersCMSConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dezoryn_careers_cms');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return DEFAULT_CAREERS_CMS;
  });

  useEffect(() => {
    const handleCmsUpdate = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail) {
        setCmsConfig(detail);
      } else {
        const saved = localStorage.getItem('dezoryn_careers_cms');
        if (saved) {
          try { setCmsConfig(JSON.parse(saved)); } catch {}
        }
      }
    };

    window.addEventListener('dezoryn-careers-cms-update', handleCmsUpdate);
    return () => window.removeEventListener('dezoryn-careers-cms-update', handleCmsUpdate);
  }, []);

  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedWorkType, setSelectedWorkType] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedEmpType, setSelectedEmpType] = useState<string>('All');
  const [selectedExp, setSelectedExp] = useState<string>('All');
  const [minSalaryFilter, setMinSalaryFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('latest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  const toggleSaveJob = (id: string) => {
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((jId) => jId !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDept('All');
    setSelectedWorkType('All');
    setSelectedLocation('All');
    setSelectedEmpType('All');
    setSelectedExp('All');
    setMinSalaryFilter(0);
    setSortBy('latest');
  };

  // Selected Job for Modal Application
  const [activeJobModal, setActiveJobModal] = useState<JobOpening | null>(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState<boolean>(false);
  const [applicantForm, setApplicantForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    resumeUrl: '',
    coverLetter: ''
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await apiFetch(`${API_JOBS}?status=active`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const mapped: JobOpening[] = data.data.map((j: any) => ({
            id: j.id,
            title: j.title,
            department: j.department || 'Engineering & AI',
            location: j.location || 'Remote',
            workType: j.location?.toLowerCase().includes('remote') ? 'Remote' : j.location?.toLowerCase().includes('hybrid') ? 'Hybrid' : 'On-Site',
            employmentType: j.employmentType || 'Full-Time',
            salary: j.salary || 'Competitive',
            postedDate: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : 'Recently',
            experience: j.experience || 'Mid-Senior',
            description: j.description || '',
            responsibilities: Array.isArray(j.responsibilities) ? j.responsibilities : [],
            requirements: Array.isArray(j.requirements) ? j.requirements : [],
            skills: ['AI', 'CRM', 'TypeScript', 'SaaS'],
            closingDate: j.closingDate ? new Date(j.closingDate).toLocaleDateString() : undefined,
          }));
          setJobs(mapped);
        }
      } catch {
        setJobs(JOB_OPENINGS);
      }
    };


    fetchJobs();
    window.addEventListener('focus', fetchJobs);
    return () => window.removeEventListener('focus', fetchJobs);
  }, []);



  const departments = ['All', ...Array.from(new Set(['Engineering & AI', 'Product & Design', 'Sales & Marketing', 'Customer Success', ...jobs.map(j => j.department)]))];

  // Enhanced Filter & Sort Jobs Logic
  const filteredJobs = jobs
    .filter((job) => {
      const matchesDept = selectedDept === 'All' || job.department === selectedDept;
      const matchesLocation =
        selectedLocation === 'All' ||
        job.location.toLowerCase().includes(selectedLocation.toLowerCase());
      const matchesEmpType =
        selectedEmpType === 'All' ||
        job.employmentType.toLowerCase() === selectedEmpType.toLowerCase();
      const matchesExp =
        selectedExp === 'All' ||
        (selectedExp === 'Entry' && (job.experience.includes('1') || job.experience.includes('2'))) ||
        (selectedExp === 'Senior' && (job.experience.includes('4') || job.experience.includes('5') || job.experience.includes('Senior'))) ||
        (selectedExp === 'Lead' && (job.experience.includes('Lead') || job.experience.includes('Executive')));
      const matchesWorkType = selectedWorkType === 'All' || job.workType === selectedWorkType;

      const numericSal = parseInt(job.salary.replace(/[^0-9]/g, ''), 10) || 0;
      const matchesSalary = minSalaryFilter === 0 || numericSal >= minSalaryFilter;

      const matchesSearch =
        searchQuery === '' ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.skills && job.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase());

      return (
        matchesDept &&
        matchesLocation &&
        matchesEmpType &&
        matchesExp &&
        matchesWorkType &&
        matchesSalary &&
        matchesSearch
      );
    })
    .sort((a, b) => {
      if (sortBy === 'latest') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'salary') {
        const salA = parseInt(a.salary.replace(/[^0-9]/g, ''), 10) || 0;
        const salB = parseInt(b.salary.replace(/[^0-9]/g, ''), 10) || 0;
        return salB - salA;
      }
      return 0;
    });


  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplicationSubmitted(true);
    setTimeout(() => {
      setApplicationSubmitted(false);
      setActiveJobModal(null);
      setApplicantForm({ fullName: '', email: '', phone: '', linkedin: '', resumeUrl: '', coverLetter: '' });
    }, 2500);
  };

  return (
    <motion.div
      id="careers"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 sm:py-12 lg:py-20 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden transition-colors duration-300"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10 sm:space-y-16">

        {/* ---------------------------------------------------- */}
        {/* 1. PREMIUM ENTERPRISE HERO SECTION                  */}
        {/* ---------------------------------------------------- */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-10 sm:mb-16">
          
          {/* LEFT COLUMN: Mission & Headline */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Small Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 text-xs font-black uppercase tracking-wider shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <Briefcase className="w-3.5 h-3.5 text-cyan-500" />
              <span>{cmsConfig.hero.badgeText}</span>
            </motion.div>

            {/* Large Headline with Gradient Text */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]"
            >
              {cmsConfig.hero.headlinePrefix}{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                {cmsConfig.hero.gradientWords}
              </span>
            </motion.h1>

            {/* Paragraph explaining mission */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-2xl"
            >
              {cmsConfig.hero.description}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('open-positions');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-cyan-500/25 transition duration-300 flex items-center gap-2 cursor-pointer border-none"
              >
                <span>{cmsConfig.hero.viewPositionsBtnText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('life-at-dezoryn');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 text-slate-800 dark:text-slate-200 font-extrabold text-sm shadow-md transition duration-300 cursor-pointer"
              >
                {cmsConfig.hero.lifeAtDezorynBtnText}
              </button>
            </motion.div>

            {/* Animated Statistics Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-200 dark:border-slate-800/80"
            >
              {cmsConfig.hero.stats.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-cyan-200 bg-clip-text text-transparent">
                    <AnimatedStatCounter value={stat.target} suffix={stat.suffix} decimals={stat.decimals} />
                  </div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

          </div>

          {/* RIGHT COLUMN: 3D GLASSMOPHISIC ENTERPRISE & AI WORKFLOW SHOWCASE */}
          <div className="lg:col-span-5 relative min-h-[480px] flex items-center justify-center">
            
            {/* Ambient Multi-layer Radial Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/25 via-blue-600/20 to-purple-600/25 rounded-3xl blur-3xl pointer-events-none" />

            {/* Floating Subtle Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-10 left-12 w-2 h-2 rounded-full bg-cyan-400 blur-[1px]"
              />
              <motion.div
                animate={{ y: [0, 25, 0], opacity: [0.2, 0.7, 0.2] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute bottom-16 right-10 w-2.5 h-2.5 rounded-full bg-purple-400 blur-[1px]"
              />
              <motion.div
                animate={{ x: [0, 15, 0], opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute top-1/2 right-1/4 w-1.5 h-1.5 rounded-full bg-emerald-400 blur-[1px]"
              />
            </div>

            {/* CENTRAL GLOWING ENTERPRISE AI DASHBOARD CARD */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-full rounded-3xl bg-slate-950/90 border border-slate-800 p-6 sm:p-7 shadow-[0_20px_50px_rgba(3,7,18,0.7)] backdrop-blur-2xl space-y-5 text-left z-10"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                    DZ
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">DezoAI Engine v4.2</div>
                    <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Multi-Tenant Cluster Active
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-extrabold text-[10px]">
                  12ms Latency
                </span>
              </div>

              {/* AI WORKFLOW GRAPHIC (SVG Connection Nodes) */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden space-y-3">
                <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <span>LIVE AGENTIC PIPELINE</span>
                  <span className="text-cyan-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-400 animate-pulse" /> 14.8k ops/sec
                  </span>
                </div>

                {/* Workflow Nodes Grid */}
                <div className="grid grid-cols-3 gap-2 text-center relative z-10">
                  <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800 text-[10px] font-bold text-slate-300 space-y-1">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                      <Code2 className="w-3.5 h-3.5" />
                    </div>
                    <div>API Stream</div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/90 border border-cyan-500/40 text-[10px] font-extrabold text-cyan-300 space-y-1 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                      <Brain className="w-3.5 h-3.5" />
                    </div>
                    <div>LLM Copilot</div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800 text-[10px] font-bold text-slate-300 space-y-1">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>ERP Action</div>
                  </div>
                </div>

                {/* Animated Connection Lines */}
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                  />
                </div>
              </div>

              {/* Live Telemetry Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] font-extrabold text-slate-400">VECTOR EMBEDDINGS</div>
                  <div className="text-base font-black text-white mt-0.5">2.4M QPS</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] font-extrabold text-slate-400">ACCURACY SCORE</div>
                  <div className="text-base font-black text-emerald-400 mt-0.5">99.8% SLA</div>
                </div>
              </div>

            </motion.div>

            {/* FLOATING EMPLOYEE PROFILE CARD 1 (Top Left) */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -left-4 sm:-left-8 bg-slate-900/95 border border-cyan-500/40 p-3 rounded-2xl shadow-2xl backdrop-blur-xl z-20 flex items-center gap-3 text-left max-w-[210px]"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt="Anya Sharma"
                className="w-10 h-10 rounded-xl object-cover border border-cyan-400/50 shrink-0"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-black text-white truncate">Anya Sharma</div>
                <div className="text-[10px] text-cyan-400 font-bold truncate">Principal AI Architect</div>
                <div className="text-[9px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                  <span>San Francisco 🇺🇸</span>
                </div>
              </div>
            </motion.div>

            {/* FLOATING EMPLOYEE PROFILE CARD 2 (Bottom Right) */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              className="absolute -bottom-6 -right-4 sm:-right-6 bg-slate-900/95 border border-purple-500/40 p-3 rounded-2xl shadow-2xl backdrop-blur-xl z-20 flex items-center gap-3 text-left max-w-[220px]"
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                alt="David Chen"
                className="w-10 h-10 rounded-xl object-cover border border-purple-400/50 shrink-0"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-black text-white truncate">David Chen</div>
                <div className="text-[10px] text-purple-400 font-bold truncate">Lead Systems Engineer</div>
                <div className="text-[9px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                  <span>London 🇬🇧</span>
                </div>
              </div>
            </motion.div>

            {/* FLOATING DEPARTMENT BADGE (Top Right) */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              className="absolute top-12 -right-4 bg-slate-900/90 border border-slate-700/80 p-2.5 rounded-xl shadow-xl backdrop-blur-md z-20 flex items-center gap-2 text-xs font-bold text-slate-200"
            >
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5" />
              </div>
              <span>AI Frontier Labs</span>
            </motion.div>

          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* 2. WHY JOIN DEZORYN (8 PREMIUM GLASS CARDS GRID)     */}
        {/* ---------------------------------------------------- */}
        <section id="life-at-dezoryn" className="scroll-mt-24 space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-black uppercase tracking-wider">
              {cmsConfig.whyJoin.badgeText}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {cmsConfig.whyJoin.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {cmsConfig.whyJoin.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cmsConfig.whyJoin.benefits.map((benefit, idx) => {
              return (
                <motion.div
                  key={benefit.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="group relative p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 backdrop-blur-2xl shadow-lg hover:shadow-2xl transition-all duration-300 space-y-4 text-left overflow-hidden cursor-pointer"
                >
                  {/* Subtle Gradient Hover Border Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 transition-all duration-500 pointer-events-none" />

                  {/* Top Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${benefit.gradient} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      {renderIconByName(benefit.iconName)}
                    </div>

                    <span className="text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {benefit.badge}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium mt-1.5">
                      {benefit.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </section>

        {/* ---------------------------------------------------- */}
        {/* 3. MEET OUR TEAMS (8 INTERACTIVE TEAM CARDS GRID)   */}
        {/* ---------------------------------------------------- */}
        <section id="our-teams" className="scroll-mt-24 space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-cyan-400 text-xs font-black uppercase tracking-wider">
              {cmsConfig.teamsSection.badgeText}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {cmsConfig.teamsSection.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {cmsConfig.teamsSection.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cmsConfig.teamsSection.teams.map((team, idx) => {
              return (
                <motion.div
                  key={team.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  onClick={() => {
                    setSelectedDept(team.name === 'AI Research' ? 'Engineering & AI' : team.name === 'Design' ? 'Product & Design' : team.name);
                    const el = document.getElementById('open-positions');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`group relative p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 ${team.borderColor} backdrop-blur-2xl shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300 space-y-4 text-left overflow-hidden cursor-pointer`}
                >
                  {/* Background Hover Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${team.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`} />

                  {/* Icon & Openings Badge */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${team.gradient} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      {renderIconByName(team.iconName)}
                    </div>

                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      {team.openings} {team.openings === 1 ? 'Role' : 'Roles'} Open
                    </span>
                  </div>

                  {/* Team Title & Description */}
                  <div className="relative z-10 space-y-1.5">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                      {team.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {team.desc}
                    </p>
                  </div>

                  {/* Footer Meta: Team Size */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-extrabold relative z-10">
                    <span className="text-slate-400 text-[11px]">TEAM STRENGTH</span>
                    <span className={`${team.color}`}>{team.teamSize}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </section>

        {/* ---------------------------------------------------- */}
        {/* 4. LIFE AT DEZORYN (MODERN MASONRY GALLERY)         */}
        {/* ---------------------------------------------------- */}
        <section className="space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-wider">
              {cmsConfig.gallerySection.badgeText}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {cmsConfig.gallerySection.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {cmsConfig.gallerySection.subtitle}
            </p>
          </div>

          {/* Masonry Columns Layout */}
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
            {cmsConfig.gallerySection.items.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="group relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-xl cursor-pointer break-inside-avoid"
              >
                {/* Image with smooth hover scale */}
                <img
                  src={item.img}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Glass Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-left" />

                {/* Caption Box with Hover Translation Animation */}
                <div className="absolute inset-0 p-5 flex flex-col justify-end text-left pointer-events-none z-10">
                  <div className="translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 space-y-2">
                    
                    {/* Category Tag Pill */}
                    <span className="inline-block px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-black tracking-wider uppercase backdrop-blur-md">
                      {item.tag}
                    </span>

                    <h3 className="text-base font-black text-white leading-tight">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Permanent subtle tag pill when not hovering */}
                <div className="absolute top-3 left-3 group-hover:opacity-0 transition-opacity duration-300 z-10">
                  <span className="px-2.5 py-1 rounded-full bg-slate-950/70 border border-slate-800 text-slate-200 text-[10px] font-bold backdrop-blur-md">
                    {item.tag}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

        </section>

        {/* ---------------------------------------------------- */}
        {/* 5. STICKY UPGRADED SEARCH & FILTERS BAR             */}
        {/* ---------------------------------------------------- */}
        <div id="open-positions" className="sticky top-20 z-40 p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white border border-slate-200/90 dark:border-cyan-500/30 shadow-2xl backdrop-blur-2xl space-y-4">
          
          {/* ROW 1: SEARCH INPUT + SORT BY + RESET BUTTON */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search job title, skills, or keywords..."
                className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-all font-semibold"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort By Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
              >
                <option value="latest">Latest First</option>
                <option value="salary">Highest Salary</option>
                <option value="title">Title (A - Z)</option>
              </select>

              {/* Reset Filters Button */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>

          </div>

          {/* ROW 2: DEPARTMENT CHIP TABS */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">
              Department:
            </span>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDept === dept
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                    : 'bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* ROW 3: DETAILED DROPDOWNS & FILTER CONTROLS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
            
            {/* Location Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
              >
                <option value="All">All Locations</option>
                <option value="San Francisco">San Francisco 🇺🇸</option>
                <option value="London">London 🇬🇧</option>
                <option value="Bengaluru">Bengaluru 🇮🇳</option>
                <option value="Remote">Remote Only 🌐</option>
              </select>
            </div>

            {/* Employment Type Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Employment Type
              </label>
              <select
                value={selectedEmpType}
                onChange={(e) => setSelectedEmpType(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            {/* Experience Level Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Experience Level
              </label>
              <select
                value={selectedExp}
                onChange={(e) => setSelectedExp(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
              >
                <option value="All">All Levels</option>
                <option value="Entry">Entry (0-2 Yrs)</option>
                <option value="Mid">Mid-Level (2-5 Yrs)</option>
                <option value="Senior">Senior (5+ Yrs)</option>
              </select>
            </div>

            {/* Minimum Salary Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Minimum Pay
              </label>
              <select
                value={minSalaryFilter}
                onChange={(e) => setMinSalaryFilter(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
              >
                <option value={0}>Any Salary</option>
                <option value={1000000}>₹10,00,000+ / yr</option>
                <option value={1200000}>₹12,00,000+ / yr</option>
                <option value={1500000}>₹15,00,000+ / yr</option>
              </select>
            </div>

          </div>

          {/* ROW 4: RESULTS SUMMARY + REMOTE WORK TYPE PILLS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              Showing <strong className="text-cyan-600 dark:text-cyan-400 font-bold">{filteredJobs.length}</strong> open positions
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 dark:text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">
                Workplace:
              </span>
              {['All', 'Remote', 'Hybrid'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedWorkType(type)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                    selectedWorkType === type
                      ? 'bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ---------------------------------------------------- */}
        {/* 6. JOB OPENINGS LISTING GRID                        */}
        {/* ---------------------------------------------------- */}
        <div className="space-y-4 sm:space-y-5">
          {jobs.length === 0 ? (
            <div className="p-10 sm:p-16 text-center rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 space-y-4 shadow-xl relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 dark:text-cyan-400 flex items-center justify-center mx-auto shadow-lg">
                <Briefcase className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  No job openings till now
                </h4>
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
                  We currently have no active positions available. Please check back further for future hiring opportunities and team updates!
                </p>
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-8 sm:p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3 shadow-sm">
              <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No matching job openings found</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Try adjusting your search criteria or selecting a different department filter.</p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (

            filteredJobs.map((job) => {
              const isSaved = savedJobs.includes(job.id);
              const manager = job.hiringManager || {
                name: 'Sarah Jenkins',
                role: 'Hiring Team Lead',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'
              };

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className={`group relative p-6 sm:p-7 rounded-3xl backdrop-blur-2xl border transition-all duration-300 shadow-xl hover:shadow-[0_0_40px_rgba(6,182,212,0.18)] ${
                    job.featured
                      ? 'bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 dark:from-slate-900/90 dark:via-slate-900/90 dark:to-cyan-950/80 border-cyan-500/50 shadow-cyan-500/5'
                      : 'bg-white/90 dark:bg-slate-900/90 border-slate-200/90 dark:border-slate-800/90 hover:border-cyan-500/40'
                  }`}
                >
                  {/* Subtle Gradient Glow Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-cyan-500/5 group-hover:to-purple-500/5 rounded-3xl transition-opacity duration-500 pointer-events-none" />

                  {/* TOP BAR: BADGES, WORK TYPE, SAVED BOOKMARK ICON */}
                  <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
                    <div className="flex flex-wrap items-center gap-2">
                      
                      {/* Featured Role Tag */}
                      {job.featured && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center gap-1 shadow-md">
                          <Sparkles className="w-3 h-3 animate-spin" /> FEATURED ROLE
                        </span>
                      )}

                      {/* Department Badge */}
                      <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
                        {job.department}
                      </span>

                      {/* Remote / Hybrid Badge with Pulse Indicator */}
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        {job.workType}
                      </span>

                      {/* Employment Type */}
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {job.employmentType}
                      </span>
                    </div>

                    {/* Bookmark Save Job Icon Button */}
                    <button
                      type="button"
                      onClick={() => toggleSaveJob(job.id)}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                        isSaved
                          ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/30 scale-110'
                          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 border-slate-200 dark:border-slate-700/80'
                      }`}
                      title={isSaved ? 'Remove from Saved Jobs' : 'Save Job Opening'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {/* MIDDLE SECTION: TITLE & DESCRIPTION */}
                  <div className="my-4 space-y-2 relative z-10 text-left">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-3xl">
                      {job.description}
                    </p>
                  </div>

                  {/* METADATA STRIP: Location, Salary, Experience, Posted Date */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 text-xs font-bold relative z-10">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <MapPin className="w-4 h-4 text-cyan-500 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold">
                      <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="truncate">{job.salary}</span>
                    </div>

                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                      <Clock className="w-4 h-4 text-purple-500 shrink-0" />
                      <span className="truncate">{job.experience} exp</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">Posted {job.postedDate}</span>
                    </div>
                  </div>

                  {/* SKILLS CHIPS ROW */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 relative z-10">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">
                      Required Skills:
                    </span>
                    {job.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* BOTTOM FOOTER ROW: HIRING MANAGER & CTA BUTTONS */}
                  <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    
                    {/* Hiring Manager Card */}
                    <div className="flex items-center gap-3 text-left">
                      <img
                        src={manager.avatar}
                        alt={manager.name}
                        className="w-9 h-9 rounded-xl object-cover border border-cyan-500/40 shadow-xs shrink-0"
                      />
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                          {manager.name}
                          <UserCheck className="w-3 h-3 text-cyan-400" />
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                          {manager.role}
                        </div>
                      </div>
                    </div>

                    {/* CTA Action Buttons */}
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setActiveJobModal(job)}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-extrabold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveJobModal(job)}
                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 group-hover:scale-105 cursor-pointer"
                      >
                        Apply Now
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </motion.div>
              );
            })
          )}
        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* 5. JOB APPLICATION MODAL DIALOG                      */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {activeJobModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 backdrop-blur-xl bg-slate-950/70 font-['Plus_Jakarta_Sans',sans-serif]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl max-h-[92vh] rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 text-slate-900 dark:text-white shadow-2xl overflow-hidden flex flex-col relative"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50 dark:bg-slate-950/60">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30">
                    {activeJobModal.department}
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-1.5">
                    {activeJobModal.title}
                  </h3>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-600 dark:text-slate-400 mt-1 flex-wrap font-medium">
                    <span>{activeJobModal.location}</span>
                    <span>•</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{activeJobModal.salary}</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveJobModal(null)}
                  className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body Scroll */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                {applicationSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 sm:p-8 text-center space-y-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Application Submitted!</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                      Thank you for applying to Dezoryn Technologies! Our talent acquisition team will review your details and reach out within 2 business days.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {/* Role Responsibilities */}
                    <div className="space-y-2">
                      <h4 className="text-xs sm:text-sm font-extrabold text-cyan-800 dark:text-cyan-300 uppercase tracking-wider">What You Will Do</h4>
                      <ul className="space-y-1.5 pl-4 list-disc text-slate-700 dark:text-slate-300 font-medium">
                        {activeJobModal.responsibilities.map((resp, idx) => (
                          <li key={idx}>{resp}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-2">
                      <h4 className="text-xs sm:text-sm font-extrabold text-purple-800 dark:text-purple-300 uppercase tracking-wider">What We Are Looking For</h4>
                      <ul className="space-y-1.5 pl-4 list-disc text-slate-700 dark:text-slate-300 font-medium">
                        {activeJobModal.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Quick Application Form */}
                    <form onSubmit={handleApplicationSubmit} className="space-y-3.5 sm:space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Send className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Apply For This Role
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                          <input
                            type="text"
                            required
                            value={applicantForm.fullName}
                            onChange={(e) => setApplicantForm({ ...applicantForm, fullName: e.target.value })}
                            placeholder="Alex Mercer"
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                          <input
                            type="email"
                            required
                            value={applicantForm.email}
                            onChange={(e) => setApplicantForm({ ...applicantForm, email: e.target.value })}
                            placeholder="alex@example.com"
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">LinkedIn / Portfolio URL *</label>
                          <input
                            type="url"
                            required
                            value={applicantForm.linkedin}
                            onChange={(e) => setApplicantForm({ ...applicantForm, linkedin: e.target.value })}
                            placeholder="https://linkedin.com/in/alex"
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Resume Link (Drive/Dropbox/PDF) *</label>
                          <input
                            type="url"
                            required
                            value={applicantForm.resumeUrl}
                            onChange={(e) => setApplicantForm({ ...applicantForm, resumeUrl: e.target.value })}
                            placeholder="https://drive.google.com/your-resume.pdf"
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Cover Note / Why Dezoryn Technologies? (Optional)</label>
                        <textarea
                          rows={2}
                          value={applicantForm.coverLetter}
                          onChange={(e) => setApplicantForm({ ...applicantForm, coverLetter: e.target.value })}
                          placeholder="Briefly tell us why you'd be a great fit..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none resize-none transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                      >
                        Submit Job Application
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const CareersPage = CareersSection;
export default CareersSection;
