"use client";

import { X, Check } from "lucide-react";
import { motion } from "framer-motion";

export function ProblemSolution() {
  return (
    <section className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Stop wasting time on manual tweaks</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Applying to jobs shouldn't be a full-time job. See why thousands are switching to Resumr.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* The Old Way */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-slate-50 border border-slate-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-500">The Old Way</h3>
              <X className="w-6 h-6 text-slate-400" />
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-600">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>Hours tweaking Word documents for every application</span>
              </li>
              <li className="flex items-start gap-3 text-slate-600">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>Generic "To Whom It May Concern" cover letters</span>
              </li>
              <li className="flex items-start gap-3 text-slate-600">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>Lost track of which resume went to which company</span>
              </li>
              <li className="flex items-start gap-3 text-slate-600">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>Messy spreadsheets to track status</span>
              </li>
            </ul>
          </motion.div>

          {/* The Resumr Way */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-indigo-50 border border-indigo-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6 relative">
              <h3 className="text-xl font-bold text-indigo-900">The Resumr Way</h3>
              <div className="bg-indigo-600 text-white p-1 rounded-full">
                <Check className="w-4 h-4" />
              </div>
            </div>
            <ul className="space-y-4 relative">
              <li className="flex items-start gap-3 text-indigo-900 font-medium">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span>Tailor resume & cover letter in seconds with AI</span>
              </li>
              <li className="flex items-start gap-3 text-indigo-900 font-medium">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span>Personalized content based on job description</span>
              </li>
              <li className="flex items-start gap-3 text-indigo-900 font-medium">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span>Visual Kanban board to track applications</span>
              </li>
              <li className="flex items-start gap-3 text-indigo-900 font-medium">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span>One-click import from LinkedIn & Indeed</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
