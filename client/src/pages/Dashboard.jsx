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
  const [projects,setProjects]=useState([]), [tasks,setTasks]=useState([]);
  const [loading,setLoading]=useState(true), [error,setError]=useState("");
  const [query,setQuery]=useState(""), [filter,setFilter]=useState("all");
  const [modal,setModal]=useState(false), [suggestion,setSuggestion]=useState("");
  const [aiLoading,setAiLoading]=useState(false), [aiError,setAiError]=useState("");
  const [form,setForm]=useState({name:"",description:"",color:"#7c5cff"});
  const [taskForm,setTaskForm]=useState({title:"",project:"",priority:"medium",dueDate:""});
  const [taskModal,setTaskModal]=useState(false);
  const [sidebarOpen,setSidebarOpen]=useState(false);

  const load=async()=>{setLoading(true);setError("");try{const [p,t]=await Promise.all([api.get("/projects"),api.get("/tasks")]);setProjects(p.data.projects);setTasks(t.data.tasks)}catch(e){setError(e.response?.data?.message||"Could not load workspace")}finally{setLoading(false)}};
  useEffect(()=>{load()},[]);

  const stats=useMemo(()=>({projects:projects.length,total:tasks.length,done:tasks.filter(t=>t.status==="done").length,active:tasks.filter(t=>t.status!=="done").length}),[projects,tasks]);
  const filtered=tasks.filter(t=>(filter==="all"||t.status===filter)&&(`${t.title} ${t.project?.name||""}`.toLowerCase().includes(query.toLowerCase())));

  const createProject=async e=>{e.preventDefault();await api.post("/projects",form);setForm({name:"",description:"",color:"#7c5cff"});setModal(false);load()};
  const deleteProject=async id=>{if(confirm("Delete this project and its tasks?")){await api.delete(`/projects/${id}`);load()}};
  const createTask=async e=>{e.preventDefault();await api.post("/tasks",taskForm);setTaskForm({title:"",project:"",priority:"medium",dueDate:""});setTaskModal(false);load()};
  const status=async(id,value)=>{await api.put(`/tasks/${id}`,{status:value});load()};
  const delTask=async id=>{await api.delete(`/tasks/${id}`);load()};

  const getAiError=(err)=>{
    if(!navigator.onLine||err.code==="ERR_NETWORK"||err.message?.includes("Network Error")) return "⚠️ No internet connection. Please check your network and try again.";
    if(err.response?.status===503||err.response?.status===429) return "⏳ AI server is busy right now. Please try again in a moment.";
    if(err.response?.status===500) return "❌ AI server error. Please try again later.";
    return "⚠️ Could not connect to AI. Please check your internet and try again.";
  };

  const generate=async()=>{
    const p=projects[0];if(!p)return;
    setAiLoading(true);setAiError("");setSuggestion("");
    try{
      const r=await api.post("/ai/generate-tasks",{projectId:p._id,projectName:p.name,description:p.description});
      setSuggestion(r.data.tasks.map(x=>`${x.title} — ${x.priority}`).join("\n"));
    }catch(err){
      setAiError(getAiError(err));
    }finally{setAiLoading(false);}
  };

  return <div className="app-shell"><Sidebar isOpen={sidebarOpen} onClose={()=>setSidebarOpen(false)}/><main className="main">
    <header className="topbar">
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <button className="icon-btn hamburger-btn" onClick={()=>setSidebarOpen(true)} aria-label="Open menu"><Menu size={20}/></button>
        <div><div className="eyebrow">SATURDAY · PRODUCTIVITY</div><h1>Good morning, {user?.name?.split(" ")[0]} <span>✦</span></h1><p>Here's what's happening across your workspace today.</p></div>
      </div>
      <div className="top-actions"><button className="icon-btn"><RefreshCw size={18}/></button><div className="avatar">{user?.name?.[0]?.toUpperCase()}</div></div>
    </header>

    {error && <div className="error-box wide">{error} <button onClick={load}>Retry</button></div>}

    <section className="stats-grid">
      <Stat icon={<Target/>} label="Projects" value={stats.projects} note="Active workspaces"/>
      <Stat icon={<CheckCircle2/>} label="Completed" value={stats.done} note={`${stats.total ? Math.round(stats.done/stats.total*100):0}% of all tasks`}/>
      <Stat icon={<Clock3/>} label="In progress" value={stats.active} note="Keep the momentum"/>
      <Stat icon={<TrendingUp/>} label="Completion" value={`${stats.total ? Math.round(stats.done/stats.total*100):0}%`} note="Overall progress"/>
    </section>

    <section className="content-grid">
      <div className="projects-section">
        <div className="section-head"><div><h2>Projects</h2><span>Your active initiatives</span></div><button className="primary" onClick={()=>setModal(true)}><Plus size={17}/> New project</button></div>
        {loading ? <div className="loading-card"><div className="spinner"/>Loading projects...</div> :
        projects.length ? <div className="project-grid">{projects.map(p=><ProjectCard key={p._id} project={p} onDelete={deleteProject}/>)}</div> :
        <div className="empty-card"><Target size={28}/><h3>No projects yet</h3><p>Create your first project to start tracking progress.</p><button className="primary" onClick={()=>setModal(true)}>Create project</button></div>}
      </div>

      <aside className="ai-card">
        <div className="ai-glow"/>
        <div className="ai-title">
          <div className="spark"><Sparkles size={19}/></div>
          <div><b>Nova AI</b><span>Productivity assistant</span></div>
        </div>
        <h3>Make your next move smarter.</h3>
        <p>Generate practical tasks from a project or get a focused productivity suggestion.</p>

        <button className="ai-btn" onClick={generate} disabled={aiLoading} style={{opacity: aiLoading ? 0.6 : 1, cursor: aiLoading ? 'not-allowed' : 'pointer'}}>
          {aiLoading
            ? <><div className="spinner" style={{width:14,height:14,margin:0}}/> Generating...</>
            : <><WandSparkles size={16}/> Generate tasks</>
          }
        </button>

        {aiError && (
          <div className="ai-error-box">
            <span>{aiError}</span>
            <button onClick={generate} className="ai-retry-btn">Retry</button>
          </div>
        )}

        {suggestion && !aiError && <pre className="ai-result">{suggestion}</pre>}
      </aside>
    </section>

    <section className="tasks-section">
      <div className="section-head"><div><h2>Task board</h2><span>{filtered.length} tasks matching your view</span></div><button className="secondary" onClick={()=>setTaskModal(true)}><Plus size={16}/> Add task</button></div>
      <div className="toolbar"><div className="search"><Search size={17}/><input placeholder="Search tasks or projects..." value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="filters">{["all","todo","in-progress","done"].map(x=><button className={filter===x?"selected":""} key={x} onClick={()=>setFilter(x)}>{x==="all"?"All":x}</button>)}</div></div>
      {loading ? <div className="loading-card"><div className="spinner"/>Loading tasks...</div> : filtered.length ? <div className="task-list">{filtered.map(t=><TaskRow key={t._id} task={t} onStatus={status} onDelete={delTask}/>)}</div> : <div className="empty-card compact"><CheckCircle2 size={25}/><h3>No matching tasks</h3><p>Try another filter or add a new task.</p></div>}
    </section>

    <Modal open={modal} title="Create project" onClose={()=>setModal(false)}><form className="modal-form" onSubmit={createProject}><label>Project name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label>Accent color<input type="color" value={form.color} onChange={e=>setForm({...form,color:e.target.value})}/></label><button className="primary full">Create project</button></form></Modal>
    <Modal open={taskModal} title="Add task" onClose={()=>setTaskModal(false)}><form className="modal-form" onSubmit={createTask}><label>Task title<input required value={taskForm.title} onChange={e=>setTaskForm({...taskForm,title:e.target.value})}/></label><label>Project<select required value={taskForm.project} onChange={e=>setTaskForm({...taskForm,project:e.target.value})}><option value="">Select project</option>{projects.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}</select></label><div className="two-col"><label>Priority<select value={taskForm.priority} onChange={e=>setTaskForm({...taskForm,priority:e.target.value})}>{["low","medium","high","urgent"].map(x=><option key={x}>{x}</option>)}</select></label><label>Due date<input type="date" value={taskForm.dueDate} onChange={e=>setTaskForm({...taskForm,dueDate:e.target.value})}/></label></div><button className="primary full">Create task</button></form></Modal>
  </main></div>;
}

function Stat({icon,label,value,note}){return <div className="stat-card"><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></div>}
