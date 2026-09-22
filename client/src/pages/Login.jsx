import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import React from "react";

export default function Login() {
  const { login } = useAuth(); const nav = useNavigate();
  const [form, setForm] = useState({email:"demo@example.com", password:"password123"});
  const [error, setError] = useState("");
  const submit = async e => { e.preventDefault(); setError(""); try { await login(form); nav("/"); } catch (err) { setError(err.response?.data?.message || "Login failed"); } };
  return <AuthShell title="Welcome back" subtitle="Sign in to continue to your workspace">
    <form onSubmit={submit} className="auth-form">
      <label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label>Password<input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
      {error && <div className="error-box">{error}</div>}
      <button className="primary full">Sign in</button>
      <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
    </form>
  </AuthShell>;
}

export function AuthShell({title, subtitle, children}) {
  return <div className="auth-page"><div className="auth-visual"><div className="orb orb-a"/><div className="orb orb-b"/><div className="visual-content"><div className="brand"><div className="brand-mark">N</div><strong>NovaTask</strong></div><h1>Turn busy work into <em>clear progress.</em></h1><p>Projects, tasks and AI-powered productivity in one focused workspace.</p><div className="floating-card"><Sparkles size={20}/><span>AI productivity insight ready</span></div></div></div><div className="auth-panel"><div className="auth-box"><h2>{title}</h2><p>{subtitle}</p>{children}</div></div></div>;
}
