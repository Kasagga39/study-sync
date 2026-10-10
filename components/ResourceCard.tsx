import React from "react";
import type { IResource } from "@/types";

interface ResourceCardProps {
  resource: IResource;
  onDelete?: (id: string) => void;
}

function formatFileSize(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(contentType: string): string {
  if (!contentType) return "📄";
  if (contentType.startsWith("image/")) return "🖼";
  if (contentType.includes("pdf")) return "📕";
  if (contentType.includes("word") || contentType.includes("document")) return "📝";
  if (contentType.includes("sheet") || contentType.includes("spreadsheet")) return "📊";
  if (contentType.includes("presentation") || contentType.includes("powerpoint")) return "📽";
  if (contentType.includes("audio")) return "🎵";
  if (contentType.includes("video")) return "🎬";
  if (contentType.includes("zip")) return "🗜";
  if (contentType.includes("text")) return "📄";
  return "📄";
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onDelete }) => {
  const isFile =
    Boolean(resource.fileName || resource.fileSize || resource.contentType) && !resource.url;
  const fileUrl = `/api/resources/${resource._id}/file`;
  const isImage = isFile && (resource.contentType ?? "").startsWith("image/");

  let host = resource.url;
  try {
    host = new URL(resource.url || fileUrl).hostname.replace(/^www\./, "");
  } catch {
    host = resource.url || resource.fileName || "File";
  }

  const href = isFile ? fileUrl : resource.url;

  return (
    <div className="animate-fade-in flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-sky-500/30">
      {isFile ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fileUrl} alt={resource.title} className="h-32 w-full object-cover" />
          ) : (
            <div className="flex h-28 w-full items-center justify-center bg-gradient-to-br from-indigo-500/10 to-sky-500/10 text-4xl">
              {fileIcon(resource.contentType ?? "")}
            </div>
          )}
        </a>
      ) : (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(
              resource.url ?? ""
            )}&sz=64`}
            alt=""
            className="h-14 w-full object-contain bg-zinc-50 p-3 dark:bg-zinc-950/50"
          />
        </a>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-zinc-900 hover:text-sky-600 dark:text-zinc-50 dark:hover:text-sky-400"
          >
            {resource.title}
          </a>
          {onDelete && (
            <button
              onClick={() => onDelete(resource._id)}
              className="shrink-0 p-1 text-zinc-400 transition-colors hover:text-red-500"
              aria-label="Delete resource"
            >
              ✕
            </button>
          )}
        </div>
        {resource.description && (
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {resource.description}
          </p>
        )}
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 border-t border-zinc-100 pt-3 px-5 pb-4 text-xs font-medium text-sky-600 dark:border-zinc-800 dark:text-sky-400"
      >
        {isFile ? (
          <>
            <span aria-hidden>{fileIcon(resource.contentType ?? "")}</span>
            {resource.fileName}
            {resource.fileSize ? ` · ${formatFileSize(resource.fileSize)}` : ""}
          </>
        ) : (
          <>
            <span aria-hidden>🔗</span> {host}
          </>
        )}
      </a>
    </div>
  );
};
