/**
 * Rule checks for the state model and mock review engine.
 * Run with: npm run verify
 * These exercise the reducer directly. They do not test the rendered UI.
 */
import assert from "node:assert/strict";
import { reducer } from "../src/domain/reducer";
import { activeIssues, canSend, globalStatus } from "../src/domain/selectors";
import type { Action, ScenarioState } from "../src/domain/types";
import { COMMITMENT_SENTENCE_ID, REVISED_COMMITMENT, findScenario } from "../src/scenarios";

function start(id: string): ScenarioState {
  const scenario = findScenario(id);
  assert.ok(scenario, `scenario ${id} exists`);
  return scenario.create();
}
function run(state: ScenarioState, ...actions: Action[]): ScenarioState {
  return actions.reduce(reducer, state);
}
const recheck: Action[] = [{ type: "CHECK_STARTED" }, { type: "CHECK_FINISHED" }];
const revise: Action = { type: "REVISE_SENTENCE", sentenceId: COMMITMENT_SENTENCE_ID, text: REVISED_COMMITMENT };

const checks: Array<[string, () => void]> = [
  ["Main flow starts Blocked with two issues and Send disabled", () => {
    const s = start("main-flow");
    assert.equal(globalStatus(s), "blocked");
    assert.equal(activeIssues(s).length, 2);
    assert.equal(canSend(s), false);
  }],
  ["Fixtures are reproducible: two fresh states are identical", () => {
    assert.deepEqual(start("main-flow"), start("main-flow"));
    assert.deepEqual(start("review-unavailable"), start("review-unavailable"));
  }],
  ["Removing Sam Lee makes the review outdated and keeps Send disabled", () => {
    const s = run(start("main-flow"), { type: "REMOVE_RECIPIENT", recipientId: "sam" });
    assert.equal(globalStatus(s), "outdated");
    assert.equal(s.draft.recipients.some((r) => r.id === "sam"), false);
    assert.equal(canSend(s), false);
    assert.equal(s.toast?.undo, true);
  }],
  ["Undo restores the recipient but the review stays outdated", () => {
    const s = run(start("main-flow"), { type: "REMOVE_RECIPIENT", recipientId: "sam" }, { type: "UNDO_REMOVE" });
    assert.equal(s.draft.recipients.some((r) => r.id === "sam"), true);
    assert.equal(globalStatus(s), "outdated");
    assert.equal(canSend(s), false);
  }],
  ["Revising the wording makes the review outdated; nothing is resolved before a recheck", () => {
    const s = run(start("main-flow"), revise);
    assert.equal(globalStatus(s), "outdated");
    assert.equal(canSend(s), false);
  }],
  ["An empty or unchanged revision is ignored", () => {
    const base = start("main-flow");
    assert.equal(run(base, { type: "REVISE_SENTENCE", sentenceId: COMMITMENT_SENTENCE_ID, text: "   " }), base);
    assert.equal(run(base, { type: "REVISE_SENTENCE", sentenceId: COMMITMENT_SENTENCE_ID, text: base.draft.sentences[2].text }), base);
  }],
  ["Both corrections plus Recheck give Ready to send; Send then records the exact recipients", () => {
    let s = run(start("main-flow"), { type: "REMOVE_RECIPIENT", recipientId: "sam" }, revise, ...recheck);
    assert.equal(globalStatus(s), "ready");
    assert.equal(canSend(s), true);
    s = run(s, { type: "SEND" });
    assert.equal(globalStatus(s), "sent");
    assert.deepEqual(s.sent?.recipients.map((r) => r.name), ["Pat Morgan", "Alex Rivera"]);
    assert.equal(s.sent?.summary, "2 issues resolved by correction · No exceptions");
  }],
  ["One correction plus Recheck stays Blocked with one issue", () => {
    const s = run(start("main-flow"), { type: "REMOVE_RECIPIENT", recipientId: "sam" }, ...recheck);
    assert.equal(globalStatus(s), "blocked");
    assert.equal(activeIssues(s).length, 1);
  }],
  ["A revision that still says 'guaranteed' is blocked again after Recheck", () => {
    const s = run(
      start("main-flow"),
      { type: "REMOVE_RECIPIENT", recipientId: "sam" },
      { type: "REVISE_SENTENCE", sentenceId: COMMITMENT_SENTENCE_ID, text: "Completion by 30 June is guaranteed." },
      ...recheck,
    );
    assert.equal(globalStatus(s), "blocked");
  }],
  ["Send is refused in every non-ready state", () => {
    const blocked = start("main-flow");
    assert.equal(run(blocked, { type: "SEND" }), blocked);
    const outdated = run(blocked, revise);
    assert.equal(run(outdated, { type: "SEND" }), outdated);
  }],
  ["Editing after Ready returns to outdated", () => {
    const s = run(start("main-flow"), { type: "REMOVE_RECIPIENT", recipientId: "sam" }, revise, ...recheck, { type: "REMOVE_RECIPIENT", recipientId: "alex" });
    assert.equal(globalStatus(s), "outdated");
    assert.equal(canSend(s), false);
  }],
  ["A request needs a reason; pending approval keeps the draft Blocked", () => {
    const base = start("exception");
    assert.equal(run(base, { type: "REQUEST_EXCEPTION", recipientId: "sam", reason: "  " }), base);
    const s = run(base, { type: "REQUEST_EXCEPTION", recipientId: "sam", reason: "Needs the update." });
    assert.equal(s.exception?.status, "pending");
    assert.equal(globalStatus(s), "blocked");
    assert.equal(canSend(s), false);
  }],
  ["A decision is only possible on a pending request", () => {
    const base = start("exception");
    assert.equal(run(base, { type: "DECIDE_EXCEPTION", decision: "approved" }), base);
  }],
  ["Approval covers Sam Lee only: the wording issue still blocks", () => {
    const s = run(start("exception"), { type: "REQUEST_EXCEPTION", recipientId: "sam", reason: "Needs the update." }, { type: "DECIDE_EXCEPTION", decision: "approved" });
    assert.equal(globalStatus(s), "blocked");
    assert.deepEqual(activeIssues(s).map((i) => i.kind), ["wording"]);
    assert.equal(canSend(s), false);
  }],
  ["After approval, revising the wording keeps the approval and requires a Recheck before sending", () => {
    let s = run(start("exception"), { type: "REQUEST_EXCEPTION", recipientId: "sam", reason: "Needs the update." }, { type: "DECIDE_EXCEPTION", decision: "approved" }, revise);
    assert.equal(s.exception?.status, "approved");
    assert.equal(globalStatus(s), "outdated");
    s = run(s, ...recheck);
    assert.equal(globalStatus(s), "ready");
    s = run(s, { type: "SEND" });
    assert.equal(s.sent?.recipients.length, 3);
    assert.equal(s.sent?.summary, "1 issue resolved by correction · 1 exception approved by Deal Owner");
  }],
  ["An approval given after the last check still requires a Recheck", () => {
    // Wording fixed and rechecked first, so Sam Lee is the only issue; then the exception is approved.
    const s = run(start("exception"), revise, ...recheck, { type: "REQUEST_EXCEPTION", recipientId: "sam", reason: "Needs the update." }, { type: "DECIDE_EXCEPTION", decision: "approved" });
    assert.equal(globalStatus(s), "outdated");
    assert.equal(canSend(s), false);
  }],
  ["Rejection keeps Sam Lee blocking; removing him then requires a Recheck", () => {
    let s = run(start("exception"), { type: "REQUEST_EXCEPTION", recipientId: "sam", reason: "Needs the update." }, { type: "DECIDE_EXCEPTION", decision: "rejected" });
    assert.equal(s.exception?.status, "rejected");
    assert.equal(activeIssues(s).length, 2);
    s = run(s, { type: "REMOVE_RECIPIENT", recipientId: "sam" });
    assert.equal(globalStatus(s), "outdated");
  }],
  ["Withdrawal returns Sam Lee to blocking and keeps him in the list", () => {
    const s = run(start("exception"), { type: "REQUEST_EXCEPTION", recipientId: "sam", reason: "Needs the update." }, { type: "WITHDRAW_EXCEPTION" });
    assert.equal(s.exception?.status, "withdrawn");
    assert.equal(s.draft.recipients.some((r) => r.id === "sam"), true);
    assert.equal(globalStatus(s), "blocked");
    assert.equal(activeIssues(s).length, 2);
  }],
  ["Review unavailable: first Recheck fails, Send stays disabled, Retry recovers", () => {
    let s = start("review-unavailable");
    assert.equal(globalStatus(s), "outdated");
    s = run(s, ...recheck);
    assert.equal(globalStatus(s), "unavailable");
    assert.equal(canSend(s), false);
    s = run(s, ...recheck);
    assert.equal(globalStatus(s), "ready");
    assert.equal(canSend(s), true);
  }],
  ["A sent message is read-only", () => {
    const sent = run(start("main-flow"), { type: "REMOVE_RECIPIENT", recipientId: "sam" }, revise, ...recheck, { type: "SEND" });
    assert.equal(run(sent, { type: "REMOVE_RECIPIENT", recipientId: "pat" }), sent);
    assert.equal(run(sent, revise), sent);
  }],
];

let failed = 0;
for (const [name, check] of checks) {
  try {
    check();
    console.log(`pass  ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL  ${name}`);
    console.log(`      ${(error as Error).message.split("\n")[0]}`);
  }
}
console.log(`\n${checks.length - failed} of ${checks.length} rule checks passed.`);
process.exit(failed === 0 ? 0 : 1);
