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

interface CoverLetterLayoutSidebarProps {
  user: User;
  job: Job;
  todayDate: string;
  editor: Editor | null;
}

export function CoverLetterLayout_Sidebar({
  user,
  job,
  todayDate,
  editor,
}: CoverLetterLayoutSidebarProps) {
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
      <div style={{ display: "flex", minHeight: "297mm" }}>
        {/* LEFT SIDEBAR */}
        <div
          className="fixed-header"
          style={{
            width: "50mm",
            padding: "15mm 5mm 5mm 8mm",
            backgroundColor: "#f8f9fa",
            borderRight: "1px solid #e0e0e0",
          }}
        >
          {/* Name and Title */}
          <div style={{ marginBottom: "1.5em" }}>
            <div style={{ fontWeight: "700", fontSize: "18pt", marginBottom: "0.3em", color: "#000" }}>
              {user.name || "John Smith"}
            </div>
            <div style={{ fontSize: "11pt", color: "#666" }}>
              Cover Letter
            </div>
          </div>

          {/* Personal Info Section */}
          <div style={{ marginBottom: "1.5em" }}>

            {/* Phone */}
            {user.phoneNumber && (
              <div style={{ marginBottom: "0.8em" }}>
                <div style={{ fontSize: "9pt", fontWeight: "600", color: "#666" }}>Phone</div>
                <div style={{ fontSize: "10pt" }}>{user.phoneNumber}</div>
              </div>
            )}

            {/* Email */}
            {user.email && (
              <div style={{ marginBottom: "0.8em" }}>
                <div style={{ fontSize: "9pt", fontWeight: "600", color: "#666" }}>E-mail</div>
                <div style={{ fontSize: "10pt", wordBreak: "break-word" }}>{user.email}</div>
              </div>
            )}
            
            {user.city && (
              <div style={{ marginBottom: "0.8em" }}>
                <div style={{ fontSize: "9pt", fontWeight: "600", color: "#666" }}>City</div>
                <div style={{ fontSize: "10pt" }}>{user.city}</div>
              </div>
            )}
            
            
            {user.postcode && (
              <div style={{ marginBottom: "0.8em" }}>
                <div style={{ fontSize: "9pt", fontWeight: "600", color: "#666" }}>Postcode</div>
                <div style={{ fontSize: "10pt" }}>{user.postcode}</div>
              </div>
            )}
            
            
            
          </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div style={{ flex: 1, padding: "25.4mm 25.4mm 25.4mm 20mm" }}>
          {/* Date (top right) */}
          <div className="fixed-header" style={{ fontSize: "10pt", marginBottom: "1.5em", color: "#666" }}>
            {user.city && `${user.city}, `}
            {todayDate.replace(/^(\w+) (\d+), (\d+)$/, "$2/$1/$3")}
          </div>

          {/* Recipient Info */}
          <div className="fixed-header" style={{ marginBottom: "1.5em" }}>
            <div style={{ fontWeight: "600", marginBottom: "0.2em" }}>
              {job.jobTitle}
            </div>
            <div style={{ fontSize: "10pt", color: "#666", fontStyle: "italic", marginBottom: "0.5em" }}>
              {job.companyName}
            </div>
          </div>

          {/* Salutation & Body */}
          <div className="editable-body">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
