import { useEffect, useState, type MouseEvent, type ReactNode } from "react";

/** Minimal client-side router on the History API. Three routes do not justify a dependency. */

const listeners = new Set<() => void>();

export function navigate(to: string) {
  if (to !== window.location.pathname) {
    window.history.pushState(null, "", to);
    window.scrollTo(0, 0);
  }
  listeners.forEach((notify) => notify());
}

export function usePath(): string {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const update = () => setPath(window.location.pathname);
    listeners.add(update);
    window.addEventListener("popstate", update);
    return () => {
      listeners.delete(update);
      window.removeEventListener("popstate", update);
    };
  }, []);
  return path;
}

export function Link({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    navigate(to);
  }
  return (
    <a href={to} className={className} onClick={onClick}>
      {children}
    </a>
  );
}
