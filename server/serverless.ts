import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import { apiRouter } from "./routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoUri =
  process.env.MONGODB_URI ||
  "mongodb+srv://shreebhairavnathmandirtalawade_db_user:U7qVMP2fol9BLuGt@cluster0.uylgr4o.mongodb.net/shreebhairavnath?retryWrites=true&w=majority&appName=Cluster0";

let isConnecting = false;

async function ensureDbConnected() {
  if (mongoose.connection.readyState === 1) return;
  if (isConnecting) return;
  isConnecting = true;
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB successfully!");
  } catch (err) {
    console.error("MongoDB connection error in serverless:", err);
  } finally {
    isConnecting = false;
  }
}

// Ensure database connection before handling requests
app.use(async (req, res, next) => {
  await ensureDbConnected();
  next();
});

// Health check endpoint for testing Vercel serverless function directly
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mongoState: mongoose.connection.readyState,
    timestamp: new Date().toISOString(),
  });
});

// Handle requests with or without /api prefix
app.use("/api", apiRouter);
app.use(apiRouter);

export default app;
