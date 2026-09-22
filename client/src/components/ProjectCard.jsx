import { FolderKanban, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";

export default function ProjectCard({ project, onDelete, onRename }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(project.name);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus input when rename modal opens
  useEffect(() => {
    if (renaming && inputRef.current) inputRef.current.focus();
  }, [renaming]);

  const handleRename = (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (trimmed && trimmed !== project.name) {
      onRename(project._id, trimmed);
    }
    setRenaming(false);
    setMenuOpen(false);
  };

  return (
    <>
      <div className="project-card">
        <div className="project-top">
          <div className="project-icon" style={{ background: project.color }}>
            <FolderKanban size={19} />
          </div>
          <div className="card-menu-wrap" ref={menuRef}>
            <button
              className="icon-btn"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Project options"
            >
              <MoreHorizontal size={19} />
            </button>
            {menuOpen && (
              <div className="card-dropdown">
                <button
                  className="card-dd-item"
                  onClick={() => { setRenaming(true); setMenuOpen(false); }}
                >
                  <Pencil size={13} /> Rename
                </button>
                <button
                  className="card-dd-item danger"
                  onClick={() => { onDelete(project._id); setMenuOpen(false); }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
        <h3>{project.name}</h3>
        <p>{project.description || "No project description yet."}</p>
        <div className="progress-row">
          <span>Progress</span><b>{project.progress}%</b>
        </div>
        <div className="progress">
          <span style={{ width: `${project.progress}%`, background: project.color }} />
        </div>
        <small>{project.completedCount} of {project.taskCount} tasks completed</small>
      </div>

      {/* Rename Modal */}
      {renaming && (
        <div className="modal-backdrop" onClick={() => setRenaming(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Rename project</h3>
              <button className="icon-btn" onClick={() => setRenaming(false)}>✕</button>
            </div>
            <form className="modal-form" onSubmit={handleRename}>
              <label>
                New project name
                <input
                  ref={inputRef}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                />
              </label>
              <button className="primary full" type="submit">Save</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
