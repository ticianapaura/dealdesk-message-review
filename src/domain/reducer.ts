import { runReview } from "./reviewEngine";
import { activeIssues, canRecheck, canSend, formatTime, recipientNames } from "./selectors";
import type { Action, HistoryEvent, ScenarioState, Toast } from "./types";

/** Minutes the simulated clock advances for each recorded event. */
const CLOCK_STEP = 3;

export const REJECTION_FEEDBACK = "Send client updates to the assigned project team only.";

function record(state: ScenarioState, text: string): Pick<ScenarioState, "history" | "clock"> {
  const clock = state.clock + CLOCK_STEP;
  const event: HistoryEvent = { time: formatTime(clock), text };
  return { history: [...state.history, event], clock };
}

function toast(state: ScenarioState, text: string, undo: boolean): Pick<ScenarioState, "toast" | "toastSeq"> {
  const next: Toast = { id: state.toastSeq + 1, text, undo };
  return { toast: next, toastSeq: state.toastSeq + 1 };
}

function sentSummary(state: ScenarioState): string {
  const ex = state.exception;
  const approved =
    ex !== null && ex.status === "approved" && state.draft.recipients.some((r) => r.id === ex.recipientId) ? 1 : 0;
  const corrected = Math.max(0, state.everIssueIds.length - approved);
  const correctedText = `${corrected} ${corrected === 1 ? "issue" : "issues"} resolved by correction`;
  const exceptionText = approved ? "1 exception approved by Deal Owner" : "No exceptions";
  return `${correctedText} · ${exceptionText}`;
}

export function reducer(state: ScenarioState, action: Action): ScenarioState {
  if (action.type === "RESET") return action.state;
  // A sent message is final and read-only.
  if (state.sent) return action.type === "DISMISS_TOAST" ? { ...state, toast: null, undo: null } : state;

  switch (action.type) {
    case "REMOVE_RECIPIENT": {
      const recipient = state.draft.recipients.find((r) => r.id === action.recipientId);
      if (!recipient || state.checking) return state;
      const ex = state.exception;
      const hadPending = ex !== null && ex.recipientId === recipient.id && ex.status === "pending";
      const base = {
        ...state,
        undo: { recipients: state.draft.recipients, exception: state.exception, restoredName: recipient.name },
        draft: {
          ...state.draft,
          recipients: state.draft.recipients.filter((r) => r.id !== recipient.id),
          version: state.draft.version + 1,
        },
        // A pending request for a removed recipient no longer applies.
        exception: hadPending && ex ? { ...ex, status: "withdrawn" as const } : state.exception,
      };
      const note = hadPending ? `${recipient.name} removed. The pending exception request no longer applies.` : `${recipient.name} removed.`;
      return { ...base, ...record(base, note), ...toast(base, `You removed ${recipient.name}`, true) };
    }

    case "UNDO_REMOVE": {
      if (!state.undo || state.checking) return state;
      const base = {
        ...state,
        // Undo restores the recipient list. It is still an edit, so the review stays outdated.
        draft: { ...state.draft, recipients: state.undo.recipients, version: state.draft.version + 1 },
        exception: state.undo.exception,
        undo: null,
        toast: null,
      };
      return { ...base, ...record(base, `Removal undone. ${state.undo.restoredName} restored.`) };
    }

    case "DISMISS_TOAST":
      return { ...state, toast: null, undo: null };

    case "REVISE_SENTENCE": {
      const text = action.text.trim();
      const sentence = state.draft.sentences.find((s) => s.id === action.sentenceId);
      if (!sentence || text === "" || text === sentence.text || state.checking) return state;
      const base = {
        ...state,
        toast: null,
        undo: null,
        draft: {
          ...state.draft,
          sentences: state.draft.sentences.map((s) => (s.id === sentence.id ? { ...s, text } : s)),
          version: state.draft.version + 1,
        },
      };
      return { ...base, ...record(base, `Sentence revised: “${sentence.text}” changed to “${text}”`) };
    }

    case "REQUEST_EXCEPTION": {
      const reason = action.reason.trim();
      const recipient = state.draft.recipients.find((r) => r.id === action.recipientId);
      if (!recipient || recipient.onProjectTeam || reason === "") return state;
      if (state.exception && state.exception.recipientId === recipient.id && state.exception.status === "pending") return state;
      const recorded = record(state, `Exception requested for ${recipient.name}.`);
      return {
        ...state,
        ...recorded,
        toast: null,
        undo: null,
        exception: { recipientId: recipient.id, status: "pending", reason, requestedAt: formatTime(recorded.clock) },
      };
    }

    case "WITHDRAW_EXCEPTION": {
      const ex = state.exception;
      if (!ex || ex.status !== "pending") return state;
      const base = { ...state, exception: { ...ex, status: "withdrawn" as const }, undo: null };
      return { ...base, ...record(base, "Exception request withdrawn."), ...toast(base, "You withdrew the exception request", false) };
    }

    case "DECIDE_EXCEPTION": {
      // Simulated Deal Owner decision. Only a pending request can be decided.
      const ex = state.exception;
      if (!ex || ex.status !== "pending") return state;
      const name = state.draft.recipients.find((r) => r.id === ex.recipientId)?.name ?? "the recipient";
      const text = action.decision === "approved" ? `Deal Owner approved the exception for ${name}.` : `Deal Owner rejected the exception for ${name}.`;
      const recorded = record(state, text);
      return {
        ...state,
        ...recorded,
        exception: {
          ...ex,
          status: action.decision,
          decidedAt: formatTime(recorded.clock),
          feedback: action.decision === "rejected" ? REJECTION_FEEDBACK : undefined,
        },
      };
    }

    case "CHECK_STARTED":
      return canRecheck(state) ? { ...state, checking: true, toast: null, undo: null } : state;

    case "CHECK_FINISHED": {
      if (!state.checking) return state;
      if (state.failChecksRemaining > 0) {
        const base = {
          ...state,
          checking: false,
          failChecksRemaining: state.failChecksRemaining - 1,
          review: { ...state.review, outcome: "unavailable" as const },
        };
        return { ...base, ...record(base, "Check could not be completed.") };
      }
      const result = runReview(state.draft, state.exception);
      const outcome = result.issues.length > 0 ? ("blocked" as const) : ("ready" as const);
      const base = {
        ...state,
        checking: false,
        review: { reviewedVersion: state.draft.version, outcome, issues: result.issues, coveredByException: result.coveredByException },
        everIssueIds: Array.from(new Set([...state.everIssueIds, ...result.issues.map((i) => i.id)])),
      };
      const count = activeIssues(base).length;
      const text =
        outcome === "ready"
          ? `Version ${state.draft.version} checked. Ready to send.`
          : `Version ${state.draft.version} checked. Blocked: ${count} ${count === 1 ? "issue" : "issues"}.`;
      return { ...base, ...record(base, text) };
    }

    case "SEND": {
      // Simulated sending. Refused unless the current version has passed a check.
      if (!canSend(state)) return state;
      const recorded = record(state, `Sent to ${recipientNames(state)}.`);
      return {
        ...state,
        ...recorded,
        toast: null,
        undo: null,
        sent: {
          time: formatTime(recorded.clock),
          version: state.draft.version,
          recipients: state.draft.recipients,
          subject: state.draft.subject,
          sentences: state.draft.sentences,
          summary: sentSummary(state),
        },
      };
    }

    default:
      return state;
  }
}
