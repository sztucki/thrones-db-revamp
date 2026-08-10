import { useEffect, useState } from "react";
import { ApiError } from "../../api/auth.js";
import { useLogIn, useSignUp } from "../../hooks/useSession.js";

export function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const logIn = useLogIn();
  const signUp = useSignUp();
  const pending = logIn.isPending || signUp.isPending;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "login") {
        await logIn.mutateAsync({ email, password });
      } else {
        await signUp.mutateAsync({ email, username, password });
      }
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === "login" ? "Log in" : "Sign up"}
        className="w-[340px] rounded-lg border border-border bg-surface p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex gap-4 text-sm font-semibold">
          <button
            className={mode === "login" ? "text-accent" : "text-textMuted"}
            onClick={() => setMode("login")}
            type="button"
          >
            Log in
          </button>
          <button
            className={mode === "signup" ? "text-accent" : "text-textMuted"}
            onClick={() => setMode("signup")}
            type="button"
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            aria-label="Email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-border bg-bg px-3 py-2 text-[13px]"
          />
          {mode === "signup" && (
            <input
              required
              minLength={3}
              aria-label="Username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded border border-border bg-bg px-3 py-2 text-[13px]"
            />
          )}
          <input
            type="password"
            required
            minLength={8}
            aria-label="Password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-border bg-bg px-3 py-2 text-[13px]"
          />

          {error && <div className="text-xs text-danger">{error}</div>}

          <button
            type="submit"
            disabled={pending}
            className="mt-1 rounded-sm bg-accent px-4 py-2 text-[13px] font-medium text-bg disabled:opacity-60"
          >
            {pending ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
