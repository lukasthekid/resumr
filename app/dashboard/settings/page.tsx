import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";

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
    <div className="max-w-2xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="text-sm text-slate-600">
          Update your profile details for better resume and cover letter output.
        </p>
      </header>

      {saved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Profile updated.
        </div>
      )}

      <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="mb-6">
          <div className="text-sm font-semibold text-slate-900">Profile</div>
          <div className="mt-1 text-xs text-slate-500">
            Signed in as {user?.email ?? "unknown"}
          </div>
        </div>

        <form action={updateProfile} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              Full name
            </label>
            <input
              name="name"
              defaultValue={user?.name ?? ""}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-transparent"
              placeholder="Jane Doe"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                Phone number
              </label>
              <input
                name="phoneNumber"
                defaultValue={user?.phoneNumber ?? ""}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-transparent"
                placeholder="+1 555 555 5555"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                Country
              </label>
              <input
                name="country"
                defaultValue={user?.country ?? ""}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-transparent"
                placeholder="Germany"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                City
              </label>
              <input
                name="city"
                defaultValue={user?.city ?? ""}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-transparent"
                placeholder="Berlin"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                Postcode
              </label>
              <input
                name="postcode"
                defaultValue={user?.postcode ?? ""}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-transparent"
                placeholder="10115"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              Street address
            </label>
            <input
              name="streetAddress"
              defaultValue={user?.streetAddress ?? ""}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-transparent"
              placeholder="123 Main St, Apt 4B"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              LinkedIn profile URL
            </label>
            <input
              name="linkedInUrl"
              defaultValue={user?.linkedInUrl ?? ""}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-transparent"
              placeholder="https://www.linkedin.com/in/your-handle"
            />
            <p className="text-xs text-slate-500">
              Used for contact info and consistent branding across applications.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-sky-600 transition-colors"
            >
              Save changes
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

