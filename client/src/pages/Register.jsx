import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { AuthShell } from "./Login.jsx";
import React from "react";

export default function Register() {
  const { register } = useAuth(); const nav = useNavigate();
  const [form, setForm] = useState({name:"",email:"",password:""}); const [error,setError]=useState("");
  const submit = async e => { e.preventDefault(); setError(""); try { await register(form); nav("/"); } catch(err){ setError(err.response?.data?.message || "Registration failed"); } };
  return <AuthShell title="Create your account" subtitle="Start building your productivity workspace">
    <form onSubmit={submit} className="auth-form">
      <label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
      <label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label>Password<input type="password" minLength="6" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
      {error && <div className="error-box">{error}</div>}
      <button className="primary full">Create account</button>
      <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
    </form>
  </AuthShell>;
}
