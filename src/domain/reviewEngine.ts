import type { Draft, ExceptionRequest, Issue } from "./types";

/**
 * Deterministic mock review engine.
 *
 * This is a stand-in for a real review service. It applies two fixed rules and
 * nothing else. It does not validate anything against a backend, and it makes
 * no claim about detection accuracy.
 *
 * Rule 1: a recipient who is not on the project team is a blocking issue,
 *         unless an approved exception covers that recipient.
 * Rule 2: a sentence that contains "guarantee", "guarantees" or "guaranteed"
 *         is a blocking issue (unconfirmed commitment wording).
 *
 * The same input always produces the same result.
 */

const COMMITMENT_PATTERN = /\bguarantee(d|s)?\b/i;

export interface EngineResult {
  issues: Issue[];
  /** Recipient ids that an approved exception covered in this check. */
  coveredByException: string[];
}

export function isCoveredByApproval(recipientId: string, exception: ExceptionRequest | null): boolean {
  return exception !== null && exception.status === "approved" && exception.recipientId === recipientId;
}

export function runReview(draft: Draft, exception: ExceptionRequest | null): EngineResult {
  const issues: Issue[] = [];
  const coveredByException: string[] = [];

  for (const recipient of draft.recipients) {
    if (recipient.onProjectTeam) continue;
    if (isCoveredByApproval(recipient.id, exception)) {
      coveredByException.push(recipient.id);
      continue;
    }
    issues.push({ id: `recipient:${recipient.id}`, kind: "recipient", targetId: recipient.id });
  }

  for (const sentence of draft.sentences) {
    if (COMMITMENT_PATTERN.test(sentence.text)) {
      issues.push({ id: `wording:${sentence.id}`, kind: "wording", targetId: sentence.id, snapshot: sentence.text });
    }
  }

  return { issues, coveredByException };
}
