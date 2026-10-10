"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modals";
import { CourseCard } from "@/components/CourseCard";
import { EmptyState } from "@/components/EmptyState";
import type { APIResponse, ICourse, IUser } from "@/types";

interface CoursesViewProps {
  user: IUser;
  initialCourses: ICourse[];
}

export const CoursesView: React.FC<CoursesViewProps> = ({ user, initialCourses }) => {
  const [courses, setCourses] = useState<ICourse[]>(initialCourses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      const res = await fetch("/api/courses");
      const data = (await res.json()) as APIResponse<ICourse[]>;
      if (data.success && data.data) setCourses(data.data);
    } catch {
      setError("Could not refresh your courses.");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
      setIsModalOpen(false);
      setName("");
      setDescription("");
      await refresh();
    } else {
      const data = (await res.json()) as APIResponse;
      setError(data.error || "Failed to create the course.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this course? Its tasks and resources will remain but be orphaned."))
      return;
    setError("");
    const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
    if (res.ok) {
      await refresh();
    } else {
      setError("Failed to delete the course.");
    }
  };

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
              Your Courses
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Organize study tasks and resources by course.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="shrink-0">
            + New Course
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

        {courses.length === 0 ? (
          <EmptyState
            title="No courses yet"
            description="Create your first course to start organizing tasks and resources."
            actionText="Create Course"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="animate-fade-up animate-delay-75 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onDelete={course.ownerId === user._id ? handleDelete : undefined}
              />
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-zinc-400">
          Looking for your overview?{" "}
          <Link href="/dashboard" className="font-medium text-indigo-600 hover:text-indigo-500">
            Go to the dashboard
          </Link>
        </p>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Course">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Course Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. CS 101 – Intro to Programming"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="course-description"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Description
            </label>
            <textarea
              id="course-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>
          <Button type="submit" className="w-full">
            Save Course
          </Button>
        </form>
      </Modal>
    </div>
  );
};
