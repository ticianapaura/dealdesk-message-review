import type { CSSProperties, ReactNode } from "react";
import { LogoMark } from "../../components/ui";
import { Link } from "../../router";
import "../../styles/process.css";
import { SHOT_SIZES } from "./shots";

/**
 * Process Journey: the design case study for the DealDesk Message Review Workspace.
 * Screenshots in /public/journey are captures of this prototype, except the ds-* images,
 * which are crops of the design system reference board.
 */

const SECTIONS: Array<[string, string]> = [
  ["introduction", "01 Introduction"],
  ["problem", "02 Problem"],
  ["architecture", "03 Architecture"],
  ["journey", "04 Journey"],
  ["exception", "05 Exceptions"],
  ["states", "06 States"],
  ["decisions", "07 Decisions"],
  ["system", "08 Design system"],
  ["homepage", "09 Homepage"],
  ["ai", "10 AI workflow"],
  ["scope", "11 Scope"],
  ["outcome", "12 Outcome"],
];

function Shot({ name, alt, caption, wide = false }: { name: string; alt: string; caption?: string; wide?: boolean }) {
  const [width, height] = SHOT_SIZES[name];
  return (
    <figure className={wide ? "shot wide" : "shot"}>
      <img src={`/journey/${name}.webp`} width={width} height={height} alt={alt} loading="lazy" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

function Section({ num, id, title, lede, children }: { num: string; id: string; title: string; lede: string; children: ReactNode }) {
  return (
    <section id={id} className="sec">
      <header className="sec-h">
        <div className="sec-n">{num}</div>
        <h2>{title}</h2>
        <p className="lede">{lede}</p>
      </header>
      {children}
    </section>
  );
}

type FlowTone = "" | "red" | "amber" | "green";
function Flow({ items }: { items: Array<[string, FlowTone]> }) {
  return (
    <ol className="flow">
      {items.map(([label, tone]) => (
        <li key={label} className={tone}>
          <span>{label}</span>
        </li>
      ))}
    </ol>
  );
}

function Step({ n, shot, alt, title, action, response, state }: { n: number; shot: string; alt: string; title: string; action: string; response: string; state: string }) {
  const [width, height] = SHOT_SIZES[shot];
  return (
    <article className="step">
      <div className="step-img">
        <img src={`/journey/${shot}.webp`} width={width} height={height} alt={alt} loading="lazy" />
      </div>
      <div className="step-txt">
        <div className="step-n">{n}</div>
        <h3>{title}</h3>
        <dl>
          <dt>User action</dt>
          <dd>{action}</dd>
          <dt>System response</dt>
          <dd>{response}</dd>
          <dt>Resulting state</dt>
          <dd>{state}</dd>
        </dl>
      </div>
    </article>
  );
}

function Decision({ letter, title, chosen, alternative, benefit, cost, note }: { letter: string; title: string; chosen: string; alternative: string; benefit: string; cost: string; note?: string }) {
  return (
    <article className="dec">
      <div className="dec-l">{letter}</div>
      <div className="dec-b">
        <h3>{title}</h3>
        <dl className="dec-g">
          <div>
            <dt>Chosen</dt>
            <dd>
              <b>{chosen}</b>
            </dd>
          </div>
          <div>
            <dt>Alternative considered</dt>
            <dd>{alternative}</dd>
          </div>
          <div>
            <dt>Benefit</dt>
            <dd>{benefit}</dd>
          </div>
          <div>
            <dt>Trade-off</dt>
            <dd>{cost}</dd>
          </div>
        </dl>
        {note && <p className="note">{note}</p>}
      </div>
    </article>
  );
}

function Swatch({ token, hex, use }: { token: string; hex: string; use: string }) {
  return (
    <div className="sw">
      <span className="sw-c" style={{ background: hex }} />
      <div>
        <div className="sw-t">{token}</div>
        <div className="sw-h">{hex}</div>
        <div className="sw-u">{use}</div>
      </div>
    </div>
  );
}

/** Position of an annotation pin on the full workspace capture (1280 × 1319). */
function Pin({ n, x, y }: { n: number; x: number; y: number }) {
  return (
    <span className="pin" style={{ left: `${(x / 1280) * 100}%`, top: `${(y / 1319) * 100}%` }}>
      {n}
    </span>
  );
}

const STATES: Array<{ name: string; tone: "red" | "amber" | "green"; trigger: string; feedback: string; action: string; send: string; recovery: string }> = [
  { name: "Blocked", tone: "red", trigger: "A check finds one or more blocking issues, or an exception was rejected or withdrawn.", feedback: "Red status with the count; each issue inline on its element.", action: "Remove, revise, or request an exception.", send: "Disabled", recovery: "Correct each issue, then recheck." },
  { name: "Pending approval", tone: "amber", trigger: "The coordinator submits an exception request.", feedback: "Amber annotation with reason, time and approver. Global status stays Blocked.", action: "Remove Sam Lee, or withdraw the request.", send: "Disabled", recovery: "Wait for the Deal Owner, withdraw, or remove." },
  { name: "Review outdated", tone: "amber", trigger: "Any edit to recipients or message text after a check.", feedback: "Amber global status. No per-issue cards for corrected items.", action: "Recheck.", send: "Disabled", recovery: "Recheck the current version." },
  { name: "Review unavailable", tone: "amber", trigger: "A check could not be completed.", feedback: "Amber global status stating the check failed.", action: "Retry check.", send: "Disabled", recovery: "Retry; nothing is assumed to have passed." },
  { name: "Ready to send", tone: "green", trigger: "The current version passes a check with no unresolved blocking issue.", feedback: "Green status naming the version and recipients.", action: "Send.", send: "Enabled", recovery: "Any further edit returns to Review outdated." },
  { name: "Sent", tone: "green", trigger: "The coordinator sends an eligible version.", feedback: "Read-only record with a compact review summary.", action: "View review history.", send: "Not applicable", recovery: "None; the record is final." },
];

const SURFACE_TOKENS: Array<[string, string, string]> = [
  ["surface.canvas", "#F5F6F8", "Page background"],
  ["surface.primary", "#FFFFFF", "Sidebar, header, cards"],
  ["surface.inset", "#EFF1F4", "Read-only and disabled fills"],
  ["border.default", "#E6E8EC", "Card and row borders"],
  ["text.primary", "#171B24", "Names, titles, message"],
  ["text.secondary", "#475467", "Roles, descriptions, labels"],
  ["text.tertiary", "#667085", "Low-priority metadata"],
  ["action.primary", "#3446B8", "Primary buttons, links, focus ring"],
  ["action.subtle", "#EEF0FF", "Selected navigation"],
];
const STATUS_TOKENS: Array<[string, string, string]> = [
  ["status.danger", "#B42318", "Blocking, rejected"],
  ["status.dangerSurface", "#FFF1EF", "Blocking annotation header"],
  ["status.warningText", "#854D0E", "Pending, outdated labels"],
  ["status.warning", "#A66B13", "Warning icons only"],
  ["status.warningSurface", "#FFF5E5", "Pending annotation header"],
  ["status.success", "#147A58", "Ready, approved, sent"],
  ["status.successSurface", "#EAF7F0", "Approved annotation header"],
  ["toast.background", "#0B1020", "Neutral confirmation toasts"],
];
const TYPE_SCALE: Array<[string, string, CSSProperties, string]> = [
  ["Title", "28 / 34 · 600", { fontSize: 28, fontWeight: 600, letterSpacing: "-.025em", lineHeight: 1.2 }, "Completion timeline update"],
  ["Status title", "18 / 27 · 500", { fontSize: 18, fontWeight: 500 }, "Review outdated"],
  ["Heading", "16 / 24 · 500", { fontSize: 16, fontWeight: 500 }, "Outgoing message"],
  ["Message", "16 / 26 · 400", { fontSize: 16, lineHeight: 1.65 }, "We are currently targeting completion by 30 June."],
  ["Body", "14 / 21 · 400", { fontSize: 14 }, "Recipients outside the project team need Deal Owner approval."],
  ["Meta", "13 / 20 · 400", { fontSize: 13, color: "#475467" }, "Advisor · on the Project Harbor team"],
  ["Caption", "12 / 18 · 500", { fontSize: 12, fontWeight: 500 }, "Pending approval"],
];

const CHECKS = [
  "Authorization boundaries: the workspace has no approve or reject action",
  "Send-disabled conditions in every non-ready state",
  "Draft changes invalidate the review",
  "Recheck behaviour after edits",
  "Exception approval and rejection outcomes",
  "Review-unavailable recovery with Retry check",
  "Undo and Cancel behaviour",
  "Sent-state accuracy: recipients, message, record",
];

export function Process() {
  return (
    <div className="pj">
      <div className="site">
        <Link to="/" className="hero-k">
          <LogoMark />
          DealDesk
        </Link>
        <div className="cta-row">
          <Link to="/">Home</Link>
          <Link to="/prototype">Interactive prototype</Link>
          <span aria-current="page">Process Journey</span>
        </div>
      </div>
      <nav className="top" aria-label="Sections">
        <div className="top-i">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </div>
      </nav>

      <main className="pj-main">
        <header className="hero" id="introduction">
          <div className="hero-k">DealDesk · Process Journey</div>
          <h1>Reviewing a sensitive deal message before it leaves the firm</h1>
          <p className="hero-l">
            DealDesk is a B2B workspace for boutique transaction-advisory firms. This journey documents how the Message Review Workspace was designed and prototyped: the problem, the flows, the decisions and their costs, and how AI was used and checked along the way.
          </p>
          <div className="cta-row">
            <Link to="/prototype" className="cta">
              Explore the interactive prototype
            </Link>
          </div>
          <dl className="facts">
            <div>
              <dt>Challenge</dt>
              <dd>Futureproofing.dev Product Design Challenge</dd>
            </div>
            <div>
              <dt>My role</dt>
              <dd>Product Design, UX Strategy, Interaction Design, AI-assisted prototyping</dd>
            </div>
            <div>
              <dt>Primary user</dt>
              <dd>Deal Coordinator</dd>
            </div>
            <div>
              <dt>Approver</dt>
              <dd>Deal Owner</dd>
            </div>
          </dl>
          <div className="deliv">
            <div className="dv">
              <h3>Interactive Review Workspace</h3>
              <p>A React prototype with three scenarios, simulated data and real state transitions.</p>
              <span className="chip ok">Implemented</span>
            </div>
            <div className="dv">
              <h3>Marketing Homepage</h3>
              <p>Homepage for the business buyer, presenting DealDesk as a workspace with Communication Review as its featured workflow.</p>
              <span className="chip ok">Implemented</span>
            </div>
            <div className="dv">
              <h3>Process Journey</h3>
              <p>This page.</p>
              <span className="chip ok">This page</span>
            </div>
          </div>
        </header>

        <Section num="02" id="problem" title="Problem framing" lede="How can a Deal Coordinator safely send sensitive deal communications when recipient authorization and message commitments must be verified?">
          <div className="two">
            <div className="card red">
              <div className="tag red">Blocking issue 1</div>
              <h3>Recipient authorization</h3>
              <p>Sam Lee belongs to the same client company but is not assigned to Project Harbor. He must be removed, or approved by the Deal Owner.</p>
            </div>
            <div className="card red">
              <div className="tag red">Blocking issue 2</div>
              <h3>Unconfirmed commitment</h3>
              <p>
                The outgoing message says <q>Completion is guaranteed by 30 June.</q> The wording must be revised.
              </p>
            </div>
          </div>
          <p className="note">The two issues are independent. Sending stays blocked until both are resolved and the current version of the draft has passed a valid review.</p>
          <h3 className="sub">Design principles</h3>
          <ol className="principles">
            <li>
              <b>Make risk visible in context.</b> An issue appears on the recipient or sentence it concerns.
            </li>
            <li>
              <b>Keep the user in control.</b> The system flags and blocks; the coordinator chooses the correction.
            </li>
            <li>
              <b>Respect authorization boundaries.</b> A coordinator can request an exception and never approve one.
            </li>
            <li>
              <b>Make review validity explicit.</b> Any edit to recipients or text makes the last review outdated.
            </li>
            <li>
              <b>Provide clear recovery actions.</b> Every non-sendable state names the next step.
            </li>
          </ol>
        </Section>

        <Section num="03" id="architecture" title="Information architecture" lede="A Communication Hub lists drafts by what they need; one workspace handles a single message from review to send.">
          <div className="split">
            <Shot name="hub" alt="Communication Hub with draft groups: needs your action, waiting on Deal Owner, ready to send, sent" caption="Communication Hub: drafts grouped by needed action. Only Project Harbor opens in the prototype." />
            <div className="split-t">
              <h3>Navigation</h3>
              <p>
                The sidebar places the Hub inside a wider product: Overview, <b>Drafts</b>, Deals, Activity, Settings. Drafts is active because reviewing an outgoing message is the task this challenge is about.
              </p>
              <p className="note">Overview, Deals, Activity and Settings are navigation context only. They are not designed or implemented, and do nothing in the prototype.</p>
            </div>
          </div>
          <h3 className="sub">Workspace hierarchy</h3>
          <div className="split wide">
            <figure className="shot anno">
              <div className="anno-w">
                <img src="/journey/blocked-full.webp" width={1280} height={1319} alt="Review workspace in the blocked state with five numbered areas" loading="lazy" />
                <Pin n={1} x={322} y={160} />
                <Pin n={2} x={322} y={260} />
                <Pin n={3} x={322} y={343} />
                <Pin n={4} x={322} y={703} />
                <Pin n={5} x={1196} y={175} />
              </div>
            </figure>
            <ol className="legend">
              <li>
                <div>
                  <b>Draft identification and version.</b> Project label, title, version.
                </div>
              </li>
              <li>
                <div>
                  <b>Global review status.</b> One banner states the state once and holds Send and Recheck.
                </div>
              </li>
              <li>
                <div>
                  <b>Recipients.</b> A flagged recipient carries its issue inline.
                </div>
              </li>
              <li>
                <div>
                  <b>Outgoing message.</b> The flagged sentence is highlighted, with its issue directly beneath.
                </div>
              </li>
              <li>
                <div>
                  <b>Review history on demand.</b> A link in the heading opens a collapsed list at the foot of the page.
                </div>
              </li>
            </ol>
          </div>
          <p className="note">
            <b>Removed from the workspace:</b> a project strip repeating the active project, team list and approver. The project label, each recipient's team line and the approver on a pending request already carry that information where it is needed.
          </p>
        </Section>

        <Section num="04" id="journey" title="Primary user journey" lede="The coordinator corrects both issues, rechecks, and sends. Scenario 1 in the prototype.">
          <Flow items={[["Blocked", "red"], ["Correct issues", ""], ["Review outdated", "amber"], ["Recheck", ""], ["Ready to send", "green"], ["Sent", "green"]]} />
          <div className="steps">
            <Step n={1} shot="j2" alt="Blocked workspace with Sam Lee flagged and the commitment sentence highlighted" title="Blocked" action="Opens the Project Harbor draft." response="A completed review shows two active issues, each on the element it concerns. Send is disabled." state="Blocked · 2 issues to resolve." />
            <Step n={2} shot="j3" alt="Workspace after removing Sam Lee, with a toast offering Undo" title="Remove Sam Lee" action="Selects Remove Sam Lee on the recipient issue." response="Sam leaves the recipient list at once. A toast confirms and offers Undo. No confirmation step: this is the recommended correction." state="Review outdated. Recheck appears; Send stays disabled." />
            <Step n={3} shot="j4" alt="Revise commitment wording modal with the original sentence and an editable field" title="Revise the wording" action="Selects Revise wording on the sentence issue." response="A focused modal opens with the original sentence read-only and an editable field prefilled with it. Save changes is disabled until the text differs." state="Editing is scoped to the flagged sentence." />
            <Step n={4} shot="j6" alt="Revise wording modal with the revised sentence and Save changes enabled" title="Save the revision" action="Rewrites the sentence and saves." response="Only that sentence is replaced in the draft. Nothing is marked resolved yet. An emptied field shows an inline error and keeps Save disabled." state="Review outdated, version incremented." />
            <Step n={5} shot="j7" alt="Review outdated state with Recheck as the primary action" title="Review outdated" action="Sees that the draft changed since the last check." response="One global status explains it. No per-issue cards remain for corrected items. Recheck is the primary action." state="Send disabled until a new check passes." />
            <Step n={6} shot="j8" alt="Ready to send state with Send to 2 recipients" title="Ready to send" action="Selects Recheck." response="The current version passes. The banner names the checked version and the exact recipients." state="Send enabled for this version only." />
            <Step n={7} shot="j9" alt="Message sent screen with recipients, sent message, review record and history" title="Sent" action="Selects Send to 2 recipients." response="A read-only record: time, exact recipients, the message as sent, a compact review record, and the full history on demand (shown expanded here)." state="Final. Sending is simulated." />
          </div>
          <h3 className="sub">Removing an authorized recipient</h3>
          <p className="lede s">Pat Morgan and Alex Rivera are on the project team, so removing one is unusual and gets a confirmation. Both removal paths end with the same Undo toast.</p>
          <div className="two">
            <Shot name="r1" alt="Confirmation modal: Remove Alex Rivera?" caption="The trash icon on an authorized recipient opens a confirmation." />
            <Shot name="r2" alt="Workspace after removing Alex Rivera with an Undo toast" caption="After confirming: removed at once, toast with Undo, review outdated." />
          </div>
        </Section>

        <Section num="05" id="exception" title="Exception management" lede="A separate branch from the Blocked state: the coordinator asks the Deal Owner to allow Sam Lee instead of removing him. Scenario 2 in the prototype.">
          <Flow items={[["Blocked", "red"], ["Request exception", ""], ["Pending approval", "amber"], ["Deal Owner decision", ""]]} />
          <div className="two">
            <Shot name="x1" alt="Request recipient exception modal with a reason entered" caption="Request: recipient, project and a required reason. Submit is disabled until a reason is entered." />
            <Shot name="x4" alt="Workspace with Sam Lee pending approval" caption="Pending approval: amber annotation with reason, time and approver. Status stays Blocked and Send stays disabled." />
          </div>
          <h3 className="sub">Three outcomes</h3>
          <div className="three">
            <div className="out">
              <Shot name="x7" alt="Sam Lee with exception approved; the wording issue still blocks" />
              <div className="tag green">Approved</div>
              <p>Sam Lee receives a recipient exception scoped to him and this draft. The wording issue is still open, and a valid review is still required before sending.</p>
            </div>
            <div className="out">
              <Shot name="x6" alt="Sam Lee with exception rejected and the Deal Owner's feedback" />
              <div className="tag red">Rejected</div>
              <p>Sam remains an unauthorized recipient, with the Deal Owner's feedback. Remove Sam Lee is the primary recovery action. Sending stays blocked.</p>
            </div>
            <div className="out">
              <Shot name="x5" alt="Sam Lee back to blocking after the request was withdrawn" />
              <div className="tag red">Withdrawn</div>
              <p>The coordinator cancels the request. Sam returns to the blocking state and stays in the list until he is removed or an exception is requested again.</p>
            </div>
          </div>
          <div className="split">
            <Shot name="proto-bar" alt="Prototype bar above the product UI with Approve exception and Reject exception controls" caption="The prototype bar sits above the product and is labelled as prototype-only." />
            <div className="card plain">
              <h3>Authorization boundary</h3>
              <p>The coordinator cannot approve their own request: the workspace contains no approve or reject action. In the prototype the Deal Owner's decision is simulated from a separate bar above the product UI, which appears only while a request is pending. An earlier popover inside the product header was removed so that no simulation control looks like a product feature.</p>
            </div>
          </div>
          <h3 className="sub">After approval</h3>
          <div className="two">
            <Shot name="x8" alt="Review outdated with Sam Lee's exception still approved" caption="Revising the wording makes the review outdated but keeps Sam Lee's approval; the next check re-evaluates the whole draft." />
            <Shot name="x11" alt="Message sent to Pat Morgan, Alex Rivera and Sam Lee" caption="Sent to three recipients, with the approved exception in the review record." />
          </div>
        </Section>

        <Section num="06" id="states" title="System states and recovery" lede="Six states, each with one visible status, one clear action and a known way out.">
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>State</th>
                  <th>Trigger</th>
                  <th>User-visible feedback</th>
                  <th>Available action</th>
                  <th>Send</th>
                  <th>Recovery path</th>
                </tr>
              </thead>
              <tbody>
                {STATES.map((s) => (
                  <tr key={s.name}>
                    <th scope="row">
                      <span className={`tag ${s.tone}`}>{s.name}</span>
                    </th>
                    <td>{s.trigger}</td>
                    <td>{s.feedback}</td>
                    <td>{s.action}</td>
                    <td className={s.send === "Enabled" ? "send on" : "send"}>{s.send}</td>
                    <td>{s.recovery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="split">
            <Shot name="x9" alt="Review unavailable with Retry check and Send disabled" caption="Review unavailable: scenario 3 fails its first check on purpose, then recovers on Retry check." />
            <div className="split-t">
              <div className="card plain">
                <h3>Pending is not approved</h3>
                <p>A pending request never enables sending. Only a recorded Deal Owner approval changes the recipient's status, and even then the draft needs a valid review.</p>
              </div>
              <div className="card plain">
                <h3>Edits invalidate the review, not the approval</h3>
                <p>Editing recipients or text makes the overall review outdated. A scoped approval that still applies, such as Sam Lee's when only the wording changed, stays recorded and is re-evaluated by the next check.</p>
              </div>
            </div>
          </div>
          <p className="note">A short Checking state appears while a check runs. It also keeps Send disabled.</p>
        </Section>

        <Section num="07" id="decisions" title="Design decisions and trade-offs" lede="Each decision records what was chosen, what it was chosen over, and what it costs. None of these has been tested with users.">
          <Decision letter="A" title="Inline annotations vs. separate review panel" chosen="Inline annotations" alternative="A side panel listing all issues, linked to the draft." benefit="Each issue sits next to the affected recipient or sentence, so nothing has to be mapped between two regions." cost="Several issues at once can fragment the workspace." />
          <Decision letter="B" title="Confirmation modal vs. direct removal with Undo" chosen="Risk-based interaction" alternative="One pattern for every removal." benefit="Removing an authorized recipient asks for confirmation and supports Undo. Removing the flagged recipient is direct, with Undo, because it is the recommended correction." cost="Two behaviours for one action add some complexity. The extra confirmation is a product assumption." />
          <Decision letter="C" title="Inline editing vs. modal-based wording revision" chosen="Modal-based revision" alternative="Turning the flagged sentence into an inline input." benefit="The original and the revised sentence sit together for comparison, and editing is visibly scoped to one sentence." cost="One more interaction than inline editing, and the modal covers part of the message while it is open." />
          <Decision letter="D" title="Persistent resolved issues vs. history on demand" chosen="Active issues stay visible; corrected issues move to Review history" alternative="Keeping pending-recheck and resolved cards in the workspace." benefit="The workspace stays focused on unresolved work." cost="Between a correction and the recheck, the workspace does not list which items changed. That detail takes one more interaction." />
          <Decision letter="E" title="Automatic review vs. explicit Recheck" chosen="Explicit Recheck after edits" alternative="Rechecking automatically after every edit." benefit="The coordinator can tell a current review from an outdated one, and decides when the draft is ready to be checked again." cost="An intentional extra step before sending." note="Each scenario opens with the first review already completed. How a first check starts is not designed." />
          <blockquote className="principle">One global status. Contextual feedback for active issues. Detailed history on demand.</blockquote>
        </Section>

        <Section num="08" id="system" title="Visual design system" lede="Light theme, DM Sans, borders instead of shadows, and colour reserved for meaning.">
          <div className="split">
            <div>
              <h3>Typography</h3>
              <p className="lede s">DM Sans in three weights (400, 500, 600). No uppercase labels.</p>
              <div className="types">
                {TYPE_SCALE.map(([name, spec, style, sample]) => (
                  <div key={name} className="ty">
                    <div className="ty-m">
                      <b>{name}</b>
                      <span>{spec}</span>
                    </div>
                    <div style={style}>{sample}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3>Surfaces, text and action</h3>
              <div className="sws">
                {SURFACE_TOKENS.map(([token, hex, use]) => (
                  <Swatch key={token} token={token} hex={hex} use={use} />
                ))}
              </div>
            </div>
          </div>
          <h3 className="sub">Semantic status colours</h3>
          <div className="sem">
            <div>
              <span className="dot" style={{ background: "#B42318" }} />
              <b>Red</b> Blocking
            </div>
            <div>
              <span className="dot" style={{ background: "#A66B13" }} />
              <b>Amber</b> Pending, outdated
            </div>
            <div>
              <span className="dot" style={{ background: "#147A58" }} />
              <b>Green</b> Ready, approved, success
            </div>
            <div>
              <span className="dot" style={{ background: "#0B1020" }} />
              <b>Deep navy</b> Neutral confirmation toasts
            </div>
          </div>
          <div className="sws four">
            {STATUS_TOKENS.map(([token, hex, use]) => (
              <Swatch key={token} token={token} hex={hex} use={use} />
            ))}
          </div>
          <p className="note">
            Every status pairs its colour with an icon and a label. Amber text uses the darker <code>#854D0E</code> because <code>#A66B13</code> gives 4.1:1 on its surface, below the 4.5:1 needed for normal text; that tone is kept for icons.
          </p>
          <h3 className="sub">Components</h3>
          <p className="lede s">These five images are from the design system reference board, which also holds states the prototype does not reach.</p>
          <div className="two">
            <Shot name="ds-status" alt="Twelve status badges with icon and label" caption="Status badges" />
            <Shot name="ds-banner" alt="Review status banners for each state" caption="Global review status banner" />
          </div>
          <Shot wide name="ds-buttons" alt="Button states" caption="Buttons: primary, secondary, ghost, disabled, loading, and icon buttons with hover, tooltip and focus states" />
          <Shot wide name="ds-field" alt="Form field states" caption="Text area: default, focus and error" />
          <Shot wide name="ds-panels" alt="Issue panels, rows and toast" caption="Inline annotations, recipient card, draft queue item, navigation item and toast" />
          <h3 className="sub">Responsive behaviour</h3>
          <div className="split">
            <div className="phones">
              <Shot name="n1" alt="Review workspace at 390 pixels wide" caption="Workspace" />
              <Shot name="n2" alt="Revise wording modal at 390 pixels wide" caption="Modal" />
              <Shot name="n3" alt="Navigation drawer at 390 pixels wide" caption="Navigation drawer" />
            </div>
            <div className="split-t">
              <p>Below 860 px the sidebar becomes a drawer, banner actions wrap under the status, annotations stay inline under their recipient or sentence, modals use the full width, and controls grow to 44 px.</p>
              <p className="note">A bottom-sheet pattern for issue details was designed for narrow screens. It is not implemented in the prototype.</p>
            </div>
          </div>
        </Section>

        <Section num="09" id="homepage" title="Marketing homepage" lede="The second challenge deliverable, aimed at the business buyer: a Managing Partner or Operations Lead.">
          <Shot wide name="home-hero" alt="DealDesk homepage hero: dark navy, headline, two buttons and the review workspace rising out of a blue glow" caption="Hero: the product-level promise, with the review workspace as the product preview." />
          <div className="two">
            <div className="card plain">
              <h3>Target buyer and value proposition</h3>
              <p>
                The page speaks to the firm, not to the coordinator. The headline, <q>Keep every deal moving, with everyone aligned.</q>, positions DealDesk as a shared workspace. Communication Review is presented as one featured workflow inside it, not as the whole product.
              </p>
            </div>
            <div className="card plain">
              <h3>Primary call to action</h3>
              <p>Explore the workspace, which opens the prototype. It appears in the navigation, the hero and the closing section. Read the Process Journey is the secondary action throughout.</p>
            </div>
          </div>
          <h3 className="sub">Content hierarchy</h3>
          <ol className="principles">
            <li>
              <b>Hero.</b> Value proposition, two actions, product preview.
            </li>
            <li>
              <b>Three pillars.</b> Deal coordination, Communication control, Operational visibility.
            </li>
            <li>
              <b>Featured workflow.</b> Communication Review, with interface examples and its three steps.
            </li>
            <li>
              <b>For firms.</b> What a Managing Partner or Operations Lead gets.
            </li>
            <li>
              <b>Closing action.</b> Into the prototype or this journey.
            </li>
          </ol>
          <div className="split">
            <Shot name="home-featured" alt="Featured workflow section with three cards showing a flagged recipient, a pending and approved exception, and the review status sequence" caption="Featured workflow: the interface examples reuse the prototype's components and copy." />
            <div className="split-t" style={{ maxWidth: 300 }}>
              <Shot name="home-mobile" alt="Homepage at 390 pixels wide" caption="At 390 px: one column, navigation wraps under the brand." />
            </div>
          </div>
          <div className="two">
            <div className="card plain">
              <h3>Relationship to the product</h3>
              <p>Every interface example on the homepage shows behaviour the prototype has. Two of the three pillars, Deal coordination and Operational visibility, are labelled Product vision on the page because nothing has been designed or built for them.</p>
            </div>
            <div className="card plain">
              <h3>Responsive decisions</h3>
              <p>Below 1100 px the floating status chips are removed so the preview stays readable. Below 760 px every grid becomes one column and the decorative rings are dropped.</p>
            </div>
          </div>
          <p className="note">The homepage has no testimonials, customer logos, metrics, certifications or guarantees, because DealDesk is fictional. Its messaging has not been tested with buyers.</p>
        </Section>

        <Section num="10" id="ai" title="AI-assisted workflow and verification" lede="AI tool: Claude Design. The product decisions were mine; the AI produced and revised the artefacts I directed.">
          <div className="two">
            <div className="card plain">
              <h3>What I decided</h3>
              <ul>
                <li>Problem framing, user journey and the business rules of the scenario.</li>
                <li>Inline annotations over a side panel, after reviewing both.</li>
                <li>Risk-based removal: confirmation for authorized recipients, direct removal for the flagged one.</li>
                <li>The modal for revising wording, after exploring it against inline editing.</li>
                <li>Removing pending and resolved cards in favour of one global status.</li>
                <li>Visual direction, colour tokens, DM Sans, and the semantic colour roles.</li>
                <li>Keeping simulation controls out of the product UI.</li>
              </ul>
            </div>
            <div className="card plain">
              <h3>What the AI did</h3>
              <ul>
                <li>UI exploration: two visual directions and three typeface options on the same screen.</li>
                <li>Component generation: badges, banners, annotations, modals, toasts and their states.</li>
                <li>Interactive prototyping: a click-through on the design canvas, then this React prototype with its state model and mock review engine.</li>
                <li>Visual refinement from my comments on each screen.</li>
                <li>Iteration across system states, keeping copy and components consistent.</li>
                <li>Contrast calculations for the colour tokens, and the scripted checks below.</li>
              </ul>
            </div>
          </div>
          <h3 className="sub">Where I corrected AI output</h3>
          <ul className="fix">
            <li>
              <b>Too much explanatory copy.</b> Early states repeated the same rule in several places. I set the rule: show the state once, explain the consequence where needed.
            </li>
            <li>
              <b>Misread instructions.</b> The AI removed the wrong element twice (a number badge, a divider); I caught it on review and had it restored.
            </li>
            <li>
              <b>Simulation controls in the product UI.</b> The AI reintroduced a prototype-controls trigger in the header; I removed it again.
            </li>
            <li>
              <b>A token that failed contrast.</b> The amber I specified failed AA for text on its surface. The AI flagged it and I accepted a darker text tone.
            </li>
          </ul>
          <h3 className="sub">Verification checklist</h3>
          <div className="tbl">
            <table className="chk">
              <thead>
                <tr>
                  <th>Behaviour</th>
                  <th>Rule check on the state model</th>
                  <th>Scripted browser check</th>
                </tr>
              </thead>
              <tbody>
                {CHECKS.map((check) => (
                  <tr key={check}>
                    <td>{check}</td>
                    <td>
                      <span className="chip ok">Passed</span>
                    </td>
                    <td>
                      <span className="chip ok">Passed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="note">These are scripted checks, run on a local build in headless Chrome at 1280 px and 390 px. They were not run against a deployed site. Screen readers, other browsers and real devices are untested, and nothing has been tested with users.</p>
        </Section>

        <Section num="11" id="scope" title="Scope, assumptions and limitations" lede="What is implemented, what is simulated, and what was assumed to make the scenario coherent.">
          <div className="four-c">
            <div className="card plain">
              <h3>Implemented</h3>
              <ul>
                <li>Three scenarios with Reset, each from a fixed starting state.</li>
                <li>Recipient removal with confirmation and Undo, wording revision, Recheck and the Sent record.</li>
                <li>Exception request and withdrawal.</li>
                <li>Review history on demand and a responsive layout.</li>
              </ul>
            </div>
            <div className="card plain">
              <h3>Simulated</h3>
              <ul>
                <li>Deal Owner decisions, from the prototype bar.</li>
                <li>Review outcomes, from a mock engine with two fixed rules, including one scripted failed check.</li>
                <li>Sending the message. Nothing is delivered.</li>
                <li>All names, times and message text.</li>
              </ul>
            </div>
            <div className="card plain">
              <h3>Out of scope</h3>
              <ul>
                <li>Production backend, real email delivery, authentication.</li>
                <li>Add recipient, free editing of the message, exceptions for wording.</li>
                <li>Overview, Deals, Activity and Settings. The Deal coordination and Operational visibility pillars are product vision only.</li>
                <li>The Deal Owner's own screens.</li>
              </ul>
            </div>
            <div className="card plain">
              <h3>Assumptions</h3>
              <ul>
                <li>Undo restores the recipient but the review stays outdated.</li>
                <li>Authorized recipients need a confirmation before removal.</li>
                <li>An approval survives unrelated edits and is re-evaluated at the next check.</li>
                <li>The first check has already run when a draft is opened.</li>
              </ul>
            </div>
          </div>
        </Section>

        <Section num="12" id="outcome" title="Final outcome" lede="What the solution demonstrates.">
          <ul className="outs">
            <li>
              <b>Safe communication review.</b> Nothing is sent unless the current version has passed a check.
            </li>
            <li>
              <b>Contextual issue resolution.</b> Each issue is explained and resolved where it occurs.
            </li>
            <li>
              <b>Explicit authorization boundaries.</b> Requesting and approving are separate roles.
            </li>
            <li>
              <b>Review validity and version awareness.</b> Edits visibly outdate a review.
            </li>
            <li>
              <b>Recovery from exceptional states.</b> Rejected, withdrawn and unavailable each have a next step.
            </li>
            <li>
              <b>Human control over sensitive actions.</b> The system blocks and informs; people decide.
            </li>
          </ul>
          <div className="cta-row">
            <Link to="/prototype" className="cta">
              Explore the interactive prototype
            </Link>
            <Link to="/">Back to the homepage</Link>
          </div>
        </Section>
      </main>
      <footer className="foot">DealDesk is a fictional product created for the Futureproofing.dev Product Design Challenge. Project Harbor and all people named are invented. Sending and approvals are simulated.</footer>
    </div>
  );
}
