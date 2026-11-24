import { useState, type ReactNode } from "react";
import { Icon, LogoMark, type IconName } from "./ui";

const NAV: Array<{ label: string; icon: IconName }> = [
  { label: "Overview", icon: "home" },
  { label: "Drafts", icon: "doc" },
  { label: "Deals", icon: "folder" },
  { label: "Activity", icon: "clock" },
];

function NavList({ onDrafts }: { onDrafts: () => void }) {
  const item = (label: string, icon: IconName) =>
    label === "Drafts" ? (
      <button key={label} type="button" className="nav-item active" aria-current="page" onClick={onDrafts}>
        <Icon name={icon} size={17} />
        {label}
      </button>
    ) : (
      // Navigation context only: these destinations are not part of the prototype.
      <span key={label} className="nav-item" aria-disabled="true" title="Not part of this prototype">
        <Icon name={icon} size={17} />
        {label}
      </span>
    );
  return (
    <>
      {NAV.map((n) => item(n.label, n.icon))}
      <div className="nav-rule" aria-hidden="true" />
      {item("Settings", "sliders")}
    </>
  );
}

/** Product chrome: sidebar, header with notifications and profile, main content. */
export function Shell({ pendingTasks, onDrafts, children }: { pendingTasks: number; onDrafts: () => void; children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const goDrafts = () => {
    setDrawer(false);
    onDrafts();
  };
  return (
    <div className="shell">
      <nav className="sidebar" aria-label="Primary">
        <div className="brand">
          <LogoMark />
          DealDesk
        </div>
        <NavList onDrafts={goDrafts} />
      </nav>
      <div className="shell-main">
        <header className="topbar">
          <button type="button" className="icon-btn menu-btn" aria-label="Open navigation menu" onClick={() => setDrawer(true)}>
            <Icon name="menu" size={18} />
          </button>
          <span className="topbar-brand">
            <LogoMark />
            DealDesk
          </span>
          <button
            type="button"
            className="icon-btn bell"
            aria-label={pendingTasks > 0 ? `Notifications, ${pendingTasks} pending task` : "Notifications"}
          >
            <Icon name="bell" size={18} />
            {pendingTasks > 0 && (
              <span className="badge" aria-hidden="true">
                {pendingTasks}
              </span>
            )}
          </button>
          <span className="profile">
            <span className="profile-avatar" aria-hidden="true">
              DC
            </span>
            Deal Coordinator
          </span>
        </header>
        <main className="content">{children}</main>
      </div>
      {drawer && (
        <div className="overlay drawer-overlay" onMouseDown={(e) => e.target === e.currentTarget && setDrawer(false)}>
          <nav className="drawer" aria-label="Primary navigation">
            <div className="drawer-head">
              <span className="brand">
                <LogoMark />
                DealDesk
              </span>
              <button type="button" className="icon-btn" aria-label="Close navigation menu" onClick={() => setDrawer(false)}>
                <Icon name="x" size={18} />
              </button>
            </div>
            <NavList onDrafts={goDrafts} />
          </nav>
        </div>
      )}
    </div>
  );
}
