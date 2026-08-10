import { Router } from "express";
import { asc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { cycles, packs } from "../db/schema.js";

export const packsRouter = Router();

packsRouter.get("/packs", async (_req, res) => {
  const items = await db
    .select({
      code: packs.code,
      name: packs.name,
      cycleCode: packs.cycleCode,
      position: packs.position,
      size: packs.size,
      dateRelease: packs.dateRelease,
      cycleName: cycles.name,
      cyclePosition: cycles.position,
    })
    .from(packs)
    .innerJoin(cycles, eq(packs.cycleCode, cycles.code))
    .orderBy(asc(cycles.position), asc(packs.position));
  res.json({ items });
});
