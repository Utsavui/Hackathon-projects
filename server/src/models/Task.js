import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, default: "", maxlength: 1000 },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo" },
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
  dueDate: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
