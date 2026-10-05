"use client";
import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/Card";
import { TaskCard } from "@/components/TaskCard";
import { EmptyState } from "@/components/EmptyState";
import { Modal } from "@/components/Modal";
import { Input } from "@/components/Input";
import { ICourse, ITask } from "@/types";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
};

function Button({ children, className = "", type = "button", ...props }: ButtonProps) {
    return (
        <button
            type={type}
            className={`inline-flex items-center justify-center rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:bg-gray-300 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export default function DashboardPage() {
    const [courses, setCourses] = useState<ICourse[]>([]);
    const [tasks, setTasks] = useState<ITask[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [courseId, setCourseId] = useState("");
    const [dueDate, setDueDate] = useState("");

    const fetchData = async () => {
        try {
            const [coursesRes, tasksRes] = await Promise.all([
                fetch("/api/courses"),
                fetch("/api/tasks"),
            ]);
            const coursesData = await coursesRes.json();
            const tasksData = await tasksRes.json();

            if (coursesData.success) setCourses(coursesData.data);
            if (tasksData.success) setTasks(tasksData.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTaskStatusChange = async (taskId: string, newStatus: ITask["status"]) => {
        const res = await fetch(`/api/tasks/${taskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) fetchData();
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description, courseId, dueDate }),
        });
        if (res.ok) {
            setIsTaskModalOpen(false);
            setTitle("");
            setDescription("");
            setDueDate("");
            fetchData();
        }
    };

    const completedTasks = tasks.filter((t) => t.status === "Completed").length;
    const progressPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col">
            <Navbar user={{ name: "Student" }} />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-navy">Study Dashboard</h1>
                        <p className="text-sm text-brand-slate">Overview of your courses and academic progress</p>
                    </div>
                    <Button onClick={() => setIsTaskModalOpen(true)} disabled={courses.length === 0}>
                        + Add Task
                    </Button>
                </div>

                {/* Metrics Grid */}
                <div className="grid sm:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-white border-l-4 border-l-brand-primary">
                        <span className="text-xs font-bold text-brand-slate uppercase tracking-wider">Total Courses</span>
                        <p className="text-3xl font-black text-brand-navy mt-1">{courses.length}</p>
                    </Card>
                    <Card className="bg-white border-l-4 border-l-brand-accent">
                        <span className="text-xs font-bold text-brand-slate uppercase tracking-wider">Active Tasks</span>
                        <p className="text-3xl font-black text-brand-navy mt-1">{tasks.length - completedTasks}</p>
                    </Card>
                    <Card className="bg-white border-l-4 border-l-emerald-500">
                        <span className="text-xs font-bold text-brand-slate uppercase tracking-wider">Overall Completion</span>
                        <p className="text-3xl font-black text-brand-navy mt-1">{progressPercent}%</p>
                    </Card>
                </div>

                {/* Dynamic Task Stream */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-brand-navy">Upcoming Tasks</h2>
                    {loading ? (
                        <p className="text-sm text-brand-slate">Loading workspace data...</p>
                    ) : tasks.length === 0 ? (
                        <EmptyState
                            title="No Tasks Found"
                            description={courses.length === 0 ? "Create a course first to start scheduling tasks." : "Add a task to keep track of your pending assignments."}
                            actionText={courses.length > 0 ? "Create First Task" : undefined}
                            onAction={() => setIsTaskModalOpen(true)}
                        />
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tasks.map((task) => (
                                <TaskCard
                                    key={task._id}
                                    task={task}
                                    onStatusChange={handleTaskStatusChange}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Task Creation Modal */}
            <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create New Task">
                <form onSubmit={handleCreateTask} className="space-y-4">
                    <Input label="Task Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-brand-slate">Course</label>
                        <select
                            value={courseId}
                            onChange={(e) => setCourseId(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-brand-slate"
                        >
                            <option value="">Select a course</option>
                            {courses.map((c) => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                    <Button type="submit" className="w-full">Save Task</Button>
                </form>
            </Modal>
        </div>
    );
}