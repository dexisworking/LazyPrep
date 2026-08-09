"use client";

import { useEffect, useState, useRef } from "react";
import { Upload, FileText, Image as ImageIcon, Trash2, Loader2, AlertCircle } from "lucide-react";
import { listPendingResources, deleteResource, type ResourceSummary } from "@/lib/actions/resources";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResourceUploader() {
  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listPendingResources().then((res) => {
      if (res.ok) setResources(res.resources);
    });
  }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError("");

    if (resources.length + files.length > 5) {
      setError("You can upload a maximum of 5 reference files.");
      return;
    }

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 10MB file size limit.`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/resources/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.ok) {
          setResources((prev) => [...prev, data.resource]);
        } else {
          setError(data.error || `Failed to upload ${file.name}`);
        }
      } catch {
        setError(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDelete = async (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
    await deleteResource(id);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Study materials / Syllabi <span className="text-muted-foreground">(optional)</span>
        </label>
        <span className="text-xs text-muted-foreground">{resources.length} / 5 files</span>
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleUpload(e.dataTransfer.files);
        }}
        className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-control border border-dashed border-border p-4 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => void handleUpload(e.target.files)}
        />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">
            Click or drag files to upload reference materials
          </p>
          <p className="text-3xs text-muted-foreground mt-0.5">
            PDFs or Images (PNG, JPG, WEBP) · Up to 10MB each · Scanned & deleted after creation
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* File List */}
      {resources.length > 0 && (
        <ul className="space-y-2">
          {resources.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-control border border-border-subtle bg-background px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2 truncate">
                {r.fileType === "pdf" ? (
                  <FileText className="h-4 w-4 shrink-0 text-red-500" />
                ) : (
                  <ImageIcon className="h-4 w-4 shrink-0 text-blue-500" />
                )}
                <span className="truncate font-medium text-foreground" title={r.fileName}>
                  {r.fileName}
                </span>
                <span className="text-muted-foreground">({formatBytes(r.fileSize)})</span>
              </div>
              <button
                type="button"
                onClick={() => void handleDelete(r.id)}
                className="ml-2 rounded-control p-1 text-muted-foreground hover:text-destructive"
                title="Remove file"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
