import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

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

type RequestBody = {
  layout: "classic" | "sidebar";
  user: User;
  job: Job;
  todayDate: string;
  bodyHtml: string;
};

// Helper function to generate Classic layout HTML
function generateClassicHTML(user: User, job: Job, todayDate: string, bodyHtml: string): string {
  const userContactLine = [
    user.streetAddress,
    user.email,
    user.phoneNumber,
  ]
    .filter(Boolean)
    .join(" • ");

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
            margin-bottom: 1em;
          }
          
          .user-name {
            font-weight: 600;
            font-size: 14pt;
            margin-bottom: 0.25em;
            text-transform: uppercase;
          }
          
          .user-contact {
            font-size: 9pt;
            color: #555;
            margin-bottom: 1em;
          }
          
          .date {
            font-size: 10pt;
            margin-bottom: 1em;
          }
          
          .company-info {
            margin-bottom: 1em;
          }
          
          .company-name {
            font-weight: 600;
          }
          
          .company-location {
            font-size: 10pt;
            color: #555;
          }
          
          .subject {
            font-weight: 600;
            margin-bottom: 1em;
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
          <div class="date">${todayDate}</div>
          <div class="company-info">
            <div class="company-name">${job.companyName}</div>
            ${job.locationCity ? `<div class="company-location">${[job.locationCity, job.country].filter(Boolean).join(", ")}</div>` : ""}
          </div>
          <div class="subject">Re: Application for ${job.jobTitle}</div>
        </div>
        <div class="body">
          ${bodyHtml}
        </div>
      </body>
    </html>
  `;
}

// Helper function to generate Sidebar layout HTML
function generateSidebarHTML(user: User, job: Job, todayDate: string, bodyHtml: string): string {
  const formattedDate = todayDate.replace(/^(\w+) (\d+), (\d+)$/, "$2/$1/$3");

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
            padding: 0;
            font-family: Arial, Calibri, sans-serif;
            font-size: 11pt;
            line-height: 1.3;
            color: #000;
            background: white;
          }
          
          .container {
            display: flex;
            min-height: 297mm;
          }
          
          .sidebar {
            width: 50mm;
            padding: 15mm 5mm 5mm 8mm;
            background-color: #f8f9fa;
            border-right: 1px solid #e0e0e0;
          }
          
          .sidebar-name {
            font-weight: 700;
            font-size: 18pt;
            margin-bottom: 0.3em;
            color: #000;
          }
          
          .sidebar-subtitle {
            font-size: 11pt;
            color: #666;
            margin-bottom: 1.5em;
          }
          
          .info-section {
            margin-bottom: 1.5em;
          }
          
          .info-item {
            margin-bottom: 0.8em;
          }
          
          .info-label {
            font-size: 9pt;
            font-weight: 600;
            color: #666;
          }
          
          .info-value {
            font-size: 10pt;
            word-break: break-word;
          }
          
          .content {
            flex: 1;
            padding: 25.4mm 25.4mm 25.4mm 20mm;
          }
          
          .date {
            font-size: 10pt;
            margin-bottom: 1.5em;
            color: #666;
          }
          
          .recipient {
            margin-bottom: 1.5em;
          }
          
          .recipient-title {
            font-weight: 600;
            margin-bottom: 0.2em;
          }
          
          .recipient-company {
            font-size: 10pt;
            color: #666;
            font-style: italic;
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
        <div class="container">
          <div class="sidebar">
            <div class="sidebar-name">${user.name || "John Smith"}</div>
            <div class="sidebar-subtitle">Cover Letter</div>
            <div class="info-section">
              ${user.phoneNumber ? `
                <div class="info-item">
                  <div class="info-label">Phone</div>
                  <div class="info-value">${user.phoneNumber}</div>
                </div>
              ` : ""}
              ${user.email ? `
                <div class="info-item">
                  <div class="info-label">E-mail</div>
                  <div class="info-value">${user.email}</div>
                </div>
              ` : ""}
              ${user.city ? `
                <div class="info-item">
                  <div class="info-label">City</div>
                  <div class="info-value">${user.city}</div>
                </div>
              ` : ""}
              ${user.postcode ? `
                <div class="info-item">
                  <div class="info-label">Postcode</div>
                  <div class="info-value">${user.postcode}</div>
                </div>
              ` : ""}
            </div>
          </div>
          <div class="content">
            <div class="date">
              ${user.city ? `${user.city}, ` : ""}${formattedDate}
            </div>
            <div class="recipient">
              <div class="recipient-title">${job.jobTitle}</div>
              <div class="recipient-company">${job.companyName}</div>
            </div>
            <div class="body">
              ${bodyHtml}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { layout, user, job, todayDate, bodyHtml } = body;

    if (!layout || !user || !job || !bodyHtml) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate the complete HTML based on layout
    const html = layout === "classic" 
      ? generateClassicHTML(user, job, todayDate, bodyHtml)
      : generateSidebarHTML(user, job, todayDate, bodyHtml);

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

    // Generate filename based on job and company
    const filename = `${job.companyName.replace(/[^a-z0-9]/gi, '_')}_${job.jobTitle.replace(/[^a-z0-9]/gi, '_')}_Cover_Letter.pdf`;

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
