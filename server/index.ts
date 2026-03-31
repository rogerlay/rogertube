import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { runSeed } from "./seed";
import router from "./routes";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(cors());
app.use(express.json());

// API routes
app.use("/api", router);

// Serve static frontend in production
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Seed data
runSeed();

app.listen(PORT, () => {
  console.log(`[server] RogerTube running on http://localhost:${PORT}`);
});
