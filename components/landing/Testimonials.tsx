"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    content: "I was applying to 10 jobs a day with no response. With Resumr, I tailored my resume for a Senior Product Manager role and got an interview the next day.",
    author: "Sarah J.",
    role: "Product Manager at TechFlow",
    avatar: "S",
    color: "bg-indigo-100 text-indigo-700"
  },
  {
    content: "The AI suggestions are actually good. It doesn't just stuff keywords; it rewrites my bullets to sound more impactful. Totally worth it.",
    author: "Michael Chen",
    role: "Software Engineer",
    avatar: "M",
    color: "bg-teal-100 text-teal-700"
  },
  {
    content: "Finally, a way to organize my job search that isn't a spreadsheet. The Kanban board is a lifesaver.",
    author: "Jessica R.",
    role: "Marketing Director",
    avatar: "J",
    color: "bg-purple-100 text-purple-700"
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
            Don't take our word for it
          </h2>
          <p className="text-xl text-slate-600">
            Join thousands of professionals who landed their dream jobs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-slate-50 border border-slate-100 relative group hover:shadow-lg transition-shadow duration-300"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-slate-200 group-hover:text-indigo-100 transition-colors" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <blockquote className="text-slate-700 mb-8 leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${testimonial.color}`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{testimonial.author}</div>
                  <div className="text-sm text-slate-500">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
