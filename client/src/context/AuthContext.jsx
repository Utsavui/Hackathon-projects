import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("nova_token")) return setLoading(false);
    api.get("/auth/me").then(r => setUser(r.data.user)).catch(() => localStorage.removeItem("nova_token")).finally(() => setLoading(false));
  }, []);

  const login = async payload => {
    const { data } = await api.post("/auth/login", payload);
    localStorage.setItem("nova_token", data.token);
    setUser(data.user);
  };

  const register = async payload => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("nova_token", data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("nova_token");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
