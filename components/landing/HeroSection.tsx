"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import SplineWrapper from "./SplineWrapper";

// Placeholder Spline scene - replace with your own exported scene URL
const SPLINE_SCENE_URL = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";
// Full-width flowing ribbon background
const SPLINE_BACKGROUND_URL = "https://prod.spline.design/tcvbvwJIqt7pvN68/scene.splinecode";

export function HeroSection() {
  return (
    <section className="relative min-h-screen pt-20 overflow-hidden bg-slate-50 flex items-center">
      {/* Full-width Spline background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <SplineWrapper
          scene={SPLINE_BACKGROUND_URL}
          className="w-full h-full"
        />
      </div>
      {/* Frosted glass overlay - diffuses Spline for better text readability */}
      <div 
        className="absolute inset-0 z-[0.5] pointer-events-none backdrop-blur-3xl"
        aria-hidden
      />
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-[1]">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob" />
        <div className="absolute top-40 right-40 w-[400px] h-[400px] bg-sky-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-20 w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column: Text Content */}
        <div className="text-left z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              New: AI-Powered Cover Letters
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Tailor your resume to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-500">every job</span> in seconds.
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-lg leading-relaxed">
              Stop sending generic applications. Our AI analyzes job descriptions and optimizes your resume to get you hired faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold text-lg shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200 group"
              >
                Get Started for Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-slate-700 border border-slate-200 font-semibold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                See how it works
              </Link>
            </div>

            {/* Social Proof */}
            <div className="pt-8 border-t border-slate-200">
              <p className="text-sm text-slate-500 font-medium mb-4">Trusted by job seekers at</p>
              <div className="flex flex-wrap gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Placeholders for logos - replace with actual SVGs later */}
                <div className="h-8 flex items-center font-bold text-slate-400 text-xl">Google</div>
                <div className="h-8 flex items-center font-bold text-slate-400 text-xl">Amazon</div>
                <div className="h-8 flex items-center font-bold text-slate-400 text-xl">Microsoft</div>
                <div className="h-8 flex items-center font-bold text-slate-400 text-xl">Spotify</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Spline 3D Scene */}
        <div className="relative h-[600px] w-full hidden lg:block">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full h-full"
          >
             <SplineWrapper 
               scene={SPLINE_SCENE_URL} 
               className="w-full h-full"
               fallbackImage="/screenshots/dashboard.webp"
               fallbackAlt="Resumr Dashboard"
             />
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </section>
  );
}
