import { CalendarDays, Circle, CheckCircle2 } from "lucide-react";
import React from "react";

const nextStatus = { todo: "in-progress", "in-progress": "done", done: "todo" };

export default function TaskRow({ task, onStatus, onDelete }) {
  return <div className="task-row">
    <button className="check-btn" onClick={() => onStatus(task._id, nextStatus[task.status])}>
      {task.status === "done" ? <CheckCircle2 size={21}/> : <Circle size={21}/>}
    </button>
    <div className="task-main">
      <strong className={task.status === "done" ? "done-text" : ""}>{task.title}</strong>
      <span>{task.project?.name || "Project"} {task.dueDate && <>· <CalendarDays size={12}/> {new Date(task.dueDate).toLocaleDateString()}</>}</span>
    </div>
    <span className={`pill ${task.priority}`}>{task.priority}</span>
    <span className={`status ${task.status}`}>{task.status}</span>
    <button className="delete-link" onClick={() => onDelete(task._id)}>Delete</button>
  </div>;
}
