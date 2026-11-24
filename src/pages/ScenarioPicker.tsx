import { LogoMark } from "../components/ui";
import { Link } from "../router";
import { scenarios } from "../scenarios";

/** Prototype entry point: three independent journeys, each starting from a fixed state. */
export function ScenarioPicker({ notFound = false }: { notFound?: boolean }) {
  return (
    <div className="page">
      <header className="page-head">
        <Link to="/" className="page-brand">
          <LogoMark />
          DealDesk
        </Link>
        <nav className="page-nav" aria-label="Site">
          <Link to="/">Home</Link>
          <Link to="/process">Process Journey</Link>
        </nav>
      </header>
      <main className="page-main">
        {notFound && <p className="page-note">That page does not exist. Choose a scenario below.</p>}
        <p className="page-kicker">Interactive prototype · simulated data</p>
        <h1>Choose a scenario</h1>
        <p className="page-lede">
          Each scenario opens the Message Review Workspace for Project Harbor in a fixed starting state. Reset scenario, in the bar at the top, returns to that state at any time.
        </p>
        <ol className="scenario-list">
          {scenarios.map((scenario, index) => (
            <li key={scenario.id}>
              <Link to={scenario.path} className="scenario-card">
                <span className="scenario-n">{index + 1}</span>
                <span className="scenario-body">
                  <span className="scenario-title">{scenario.title}</span>
                  <span className="scenario-journey">{scenario.journey}</span>
                  <span className="scenario-desc">{scenario.description}</span>
                </span>
                <span className="scenario-go">Open scenario</span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="page-note">
          Reviews run on a mock engine with fixed rules, the Deal Owner's decision is simulated from the prototype bar, and sending does not deliver anything. There is no backend.
        </p>
      </main>
    </div>
  );
}
