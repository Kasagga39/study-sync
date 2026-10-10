import React from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="my-4 flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-zinc-200 px-6 py-16 text-center dark:border-zinc-800">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-sky-50 text-indigo-500 dark:from-indigo-500/10 dark:to-sky-500/10 dark:text-indigo-400">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden
        >
          <path d="M4 7.5A1.5 1.5 0 015.5 6h9A1.5 1.5 0 0116 7.5v6a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 014 13.5v-6zM4 11h3l1 1.5h4l1-1.5h3" />
        </svg>
      </div>
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</p>
      <p className="text-sm text-zinc-400 dark:text-zinc-500">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" className="mt-4">
          {actionText}
        </Button>
      )}
    </div>
  );
};
