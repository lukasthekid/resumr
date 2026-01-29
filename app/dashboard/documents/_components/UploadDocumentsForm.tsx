"use client";

import { useEffect, useMemo, useState } from "react";

type UploadResponse = {
  ok?: boolean;
  error?: string;
  webhookStatus?: number;
  processed?: number;
  failed?: number;
  errors?: Array<{ item: string; error: string }>;
  webhookResponse?: string;
};

type ListResponse =
  | { ok: true; files: string[] }
  | { ok: false; error: string }
  | { error: string };

export function UploadDocumentsForm() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [clearing, setClearing] = useState(false);
  const [clearResult, setClearResult] = useState<
    | null
    | { ok: true; deleted: number }
    | { ok: false; error: string }
  >(null);
  const [existing, setExisting] = useState<string[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [existingError, setExistingError] = useState<string | null>(null);

  async function refreshExisting() {
    setLoadingExisting(true);
    setExistingError(null);
    try {
      const res = await fetch("/api/documents/list", { method: "GET" });
      const json = (await res.json().catch(() => null)) as ListResponse | null;

      if (!res.ok || !json) {
        setExistingError(`Failed to load documents (HTTP ${res.status}).`);
        setExisting([]);
        return;
      }

      if ("ok" in json && json.ok === true) {
        setExisting(Array.from(new Set(json.files ?? [])).sort());
        return;
      }

      setExistingError(
        ("error" in json && json.error) || "Failed to load documents."
      );
      setExisting([]);
    } catch (err) {
      setExistingError(
        err instanceof Error ? err.message : "Failed to load documents."
      );
      setExisting([]);
    } finally {
      setLoadingExisting(false);
    }
  }

  useEffect(() => {
    refreshExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fileCount = files?.length ?? 0;
  const selectedNames = useMemo(() => {
    if (!files || files.length === 0) return [];
    return Array.from(files).map((f) => f.name);
  }, [files]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    setClearResult(null);
    setExistingError(null);

    try {
      const form = new FormData();
      if (files) {
        for (const f of Array.from(files)) form.append("files", f);
      }

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: form,
      });

      const json = (await res.json().catch(() => null)) as UploadResponse | null;
      setResult(
        json ??
          ({
            ok: false,
            error: `Upload failed (HTTP ${res.status}).`,
          } satisfies UploadResponse)
      );
    } catch (err) {
      setResult({
        ok: false,
        error: err instanceof Error ? err.message : "Upload failed.",
      });
    } finally {
      setSubmitting(false);
      // n8n may insert async; still useful to refresh.
      refreshExisting();
    }
  }

  async function onClearAll() {
    const ok = window.confirm(
      "Delete all previously uploaded documents? This cannot be undone."
    );
    if (!ok) return;

    setClearing(true);
    setClearResult(null);
    setResult(null);

    try {
      const res = await fetch("/api/documents/clear", { method: "DELETE" });
      const json = (await res.json().catch(() => null)) as
        | null
        | { ok: true; deleted: number }
        | { ok: false; error?: string };

      if (!res.ok || !json || json.ok !== true) {
        setClearResult({
          ok: false,
          error:
            (json && "error" in json && json.error) ||
            `Delete failed (HTTP ${res.status}).`,
        });
        return;
      }

      setClearResult({ ok: true, deleted: json.deleted ?? 0 });
      refreshExisting();
    } catch (err) {
      setClearResult({
        ok: false,
        error: err instanceof Error ? err.message : "Delete failed.",
      });
    } finally {
      setClearing(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <div className="text-sm font-semibold text-slate-900">
          Upload documents (PDF / DOCX)
        </div>
        <p className="text-xs text-slate-500">
          You can upload multiple files. For legacy Word <span className="text-slate-600">.doc</span>,
          please convert to <span className="text-slate-600">.docx</span>.
        </p>
        <input
          type="file"
          multiple
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => setFiles(e.target.files)}
          className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-900 hover:file:bg-slate-200"
        />
        {fileCount > 0 && (
          <div className="text-xs text-slate-500">
            Selected:{" "}
            <span className="text-slate-600">{selectedNames.join(", ")}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-sky-600 transition-colors disabled:opacity-60 disabled:hover:bg-sky-500"
        >
          {submitting ? "Uploading…" : "Upload"}
        </button>

        <button
          type="button"
          onClick={onClearAll}
          disabled={submitting || clearing}
          className="inline-flex items-center justify-center rounded-lg bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100 transition-colors disabled:opacity-60"
        >
          {clearing ? "Deleting…" : "Delete all"}
        </button>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-900">
            Uploaded documents
          </div>
          <button
            type="button"
            onClick={refreshExisting}
            disabled={loadingExisting || submitting || clearing}
            className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-60"
          >
            {loadingExisting ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        <div className="mt-2">
          {existingError ? (
            <div className="text-xs text-rose-700">{existingError}</div>
          ) : loadingExisting ? (
            <div className="text-xs text-slate-500">Loading…</div>
          ) : existing.length === 0 ? (
            <div className="text-xs text-slate-500">
              No uploaded documents found yet.
            </div>
          ) : (
            <ul className="mt-2 space-y-1 text-xs text-slate-600">
              {existing.map((name) => (
                <li key={name}>
                  <span className="text-slate-700">{name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {clearResult && (
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
          {clearResult.ok ? (
            <div className="text-sm text-emerald-700">
              Deleted all document(s).
            </div>
          ) : (
            <div className="text-sm text-rose-700">{clearResult.error}</div>
          )}
        </div>
      )}

      {result && (
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
          {result.error ? (
            <div className="text-sm text-rose-700">{result.error}</div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm text-slate-700">
                Webhook:{" "}
                <span className={result.ok ? "text-emerald-700" : "text-rose-700"}>
                  {result.ok ? "OK" : "Failed"}
                </span>{" "}
                (HTTP {result.webhookStatus})
              </div>
              <div className="text-xs text-slate-500">
                Processed: <span className="text-slate-700">{result.processed ?? 0}</span>, Failed:{" "}
                <span className="text-slate-700">{result.failed ?? 0}</span>
              </div>
              {result.errors && result.errors.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                  {result.errors.map((e, idx) => (
                    <li key={idx}>
                      <span className="text-slate-700">{e.item}:</span> {e.error}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </form>
  );
}

