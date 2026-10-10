import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Course from "@/models/Course";
import { getAuthUser } from "@/lib/auth";
import { participantFilter } from "@/lib/access";
import { publish } from "@/lib/events";
import { toPlain } from "@/lib/serialize";
import type { ICourse } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

function serializeCourse(doc: Record<string, unknown>): ICourse {
  const plain = toPlain<ICourse>(doc);
  return {
    ...plain,
    members: Array.isArray(doc.members) ? (doc.members as string[]).map(String) : [],
  };
}

export async function GET(_req: Request, { params }: RouteContext) {
  const authUser = await getAuthUser();
  if (!authUser)
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectToDatabase();
  const course = await Course.findOne({
    _id: id,
    ...participantFilter(authUser.userId),
  }).lean();
  if (!course)
    return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
  return NextResponse.json({
    success: true,
    data: serializeCourse(course as unknown as Record<string, unknown>),
  });
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const authUser = await getAuthUser();
  if (!authUser)
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, description } = (await req.json()) as Partial<
    Pick<ICourse, "name" | "description">
  >;
  if (!name && !description) {
    return NextResponse.json({ success: false, error: "Nothing to update" }, { status: 400 });
  }

  await connectToDatabase();
  const updates: Partial<Pick<ICourse, "name" | "description">> = {};
  if (name) updates.name = name;
  if (description) updates.description = description;

  const course = await Course.findOneAndUpdate(
    { _id: id, ownerId: authUser.userId },
    { $set: updates },
    { returnDocument: "after" }
  ).lean();

  if (!course)
    return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
  publish(`course:${id}`, { type: "course" });
  return NextResponse.json({
    success: true,
    data: serializeCourse(course as unknown as Record<string, unknown>),
  });
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const authUser = await getAuthUser();
  if (!authUser)
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectToDatabase();
  const course = await Course.findOneAndDelete({ _id: id, ownerId: authUser.userId }).lean();
  if (!course)
    return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });

  publish(`course:${id}`, { type: "course" });
  return NextResponse.json({ success: true, data: toPlain<ICourse>(course) });
}
