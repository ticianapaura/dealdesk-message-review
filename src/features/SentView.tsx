import { useState } from "react";
import { Icon } from "../components/ui";
import type { ScenarioState } from "../domain/types";
import { ReviewHistory } from "./Workspace";

/** Read-only record of a sent message. Sending is simulated: nothing leaves the browser. */
export function SentView({ state, onBack }: { state: ScenarioState; onBack: () => void }) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const sent = state.sent;
  if (!sent) return null;
  const count = sent.recipients.length;
  return (
    <>
      <div className="heading">
        <button type="button" className="back" onClick={onBack}>
          <Icon name="back" size={15} />
          Back to Drafts
        </button>
        <div className="heading-row">
          <div className="heading-title">
            <div className="project-label">{state.draft.project}</div>
            <h1>{state.draft.title}</h1>
          </div>
          <span className="heading-meta">Sent · read-only</span>
        </div>
      </div>

      <section className="sent-card" aria-label="Sent message summary">
        <div className="sent-head">
          <span className="banner-icon tone-success" aria-hidden="true">
            <Icon name="check" size={20} strokeWidth={1.6} />
          </span>
          <div role="status">
            <div className="banner-title text-success">Message sent</div>
            <div className="meta">
              Today, {sent.time} · {count} {count === 1 ? "recipient" : "recipients"}
            </div>
          </div>
        </div>
        <div className="rule" aria-hidden="true" />
        <div className="sent-section">
          <h2 className="block-title">Recipients</h2>
          <div>{sent.recipients.map((r) => r.name).join(" · ")}</div>
        </div>
        <div className="rule" aria-hidden="true" />
        <div className="sent-section">
          <h2 className="block-title">Sent message</h2>
          <div className="message-body">
            <div className="strong">{sent.subject}</div>
            {sent.sentences.map((s) => (
              <div key={s.id}>{s.text}</div>
            ))}
          </div>
        </div>
        <div className="rule" aria-hidden="true" />
        <div className="sent-section">
          <div className="record-head">
            <h2 className="block-title">Review record</h2>
            <span className="pill">Version {sent.version}</span>
          </div>
          <div className="secondary">{sent.summary}</div>
          <ReviewHistory events={state.history} open={historyOpen} onToggle={() => setHistoryOpen(!historyOpen)} />
        </div>
      </section>
    </>
  );
}
