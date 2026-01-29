import { UploadDocumentsForm } from "./_components/UploadDocumentsForm";

export default function DocumentsPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Documents
        </h1>
        <p className="text-sm text-slate-600">
          Upload supporting documents (CVs, reference letters, transcripts, project
          descriptions). We’ll extract the text and send it to your automation
          workflow for resume/cover letter generation.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
        <UploadDocumentsForm />
      </section>
    </div>
  );
}

