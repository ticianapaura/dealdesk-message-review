import { useReducer, useState } from "react";
import { PrototypeBar } from "../components/PrototypeBar";
import { Shell } from "../components/Shell";
import { reducer } from "../domain/reducer";
import { Hub } from "../features/Hub";
import { SentView } from "../features/SentView";
import { Workspace } from "../features/Workspace";
import type { Scenario } from "../scenarios";

/** One scenario: its own state, created from the fixture and replaced on Reset. */
export function ScenarioPage({ scenario }: { scenario: Scenario }) {
  const [state, dispatch] = useReducer(reducer, undefined, scenario.create);
  const [view, setView] = useState<"workspace" | "hub">("workspace");
  // Changing the key remounts the workspace, clearing open modals and local UI state on Reset.
  const [resetCount, setResetCount] = useState(0);

  function reset() {
    dispatch({ type: "RESET", state: scenario.create() });
    setView("workspace");
    setResetCount((n) => n + 1);
  }

  return (
    <div className="proto-frame">
      <PrototypeBar
        scenarioTitle={scenario.title}
        canDecide={state.exception?.status === "pending" && !state.sent}
        onReset={reset}
        onDecide={(decision) => dispatch({ type: "DECIDE_EXCEPTION", decision })}
      />
      <Shell pendingTasks={state.sent ? 0 : 1} onDrafts={() => setView("hub")}>
        {view === "hub" ? (
          <Hub state={state} onOpen={() => setView("workspace")} />
        ) : state.sent ? (
          <SentView key={resetCount} state={state} onBack={() => setView("hub")} />
        ) : (
          <Workspace key={resetCount} state={state} dispatch={dispatch} onBack={() => setView("hub")} />
        )}
      </Shell>
    </div>
  );
}
