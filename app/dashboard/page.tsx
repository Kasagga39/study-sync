import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Course from "@/models/Course";
import Task from "@/models/Task";
import { getUserCourseIds } from "@/lib/access";
import { toPlainArray } from "@/lib/serialize";
import { DashboardView } from "@/components/DashboardView";
import type { ICourse, ITask } from "@/types";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await connectToDatabase();
  const courseIds = await getUserCourseIds(user._id);

  const [courses, tasks] = await Promise.all([
    Course.find({ _id: { $in: courseIds } })
      .sort({ createdAt: -1 })
      .lean(),
    Task.find({ courseId: { $in: courseIds } })
      .populate("courseId", "name")
      .sort({ dueDate: 1 })
      .lean(),
  ]);

  return (
    <DashboardView
      user={user}
      initialCourses={toPlainArray<ICourse>(courses)}
      initialTasks={toPlainArray<ITask>(tasks)}
    />
  );
}
