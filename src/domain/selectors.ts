import { isCoveredByApproval } from "./reviewEngine";
import type { GlobalStatus, Issue, ScenarioState } from "./types";

/**
 * Issues from the last completed check that still apply to the draft as it is now:
 * the recipient is still in the list and has no approved exception, or the sentence
 * still has the text that was checked. A corrected item drops out of the workspace
 * immediately; whether the correction is enough is decided by the next check.
 */
export function activeIssues(state: ScenarioState): Issue[] {
  return state.review.issues.filter((issue) => {
    if (issue.kind === "recipient") {
      const present = state.draft.recipients.some((r) => r.id === issue.targetId);
      return present && !isCoveredByApproval(issue.targetId, state.exception);
    }
    const sentence = state.draft.sentences.find((s) => s.id === issue.targetId);
    return sentence !== undefined && sentence.text === issue.snapshot;
  });
}

/** True when an exception was approved after the last check, so the check has not evaluated it yet. */
function approvalNotYetReviewed(state: ScenarioState): boolean {
  const ex = state.exception;
  if (!ex || ex.status !== "approved") return false;
  const present = state.draft.recipients.some((r) => r.id === ex.recipientId);
  return present && !state.review.coveredByException.includes(ex.recipientId);
}

export function globalStatus(state: ScenarioState): GlobalStatus {
  if (state.sent) return "sent";
  if (state.checking) return "checking";
  if (state.review.outcome === "unavailable") return "unavailable";
  if (state.draft.version !== state.review.reviewedVersion) return "outdated";
  if (activeIssues(state).length > 0) return "blocked";
  if (approvalNotYetReviewed(state)) return "outdated";
  return "ready";
}

/** Send is enabled only for a current, passed review with at least one recipient. */
export function canSend(state: ScenarioState): boolean {
  return globalStatus(state) === "ready" && state.draft.recipients.length > 0;
}

export function canRecheck(state: ScenarioState): boolean {
  const status = globalStatus(state);
  return (status === "outdated" || status === "unavailable") && state.draft.recipients.length > 0;
}

export function pendingExceptionFor(state: ScenarioState, recipientId: string): boolean {
  return state.exception !== null && state.exception.status === "pending" && state.exception.recipientId === recipientId;
}

export function blockedSummary(state: ScenarioState): string {
  const issues = activeIssues(state);
  const pending = issues.filter((i) => i.kind === "recipient" && pendingExceptionFor(state, i.targetId)).length;
  if (pending > 0) {
    const open = issues.length - pending;
    const parts = [`${pending} pending approval`];
    if (open > 0) parts.push(`${open} open ${open === 1 ? "issue" : "issues"}`);
    return parts.join(" · ");
  }
  return `${issues.length} ${issues.length === 1 ? "issue" : "issues"} to resolve.`;
}

export function recipientNames(state: ScenarioState): string {
  const names = state.draft.recipients.map((r) => r.name);
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
