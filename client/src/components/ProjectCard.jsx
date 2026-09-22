import { FolderKanban, MoreHorizontal } from "lucide-react";
import React from "react";

export default function ProjectCard({ project, onDelete }) {
  return <div className="project-card">
    <div className="project-top"><div className="project-icon" style={{background: project.color}}><FolderKanban size={19}/></div><button className="icon-btn" onClick={() => onDelete(project._id)}><MoreHorizontal size={19}/></button></div>
    <h3>{project.name}</h3>
    <p>{project.description || "No project description yet."}</p>
    <div className="progress-row"><span>Progress</span><b>{project.progress}%</b></div>
    <div className="progress"><span style={{width: `${project.progress}%`, background: project.color}}/></div>
    <small>{project.completedCount} of {project.taskCount} tasks completed</small>
  </div>;
}
