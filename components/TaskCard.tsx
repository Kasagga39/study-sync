import React from "react";
import { ITask } from "@/types";

interface TaskCardProps {
  task: ITask;
  onStatusChange?: (id: string, newStatus: ITask["status"]) => void;
  onDelete?: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onDelete }) => {
  const statusColors = {
    "Not Started":
      "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
    "In Progress":
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
    Completed:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
  };

  const formattedDate = new Date(task.dueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="animate-fade-in flex h-full flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/30">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h4
            className={`text-sm font-semibold text-zinc-900 dark:text-zinc-50 ${task.status === "Completed" ? "line-through opacity-60" : ""}`}
          >
            {task.title}
          </h4>
          <span
            className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[task.status]}`}
          >
            {task.status}
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {task.description}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs dark:border-zinc-800">
        <span className="font-medium text-zinc-500 dark:text-zinc-400">Due: {formattedDate}</span>
        <div className="flex items-center gap-2">
          {onStatusChange && (
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task._id, e.target.value as ITask["status"])}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-700 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task._id)}
              className="p-1 text-zinc-400 transition-colors hover:text-red-500"
              aria-label="Delete task"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
