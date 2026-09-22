import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { auth } from "../middleware/auth.js";

const router = Router();
router.use(auth);

const schema = z.object({
  title: z.string().min(2).max(180),
  description: z.string().max(1000).optional().default(""),
  project: z.string().min(1),
  assignee: z.string().optional().nullable().default(null),
  status: z.enum(["todo", "in-progress", "done"]).optional().default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium"),
  dueDate: z.string().optional().nullable().default(null)
});

async function ownedProject(projectId, userId) {
  return Project.findOne({ _id: projectId, owner: userId });
}

router.get("/", async (req, res, next) => {
  try {
    const projects = await Project.find({ owner: req.user._id }).select("_id");
    const projectIds = projects.map(p => p._id);
    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate("project", "name color")
      .populate("assignee", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate("project", "name owner");
    if (!task || String(task.project.owner) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    res.json({ success: true, task });
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    if (!mongoose.isValidObjectId(data.project)) return res.status(400).json({ success: false, message: "Invalid project id" });
    if (!(await ownedProject(data.project, req.user._id))) return res.status(403).json({ success: false, message: "Project access denied" });
    const task = await Task.create(data);
    const populated = await task.populate("project", "name color");
    res.status(201).json({ success: true, task: populated });
  } catch (err) { next(err); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const data = schema.partial().parse(req.body);
    const current = await Task.findById(req.params.id).populate("project", "owner");
    if (!current || String(current.project.owner) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    if (data.project && !(await ownedProject(data.project, req.user._id))) {
      return res.status(403).json({ success: false, message: "Project access denied" });
    }
    const task = await Task.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
      .populate("project", "name color").populate("assignee", "name email");
    res.json({ success: true, task });
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate("project", "owner");
    if (!task || String(task.project.owner) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    await task.deleteOne();
    res.json({ success: true, message: "Task deleted" });
  } catch (err) { next(err); }
});

export default router;
