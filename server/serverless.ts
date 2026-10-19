import "dotenv/config";
import express from "express";
import { initDatabase } from "./db";
import { apiRouter } from "./routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure database connection before handling requests
app.use(async (req, res, next) => {
  try {
    await initDatabase();
  } catch (err) {
    console.error("Database initialization failed in serverless function:", err);
  }
  next();
});

// Handle requests with or without /api prefix
app.use("/api", apiRouter);
app.use(apiRouter);

export default app;
