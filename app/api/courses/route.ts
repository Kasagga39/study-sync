import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Course from "@/models/Course";
import { getAuthUser } from "@/lib/auth";
import { participantFilter } from "@/lib/access";
import { toPlain } from "@/lib/serialize";
import type { ICourse } from "@/types";

function serializeCourse(doc: Record<string, unknown>): ICourse {
  const plain = toPlain<ICourse>(doc);
  return {
    ...plain,
    members: Array.isArray(doc.members) ? (doc.members as string[]).map(String) : [],
  };
}

export async function GET() {
  const authUser = await getAuthUser();
  if (!authUser)
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const courses = (await Course.find(participantFilter(authUser.userId))
    .sort({ createdAt: -1 })
    .lean()) as unknown as Array<Record<string, unknown>>;
  return NextResponse.json({ success: true, data: courses.map(serializeCourse) });
}

export async function POST(req: Request) {
  const authUser = await getAuthUser();
  if (!authUser)
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { name, description } = (await req.json()) as Partial<ICourse>;
  if (!name || !description) {
    return NextResponse.json(
      { success: false, error: "Name and description are required" },
      { status: 400 }
    );
  }

  await connectToDatabase();
  const course = await Course.create({ name, description, ownerId: authUser.userId, members: [] });
  return NextResponse.json({ success: true, data: toPlain<ICourse>(course) }, { status: 201 });
}
