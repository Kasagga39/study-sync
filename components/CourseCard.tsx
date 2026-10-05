import React from "react";
import Link from "next/link";
import { Card } from "./Card";
import { ICourse } from "@/types";

interface CourseCardProps {
    course: ICourse;
    onDelete?: (id: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onDelete }) => {
    return (
        <Card className="flex flex-col justify-between h-full group hover:border-brand-primary/40">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-brand-navy group-hover:text-brand-primary transition-colors">
                        {course.name}
                    </h3>
                    {onDelete && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onDelete(course._id);
                            }}
                            className="text-gray-400 hover:text-red-600 text-xs px-2 py-1 rounded"
                            title="Delete course"
                        >
                            Delete
                        </button>
                    )}
                </div>
                <p className="text-sm text-brand-slate/80 line-clamp-3 mb-4">{course.description}</p>
            </div>
            <Link
                href={`/courses/${course._id}`}
                className="inline-flex items-center text-xs font-bold text-brand-primary hover:text-brand-navy mt-auto"
            >
                View Workspace →
            </Link>
        </Card>
    );
};