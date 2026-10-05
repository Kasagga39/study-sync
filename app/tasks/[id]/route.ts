import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/models/Task";
import { getAuthUser } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const updates = await req.json();
    await connectToDatabase();

    const task = await Task.findOneAndUpdate(
        { _id: params.id, userId: authUser.userId },
        { $set: updates },
        { new: true }
    );

    if (!task) return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: task });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const task = await Task.findOneAndDelete({ _id: params.id, userId: authUser.userId });
    if (!task) return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: task });
}