import "dotenv/config";
import express from "express";
import { initDatabase } from "../server/db";
import { apiRouter } from "../server/routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let isDbInitialized = false;

app.use(async (req, res, next) => {
  if (!isDbInitialized) {
    try {
      await initDatabase();
      isDbInitialized = true;
    } catch (err) {
      console.error("Database initialization failed in serverless function:", err);
    }
  }
  next();
});

// Handle requests with or without /api prefix
app.use("/api", apiRouter);
app.use(apiRouter);

export default app;
