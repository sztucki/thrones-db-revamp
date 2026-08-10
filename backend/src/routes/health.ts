import { Router } from "express";
import { sql } from "drizzle-orm";
import { db } from "../db/client.js";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  try {
    await db.execute(sql`select 1`);
    res.json({ status: "ok", db: "connected" });
  } catch {
    res.status(503).json({ status: "error", db: "unreachable" });
  }
});
