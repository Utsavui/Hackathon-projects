import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import taskRoutes from "./routes/tasks.js";
import aiRoutes from "./routes/ai.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome Developer 👋",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Innovation Hacks API is running",
  });
});








app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: "Validation failed", errors: err.errors });
  }
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: "A record with this value already exists" });
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`✅ API: http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });



  
