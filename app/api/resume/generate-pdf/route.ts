import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import type { ResumeData } from "@/types/resume";

type RequestBody = {
  resumeData: ResumeData;
  layout?: "modern" | "classic";
};

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

    // Generate the complete HTML based on layout
    const html = layout === "classic" 
      ? generateClassicResumeHTML(resumeData)
      : generateModernResumeHTML(resumeData);

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
