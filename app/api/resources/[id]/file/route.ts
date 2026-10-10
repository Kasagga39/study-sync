import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Resource from "@/models/Resource";
import { getAuthUser } from "@/lib/auth";
import { isCourseParticipant } from "@/lib/access";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const authUser = await getAuthUser();
  if (!authUser)
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectToDatabase();
  const resource = await Resource.findById(id).select("+fileData");

  if (!resource || !resource.fileData) {
    return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
  }

  const canView =
    resource.userId.toString() === authUser.userId ||
    (await isCourseParticipant(resource.courseId.toString(), authUser.userId));
  if (!canView)
    return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });

  const buffer = Buffer.from(resource.fileData);
  const fileName = resource.fileName || "download";
  const contentType = resource.contentType || "application/octet-stream";

  return new Response(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(buffer.byteLength),
      "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
