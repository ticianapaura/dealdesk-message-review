import { useState } from "react";
import { Modal } from "../components/Modal";
import { Icon } from "../components/ui";
import type { Recipient, Sentence } from "../domain/types";

/** Confirmation before removing a recipient who is on the project team. */
export function RemoveRecipientModal({ recipient, project, onCancel, onConfirm }: { recipient: Recipient; project: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Modal title={`Remove ${recipient.name}?`} titleId="rm-title" role="alertdialog" describedBy="rm-desc" onClose={onCancel} showClose={false}>
      <div id="rm-desc" className="modal-text">
        <p>
          {recipient.name} is an assigned {project} team member and will no longer receive this message.
        </p>
        <p>Changing recipients requires a new review.</p>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" data-autofocus onClick={onConfirm}>
          Remove recipient
        </button>
      </div>
    </Modal>
  );
}

function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <div id={id} className="field-error" role="alert">
      <Icon name="alert" size={14} strokeWidth={1.75} />
      {children}
    </div>
  );
}

/** Focused editing of the flagged sentence only. The original stays visible for comparison. */
export function ReviseWordingModal({ sentence, onCancel, onSave }: { sentence: Sentence; onCancel: () => void; onSave: (text: string) => void }) {
  const [value, setValue] = useState(sentence.text);
  const empty = value.trim() === "";
  const changed = !empty && value.trim() !== sentence.text;
  return (
    <Modal title="Revise commitment wording" titleId="rv-title" onClose={onCancel}>
      <div className="field">
        <div id="rv-orig-label" className="field-label">
          Original sentence
        </div>
        <div className="readonly-text" aria-labelledby="rv-orig-label">
          {sentence.text}
        </div>
      </div>
      <form
        className="modal-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (changed) onSave(value);
        }}
      >
        <div className="field">
          <label htmlFor="rv-input" className="field-label">
            Revised sentence
          </label>
          <textarea
            id="rv-input"
            className={empty ? "textarea message-size invalid" : "textarea message-size"}
            rows={2}
            value={value}
            data-autofocus
            aria-invalid={empty || undefined}
            aria-describedby={empty ? "rv-error" : "rv-help"}
            onChange={(e) => setValue(e.target.value)}
          />
          {empty ? (
            <FieldError id="rv-error">Enter the revised sentence.</FieldError>
          ) : (
            <div id="rv-help" className="field-help">
              Changing the wording requires a new review.
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!changed}>
            Save changes
          </button>
        </div>
      </form>
    </Modal>
  );
}

/** The coordinator can request an exception and must give a reason. Only the Deal Owner decides. */
export function RequestExceptionModal({ recipient, project, onCancel, onSubmit }: { recipient: Recipient; project: string; onCancel: () => void; onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const empty = reason.trim() === "";
  const showError = empty && touched;
  return (
    <Modal title="Request recipient exception" titleId="ex-title" onClose={onCancel}>
      <dl className="facts">
        <dt>Recipient</dt>
        <dd>
          <div className="strong">{recipient.name}</div>
          <div className="meta">
            Not on the {project} team{recipient.relation ? ` · ${recipient.relation}` : ""}
          </div>
        </dd>
        <dt>Project</dt>
        <dd className="strong">{project}</dd>
      </dl>
      <form
        className="modal-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!empty) onSubmit(reason);
        }}
      >
        <div className="field">
          <label htmlFor="ex-reason" className="field-label">
            Reason <span className="field-req">· required</span>
          </label>
          <textarea
            id="ex-reason"
            className={showError ? "textarea invalid" : "textarea"}
            rows={3}
            required
            aria-required="true"
            value={reason}
            data-autofocus
            aria-invalid={showError || undefined}
            aria-describedby={showError ? "ex-error" : "ex-help"}
            onChange={(e) => {
              setReason(e.target.value);
              setTouched(true);
            }}
          />
          {showError ? (
            <FieldError id="ex-error">Enter a reason for the request.</FieldError>
          ) : (
            <div id="ex-help" className="field-help">
              The Deal Owner decides this request.
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={empty}>
            Submit request
          </button>
        </div>
      </form>
    </Modal>
  );
}
