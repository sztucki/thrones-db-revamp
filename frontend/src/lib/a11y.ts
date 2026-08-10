import type { KeyboardEvent } from "react";

/** Spread onto a non-<button> element that acts as a click target, so it's
 * reachable and activatable from the keyboard (Tab + Enter/Space). */
export function clickableProps(onClick: () => void) {
  return {
    role: "button" as const,
    tabIndex: 0,
    onClick,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    },
  };
}
