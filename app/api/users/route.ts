import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Course from "@/models/Course";
import { getAuthUser } from "@/lib/auth";
import { toPlainArray } from "@/lib/serialize";
import type { IMember } from "@/types";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: Request) {
  const authUser = await getAuthUser();
  if (!authUser)
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("query") ?? "").trim();
  const courseId = searchParams.get("courseId");

  await connectToDatabase();

  const excludeIds: string[] = [authUser.userId];
  if (courseId && mongoose.isValidObjectId(courseId)) {
    const course = await Course.findById(courseId).select("ownerId members").lean();
    if (course) {
      excludeIds.push(course.ownerId.toString());
      for (const member of course.members || []) excludeIds.push(member.toString());
    }
  }

  const filter: Record<string, unknown> = { _id: { $nin: excludeIds, $type: "objectId" } };
  if (query) {
    const safe = escapeRegex(query);
    filter.$or = [
      { name: { $regex: safe, $options: "i" } },
      { email: { $regex: safe, $options: "i" } },
    ];
  }

  const users = await User.find(filter).select("name email").sort({ name: 1 }).limit(20).lean();
  const data = toPlainArray<IMember>(users).map((u) => ({
    ...u,
    name: u.name || u.email || "Unnamed",
  }));
  return NextResponse.json({ success: true, data });
}
