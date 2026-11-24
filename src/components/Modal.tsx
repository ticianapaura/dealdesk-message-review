import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { Icon } from "./ui";

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal dialog. Moves focus inside on open, keeps Tab inside the dialog,
 * closes on Escape, and returns focus to the element that opened it.
 */
export function Modal({
  title,
  titleId,
  role = "dialog",
  describedBy,
  onClose,
  showClose = true,
  children,
}: {
  title: string;
  titleId: string;
  role?: "dialog" | "alertdialog";
  describedBy?: string;
  onClose: () => void;
  showClose?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const preferred = node?.querySelector<HTMLElement>("[data-autofocus]") ?? node?.querySelector<HTMLElement>(FOCUSABLE);
    preferred?.focus();
    return () => opener?.focus();
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab" || !ref.current) return;
    const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section ref={ref} className="modal" role={role} aria-modal="true" aria-labelledby={titleId} aria-describedby={describedBy} onKeyDown={onKeyDown}>
        <div className="modal-head">
          <h2 id={titleId}>{title}</h2>
          {showClose && (
            <button type="button" className="icon-btn" aria-label="Close" data-tip="Close" onClick={onClose}>
              <Icon name="x" size={17} />
            </button>
          )}
        </div>
        {children}
      </section>
    </div>
  );
}
