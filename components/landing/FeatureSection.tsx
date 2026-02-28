"use client";

import { motion } from "framer-motion";
import { BrowserFrame } from "./BrowserFrame";
import { Sparkles, FileCheck, LayoutDashboard, ArrowRight, CheckCircle2 } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-50",
    title: "Tailor profile in seconds",
    description: "Our AI analyzes the job description and highlights your most relevant experience instantly. No more writer's block.",
    bullets: [
      "Context-aware AI rewriting",
      "Keyword optimization for ATS",
      "Tone matching (Professional, Creative, etc.)"
    ],
    image: "/screenshots/job-view.webp",
    imageAlt: "AI Job Analysis",
  },
  {
    icon: FileCheck,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-50",
    title: "Pass the bots. Impress humans.",
    description: "Generate perfectly formatted PDFs that pass Applicant Tracking Systems (ATS) and look great to hiring managers.",
    bullets: [
      "ATS-friendly templates",
      "Real-time scoring & feedback",
      "One-click PDF export"
    ],
    image: "/screenshots/resume.webp",
    imageAlt: "Professional Resume",
  },
  {
    icon: LayoutDashboard,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
    title: "Organize your job search",
    description: "Stop using spreadsheets. View every detail of your applications in a beautiful, centralized dashboard.",
    bullets: [
      "Visual Kanban pipeline",
      "Status tracking & reminders",
      "Centralized notes & documents"
    ],
    image: "/screenshots/applications.webp",
    imageAlt: "Application Kanban Board",
  },
];

export function FeatureSection() {
  return (
    <section id="features" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-32">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className={`flex flex-col gap-12 lg:gap-20 items-center ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              }`}
            >
              {/* Text Content */}
              <div className="flex-1 w-full lg:w-1/2">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.iconBg} mb-8`}>
                  <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>
                
                <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                  {feature.title}
                </h3>
                
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  {feature.description}
                </p>

                <ul className="space-y-4 mb-10">
                  {feature.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 ${feature.iconColor} flex-shrink-0 mt-0.5`} />
                      <span className="text-slate-700 font-medium">{bullet}</span>
                    </li>
                  ))}
                </ul>

                <button className={`group flex items-center gap-2 font-semibold ${feature.iconColor} hover:opacity-80 transition-opacity`}>
                  Learn more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Image Content */}
              <div className="flex-1 w-full lg:w-1/2">
                <div className={`relative rounded-2xl p-2 ${feature.iconBg.replace('50', '100/50')}`}>
                   {/* Decorative background blob */}
                   <div className={`absolute -inset-4 rounded-full blur-3xl opacity-20 ${feature.iconBg.replace('50', '300')}`} />
                   
                   <BrowserFrame 
                     image={feature.image} 
                     alt={feature.imageAlt}
                     className="relative shadow-2xl"
                   />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
