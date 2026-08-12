import { useMemo, useState } from 'react'
import {
  addRoute,
  attackWithOrders,
  ATTACK_ORDER_COST,
  createInitialState,
  draftValidation,
  endTurn,
  enemyArmy,
  FACTORY_RECIPES,
  fieldMark,
  fixClassLabel,
  hubStock,
  isInSupply,
  marchToContact,
  partsForSlot,
  playerArmy,
  previewFight,
  produceMark,
  removeRoute,
  returnToHub,
  SANDBOX_CHASSIS,
  saveMarkDesign,
  setDraftPart,
  spendAtFactory,
  unlockInvent,
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

function formatCost(cost: Partial<Record<GoodId, number>>): string {
  return (
    (Object.entries(cost) as [GoodId, number][])
      .filter(([, n]) => n > 0)
      .map(([g, n]) => `${n} ${GOOD_LABELS[g]}`)
      .join(', ') || '—'
  )
}

export default function App() {
  const [state, setState] = useState<GameState>(() => createInitialState())
  const [flash, setFlash] = useState<string | null>(null)
  const [markName, setMarkName] = useState('Ash Throat')

  const hub = useMemo(() => hubStock(state), [state])
  const recipe = FACTORY_RECIPES[0]!
  const validation = useMemo(() => draftValidation(state), [state])
  const player = useMemo(() => playerArmy(state), [state])
  const enemy = useMemo(() => enemyArmy(state), [state])
  const fight = useMemo(() => previewFight(state), [state])
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

  return (
      <div className="app-shell">
        <header className="top-bar">
          <div className="brand">
            <div className="title">Soot Empire</div>
            <div className="subtitle">Sandbox v1 — logistics · invent · fight</div>
          </div>
          <div className="turn-block">
            <span className="turn-label">Turn {state.turn}</span>
            <button
              type="button"
              className="primary"
              onClick={() => setState((s) => endTurn(s))}
            >
              End turn
            </button>
          </div>
        </header>

        <main className="main-grid">
          <section className="map-panel" aria-label="Strategy map">
            <HexMap state={state} />
          </section>
          <aside className="side-panel">
            {flash && <p className="flash">{flash}</p>}

            <section className="panel-section">
              <h2>Combat</h2>
              {player && enemy && (
                <>
                  <p className="stock-line">
                    {player.name}: HP {player.hp}/{player.hpMax} · Orders{' '}
                    {player.orders}/{player.ordersMax} ·{' '}
                    {isInSupply(state, player) ? 'In supply' : 'OUT OF SUPPLY'}
                  </p>
                  <p className="muted">
                    Units:{' '}
                    {player.units.map((u) => `${u.label}(${u.role})`).join(', ')}
                  </p>
                  <p className="stock-line">
                    {enemy.name}: HP {enemy.hp}/{enemy.hpMax}
                  </p>
                  {fight && (
                    <p className="muted">
                      Preview: {fight.playerPower} vs {fight.enemyPower} →{' '}
                      <strong>{fight.winner}</strong>
                      {!fight.playerInSupply ? ' · supply penalty' : ''}
                    </p>
                  )}
                  <div className="combat-actions">
                    <button
                      type="button"
                      onClick={() => apply(marchToContact(state))}
                    >
                      March to contact (1 Ord)
                    </button>
                    <button type="button" onClick={() => apply(returnToHub(state))}>
                      Return to Hub
                    </button>
                    <button
                      type="button"
                      className="primary"
                      onClick={() => apply(attackWithOrders(state))}
                    >
                      Attack ({ATTACK_ORDER_COST} Ord)
                    </button>
                  </div>
                  {state.lastFight && (
                    <p className="muted">{state.lastFight.summary}</p>
                  )}
                  <p className="muted">Field produced Marks:</p>
                  <ul className="plain-list">
                    {state.markDesigns.map((d) => {
                      const n = state.producedMarks[d.id] ?? 0
                      if (n < 1) return null
                      return (
                        <li key={`field-${d.id}`}>
                          {d.name} ×{n}{' '}
                          <button
                            type="button"
                            className="inline-btn"
                            onClick={() => apply(fieldMark(state, d.id))}
                          >
                            Field
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </section>

            <section className="panel-section">
              <h2>Invention</h2>
              {!state.inventUnlocked ? (
                <>
                  <p className="muted">
                    Early Industrial research door closed. Co-pilot stubbed.
                  </p>
                  <button
                    type="button"
                    className="primary"
                    onClick={() => apply(unlockInvent(state))}
                  >
                    Unlock Early Invent
                  </button>
                </>
              ) : (
                <>
                  <p className="muted">
                    Chassis: {SANDBOX_CHASSIS.name} (1 family subset). Hard bans +
                    soft taxes.
                  </p>
                  {SANDBOX_CHASSIS.slots.map((slot) => (
                    <div key={slot.id} className="invent-slot">
                      <label htmlFor={`slot-${slot.id}`}>
                        {slot.id}
                        {slot.required ? ' *' : ''}
                      </label>
                      <select
                        id={`slot-${slot.id}`}
                        value={state.inventDraft[slot.id] ?? ''}
                        onChange={(e) =>
                          apply(
                            setDraftPart(
                              state,
                              slot.id,
                              e.target.value === '' ? null : e.target.value,
                            ),
                          )
                        }
                      >
                        <option value="">— empty —</option>
                        {partsForSlot(slot.type).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <div className="invent-status">
                    {validation.legal ? (
                      <p className="ok-line">
                        Legal · {validation.role} · ATK {validation.stats.attack} /
                        DEF {validation.stats.defense} · heat{' '}
                        {validation.stats.heat}
                        {validation.taxes.breakdown > 0
                          ? ` · tax breakdown +${validation.taxes.breakdown}`
                          : ''}
                        {validation.taxes.fuelPressure > 0
                          ? ` · fuel pressure ${validation.taxes.fuelPressure}`
                          : ''}
                      </p>
                    ) : (
                      <ul className="ban-list">
                        {validation.bans.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    )}
                    <p className="muted">
                      Cost: {formatCost(validation.totalCost)} + frame
                    </p>
                  </div>
                  <div className="invent-actions">
                    <input
                      type="text"
                      value={markName}
                      onChange={(e) => setMarkName(e.target.value)}
                      aria-label="Mark name"
                    />
                    <button
                      type="button"
                      className="primary"
                      onClick={() => apply(saveMarkDesign(state, markName))}
                    >
                      Save Mark
                    </button>
                  </div>
                  <ul className="plain-list">
                    {state.markDesigns.map((d) => (
                      <li key={d.id}>
                        <strong>{d.name}</strong> ({d.role}) · pool{' '}
                        {state.producedMarks[d.id] ?? 0}
                        <button
                          type="button"
                          className="inline-btn"
                          onClick={() => apply(produceMark(state, d.id))}
                        >
                          Produce
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            <section className="panel-section">
              <h2>Shortage Doctor</h2>
              {state.shortageAlerts.length === 0 ? (
                <p className="muted">No logistics alarms.</p>
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
            </section>

            <section className="panel-section">
              <h2>Hub stock</h2>
              <p className="stock-line">{formatStock(hub)}</p>
              <p className="muted">Last refine: {refineLine}</p>
            </section>

            <section className="panel-section">
              <h2>Factory</h2>
              <p className="muted">
                {recipe.label}:{' '}
                {Object.entries(recipe.cost)
                  .map(([g, n]) => `${n} ${GOOD_LABELS[g as GoodId]}`)
                  .join(', ')}
              </p>
              <p className="stock-line">
                Frames: {state.factoryOutput.machine_frame ?? 0}
              </p>
              <button
                type="button"
                className="primary"
                onClick={() => apply(spendAtFactory(state, recipe.id))}
              >
                Produce {recipe.label}
              </button>
            </section>

            <section className="panel-section">
              <h2>Routes</h2>
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
            </section>

            <section className="panel-section">
              <h2>Last tick</h2>
              {state.lastTickLog.length === 0 ? (
                <p className="muted">End a turn to run logistics.</p>
              ) : (
                <ul className="log-list">
                  {state.lastTickLog.map((line, i) => (
                    <li key={`${i}-${line}`}>{line}</li>
                  ))}
                </ul>
              )}
            </section>

            <section className="panel-section">
              <h2>Sandbox v1 path</h2>
              <ol className="next-list">
                <li>Connect coal, ore, timber routes</li>
                <li>End turn → hub refine → Machine Frame</li>
                <li>Optional: cut coal — Doctor + coke drop</li>
                <li>Unlock invent → legal Mark → Produce → Field</li>
                <li>March · preview · Attack (Orders)</li>
                <li>Cut routes → out-of-supply power drops</li>
              </ol>
            </section>
          </aside>
        </main>
      </div>
    )
  }
