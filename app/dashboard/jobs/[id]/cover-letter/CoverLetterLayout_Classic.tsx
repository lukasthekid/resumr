"use client";

import { EditorContent, Editor } from "@tiptap/react";

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

type Job = {
  companyName: string;
  jobTitle: string;
  locationCity: string;
  country: string;
};

interface CoverLetterLayoutClassicProps {
  user: User;
  job: Job;
  todayDate: string;
  editor: Editor | null;
}

export function CoverLetterLayout_Classic({
  user,
  job,
  todayDate,
  editor,
}: CoverLetterLayoutClassicProps) {
  const userContactLine = [
    user.streetAddress,
    user.email,
    user.phoneNumber,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div
      className="bg-white shadow-lg mx-auto cover-letter-printable"
      id="cover-letter-document"
      style={{
        maxWidth: "210mm",
        minHeight: "297mm",
        fontFamily: "Arial, sans-serif",
        fontSize: "11pt",
        lineHeight: "1.3",
        color: "#000",
      }}
    >
      <div style={{ padding: "25.4mm" }}>
        {/* FIXED HEADER - Not Editable */}
        <div className="fixed-header" style={{ marginBottom: "1em" }}>
          {/* User Name and Contact */}
          <div style={{ marginBottom: "1em" }}>
            <div style={{ fontWeight: "600", fontSize: "14pt", marginBottom: "0.25em" }}>
              {user.name?.toUpperCase() || "YOUR NAME"}
            </div>
            <div style={{ fontSize: "9pt", color: "#555" }}>
              {userContactLine}
            </div>
          </div>

          {/* Date */}
          <div style={{ fontSize: "10pt", marginBottom: "1em" }}>
            {todayDate}
          </div>

          {/* Company Info */}
          <div style={{ marginBottom: "1em" }}>
            <div style={{ fontWeight: "600" }}>{job.companyName}</div>
            {job.locationCity && (
              <div style={{ fontSize: "10pt", color: "#555" }}>
                {[job.locationCity, job.country].filter(Boolean).join(", ")}
              </div>
            )}
          </div>

          {/* Subject Line */}
          <div style={{ fontWeight: "600", marginBottom: "1em" }}>
            Re: Application for {job.jobTitle}
          </div>
        </div>

        {/* EDITABLE BODY */}
        <div className="editable-body">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
