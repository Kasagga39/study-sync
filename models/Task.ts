import { Schema, model, models } from "mongoose";

const TaskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ["Not Started", "In Progress", "Completed"],
        default: "Not Started"
    },
    createdAt: { type: Date, default: Date.now },
});

export default models.Task || model("Task", TaskSchema);