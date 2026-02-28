"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative py-32 bg-indigo-900 overflow-hidden isolate">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-800 via-indigo-900 to-slate-900" />
      
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-3xl mix-blend-screen" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-3xl mix-blend-screen" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-8">
            Ready to land your dream job?
          </h2>
          <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of job seekers who are already using AI to stand out from the competition. Stop stressing, start interviewing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-indigo-600 bg-white rounded-xl shadow-2xl hover:bg-indigo-50 transition-all duration-200 hover:scale-105"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            
            <Link
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border border-white/20 rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              See how it works
            </Link>
          </div>

          <p className="mt-8 text-sm font-medium text-indigo-300/80">
            No credit card required • Free trial available • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
