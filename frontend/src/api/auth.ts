import type { SessionResponse } from "@thronesdb/shared";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {}

async function postAuth<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export function signUp(email: string, username: string, password: string) {
  return postAuth<SessionResponse>("/auth/signup", { email, username, password });
}

export function logIn(email: string, password: string) {
  return postAuth<SessionResponse>("/auth/login", { email, password });
}

export async function logOut() {
  await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
}

export async function getSession(): Promise<SessionResponse> {
  const res = await fetch(`${API_URL}/auth/session`, { credentials: "include" });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}
