import { Router } from "express";
import { z } from "zod";
import { getCardByCode, searchCards } from "../services/cardSearch.js";

export const cardsRouter = Router();

const csv = () =>
  z
    .string()
    .transform((s) => s.split(",").map((v) => v.trim()).filter(Boolean))
    .optional();

const searchQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  faction: csv(),
  type: csv(),
  traits: csv(),
  costMin: z.coerce.number().int().min(0).optional(),
  costMax: z.coerce.number().int().min(0).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

cardsRouter.get("/cards", async (req, res) => {
  const parsed = searchQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters", details: parsed.error.flatten() });
    return;
  }
  const result = await searchCards(parsed.data);
  res.json(result);
});

cardsRouter.get("/cards/:code", async (req, res) => {
  const card = await getCardByCode(req.params.code);
  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }
  res.json(card);
});
