"use client";
import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/Button";
import { TaskCard } from "@/components/TaskCard";
import { EmptyState } from "@/components/EmptyState";
import { Modal } from "@/components/Modals";
import { Input } from "@/components/Input";
import type { APIResponse, ICourse, ITask, IUser } from "@/types";

interface DashboardViewProps {
  user: Pick<IUser, "name">;
  initialCourses: ICourse[];
  initialTasks: ITask[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  initialCourses,
  initialTasks,
}) => {
  const [courses, setCourses] = useState<ICourse[]>(initialCourses);
  const [tasks, setTasks] = useState<ITask[]>(initialTasks);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const refresh = async () => {
    try {
      const [coursesRes, tasksRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/tasks"),
      ]);
      const coursesData = (await coursesRes.json()) as APIResponse<ICourse[]>;
      const tasksData = (await tasksRes.json()) as APIResponse<ITask[]>;
      if (coursesData.success && coursesData.data) setCourses(coursesData.data);
      if (tasksData.success && tasksData.data) setTasks(tasksData.data);
    } catch {
      setError("Could not refresh your workspace. Please try again.");
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: ITask["status"]) => {
    setError("");
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      await refresh();
    } else {
      setError("Failed to update the task status.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    setError("");
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (res.ok) {
      await refresh();
    } else {
      setError("Failed to delete the task.");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, courseId, dueDate }),
    });
    if (res.ok) {
      setIsTaskModalOpen(false);
      setTitle("");
      setDescription("");
      setCourseId("");
      setDueDate("");
      await refresh();
    } else {
      const data = (await res.json()) as APIResponse;
      setError(data.error || "Failed to create the task.");
    }
  };

  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(99,102,241,0.12),transparent_70%)]"
      />
      <Navbar user={user} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="animate-fade-up mb-8 flex flex-col justify-between gap-4 border-b border-zinc-100 pb-6 sm:flex-row sm:items-end dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Study Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Welcome back, {user.name}. Here is your academic progress.
            </p>
          </div>
          <Button
            onClick={() => setIsTaskModalOpen(true)}
            disabled={courses.length === 0}
            className="shrink-0"
          >
            + Add Task
          </Button>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
          >
            {error}
          </p>
        )}

        <div className="animate-fade-up animate-delay-75 mb-8 grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Total Courses"
            value={courses.length}
            gradient="from-indigo-500 to-indigo-600"
            path="M4 5.5A1.5 1.5 0 015.5 4h9A1.5 1.5 0 0116 5.5v9a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 014 14.5v-9zM7 8h6M7 11h4"
          />
          <MetricCard
            label="Active Tasks"
            value={tasks.length - completedTasks}
            gradient="from-amber-400 to-amber-500"
            path="M4 6.5h9M4 10h9M4 13.5h5M15.5 12.5l1.5 1.5 2.5-2.5"
          />
          <MetricCard
            label="Overall Completion"
            value={`${progressPercent}%`}
            gradient="from-emerald-400 to-emerald-600"
            path="M10 2.5a7.5 7.5 0 100 15 7.5 7.5 0 000-15zM6.5 10l2.25 2.25L13.5 7.5"
            progress={progressPercent}
          />
        </div>

        <div className="animate-fade-up animate-delay-150 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Upcoming Tasks</h2>
          {tasks.length === 0 ? (
            <EmptyState
              title="No Tasks Found"
              description={
                courses.length === 0
                  ? "Create a course first to start scheduling tasks."
                  : "Add a task to keep track of your pending assignments."
              }
              actionText={courses.length > 0 ? "Create First Task" : undefined}
              onAction={() => setIsTaskModalOpen(true)}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onStatusChange={handleTaskStatusChange}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Create New Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="task-course"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Course
            </label>
            <select
              id="task-course"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            >
              <option value="">Select a course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Save Task
          </Button>
        </form>
      </Modal>
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: number | string;
  gradient: string;
  path: string;
  progress?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, gradient, path, progress }) => (
  <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white shadow-sm`}
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden
        >
          <path d={path} />
        </svg>
      </span>
    </div>
    <p className="mt-3 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{value}</p>
    {typeof progress === "number" && (
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    )}
  </div>
);
