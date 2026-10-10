import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Resource from "@/models/Resource";
import { getAuthUser } from "@/lib/auth";
import { isCourseOwner, isCourseParticipant } from "@/lib/access";
import { publish } from "@/lib/events";
import { toPlain, toPlainArray } from "@/lib/serialize";
import type { IResource } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const authUser = await getAuthUser();
  if (!authUser)
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectToDatabase();
  const resource = await Resource.findById(id).lean();
  if (!resource)
    return NextResponse.json({ success: false, error: "Resource not found" }, { status: 404 });

  const canView =
    resource.userId.toString() === authUser.userId ||
    (await isCourseParticipant(resource.courseId.toString(), authUser.userId));
  if (!canView)
    return NextResponse.json({ success: false, error: "Resource not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: toPlain<IResource>(resource) });
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const authUser = await getAuthUser();
  if (!authUser)
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const updates = (await req.json()) as Partial<IResource>;
  await connectToDatabase();

  const existing = await Resource.findById(id).lean();
  if (!existing)
    return NextResponse.json({ success: false, error: "Resource not found" }, { status: 404 });

  const courseId = existing.courseId.toString();
  const canManage =
    existing.userId.toString() === authUser.userId ||
    (await isCourseOwner(courseId, authUser.userId));
  if (!canManage)
    return NextResponse.json({ success: false, error: "Resource not found" }, { status: 404 });

  const allowed: Partial<IResource> = {};
  if (updates.title) allowed.title = updates.title;
  if (typeof updates.description === "string") allowed.description = updates.description;
  if (updates.url) allowed.url = updates.url;

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ success: false, error: "Nothing to update" }, { status: 400 });
  }

  const resource = await Resource.findOneAndUpdate(
    { _id: id },
    { $set: allowed },
    { returnDocument: "after" }
  ).lean();

  publish(`course:${courseId}`, { type: "resources" });
  return NextResponse.json({ success: true, data: toPlain<IResource>(resource) });
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const authUser = await getAuthUser();
  if (!authUser)
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectToDatabase();

  const existing = await Resource.findById(id).lean();
  if (!existing)
    return NextResponse.json({ success: false, error: "Resource not found" }, { status: 404 });

  const courseId = existing.courseId.toString();
  const canManage =
    existing.userId.toString() === authUser.userId ||
    (await isCourseOwner(courseId, authUser.userId));
  if (!canManage)
    return NextResponse.json({ success: false, error: "Resource not found" }, { status: 404 });

  await Resource.findByIdAndDelete(id);
  publish(`course:${courseId}`, { type: "resources" });
  return NextResponse.json({ success: true, data: toPlainArray<IResource>([existing])[0] });
}
