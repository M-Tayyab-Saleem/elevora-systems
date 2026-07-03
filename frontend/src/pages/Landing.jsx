import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  LayoutDashboard, 
  Users, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Code,
  Layers,
  Database,
  Lock,
  CheckCircle2,
  Github
} from 'lucide-react';

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* 
        Background Effects 
        Subtle glowing orbs to give a modern Vercel/Linear vibe.
      */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(79,70,229,0.5)]">
              E
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Elevora</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <button 
              onClick={() => navigate('/auth/login')}
              className="text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-full transition-all"
            >
              Log in
            </button>
            <button 
              onClick={() => navigate('/auth/login')}
              className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-full transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hidden sm:block"
            >
              Interactive Demo
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        {/* HERO SECTION */}
        <section className="relative max-w-7xl mx-auto px-6 pt-10 pb-24 text-center">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-8">
              <Zap className="w-3 h-3" />
              <span>Portfolio Release 1.0</span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight max-w-4xl">
              Elevate your enterprise <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                management workflow.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
              A comprehensive HRMS and internal tooling platform built to showcase modern React architecture, scalable state management, and premium UI/UX design.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button 
                onClick={() => navigate('/auth/login')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-500 transition-all shadow-[0_0_30px_rgba(79,70,229,0.4)] group"
              >
                Launch Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                href="#architecture"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 text-white border border-white/10 px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all"
              >
                View Architecture
              </a>
            </motion.div>
          </motion.div>

          {/* Abstract Dashboard Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="mt-20 relative mx-auto max-w-5xl"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent z-10" />
            <div className="rounded-xl border border-white/10 bg-[#151B2B] shadow-2xl overflow-hidden p-2">
              <div className="rounded-lg border border-white/5 bg-[#0B0F19] w-full h-[300px] md:h-[500px] flex">
                {/* Mock Sidebar */}
                <div className="hidden md:flex w-64 border-r border-white/5 p-4 flex-col gap-4">
                  <div className="w-32 h-6 bg-white/10 rounded mb-4" />
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3 opacity-50">
                      <div className="w-5 h-5 bg-white/20 rounded" />
                      <div className="w-24 h-4 bg-white/10 rounded" />
                    </div>
                  ))}
                </div>
                {/* Mock Content */}
                <div className="flex-1 p-6 flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <div className="w-48 h-8 bg-white/10 rounded" />
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-full" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col justify-between">
                        <div className="w-10 h-10 bg-white/10 rounded-lg" />
                        <div className="w-20 h-4 bg-white/10 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 bg-white/5 rounded-xl border border-white/5 p-4" />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="border-y border-white/5 bg-white/[0.02] py-10">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-6">Designed for Modern Enterprises</p>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-50 grayscale">
              <div className="flex items-center gap-2"><Layers className="w-6 h-6"/> <span className="text-xl font-bold">Acme Corp</span></div>
              <div className="flex items-center gap-2"><Database className="w-6 h-6"/> <span className="text-xl font-bold">Nexus Data</span></div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-6 h-6"/> <span className="text-xl font-bold">SecureNet</span></div>
              <div className="flex items-center gap-2"><Zap className="w-6 h-6"/> <span className="text-xl font-bold">Velocity</span></div>
            </div>
          </div>
        </section>

        {/* FEATURES (Bento Grid) */}
        <section className="py-32 max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Everything you need to manage.</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Elevora provides a cohesive suite of tools that replace disjointed internal systems with a single, elegant platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-colors" />
              <Users className="w-10 h-10 text-indigo-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">People & Directory</h3>
              <p className="text-slate-400 mb-8 max-w-md">
                Complete employee lifecycle management. View org charts, manage onboarding, and access secure documentation in one place.
              </p>
              <div className="h-40 rounded-xl bg-[#0B0F19] border border-white/5 p-4 flex gap-4 overflow-hidden mask-image-fade">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="min-w-[150px] bg-white/5 rounded-lg p-3 flex flex-col gap-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20" />
                    <div className="w-20 h-3 bg-white/20 rounded mt-2" />
                    <div className="w-12 h-2 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Small Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full group-hover:bg-cyan-500/20 transition-colors" />
              <Clock className="w-10 h-10 text-cyan-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">Time Tracking</h3>
              <p className="text-slate-400">
                Automated attendance, timesheets, and absentee tracking with real-time reporting capabilities.
              </p>
            </motion.div>

            {/* Small Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full group-hover:bg-purple-500/20 transition-colors" />
              <LayoutDashboard className="w-10 h-10 text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">Project Kanban</h3>
              <p className="text-slate-400">
                Visual task management, assignable tickets, and drag-and-drop workflows for engineering teams.
              </p>
            </motion.div>

            {/* Large Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 transition-colors" />
              <ShieldCheck className="w-10 h-10 text-emerald-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">Role-Based Access</h3>
              <p className="text-slate-400 max-w-md">
                Enterprise-grade security matrix. Distinct portals and permissions for Super Admins, Managers, HR, and standard Employees.
              </p>
            </motion.div>
          </div>
        </section>

        {/* WORKFLOW */}
        <section className="py-20 border-y border-white/5 bg-[#0D121F]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">How it works</h2>
              <p className="text-slate-400">A streamlined experience from login to execution.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              
              <div className="relative text-center z-10">
                <div className="w-24 h-24 mx-auto bg-[#0B0F19] border border-indigo-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                  <Lock className="w-10 h-10 text-indigo-400" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">1. Authenticate</h4>
                <p className="text-slate-400 text-sm">Secure login with automatic role detection and personalized portal routing.</p>
              </div>

              <div className="relative text-center z-10">
                <div className="w-24 h-24 mx-auto bg-[#0B0F19] border border-cyan-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <LayoutDashboard className="w-10 h-10 text-cyan-400" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">2. Navigate</h4>
                <p className="text-slate-400 text-sm">Access your assigned tools, from HR approvals to personal timesheets.</p>
              </div>

              <div className="relative text-center z-10">
                <div className="w-24 h-24 mx-auto bg-[#0B0F19] border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">3. Execute</h4>
                <p className="text-slate-400 text-sm">Complete tasks, approve expenses, and collaborate with your team.</p>
              </div>
            </div>
          </div>
        </section>

        {/* WHY THIS PROJECT (ARCHITECTURE) */}
        <section id="architecture" className="py-32 max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Built for scale. Designed for humans.</h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                This project was engineered to demonstrate architectural best practices. It features a decoupled MERN stack, robust global state management, and a highly polished UI layer.
              </p>
              <ul className="space-y-4">
                {[
                  "React 19 & Vite for lightning-fast frontend performance.",
                  "Redux Toolkit & Persist for complex, reliable state synchronization.",
                  "Node.js & Express REST API with rigorous security middleware.",
                  "MongoDB & Mongoose for flexible, scalable data storage."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent pointer-events-none" />
                <Code className="w-12 h-12 text-indigo-400 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Clean Architecture</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  The codebase enforces strict separation of concerns. UI components are stateless where possible, custom hooks manage business logic, and API calls are abstracted into scalable service layers.
                </p>
                <div className="bg-[#0B0F19] rounded-lg p-4 font-mono text-xs text-indigo-300 border border-white/5">
                  <div>// Frontend Stack</div>
                  <div className="text-cyan-400">import &#123; useSelector, useDispatch &#125; from 'react-redux';</div>
                  <div className="text-purple-400">import &#123; motion &#125; from 'framer-motion';</div>
                  <br/>
                  <div>// Backend Stack</div>
                  <div className="text-emerald-400">const express = require('express');</div>
                  <div className="text-amber-400">const mongoose = require('mongoose');</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 max-w-5xl mx-auto px-6 text-center">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">Ready to explore?</h2>
            <p className="text-indigo-100 text-lg mb-10 max-w-xl mx-auto relative z-10">
              Access the interactive demo environment immediately. No sign-up required, just select a role and dive in.
            </p>
            <button 
              onClick={() => navigate('/auth/login')}
              className="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-100 hover:scale-105 transition-all shadow-xl relative z-10"
            >
              Start Interactive Demo
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 text-center bg-[#0B0F19]">
        <div className="flex items-center justify-center gap-2 mb-6 opacity-50">
          <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-[#0B0F19] font-bold text-xs">E</div>
          <span className="text-lg font-bold tracking-tight text-white">Elevora</span>
        </div>
        <p className="text-slate-500 text-sm mb-2">© 2026 Elevora Systems Portfolio Project. Open source.</p>
        <p className="text-slate-600 text-xs">This is a showcase application. All data is fictional.</p>
      </footer>
    </div>
  );
};

export default Landing;
