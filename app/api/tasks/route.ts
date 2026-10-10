import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/models/Task";
import { getAuthUser } from "@/lib/auth";
import { getUserCourseIds, isCourseParticipant } from "@/lib/access";
import { publish } from "@/lib/events";
import { toPlain, toPlainArray } from "@/lib/serialize";
import type { ITask } from "@/types";

export async function GET(req: Request) {
  const authUser = await getAuthUser();
  if (!authUser)
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  await connectToDatabase();
  let tasks;

  if (courseId) {
    if (!(await isCourseParticipant(courseId, authUser.userId))) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
    }
    tasks = await Task.find({ courseId }).populate("courseId", "name").sort({ dueDate: 1 }).lean();
  } else {
    const courseIds = await getUserCourseIds(authUser.userId);
    if (courseIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }
    tasks = await Task.find({ courseId: { $in: courseIds } })
      .populate("courseId", "name")
      .sort({ dueDate: 1 })
      .lean();
  }

  return NextResponse.json({ success: true, data: toPlainArray<ITask>(tasks) });
}

export async function POST(req: Request) {
  const authUser = await getAuthUser();
  if (!authUser)
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { title, description, courseId, dueDate } = await req.json();
  if (!title || !courseId || !dueDate) {
    return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
  }

  await connectToDatabase();
  if (!(await isCourseParticipant(courseId, authUser.userId))) {
    return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
  }

  const task = await Task.create({
    title,
    description: description || "",
    courseId,
    dueDate,
    userId: authUser.userId,
    status: "Not Started",
  });

  publish(`course:${courseId}`, { type: "tasks" });
  return NextResponse.json({ success: true, data: toPlain<ITask>(task) }, { status: 201 });
}
