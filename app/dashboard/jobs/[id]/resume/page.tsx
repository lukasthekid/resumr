"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { A4Page } from "@/components/resume";
import { ModernTemplate } from "./ModernTemplate";
import { ClassicTemplate } from "./ClassicTemplate";
import { useResumeStore } from "@/store";
import type { ResumeData } from "@/types/resume";

// Mock resume data based on example from types/resume.ts
const MOCK_RESUME_DATA: ResumeData = {
  personal: {
    name: "Lukas Muster",
    location: "Vienna, Austria",
    email: "lukas@burtscher.at",
    phone: "+431234567890",
    linkedin: "https://www.linkedin.com/in/lukas-muster",
    github: "https://github.com/lukasmuster",
    website: "https://lukasmuster.dev",
  },
  education: [
    {
      institution: "Georgia Institute of Technology",
      degree: "Master of Science in Computer Science (Specialization: Machine Learning)",
      startDate: "2018",
      endDate: "2020",
      location: "Atlanta, GA",
      highlights: [
        "GPA: 4.0/4.0",
        "Thesis: Deep Learning for Natural Language Processing",
      ],
    },
    {
      institution: "Stanford University",
      degree: "Bachelor of Science in Mathematical and Computational Science",
      startDate: "2014",
      endDate: "2018",
      location: "Stanford, CA",
      highlights: [
        "Summa Cum Laude",
        "Dean's List all semesters",
      ],
    },
  ],
  workExperience: [
    {
      title: "Senior Lead Software Engineer (Data Science)",
      company: "Lumina AI",
      location: "San Francisco, CA",
      startDate: "2021",
      endDate: "Present",
      achievements: [
        "Led the development of a proprietary RAG (Retrieval-Augmented Generation) framework, enhancing response accuracy for over 5 million monthly active users, directly applicable to building multimodal embeddings and advanced ML solutions.",
        "Optimized large-scale model serving using NVIDIA Triton, reducing cloud compute costs by $1.2M annually, demonstrating strong MLOps and model operationalization capabilities.",
        "Designed and implemented a real-time feature store capable of handling high event throughput with sub-10ms latency, crucial for data analysis and experimentation in a production environment.",
      ],
    },
    {
      title: "Machine Learning Engineer",
      company: "DataStream Systems",
      location: "Boston, MA",
      startDate: "2018",
      endDate: "2021",
      achievements: [
        "Built and maintained automated CI/CD pipelines for ML (MLOps), significantly reducing deployment cycles from weeks to hours, showcasing expertise in model operationalization.",
        "Developed a distributed training wrapper for PyTorch, effectively scaling training across 128 GPUs with linear efficiency, relevant for building complex ML models.",
        "Implemented an anomaly detection engine for financial transactions, blocking $45M in fraudulent activity, demonstrating practical application of supervised ML and data analysis.",
      ],
    },
  ],
  projects: [
    {
      name: "Autonomous Agent Playground",
      role: "Personal Project",
      url: "https://github.com/lukasmuster/agent-playground",
      description: [
        "Developed a personal suite of autonomous agents for calendar scheduling and email filtering, leveraging GPT-4 and local vector storage, directly relevant to multimodal embeddings and advanced ML.",
      ],
    },
    {
      name: "Open-Source Contributor: \"Ghost-Net\"",
      role: "Core Contributor",
      url: "https://github.com/ghostnet/ghostnet",
      description: [
        "Contributed to a lightweight neural architecture for edge devices, outperforming MobileNetV3 in latency benchmarks, demonstrating experience with advanced ML architectures and optimization.",
      ],
    },
  ],
  skills: {
    programmingLanguages: ["Python", "SQL", "Rust", "Go", "C++"],
    technologies: [
      "PyTorch",
      "TensorFlow",
      "JAX",
      "Hugging Face",
      "LangChain",
      "Kubernetes",
      "Docker",
      "AWS (SageMaker/Lambda)",
      "Terraform",
      "Ray",
      "Apache Spark",
      "Snowflake",
      "Pinecone (Vector DBs)",
      "dbt",
      "NVIDIA Triton",
      "Pandas",
      "NumPy",
      "Scikit-learn",
    ],
    tools: ["Git", "VS Code", "Jupyter", "Linux"],
  },
};

export default function ResumeViewerPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = Number(params?.id);
  const hasLoadedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [layout, setLayout] = useState<"modern" | "classic">("modern");

  // Get store actions
  const setResumeData = useResumeStore((state) => state.setResumeData);
  const resumeData = useResumeStore((state) => state.resumeData);

  // Load resume data (from sessionStorage or mock data)
  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }

    const stored = sessionStorage.getItem(`resume_${jobId}`);

    if (stored) {
      try {
        const data = JSON.parse(stored);
        setResumeData(data.resumeData || MOCK_RESUME_DATA);
        setLoading(false);
        hasLoadedRef.current = true;
        // Clean up after load
        sessionStorage.removeItem(`resume_${jobId}`);
      } catch (e) {
        console.error("Failed to parse resume data:", e);
        // Fall back to mock data
        setResumeData(MOCK_RESUME_DATA);
        setLoading(false);
        hasLoadedRef.current = true;
      }
    } else {
      // Use mock data for development/testing
      console.log("Loading mock resume data...");
      setResumeData(MOCK_RESUME_DATA);
      setLoading(false);
      hasLoadedRef.current = true;
    }
  }, [jobId, setResumeData]);

  async function downloadPDF() {
    if (!resumeData) {
      alert("Cannot generate PDF: missing resume data");
      return;
    }

    setDownloadingPDF(true);

    try {
      // Send request to server-side PDF generation
      const response = await fetch("/api/resume/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeData,
          layout,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate PDF");
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const name = resumeData.personal?.name || "Resume";
      a.download = `${name.replace(/[^a-z0-9]/gi, "_")}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("PDF download error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadingPDF(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-sm text-slate-600">Loading resume...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Fixed Header Bar */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 sticky top-0 z-10 print:hidden shadow-sm">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <Link
              href={`/dashboard/jobs/${jobId}`}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-2"
            >
              <span>←</span>
              <span>Back to job</span>
            </Link>

            <div className="flex items-center gap-3">
              {/* Layout Selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-600 font-medium">Layout:</label>
                <select
                  value={layout}
                  onChange={(e) => setLayout(e.target.value as "modern" | "classic")}
                  className="text-xs border border-slate-300 rounded-md px-3 py-1.5 bg-white text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                </select>
              </div>

              {/* Keyboard Shortcuts Hint */}
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                <kbd className="bg-white px-2 py-1 rounded border border-slate-200 font-mono text-xs">
                  Cmd+B
                </kbd>
                <span>Bold</span>
                <span className="text-slate-300">|</span>
                <kbd className="bg-white px-2 py-1 rounded border border-slate-200 font-mono text-xs">
                  Cmd+I
                </kbd>
                <span>Italic</span>
              </div>

              <button
                type="button"
                onClick={downloadPDF}
                disabled={downloadingPDF}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-600 transition-colors disabled:bg-emerald-300 disabled:cursor-not-allowed"
              >
                {downloadingPDF ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Save as PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Container */}
      <div className="py-8 print:py-0">
        <div className="max-w-5xl mx-auto px-6 print:px-0">
          {/* Instructions */}
          <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900 print:hidden">
            <p>
              <span className="font-semibold">✨ Your resume is ready!</span> Click
              on any text to edit. Use <kbd className="bg-white px-2 py-1 rounded border border-indigo-200 text-xs">Cmd/Ctrl+B</kbd> for
              bold, <kbd className="bg-white px-2 py-1 rounded border border-indigo-200 text-xs">Cmd/Ctrl+I</kbd> for italic.
            </p>
          </div>

          {/* A4 Resume Document with Selected Template */}
          <A4Page>
            {layout === "modern" ? <ModernTemplate /> : <ClassicTemplate />}
          </A4Page>

          {/* Tips */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm p-4 text-sm text-slate-700 print:hidden">
            <p className="font-semibold text-slate-900 mb-2">💡 Editing Tips:</p>
            <ul className="space-y-1 text-xs text-slate-600">
              <li>
                • <strong>Click any text</strong> to start editing inline
              </li>
              <li>
                • Use <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">Cmd/Ctrl+B</kbd> for{" "}
                <strong>bold</strong> and <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">Cmd/Ctrl+I</kbd> for{" "}
                <em>italic</em>
              </li>
              <li>
                • Create bullet lists with <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">Cmd/Ctrl+Shift+8</kbd>
              </li>
              <li>• Changes save automatically - no need to save manually</li>
              <li>
                • ATS-friendly formatting is maintained automatically
              </li>
              <li>
                • Click <strong>Save as PDF</strong> when you're satisfied
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
