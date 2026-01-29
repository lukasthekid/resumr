"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ReactNode } from "react";

interface BrowserFrameProps {
  children?: ReactNode;
  image?: string;
  alt?: string;
  className?: string;
}

export function BrowserFrame({
  children,
  image,
  alt = "App screenshot",
  className = "",
}: BrowserFrameProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
      }}
      className={`relative ${className}`}
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="rounded-xl border border-slate-200 shadow-2xl overflow-hidden bg-white"
      >
        {/* Browser Header */}
        <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center px-4">
          {/* macOS Window Controls */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>

          {/* Optional: URL bar simulation */}
          <div className="flex-1 mx-4">
            <div className="max-w-md mx-auto bg-white rounded border border-slate-200 px-3 py-1">
              <div className="h-3 w-full bg-slate-100 rounded" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative bg-white">
          {image ? (
            <Image
              src={image}
              alt={alt}
              width={1920}
              height={1080}
              className="w-full h-auto"
              priority
            />
          ) : (
            children
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
