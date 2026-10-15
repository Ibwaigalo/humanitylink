"use client";

import { useState } from "react";

const labelClass = "block text-sm font-medium text-slate-700";

export default function FileUploadField({
  label,
  name,
  defaultValue,
  kind = "image",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  kind?: "image" | "video";
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Échec de l'upload.");
      }
      setUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'upload.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className={labelClass}>
      {label}
      <input type="hidden" name={name} value={url} />
      <input
        type="file"
        accept={kind === "image" ? "image/*" : "video/*"}
        onChange={onChange}
        disabled={uploading}
        className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-hl-navy file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-hl-navy/90 disabled:opacity-60"
      />
      {uploading && (
        <p className="mt-1 text-xs text-slate-500">Téléversement en cours…</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {url && !uploading && (
        <div className="mt-2">
          {kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt=""
              className="max-h-32 rounded border border-slate-200"
            />
          ) : (
            <video
              src={url}
              controls
              className="max-h-32 rounded border border-slate-200"
            />
          )}
          <button
            type="button"
            onClick={() => setUrl("")}
            className="mt-1 block text-xs font-medium text-red-600 hover:underline"
          >
            Retirer
          </button>
        </div>
      )}
    </div>
  );
}
