/** Typed state model for the DealDesk Message Review prototype. All data is simulated. */

export interface Recipient {
  id: string;
  name: string;
  initials: string;
  /** Role shown under the name, e.g. "Advisor". */
  role: string;
  /** True when the person is assigned to the active project team. */
  onProjectTeam: boolean;
  /** Short note shown for people outside the team, e.g. "same client company". */
  relation?: string;
}

export interface Sentence {
  id: string;
  text: string;
}

export interface Draft {
  project: string;
  title: string;
  subject: string;
  recipients: Recipient[];
  sentences: Sentence[];
  /** Incremented by every edit to recipients or text. */
  version: number;
}

export type IssueKind = "recipient" | "wording";

export interface Issue {
  /** Stable id, e.g. "recipient:sam" or "wording:s3". */
  id: string;
  kind: IssueKind;
  /** Recipient id or sentence id the issue is attached to. */
  targetId: string;
  /** Text of the sentence when it was checked (wording issues only). */
  snapshot?: string;
}

export type ReviewOutcome = "blocked" | "ready" | "unavailable";

export interface Review {
  /** Draft version the last completed check looked at. */
  reviewedVersion: number;
  outcome: ReviewOutcome;
  issues: Issue[];
  /** Recipient ids that an approved exception covered when the check ran. */
  coveredByException: string[];
}

export type ExceptionStatus = "pending" | "approved" | "rejected" | "withdrawn";

export interface ExceptionRequest {
  recipientId: string;
  status: ExceptionStatus;
  reason: string;
  requestedAt: string;
  decidedAt?: string;
  /** Deal Owner feedback shown on a rejection. */
  feedback?: string;
}

export interface HistoryEvent {
  time: string;
  text: string;
}

export interface SentRecord {
  time: string;
  version: number;
  recipients: Recipient[];
  subject: string;
  sentences: Sentence[];
  summary: string;
}

export interface Toast {
  id: number;
  text: string;
  /** When true the toast offers Undo for the last removal. */
  undo: boolean;
}

export interface UndoSnapshot {
  recipients: Recipient[];
  exception: ExceptionRequest | null;
  restoredName: string;
}

export interface ScenarioState {
  scenarioId: string;
  draft: Draft;
  review: Review;
  exception: ExceptionRequest | null;
  history: HistoryEvent[];
  sent: SentRecord | null;
  toast: Toast | null;
  undo: UndoSnapshot | null;
  /** True while the simulated check is running. */
  checking: boolean;
  /** Number of upcoming checks the mock engine will fail. Set by the scenario fixture. */
  failChecksRemaining: number;
  /** Simulated clock, minutes since midnight. Advances with each recorded event. */
  clock: number;
  /** Issue ids found by any completed check, used for the sent summary. */
  everIssueIds: string[];
  toastSeq: number;
}

export type GlobalStatus = "checking" | "blocked" | "outdated" | "unavailable" | "ready" | "sent";

export type Action =
  | { type: "REMOVE_RECIPIENT"; recipientId: string }
  | { type: "UNDO_REMOVE" }
  | { type: "DISMISS_TOAST" }
  | { type: "REVISE_SENTENCE"; sentenceId: string; text: string }
  | { type: "REQUEST_EXCEPTION"; recipientId: string; reason: string }
  | { type: "WITHDRAW_EXCEPTION" }
  | { type: "DECIDE_EXCEPTION"; decision: "approved" | "rejected" }
  | { type: "CHECK_STARTED" }
  | { type: "CHECK_FINISHED" }
  | { type: "SEND" }
  | { type: "RESET"; state: ScenarioState };
