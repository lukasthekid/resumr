"use client";

import { useState } from "react";
import { Briefcase, Sparkles, PenLine, ArrowRight } from "lucide-react";
import { GenerationModal } from "../../_components/GenerationModal";
import { ResumeGenerator } from "../../_components/ResumeGenerator";
import { CoverLetterGenerator } from "../../_components/CoverLetterGenerator";
import { ExpandableJobDescription } from "../../_components/ExpandableJobDescription";

interface JobDetailsClientProps {
  jobId: number;
  jobDescription: string;
}

export function JobDetailsClient({ jobId, jobDescription }: JobDetailsClientProps) {
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [coverLetterModalOpen, setCoverLetterModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Application Studio - Action Cards */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Application Studio
          </h2>
          <p className="text-sm text-foreground-muted mt-1">
            Create tailored documents for this position
          </p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Resume Builder */}
          <button
            onClick={() => setResumeModalOpen(true)}
            className="group bg-surface rounded-xl border border-border p-6 hover:shadow-md transition-all duration-200 hover:border-primary/50 text-left w-full"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                  Tailored Resume
                </h3>
                <p className="text-sm text-foreground-muted">
                  Customize your experience to match this specific job description
                </p>
              </div>
            </div>
            <div className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 group-hover:shadow-md">
              Start Tailoring
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 2: Cover Letter Creator */}
          <button
            onClick={() => setCoverLetterModalOpen(true)}
            className="group bg-surface rounded-xl border border-border p-6 hover:shadow-md transition-all duration-200 hover:border-secondary/50 text-left w-full"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                <PenLine className="h-6 w-6 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-secondary transition-colors">
                  Smart Cover Letter
                </h3>
                <p className="text-sm text-foreground-muted">
                  Generate a persuasive letter matching your tone and profile
                </p>
              </div>
            </div>
            <div className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-secondary hover:bg-secondary-hover px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 group-hover:shadow-md">
              Draft Letter
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </section>

      {/* Job Description - About the Role */}
      <section className="bg-surface rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">
          About the Role
        </h2>
        <div className="text-sm text-foreground-muted">
          <ExpandableJobDescription text={jobDescription} />
        </div>
      </section>

      {/* Resume Generation Modal */}
      <GenerationModal
        isOpen={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
        documentType="Resume"
      >
        <ResumeGenerator jobId={jobId} />
      </GenerationModal>

      {/* Cover Letter Generation Modal */}
      <GenerationModal
        isOpen={coverLetterModalOpen}
        onClose={() => setCoverLetterModalOpen(false)}
        documentType="Cover Letter"
      >
        <CoverLetterGenerator jobId={jobId} />
      </GenerationModal>
    </div>
  );
}
