import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Course from "@/models/Course";
import { participantFilter } from "@/lib/access";
import { toPlainArray } from "@/lib/serialize";
import { CoursesView } from "@/components/CoursesView";
import type { ICourse } from "@/types";

export default async function CoursesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await connectToDatabase();
  const courses = await Course.find(participantFilter(user._id)).sort({ createdAt: -1 }).lean();

  return <CoursesView user={user} initialCourses={toPlainArray<ICourse>(courses)} />;
}
