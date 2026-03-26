"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Everything you need to get started and land your first interviews.",
    badge: null,
    features: [
      { text: "3 Cover Letter Generations", included: true },
      { text: "3 Resume Generations", included: true },
      { text: "1 resume file in context at a time (delete to replace)", included: true },
      { text: "Job Tracking Board", included: true },
      { text: "Priority Support", included: false },
    ],
    footnote: "No credit card required.",
    buttonText: "Start for Free",
    buttonVariant: "outline" as const,
    href: "/login",
  },
  {
    name: "Pro",
    price: "4€",
    period: "week",
    description: "Unlimited applications, documents, and support — apply without limits.",
    popular: true,
    badge: "Most Popular",
    features: [
      { text: "Unlimited Cover Letters", included: true },
      { text: "Unlimited Resume Generations", included: true },
      { text: "Unlimited Resume Uploads", included: true },
      { text: "Job Tracking Board", included: true },
      { text: "Priority Support", included: true },
    ],
    footnote: "Credit card required. Cancel anytime.",
    buttonText: "Get Unlimited Access",
    buttonVariant: "primary" as const,
    href: "/login?callbackUrl=/dashboard/billing",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-white border-t border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="display-font text-4xl sm:text-5xl text-slate-900 leading-[1.06] mb-4">
            One free plan. One that removes every limit.
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Start tailoring for free — upgrade when you&apos;re ready to apply without limits.
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
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold bg-indigo-600 text-white shadow-md whitespace-nowrap">
                    {plan.badge}
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

              {plan.footnote && (
                <p className="mt-4 text-xs text-center text-slate-400">{plan.footnote}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
