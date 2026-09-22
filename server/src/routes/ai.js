import { Router } from "express";
import { z } from "zod";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { auth } from "../middleware/auth.js";
import { generateTasks, productivity } from "../services/ai.js";

const router = Router();
router.use(auth);

router.post("/generate-tasks", async (req, res, next) => {
  try {
    const data = z.object({
      projectId: z.string(),
      projectName: z.string().min(1),
      description: z.string().optional().default("")
    }).parse(req.body);

    const project = await Project.findOne({ _id: data.projectId, owner: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const items = await generateTasks(data.projectName, data.description);
    res.json({ success: true, tasks: items });
  } catch (err) { next(err); }
});

router.post("/productivity", async (req, res, next) => {
  try {
    const projects = await Project.find({ owner: req.user._id }).select("_id");
    const tasks = await Task.find({ project: { $in: projects.map(p => p._id) } }).select("title status priority dueDate");
    const suggestion = await productivity(tasks);
    res.json({ success: true, suggestion });
  } catch (err) { next(err); }
});

export default router;
