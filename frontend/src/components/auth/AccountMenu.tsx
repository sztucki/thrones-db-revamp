import { useState } from "react";
import type { User } from "@thronesdb/shared";
import { useLogOut } from "../../hooks/useSession.js";

export function AccountMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const logOut = useLogOut();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Account menu for ${user.username}`}
        aria-expanded={open}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[13px] font-semibold text-bg"
      >
        {user.username.slice(0, 1).toUpperCase()}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-52 rounded border border-border bg-surface py-1 text-[13px] shadow-lg">
            <div className="border-b border-border px-3 py-2 text-textMuted">
              Signed in as <span className="font-medium text-text">{user.username}</span>
            </div>
            <button className="block w-full px-3 py-2 text-left text-textMuted" disabled>
              Edit profile
            </button>
            <button className="block w-full px-3 py-2 text-left text-textMuted" disabled>
              Public account
            </button>
            <button
              onClick={() => {
                setOpen(false);
                logOut.mutate();
              }}
              className="block w-full px-3 py-2 text-left"
            >
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
