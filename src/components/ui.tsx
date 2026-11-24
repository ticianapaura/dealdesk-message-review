import type { ReactNode } from "react";

const PATHS = {
  home: <path d="M2 8l6-5.5L14 8v6H2z" />,
  doc: (
    <>
      <path d="M4 2h5.5L12.5 5v9H4z" />
      <path d="M6.5 8h4M6.5 11h4" />
    </>
  ),
  folder: <path d="M2 4h4l1.5 2H14v7.5H2z" />,
  clock: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.5V8l2.5 1.5" />
    </>
  ),
  sliders: (
    <>
      <path d="M2 5h12M2 11h12" />
      <circle cx="6" cy="5" r="1.75" />
      <circle cx="10" cy="11" r="1.75" />
    </>
  ),
  bell: (
    <>
      <path d="M4 11V7.5a4 4 0 0 1 8 0V11l1.2 1.5H2.8z" />
      <path d="M6.5 14a1.5 1.5 0 0 0 3 0" />
    </>
  ),
  down: <path d="M3.5 5.5l4.5 4.5 4.5-4.5" />,
  up: <path d="M3.5 10.5l4.5-4.5 4.5 4.5" />,
  right: <path d="M5.5 3.5L10 8l-4.5 4.5" />,
  back: <path d="M9.5 3.5L5 8l4.5 4.5" />,
  alert: (
    <>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 4.75v4M8 11.1v.2" />
    </>
  ),
  check: (
    <>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M5.2 8.2l1.9 1.9 3.7-4" />
    </>
  ),
  refresh: (
    <>
      <path d="M13 8a5 5 0 1 1-1.5-3.6" />
      <path d="M13 2.5v2.8h-2.8" />
    </>
  ),
  triangle: (
    <>
      <path d="M8 2.2l6.3 11.3H1.7z" />
      <path d="M8 6.5v3.2M8 11.6v.2" />
    </>
  ),
  spinner: <path d="M8 1.75A6.25 6.25 0 1 1 1.75 8" />,
  x: <path d="M4 4l8 8M12 4l-8 8" />,
  history: (
    <>
      <path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9" />
      <path d="M2.5 3v2.5H5M8 5v3l2 1.2" />
    </>
  ),
  send: <path d="M14 2L7 9M14 2l-4.5 12L7 9 2 6.5z" />,
  trash: <path d="M2.5 4.5h11M6 4.5V3h4v1.5M4 4.5l.6 8.5h6.8l.6-8.5M6.7 7v4M9.3 7v4" />,
  eye: (
    <>
      <path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8s-2.4 4.5-6.5 4.5S1.5 8 1.5 8z" />
      <circle cx="8" cy="8" r="2" />
    </>
  ),
  menu: <path d="M2 4h12M2 8h12M2 12h12" />,
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 16, strokeWidth = 1.5, spin = false }: { name: IconName; size?: number; strokeWidth?: number; spin?: boolean }) {
  return (
    <svg
      className={spin ? "icon spin" : "icon"}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}

export function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="8" fill="#3446B8" />
      <path d="M8.5 13.2l3.6 3.6 7.4-7.8" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 21h11" fill="none" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export type Tone = "danger" | "warning" | "success" | "neutral";

export function StatusTag({ tone, icon, children }: { tone: Tone; icon: IconName; children: ReactNode }) {
  return (
    <span className={`tag tag-${tone}`}>
      <Icon name={icon} size={13} strokeWidth={1.75} />
      {children}
    </span>
  );
}

export function Avatar({ initials }: { initials: string }) {
  return (
    <span className="avatar" aria-hidden="true">
      {initials}
    </span>
  );
}
