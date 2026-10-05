import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Course from "@/models/Course";
import Task from "@/models/Task";
import Resource from "@/models/Resource";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const course = await Course.findOne({ _id: params.id, ownerId: authUser.userId });
    if (!course) return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: course });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const course = await Course.findOneAndDelete({ _id: params.id, ownerId: authUser.userId });
    if (!course) return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });

    // Cascading deletion
    await Task.deleteMany({ courseId: params.id });
    await Resource.deleteMany({ courseId: params.id });

    return NextResponse.json({ success: true, data: course });
}