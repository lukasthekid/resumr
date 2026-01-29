"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { CoverLetterLayout_Classic } from "./CoverLetterLayout_Classic";
import { CoverLetterLayout_Sidebar } from "./CoverLetterLayout_Sidebar";
import "./cover-letter.css";

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

export default function CoverLetterEditorPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = Number(params?.id);
  const hasLoadedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [coverLetterBody, setCoverLetterBody] = useState("");
  const [layout, setLayout] = useState<"classic" | "sidebar">("classic");
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Initialize editor with empty content first (body text only)
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
  });

  // Get cover letter from sessionStorage (passed from generator)
  useEffect(() => {
    // Prevent double-run in React Strict Mode
    if (hasLoadedRef.current) {
      return;
    }

    const stored = sessionStorage.getItem(`coverLetter_${jobId}`);
    
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setJob(data.job);
        setUser(data.user);
        setCoverLetterBody(data.coverLetterBody || "");
        setLoading(false);
        hasLoadedRef.current = true;
        // Clean up immediately after successful load
        sessionStorage.removeItem(`coverLetter_${jobId}`);
      } catch (e) {
        console.error("Failed to parse cover letter data:", e);
        router.push(`/dashboard/jobs/${jobId}`);
      }
    } else {
      router.push(`/dashboard/jobs/${jobId}`);
    }
  }, [jobId, router]);

  // Update editor content when data is loaded
  useEffect(() => {
    if (!editor || !coverLetterBody) return;

    // Only set the body content (editable part)
    const bodyHTML = `<p>${coverLetterBody.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
    editor.commands.setContent(bodyHTML);
  }, [editor, coverLetterBody]);

  async function downloadPDF() {
    if (!editor || !job || !user) {
      alert("Cannot generate PDF: missing data");
      return;
    }

    setDownloadingPDF(true);

    try {
      // Get the current editor HTML content
      const bodyHtml = editor.getHTML();

      // Send request to server-side PDF generation
      const response = await fetch("/api/cover-letter/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          layout,
          user,
          job,
          todayDate,
          bodyHtml,
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
      a.download = `${job.companyName.replace(/[^a-z0-9]/gi, '_')}_${job.jobTitle.replace(/[^a-z0-9]/gi, '_')}_Cover_Letter.pdf`;
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

  if (loading || !job || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-slate-600">Loading cover letter...</div>
      </div>
    );
  }

  const todayDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const userContactLine = [
    user.streetAddress,
    user.email,
    user.phoneNumber,
  ]
    .filter(Boolean)
    .join(" • ");

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
              {/* Layout Selector */}
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-2 py-1.5 bg-white shadow-sm">
                <span className="text-xs text-slate-600 mr-1">Layout:</span>
                <button
                  type="button"
                  onClick={() => setLayout("classic")}
                  className={[
                    "rounded px-2.5 py-1 text-xs transition-colors",
                    layout === "classic"
                      ? "bg-sky-500 text-white"
                      : "text-slate-700 hover:bg-slate-100",
                  ].join(" ")}
                >
                  Classic
                </button>
                <button
                  type="button"
                  onClick={() => setLayout("sidebar")}
                  className={[
                    "rounded px-2.5 py-1 text-xs transition-colors",
                    layout === "sidebar"
                      ? "bg-sky-500 text-white"
                      : "text-slate-700 hover:bg-slate-100",
                  ].join(" ")}
                >
                  Sidebar
                </button>
              </div>

              {/* Rich Text Toolbar */}
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-2 py-1.5 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={[
                    "rounded px-2.5 py-1 text-xs font-bold transition-colors",
                    editor?.isActive("bold")
                      ? "bg-sky-500 text-white"
                      : "text-slate-700 hover:bg-slate-100",
                  ].join(" ")}
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={[
                    "rounded px-2.5 py-1 text-xs font-bold italic transition-colors",
                    editor?.isActive("italic")
                      ? "bg-sky-500 text-white"
                      : "text-slate-700 hover:bg-slate-100",
                  ].join(" ")}
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  className={[
                    "rounded px-2.5 py-1 text-xs font-bold underline transition-colors",
                    editor?.isActive("underline")
                      ? "bg-sky-500 text-white"
                      : "text-slate-700 hover:bg-slate-100",
                  ].join(" ")}
                >
                  U
                </button>
                <div className="mx-1 h-4 w-px bg-slate-200" />
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className={[
                    "rounded px-2.5 py-1 text-xs transition-colors",
                    editor?.isActive("bulletList")
                      ? "bg-sky-500 text-white"
                      : "text-slate-700 hover:bg-slate-100",
                  ].join(" ")}
                >
                  • List
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
          <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 print:hidden">
            <p>
              <span className="font-semibold">✨ Your cover letter is ready!</span> Click on the body text to edit. Header is fixed, body is fully editable. Click "Save as PDF" to download an ATS-friendly PDF.
            </p>
          </div>

          {/* A4 Paper - Route to appropriate layout */}
          {layout === "classic" ? (
            <CoverLetterLayout_Classic
              user={user}
              job={job}
              todayDate={todayDate}
              editor={editor}
            />
          ) : (
            <CoverLetterLayout_Sidebar
              user={user}
              job={job}
              todayDate={todayDate}
              editor={editor}
            />
          )}

          {/* Tips */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm p-4 text-sm text-slate-700 print:hidden">
            <p className="font-semibold text-slate-900 mb-2">💡 Tips for editing:</p>
            <ul className="space-y-1 text-xs text-slate-600">
              <li>• Click anywhere in the body text to start editing</li>
              <li>• Use the toolbar above for bold, italic, underline, and lists</li>
              <li>• Add your own closing (e.g., "Sincerely, [Your Name]") at the end</li>
              <li>• Keep it concise - ATS systems prefer plain text with minimal formatting</li>
              <li>• PDF is generated server-side with real, parsable text (ATS-friendly)</li>
              <li>• This page doesn't save changes - download before leaving</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
