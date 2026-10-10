import mongoose from "mongoose";
import { connectToDatabase } from "./mongodb";
import Course from "@/models/Course";

export function participantFilter(userId: string) {
  return { $or: [{ ownerId: userId }, { members: userId }] };
}

export async function getUserCourseIds(userId: string): Promise<string[]> {
  await connectToDatabase();
  const courses = await Course.find(participantFilter(userId)).select("_id").lean();
  return courses.map((course) => course._id.toString());
}

export async function isCourseParticipant(courseId: string, userId: string): Promise<boolean> {
  if (!mongoose.isValidObjectId(courseId)) return false;
  await connectToDatabase();
  const course = await Course.exists({ _id: courseId, ...participantFilter(userId) });
  return Boolean(course);
}

export async function isCourseOwner(courseId: string, userId: string): Promise<boolean> {
  if (!mongoose.isValidObjectId(courseId)) return false;
  await connectToDatabase();
  const course = await Course.exists({ _id: courseId, ownerId: userId });
  return Boolean(course);
}
