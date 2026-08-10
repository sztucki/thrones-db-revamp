import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSession } from "../../hooks/useSession.js";
import { AccountMenu } from "../auth/AccountMenu.js";
import { AuthModal } from "../auth/AuthModal.js";

const navItems = [
  { to: "/cards", label: "Cards" },
  { to: "/decks", label: "Decks" },
  { to: "/reviews", label: "Reviews" },
  { to: "/rules", label: "Rules" },
];

export function Header() {
  const { data } = useSession();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg px-7 py-3.5">
      <div className="flex items-center gap-7">
        <div className="text-[17px] font-bold tracking-tight">ThronesDB</div>
        <nav className="flex gap-5 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `border-b-2 pb-1 ${
                  isActive
                    ? "border-accent font-semibold text-text"
                    : "border-transparent text-textMuted"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-1 text-[13px] text-textMuted">
          EN <span className="text-[9px]">▾</span>
        </div>
        {data?.user ? (
          <AccountMenu user={data.user} />
        ) : (
          <button
            onClick={() => setAuthOpen(true)}
            className="rounded-sm border border-accent px-4 py-1.5 text-[13px] font-medium text-accent"
          >
            Log in
          </button>
        )}
      </div>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </header>
  );
}
