"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCoverLetterStore } from "@/store";
import { CoverLetterLayout_Classic } from "./CoverLetterLayout_Classic";
import type { CoverLetterData } from "@/types/coverLetter";

export default function CoverLetterEditorPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = Number(params?.id);
  const hasLoadedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Get store state and actions
  const coverLetterData = useCoverLetterStore((state) => state.coverLetterData);
  const setCoverLetterData = useCoverLetterStore((state) => state.setCoverLetterData);

  // Load cover letter data from sessionStorage
  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }

    const stored = sessionStorage.getItem(`coverLetter_${jobId}`);

    if (stored) {
      try {
        const data = JSON.parse(stored);
        
        // Format the date
        const todayDate = new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        // Transform to our CoverLetterData structure
        const coverLetterData: CoverLetterData = {
          user: data.user,
          job: {
            ...data.job,
            id: data.job?.id || jobId,
          },
          date: todayDate,
          bodyHtml: data.coverLetterBody
            ? `<p>${data.coverLetterBody.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}</p>`
            : "",
        };

        setCoverLetterData(coverLetterData);
        setLoading(false);
        hasLoadedRef.current = true;

        // Clean up after load
        sessionStorage.removeItem(`coverLetter_${jobId}`);
      } catch (e) {
        console.error("Failed to parse cover letter data:", e);
        router.push(`/dashboard/jobs/${jobId}`);
      }
    } else {
      console.warn("No cover letter data found in sessionStorage");
      router.push(`/dashboard/jobs/${jobId}`);
    }
  }, [jobId, router, setCoverLetterData]);

  async function downloadPDF() {
    if (!coverLetterData) {
      alert("Cannot generate PDF: missing data");
      return;
    }

    setDownloadingPDF(true);

    try {
      // Send request to server-side PDF generation
      const response = await fetch("/api/cover-letter/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: coverLetterData.user,
          job: coverLetterData.job,
          todayDate: coverLetterData.date,
          bodyHtml: coverLetterData.bodyHtml,
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
      a.download = `${coverLetterData.job.companyName.replace(/[^a-z0-9]/gi, "_")}_${coverLetterData.job.jobTitle.replace(/[^a-z0-9]/gi, "_")}_Cover_Letter.pdf`;
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

  if (loading || !coverLetterData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-sm text-slate-600">Loading cover letter...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Fixed Header Bar */}
      <div className="border-b border-slate-200 bg-white px-4 sm:px-6 py-4 sticky top-0 z-10 print:hidden shadow-sm">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Link
              href={`/dashboard/jobs/${jobId}`}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-2"
            >
              <span>←</span>
              <span>Back to job</span>
            </Link>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end sm:justify-start">
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
      <div className="py-6 sm:py-8 print:py-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 print:px-0">
          {/* Instructions */}
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 print:hidden">
            <p>
              <span className="font-semibold">✨ Your cover letter is ready!</span> Click
              on any text to edit. Use{" "}
              <kbd className="bg-white px-2 py-1 rounded border border-emerald-200 text-xs">
                Cmd/Ctrl+B
              </kbd>{" "}
              for bold,{" "}
              <kbd className="bg-white px-2 py-1 rounded border border-emerald-200 text-xs">
                Cmd/Ctrl+I
              </kbd>{" "}
              for italic.
            </p>
          </div>

          {/* Cover Letter Document */}
          <CoverLetterLayout_Classic />

          {/* Tips */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm p-4 text-sm text-slate-700 print:hidden">
            <p className="font-semibold text-slate-900 mb-2">💡 Editing Tips:</p>
            <ul className="space-y-1 text-xs text-slate-600">
              <li>
                • <strong>Click any text</strong> to start editing inline
              </li>
              <li>
                • Use{" "}
                <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">Cmd/Ctrl+B</kbd> for{" "}
                <strong>bold</strong> and{" "}
                <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">Cmd/Ctrl+I</kbd> for{" "}
                <em>italic</em>
              </li>
              <li>
                • Create bullet lists with{" "}
                <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                  Cmd/Ctrl+Shift+8
                </kbd>
              </li>
              <li>• Changes save automatically - no need to save manually</li>
              <li>• ATS-friendly formatting is maintained automatically</li>
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
