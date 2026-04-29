'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const services = [
  {
    icon: '🧠',
    title: 'AI/ML Integration',
    description: 'Custom AI solutions — chatbots, predictive analytics, LLM-powered workflows.',
    timeline: '4-8 weeks',
    price: 'From $10k',
    gradient: 'from-violet-500/20 to-purple-500/20',
    border: 'border-violet-500/20',
  },
  {
    icon: '⚡',
    title: 'Full-Stack Web Apps',
    description: 'Scalable web applications built with Next.js, React, and modern cloud infrastructure.',
    timeline: '6-12 weeks',
    price: 'From $15k',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/20',
  },
  {
    icon: '📱',
    title: 'Mobile Apps',
    description: 'Native and cross-platform mobile experiences with React Native and Flutter.',
    timeline: '8-16 weeks',
    price: 'From $20k',
    gradient: 'from-pink-500/20 to-rose-500/20',
    border: 'border-pink-500/20',
  },
  {
    icon: '🔗',
    title: 'API Development',
    description: 'Robust backend APIs, microservices, and third-party integrations.',
    timeline: '3-6 weeks',
    price: 'From $8k',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/20',
  },
  {
    icon: '☁️',
    title: 'Cloud & DevOps',
    description: 'Seamless migration and optimization on AWS, GCP, or Azure.',
    timeline: '2-4 weeks',
    price: 'From $5k',
    gradient: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/20',
  },
  {
    icon: '🎯',
    title: 'Technical Consulting',
    description: 'Architecture review, tech strategy, and CTO-as-a-service.',
    timeline: '1-2 weeks',
    price: 'From $3k',
    gradient: 'from-fuchsia-500/20 to-purple-500/20',
    border: 'border-fuchsia-500/20',
  },
];

const processSteps = [
  {
    step: '01',
    title: 'Submit Your Idea',
    description: 'Fill out our scoping form with your project vision, timeline, and budget.',
  },
  {
    step: '02',
    title: 'AI Generates PRD',
    description: 'Our AI analyzes your submission and generates a detailed Product Requirements Document.',
  },
  {
    step: '03',
    title: 'Review & Quote',
    description: 'We review the PRD, refine the scope, and send you a transparent quote.',
  },
  {
    step: '04',
    title: 'Build & Ship',
    description: 'We develop your product with weekly updates and deliver production-ready code.',
  },
];

const stats = [
  { value: '50+', label: 'Projects Delivered' },
  { value: '<24h', label: 'Quote Turnaround' },
  { value: '99%', label: 'Client Satisfaction' },
  { value: '4.9', label: 'Avg Rating' },
];

const prdQuestions = [
  {
    category: 'Target Users',
    questions: [
      {
        id: 'primary_user',
        question: 'Who is your primary user?',
        options: [
          { label: 'Consumers (B2C)', description: 'Individual users, general public' },
          { label: 'Businesses (B2B)', description: 'Companies, organizations' },
          { label: 'Developers', description: 'Technical users, API consumers' },
          { label: 'Internal Team', description: 'Your company employees' },
        ],
      },
      {
        id: 'user_pain_point',
        question: 'What is their biggest pain point?',
        options: [
          { label: 'Time-consuming manual work', description: 'Processes that take too long' },
          { label: 'Poor communication/collaboration', description: 'Teams struggling to work together' },
          { label: 'Data scattered across tools', description: 'Information silos' },
          { label: 'Expensive existing solutions', description: 'Current tools cost too much' },
          { label: 'Complex/hard to use tools', description: 'Existing solutions are unintuitive' },
        ],
      },
    ],
  },
  {
    category: 'Core Features',
    questions: [
      {
        id: 'primary_feature',
        question: 'What is the ONE core feature?',
        options: [
          { label: 'Dashboard/Analytics', description: 'Data visualization and insights' },
          { label: 'Marketplace/Transactions', description: 'Buying, selling, payments' },
          { label: 'Communication Tool', description: 'Chat, video, messaging' },
          { label: 'Content Management', description: 'Creating, organizing content' },
          { label: 'Automation/Workflow', description: 'Automating repetitive tasks' },
          { label: 'AI-Powered Tool', description: 'ML/AI-driven features' },
        ],
      },
      {
        id: 'secondary_features',
        question: 'What secondary features are needed?',
        options: [
          { label: 'User Authentication', description: 'Login, profiles, permissions' },
          { label: 'File Uploads', description: 'Images, documents, media' },
          { label: 'Notifications', description: 'Email, push, in-app alerts' },
          { label: 'Search & Filters', description: 'Finding content quickly' },
          { label: 'Reports/Exports', description: 'PDF, CSV, data exports' },
          { label: 'Third-party Integrations', description: 'Connect to other tools' },
        ],
        multiSelect: true,
      },
    ],
  },
  {
    category: 'Platform & Design',
    questions: [
      {
        id: 'platform',
        question: 'Which platform(s) do you need?',
        options: [
          { label: 'Web App', description: 'Desktop browser experience' },
          { label: 'Mobile App (iOS)', description: 'Native iOS application' },
          { label: 'Mobile App (Android)', description: 'Native Android application' },
          { label: 'Responsive Web', description: 'Works on all devices' },
        ],
        multiSelect: true,
      },
      {
        id: 'design_preference',
        question: 'What design vibe fits your brand?',
        options: [
          { label: 'Minimal & Clean', description: 'Simple, lots of white space' },
          { label: 'Bold & Colorful', description: 'Vibrant, energetic' },
          { label: 'Professional/Corporate', description: 'Trustworthy, established' },
          { label: 'Playful/Fun', description: 'Friendly, approachable' },
          { label: 'Dark/Tech', description: 'Modern, developer-focused' },
        ],
      },
    ],
  },
  {
    category: 'Technical Constraints',
    questions: [
      {
        id: 'timeline_urgency',
        question: 'How soon do you need this built?',
        options: [
          { label: 'ASAP (2-4 weeks)', description: 'Urgent MVP needed' },
          { label: '1-2 months', description: 'Standard timeline' },
          { label: '3-6 months', description: 'Flexible, can wait' },
          { label: 'No rush', description: 'Quality over speed' },
        ],
      },
      {
        id: 'existing_tools',
        question: 'Do you have existing accounts/credits?',
        options: [
          { label: 'Firebase', description: 'Google cloud platform' },
          { label: 'AWS', description: 'Amazon Web Services' },
          { label: 'Azure', description: 'Microsoft cloud' },
          { label: 'OpenAI API', description: 'AI/ML credits' },
          { label: 'None yet', description: 'Starting fresh' },
        ],
        multiSelect: true,
      },
    ],
  },
  {
    category: 'Success Metrics',
    questions: [
      {
        id: 'success_metric',
        question: 'What defines success for this project?',
        options: [
          { label: 'User Signups', description: 'Number of registered users' },
          { label: 'Revenue/Sales', description: 'Money generated' },
          { label: 'User Engagement', description: 'Daily/Monthly active users' },
          { label: 'Task Completion', description: 'Users achieving their goal' },
          { label: 'Investor Interest', description: 'Funding/demonstration' },
        ],
      },
      {
        id: 'target_users_count',
        question: 'How many users in the first 6 months?',
        options: [
          { label: '1-100 (Beta)', description: 'Small test group' },
          { label: '100-1,000', description: 'Early adopters' },
          { label: '1,000-10,000', description: 'Growing user base' },
          { label: '10,000+', description: 'Mass market' },
        ],
      },
    ],
  },
  {
    category: 'Scope Boundaries',
    questions: [
      {
        id: 'out_of_scope',
        question: 'What are you NOT building right now?',
        options: [
          { label: 'Payment Processing', description: 'No transactions yet' },
          { label: 'Social Features', description: 'No sharing/following' },
          { label: 'Mobile Apps', description: 'Web-only for now' },
          { label: 'AI/ML Features', description: 'Rules-based only' },
          { label: 'Admin Dashboard', description: 'No internal tools yet' },
        ],
        multiSelect: true,
      },
      {
        id: 'must_have_only',
        question: 'Should we focus on MVP only?',
        options: [
          { label: 'Yes, MVP only', description: 'Launch fast, iterate later' },
          { label: 'Balanced approach', description: 'Core features + polish' },
          { label: 'Full-featured', description: 'Complete solution at launch' },
        ],
      },
    ],
  },
];

interface Answers {
  [key: string]: string | string[];
}

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [formStep, setFormStep] = useState<'basic' | 'questionnaire'>('basic');
  const [answers, setAnswers] = useState<Answers>({});
  const [basicData, setBasicData] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      <Navbar />

      {/* ======================= HERO SECTION ======================= */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-20"
      >
        {/* Ambient background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[120px]" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />

        {/* Floating particles */}
        {mounted && (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 0.5, 0],
                  y: [`${Math.random() * 100}%`, `${Math.random() * 100 - 50}%`],
                }}
                transition={{
                  duration: Math.random() * 8 + 8,
                  repeat: Infinity,
                  repeatType: 'loop',
                  delay: Math.random() * 5,
                }}
                className="absolute w-1 h-1 bg-purple-400/40 rounded-full"
              />
            ))}
          </div>
        )}

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="text-center z-10 px-4 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-400 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Now accepting new projects for Q2 2026
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-8"
          >
            Build Software
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              at AI Speed
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Submit your idea, get an AI-generated PRD and quote in under 24 hours.
            From concept to production with a team that ships.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => document.getElementById('scoping-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-[1.02]"
            >
              <span className="relative z-10">Get Your Free Quote</span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            </button>
            <a
              href="#process"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-lg"
            >
              See how it works
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* ======================= STATS SECTION ======================= */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-500 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= SERVICES SECTION ======================= */}
      <section id="services" className="py-20 px-4 relative">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-purple-400 text-sm font-medium tracking-wider uppercase">Services</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
              What We Build
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              From MVP to enterprise scale — AI-powered development for every stage
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`group relative bg-white/[0.02] backdrop-blur-sm p-6 rounded-2xl border ${service.border} hover:bg-white/[0.05] transition-all duration-300 cursor-default`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <span className="text-3xl mb-4 block">{service.icon}</span>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 leading-relaxed">{service.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-purple-400 font-medium">{service.timeline}</span>
                    <span className="text-slate-500">{service.price}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= PROCESS SECTION ======================= */}
      <section id="process" className="py-20 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-purple-400 text-sm font-medium tracking-wider uppercase">Process</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
              How It Works
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              From idea to deployment in four simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="group relative bg-white/[0.02] rounded-2xl p-8 border border-white/5 hover:border-purple-500/20 transition-all duration-500"
              >
                <div className="flex items-start gap-4">
                  <span className="text-5xl font-bold text-white/5 group-hover:text-purple-500/20 transition-colors duration-500 font-mono">
                    {step.step}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= SCOPING FORM SECTION ======================= */}
      <section id="scoping-form" className="py-20 px-4 relative">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-pink-600/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <span className="text-purple-400 text-sm font-medium tracking-wider uppercase">Get Started</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
              {formStep === 'basic' ? 'Tell Us Your Idea' : 'Customize Your PRD'}
            </h2>
            <p className="text-slate-400 text-lg">
              {formStep === 'basic'
                ? 'Get a detailed AI-generated PRD and transparent quote within 24 hours'
                : 'Answer a few questions to help us understand your requirements'}
            </p>
          </motion.div>

          {/* Basic Info Form */}
          {formStep === 'basic' && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data: Record<string, string> = {};
                formData.forEach((value, key) => {
                  data[key] = String(value);
                });
                setBasicData(data);
                setFormStep('questionnaire');
              }}
              className="bg-white/[0.02] backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-white/10 space-y-6"
            >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name *</label>
                <input
                  name="name"
                  required
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                <input
                  name="email"
                  required
                  type="email"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Project Idea *</label>
              <textarea
                name="idea"
                required
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                placeholder="Describe your project in a few sentences..."
              />
              <p className="text-xs text-slate-600 mt-1">Max 500 characters</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Vertical *</label>
                <select
                  name="vertical"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900">Select...</option>
                  <option value="AI/ML" className="bg-slate-900">AI/ML</option>
                  <option value="Fintech" className="bg-slate-900">Fintech</option>
                  <option value="HealthTech" className="bg-slate-900">HealthTech</option>
                  <option value="Productivity" className="bg-slate-900">Productivity</option>
                  <option value="E-commerce" className="bg-slate-900">E-commerce</option>
                  <option value="Other" className="bg-slate-900">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Timeline *</label>
                <select
                  name="timeline"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900">Select...</option>
                  <option value="ASAP" className="bg-slate-900">ASAP</option>
                  <option value="1 month" className="bg-slate-900">1 month</option>
                  <option value="2-3 months" className="bg-slate-900">2-3 months</option>
                  <option value="Flexible" className="bg-slate-900">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Budget *</label>
                <select
                  name="budget_range"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900">Select...</option>
                  <option value="$2k-5k" className="bg-slate-900">$2k-5k</option>
                  <option value="$5k-10k" className="bg-slate-900">$5k-10k</option>
                  <option value="$10k-20k" className="bg-slate-900">$10k-20k</option>
                  <option value="$20k-50k" className="bg-slate-900">$20k-50k</option>
                  <option value="$50k+" className="bg-slate-900">$50k+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">How did you find us?</label>
              <input
                name="referral_source"
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                placeholder="LinkedIn, Google, friend referral..."
              />
            </div>

            <button
              type="submit"
              className="w-full relative group bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.01]"
            >
              Next: Answer Questions →
            </button>
          </motion.form>
          )}

          {/* Questionnaire Form */}
          {formStep === 'questionnaire' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.02] backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-white/10"
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Customizing your PRD</span>
                  <span className="text-sm text-slate-500">{Object.keys(answers).length} / {prdQuestions.flatMap(c => c.questions).length} answered</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300" style={{ width: `${(Object.keys(answers).length / prdQuestions.flatMap(c => c.questions).length) * 100}%` }} />
                </div>
              </div>

              {prdQuestions.map((category, catIndex) => (
                <div key={category.category} className="mb-8 last:mb-0">
                  <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4">{category.category}</h3>
                  <div className="space-y-6">
                    {category.questions.map((q) => {
                      const currentAnswer = answers[q.id];
                      return (
                        <div key={q.id}>
                          <label className="block text-white font-medium mb-3">{q.question}</label>
                          <div className="grid gap-3">
                            {q.options.map((opt) => {
                              const isSelected = Array.isArray(currentAnswer)
                                ? (currentAnswer as string[]).includes(opt.label)
                                : currentAnswer === opt.label;
                              return (
                                <button
                                  key={opt.label}
                                  type="button"
                                  onClick={() => {
                                    if (q.multiSelect) {
                                      const current = (answers[q.id] as string[]) || [];
                                      setAnswers({
                                        ...answers,
                                        [q.id]: current.includes(opt.label)
                                          ? current.filter(l => l !== opt.label)
                                          : [...current, opt.label],
                                      });
                                    } else {
                                      setAnswers({ ...answers, [q.id]: opt.label });
                                    }
                                  }}
                                  className={`text-left p-4 rounded-xl border transition-all ${
                                    isSelected
                                      ? 'bg-purple-500/10 border-purple-500/30'
                                      : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <div className="font-medium text-white mb-0.5">{opt.label}</div>
                                      <div className="text-sm text-slate-400">{opt.description}</div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                      isSelected ? 'border-purple-500 bg-purple-500' : 'border-slate-600'
                                    }`}>
                                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setFormStep('basic')}
                  className="px-6 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      // First submit basic data + questionnaire to scoping
                      const res = await fetch('/api/scoping/submit', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          ...basicData,
                          questionnaire_answers: answers,
                        }),
                      });

                      const result = await res.json();

                      if (res.ok) {
                        // Generate PRD with questionnaire data
                        const prdRes = await fetch('/api/scoping/generate-prd', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            submissionId: result.submissionId,
                            questionnaire_answers: answers,
                          }),
                        });

                        const prdResult = await prdRes.json();

                        if (prdResult.projectId) {
                          // Generate TRD in background
                          fetch('/api/admin/generate-trd', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ projectId: prdResult.projectId }),
                          });
                          router.push(`/dashboard/${prdResult.projectId}`);
                        } else {
                          router.push(`/success?id=${result.submissionId}`);
                        }
                      } else {
                        alert(result.error?.message || 'Something went wrong');
                      }
                    } catch (error) {
                      console.error(error);
                      alert('Failed to submit. Please try again.');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={Object.keys(answers).length < 6}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Generating PRD...' : 'Generate My PRD'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ======================= CTA SECTION ======================= */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-3xl p-12 md:p-16 border border-purple-500/10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Build Something Amazing?
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                Join 50+ companies who&apos;ve shipped faster with NexLabs. Your next product starts here.
              </p>
              <button
                onClick={() => document.getElementById('scoping-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-slate-900 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-slate-100 transition-all hover:shadow-2xl hover:shadow-white/10 hover:scale-[1.02]"
              >
                Start Your Project
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
