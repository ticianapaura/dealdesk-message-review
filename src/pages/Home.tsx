import type { ReactNode } from "react";
import { Avatar, Icon, LogoMark, StatusTag, type IconName, type Tone } from "../components/ui";
import { Link } from "../router";
import "../styles/home.css";

/**
 * Marketing homepage. Presents DealDesk as a workspace for transaction-advisory firms,
 * with Communication Review as the featured workflow. The product visuals are static
 * illustrations built from the same components and copy as the prototype.
 * No testimonials, customer logos, metrics or guarantees: DealDesk is fictional.
 */

function MiniIssue({ tone, tag, icon, children }: { tone: Tone; tag: string; icon: IconName; children?: ReactNode }) {
  return (
    <div className={`hp-issue hp-issue-${tone}`}>
      <div className="hp-issue-head">
        <span className="hp-issue-num" aria-hidden="true">
          1
        </span>
        <div className="hp-grow">
          <div className="strong">Sam Lee</div>
          <div className="hp-small">Not on the Project Harbor team</div>
        </div>
        <StatusTag tone={tone} icon={icon}>
          {tag}
        </StatusTag>
      </div>
      {children && <div className="hp-issue-body">{children}</div>}
    </div>
  );
}

function PatRow() {
  return (
    <div className="hp-row">
      <Avatar initials="PM" />
      <div className="hp-grow">
        <div className="strong">Pat Morgan</div>
        <div className="hp-small">Advisor · on the Project Harbor team</div>
      </div>
      <span className="hp-muted" aria-hidden="true">
        <Icon name="trash" size={14} />
      </span>
    </div>
  );
}

function MiniBanner({ tone, icon, title, sub, children }: { tone: Tone; icon: IconName; title: string; sub: string; children?: ReactNode }) {
  return (
    <div className="hp-banner">
      <span className={`banner-icon tone-${tone}`} aria-hidden="true">
        <Icon name={icon} size={17} strokeWidth={1.6} />
      </span>
      <div className="hp-grow">
        <div className={`hp-banner-title text-${tone}`}>{title}</div>
        <div className="hp-small">{sub}</div>
      </div>
      {children}
    </div>
  );
}

const FLAGGED = <span className="hp-flag">Completion is guaranteed by 30 June.</span>;

/** Illustration of the review workspace in its Blocked state. Decorative: the real thing is at /prototype. */
function ProductPreview() {
  return (
    <div className="hp-product" role="img" aria-label="DealDesk review workspace showing a blocked draft with two issues">
      <div aria-hidden="true" className="hp-product-in">
        <div>
          <div className="hp-small strong">Project Harbor</div>
          <div className="hp-product-title">Completion timeline update</div>
        </div>
        <MiniBanner tone="danger" icon="alert" title="Blocked" sub="2 issues to resolve.">
          <span className="hp-mini hp-mini-disabled">
            <Icon name="send" size={13} />
            Send
          </span>
        </MiniBanner>
        <div className="hp-label">
          To <span className="hp-count">· 3 recipients</span>
        </div>
        <PatRow />
        <MiniIssue tone="danger" tag="Blocking" icon="alert">
          <span className="hp-grow hp-why">Recipients outside the project team need Deal Owner approval.</span>
          <span className="hp-mini hp-mini-primary">Remove Sam Lee</span>
          <span className="hp-mini">Request exception</span>
        </MiniIssue>
        <div className="hp-label">Outgoing message</div>
        <div className="hp-message">
          <div>Following this week's review, here is where Project Harbor stands.</div>
          <div>{FLAGGED}</div>
        </div>
      </div>
    </div>
  );
}

function Pillar({ icon, title, body, label, live = false }: { icon: IconName; title: string; body: string; label: string; live?: boolean }) {
  return (
    <div className="hp-pillar">
      <span className="hp-pillar-icon" aria-hidden="true">
        <Icon name={icon} size={20} strokeWidth={1.6} />
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
      <span className={live ? "hp-chip hp-chip-live" : "hp-chip"}>{label}</span>
    </div>
  );
}

function Feature({ title, body, wide = false, children }: { title: string; body: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={wide ? "hp-feature hp-feature-wide" : "hp-feature"}>
      <div className="hp-feature-text">
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
      <div className="hp-visual" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <span className="hp-muted" aria-hidden="true">
      <Icon name="right" size={14} />
    </span>
  );
}

export function Home() {
  return (
    <div className="hp">
      <section className="hp-hero">
        <div className="hp-rings hp-rings-l" aria-hidden="true" />
        <div className="hp-rings hp-rings-r" aria-hidden="true" />
        <header className="hp-nav">
          <span className="hp-brand">
            <LogoMark />
            DealDesk
          </span>
          <nav className="hp-links" aria-label="Site">
            <a href="#product">Product</a>
            <a href="#communication-review">Communication Review</a>
            <a href="#for-firms">For firms</a>
            <Link to="/process">Process Journey</Link>
          </nav>
          <Link to="/prototype" className="hp-btn hp-btn-light hp-btn-sm">
            Explore the workspace
          </Link>
        </header>
        <div className="hp-hero-text">
          <span className="hp-pill">For boutique transaction-advisory firms</span>
          <h1>Keep every deal moving, with everyone aligned.</h1>
          <p>A shared workspace for boutique transaction-advisory firms to coordinate deal activity, manage communications, and maintain visibility across every stage.</p>
          <div className="hp-cta-row">
            <Link to="/prototype" className="hp-btn hp-btn-primary">
              Explore the workspace
            </Link>
            <Link to="/process" className="hp-btn hp-btn-dark">
              Read the Process Journey
            </Link>
          </div>
        </div>
        <div className="hp-stage">
          <div className="hp-float hp-float-1" aria-hidden="true">
            <StatusTag tone="danger" icon="alert">Blocked · 2 issues</StatusTag>
          </div>
          <div className="hp-float hp-float-2" aria-hidden="true">
            <StatusTag tone="warning" icon="clock">Pending approval</StatusTag>
            Deal Owner decides
          </div>
          <div className="hp-float hp-float-3" aria-hidden="true">
            <StatusTag tone="success" icon="check">Ready to send</StatusTag>
            Version 3 checked
          </div>
          <ProductPreview />
          <div className="hp-fade" aria-hidden="true" />
        </div>
      </section>

      <section id="product" className="hp-section">
        <div className="hp-head">
          <h2>One workspace for the work around a deal</h2>
          <p>DealDesk brings a firm's deal work, its sensitive communications and a clear view of who decided what into one place.</p>
        </div>
        <div className="hp-grid-3">
          <Pillar icon="folder" title="Deal coordination" body="Keep deal-related work, responsibilities, and information organized in one shared workspace." label="Product vision" />
          <Pillar icon="send" title="Communication control" body="Review sensitive external communications, resolve risks, and manage exceptions before sending." label="Shown in the prototype" live />
          <Pillar icon="eye" title="Operational visibility" body="Provide clarity around deal activity, responsibilities, and decisions." label="Product vision" />
        </div>
      </section>

      <section id="communication-review" className="hp-section">
        <div className="hp-head">
          <h2>Featured workflow: Communication Review</h2>
          <p>Review recipients, identify unconfirmed commitments, manage exceptions, and verify the latest draft before sending.</p>
        </div>
        <div className="hp-grid-2">
          <Feature title="Risk shown where it occurs" body="An unassigned recipient is flagged on their row. An unconfirmed commitment is flagged on its sentence. Nothing to cross-reference.">
            <PatRow />
            <MiniIssue tone="danger" tag="Blocking" icon="alert" />
            <div className="hp-sentence">{FLAGGED}</div>
          </Feature>
          <Feature title="Approval stays with the Deal Owner" body="A coordinator can ask for an exception and give a reason. Only the Deal Owner can grant it, and a pending request never allows sending.">
            <MiniIssue tone="warning" tag="Pending approval" icon="clock">
              <span className="hp-grow hp-why">Approver: Deal Owner</span>
              <span className="hp-mini">Withdraw request</span>
            </MiniIssue>
            <MiniIssue tone="success" tag="Exception approved" icon="check" />
          </Feature>
          <Feature wide title="A review that knows when it is out of date" body="Any change to recipients or wording marks the last review as outdated. The message can be sent only after the current version is checked again.">
            <div className="hp-flow">
              <StatusTag tone="danger" icon="alert">Blocked</StatusTag>
              <Arrow />
              <StatusTag tone="warning" icon="refresh">Review outdated</StatusTag>
              <Arrow />
              <StatusTag tone="success" icon="check">Ready to send</StatusTag>
              <Arrow />
              <StatusTag tone="success" icon="send">Sent</StatusTag>
            </div>
            <MiniBanner tone="warning" icon="refresh" title="Review outdated" sub="Changes made since the last check.">
              <span className="hp-mini hp-mini-primary">
                <Icon name="refresh" size={13} />
                Recheck
              </span>
            </MiniBanner>
          </Feature>
        </div>
        <div className="hp-how">
          <h3>How Communication Review works</h3>
          <ol className="hp-steps">
            <li>
              <span className="hp-step-n">01</span>
              <h4>Check</h4>
              <p>The draft is reviewed for recipients outside the project team and for commitment wording that has not been confirmed.</p>
            </li>
            <li>
              <span className="hp-step-n">02</span>
              <h4>Correct or request</h4>
              <p>Remove the recipient, revise the sentence, or ask the Deal Owner for an exception. Every removal can be undone.</p>
            </li>
            <li>
              <span className="hp-step-n">03</span>
              <h4>Recheck and send</h4>
              <p>After any edit, the draft is checked again. Sending unlocks for that version, and the review record stays with the sent message.</p>
            </li>
          </ol>
        </div>
        <div className="hp-cta-row">
          <Link to="/prototype" className="hp-btn hp-btn-primary">
            Explore the Communication Review prototype
          </Link>
        </div>
      </section>

      <section id="for-firms" className="hp-band-wrap">
        <div className="hp-band">
          <div className="hp-band-text">
            <span className="hp-eyebrow">For Managing Partners and Operations Leads</span>
            <h2>Know what was checked before each message went out</h2>
          </div>
          <ul className="hp-points">
            <li>
              <Icon name="check" size={20} strokeWidth={1.6} />
              <div>
                <div className="hp-point-t">A record with every sent message</div>
                <div className="hp-point-b">Recipients, the text as sent, the version reviewed and how each issue was resolved.</div>
              </div>
            </li>
            <li>
              <Icon name="check" size={20} strokeWidth={1.6} />
              <div>
                <div className="hp-point-t">Clear roles</div>
                <div className="hp-point-b">Coordinators correct and request. Deal Owners approve. The product keeps the two apart.</div>
              </div>
            </li>
            <li>
              <Icon name="check" size={20} strokeWidth={1.6} />
              <div>
                <div className="hp-point-t">No sending on an outdated review</div>
                <div className="hp-point-b">A message that changed after its review has to be checked again first.</div>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section className="hp-section hp-closing">
        <div className="hp-head">
          <h2>See the workspace in action</h2>
          <p>The prototype covers Communication Review: three scenarios, each from a fixed starting point.</p>
        </div>
        <div className="hp-cta-row">
          <Link to="/prototype" className="hp-btn hp-btn-primary">
            Explore the workspace
          </Link>
          <Link to="/process" className="hp-btn hp-btn-secondary">
            Read the Process Journey
          </Link>
        </div>
      </section>

      <footer className="hp-foot">
        <span className="hp-foot-brand">
          <LogoMark />
          DealDesk
        </span>
        <span className="hp-foot-note">DealDesk is a fictional product created for a design challenge. The prototype runs on simulated data.</span>
      </footer>
    </div>
  );
}
