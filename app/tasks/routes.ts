import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/models/Task";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    await connectToDatabase();
    const query: any = { userId: authUser.userId };
    if (courseId) query.courseId = courseId;

    const tasks = await Task.find(query).populate("courseId", "name").sort({ dueDate: 1 });
    return NextResponse.json({ success: true, data: tasks });
}

export async function POST(req: Request) {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { title, description, courseId, dueDate } = await req.json();
    if (!title || !courseId || !dueDate) {
        return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const task = await Task.create({
        title,
        description: description || "",
        courseId,
        dueDate,
        userId: authUser.userId,
        status: "Not Started",
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
}