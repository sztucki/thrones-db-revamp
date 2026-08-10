import { Router } from "express";
import { z } from "zod";
import { config } from "../config.js";
import { AuthError, logIn, logOut, signUp } from "../services/auth.js";
import { getSessionUser } from "../services/auth.js";

export const authRouter = Router();

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: config.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
};

const signUpSchema = z.object({
  email: z.string().email(),
  username: z.string().trim().min(3).max(32),
  password: z.string().min(8).max(200),
});

const logInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/auth/signup", async (req, res) => {
  const parsed = signUpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid signup data", details: parsed.error.flatten() });
    return;
  }
  try {
    const { email, username, password } = parsed.data;
    const session = await signUp(email, username, password);
    res.cookie(config.SESSION_COOKIE_NAME, session.id, cookieOptions);
    res.status(201).json({ user: { id: session.userId, email, username } });
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(409).json({ error: err.message });
      return;
    }
    throw err;
  }
});

authRouter.post("/auth/login", async (req, res) => {
  const parsed = logInSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid login data", details: parsed.error.flatten() });
    return;
  }
  try {
    const { email, password } = parsed.data;
    const session = await logIn(email, password);
    const user = await getSessionUser(session.id);
    res.cookie(config.SESSION_COOKIE_NAME, session.id, cookieOptions);
    res.json({ user: user && { id: user.id, email: user.email, username: user.username } });
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(401).json({ error: err.message });
      return;
    }
    throw err;
  }
});

authRouter.post("/auth/logout", async (req, res) => {
  const sessionId = req.cookies?.[config.SESSION_COOKIE_NAME];
  if (sessionId) {
    await logOut(sessionId);
  }
  res.clearCookie(config.SESSION_COOKIE_NAME, cookieOptions);
  res.status(204).end();
});

authRouter.get("/auth/session", async (req, res) => {
  res.json({ user: req.user ?? null });
});
