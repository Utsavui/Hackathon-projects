import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, default: "", maxlength: 500 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  color: { type: String, default: "#7c5cff" }
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);
