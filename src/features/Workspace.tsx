import { useEffect, useRef, useState, type Dispatch, type ReactNode } from "react";
import { Avatar, Icon, StatusTag, type IconName, type Tone } from "../components/ui";
import { activeIssues, blockedSummary, canRecheck, canSend, globalStatus, recipientNames } from "../domain/selectors";
import type { Action, ExceptionRequest, HistoryEvent, Recipient, ScenarioState, Sentence } from "../domain/types";
import { RemoveRecipientModal, ReviseWordingModal, RequestExceptionModal } from "./modals";

/** How long the simulated check takes, so the Checking state is visible. */
const CHECK_DELAY_MS = 700;
const TOAST_MS = 10000;

type ModalState = { kind: "remove"; recipient: Recipient } | { kind: "revise"; sentence: Sentence } | { kind: "exception"; recipient: Recipient } | null;

export function ReviewHistory({ events, open, onToggle }: { events: HistoryEvent[]; open: boolean; onToggle: () => void }) {
  return (
    <div className="history">
      <button type="button" className="history-toggle" aria-expanded={open} aria-controls="history-list" onClick={onToggle}>
        <Icon name={open ? "down" : "right"} size={15} />
        {open ? "Hide review history" : "View review history"}
      </button>
      {open && (
        <ol id="history-list" className="history-list">
          {events.map((event, index) => (
            <li key={index}>
              <span className="history-time">{event.time}</span>
              <span>{event.text}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Banner({ tone, icon, title, sub, spin, children }: { tone: Tone; icon: IconName; title: string; sub: string; spin?: boolean; children: ReactNode }) {
  return (
    <section className="banner" aria-label="Review status">
      <span className={`banner-icon tone-${tone}`} aria-hidden="true">
        <Icon name={icon} size={20} strokeWidth={1.6} spin={spin} />
      </span>
      <div className="banner-text" role="status">
        <div className={`banner-title text-${tone}`}>{title}</div>
        <div className="banner-sub">{sub}</div>
      </div>
      <div className="banner-actions">{children}</div>
    </section>
  );
}

function IssuePanel({ number, tone, head, tag, children }: { number: number; tone: Tone; head: ReactNode; tag: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={`issue issue-${tone}`}>
      <div className="issue-head">
        <span className="issue-num" aria-hidden="true">
          {number}
        </span>
        <div className="issue-title">{head}</div>
        {tag}
        <button type="button" className="icon-btn" aria-expanded={open} aria-label={open ? "Collapse" : "Expand"} onClick={() => setOpen(!open)}>
          <Icon name={open ? "up" : "down"} />
        </button>
      </div>
      {open && <div className="issue-body">{children}</div>}
    </div>
  );
}

function Facts({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="facts">
      {rows.map(([label, value]) => (
        <FactRow key={label} label={label} value={value} />
      ))}
    </dl>
  );
}
function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

export function Workspace({ state, dispatch, onBack }: { state: ScenarioState; dispatch: Dispatch<Action>; onBack: () => void }) {
  const [modal, setModal] = useState<ModalState>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);
  const status = globalStatus(state);
  const issues = activeIssues(state);
  const { draft } = state;

  // The simulated check finishes after a short, fixed delay.
  useEffect(() => {
    if (!state.checking) return;
    const timer = window.setTimeout(() => dispatch({ type: "CHECK_FINISHED" }), CHECK_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [state.checking, dispatch]);

  // A toast disappears on its own; Undo is only offered while it is visible.
  const toastId = state.toast?.id;
  useEffect(() => {
    if (toastId === undefined) return;
    const timer = window.setTimeout(() => dispatch({ type: "DISMISS_TOAST" }), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [toastId, dispatch]);

  const recheck = () => dispatch({ type: "CHECK_STARTED" });
  const sendDisabled = (
    <button type="button" className="btn btn-disabled" disabled>
      <Icon name="send" size={15} />
      Send
    </button>
  );

  let banner: ReactNode;
  if (status === "checking") {
    banner = (
      <Banner tone="neutral" icon="spinner" spin title="Checking" sub={`Version ${draft.version}`}>
        {sendDisabled}
      </Banner>
    );
  } else if (status === "blocked") {
    banner = (
      <Banner tone="danger" icon="alert" title="Blocked" sub={blockedSummary(state)}>
        {sendDisabled}
      </Banner>
    );
  } else if (status === "outdated") {
    banner = (
      <Banner tone="warning" icon="refresh" title="Review outdated" sub={draft.recipients.length === 0 ? "No recipients. Undo the removal to recheck." : "Changes made since the last check."}>
        <button type="button" className="btn btn-primary" onClick={recheck} disabled={!canRecheck(state)}>
          <Icon name="refresh" size={15} />
          Recheck
        </button>
        {sendDisabled}
      </Banner>
    );
  } else if (status === "unavailable") {
    banner = (
      <Banner tone="warning" icon="triangle" title="Review unavailable" sub="The check could not be completed.">
        <button type="button" className="btn btn-primary" onClick={recheck} disabled={!canRecheck(state)}>
          <Icon name="refresh" size={15} />
          Retry check
        </button>
        {sendDisabled}
      </Banner>
    );
  } else {
    const count = draft.recipients.length;
    banner = (
      <Banner tone="success" icon="check" title="Ready to send" sub={`Version ${draft.version} checked · To ${recipientNames(state)}`}>
        <button type="button" className="btn btn-primary" onClick={() => dispatch({ type: "SEND" })} disabled={!canSend(state)}>
          <Icon name="send" size={15} />
          Send to {count} {count === 1 ? "recipient" : "recipients"}
        </button>
      </Banner>
    );
  }

  const issueNumber = (id: string) => issues.findIndex((i) => i.id === id) + 1;
  const busy = state.checking;

  function recipientRow(recipient: Recipient) {
    const teamLine = `${recipient.role} · on the ${draft.project} team`;
    const outsideLine = (
      <>
        <div className="strong">{recipient.name}</div>
        <div className="meta">
          Not on the {draft.project} team{recipient.relation ? ` · ${recipient.relation}` : ""}
        </div>
      </>
    );
    if (recipient.onProjectTeam) {
      return (
        <div key={recipient.id} className="row">
          <Avatar initials={recipient.initials} />
          <div className="row-text">
            <div className="strong">{recipient.name}</div>
            <div className="meta">{teamLine}</div>
          </div>
          <button type="button" className="icon-btn" aria-label={`Remove ${recipient.name}`} data-tip="Remove recipient" disabled={busy} onClick={() => setModal({ kind: "remove", recipient })}>
            <Icon name="trash" size={17} />
          </button>
        </div>
      );
    }

    const ex: ExceptionRequest | null = state.exception && state.exception.recipientId === recipient.id ? state.exception : null;
    const remove = (variant: "primary" | "secondary") => (
      <button type="button" className={`btn btn-${variant}`} disabled={busy} onClick={() => dispatch({ type: "REMOVE_RECIPIENT", recipientId: recipient.id })}>
        Remove {recipient.name}
      </button>
    );
    const number = issueNumber(`recipient:${recipient.id}`) || 1;

    if (ex?.status === "approved") {
      return (
        <IssuePanel key={recipient.id} number={number} tone="success" head={outsideLine} tag={<StatusTag tone="success" icon="check">Exception approved</StatusTag>}>
          <Facts rows={[["Decision", "Approved by Deal Owner"], ["Decided", `Today ${ex.decidedAt}`], ["Reason", ex.reason]]} />
        </IssuePanel>
      );
    }
    if (ex?.status === "pending") {
      return (
        <IssuePanel key={recipient.id} number={number} tone="warning" head={outsideLine} tag={<StatusTag tone="warning" icon="clock">Pending approval</StatusTag>}>
          <Facts rows={[["Reason", ex.reason], ["Requested", `Today ${ex.requestedAt}`], ["Approver", "Deal Owner"]]} />
          <div className="actions">
            {remove("secondary")}
            <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: "WITHDRAW_EXCEPTION" })}>
              Withdraw request
            </button>
          </div>
        </IssuePanel>
      );
    }
    if (ex?.status === "rejected") {
      return (
        <IssuePanel key={recipient.id} number={number} tone="danger" head={outsideLine} tag={<StatusTag tone="danger" icon="x">Exception rejected</StatusTag>}>
          <Facts rows={[["Decision", "Rejected by Deal Owner"], ["Decided", `Today ${ex.decidedAt}`], ["Feedback", ex.feedback ?? ""]]} />
          <div className="actions">{remove("primary")}</div>
        </IssuePanel>
      );
    }
    return (
      <IssuePanel key={recipient.id} number={number} tone="danger" head={outsideLine} tag={<StatusTag tone="danger" icon="alert">Blocking</StatusTag>}>
        <div className="issue-row">
          <span className="issue-why">Recipients outside the project team need Deal Owner approval.</span>
          <div className="actions">
            {remove("primary")}
            <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => setModal({ kind: "exception", recipient })}>
              Request exception
            </button>
          </div>
        </div>
      </IssuePanel>
    );
  }

  function sentenceBlock(sentence: Sentence) {
    const issue = issues.find((i) => i.kind === "wording" && i.targetId === sentence.id);
    if (!issue) return <p key={sentence.id}>{sentence.text}</p>;
    return (
      <div key={sentence.id} className="flagged">
        <p>
          <mark>{sentence.text}</mark>
        </p>
        <div className="flagged-issue">
          <IssuePanel number={issueNumber(issue.id)} tone="danger" head={<div className="strong">Unconfirmed commitment wording</div>} tag={<StatusTag tone="danger" icon="alert">Blocking</StatusTag>}>
            <div className="issue-row">
              <span className="issue-why">States a guaranteed outcome that has not been confirmed.</span>
              <div className="actions">
                <button type="button" className="btn btn-primary" disabled={busy} onClick={() => setModal({ kind: "revise", sentence })}>
                  Revise wording
                </button>
              </div>
            </div>
          </IssuePanel>
        </div>
      </div>
    );
  }

  const count = draft.recipients.length;
  return (
    <>
      <div className="heading">
        <button type="button" className="back" onClick={onBack}>
          <Icon name="back" size={15} />
          Back to Drafts
        </button>
        <div className="heading-row">
          <div className="heading-title">
            <div className="project-label">{draft.project}</div>
            <h1>{draft.title}</h1>
          </div>
          <span className="heading-meta">
            Draft · Version {draft.version}
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setHistoryOpen(true);
                window.setTimeout(() => historyRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 0);
              }}
            >
              <Icon name="history" size={14} />
              Review history
            </button>
          </span>
        </div>
      </div>

      {banner}

      <section className="block" aria-label="Recipients">
        <h2 className="block-title">
          To <span className="count">· {count} {count === 1 ? "recipient" : "recipients"}</span>
        </h2>
        {draft.recipients.map(recipientRow)}
      </section>

      <section className="block" aria-label="Message">
        <h2 className="block-title">Outgoing message</h2>
        <div className="message">
          <div className="subject">
            <div className="caption">Subject</div>
            <div className="strong">{draft.subject}</div>
          </div>
          <div className="message-body">{draft.sentences.map(sentenceBlock)}</div>
        </div>
      </section>

      <section className="block" aria-label="Review history" ref={historyRef}>
        <ReviewHistory events={state.history} open={historyOpen} onToggle={() => setHistoryOpen(!historyOpen)} />
      </section>

      {state.toast && (
        <div className="toast" role="status">
          <span className="toast-text">{state.toast.text}</span>
          {state.toast.undo && state.undo && (
            <button type="button" className="toast-btn" onClick={() => dispatch({ type: "UNDO_REMOVE" })}>
              Undo
            </button>
          )}
          <button type="button" className="toast-close" aria-label="Close" onClick={() => dispatch({ type: "DISMISS_TOAST" })}>
            <Icon name="x" size={15} />
          </button>
        </div>
      )}

      {modal?.kind === "remove" && (
        <RemoveRecipientModal
          recipient={modal.recipient}
          project={draft.project}
          onCancel={() => setModal(null)}
          onConfirm={() => {
            dispatch({ type: "REMOVE_RECIPIENT", recipientId: modal.recipient.id });
            setModal(null);
          }}
        />
      )}
      {modal?.kind === "revise" && (
        <ReviseWordingModal
          sentence={modal.sentence}
          onCancel={() => setModal(null)}
          onSave={(text) => {
            dispatch({ type: "REVISE_SENTENCE", sentenceId: modal.sentence.id, text });
            setModal(null);
          }}
        />
      )}
      {modal?.kind === "exception" && (
        <RequestExceptionModal
          recipient={modal.recipient}
          project={draft.project}
          onCancel={() => setModal(null)}
          onSubmit={(reason) => {
            dispatch({ type: "REQUEST_EXCEPTION", recipientId: modal.recipient.id, reason });
            setModal(null);
          }}
        />
      )}
    </>
  );
}
