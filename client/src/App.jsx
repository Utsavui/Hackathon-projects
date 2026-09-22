import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import React from "react";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="screen-center"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/" element={<Protected><Dashboard /></Protected>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
