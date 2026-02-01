/**
 * Cover Letter Types
 * 
 * Type definitions for cover letter data structure and API responses
 */

export interface CoverLetterUser {
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  streetAddress: string | null;
  city: string | null;
  postcode: string | null;
  country: string | null;
  linkedInUrl: string | null;
}

export interface CoverLetterJob {
  id: number;
  companyName: string;
  companyLogo: string | null;
  jobTitle: string;
  locationCity: string | null;
  country: string | null;
}

export interface CoverLetterData {
  user: CoverLetterUser;
  job: CoverLetterJob;
  date: string; // Formatted date string
  bodyHtml: string; // Rich text HTML content
}

export interface CoverLetterGenerationResponse {
  ok: boolean;
  webhookStatus: number;
  coverLetter?: string;
  job?: CoverLetterJob;
  user?: CoverLetterUser;
  error?: string;
  webhookResponse?: unknown;
}
