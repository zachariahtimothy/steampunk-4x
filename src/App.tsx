import { useMemo, useState } from 'react'
import { createInitialState, endTurn, type GameState } from './sim'
import { HexMap } from './view/pixi/HexMap'
import './App.css'

export default function App() {
  const [state, setState] = useState<GameState>(() => createInitialState())
  const nodeSummary = useMemo(
    () =>
      state.nodes
        .map((n) => `${n.resource}: ${n.remaining}`)
        .join(' · '),
    [state.nodes],
  )

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <div className="title">Soot Empire</div>
          <div className="subtitle">Sandbox v1 — scaffold</div>
        </div>
        <div className="turn-block">
          <span className="turn-label">Turn {state.turn}</span>
          <button type="button" onClick={() => setState((s) => endTurn(s))}>
            End turn
          </button>
        </div>
      </header>

      <main className="main-grid">
        <section className="map-panel" aria-label="Strategy map">
          <HexMap state={state} />
        </section>
        <aside className="side-panel">
          <h2>Situation</h2>
          <p className="muted">
            Pure sim owns turn + nodes. Pixi draws the board. React owns chrome.
          </p>
          <dl>
            <div>
              <dt>Map radius</dt>
              <dd>{state.mapRadius}</dd>
            </div>
            <div>
              <dt>Deposits</dt>
              <dd>{nodeSummary}</dd>
            </div>
          </dl>
          <h2>Next</h2>
          <ol className="next-list">
            <li>Routes + early refine + factory</li>
            <li>Shortage Doctor</li>
            <li>Invent Mark → field → supply fight</li>
          </ol>
        </aside>
      </main>
    </div>
  )
}
