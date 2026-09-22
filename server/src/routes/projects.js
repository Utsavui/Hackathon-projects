import { Router } from "express";
import { z } from "zod";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { auth } from "../middleware/auth.js";

const router = Router();
router.use(auth);

const schema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional().default(""),
  color: z.string().optional().default("#7c5cff")
});

router.get("/", async (req, res, next) => {
  try {
    const projects = await Project.find({ owner: req.user._id }).sort({ createdAt: -1 });
    const withStats = await Promise.all(projects.map(async p => {
      const tasks = await Task.find({ project: p._id });
      const done = tasks.filter(t => t.status === "done").length;
      return { ...p.toObject(), taskCount: tasks.length, completedCount: done, progress: tasks.length ? Math.round(done / tasks.length * 100) : 0 };
    }));
    res.json({ success: true, projects: withStats });
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    res.json({ success: true, project });
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    const project = await Project.create({ ...data, owner: req.user._id });
    res.status(201).json({ success: true, project });
  } catch (err) { next(err); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const data = schema.partial().parse(req.body);
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id }, data, { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    res.json({ success: true, project });
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    await Task.deleteMany({ project: project._id });
    res.json({ success: true, message: "Project and its tasks deleted" });
  } catch (err) { next(err); }
});

export default router;
