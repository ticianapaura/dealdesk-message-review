import type { ReactNode } from "react";
import { Icon, StatusTag } from "../components/ui";
import { activeIssues, blockedSummary, globalStatus } from "../domain/selectors";
import type { ScenarioState } from "../domain/types";

function Group({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="queue" aria-labelledby={id}>
      <h2 id={id} className="queue-title">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ project, detail, tag, action }: { project: string; detail: string; tag: ReactNode; action: ReactNode }) {
  return (
    <div className="queue-row">
      <div className="queue-text">
        <div className="queue-project">{project}</div>
        <div className="meta">{detail}</div>
      </div>
      {tag}
      {action}
    </div>
  );
}

/** Example rows for other projects. They give the queue context and cannot be opened. */
function SampleButton({ label }: { label: string }) {
  return (
    <button type="button" className="btn btn-secondary" disabled title="Not part of this prototype">
      {label}
    </button>
  );
}

/** Communication Hub: drafts grouped by what they need. Only Project Harbor is live. */
export function Hub({ state, onOpen }: { state: ScenarioState; onOpen: () => void }) {
  const status = globalStatus(state);
  const { draft } = state;
  const open = (label: string, primary = false) => (
    <button type="button" className={primary ? "btn btn-primary" : "btn btn-secondary"} onClick={onOpen}>
      {label}
    </button>
  );

  let harborAction: ReactNode = null;
  if (status === "blocked") {
    const pending = state.exception?.status === "pending" && activeIssues(state).some((i) => i.targetId === state.exception?.recipientId);
    harborAction = (
      <Row
        project={draft.project}
        detail={`${draft.title} · ${blockedSummary(state).replace(/\.$/, "")}`}
        tag={pending ? <StatusTag tone="warning" icon="clock">Pending approval</StatusTag> : <StatusTag tone="danger" icon="alert">Blocked</StatusTag>}
        action={open("Review", true)}
      />
    );
  } else if (status === "outdated" || status === "checking") {
    harborAction = <Row project={draft.project} detail={`${draft.title} · changed since the last check`} tag={<StatusTag tone="warning" icon="refresh">Review outdated</StatusTag>} action={open("Review", true)} />;
  } else if (status === "unavailable") {
    harborAction = <Row project={draft.project} detail={`${draft.title} · the check could not be completed`} tag={<StatusTag tone="warning" icon="triangle">Review unavailable</StatusTag>} action={open("Review", true)} />;
  }

  return (
    <>
      <div className="hub-head">
        <div className="crumb">Workspace / Drafts</div>
        <h1>Communication Hub</h1>
        <p className="secondary">Manage outgoing deal communications.</p>
      </div>

      <Group id="q-action" title="Needs your action">
        {harborAction ?? <div className="queue-empty">Nothing needs your action.</div>}
      </Group>

      <Group id="q-wait" title="Waiting on Deal Owner">
        <Row project="Project Meridian" detail="Fee letter cover note · cannot be sent yet" tag={<StatusTag tone="warning" icon="clock">Pending approval</StatusTag>} action={<SampleButton label="View" />} />
      </Group>

      <Group id="q-ready" title="Ready to send">
        {status === "ready" && (
          <Row project={draft.project} detail={`${draft.title} · Version ${draft.version} checked`} tag={<StatusTag tone="success" icon="check">Ready to send</StatusTag>} action={open("Open", true)} />
        )}
        <Row project="Project Atlas" detail="Site visit confirmation · current version checked, no blocking issues" tag={<StatusTag tone="success" icon="check">Ready to send</StatusTag>} action={<SampleButton label="Open" />} />
      </Group>

      <Group id="q-sent" title="Sent">
        {state.sent && (
          <Row project={draft.project} detail={`${draft.title} · sent today, ${state.sent.time}`} tag={<StatusTag tone="success" icon="send">Sent</StatusTag>} action={open("Open")} />
        )}
        <div className="queue-row">
          <div className="queue-text secondary">3 earlier sent messages, each with its review record</div>
          <button type="button" className="btn btn-ghost" disabled title="Not part of this prototype">
            Show sent
            <Icon name="down" size={14} />
          </button>
        </div>
      </Group>
    </>
  );
}
