"use client";

import { A4Page } from "@/components/resume";
import { EditableField, RichEditor } from "@/components/resume";
import { useCoverLetterStore } from "@/store";

const ACCENT = "#059669"; // emerald-600

/**
 * CoverLetterLayout_Modern
 *
 * A left-aligned, contemporary cover letter layout.
 * Contrasts with Classic (centered, formal).
 */
export function CoverLetterLayout_Modern() {
  const user = useCoverLetterStore((state) => state.coverLetterData?.user);
  const job = useCoverLetterStore((state) => state.coverLetterData?.job);
  const date = useCoverLetterStore((state) => state.coverLetterData?.date);
  const bodyHtml = useCoverLetterStore((state) => state.coverLetterData?.bodyHtml);

  const updateUser = useCoverLetterStore((state) => state.updateUser);
  const updateJob = useCoverLetterStore((state) => state.updateJob);
  const setDate = useCoverLetterStore((state) => state.setDate);
  const setBodyHtml = useCoverLetterStore((state) => state.setBodyHtml);

  if (!user || !job) {
    return null;
  }

  const contactItems = [
    user.email && {
      value: user.email,
      onChange: (value: string) => updateUser("email", value),
      placeholder: "email@example.com",
    },
    user.phoneNumber && {
      value: user.phoneNumber,
      onChange: (value: string) => updateUser("phoneNumber", value),
      placeholder: "+1 234 567 890",
    },
    user.streetAddress && {
      value: user.streetAddress,
      onChange: (value: string) => updateUser("streetAddress", value),
      placeholder: "Street Address",
    },
  ].filter((item): item is { value: string; onChange: (value: string) => void; placeholder: string } => Boolean(item));

  return (
    <A4Page>
      <div className="h-full pt-2">
        {/* HEADER - Left-aligned */}
        <header className="mb-6 pb-3 border-b-2 text-left" style={{ borderColor: ACCENT }}>
          <div className="mb-1">
            <EditableField
              value={user.name || ""}
              onChange={(value) => updateUser("name", value)}
              placeholder="Your Name"
              className="text-2xl font-bold text-gray-900"
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-600">
            {contactItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-x-3">
                <EditableField
                  value={item.value}
                  onChange={item.onChange}
                  placeholder={item.placeholder}
                  className="text-xs text-gray-600"
                />
                {idx < contactItems.length - 1 && (
                  <span className="text-gray-300">•</span>
                )}
              </div>
            ))}
          </div>
        </header>

        {/* RECIPIENT & DATE */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0 mb-6">
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">
              To:
            </div>
            <EditableField
              value={job.companyName}
              onChange={(value) => updateJob("companyName", value)}
              placeholder="Company Name"
              className="font-bold text-gray-900 text-sm block mb-1"
            />
            <div className="flex gap-1 items-center text-xs text-gray-600">
              {job.locationCity && (
                <EditableField
                  value={job.locationCity}
                  onChange={(value) => updateJob("locationCity", value)}
                  placeholder="City"
                  className="text-xs"
                />
              )}
              {job.locationCity && job.country && <span className="text-gray-400">,</span>}
              {job.country && (
                <EditableField
                  value={job.country}
                  onChange={(value) => updateJob("country", value)}
                  placeholder="Country"
                  className="text-xs"
                />
              )}
            </div>
          </div>
          <div className="text-right">
            <EditableField
              value={date || ""}
              onChange={setDate}
              placeholder="Date"
              className="text-sm font-medium text-gray-900"
            />
          </div>
        </div>

        {/* SUBJECT - Plain line with accent */}
        <div
          className="mb-6 pb-2 border-b text-sm font-medium text-gray-800"
          style={{ borderColor: ACCENT }}
        >
          <span className="text-gray-500">Re:</span>{" "}
          <EditableField
            value={job.jobTitle}
            onChange={(value) => updateJob("jobTitle", value)}
            placeholder="Job Title"
            className="text-gray-900"
          />
        </div>

        {/* BODY */}
        <div className="mt-6">
          <RichEditor
            content={bodyHtml || ""}
            onChange={setBodyHtml}
            placeholder="Click here to start writing your cover letter..."
            className="text-sm text-gray-800 leading-relaxed"
          />
        </div>
      </div>
    </A4Page>
  );
}
