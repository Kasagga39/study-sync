import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Course from "@/models/Course";
import User from "@/models/User";
import { getAuthUser } from "@/lib/auth";
import { isCourseOwner, isCourseParticipant } from "@/lib/access";
import { publish } from "@/lib/events";
import { toPlain } from "@/lib/serialize";
import type { IMember } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

async function getMemberList(courseId: string) {
  const course = await Course.findById(courseId).lean();
  if (!course) return null;

  const memberIds = course.members || [];
  const memberDocs = await User.find({ _id: { $in: memberIds } })
    .select("name email")
    .lean();
  const owner = await User.findById(course.ownerId).select("name email").lean();

  const normalize = (id: IMember): IMember => ({ ...id, name: id.name || id.email || "Unnamed" });

  const members: IMember[] = memberDocs.map((m) => normalize(toPlain<IMember>(m)));
  return { owner: owner ? normalize(toPlain<IMember>(owner)) : null, members };
}

export async function GET(_req: Request, { params }: RouteContext) {
  const authUser = await getAuthUser();
  if (!authUser)
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const canView = await isCourseParticipant(id, authUser.userId);
  if (!canView)
    return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });

  await connectToDatabase();
  const list = await getMemberList(id);
  if (!list)
    return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: list });
}

export async function POST(req: Request, { params }: RouteContext) {
  const authUser = await getAuthUser();
  if (!authUser)
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const isOwner = await isCourseOwner(id, authUser.userId);
  if (!isOwner)
    return NextResponse.json(
      { success: false, error: "Only the course owner can share" },
      { status: 403 }
    );

  const { email, userId } = (await req.json()) as { email?: string; userId?: string };
  if (!email && !userId)
    return NextResponse.json(
      { success: false, error: "An email or userId is required" },
      { status: 400 }
    );

  await connectToDatabase();
  const user =
    userId && mongoose.isValidObjectId(userId)
      ? await User.findById(userId).select("_id").lean()
      : email
        ? await User.findOne({ email: email.trim().toLowerCase() }).select("_id").lean()
        : null;
  if (!user)
    return NextResponse.json(
      { success: false, error: "No account found for that user" },
      { status: 404 }
    );

  const course = await Course.findOneAndUpdate(
    { _id: id, ownerId: authUser.userId },
    { $addToSet: { members: user._id } },
    { returnDocument: "after" }
  ).lean();
  if (!course)
    return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });

  publish(`course:${id}`, { type: "members" });
  const list = await getMemberList(id);
  return NextResponse.json({ success: true, data: list });
}

export async function DELETE(req: Request, { params }: RouteContext) {
  const authUser = await getAuthUser();
  if (!authUser)
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { userId } = (await req.json()) as { userId?: string };
  if (!userId)
    return NextResponse.json({ success: false, error: "A user id is required" }, { status: 400 });

  await connectToDatabase();
  const course = await Course.findOneAndUpdate(
    { _id: id, ownerId: authUser.userId },
    { $pull: { members: userId } },
    { returnDocument: "after" }
  ).lean();
  if (!course)
    return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });

  publish(`course:${id}`, { type: "members" });
  const list = await getMemberList(id);
  return NextResponse.json({ success: true, data: list });
}
