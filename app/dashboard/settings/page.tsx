import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";
import { DragDropUpload } from "./_components/DragDropUpload";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  phoneNumber: z
    .string()
    .trim()
    .max(50)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  streetAddress: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  city: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  postcode: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  country: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  linkedInUrl: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null))
    .refine(
      (v) => v === null || /^https?:\/\//i.test(v),
      "LinkedIn URL must start with http(s)://"
    )
    .transform((v) => v),
});

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const userIdRaw = (session.user as { id?: string }).id;
  const userId = Number(userIdRaw);
  if (!Number.isFinite(userId)) redirect("/");

  const sp = (await searchParams) ?? {};
  const saved = sp.saved === "1";

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      phoneNumber: true,
      streetAddress: true,
      city: true,
      postcode: true,
      country: true,
      linkedInUrl: true,
    },
  });

  // Check if user has documents (using raw query since Document model is ignored)
  type CountResult = { count: bigint };
  const countRows = await prisma.$queryRaw<CountResult[]>`
    SELECT COUNT(*) as count
    FROM documents
    WHERE metadata->>'user_id' = ${String(userId)}
  `;
  const documentCount = Number(countRows[0]?.count ?? 0);

  async function updateProfile(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session?.user) redirect("/");
    const userIdRaw = (session.user as { id?: string }).id;
    const userId = Number(userIdRaw);
    if (!Number.isFinite(userId)) redirect("/");

    const parsed = profileSchema.safeParse({
      name: formData.get("name") ?? "",
      phoneNumber: formData.get("phoneNumber") ?? "",
      streetAddress: formData.get("streetAddress") ?? "",
      city: formData.get("city") ?? "",
      postcode: formData.get("postcode") ?? "",
      country: formData.get("country") ?? "",
      linkedInUrl: formData.get("linkedInUrl") ?? "",
    });

    if (!parsed.success) {
      // Keep it simple for now: return to the page without saving.
      redirect("/dashboard/settings");
    }

    await prisma.user.update({
      where: { id: userId },
      data: parsed.data,
    });

    redirect("/dashboard/settings?saved=1");
  }

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      {saved && (
        <div className="rounded-xl border border-secondary/20 bg-secondary/5 px-5 py-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Profile Updated</h3>
            <p className="text-sm text-foreground-muted mt-0.5">
              Your changes have been saved successfully.
            </p>
          </div>
        </div>
      )}

      {/* Warning Alert - Missing Documents */}
      {documentCount === 0 && (
        <div className="rounded-xl border-2 border-amber-300/50 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-900">
                Action Required: Upload Documents
              </h3>
              <p className="mt-1 text-sm text-amber-800">
                You haven't uploaded any documents yet. Please upload at least one document 
                to start using the dashboard features. Upload your CV, resume, or other 
                supporting documents in the panel on the right.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Two-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (col-span-2) - Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-xl shadow-sm border border-border p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">Personal Details</h2>
              <p className="text-sm text-foreground-muted mt-1">
                Manage your contact info for applications
              </p>
              <p className="text-xs text-foreground-subtle mt-1">
                Signed in as {user?.email ?? "unknown"}
              </p>
            </div>

            <form action={updateProfile} className="space-y-5">
              {/* Full Name - Full Width */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Full Name
                </label>
                <input
                  name="name"
                  defaultValue={user?.name ?? ""}
                  className="w-full rounded-lg border border-border bg-slate-50 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="Jane Doe"
                />
              </div>

              {/* Phone & Country - Half Width Each */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Phone Number
                  </label>
                  <input
                    name="phoneNumber"
                    defaultValue={user?.phoneNumber ?? ""}
                    className="w-full rounded-lg border border-border bg-slate-50 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="+1 555 555 5555"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Country
                  </label>
                  <input
                    name="country"
                    defaultValue={user?.country ?? ""}
                    className="w-full rounded-lg border border-border bg-slate-50 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Germany"
                  />
                </div>
              </div>

              {/* City & Postcode - Half Width Each */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    City
                  </label>
                  <input
                    name="city"
                    defaultValue={user?.city ?? ""}
                    className="w-full rounded-lg border border-border bg-slate-50 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Berlin"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Postcode
                  </label>
                  <input
                    name="postcode"
                    defaultValue={user?.postcode ?? ""}
                    className="w-full rounded-lg border border-border bg-slate-50 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="10115"
                  />
                </div>
              </div>

              {/* Street Address - Full Width */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Street Address
                </label>
                <input
                  name="streetAddress"
                  defaultValue={user?.streetAddress ?? ""}
                  className="w-full rounded-lg border border-border bg-slate-50 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="123 Main St, Apt 4B"
                />
              </div>

              {/* LinkedIn URL - Full Width with Icon */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  LinkedIn Profile URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg className="h-5 w-5 text-foreground-muted" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </div>
                  <input
                    name="linkedInUrl"
                    defaultValue={user?.linkedInUrl ?? ""}
                    className="w-full rounded-lg border border-border bg-slate-50 pl-12 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="https://www.linkedin.com/in/your-handle"
                  />
                </div>
                <p className="text-xs text-foreground-muted">
                  Used for contact info and consistent branding across applications.
                </p>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (col-span-1) - Document Upload */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">Document Management</h2>
              <p className="text-sm text-foreground-muted mt-1">
                Upload your resume, CV, or career documents
              </p>
            </div>
            
            <DragDropUpload />
          </div>
        </div>
      </div>
    </div>
  );
}

