import type { NextFunction, Request, Response } from "express";
import { getSessionUser } from "../services/auth.js";
import { config } from "../config.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; email: string; username: string };
    }
  }
}

export async function attachUser(req: Request, _res: Response, next: NextFunction) {
  const sessionId = req.cookies?.[config.SESSION_COOKIE_NAME];
  if (sessionId) {
    const user = await getSessionUser(sessionId);
    if (user) {
      req.user = { id: user.id, email: user.email, username: user.username };
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}
