import React from "react";
import Link from "next/link";
import { ICourse } from "@/types";

interface CourseCardProps {
  course: ICourse;
  onDelete?: (id: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onDelete }) => {
  return (
    <div className="group flex h-full flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/40">
      <div>
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-base font-semibold text-zinc-900 transition-colors group-hover:text-indigo-600 dark:text-zinc-50 dark:group-hover:text-indigo-400">
            {course.name}
          </h3>
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete(course._id);
              }}
              className="rounded px-2 py-1 text-xs text-zinc-400 transition-colors hover:text-red-500"
              title="Delete course"
            >
              Delete
            </button>
          )}
        </div>
        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {course.description}
        </p>
      </div>
      <Link
        href={`/courses/${course._id}`}
        className="mt-auto inline-flex items-center text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
      >
        View Workspace →
      </Link>
    </div>
  );
};
