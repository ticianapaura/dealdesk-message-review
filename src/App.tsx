import { Home } from "./pages/Home";
import { Process } from "./pages/process/Process";
import { ScenarioPage } from "./pages/ScenarioPage";
import { ScenarioPicker } from "./pages/ScenarioPicker";
import { usePath } from "./router";
import { findScenario } from "./scenarios";

export function App() {
  const path = usePath().replace(/\/+$/, "") || "/";
  if (path === "/") return <Home />;
  if (path === "/prototype") return <ScenarioPicker />;
  if (path === "/process") return <Process />;
  const match = path.match(/^\/prototype\/([\w-]+)$/);
  const scenario = match ? findScenario(match[1]) : undefined;
  // Keyed by scenario so switching scenarios always starts from that scenario's fixture.
  if (scenario) return <ScenarioPage key={scenario.id} scenario={scenario} />;
  return <ScenarioPicker notFound />;
}
