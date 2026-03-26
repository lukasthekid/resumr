import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import type { ResumeData } from "@/types/resume";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RequestBody = {
  resumeData: ResumeData;
  layout?: "modern" | "classic" | "dach" | "european";
};

async function getHeadshotBase64FromSession(): Promise<string | null> {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId || typeof userId !== "string") return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { headshot: true },
  });
  if (!user?.headshot || user.headshot.length === 0) return null;
  return Buffer.from(user.headshot).toString("base64");
}

function generateModernResumeHTML(resumeData: ResumeData): string {
  const { personal, education, workExperience, projects, skills } = resumeData;

  // Helper to format URLs for display (strip protocol, www, trailing slashes)
  const formatUrl = (url: string): string => {
    if (!url) return '';
    return url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');
  };

  // Build contact items (email, phone, ONE link with priority: LinkedIn > GitHub > Website)
  const contactItems = [
    personal?.email,
    personal?.phone,
  ];

  // Add ONE link based on priority
  if (personal?.linkedin) {
    contactItems.push(personal.linkedin);
  } else if (personal?.github) {
    contactItems.push(personal.github);
  } else if (personal?.website) {
    contactItems.push(personal.website);
  }

  const contactLine = contactItems.filter(Boolean).join(' • ');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          @page {
            size: A4;
            margin: 0;
          }
          
          body {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 8mm 10mm;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 9pt;
            line-height: 1.3;
            color: #111827;
            background: white;
          }
          
          /* HEADER - Full Width, Centered */
          .header {
            margin-bottom: 1em;
            padding-bottom: 0.75em;
            border-bottom: 2px solid #1f2937;
            text-align: center;
          }
          
          .header h1 {
            font-size: 24pt;
            font-weight: 700;
            margin: 0 0 0.3em 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #111827;
          }
          
          .contact {
            font-size: 8pt;
            color: #374151;
            line-height: 1.4;
          }
          
          /* TWO COLUMN LAYOUT */
          .container {
            display: grid;
            grid-template-columns: 30% 70%;
            gap: 1.5em;
          }
          
          .left-column {
            padding-right: 0.5em;
          }
          
          .right-column {
            padding-left: 0.5em;
          }
          
          /* SECTION HEADERS */
          h2 {
            font-size: 8pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            border-bottom: 2px solid #1f2937;
            padding-bottom: 0.2em;
            margin-bottom: 0.7em;
            color: #111827;
          }
          
          section {
            margin-bottom: 1.2em;
          }
          
          /* EDUCATION SECTION */
          .edu-entry {
            margin-bottom: 0.9em;
            font-size: 8pt;
          }
          
          .edu-institution {
            font-weight: 700;
            color: #111827;
            line-height: 1.2;
          }
          
          .edu-dates {
            font-size: 7pt;
            color: #6b7280;
            margin-top: 0.15em;
          }
          
          .edu-degree {
            font-style: italic;
            color: #374151;
            margin-top: 0.15em;
            line-height: 1.2;
          }
          
          .edu-highlights {
            margin-top: 0.4em;
            padding-left: 1em;
            list-style-type: disc;
          }
          
          .edu-highlights li {
            margin-bottom: 0.15em;
            color: #374151;
          }
          
          /* SKILLS SECTION */
          .skills-entry {
            font-size: 8pt;
            margin-bottom: 0.4em;
            line-height: 1.5;
          }
          
          .skills-entry strong {
            font-weight: 600;
            color: #111827;
          }
          
          .skills-entry span {
            color: #374151;
          }
          
          /* WORK EXPERIENCE SECTION */
          .exp-entry {
            margin-bottom: 1em;
          }
          
          .exp-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 0.15em;
          }
          
          .exp-left {
            flex: 1;
          }
          
          .exp-title {
            font-weight: 700;
            font-size: 9.5pt;
            color: #111827;
          }
          
          .exp-company {
            font-weight: 500;
            font-size: 8pt;
            color: #374151;
          }
          
          .exp-right {
            text-align: right;
            font-size: 8pt;
            color: #4b5563;
            margin-left: 1em;
            min-width: 5em;
          }
          
          .exp-location {
            font-size: 8pt;
          }
          
          .exp-dates {
            margin-top: 0.1em;
          }
          
          .exp-achievements {
            margin-top: 0.4em;
            padding-left: 1em;
            list-style-type: disc;
          }
          
          .exp-achievements li {
            margin-bottom: 0.3em;
            font-size: 8pt;
            color: #374151;
            line-height: 1.4;
          }
          
          /* PROJECTS SECTION */
          .project-entry {
            margin-bottom: 0.9em;
          }
          
          .project-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 0.15em;
          }
          
          .project-name {
            font-weight: 600;
            font-size: 9.5pt;
            color: #111827;
          }
          
          .project-role {
            font-style: italic;
            font-size: 8pt;
            color: #4b5563;
            margin-left: 1em;
          }
          
          .project-url {
            font-size: 8pt;
            color: #2563eb;
            text-decoration: underline;
            text-decoration-color: #bfdbfe;
            margin-top: 0.2em;
            display: block;
          }
          
          .project-descriptions {
            margin-top: 0.4em;
            padding-left: 1em;
            list-style-type: disc;
          }
          
          .project-descriptions li {
            margin-bottom: 0.3em;
            font-size: 8pt;
            color: #374151;
            line-height: 1.4;
          }
          
          /* Support for rich text formatting */
          strong, b {
            font-weight: 600;
          }
          
          em, i {
            font-style: italic;
          }
          
          u {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <!-- HEADER -->
        <div class="header">
          <h1>${personal?.name || "YOUR NAME"}</h1>
          <div class="contact">${contactLine}</div>
        </div>

        <!-- TWO COLUMN LAYOUT -->
        <div class="container">
          <!-- LEFT COLUMN -->
          <div class="left-column">
            <!-- EDUCATION -->
            ${education && education.length > 0 ? `
              <section>
                <h2>EDUCATION</h2>
                ${education.map(edu => `
                  <div class="edu-entry">
                    <div class="edu-institution">${edu.institution || ""}</div>
                    ${edu.startDate || edu.endDate ? `
                      <div class="edu-dates">${edu.startDate || ""} – ${edu.endDate || ""}</div>
                    ` : ""}
                    ${edu.degree ? `<div class="edu-degree">${edu.degree}</div>` : ""}
                    ${edu.highlights && edu.highlights.length > 0 ? `
                      <ul class="edu-highlights">
                        ${edu.highlights.map(h => `<li>${h}</li>`).join("")}
                      </ul>
                    ` : ""}
                  </div>
                `).join("")}
              </section>
            ` : ""}

            <!-- SKILLS -->
            ${skills && Object.keys(skills).length > 0 ? `
              <section>
                <h2>SKILLS</h2>
                ${Object.entries(skills).map(([category, items]) => {
                  if (!items || items.length === 0) return "";
                  
                  const formattedCategory = category
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                    .trim();
                  
                  return `
                    <div class="skills-entry">
                      <strong>${formattedCategory}:</strong>
                      <span> ${items.join(", ")}</span>
                    </div>
                  `;
                }).join("")}
              </section>
            ` : ""}
          </div>

          <!-- RIGHT COLUMN -->
          <div class="right-column">
            <!-- WORK EXPERIENCE -->
            ${workExperience && workExperience.length > 0 ? `
              <section>
                <h2>PROFESSIONAL EXPERIENCE</h2>
                ${workExperience.map(exp => `
                  <div class="exp-entry">
                    <div class="exp-header">
                      <div class="exp-left">
                        <div class="exp-title">${exp.title || ""}</div>
                        ${exp.company ? `<div class="exp-company">${exp.company}</div>` : ""}
                      </div>
                      <div class="exp-right">
                        ${exp.location ? `<div class="exp-location">${exp.location}</div>` : ""}
                        ${exp.startDate || exp.endDate ? `
                          <div class="exp-dates">${exp.startDate || ""} – ${exp.endDate || "Present"}</div>
                        ` : ""}
                      </div>
                    </div>
                    ${exp.achievements && exp.achievements.length > 0 ? `
                      <ul class="exp-achievements">
                        ${exp.achievements.map(a => `<li>${a}</li>`).join("")}
                      </ul>
                    ` : ""}
                  </div>
                `).join("")}
              </section>
            ` : ""}

            <!-- PROJECTS -->
            ${projects && projects.length > 0 ? `
              <section>
                <h2>PROJECTS</h2>
                ${projects.map(project => `
                  <div class="project-entry">
                    <div class="project-header">
                      <span class="project-name">${project.name || ""}</span>
                      ${project.role ? `<span class="project-role">${project.role}</span>` : ""}
                    </div>
                    ${project.url ? `<div class="project-url">🔗 ${formatUrl(project.url)}</div>` : ""}
                    ${project.description && project.description.length > 0 ? `
                      <ul class="project-descriptions">
                        ${project.description.map(d => `<li>${d}</li>`).join("")}
                      </ul>
                    ` : ""}
                  </div>
                `).join("")}
              </section>
            ` : ""}
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateClassicResumeHTML(resumeData: ResumeData): string {
  const { personal, education, workExperience, projects, skills } = resumeData;

  // Helper to format URLs for display
  const formatUrl = (url: string): string => {
    if (!url) return '';
    return url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');
  };

  // Build contact info
  const contactItems = [];
  if (personal?.phone) contactItems.push(personal.phone);
  if (personal?.email) contactItems.push(personal.email);
  if (personal?.linkedin) contactItems.push(formatUrl(personal.linkedin));
  if (personal?.github) contactItems.push(formatUrl(personal.github));
  const contactLine = contactItems.join(' • ');

  // Map skills to categories
  const languages = skills?.programmingLanguages || [];
  const tools = skills?.tools || [];
  const technologies = skills?.technologies || [];
  const frameworksAndLibraries = technologies;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          @page {
            size: A4;
            margin: 0;
          }
          
          body {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 8mm 10mm;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 9pt;
            line-height: 1.3;
            color: #111827;
            background: white;
          }
          
          /* HEADER - Centered */
          .header {
            margin-bottom: 1.5em;
            text-align: center;
          }
          .header h1 {
            font-size: 20pt;
            font-weight: 700;
            margin: 0 0 0.5em 0;
            color: #111827;
          }
          
          .contact {
            font-size: 8pt;
            color: #374151;
            line-height: 1.4;
          }
          
          /* SINGLE COLUMN LAYOUT */
          .content {
            max-width: 100%;
          }
          
          /* SECTION HEADERS */
          h2 {
            font-size: 8pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            border-bottom: 1px solid #1f2937;
            padding-bottom: 0.15em;
            margin-bottom: 0.75em;
            color: #111827;
          }
          
          section {
            margin-bottom: 1.2em;
          }
          
          /* EDUCATION SECTION */
          .edu-entry {
            margin-bottom: 1em;
          }
          
          .edu-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 0.2em;
          }
          
          .edu-left {
            flex: 1;
          }
          
          .edu-institution {
            font-weight: 700;
            font-size: 10pt;
            color: #111827;
          }
          
          .edu-location {
            font-size: 8pt;
            color: #6b7280;
            margin-top: 0.15em;
          }
          
          .edu-right {
            text-align: right;
            font-size: 8pt;
            color: #6b7280;
            margin-left: 1em;
            width: 80px;
          }
          
          .edu-degree {
            font-style: italic;
            color: #374151;
            margin-top: 0.15em;
            font-size: 8pt;
          }
          
          .edu-highlights {
            margin-top: 0.3em;
            padding-left: 1.2em;
            list-style-type: disc;
          }
          
          .edu-highlights li {
            margin-bottom: 0.2em;
            color: #374151;
            font-size: 8pt;
          }
          
          /* WORK EXPERIENCE SECTION */
          .exp-entry {
            margin-bottom: 1em;
          }
          
          .exp-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 0.2em;
          }
          
          .exp-left {
            flex: 1;
          }
          
          .exp-title {
            font-weight: 700;
            font-size: 10pt;
            color: #111827;
          }
          
          .exp-company-location {
            display: flex;
            align-items: center;
            gap: 0.5em;
            margin-top: 0.15em;
            font-size: 8pt;
          }
          
          .exp-company {
            font-weight: 600;
            color: #374151;
          }
          
          .exp-location {
            color: #6b7280;
          }
          
          .exp-right {
            text-align: right;
            font-size: 8pt;
            color: #6b7280;
            margin-left: 1em;
            width: 80px;
          }
          
          .exp-dates {
            margin-top: 0.1em;
          }
          
          .exp-achievements {
            margin-top: 0.4em;
            padding-left: 1.2em;
            list-style-type: disc;
          }
          
          .exp-achievements li {
            margin-bottom: 0.25em;
            font-size: 8pt;
            color: #374151;
            line-height: 1.4;
          }
          
          /* PROJECTS SECTION */
          .project-entry {
            margin-bottom: 1em;
          }
          
          .project-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 0.2em;
          }
          
          .project-left {
            flex: 1;
          }
          
          .project-name {
            font-weight: 600;
            font-size: 10pt;
            color: #111827;
          }
          
          .project-url {
            font-size: 8pt;
            color: #2563eb;
            margin-top: 0.15em;
          }
          
          .project-right {
            text-align: right;
            font-size: 8pt;
            color: #6b7280;
            margin-left: 1em;
            width: 80px;
          }
          
          .project-descriptions {
            margin-top: 0.4em;
            padding-left: 1.2em;
            list-style-type: disc;
          }
          
          .project-descriptions li {
            margin-bottom: 0.25em;
            font-size: 8pt;
            color: #374151;
            line-height: 1.4;
          }
          
          /* TECHNICAL SKILLS SECTION */
          .skills-entry {
            font-size: 8pt;
            margin-bottom: 0.4em;
            line-height: 1.5;
          }
          
          .skills-entry strong {
            font-weight: 600;
            color: #111827;
          }
          
          .skills-entry span {
            color: #374151;
          }
          
          /* Support for rich text formatting */
          strong, b {
            font-weight: 600;
          }
          
          em, i {
            font-style: italic;
          }
          
          u {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <!-- HEADER -->
        <div class="header">
          <h1>${personal?.name || "YOUR NAME"}</h1>
          <div class="contact">${contactLine}</div>
        </div>

        <!-- SINGLE COLUMN CONTENT -->
        <div class="content">
          <!-- EDUCATION -->
          ${education && education.length > 0 ? `
            <section>
              <h2>EDUCATION</h2>
              ${education.map(edu => `
                <div class="edu-entry">
                  <div class="edu-header">
                    <div class="edu-left">
                      <div class="edu-institution">${edu.institution || ""}</div>
                      ${edu.location ? `<div class="edu-location">${edu.location}</div>` : ""}
                    </div>
                    ${(edu.startDate || edu.endDate) ? `
                      <div class="edu-right">
                        ${edu.startDate || ""} – ${edu.endDate || "Present"}
                      </div>
                    ` : ""}
                  </div>
                  ${edu.degree ? `<div class="edu-degree">${edu.degree}</div>` : ""}
                  ${edu.highlights && edu.highlights.length > 0 ? `
                    <ul class="edu-highlights">
                      ${edu.highlights.map(h => `<li>${h}</li>`).join("")}
                    </ul>
                  ` : ""}
                </div>
              `).join("")}
            </section>
          ` : ""}

          <!-- EXPERIENCE -->
          ${workExperience && workExperience.length > 0 ? `
            <section>
              <h2>EXPERIENCE</h2>
              ${workExperience.map(exp => `
                <div class="exp-entry">
                  <div class="exp-header">
                    <div class="exp-left">
                      <div class="exp-title">${exp.title || ""}</div>
                      <div class="exp-company-location">
                        ${exp.company ? `<span class="exp-company">${exp.company}</span>` : ""}
                        ${exp.location ? `<span class="exp-location">• ${exp.location}</span>` : ""}
                      </div>
                    </div>
                    ${(exp.startDate || exp.endDate) ? `
                      <div class="exp-right">
                        ${exp.startDate || ""} – ${exp.endDate || "Present"}
                      </div>
                    ` : ""}
                  </div>
                  ${exp.achievements && exp.achievements.length > 0 ? `
                    <ul class="exp-achievements">
                      ${exp.achievements.map(a => `<li>${a}</li>`).join("")}
                    </ul>
                  ` : ""}
                </div>
              `).join("")}
            </section>
          ` : ""}

          <!-- PROJECTS -->
          ${projects && projects.length > 0 ? `
            <section>
              <h2>PROJECTS</h2>
              ${projects.map(project => `
                <div class="project-entry">
                  <div class="project-header">
                    <div class="project-left">
                      <div class="project-name">${project.name || ""}</div>
                      ${project.url ? `<div class="project-url">${formatUrl(project.url)}</div>` : ""}
                    </div>
                    ${(project.startDate || project.endDate) ? `
                      <div class="project-right">
                        ${project.startDate || ""} – ${project.endDate || "Present"}
                      </div>
                    ` : ""}
                  </div>
                  ${project.description && project.description.length > 0 ? `
                    <ul class="project-descriptions">
                      ${project.description.map(d => `<li>${d}</li>`).join("")}
                    </ul>
                  ` : ""}
                </div>
              `).join("")}
            </section>
          ` : ""}

          <!-- TECHNICAL SKILLS -->
          ${(languages.length > 0 || frameworksAndLibraries.length > 0 || tools.length > 0) ? `
            <section>
              <h2>TECHNICAL SKILLS</h2>
              ${languages.length > 0 ? `
                <div class="skills-entry">
                  <strong>Languages:</strong>
                  <span> ${languages.join(", ")}</span>
                </div>
              ` : ""}
              ${frameworksAndLibraries.length > 0 ? `
                <div class="skills-entry">
                  <strong>Frameworks:</strong>
                  <span> ${frameworksAndLibraries.join(", ")}</span>
                </div>
              ` : ""}
              ${tools.length > 0 ? `
                <div class="skills-entry">
                  <strong>Developer Tools:</strong>
                  <span> ${tools.join(", ")}</span>
                </div>
              ` : ""}
              ${skills && Object.entries(skills).map(([category, items]) => {
                if (!items || items.length === 0) return "";
                if (['programmingLanguages', 'technologies', 'tools'].includes(category)) {
                  return "";
                }
                
                const formattedCategory = category
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())
                  .trim();
                
                return `
                  <div class="skills-entry">
                    <strong>${formattedCategory}:</strong>
                    <span> ${items.join(", ")}</span>
                  </div>
                `;
              }).join("")}
            </section>
          ` : ""}
        </div>
      </body>
    </html>
  `;
}

const DACH_PURPLE = "#7c3aed";
const DACH_EXCLUDE_SKILLS = ["spokenLanguages", "hobbies"];

function generateDACHResumeHTML(
  resumeData: ResumeData,
  headshotBase64?: string | null
): string {
  const { personal, education, workExperience, projects, skills } = resumeData;

  const formatUrl = (url: string): string => {
    if (!url) return "";
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
  };

  const currentRole = workExperience?.[0]?.title || "";
  const mainSkills = skills
    ? Object.entries(skills).filter(
        ([cat]) => !DACH_EXCLUDE_SKILLS.includes(cat) && skills[cat]?.length
      )
    : [];
  const spokenLanguages = skills?.spokenLanguages || [];
  const hobbies = skills?.hobbies || [];

  const headshotImg = headshotBase64
    ? `<img src="data:image/jpeg;base64,${headshotBase64}" alt="" class="dach-headshot-img" />`
    : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { size: A4; margin: 0; }
          body {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 8mm 10mm;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 9pt;
            line-height: 1.3;
            color: #111827;
            background: white;
          }
          .dach-header { display: flex; align-items: center; gap: 1.2em; margin-bottom: 1em; }
          .dach-headshot-wrap { position: relative; flex-shrink: 0; }
          .dach-headshot-shape {
            position: absolute;
            left: -2px;
            top: -2px;
            width: 92px;
            height: 92px;
            background: ${DACH_PURPLE};
            clip-path: polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 0);
          }
          .dach-headshot-box {
            position: relative;
            margin-left: 10px;
            margin-top: 10px;
            width: 72px;
            height: 72px;
            overflow: hidden;
            border: 2px solid white;
            border-radius: 2px;
            background: #e2e8f0;
          }
          .dach-headshot-img { width: 100%; height: 100%; object-fit: cover; }
          .dach-header-text {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            min-height: 84px;
          }
          .dach-header-text-inner { text-align: left; }
          .dach-role { font-size: 7pt; color: #64748b; margin-bottom: 0.2em; }
          .dach-name { font-size: 14pt; font-weight: 700; color: #111827; margin-bottom: 0.4em; }
          .dach-contact { font-size: 7pt; color: #374151; display: flex; flex-direction: column; gap: 0.2em; }
          .dach-contact span { display: flex; align-items: center; gap: 0.4em; }
          .dach-contact .dach-icon { width: 10px; height: 10px; flex-shrink: 0; display: inline-block; vertical-align: middle; }
          .dach-contact .dach-icon svg { width: 100%; height: 100%; stroke: ${DACH_PURPLE}; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; fill: none; }
          .dach-grid { display: grid; grid-template-columns: 65% 35%; gap: 1em; }
          .dach-main { padding-right: 0.5em; }
          .dach-sidebar { padding-left: 0.3em; }
          .dach-h2 {
            font-size: 7pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            border-bottom: 2px solid ${DACH_PURPLE};
            padding-bottom: 0.15em;
            margin-bottom: 0.6em;
            color: #111827;
          }
          .dach-exp-row { display: flex; gap: 0.6em; margin-bottom: 0.7em; }
          .dach-exp-dates { width: 4.5em; flex-shrink: 0; font-size: 7pt; color: #64748b; }
          .dach-exp-content { flex: 1; min-width: 0; }
          .dach-exp-title { font-weight: 700; font-size: 9pt; color: #111827; }
          .dach-exp-company { font-size: 8pt; color: #64748b; }
          .dach-exp-ul { margin-top: 0.3em; padding-left: 1em; list-style-type: disc; }
          .dach-exp-ul li { margin-bottom: 0.15em; font-size: 8pt; color: #374151; line-height: 1.35; }
          .dach-edu-row { display: flex; gap: 0.6em; margin-bottom: 0.7em; }
          .dach-edu-dates { width: 4.5em; flex-shrink: 0; font-size: 7pt; color: #64748b; }
          .dach-edu-content { flex: 1; min-width: 0; }
          .dach-edu-inst { font-weight: 700; font-size: 9pt; color: #111827; }
          .dach-edu-degree { font-size: 8pt; font-style: italic; color: #374151; }
          .dach-edu-ul { margin-top: 0.3em; padding-left: 1em; list-style-type: disc; }
          .dach-edu-ul li { margin-bottom: 0.15em; font-size: 8pt; color: #374151; }
          .dach-project { margin-bottom: 0.6em; }
          .dach-project-name { font-weight: 600; font-size: 9pt; color: #111827; }
          .dach-project-role { font-size: 8pt; font-style: italic; color: #64748b; }
          .dach-project-url { font-size: 7pt; color: #2563eb; margin-top: 0.15em; }
          .dach-project-ul { margin-top: 0.25em; padding-left: 1em; list-style-type: disc; }
          .dach-project-ul li { margin-bottom: 0.1em; font-size: 8pt; color: #374151; }
          .dach-skill-ul { list-style: none; padding: 0; margin: 0; }
          .dach-skill-ul li {
            display: flex;
            align-items: center;
            gap: 0.4em;
            margin-bottom: 0.25em;
            font-size: 8pt;
            color: #374151;
          }
          .dach-skill-ul li::before {
            content: "";
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: ${DACH_PURPLE};
            flex-shrink: 0;
          }
          section { margin-bottom: 1em; }
          strong, b { font-weight: 600; }
          em, i { font-style: italic; }
          u { text-decoration: underline; }
        </style>
      </head>
      <body>
        <header class="dach-header">
          <div class="dach-headshot-wrap">
            <div class="dach-headshot-shape" aria-hidden="true"></div>
            <div class="dach-headshot-box">
              ${headshotImg || '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:7pt;color:#94a3b8;">Foto</div>'}
            </div>
          </div>
          <div class="dach-header-text">
            <div class="dach-header-text-inner">
            ${currentRole ? `<div class="dach-role">${currentRole}</div>` : ""}
            <h1 class="dach-name">${personal?.name || "YOUR NAME"}</h1>
            <div class="dach-contact">
              ${personal?.phone ? `<span><span class="dach-icon"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span> ${personal.phone}</span>` : ""}
              ${personal?.email ? `<span><span class="dach-icon"><svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg></span> ${personal.email}</span>` : ""}
              ${personal?.location ? `<span><span class="dach-icon"><svg viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span> ${personal.location}</span>` : ""}
            </div>
            </div>
          </div>
        </header>

        <div class="dach-grid">
          <div class="dach-main">
            ${workExperience && workExperience.length > 0 ? `
              <section>
                <h2 class="dach-h2">Berufserfahrung</h2>
                ${workExperience.map((exp) => `
                  <div class="dach-exp-row">
                    <div class="dach-exp-dates">${exp.startDate || ""} – ${exp.endDate || "Present"}</div>
                    <div class="dach-exp-content">
                      <div class="dach-exp-title">${exp.title || ""}</div>
                      <div class="dach-exp-company">${exp.company || ""}</div>
                      ${exp.achievements && exp.achievements.length > 0 ? `
                        <ul class="dach-exp-ul">
                          ${exp.achievements.map((a) => `<li>${a}</li>`).join("")}
                        </ul>
                      ` : ""}
                    </div>
                  </div>
                `).join("")}
              </section>
            ` : ""}

            ${education && education.length > 0 ? `
              <section>
                <h2 class="dach-h2">Ausbildung</h2>
                ${education.map((edu) => `
                  <div class="dach-edu-row">
                    <div class="dach-edu-dates">${edu.startDate || ""} – ${edu.endDate || ""}</div>
                    <div class="dach-edu-content">
                      <div class="dach-edu-inst">${edu.institution || ""}</div>
                      ${edu.degree ? `<div class="dach-edu-degree">${edu.degree}</div>` : ""}
                      ${edu.highlights && edu.highlights.length > 0 ? `
                        <ul class="dach-edu-ul">
                          ${edu.highlights.map((h) => `<li>${h}</li>`).join("")}
                        </ul>
                      ` : ""}
                    </div>
                  </div>
                `).join("")}
              </section>
            ` : ""}

            ${projects && projects.length > 0 ? `
              <section>
                <h2 class="dach-h2">Projekte</h2>
                ${projects.map((p) => `
                  <div class="dach-project">
                    <div class="dach-project-name">${p.name || ""}</div>
                    ${p.role ? `<div class="dach-project-role">${p.role}</div>` : ""}
                    ${p.url ? `<div class="dach-project-url">${formatUrl(p.url)}</div>` : ""}
                    ${p.description && p.description.length > 0 ? `
                      <ul class="dach-project-ul">
                        ${p.description.map((d) => `<li>${d}</li>`).join("")}
                      </ul>
                    ` : ""}
                  </div>
                `).join("")}
              </section>
            ` : ""}
          </div>

          <aside class="dach-sidebar">
            ${mainSkills.length > 0 ? `
              <section>
                <h2 class="dach-h2">Kenntnisse</h2>
                <ul class="dach-skill-ul">
                  ${mainSkills.flatMap(([, items]) => (items || []).map((item) => `<li>${item}</li>`)).join("")}
                </ul>
              </section>
            ` : ""}

            ${spokenLanguages.length > 0 ? `
              <section>
                <h2 class="dach-h2">Sprachen</h2>
                <ul class="dach-skill-ul">
                  ${spokenLanguages.map((l) => `<li>${l}</li>`).join("")}
                </ul>
              </section>
            ` : ""}

            ${hobbies.length > 0 ? `
              <section>
                <h2 class="dach-h2">Hobbys & Interessen</h2>
                <ul class="dach-skill-ul">
                  ${hobbies.map((h) => `<li>${h}</li>`).join("")}
                </ul>
              </section>
            ` : ""}
          </aside>
        </div>
      </body>
    </html>
  `;
}

const EU_ACCENT = "#1e293b";
const EU_EXCLUDE_SKILLS = ["spokenLanguages", "hobbies"];

function generateEuropeanResumeHTML(
  resumeData: ResumeData,
  headshotBase64?: string | null
): string {
  const { personal, education, workExperience, projects, skills } = resumeData;

  const formatUrl = (url: string): string => {
    if (!url) return "";
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
  };

  const currentRole = workExperience?.[0]?.title || "";
  const mainSkills = skills
    ? Object.entries(skills).filter(
        ([cat]) => !EU_EXCLUDE_SKILLS.includes(cat) && skills[cat]?.length
      )
    : [];
  const spokenLanguages = skills?.spokenLanguages || [];
  const hobbies = skills?.hobbies || [];

  const headshotImg = headshotBase64
    ? `<img src="data:image/jpeg;base64,${headshotBase64}" alt="" class="eu-headshot-img" />`
    : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { size: A4; margin: 0; }
          body {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 8mm 10mm;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 9pt;
            line-height: 1.3;
            color: #111827;
            background: white;
          }
          .eu-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1em;
            margin-bottom: 1em;
            padding-bottom: 0.75em;
            border-bottom: 1px solid ${EU_ACCENT};
          }
          .eu-header-text { flex: 1; min-width: 0; }
          .eu-role { font-size: 7pt; color: #64748b; margin-bottom: 0.2em; }
          .eu-name { font-size: 16pt; font-weight: 700; color: #0f172a; margin-bottom: 0.4em; }
          .eu-contact { font-size: 7pt; color: #374151; display: flex; flex-direction: column; gap: 0.2em; }
          .eu-contact span { display: flex; align-items: center; gap: 0.4em; }
          .eu-contact .eu-icon { width: 10px; height: 10px; flex-shrink: 0; display: inline-block; vertical-align: middle; }
          .eu-contact .eu-icon svg { width: 100%; height: 100%; stroke: ${EU_ACCENT}; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; fill: none; }
          .eu-headshot-wrap { flex-shrink: 0; }
          .eu-headshot-box {
            width: 96px;
            height: 96px;
            overflow: hidden;
            border: 1px solid #cbd5e1;
            border-radius: 2px;
            background: #e2e8f0;
          }
          .eu-headshot-img { width: 100%; height: 100%; object-fit: cover; }
          .eu-grid { display: grid; grid-template-columns: 32% 68%; gap: 1em; }
          .eu-sidebar { padding-right: 0.5em; }
          .eu-main { padding-left: 0.5em; }
          .eu-h2 {
            font-size: 7pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            border-bottom: 2px solid ${EU_ACCENT};
            padding-bottom: 0.15em;
            margin-bottom: 0.6em;
            color: #0f172a;
          }
          .eu-exp-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 0.75em;
            margin-bottom: 0.7em;
          }
          .eu-exp-content { flex: 1; min-width: 0; }
          .eu-exp-title { font-weight: 700; font-size: 9pt; color: #111827; }
          .eu-exp-company { font-size: 8pt; color: #64748b; }
          .eu-exp-dates { flex-shrink: 0; width: 5em; text-align: right; font-size: 7pt; color: #64748b; }
          .eu-exp-ul { margin-top: 0.3em; padding-left: 1em; list-style-type: disc; }
          .eu-exp-ul li { margin-bottom: 0.15em; font-size: 8pt; color: #374151; line-height: 1.35; }
          .eu-edu-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 0.75em;
            margin-bottom: 0.7em;
          }
          .eu-edu-content { flex: 1; min-width: 0; }
          .eu-edu-inst { font-weight: 700; font-size: 9pt; color: #111827; }
          .eu-edu-degree { font-size: 8pt; font-style: italic; color: #374151; }
          .eu-edu-dates { flex-shrink: 0; width: 5em; text-align: right; font-size: 7pt; color: #64748b; }
          .eu-edu-ul { margin-top: 0.3em; padding-left: 1em; list-style-type: disc; }
          .eu-edu-ul li { margin-bottom: 0.15em; font-size: 8pt; color: #374151; }
          .eu-project { margin-bottom: 0.6em; }
          .eu-project-name { font-weight: 600; font-size: 9pt; color: #111827; }
          .eu-project-role { font-size: 8pt; font-style: italic; color: #64748b; }
          .eu-project-url { font-size: 7pt; color: #2563eb; margin-top: 0.15em; }
          .eu-project-ul { margin-top: 0.25em; padding-left: 1em; list-style-type: disc; }
          .eu-project-ul li { margin-bottom: 0.1em; font-size: 8pt; color: #374151; }
          .eu-skill-ul { list-style: none; padding: 0; margin: 0; }
          .eu-skill-ul li {
            display: flex;
            align-items: flex-start;
            gap: 0.4em;
            margin-bottom: 0.25em;
            font-size: 8pt;
            color: #374151;
          }
          .eu-skill-ul li::before {
            content: "";
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: ${EU_ACCENT};
            flex-shrink: 0;
            margin-top: 0.35em;
          }
          section { margin-bottom: 1em; }
          strong, b { font-weight: 600; }
          em, i { font-style: italic; }
          u { text-decoration: underline; }
        </style>
      </head>
      <body>
        <header class="eu-header">
          <div class="eu-header-text">
            ${currentRole ? `<div class="eu-role">${currentRole}</div>` : ""}
            <h1 class="eu-name">${personal?.name || "YOUR NAME"}</h1>
            <div class="eu-contact">
              ${personal?.phone ? `<span><span class="eu-icon"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span> ${personal.phone}</span>` : ""}
              ${personal?.email ? `<span><span class="eu-icon"><svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg></span> ${personal.email}</span>` : ""}
              ${personal?.location ? `<span><span class="eu-icon"><svg viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span> ${personal.location}</span>` : ""}
              ${personal?.linkedin ? `<span><span class="eu-icon"><svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></span> ${formatUrl(personal.linkedin)}</span>` : ""}
            </div>
          </div>
          <div class="eu-headshot-wrap">
            <div class="eu-headshot-box">
              ${headshotImg || '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:7pt;color:#94a3b8;">Photo</div>'}
            </div>
          </div>
        </header>

        <div class="eu-grid">
          <aside class="eu-sidebar">
            ${mainSkills.length > 0 ? `
              <section>
                <h2 class="eu-h2">Skills</h2>
                <ul class="eu-skill-ul">
                  ${mainSkills.flatMap(([, items]) => (items || []).map((item) => `<li>${item}</li>`)).join("")}
                </ul>
              </section>
            ` : ""}

            ${spokenLanguages.length > 0 ? `
              <section>
                <h2 class="eu-h2">Languages</h2>
                <ul class="eu-skill-ul">
                  ${spokenLanguages.map((l) => `<li>${l}</li>`).join("")}
                </ul>
              </section>
            ` : ""}

            ${hobbies.length > 0 ? `
              <section>
                <h2 class="eu-h2">Interests</h2>
                <ul class="eu-skill-ul">
                  ${hobbies.map((h) => `<li>${h}</li>`).join("")}
                </ul>
              </section>
            ` : ""}
          </aside>

          <main class="eu-main">
            ${workExperience && workExperience.length > 0 ? `
              <section>
                <h2 class="eu-h2">Work experience</h2>
                ${workExperience.map((exp) => `
                  <div class="eu-exp-row">
                    <div class="eu-exp-content">
                      <div class="eu-exp-title">${exp.title || ""}</div>
                      <div class="eu-exp-company">${exp.company || ""}</div>
                      ${exp.achievements && exp.achievements.length > 0 ? `
                        <ul class="eu-exp-ul">
                          ${exp.achievements.map((a) => `<li>${a}</li>`).join("")}
                        </ul>
                      ` : ""}
                    </div>
                    <div class="eu-exp-dates">${exp.startDate || ""} – ${exp.endDate || "Present"}</div>
                  </div>
                `).join("")}
              </section>
            ` : ""}

            ${education && education.length > 0 ? `
              <section>
                <h2 class="eu-h2">Education</h2>
                ${education.map((edu) => `
                  <div class="eu-edu-row">
                    <div class="eu-edu-content">
                      <div class="eu-edu-inst">${edu.institution || ""}</div>
                      ${edu.degree ? `<div class="eu-edu-degree">${edu.degree}</div>` : ""}
                      ${edu.highlights && edu.highlights.length > 0 ? `
                        <ul class="eu-edu-ul">
                          ${edu.highlights.map((h) => `<li>${h}</li>`).join("")}
                        </ul>
                      ` : ""}
                    </div>
                    <div class="eu-edu-dates">${edu.startDate || ""} – ${edu.endDate || ""}</div>
                  </div>
                `).join("")}
              </section>
            ` : ""}

            ${projects && projects.length > 0 ? `
              <section>
                <h2 class="eu-h2">Projects</h2>
                ${projects.map((p) => `
                  <div class="eu-project">
                    <div class="eu-project-name">${p.name || ""}</div>
                    ${p.role ? `<div class="eu-project-role">${p.role}</div>` : ""}
                    ${p.url ? `<div class="eu-project-url">${formatUrl(p.url)}</div>` : ""}
                    ${p.description && p.description.length > 0 ? `
                      <ul class="eu-project-ul">
                        ${p.description.map((d) => `<li>${d}</li>`).join("")}
                      </ul>
                    ` : ""}
                  </div>
                `).join("")}
              </section>
            ` : ""}
          </main>
        </div>
      </body>
    </html>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { resumeData, layout = "modern" } = body;

    if (!resumeData) {
      return NextResponse.json(
        { error: "Missing resume data" },
        { status: 400 }
      );
    }

    let html: string;
    if (layout === "dach") {
      const headshotBase64 = await getHeadshotBase64FromSession();
      html = generateDACHResumeHTML(resumeData, headshotBase64);
    } else if (layout === "european") {
      const headshotBase64 = await getHeadshotBase64FromSession();
      html = generateEuropeanResumeHTML(resumeData, headshotBase64);
    } else if (layout === "classic") {
      html = generateClassicResumeHTML(resumeData);
    } else {
      html = generateModernResumeHTML(resumeData);
    }

    // Launch Puppeteer with appropriate settings
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();

    // Set content and wait for it to render
    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    // Generate PDF with ATS-friendly settings
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      preferCSSPageSize: false,
      displayHeaderFooter: false,
      // Ensure text is selectable and searchable (ATS-friendly)
      tagged: true,
      outline: false,
    });

    await browser.close();

    // Generate filename based on name
    const name = resumeData.personal?.name || "Resume";
    const filename = `${name.replace(/[^a-z0-9]/gi, '_')}_Resume.pdf`;

    // Return PDF as response
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
