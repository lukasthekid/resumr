import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

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
    [key: string]: string[] | undefined;
  };
  extracurriculars?: Array<{
    activity?: string;
    startDate?: string;
    endDate?: string;
    description?: string[];
  }>;
};

type RequestBody = {
  resumeData: ResumeData;
};

function generateResumeHTML(resumeData: ResumeData): string {
  const { personal, education, workExperience, projects, skills, extracurriculars } = resumeData;

  // Build contact line
  const contactParts = [
    personal?.phone,
    personal?.email,
    personal?.linkedin,
    personal?.github,
    personal?.website,
  ].filter(Boolean);

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
            padding: 10mm 10mm 10mm 10mm;
            font-family: Arial, Calibri, sans-serif;
            font-size: 10pt;
            line-height: 1.2;
            color: #000;
            background: white;
          }
          
          .header {
            margin-bottom: 0.6em;
            text-align: center;
          }
          
          .header h1 {
            font-size: 20pt;
            font-weight: 700;
            margin: 0 0 0.25em 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .contact {
            font-size: 9pt;
            color: #333;
          }
          
          section {
            margin-bottom: 0.75em;
          }
          
          h2 {
            font-size: 11pt;
            font-weight: 700;
            border-bottom: 1px solid #000;
            padding-bottom: 0.15em;
            margin-bottom: 0.5em;
          }
          
          .entry {
            margin-bottom: 0.6em;
          }
          
          .entry-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.2em;
          }
          
          .entry-title {
            font-weight: 600;
          }
          
          .entry-subtitle {
            font-style: italic;
            font-size: 9.5pt;
          }
          
          .entry-right {
            text-align: right;
            font-size: 9.5pt;
          }
          
          ul {
            margin: 0.25em 0 0 1.2em;
            padding: 0;
            list-style-type: disc;
          }
          
          li {
            margin-bottom: 0.15em;
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
          
          .skills-entry {
            display: block;
            margin-bottom: 0.3em;
            line-height: 1.5;
          }
          
          .skills-entry strong {
            font-weight: 600;
          }
          
          .project-header {
            margin-bottom: 0.2em;
          }
          
          .project-name {
            font-weight: 600;
          }
          
          .project-role {
            font-style: italic;
          }
          
          .project-url {
            font-size: 9pt;
            color: #0066cc;
          }
        </style>
      </head>
      <body>
        <!-- HEADER -->
        <div class="header">
          <h1>${personal?.name || "YOUR NAME"}</h1>
          <div class="contact">${contactParts.join(" | ")}</div>
        </div>

        <!-- EDUCATION -->
        ${education && education.length > 0 ? `
          <section>
            <h2>Education</h2>
            ${education.map(edu => `
              <div class="entry">
                <div class="entry-header">
                  <div>
                    <div class="entry-title">${edu.institution || ""}</div>
                    ${edu.degree ? `<div class="entry-subtitle">${edu.degree}</div>` : ""}
                  </div>
                  <div class="entry-right">
                    ${edu.location ? `<div>${edu.location}</div>` : ""}
                    ${edu.startDate || edu.endDate ? `<div>${edu.startDate || ""} – ${edu.endDate || "Present"}</div>` : ""}
                  </div>
                </div>
                ${edu.highlights && edu.highlights.length > 0 ? `
                  <ul>
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
            <h2>Experience</h2>
            ${workExperience.map(exp => `
              <div class="entry">
                <div class="entry-header">
                  <div>
                    <div class="entry-title">${exp.title || ""}</div>
                    ${exp.company ? `<div class="entry-subtitle">${exp.company}</div>` : ""}
                  </div>
                  <div class="entry-right">
                    ${exp.location ? `<div>${exp.location}</div>` : ""}
                    ${exp.startDate || exp.endDate ? `<div>${exp.startDate || ""} – ${exp.endDate || "Present"}</div>` : ""}
                  </div>
                </div>
                ${exp.achievements && exp.achievements.length > 0 ? `
                  <ul>
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
            <h2>Projects</h2>
            ${projects.map(project => `
              <div class="entry">
                <div class="project-header">
                  <span class="project-name">${project.name || ""}</span>
                  ${project.role ? `<span class="project-role"> (${project.role})</span>` : ""}
                  ${project.url ? `<span class="project-url"> | ${project.url}</span>` : ""}
                </div>
                ${project.description && project.description.length > 0 ? `
                  <ul>
                    ${project.description.map(d => `<li>${d}</li>`).join("")}
                  </ul>
                ` : ""}
              </div>
            `).join("")}
          </section>
        ` : ""}

        <!-- SKILLS -->
        ${skills && Object.keys(skills).length > 0 ? `
          <section>
            <h2>Skills</h2>
            ${Object.entries(skills).map(([category, items]) => {
              if (!items || items.length === 0) return "";
              
              const formattedCategory = category
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();
              
              return `
                <div class="skills-entry">
                  <strong>${formattedCategory}:</strong> ${items.join(", ")}
                </div>
              `;
            }).join("")}
          </section>
        ` : ""}

        <!-- EXTRACURRICULARS -->
        ${extracurriculars && extracurriculars.length > 0 ? `
          <section>
            <h2>Extracurricular Activities</h2>
            ${extracurriculars.map(activity => `
              <div class="entry">
                <div class="entry-header">
                  <div class="entry-title">${activity.activity || ""}</div>
                  ${activity.startDate || activity.endDate ? `
                    <div class="entry-right">
                      ${activity.startDate || ""} – ${activity.endDate || "Present"}
                    </div>
                  ` : ""}
                </div>
                ${activity.description && activity.description.length > 0 ? `
                  <ul>
                    ${activity.description.map(d => `<li>${d}</li>`).join("")}
                  </ul>
                ` : ""}
              </div>
            `).join("")}
          </section>
        ` : ""}
      </body>
    </html>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { resumeData } = body;

    if (!resumeData) {
      return NextResponse.json(
        { error: "Missing resume data" },
        { status: 400 }
      );
    }

    // Generate the complete HTML
    const html = generateResumeHTML(resumeData);

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
