"use client";

import { A4Page } from "@/components/resume";
import { EditableField, RichEditor } from "@/components/resume";
import { useCoverLetterStore } from "@/store";

/**
 * CoverLetterLayout_Classic
 * 
 * A traditional cover letter layout with header and body.
 * All header fields are editable inline.
 */
export function CoverLetterLayout_Classic() {
  // Subscribe to store
  const user = useCoverLetterStore((state) => state.coverLetterData?.user);
  const job = useCoverLetterStore((state) => state.coverLetterData?.job);
  const date = useCoverLetterStore((state) => state.coverLetterData?.date);
  const bodyHtml = useCoverLetterStore((state) => state.coverLetterData?.bodyHtml);

  // Get actions
  const updateUser = useCoverLetterStore((state) => state.updateUser);
  const updateJob = useCoverLetterStore((state) => state.updateJob);
  const setDate = useCoverLetterStore((state) => state.setDate);
  const setBodyHtml = useCoverLetterStore((state) => state.setBodyHtml);

  if (!user || !job) {
    return null;
  }

  // Build contact items array
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
        {/* HEADER - Centered, Modern Style */}
        <header className="mb-8 pb-4 border-b-2 border-gray-800 text-center">
          {/* Name - Large and Centered */}
          <div className="mb-2">
            <EditableField
              value={user.name || ""}
              onChange={(value) => updateUser("name", value)}
              placeholder="YOUR NAME"
              className="text-4xl font-bold uppercase tracking-wide text-gray-900 text-center"
            />
          </div>

          {/* Contact Info - Centered Row with Bullets */}
          <div className="w-full">
            <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs">
              {contactItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-x-3">
                  <EditableField
                    value={item.value}
                    onChange={item.onChange}
                    placeholder={item.placeholder}
                    className="text-xs text-gray-600 text-center"
                  />
                  {/* Separator - hide for last item */}
                  {idx < contactItems.length - 1 && (
                    <span className="text-gray-400">•</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* RECIPIENT & DATE SECTION */}
        <div className="flex justify-between items-start mb-8">
          {/* Left Side - Recipient */}
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
              {job.locationCity && job.country && (
                <span className="text-gray-400">,</span>
              )}
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

          {/* Right Side - Date */}
          <div className="text-right">
            <EditableField
              value={date || ""}
              onChange={setDate}
              placeholder="Date"
              className="text-sm font-medium text-gray-900"
            />
          </div>
        </div>

        {/* SUBJECT LINE BOX */}
        <div className="w-full bg-gray-50 p-2 rounded border-l-4 border-gray-800 mb-6">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-sm text-gray-800">Re:</span>
            <EditableField
              value={job.jobTitle}
              onChange={(value) => updateJob("jobTitle", value)}
              placeholder="Job Title"
              className="font-bold text-sm text-gray-800 flex-1"
            />
          </div>
        </div>

        {/* BODY - Rich Text Editor */}
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
