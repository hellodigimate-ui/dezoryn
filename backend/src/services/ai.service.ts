import fs from 'fs';
import path from 'path';
import { BadRequestError } from '../errors/app-error';

export interface AISettings {
  chatbotName: string;
  tone: string; // Enterprise, Persuasive, Technical, Creative, Minimalist
  systemPrompt: string;
  apiKey?: string;
  model: string; // gpt-4o-mini, gpt-4o, gpt-3.5-turbo
  temperature: number;
}

export interface AIGenerateInput {
  type: 'hero' | 'product' | 'faq' | 'testimonial' | 'seo' | 'cta';
  topic?: string;
  tone?: string;
  context?: string;
  customPrompt?: string;
}

const SETTINGS_FILE = path.join(process.cwd(), 'ai-settings.json');

const DEFAULT_SETTINGS: AISettings = {
  chatbotName: 'Dezo AI Copilot',
  tone: 'Enterprise & Persuasive',
  systemPrompt: 'You are an elite enterprise B2B SaaS copywriter and brand marketing AI assistant for Dezoryn Technologies. Produce sleek, high-converting, professional marketing copy.',
  model: 'gpt-4o-mini',
  temperature: 0.7,
};

let currentAISettings: AISettings = { ...DEFAULT_SETTINGS };

// Load settings from disk if available
try {
  if (fs.existsSync(SETTINGS_FILE)) {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    currentAISettings = { ...DEFAULT_SETTINGS, ...parsed };
  }
} catch {
  // Use default settings on error
}

export class AIService {
  public static getSettings(): AISettings {
    return {
      ...currentAISettings,
      // Hide full API key in response for security
      apiKey: currentAISettings.apiKey ? '••••••••' + currentAISettings.apiKey.slice(-4) : '',
    };
  }

  public static updateSettings(input: Partial<AISettings>): AISettings {
    if (input.chatbotName !== undefined) currentAISettings.chatbotName = input.chatbotName.trim() || 'Dezo AI Copilot';
    if (input.tone !== undefined) currentAISettings.tone = input.tone;
    if (input.systemPrompt !== undefined) currentAISettings.systemPrompt = input.systemPrompt;
    if (input.model !== undefined) currentAISettings.model = input.model;
    if (input.temperature !== undefined) currentAISettings.temperature = Math.max(0, Math.min(1, input.temperature));
    
    // Only update API key if provided and not masked
    if (input.apiKey && !input.apiKey.startsWith('••••')) {
      currentAISettings.apiKey = input.apiKey.trim();
    }

    try {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(currentAISettings, null, 2), 'utf-8');
    } catch {
      // ignore disk write error
    }

    return this.getSettings();
  }

  public static async generateContent(input: AIGenerateInput) {
    const apiKey = currentAISettings.apiKey || process.env.OPENAI_API_KEY;
    const tone = input.tone || currentAISettings.tone;
    const topic = input.topic || 'Enterprise Operating Suite';

    if (apiKey && apiKey.startsWith('sk-')) {
      try {
        return await this.callOpenAI(input, apiKey, tone);
      } catch (err: any) {
        console.warn('⚠️ OpenAI API call failed, falling back to smart offline generator:', err?.message || err);
      }
    }

    // Smart Offline Generation Fallback
    return this.generateOfflineFallback(input, topic, tone);
  }

  private static async callOpenAI(input: AIGenerateInput, apiKey: string, tone: string) {
    const prompt = this.buildPrompt(input, tone);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: currentAISettings.model || 'gpt-4o-mini',
        temperature: currentAISettings.temperature || 0.7,
        messages: [
          {
            role: 'system',
            content: `${currentAISettings.systemPrompt}\nOutput MUST be valid strict JSON string without markdown codeblocks or quotes around JSON.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errData: any = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `OpenAI returned status ${response.status}`);
    }

    const data: any = await response.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim() || '';

    // Sanitize json formatting if returned in markdown fences
    const cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  }

  private static buildPrompt(input: AIGenerateInput, tone: string): string {
    const topic = input.topic || 'Enterprise Software Solution';
    const ctx = input.context ? `Context: ${input.context}` : '';
    const custom = input.customPrompt ? `Additional Instructions: ${input.customPrompt}` : '';

    switch (input.type) {
      case 'hero':
        return `Generate a Hero Section copy for "${topic}" in "${tone}" tone. ${ctx} ${custom}
Return ONLY JSON with keys:
{
  "badgeText": "Short uppercase badge",
  "mainHeading": "Compelling main title line",
  "gradientHeading": "Highlighted secondary gradient phrase",
  "description": "2-3 sentence impactful subtitle",
  "primaryBtnText": "Primary Call to action button label",
  "secondaryBtnText": "Secondary button label"
}`;

      case 'product':
        return `Generate Product description copy for "${topic}" in "${tone}" tone. ${ctx} ${custom}
Return ONLY JSON with keys:
{
  "title": "Product Title",
  "subtitle": "Catchy 1-line value proposition",
  "description": "Comprehensive product overview paragraph",
  "features": ["Key Feature 1", "Key Feature 2", "Key Feature 3", "Key Feature 4"]
}`;

      case 'faq':
        return `Generate 3 FAQ pairs about "${topic}" in "${tone}" tone. ${ctx} ${custom}
Return ONLY JSON array with items:
[
  { "question": "Clear user question", "answer": "Informative direct answer", "category": "General" }
]`;

      case 'testimonial':
        return `Generate realistic client testimonial for "${topic}" in "${tone}" tone. ${ctx} ${custom}
Return ONLY JSON with keys:
{
  "name": "Full Name",
  "designation": "Job Title (e.g. Chief Technology Officer)",
  "company": "Company Name",
  "review": "2-3 sentence enthusiastic review of results achieved",
  "rating": 5
}`;

      case 'seo':
        return `Generate SEO Meta Tags for page about "${topic}" in "${tone}" tone. ${ctx} ${custom}
Return ONLY JSON with keys:
{
  "metaTitle": "SEO Page Title (50-60 chars)",
  "metaDescription": "Compelling meta description with target keywords (140-160 chars)",
  "keywords": "comma, separated, seo, keywords"
}`;

      case 'cta':
        return `Generate high-converting Call to Action copy for "${topic}" in "${tone}" tone. ${ctx} ${custom}
Return ONLY JSON with keys:
{
  "bannerHeadline": "Urgent attention-grabbing headline",
  "subtext": "Persuasive risk-free supporting text",
  "primaryBtnText": "High action button label",
  "secondaryBtnText": "Alternative CTA label"
}`;

      default:
        throw new BadRequestError('Invalid generation type');
    }
  }

  private static generateOfflineFallback(input: AIGenerateInput, topic: string, tone: string) {
    const t = topic.trim() || 'Dezoryn Platform';

    switch (input.type) {
      case 'hero':
        return {
          badgeText: `NEXT-GEN ${t.toUpperCase()} SUITE`,
          mainHeading: `Autonomous Operations for ${t}`,
          gradientHeading: 'Unmatched Speed & Scale',
          description: `Empower your organization with ${t}. Simplify complex workflows, eliminate manual friction, and accelerate enterprise growth with automated intelligence.`,
          primaryBtnText: `Explore ${t}`,
          secondaryBtnText: 'Schedule Live Demo',
        };

      case 'product':
        return {
          title: `${t} Enterprise Hub`,
          subtitle: `Integrated operational workspace engineered for modern growth.`,
          description: `The ${t} platform combines end-to-end automation, real-time analytics, and role-based operational control into a single unified dashboard built for modern teams.`,
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
            question: `How does ${t} integrate with our current tech stack?`,
            answer: `${t} features out-of-the-box REST APIs and pre-built connectors for major ERP, CRM, and cloud storage providers, enabling deployment in under 24 hours.`,
            category: 'Integration',
          },
          {
            question: `Is ${t} secure and compliant with enterprise standards?`,
            answer: `Yes. We enforce end-to-end TLS 1.3 encryption, SOC-2 Type II audit standards, granular role-based access control (RBAC), and automated daily snapshot backups.`,
            category: 'Security',
          },
          {
            question: `Can we customize ${t} for our specific team requirements?`,
            answer: `Absolutely. ${t} includes a modular design system, customizable field schemas, custom workflows, and white-label branding controls.`,
            category: 'Customization',
          },
        ];

      case 'testimonial':
        return {
          name: 'Marcus Vance',
          designation: 'VP of Global Operations',
          company: 'Nexus Global Logistics',
          review: `Implementing ${t} transformed our operational productivity within 30 days. We reduced workflow processing time by 64% while maintaining 100% data accuracy across global hubs.`,
          rating: 5,
        };

      case 'seo':
        return {
          metaTitle: `${t} | Next-Gen Enterprise Operating Suite`,
          metaDescription: `Discover how ${t} powers autonomous enterprise operations, workflow automation, and real-time business intelligence for modern organizations.`,
          keywords: `${t}, enterprise software, workflow automation, operational AI, SaaS platform`,
        };

      case 'cta':
        return {
          bannerHeadline: `Ready to Transform Enterprise Productivity with ${t}?`,
          subtext: 'Join over 500+ industry leaders operating faster with Dezoryn. No credit card required.',
          primaryBtnText: 'Start 14-Day Free Trial',
          secondaryBtnText: 'Talk to Solution Architect',
        };

      default:
        throw new BadRequestError('Invalid generation type');
    }
  }
}
