import { Schema, model, models } from "mongoose";

const ResourceSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  url: { type: String, default: "" },
  fileName: { type: String, default: "" },
  contentType: { type: String, default: "" },
  fileSize: { type: Number, default: 0 },
  fileData: { type: Buffer, select: false, default: undefined },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default models.Resource || model("Resource", ResourceSchema);
