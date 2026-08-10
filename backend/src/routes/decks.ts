import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  NotFoundError,
  createDeck,
  deleteDeck,
  getDeckForUser,
  listDecksForUser,
  setDeckCard,
  updateDeck,
} from "../services/decks.js";

export const decksRouter = Router();

decksRouter.use("/decks", requireAuth);

const createDeckSchema = z.object({
  name: z.string().trim().min(1).max(100),
  factionCode: z.string().min(1),
  agendaCode: z.string().min(1).nullable().optional(),
  format: z.enum(["joust", "melee"]).default("joust"),
});

const updateDeckSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  agendaCode: z.string().min(1).nullable().optional(),
});

const setCardSchema = z.object({
  count: z.coerce.number().int().min(0).max(10),
});

decksRouter.get("/decks", async (req, res) => {
  const items = await listDecksForUser(req.user!.id);
  res.json({ items });
});

decksRouter.post("/decks", async (req, res) => {
  const parsed = createDeckSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid deck data", details: parsed.error.flatten() });
    return;
  }
  const deck = await createDeck(req.user!.id, {
    name: parsed.data.name,
    factionCode: parsed.data.factionCode,
    agendaCode: parsed.data.agendaCode ?? null,
    format: parsed.data.format,
  });
  res.status(201).json(deck);
});

decksRouter.get("/decks/:id", async (req, res) => {
  try {
    const deck = await getDeckForUser(req.user!.id, req.params.id);
    res.json(deck);
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    throw err;
  }
});

decksRouter.patch("/decks/:id", async (req, res) => {
  const parsed = updateDeckSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid deck data", details: parsed.error.flatten() });
    return;
  }
  try {
    await updateDeck(req.user!.id, req.params.id, parsed.data);
    const deck = await getDeckForUser(req.user!.id, req.params.id);
    res.json(deck);
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    throw err;
  }
});

decksRouter.delete("/decks/:id", async (req, res) => {
  try {
    await deleteDeck(req.user!.id, req.params.id);
    res.status(204).end();
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    throw err;
  }
});

decksRouter.put("/decks/:id/cards/:cardCode", async (req, res) => {
  const parsed = setCardSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid card count", details: parsed.error.flatten() });
    return;
  }
  try {
    await setDeckCard(req.user!.id, req.params.id, req.params.cardCode, parsed.data.count);
    const deck = await getDeckForUser(req.user!.id, req.params.id);
    res.json(deck);
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    throw err;
  }
});
