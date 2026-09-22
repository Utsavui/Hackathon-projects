import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Sparkles, Target, CheckCircle2, Clock3, TrendingUp, WandSparkles, RefreshCw, Menu } from "lucide-react";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Sidebar from "../components/Sidebar.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import TaskRow from "../components/TaskRow.jsx";
import Modal from "../components/Modal.jsx";
import React from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: "#7c5cff" });
  const [taskForm, setTaskForm] = useState({ title: "", project: "", priority: "medium", dueDate: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [p, t] = await Promise.all([api.get("/projects"), api.get("/tasks")]);
      setProjects(p.data.projects);
      setTasks(t.data.tasks);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load workspace");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    projects: projects.length,
    total: tasks.length,
    done: tasks.filter(t => t.status === "done").length,
    active: tasks.filter(t => t.status !== "done").length,
  }), [projects, tasks]);

  const filtered = tasks.filter(t =>
    (filter === "all" || t.status === filter) &&
    (`${t.title} ${t.project?.name || ""}`).toLowerCase().includes(query.toLowerCase())
  );

  // Project actions
  const createProject = async e => {
    e.preventDefault();
    await api.post("/projects", form);
    setForm({ name: "", description: "", color: "#7c5cff" });
    setModal(false);
    load();
  };

  const deleteProject = async id => {
    if (confirm("Delete this project and its tasks?")) {
      await api.delete(`/projects/${id}`);
      load();
    }
  };

  const renameProject = async (id, newName) => {
    try {
      await api.put(`/projects/${id}`, { name: newName });
      load();
    } catch (e) {
      alert(e.response?.data?.message || "Could not rename project");
    }
  };

  // Task actions
  const createTask = async e => {
    e.preventDefault();
    await api.post("/tasks", taskForm);
    setTaskForm({ title: "", project: "", priority: "medium", dueDate: "" });
    setTaskModal(false);
    load();
  };

  const updateStatus = async (id, value) => { await api.put(`/tasks/${id}`, { status: value }); load(); };
  const deleteTask = async id => { await api.delete(`/tasks/${id}`); load(); };

  // AI — Generate: reads existing tasks and gives smart analysis
  const generate = async () => {
    if (tasks.length === 0) {
      setAiError("⚠️ Add some tasks first so AI can analyze them.");
      return;
    }
    setAiLoading(true);
    setAiError("");
    setAnalysis(null);
    try {
      const r = await api.post("/ai/analyze");
      setAnalysis(r.data.analysis);
    } catch (err) {
      if (!navigator.onLine || err.code === "ERR_NETWORK") {
        setAiError("⚠️ No internet connection. Please check your network.");
      } else if (err.response?.status === 503 || err.response?.status === 429) {
        setAiError("⏳ AI server is busy. Please try again in a moment.");
      } else {
        setAiError("❌ Could not get AI response. Please try again.");
      }
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button className="icon-btn hamburger-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div>
              <div className="eyebrow">PRODUCTIVITY DASHBOARD</div>
              <h1>Good morning, {user?.name?.split(" ")[0]} <span>✦</span></h1>
              <p>Here's what's happening across your workspace today.</p>
            </div>
          </div>
          <div className="top-actions">
            <button className="icon-btn" onClick={load}><RefreshCw size={18} /></button>
            <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
          </div>
        </header>

        {error && <div className="error-box wide">{error} <button onClick={load}>Retry</button></div>}

        <section className="stats-grid">
          <Stat icon={<Target />} label="Projects" value={stats.projects} note="Active workspaces" />
          <Stat icon={<CheckCircle2 />} label="Completed" value={stats.done} note={`${stats.total ? Math.round(stats.done / stats.total * 100) : 0}% of all tasks`} />
          <Stat icon={<Clock3 />} label="In progress" value={stats.active} note="Keep the momentum" />
          <Stat icon={<TrendingUp />} label="Completion" value={`${stats.total ? Math.round(stats.done / stats.total * 100) : 0}%`} note="Overall progress" />
        </section>

        <section className="content-grid">
          {/* Projects */}
          <div className="projects-section">
            <div className="section-head">
              <div><h2>Projects</h2><span>Your active initiatives</span></div>
              <button className="primary" onClick={() => setModal(true)}><Plus size={17} /> New project</button>
            </div>
            {loading
              ? <div className="loading-card"><div className="spinner" />Loading projects...</div>
              : projects.length
                ? <div className="project-grid">
                    {projects.map(p => (
                      <ProjectCard
                        key={p._id}
                        project={p}
                        onDelete={deleteProject}
                        onRename={renameProject}
                      />
                    ))}
                  </div>
                : <div className="empty-card">
                    <Target size={28} />
                    <h3>No projects yet</h3>
                    <p>Create your first project to start tracking progress.</p>
                    <button className="primary" onClick={() => setModal(true)}>Create project</button>
                  </div>
            }
          </div>

          {/* AI Card */}
          <aside className="ai-card">
            <div className="ai-glow" />
            <div className="ai-title">
              <div className="spark"><Sparkles size={19} /></div>
              <div><b>Nova AI</b><span>Productivity assistant</span></div>
            </div>
            <h3>Analyze your workspace.</h3>
            <p>
              {tasks.length === 0
                ? "Add tasks to your projects, then click Generate for a smart AI analysis."
                : `You have ${tasks.length} task${tasks.length > 1 ? "s" : ""}. Click Generate and AI will read them all and give you personalized advice.`
              }
            </p>

            <button
              className="ai-btn"
              onClick={generate}
              disabled={aiLoading}
              style={{ opacity: aiLoading ? 0.6 : 1, cursor: aiLoading ? "not-allowed" : "pointer", marginTop: "14px" }}
            >
              {aiLoading
                ? <><div className="spinner" style={{ width: 14, height: 14, margin: 0 }} /> Analyzing tasks...</>
                : <><WandSparkles size={16} /> Generate AI insights</>
              }
            </button>

            {aiError && (
              <div className="ai-error-box">
                <span>{aiError}</span>
                <button onClick={generate} className="ai-retry-btn">Retry</button>
              </div>
            )}

            {analysis && !aiError && (
              <div className="ai-analysis">
                <div className="analysis-item">
                  <span className="analysis-label">📊 Overview</span>
                  <p>{analysis.summary}</p>
                </div>
                <div className="analysis-item">
                  <span className="analysis-label">🎯 Do this next</span>
                  <p>{analysis.nextStep}</p>
                </div>
                <div className="analysis-item">
                  <span className="analysis-label">⚠️ Risk</span>
                  <p>{analysis.risk}</p>
                </div>
                <div className="analysis-item">
                  <span className="analysis-label">💡 Tip</span>
                  <p>{analysis.tip}</p>
                </div>
              </div>
            )}
          </aside>
        </section>

        {/* Task Board */}
        <section className="tasks-section">
          <div className="section-head">
            <div><h2>Task board</h2><span>{filtered.length} tasks matching your view</span></div>
            <button className="secondary" onClick={() => setTaskModal(true)}><Plus size={16} /> Add task</button>
          </div>
          <div className="toolbar">
            <div className="search">
              <Search size={17} />
              <input placeholder="Search tasks or projects..." value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <div className="filters">
              {["all", "todo", "in-progress", "done"].map(x => (
                <button key={x} className={filter === x ? "selected" : ""} onClick={() => setFilter(x)}>
                  {x === "all" ? "All" : x}
                </button>
              ))}
            </div>
          </div>
          {loading
            ? <div className="loading-card"><div className="spinner" />Loading tasks...</div>
            : filtered.length
              ? <div className="task-list">{filtered.map(t => <TaskRow key={t._id} task={t} onStatus={updateStatus} onDelete={deleteTask} />)}</div>
              : <div className="empty-card compact"><CheckCircle2 size={25} /><h3>No matching tasks</h3><p>Try another filter or add a new task.</p></div>
          }
        </section>

        {/* Create Project Modal */}
        <Modal open={modal} title="Create project" onClose={() => setModal(false)}>
          <form className="modal-form" onSubmit={createProject}>
            <label>Project name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
            <label>Description<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
            <label>Accent color<input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></label>
            <button className="primary full">Create project</button>
          </form>
        </Modal>

        {/* Add Task Modal */}
        <Modal open={taskModal} title="Add task" onClose={() => setTaskModal(false)}>
          <form className="modal-form" onSubmit={createTask}>
            <label>Task title<input required value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} /></label>
            <label>
              Project
              <select required value={taskForm.project} onChange={e => setTaskForm({ ...taskForm, project: e.target.value })}>
                <option value="">Select project</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </label>
            <div className="two-col">
              <label>
                Priority
                <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                  {["low", "medium", "high", "urgent"].map(x => <option key={x}>{x}</option>)}
                </select>
              </label>
              <label>Due date<input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} /></label>
            </div>
            <button className="primary full">Create task</button>
          </form>
        </Modal>
      </main>
    </div>
  );
}

function Stat({ icon, label, value, note }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div><span>{label}</span><strong>{value}</strong><small>{note}</small></div>
    </div>
  );
}
