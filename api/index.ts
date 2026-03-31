import "dotenv/config";
import express from "express";
import cors from "cors";
import { runSeed } from "../server/seed";
import router from "../server/routes";

const app = express();

app.use(cors());
app.use(express.json());

// API routes — Vercel routes /api/* here
app.use("/api", router);

// Seed channels + feeds on cold start
runSeed();

export default app;
