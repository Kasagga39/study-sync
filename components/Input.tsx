import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, id, className = "", ...props }) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 ${
          error ? "border-red-500 dark:border-red-500" : "border-zinc-300 dark:border-zinc-700"
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs font-medium text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
};
