"use client";

import { useEffect, useState } from "react";
import { Upload, FileText, Trash2, Loader2 } from "lucide-react";

type UploadResponse = {
  ok?: boolean;
  error?: string;
  webhookStatus?: number;
  processed?: number;
  failed?: number;
  errors?: Array<{ item: string; error: string }>;
};

type ListResponse =
  | { ok: true; files: string[] }
  | { ok: false; error: string }
  | { error: string };

export function DragDropUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [existing, setExisting] = useState<string[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [existingError, setExistingError] = useState<string | null>(null);
  const [deletingFileName, setDeletingFileName] = useState<string | null>(null);

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
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setSubmitting(true);
    setResult(null);

    try {
      const form = new FormData();
      files.forEach((file) => form.append("files", file));

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

      if (json?.ok) {
        setFiles([]);
        refreshExisting();
      }
    } catch (err) {
      setResult({
        ok: false,
        error: err instanceof Error ? err.message : "Upload failed.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (filename: string) => {
    const confirmed = window.confirm(
      `Delete "${filename}"? All document chunks for this file will be removed. This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingFileName(filename);
    try {
      const res = await fetch(
        `/api/documents/delete?fileName=${encodeURIComponent(filename)}`,
        { method: "DELETE" }
      );
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!res.ok || !json?.ok) {
        const msg = json?.error ?? `Delete failed (HTTP ${res.status}).`;
        setExistingError(msg);
        return;
      }
      setExistingError(null);
      await refreshExisting();
    } catch (err) {
      setExistingError(
        err instanceof Error ? err.message : "Failed to delete file."
      );
    } finally {
      setDeletingFileName(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          "relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50",
        ].join(" ")}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={submitting}
        />
        <div className="py-12 px-6 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Drag & drop your Resume/CV here
          </h3>
          <p className="text-xs text-foreground-muted mb-2">
            or click to browse
          </p>
          <p className="text-xs text-foreground-subtle">
            PDF or DOCX up to 10MB
          </p>
        </div>
      </div>

      {/* Selected Files for Upload */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Ready to Upload ({files.length})
            </h3>
            <button
              onClick={() => setFiles([])}
              className="text-xs text-foreground-muted hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-slate-50 rounded-lg p-3 border border-border"
              >
                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-foreground-muted">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-foreground-muted hover:text-red-600 transition-colors"
                  disabled={submitting}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleUpload}
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Files
              </>
            )}
          </button>
        </div>
      )}

      {/* Upload Result */}
      {result && (
        <div
          className={[
            "rounded-lg p-4 text-sm",
            result.ok
              ? "bg-secondary/5 border border-secondary/20 text-secondary"
              : "bg-red-50 border border-red-200 text-red-700",
          ].join(" ")}
        >
          {result.error ? (
            <p>{result.error}</p>
          ) : (
            <div className="space-y-1">
              <p className="font-semibold">Upload successful!</p>
              <p className="text-xs">
                Processed: {result.processed ?? 0}, Failed: {result.failed ?? 0}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Uploaded Documents List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Uploaded Documents
          </h3>
          <button
            onClick={refreshExisting}
            disabled={loadingExisting}
            className="text-xs text-foreground-muted hover:text-foreground transition-colors disabled:opacity-60"
          >
            {loadingExisting ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {existingError ? (
          <div className="text-xs text-red-600 bg-red-50 rounded-lg p-3 border border-red-200">
            {existingError}
          </div>
        ) : loadingExisting ? (
          <div className="flex items-center gap-2 text-sm text-foreground-muted py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading documents...
          </div>
        ) : existing.length === 0 ? (
          <div className="text-sm text-foreground-muted bg-slate-50 rounded-lg p-4 text-center border border-dashed border-border">
            No documents uploaded yet
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {existing.map((name, index) => (
              <div
                key={`${name}-${index}`}
                className="flex items-center gap-3 bg-surface rounded-lg p-3 border border-border hover:border-border-hover transition-colors"
              >
                <FileText className="h-5 w-5 text-secondary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(name)}
                  disabled={deletingFileName !== null}
                  className="text-foreground-muted hover:text-red-600 transition-colors disabled:opacity-60"
                  title="Delete file"
                >
                  {deletingFileName === name ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
