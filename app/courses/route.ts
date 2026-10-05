import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Course from "@/models/Course";
import Task from "@/models/Task";
import Resource from "@/models/Resource";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const courses = await Course.find({ ownerId: authUser.userId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: courses });
}

export async function POST(req: Request) {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { name, description } = await req.json();
    if (!name || !description) return NextResponse.json({ success: false, error: "Name and description are required" }, { status: 400 });

    await connectToDatabase();
    const course = await Course.create({ name, description, ownerId: authUser.userId });
    return NextResponse.json({ success: true, data: course }, { status: 201 });
}