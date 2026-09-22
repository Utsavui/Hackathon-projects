import { Router } from "express";
import { z } from "zod";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { auth } from "../middleware/auth.js";
import { generateTasks, productivity, analyzeTasks } from "../services/ai.js";

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

router.post("/analyze", async (req, res, next) => {
  try {
    // Fetch all user projects with stats
    const projects = await Project.find({ owner: req.user._id }).sort({ createdAt: -1 });
    const projectsWithStats = await Promise.all(projects.map(async (p) => {
      const tasks = await Task.find({ project: p._id });
      const done = tasks.filter(t => t.status === "done").length;
      return {
        ...p.toObject(),
        taskCount: tasks.length,
        completedCount: done,
        progress: tasks.length ? Math.round(done / tasks.length * 100) : 0,
      };
    }));

    // Fetch all tasks with project name populated
    const allProjectIds = projects.map(p => p._id);
    const tasks = await Task.find({ project: { $in: allProjectIds } })
      .populate("project", "name")
      .select("title status priority dueDate project");

    const analysis = await analyzeTasks(tasks, projectsWithStats);
    res.json({ success: true, analysis });
  } catch (err) { next(err); }
});

export default router;
