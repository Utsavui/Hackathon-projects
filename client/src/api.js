import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ||"https://hackathon-projects-7.onrender.com" });

api.interceptors.request.use(config => {
  const token = localStorage.getItem("nova_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
