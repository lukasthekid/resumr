import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import type { CoverLetterUser, CoverLetterJob } from "@/types/coverLetter";

type PDFRequest = {
  user: CoverLetterUser;
  job: CoverLetterJob;
  todayDate: string;
  bodyHtml: string;
};

// Helper function to generate Classic layout HTML
function generateClassicHTML(
  user: PDFRequest["user"],
  job: PDFRequest["job"],
  todayDate: string,
  bodyHtml: string
): string {
  const contactItems = [user.email, user.phoneNumber, user.streetAddress].filter(Boolean);
  const userContactLine = contactItems.join(" • ");

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
            padding: 25.4mm;
            font-family: Arial, Calibri, sans-serif;
            font-size: 11pt;
            line-height: 1.3;
            color: #000;
            background: white;
          }
          
          .header {
            margin-bottom: 2em;
            padding-bottom: 1em;
            border-bottom: 2px solid #1f2937;
            text-align: center;
          }
          
          .user-name {
            font-weight: 700;
            font-size: 24pt;
            margin-bottom: 0.5em;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #111827;
          }
          
          .user-contact {
            font-size: 9pt;
            color: #4b5563;
            margin-bottom: 0;
          }
          
          .metadata-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2em;
          }
          
          .recipient {
            flex: 1;
          }
          
          .recipient-label {
            font-size: 8pt;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #9ca3af;
            font-weight: 700;
            margin-bottom: 0.25em;
          }
          
          .company-name {
            font-weight: 700;
            font-size: 10.5pt;
            color: #111827;
            margin-bottom: 0.25em;
          }
          
          .company-location {
            font-size: 9pt;
            color: #4b5563;
          }
          
          .date {
            text-align: right;
            font-size: 10.5pt;
            font-weight: 500;
            color: #111827;
          }
          
          .subject-box {
            width: 100%;
            background-color: #f9fafb;
            padding: 0.5em;
            border-radius: 4px;
            border-left: 4px solid #1f2937;
            margin-bottom: 1.5em;
          }
          
          .subject {
            font-weight: 700;
            font-size: 10.5pt;
            color: #1f2937;
          }
          
          .body p {
            margin-bottom: 1em;
            text-align: left;
          }
          
          .body p:last-child {
            margin-bottom: 0;
          }
          
          .body strong {
            font-weight: 600;
          }
          
          .body em {
            font-style: italic;
          }
          
          .body u {
            text-decoration: underline;
          }
          
          .body ul {
            margin-left: 1.5em;
            margin-bottom: 1em;
            list-style-type: disc;
          }
          
          .body ol {
            margin-left: 1.5em;
            margin-bottom: 1em;
            list-style-type: decimal;
          }
          
          .body li {
            margin-bottom: 0.25em;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="user-name">${user.name || "YOUR NAME"}</div>
          <div class="user-contact">${userContactLine}</div>
        </div>
        
        <div class="metadata-section">
          <div class="recipient">
            <div class="recipient-label">TO:</div>
            <div class="company-name">${job.companyName}</div>
            ${job.locationCity || job.country ? `<div class="company-location">${[job.locationCity, job.country].filter(Boolean).join(", ")}</div>` : ""}
          </div>
          <div class="date">${todayDate}</div>
        </div>
        
        <div class="subject-box">
          <div class="subject">Re: ${job.jobTitle}</div>
        </div>
        
        <div class="body">
          ${bodyHtml}
        </div>
      </body>
    </html>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const body: PDFRequest = await req.json();
    const { user, job, todayDate, bodyHtml } = body;

    if (!user || !job || !bodyHtml) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate the HTML
    const html = generateClassicHTML(user, job, todayDate, bodyHtml);

    // Launch Puppeteer with appropriate settings
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
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

    // Generate filename based on job and company
    const filename = `${job.companyName.replace(/[^a-z0-9]/gi, "_")}_${job.jobTitle.replace(/[^a-z0-9]/gi, "_")}_Cover_Letter.pdf`;

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
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
