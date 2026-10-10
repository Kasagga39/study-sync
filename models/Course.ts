import { Schema, model, models } from "mongoose";

const CourseSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  createdAt: { type: Date, default: Date.now },
});

export default models.Course || model("Course", CourseSchema);
