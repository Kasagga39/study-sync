import React from "react";
import { Card } from "./Card";
import { ITask } from "@/types";

interface TaskCardProps {
    task: ITask;
    onStatusChange?: (id: string, newStatus: ITask["status"]) => void;
    onDelete?: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onDelete }) => {
    const statusColors = {
        "Not Started": "bg-gray-100 text-gray-700 border-gray-300",
        "In Progress": "bg-amber-50 text-amber-800 border-amber-300",
        "Completed": "bg-emerald-50 text-emerald-800 border-emerald-300",
    };

    const formattedDate = new Date(task.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });

    return (
        <Card className="flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                    <h4 className={`font-semibold text-brand-navy ${task.status === "Completed" ? "line-through opacity-60" : ""}`}>
                        {task.title}
                    </h4>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium whitespace-nowrap ${statusColors[task.status]}`}>
                        {task.status}
                    </span>
                </div>
                <p className="text-xs text-brand-slate/80 mb-3">{task.description}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs mt-2">
                <span className="text-gray-500 font-medium">Due: {formattedDate}</span>
                <div className="flex items-center gap-2">
                    {onStatusChange && (
                        <select
                            value={task.status}
                            onChange={(e) => onStatusChange(task._id, e.target.value as ITask["status"])}
                            className="bg-gray-50 border border-gray-200 rounded text-xs px-2 py-1 text-brand-slate focus:outline-none"
                        >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(task._id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            aria-label="Delete task"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
};