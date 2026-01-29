"use client";

import { motion } from "framer-motion";
import { BrowserFrame } from "./BrowserFrame";
import { Sparkles, FileCheck, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-100",
    title: "Tailor your profile in seconds",
    description:
      "Our AI analyzes the job description and highlights your most relevant experience instantly.",
    image: "/screenshots/wellcome.png",
    imageAlt: "AI Generation Modal",
    imagePosition: "right" as const,
  },
  {
    icon: FileCheck,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-100",
    title: "ATS-Friendly, Human-Readable",
    description:
      "Generate perfectly formatted PDFs that pass the bots and impress hiring managers.",
    image: "/screenshots/resume.png",
    imageAlt: "Professional Resume",
    imagePosition: "left" as const,
  },
  {
    icon: BarChart3,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-100",
    title: "Never lose track of an opportunity",
    description:
      "Manage your job hunt like a sales pipeline. Track every application from 'Applied' to 'Offer'.",
    image: "/screenshots/dashboard.png",
    imageAlt: "Application Tracker",
    imagePosition: "right" as const,
  },
];

export function FeatureSection() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Everything you need to land your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-500">
              dream job
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Stop wasting hours customizing applications. Let AI do the heavy
            lifting while you focus on preparing for interviews.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="space-y-32">
          {features.map((feature, index) => (
            <FeatureItem
              key={feature.title}
              feature={feature}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureItem({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const Icon = feature.icon;
  const isImageRight = feature.imagePosition === "right";

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
        !isImageRight ? "lg:flex-row-reverse" : ""
      }`}
    >
      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0, x: isImageRight ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`${!isImageRight ? "lg:col-start-2" : ""}`}
      >
        {/* Icon */}
        <div
          className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.iconBg} mb-6`}
        >
          <Icon className={`w-7 h-7 ${feature.iconColor}`} />
        </div>

        {/* Title */}
        <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-lg text-slate-600 leading-relaxed mb-6">
          {feature.description}
        </p>

        {/* Optional: Key Points */}
        <div className="flex items-start gap-3 text-slate-700">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              index % 2 === 0 ? "bg-indigo-600" : "bg-teal-600"
            } mt-2`}
          />
          <p className="text-sm">
            {index === 0 &&
              "Powered by advanced AI that understands context and relevance"}
            {index === 1 &&
              "Export to PDF with professional templates that recruiters love"}
            {index === 2 &&
              "Visual pipeline with status tracking, notes, and reminders"}
          </p>
        </div>
      </motion.div>

      {/* Image */}
      <motion.div
        initial={{ opacity: 0, x: isImageRight ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className={`${!isImageRight ? "lg:col-start-1 lg:row-start-1" : ""}`}
      >
        <BrowserFrame image={feature.image} alt={feature.imageAlt} />
      </motion.div>
    </div>
  );
}
