import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createJobSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
  jobTitle: z.string().trim().min(1, "Job title is required"),
  locationCity: z.string().trim().optional().default(""),
  country: z.string().trim().optional().default(""),
  jobDescription: z.string().trim().min(1, "Job description is required"),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { ok: false, error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // 2. Parse and validate request body
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { ok: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const parsed = createJobSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message).join(", ");
      return NextResponse.json(
        { ok: false, error: errors },
        { status: 400 }
      );
    }

    const { companyName, jobTitle, locationCity, country, jobDescription } = parsed.data;

    // 3. Generate a unique URL for manually created jobs
    const timestamp = Date.now();
    const urlSlug = `${companyName}-${jobTitle}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const generatedUrl = `manual://job/${urlSlug}-${timestamp}`;

    // 4. Create JobListing
    const jobListing = await prisma.jobListing.create({
      data: {
        url: generatedUrl,
        companyName,
        jobTitle,
        locationCity,
        country,
        jobDescription,
        numberOfApplicants: 0,
        companyLogo: "",
      },
    });

    // 5. Create JobApplication to track this for the user
    await prisma.jobApplication.create({
      data: {
        userId,
        jobId: jobListing.id,
        status: "SAVED",
      },
    });

    // 6. Return success with job listing ID
    return NextResponse.json({
      ok: true,
      jobListing: {
        id: jobListing.id,
      },
    });
  } catch (err) {
    console.error("Error creating job listing:", err);
    
    // Handle unique constraint violation (duplicate URL)
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return NextResponse.json(
        { ok: false, error: "A job with similar details already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to create job listing",
      },
      { status: 500 }
    );
  }
}
