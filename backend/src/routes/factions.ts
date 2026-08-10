import { Router } from "express";
import { asc } from "drizzle-orm";
import { db } from "../db/client.js";
import { factions } from "../db/schema.js";

export const factionsRouter = Router();

factionsRouter.get("/factions", async (_req, res) => {
  const items = await db.select().from(factions).orderBy(asc(factions.name));
  res.json({ items });
});
