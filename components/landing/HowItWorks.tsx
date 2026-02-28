"use client";

import { motion } from "framer-motion";
import { Import, Wand2, Send, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Import,
    title: "Import Job",
    description: "Paste a URL from LinkedIn, Indeed, or Glassdoor. We extract the key details automatically.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Wand2,
    title: "Tailor with AI",
    description: "Our AI rewrites your resume and cover letter to match the job description perfectly.",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: Send,
    title: "Apply & Track",
    description: "Download your optimized PDF, apply with confidence, and track status on your dashboard.",
    color: "bg-teal-50 text-teal-600",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">How it works</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            From generic to hired in 3 steps
          </p>
        </div>

        <div className="relative grid md:grid-cols-3 gap-12">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-200" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className={`w-24 h-24 rounded-2xl ${step.color} flex items-center justify-center mb-8 relative z-10 shadow-sm border border-white/50`}>
                <step.icon className="w-10 h-10" />
                <div className="absolute -bottom-3 px-3 py-1 bg-white rounded-full border border-slate-100 text-sm font-bold shadow-sm">
                  {index + 1}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed max-w-xs">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
