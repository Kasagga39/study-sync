"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modals";
import { TaskCard } from "@/components/TaskCard";
import { ResourceCard } from "@/components/ResourceCard";
import { EmptyState } from "@/components/EmptyState";
import type { APIResponse, ICourse, IMember, IResource, ITask, IUser } from "@/types";

interface MemberList {
  owner: IMember | null;
  members: IMember[];
}

interface CourseWorkspaceProps {
  user: IUser;
  course: ICourse;
  initialTasks: ITask[];
  initialResources: IResource[];
  initialMembers: MemberList;
}

export const CourseWorkspace: React.FC<CourseWorkspaceProps> = ({
  user,
  course: initialCourse,
  initialTasks,
  initialResources,
  initialMembers,
}) => {
  const router = useRouter();
  const isOwner = initialCourse.ownerId === user._id;

  const [course, setCourse] = useState<ICourse>(initialCourse);
  const [tasks, setTasks] = useState<ITask[]>(initialTasks);
  const [resources, setResources] = useState<IResource[]>(initialResources);
  const [members, setMembers] = useState<MemberList>(initialMembers);
  const [error, setError] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [isResourceOpen, setIsResourceOpen] = useState(false);

  const [editName, setEditName] = useState(course.name);
  const [editDescription, setEditDescription] = useState(course.description);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceDescription, setResourceDescription] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceFile, setResourceFile] = useState<File | null>(null);

  const [candidateUsers, setCandidateUsers] = useState<IMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [candidatesLoaded, setCandidatesLoaded] = useState(false);

  const loadCandidates = useCallback(async () => {
    if (!isOwner) return;
    try {
      const res = await fetch(`/api/users?courseId=${course._id}`);
      const data = (await res.json()) as APIResponse<IMember[]>;
      if (data.success && data.data) setCandidateUsers(data.data);
    } catch {
      setCandidateUsers([]);
    } finally {
      setCandidatesLoaded(true);
    }
  }, [course._id, isOwner]);

  useEffect(() => {
    const timer = setTimeout(loadCandidates, 0);
    return () => clearTimeout(timer);
  }, [loadCandidates]);

  const refresh = async () => {
    try {
      const [tasksRes, resourcesRes, membersRes] = await Promise.all([
        fetch(`/api/tasks?courseId=${course._id}`),
        fetch(`/api/resources?courseId=${course._id}`),
        fetch(`/api/courses/${course._id}/members`),
      ]);
      const tasksData = (await tasksRes.json()) as APIResponse<ITask[]>;
      const resourcesData = (await resourcesRes.json()) as APIResponse<IResource[]>;
      const membersData = (await membersRes.json()) as APIResponse<MemberList>;
      if (tasksData.success && tasksData.data) setTasks(tasksData.data);
      if (resourcesData.success && resourcesData.data) setResources(resourcesData.data);
      if (membersData.success && membersData.data) setMembers(membersData.data);
    } catch {
      setError("Could not refresh this course. Please try again.");
    }
  };
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  });

  useEffect(() => {
    const es = new EventSource(`/api/courses/${course._id}/events`);
    const onMessage = () => refreshRef.current();
    const onError = () => es.close();
    es.addEventListener("message", onMessage);
    es.addEventListener("error", onError);
    return () => {
      es.removeEventListener("message", onMessage);
      es.removeEventListener("error", onError);
      es.close();
    };
  }, [course._id]);

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch(`/api/courses/${course._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDescription }),
    });
    if (res.ok) {
      const data = (await res.json()) as APIResponse<ICourse>;
      if (data.data) setCourse(data.data);
      setIsEditOpen(false);
      router.refresh();
    } else {
      setError("Failed to update the course.");
    }
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm("Delete this course? This cannot be undone.")) return;
    setError("");
    const res = await fetch(`/api/courses/${course._id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/courses");
      router.refresh();
    } else {
      setError("Failed to delete the course.");
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!userId) return;
    setError("");
    const res = await fetch(`/api/courses/${course._id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      setSelectedMemberId("");
      await refresh();
      await loadCandidates();
    } else {
      const data = (await res.json()) as APIResponse<MemberList>;
      setError(data.error || "Failed to add this member.");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm("Remove this member from the course?")) return;
    setError("");
    const res = await fetch(`/api/courses/${course._id}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      await refresh();
      await loadCandidates();
    } else setError("Failed to remove the member.");
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: taskTitle,
        description: taskDescription,
        courseId: course._id,
        dueDate: taskDueDate,
      }),
    });
    if (res.ok) {
      setIsTaskOpen(false);
      setTaskTitle("");
      setTaskDescription("");
      setTaskDueDate("");
      await refresh();
    } else {
      setError("Failed to create the task.");
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: ITask["status"]) => {
    setError("");
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) await refresh();
    else setError("Failed to update the task status.");
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Delete this task?")) return;
    setError("");
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (res.ok) await refresh();
    else setError("Failed to delete the task.");
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!resourceUrl.trim() && !resourceFile) {
      setError("Provide a URL or choose a file to upload.");
      return;
    }
    const form = new FormData();
    form.append("title", resourceTitle);
    form.append("description", resourceDescription);
    form.append("courseId", course._id);
    if (resourceFile) form.append("file", resourceFile);
    else form.append("url", resourceUrl);

    let res: Response;
    try {
      res = await fetch("/api/resources", { method: "POST", body: form });
    } catch {
      setError("Failed to upload the resource.");
      return;
    }

    if (res.ok) {
      setIsResourceOpen(false);
      setResourceTitle("");
      setResourceDescription("");
      setResourceUrl("");
      setResourceFile(null);
      await refresh();
    } else {
      const data = (await res.json()) as APIResponse<unknown>;
      setError(data.error || "Failed to create the resource.");
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!window.confirm("Delete this resource?")) return;
    setError("");
    const res = await fetch(`/api/resources/${resourceId}`, { method: "DELETE" });
    if (res.ok) await refresh();
    else setError("Failed to delete the resource.");
  };

  const completed = tasks.filter((t) => t.status === "Completed").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const progressPercent = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
  const allPeople = [members.owner, ...members.members].filter((m): m is IMember => Boolean(m));

  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(99,102,241,0.12),transparent_70%)]"
      />
      <Navbar user={user} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="animate-fade-up mb-6 border-b border-zinc-100 pb-6 dark:border-zinc-800">
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">
            Course Workspace
          </p>
          <div className="mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {course.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {course.description}
              </p>
            </div>
            {isOwner && (
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" onClick={() => setIsEditOpen(true)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={handleDeleteCourse}>
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
          >
            {error}
          </p>
        )}

        <div className="animate-fade-up mb-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Tasks" value={tasks.length} />
          <Stat label="In Progress" value={inProgress} />
          <Stat label="Completed" value={`${completed} (${progressPercent}%)`} />
        </div>

        <section className="animate-fade-up animate-delay-75 mb-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Study Group · {allPeople.length} {allPeople.length === 1 ? "member" : "members"}
              </h2>
              {isOwner && (
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  You are the owner
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {allPeople.map((person) => (
                <span
                  key={person._id}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-[10px] font-bold text-white">
                    {(person.name || person.email || "?").charAt(0).toUpperCase()}
                  </span>
                  {person.name || person.email}
                  {person._id === user._id && <span className="text-zinc-400">(you)</span>}
                  {isOwner && person._id !== user._id && (
                    <button
                      onClick={() => handleRemoveMember(person._id)}
                      className="ml-1 text-zinc-400 transition-colors hover:text-red-500"
                      aria-label={`Remove ${person.name}`}
                    >
                      ✕
                    </button>
                  )}
                </span>
              ))}
            </div>

            {isOwner && (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  disabled={!candidatesLoaded || candidateUsers.length === 0}
                  className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm text-zinc-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="" disabled>
                    {!candidatesLoaded
                      ? "Loading people…"
                      : candidateUsers.length === 0
                        ? "No one left to add"
                        : "Select a study partner to add"}
                  </option>
                  {candidateUsers.map((candidate) => (
                    <option key={candidate._id} value={candidate._id}>
                      {candidate.name || candidate.email}
                      {candidate.name && candidate.email ? ` — ${candidate.email}` : ""}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!selectedMemberId}
                  onClick={() => handleAddMember(selectedMemberId)}
                >
                  Add
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="animate-fade-up animate-delay-75 mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Tasks</h2>
            <Button onClick={() => setIsTaskOpen(true)}>+ Add Task</Button>
          </div>
          {tasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              description="Add a task to track assignments and deadlines for this course."
              actionText="Add Task"
              onAction={() => setIsTaskOpen(true)}
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
        </section>

        <section className="animate-fade-up animate-delay-150 mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Resources</h2>
            <Button onClick={() => setIsResourceOpen(true)}>+ Add Resource</Button>
          </div>
          {resources.length === 0 ? (
            <EmptyState
              title="No resources yet"
              description="Save useful links, docs, and study material for this course."
              actionText="Add Resource"
              onAction={() => setIsResourceOpen(true)}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource._id}
                  resource={resource}
                  onDelete={handleDeleteResource}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Course">
        <form onSubmit={handleUpdateCourse} className="space-y-4">
          <Input
            label="Course Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-course-description"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Description
            </label>
            <textarea
              id="edit-course-description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
              required
              className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>
          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </Modal>

      <Modal isOpen={isTaskOpen} onClose={() => setIsTaskOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
          />
          <Input
            label="Description"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
          <Input
            label="Due Date"
            type="date"
            value={taskDueDate}
            onChange={(e) => setTaskDueDate(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Save Task
          </Button>
        </form>
      </Modal>

      <Modal isOpen={isResourceOpen} onClose={() => setIsResourceOpen(false)} title="Add Resource">
        <form onSubmit={handleCreateResource} className="space-y-4">
          <Input
            label="Title"
            value={resourceTitle}
            onChange={(e) => setResourceTitle(e.target.value)}
            placeholder="e.g. Lecture slides"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="resource-file"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Upload a file <span className="font-normal text-zinc-400">(optional, max 8 MB)</span>
            </label>
            <input
              id="resource-file"
              type="file"
              onChange={(e) => setResourceFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-600 hover:file:bg-indigo-100 dark:text-zinc-400 dark:file:bg-indigo-500/10 dark:file:text-indigo-400"
            />
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-400">or</div>
          <Input
            label="URL"
            type="url"
            value={resourceUrl}
            onChange={(e) => setResourceUrl(e.target.value)}
            placeholder="https://..."
          />
          <Input
            label="Description"
            value={resourceDescription}
            onChange={(e) => setResourceDescription(e.target.value)}
          />
          <Button type="submit" className="w-full">
            Save Resource
          </Button>
        </form>
      </Modal>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: number | string }> = ({ label, value }) => (
  <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
      {label}
    </p>
    <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{value}</p>
  </div>
);
