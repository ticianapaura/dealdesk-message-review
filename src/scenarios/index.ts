import { runReview } from "../domain/reviewEngine";
import type { Draft, Recipient, ScenarioState, Sentence } from "../domain/types";

/**
 * Scenario fixtures.
 *
 * Each scenario is a function that returns a fresh initial state, so "Reset scenario"
 * always reproduces exactly the same starting point. All names, times and message
 * text are invented for the Project Harbor example.
 */

export interface Scenario {
  id: string;
  title: string;
  path: string;
  /** One-line journey shown on the scenario picker. */
  journey: string;
  description: string;
  create: () => ScenarioState;
}

const PAT: Recipient = { id: "pat", name: "Pat Morgan", initials: "PM", role: "Advisor", onProjectTeam: true };
const ALEX: Recipient = { id: "alex", name: "Alex Rivera", initials: "AR", role: "Client representative", onProjectTeam: true };
const SAM: Recipient = { id: "sam", name: "Sam Lee", initials: "SL", role: "Client contact", onProjectTeam: false, relation: "same client company" };

export const COMMITMENT_SENTENCE_ID = "s3";
export const ORIGINAL_COMMITMENT = "Completion is guaranteed by 30 June.";
export const REVISED_COMMITMENT = "We are currently targeting completion by 30 June.";

function sentences(commitment: string): Sentence[] {
  return [
    { id: "s1", text: "Hello all," },
    { id: "s2", text: "Following this week's review, here is where Project Harbor stands." },
    { id: COMMITMENT_SENTENCE_ID, text: commitment },
    { id: "s4", text: "We will share the updated timeline document before Thursday's call." },
    { id: "s5", text: "Kind regards" },
  ];
}

function harborDraft(recipients: Recipient[], commitment: string, version: number): Draft {
  return {
    project: "Project Harbor",
    title: "Completion timeline update",
    subject: "Project Harbor: completion timeline update",
    recipients,
    sentences: sentences(commitment),
    version,
  };
}

/** Version 1 with both known issues, already checked. The starting point of scenarios 1 and 2. */
function blockedStart(scenarioId: string): ScenarioState {
  const draft = harborDraft([PAT, ALEX, SAM], ORIGINAL_COMMITMENT, 1);
  const result = runReview(draft, null);
  return {
    scenarioId,
    draft,
    review: { reviewedVersion: 1, outcome: "blocked", issues: result.issues, coveredByException: [] },
    exception: null,
    history: [{ time: "10:42", text: "Version 1 checked. Blocked: Sam Lee not on project team; unconfirmed commitment wording." }],
    sent: null,
    toast: null,
    undo: null,
    checking: false,
    failChecksRemaining: 0,
    clock: 10 * 60 + 42,
    everIssueIds: result.issues.map((i) => i.id),
    toastSeq: 0,
  };
}

export const scenarios: Scenario[] = [
  {
    id: "main-flow",
    title: "Main flow",
    path: "/prototype/main-flow",
    journey: "Blocked → Correct issues → Review outdated → Recheck → Ready to send → Sent",
    description: "Starts with a completed review that found two blocking issues. Remove Sam Lee, revise the wording, recheck and send.",
    create: () => blockedStart("main-flow"),
  },
  {
    id: "exception",
    title: "Exception management",
    path: "/prototype/exception",
    journey: "Request exception → Pending approval → Approved / Rejected / Withdrawn",
    description:
      "Same starting point. Request an exception for Sam Lee, then use the prototype bar to simulate the Deal Owner's decision, or withdraw the request.",
    create: () => blockedStart("exception"),
  },
  {
    id: "review-unavailable",
    title: "Review unavailable",
    path: "/prototype/review-unavailable",
    journey: "Failed review → Retry → Recovery",
    description: "Starts after both corrections, with the review outdated. The first Recheck fails; Retry check succeeds.",
    create: () => {
      const first = runReview(harborDraft([PAT, ALEX, SAM], ORIGINAL_COMMITMENT, 1), null);
      return {
        scenarioId: "review-unavailable",
        draft: harborDraft([PAT, ALEX], REVISED_COMMITMENT, 3),
        review: { reviewedVersion: 1, outcome: "blocked", issues: first.issues, coveredByException: [] },
        exception: null,
        history: [
          { time: "10:42", text: "Version 1 checked. Blocked: Sam Lee not on project team; unconfirmed commitment wording." },
          { time: "10:45", text: "Sam Lee removed." },
          { time: "10:48", text: `Sentence revised: “${ORIGINAL_COMMITMENT}” changed to “${REVISED_COMMITMENT}”` },
        ],
        sent: null,
        toast: null,
        undo: null,
        checking: false,
        // The mock engine fails exactly one check in this scenario.
        failChecksRemaining: 1,
        clock: 10 * 60 + 48,
        everIssueIds: first.issues.map((i) => i.id),
        toastSeq: 0,
      };
    },
  },
];

export function findScenario(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}
