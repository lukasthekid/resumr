"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ResumeLayout_American } from "./ResumeLayout_American";
import "./resume.css";

type Job = {
  id: number;
  companyName: string;
  companyLogo: string;
  jobTitle: string;
  locationCity: string;
  country: string;
};

type User = {
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  streetAddress: string | null;
  city: string | null;
  postcode: string | null;
  country: string | null;
  linkedInUrl: string | null;
};

type ResumeData = {
  personal?: {
    name?: string;
    location?: string;
    email?: string;
    phone?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
  education?: Array<{
    institution?: string;
    location?: string;
    degree?: string;
    startDate?: string;
    endDate?: string;
    highlights?: string[];
  }>;
  workExperience?: Array<{
    title?: string;
    company?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    achievements?: string[];
  }>;
  projects?: Array<{
    name?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    url?: string;
    description?: string[];
  }>;
  skills?: {
    programmingLanguages?: string[];
    technologies?: string[];
    tools?: string[];
    [key: string]: string[] | undefined;
  };
  extracurriculars?: Array<{
    activity?: string;
    startDate?: string;
    endDate?: string;
    description?: string[];
  }>;
};

export default function ResumeViewerPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = Number(params?.id);
  const hasLoadedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Get resume data from sessionStorage
  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }

    const stored = sessionStorage.getItem(`resume_${jobId}`);
    
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setJob(data.job);
        setUser(data.user);
        setResumeData(data.resumeData || null);
        setLoading(false);
        hasLoadedRef.current = true;
        // Clean up after load
        sessionStorage.removeItem(`resume_${jobId}`);
      } catch (e) {
        console.error("Failed to parse resume data:", e);
        router.push(`/dashboard/jobs/${jobId}`);
      }
    } else {
      router.push(`/dashboard/jobs/${jobId}`);
    }
  }, [jobId, router]);

  // Update specific resume data sections
  const updateResumeData = useCallback((updater: (data: ResumeData) => ResumeData) => {
    setResumeData((prev) => prev ? updater(prev) : null);
  }, []);

  // Format text (bold, italic, underline)
  const formatText = (command: string) => {
    document.execCommand(command, false);
  };

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
      a.download = `${name.replace(/[^a-z0-9]/gi, '_')}_Resume.pdf`;
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

  if (loading || !job || !user || !resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-slate-600">Loading resume...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Fixed Header Bar */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 sticky top-0 z-10 print:hidden">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <Link
              href={`/dashboard/jobs/${jobId}`}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              ← Back to job
            </Link>

            <div className="flex items-center gap-3">
              {/* Rich Text Toolbar */}
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-2 py-1.5 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => formatText("bold")}
                  className="rounded px-2.5 py-1 text-xs font-bold transition-colors text-slate-700 hover:bg-slate-100"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => formatText("italic")}
                  className="rounded px-2.5 py-1 text-xs font-bold italic transition-colors text-slate-700 hover:bg-slate-100"
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => formatText("underline")}
                  className="rounded px-2.5 py-1 text-xs font-bold underline transition-colors text-slate-700 hover:bg-slate-100"
                  title="Underline"
                >
                  U
                </button>
              </div>

              <button
                type="button"
                onClick={downloadPDF}
                disabled={downloadingPDF}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-600 transition-colors disabled:bg-emerald-300 disabled:cursor-not-allowed print:hidden"
              >
                {downloadingPDF ? "Generating PDF..." : "Save as PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Container */}
      <div className="py-8 print:py-0">
        <div className="max-w-4xl mx-auto px-6 print:px-0 print:max-w-none">
          {/* Instructions */}
          <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900 print:hidden">
            <p>
              <span className="font-semibold">✨ Your resume is ready!</span> Click on any bullet point or description text to edit. Use the toolbar above for formatting.
            </p>
          </div>

          {/* A4 Resume Document */}
          <ResumeLayout_American 
            resumeData={resumeData} 
            onUpdateData={updateResumeData}
            editable={true}
          />

          {/* Tips */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm p-4 text-sm text-slate-700 print:hidden">
            <p className="font-semibold text-slate-900 mb-2">💡 Tips for editing:</p>
            <ul className="space-y-1 text-xs text-slate-600">
              <li>• Click any bullet point to edit the text</li>
              <li>• Use the toolbar above for bold, italic, and underline formatting</li>
              <li>• Press Enter to create new bullet points</li>
              <li>• Changes are live - no need to save manually</li>
              <li>• ATS-friendly formatting is maintained automatically</li>
              <li>• Download as PDF when you're satisfied with the content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
