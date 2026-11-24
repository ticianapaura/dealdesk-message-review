import { Link } from "../router";

/**
 * Prototype-only controls. This bar is deliberately outside the DealDesk product UI:
 * nothing in it is a product feature. It names the scenario, resets it, and stands in
 * for the Deal Owner, who has no screens in this prototype.
 */
export function PrototypeBar({
  scenarioTitle,
  canDecide,
  onReset,
  onDecide,
}: {
  scenarioTitle: string;
  canDecide: boolean;
  onReset: () => void;
  onDecide: (decision: "approved" | "rejected") => void;
}) {
  return (
    <aside className="proto-bar" aria-label="Prototype controls">
      <span className="proto-label">Prototype controls · simulated data</span>
      <span className="proto-scenario">
        Scenario: <b>{scenarioTitle}</b>
      </span>
      <span className="proto-actions">
        {canDecide && (
          <span className="proto-group" role="group" aria-label="Simulate Deal Owner decision">
            <span className="proto-hint">Simulate Deal Owner:</span>
            <button type="button" className="proto-btn" onClick={() => onDecide("approved")}>
              Approve exception
            </button>
            <button type="button" className="proto-btn" onClick={() => onDecide("rejected")}>
              Reject exception
            </button>
          </span>
        )}
        <button type="button" className="proto-btn" onClick={onReset}>
          Reset scenario
        </button>
        <Link to="/prototype" className="proto-link">
          All scenarios
        </Link>
        <Link to="/process" className="proto-link">
          Process Journey
        </Link>
      </span>
    </aside>
  );
}
