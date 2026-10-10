import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Resource from "@/models/Resource";
import { getAuthUser } from "@/lib/auth";
import { getUserCourseIds, isCourseParticipant } from "@/lib/access";
import { publish } from "@/lib/events";
import { toPlain, toPlainArray } from "@/lib/serialize";
import type { IResource } from "@/types";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

export async function GET(req: Request) {
  const authUser = await getAuthUser();
  if (!authUser)
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  await connectToDatabase();
  let resources;

  if (courseId) {
    if (!(await isCourseParticipant(courseId, authUser.userId))) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
    }
    resources = await Resource.find({ courseId }).sort({ createdAt: -1 }).lean();
  } else {
    const courseIds = await getUserCourseIds(authUser.userId);
    if (courseIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }
    resources = await Resource.find({ courseId: { $in: courseIds } })
      .sort({ createdAt: -1 })
      .lean();
  }

  return NextResponse.json({ success: true, data: toPlainArray<IResource>(resources) });
}

export async function POST(req: Request) {
  const authUser = await getAuthUser();
  if (!authUser)
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const contentType = req.headers.get("content-type") ?? "";
  let title = "";
  let description = "";
  let courseId = "";
  let url = "";
  let file: File | null = null;

  if (contentType.includes("application/json")) {
    const body = (await req.json()) as Partial<IResource>;
    title = (body.title ?? "").trim();
    description = (body.description ?? "").trim();
    courseId = String(body.courseId ?? "").trim();
    url = (body.url ?? "").trim();
  } else {
    const form = await req.formData();
    title = String(form.get("title") ?? "").trim();
    description = String(form.get("description") ?? "").trim();
    courseId = String(form.get("courseId") ?? "").trim();
    url = String(form.get("url") ?? "").trim();
    const uploaded = form.get("file");
    file = uploaded !== null && typeof uploaded !== "string" ? uploaded : null;
  }

  if (!title || !courseId) {
    return NextResponse.json(
      { success: false, error: "Title and course are required" },
      { status: 400 }
    );
  }

  const hasUrl = url.length > 0;
  if (!hasUrl && !file) {
    return NextResponse.json(
      { success: false, error: "Provide a URL or upload a file" },
      { status: 400 }
    );
  }

  await connectToDatabase();
  if (!(await isCourseParticipant(courseId, authUser.userId))) {
    return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
  }

  const doc: Record<string, unknown> = {
    title,
    description,
    courseId,
    userId: authUser.userId,
  };

  if (file) {
    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File is too large (max 8 MB)" },
        { status: 413 }
      );
    }
    doc.url = "";
    doc.fileName = file.name || "upload";
    doc.contentType = file.type || "application/octet-stream";
    doc.fileSize = bytes.byteLength;
    doc.fileData = bytes;
  } else {
    doc.url = url;
  }

  const resource = await Resource.create(doc);
  publish(`course:${courseId}`, { type: "resources" });
  const data = toPlain<IResource>(resource) as IResource & { fileData?: unknown };
  delete data.fileData;
  return NextResponse.json({ success: true, data }, { status: 201 });
}
