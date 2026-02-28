"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for testing the waters and creating your first applications.",
    features: [
      { text: "3 Cover Letter Generations", included: true },
      { text: "3 Resume Generations", included: true },
      { text: "1 Document Upload (RAG)", included: true },
      { text: "Job Tracking Board", included: true },
      { text: "Priority Support", included: false },
    ],
    buttonText: "Start for Free",
    buttonVariant: "outline" as const,
    href: "/login",
  },
  {
    name: "Pro",
    price: "4€",
    period: "per week",
    description: "Unlock unlimited power to apply to as many jobs as you want.",
    popular: true,
    features: [
      { text: "Unlimited Cover Letters", included: true },
      { text: "Unlimited Resume Generations", included: true },
      { text: "Unlimited Document Uploads", included: true },
      { text: "Job Tracking Board", included: true },
      { text: "Priority Support", included: true },
    ],
    buttonText: "Get Unlimited Access",
    buttonVariant: "primary" as const,
    href: "/login",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Pricing</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Simple, transparent pricing
          </p>
          <p className="mt-4 text-xl text-slate-600">
            Start for free, upgrade when you need more power.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 rounded-2xl ${
                plan.popular
                  ? "bg-white ring-2 ring-indigo-600 shadow-2xl scale-105 z-10"
                  : "bg-white border border-slate-200 shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 md:translate-x-0 md:right-8">
                  <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold bg-indigo-600 text-white shadow-md">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500 font-medium">/{plan.period}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <div className={`p-0.5 rounded-full flex items-center justify-center ${plan.popular ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-600"}`}>
                        <Check className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className="p-0.5 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </div>
                    )}
                    <span className={`text-sm ${feature.included ? "text-slate-700 font-medium" : "text-slate-400"}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  plan.buttonVariant === "primary"
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {plan.buttonText}
                {plan.buttonVariant === "primary" && <ArrowRight className="ml-2 w-4 h-4" />}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
