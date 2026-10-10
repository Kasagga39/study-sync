import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Course from "@/models/Course";
import User from "@/models/User";
import Task from "@/models/Task";
import Resource from "@/models/Resource";
import { participantFilter } from "@/lib/access";
import { toPlain, toPlainArray } from "@/lib/serialize";
import { CourseWorkspace } from "@/components/CourseWorkspace";
import type { ICourse, IMember, IResource, ITask } from "@/types";

export default async function CourseWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await connectToDatabase();
  const course = await Course.findOne({ _id: id, ...participantFilter(user._id) }).lean();
  if (!course) notFound();

  const [tasks, resources, memberDocs, owner] = await Promise.all([
    Task.find({ courseId: id }).populate("courseId", "name").sort({ dueDate: 1 }).lean(),
    Resource.find({ courseId: id }).sort({ createdAt: -1 }).lean(),
    User.find({ _id: { $in: course.members || [] } })
      .select("name email")
      .lean(),
    User.findById(course.ownerId).select("name email").lean(),
  ]);

  const initialMembers = {
    owner: toPlain<IMember>(owner),
    members: toPlainArray<IMember>(memberDocs),
  };

  return (
    <CourseWorkspace
      user={user}
      course={toPlain<ICourse>(course)}
      initialTasks={toPlainArray<ITask>(tasks)}
      initialResources={toPlainArray<IResource>(resources)}
      initialMembers={initialMembers}
    />
  );
}
