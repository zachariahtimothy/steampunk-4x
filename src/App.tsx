import { useMemo, useState } from 'react'
import {
  addRoute,
  createInitialState,
  endTurn,
  FACTORY_RECIPES,
  fixClassLabel,
  hubStock,
  removeRoute,
  spendAtFactory,
  type GameState,
  type GoodId,
} from './sim'
import { HexMap } from './view/pixi/HexMap'
import './App.css'

const GOOD_LABELS: Record<GoodId, string> = {
  coal: 'Coal',
  ore: 'Ore',
  timber: 'Timber',
  food: 'Food',
  coke: 'Coke',
  plates: 'Plates',
  beams: 'Beams',
}

const EXTRACTOR_ROUTES: { siteId: string; label: string }[] = [
  { siteId: 'ex-coal', label: 'Coal pit → Hub' },
  { siteId: 'ex-ore', label: 'Ore dig → Hub' },
  { siteId: 'ex-timber', label: 'Timber camp → Hub' },
  { siteId: 'ex-food', label: 'Food camp → Hub' },
]

function formatStock(stock: Partial<Record<GoodId, number>>): string {
  const parts = (Object.keys(GOOD_LABELS) as GoodId[])
    .map((g) => {
      const n = stock[g] ?? 0
      return n > 0 ? `${GOOD_LABELS[g]} ${n}` : null
    })
    .filter(Boolean)
  return parts.length ? parts.join(' · ') : 'Empty'
}

export default function App() {
  const [state, setState] = useState<GameState>(() => createInitialState())
  const [flash, setFlash] = useState<string | null>(null)

  const hub = useMemo(() => hubStock(state), [state])
  const recipe = FACTORY_RECIPES[0]!
  const refineLine = useMemo(() => {
    const o = state.lastRefineOutput
    const parts = (['coke', 'plates', 'beams'] as const)
      .map((g) => ((o[g] ?? 0) > 0 ? `${GOOD_LABELS[g]} +${o[g]}` : null))
      .filter(Boolean)
    return parts.length ? parts.join(' · ') : 'None this tick'
  }, [state.lastRefineOutput])

  function apply(
    result: { ok: true; state: GameState } | { ok: false; error: string },
  ) {
    if (result.ok) {
      setState(result.state)
      setFlash(null)
    } else {
      setFlash(result.error)
    }
  }

  function toggleRoute(fromSiteId: string) {
    const existing = state.routes.find(
      (r) => r.fromSiteId === fromSiteId && r.toSiteId === 'hub',
    )
    if (existing) {
      apply(removeRoute(state, existing.id))
    } else {
      apply(addRoute(state, fromSiteId, 'hub', { tier: 'road' }))
    }
  }

  function onFactory() {
    apply(spendAtFactory(state, recipe.id))
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <div className="title">Soot Empire</div>
          <div className="subtitle">Sandbox v1 — logistics + Shortage Doctor</div>
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
          <h2>Shortage Doctor</h2>
          {state.shortageAlerts.length === 0 ? (
            <p className="muted">No logistics alarms. Chains look fed.</p>
          ) : (
            <ul className="doctor-list">
              {state.shortageAlerts.map((a) => (
                <li key={a.id} className={`doctor-alert ${a.severity}`}>
                  <div className="doctor-title">{a.title}</div>
                  <div className="doctor-detail">{a.detail}</div>
                  <div className="doctor-fix">{fixClassLabel(a.fixClass)}</div>
                </li>
              ))}
            </ul>
          )}

          <h2>Hub stock</h2>
          <p className="stock-line">{formatStock(hub)}</p>
          <p className="muted">Last refine: {refineLine}</p>

          <h2>Factory</h2>
          <p className="muted">
            {recipe.label}:{' '}
            {Object.entries(recipe.cost)
              .map(([g, n]) => `${n} ${GOOD_LABELS[g as GoodId]}`)
              .join(', ')}
          </p>
          <p className="stock-line">
            Built: {state.factoryOutput.machine_frame ?? 0}
          </p>
          <button type="button" className="primary" onClick={onFactory}>
            Produce {recipe.label}
          </button>

          <h2>Routes</h2>
          <p className="muted">
            Disconnect a feed to starve refine — Doctor should light up.
          </p>
          <ul className="route-list">
            {EXTRACTOR_ROUTES.map((row) => {
              const on = state.routes.some(
                (r) => r.fromSiteId === row.siteId && r.toSiteId === 'hub',
              )
              return (
                <li key={row.siteId}>
                  <button
                    type="button"
                    className={on ? 'route-on' : undefined}
                    onClick={() => toggleRoute(row.siteId)}
                  >
                    {on ? 'Disconnect' : 'Connect'} {row.label}
                  </button>
                </li>
              )
            })}
          </ul>

          <h2>Extractors (local)</h2>
          <ul className="plain-list">
            {state.sites
              .filter((s) => s.kind === 'extractor')
              .map((s) => (
                <li key={s.id}>
                  {s.id}: {formatStock(s.stock)}
                  {s.nodeId && (
                    <span className="muted">
                      {' '}
                      · deposit{' '}
                      {state.nodes.find((n) => n.id === s.nodeId)?.remaining ??
                        0}{' '}
                      left
                    </span>
                  )}
                </li>
              ))}
          </ul>

          <h2>Last tick</h2>
          {flash && <p className="flash">{flash}</p>}
          {state.lastTickLog.length === 0 ? (
            <p className="muted">End a turn to run extract → haul → refine.</p>
          ) : (
            <ul className="log-list">
              {state.lastTickLog.map((line, i) => (
                <li key={`${i}-${line}`}>{line}</li>
              ))}
            </ul>
          )}

          <h2>Acceptance #2</h2>
          <ol className="next-list">
            <li>Connect coal, ore, timber; End turn a few times</li>
            <li>Disconnect coal — Coke refine drops</li>
            <li>Shortage Doctor suggests Connect Route</li>
          </ol>
        </aside>
      </main>
    </div>
  )
}
