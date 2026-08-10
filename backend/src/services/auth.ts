import { randomUUID } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { sessions, users } from "../db/schema.js";
import { config } from "../config.js";

export class AuthError extends Error {}

const SESSION_TTL_MS = config.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

export async function signUp(email: string, username: string, password: string) {
  const existing = await db.query.users.findFirst({
    where: (u, { or, eq: eq_ }) => or(eq_(u.email, email), eq_(u.username, username)),
  });
  if (existing) {
    throw new AuthError("Email or username already in use");
  }

  const passwordHash = await hash(password);
  const [user] = await db
    .insert(users)
    .values({ id: randomUUID(), email, username, passwordHash })
    .returning();

  return createSession(user.id);
}

export async function logIn(email: string, password: string) {
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) {
    throw new AuthError("Invalid email or password");
  }
  const valid = await verify(user.passwordHash, password);
  if (!valid) {
    throw new AuthError("Invalid email or password");
  }
  return createSession(user.id);
}

export async function createSession(userId: string) {
  const [session] = await db
    .insert(sessions)
    .values({
      id: randomUUID(),
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    })
    .returning();
  return session;
}

export async function logOut(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function getSessionUser(sessionId: string) {
  const session = await db.query.sessions.findFirst({ where: eq(sessions.id, sessionId) });
  if (!session || session.expiresAt.getTime() < Date.now()) {
    return null;
  }
  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  return user ?? null;
}
