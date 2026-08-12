import type { SessionResponse } from "@thronesdb/shared";
import { apiFetch } from "./client.js";

export { ApiError } from "./client.js";

export function signUp(email: string, username: string, password: string) {
  return apiFetch<SessionResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, username, password }),
  });
}

export function logIn(email: string, password: string) {
  return apiFetch<SessionResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logOut() {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}

export function getSession(): Promise<SessionResponse> {
  return apiFetch<SessionResponse>("/auth/session");
}
