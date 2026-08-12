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
import {
  armyById,
  listAttention,
  nextAttention,
  routeById,
  routeToHub,
  siteById,
  type MapSelection,
} from './view/selection'
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

const GOOD_ORDER: GoodId[] = [
  'coal',
  'ore',
  'timber',
  'food',
  'coke',
  'plates',
  'beams',
]

function formatCost(cost: Partial<Record<GoodId, number>>): string {
  return (
    (Object.entries(cost) as [GoodId, number][])
      .filter(([, n]) => n > 0)
      .map(([g, n]) => `${n} ${GOOD_LABELS[g]}`)
      .join(', ') || '—'
  )
}

function extractorLabel(state: GameState, siteId: string): string {
  const site = siteById(state, siteId)
  if (!site?.nodeId) return siteId
  const node = state.nodes.find((n) => n.id === site.nodeId)
  if (!node) return siteId
  return `${GOOD_LABELS[node.resource]} extractor`
}

export default function App() {
  const [state, setState] = useState<GameState>(() => createInitialState())
  const [flash, setFlash] = useState<string | null>(null)
  const [markName, setMarkName] = useState('Ash Throat')
  const [selection, setSelection] = useState<MapSelection | null>(null)

  const hub = useMemo(() => hubStock(state), [state])
  const recipe = FACTORY_RECIPES[0]!
  const validation = useMemo(() => draftValidation(state), [state])
  const player = useMemo(() => playerArmy(state), [state])
  const enemy = useMemo(() => enemyArmy(state), [state])
  const fight = useMemo(() => previewFight(state), [state])
  const attention = useMemo(() => listAttention(state), [state])
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
      // Drop selection if the target vanished (e.g. removed route)
      setSelection((sel) => {
        if (!sel) return null
        if (sel.kind === 'route' && !result.state.routes.some((r) => r.id === sel.id)) {
          return null
        }
        if (sel.kind === 'army' && !result.state.armies.some((a) => a.id === sel.id)) {
          return null
        }
        if (sel.kind === 'site' && !result.state.sites.some((s) => s.id === sel.id)) {
          return null
        }
        return sel
      })
    } else {
      setFlash(result.error)
    }
  }

  function toggleExtractorRoute(fromSiteId: string) {
    const existing = routeToHub(state, fromSiteId)
    if (existing) {
      apply(removeRoute(state, existing.id))
    } else {
      apply(addRoute(state, fromSiteId, 'hub', { tier: 'road' }))
    }
  }

  function onNextAttention() {
    const n = nextAttention(state, selection)
    setSelection(n)
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand">
          <div className="title">Soot Empire</div>
          <div className="subtitle">Sandbox — select the map to act</div>
        </div>

        <div className="goods-pulse" aria-label="Hub stock">
          {GOOD_ORDER.map((g) => {
            const n = hub[g] ?? 0
            return (
              <span
                key={g}
                className={`good-chip${n > 0 ? ' has' : ''}`}
                title={GOOD_LABELS[g]}
              >
                <span className="good-name">{GOOD_LABELS[g]}</span>
                <span className="good-n">{n}</span>
              </span>
            )
          })}
          <span className="good-chip frames" title="Machine Frames">
            <span className="good-name">Frames</span>
            <span className="good-n">{state.factoryOutput.machine_frame ?? 0}</span>
          </span>
        </div>

        <div className="turn-block">
          <span className="turn-label">Turn {state.turn}</span>
          <button
            type="button"
            className="attention-btn"
            disabled={attention.length === 0}
            onClick={onNextAttention}
            title={
              attention.length
                ? attention.map((a) => a.label).join(' · ')
                : 'Nothing needs attention'
            }
          >
            Next attention
            {attention.length > 0 ? ` (${attention.length})` : ''}
          </button>
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
          <HexMap
            state={state}
            selection={selection}
            onSelect={setSelection}
          />
        </section>

        <aside className="side-panel inspector" aria-label="Selection inspector">
          {flash && <p className="flash">{flash}</p>}

          {!selection && (
            <OverviewPanel
              state={state}
              attention={attention}
              refineLine={refineLine}
              onPick={setSelection}
            />
          )}

          {selection?.kind === 'site' &&
            siteById(state, selection.id)?.kind === 'hub' && (
              <HubInspector
                state={state}
                hub={hub}
                recipe={recipe}
                validation={validation}
                markName={markName}
                setMarkName={setMarkName}
                refineLine={refineLine}
                apply={apply}
                onClear={() => setSelection(null)}
              />
            )}

          {selection?.kind === 'site' &&
            siteById(state, selection.id)?.kind === 'extractor' && (
              <ExtractorInspector
                state={state}
                siteId={selection.id}
                onToggleRoute={() => toggleExtractorRoute(selection.id)}
                onClear={() => setSelection(null)}
                onSelectRoute={(id) => setSelection({ kind: 'route', id })}
              />
            )}

          {selection?.kind === 'army' && (
            <ArmyInspector
              state={state}
              armyId={selection.id}
              player={player}
              enemy={enemy}
              fight={fight}
              apply={apply}
              onClear={() => setSelection(null)}
            />
          )}

          {selection?.kind === 'route' && (
            <RouteInspector
              state={state}
              routeId={selection.id}
              apply={apply}
              onClear={() => setSelection(null)}
              onSelectSite={(id) => setSelection({ kind: 'site', id })}
            />
          )}
        </aside>
      </main>
    </div>
  )
}

function OverviewPanel({
  state,
  attention,
  refineLine,
  onPick,
}: {
  state: GameState
  attention: ReturnType<typeof listAttention>
  refineLine: string
  onPick: (sel: MapSelection) => void
}) {
  return (
    <>
      <section className="panel-section">
        <h2>Command</h2>
        <p className="lead">
          Logistics is power. Select extractors on the map, link them to the Hub,
          End turn to haul and refine, then open the Hub for factory and invent.
        </p>
        <p className="muted">
          Click a site, army, or route. Drag the map to pan. Brass pips mark what
          still needs attention.
        </p>
      </section>

      <section className="panel-section">
        <h2>Attention</h2>
        {attention.length === 0 ? (
          <p className="muted">Clear — experiment or End turn.</p>
        ) : (
          <ul className="plain-list attention-list">
            {attention.map((a) => (
              <li key={`${a.kind}:${a.id}:${a.reason}`}>
                <button
                  type="button"
                  className="linkish"
                  onClick={() => onPick({ kind: a.kind, id: a.id })}
                >
                  {a.label}
                </button>
              </li>
            ))}
          </ul>
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
        <h2>Last tick</h2>
        <p className="muted">Last refine: {refineLine}</p>
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
    </>
  )
}

function HubInspector({
  state,
  hub,
  recipe,
  validation,
  markName,
  setMarkName,
  refineLine,
  apply,
  onClear,
}: {
  state: GameState
  hub: Partial<Record<GoodId, number>>
  recipe: (typeof FACTORY_RECIPES)[number]
  validation: ReturnType<typeof draftValidation>
  markName: string
  setMarkName: (s: string) => void
  refineLine: string
  apply: (
    result: { ok: true; state: GameState } | { ok: false; error: string },
  ) => void
  onClear: () => void
}) {
  return (
    <>
      <InspectorHeader title="Hub" subtitle="Industrial desk" onClear={onClear} />

      <section className="panel-section">
        <h2>Stock</h2>
        <p className="stock-line">
          {GOOD_ORDER.map((g) => `${GOOD_LABELS[g]} ${hub[g] ?? 0}`).join(' · ')}
        </p>
        <p className="muted">Last refine: {refineLine}</p>
        <p className="muted">
          Frames on hand: {state.factoryOutput.machine_frame ?? 0}
        </p>
      </section>

      <section className="panel-section">
        <h2>Factory</h2>
        <p className="muted">
          {recipe.label}:{' '}
          {Object.entries(recipe.cost)
            .map(([g, n]) => `${n} ${GOOD_LABELS[g as GoodId]}`)
            .join(', ')}
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
              Chassis: {SANDBOX_CHASSIS.name}. Hard bans + soft taxes.
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
                  Legal · {validation.role} · ATK {validation.stats.attack} / DEF{' '}
                  {validation.stats.defense} · heat {validation.stats.heat}
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
              <p className="muted">Cost: {formatCost(validation.totalCost)} + frame</p>
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

      {state.shortageAlerts.length > 0 && (
        <section className="panel-section">
          <h2>Doctor</h2>
          <ul className="doctor-list">
            {state.shortageAlerts.map((a) => (
              <li key={a.id} className={`doctor-alert ${a.severity}`}>
                <div className="doctor-title">{a.title}</div>
                <div className="doctor-detail">{a.detail}</div>
                <div className="doctor-fix">{fixClassLabel(a.fixClass)}</div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

function ExtractorInspector({
  state,
  siteId,
  onToggleRoute,
  onClear,
  onSelectRoute,
}: {
  state: GameState
  siteId: string
  onToggleRoute: () => void
  onClear: () => void
  onSelectRoute: (id: string) => void
}) {
  const site = siteById(state, siteId)
  const node = state.nodes.find((n) => n.id === site?.nodeId)
  const route = routeToHub(state, siteId)
  const linked = Boolean(route)

  return (
    <>
      <InspectorHeader
        title={extractorLabel(state, siteId)}
        subtitle="Deposit site"
        onClear={onClear}
      />
      <section className="panel-section">
        <h2>Deposit</h2>
        {node ? (
          <>
            <p className="stock-line">
              {GOOD_LABELS[node.resource]} · remaining {node.remaining}
            </p>
            <p className="muted">
              Local stock:{' '}
              {Object.entries(site?.stock ?? {})
                .filter(([, n]) => (n ?? 0) > 0)
                .map(([g, n]) => `${GOOD_LABELS[g as GoodId]} ${n}`)
                .join(' · ') || 'Empty'}
            </p>
          </>
        ) : (
          <p className="muted">No deposit linked.</p>
        )}
      </section>
      <section className="panel-section">
        <h2>Route to Hub</h2>
        <p className="muted">
          {linked
            ? `Road linked (${route!.capacity} cap/turn). Haul runs on End turn.`
            : 'No link — this pit will not feed the Hub.'}
        </p>
        <button
          type="button"
          className={linked ? 'route-on' : 'primary'}
          onClick={onToggleRoute}
        >
          {linked ? 'Disconnect route' : 'Connect road to Hub'}
        </button>
        {route && (
          <p className="muted" style={{ marginTop: '0.5rem' }}>
            <button
              type="button"
              className="linkish"
              onClick={() => onSelectRoute(route.id)}
            >
              Inspect route on map
            </button>
          </p>
        )}
      </section>
    </>
  )
}

function ArmyInspector({
  state,
  armyId,
  player,
  enemy,
  fight,
  apply,
  onClear,
}: {
  state: GameState
  armyId: string
  player: ReturnType<typeof playerArmy>
  enemy: ReturnType<typeof enemyArmy>
  fight: ReturnType<typeof previewFight>
  apply: (
    result: { ok: true; state: GameState } | { ok: false; error: string },
  ) => void
  onClear: () => void
}) {
  const army = armyById(state, armyId)
  if (!army) {
    return (
      <section className="panel-section">
        <p className="muted">Army gone.</p>
        <button type="button" onClick={onClear}>
          Clear
        </button>
      </section>
    )
  }

  const isPlayer = army.owner === 'player'

  return (
    <>
      <InspectorHeader
        title={army.name}
        subtitle={isPlayer ? 'Your army' : 'Hostile'}
        onClear={onClear}
      />
      <section className="panel-section">
        <h2>Status</h2>
        <p className="stock-line">
          HP {army.hp}/{army.hpMax}
          {isPlayer
            ? ` · Orders ${army.orders}/${army.ordersMax} · ${
                player && isInSupply(state, player) ? 'In supply' : 'OUT OF SUPPLY'
              }`
            : ''}
        </p>
        <p className="muted">
          Units: {army.units.map((u) => `${u.label}(${u.role})`).join(', ')}
        </p>
      </section>

      {isPlayer && player && enemy && (
        <section className="panel-section">
          <h2>Orders</h2>
          {fight && (
            <p className="muted">
              Preview: {fight.playerPower} vs {fight.enemyPower} →{' '}
              <strong>{fight.winner}</strong>
              {!fight.playerInSupply ? ' · supply penalty' : ''}
            </p>
          )}
          <div className="combat-actions">
            <button type="button" onClick={() => apply(marchToContact(state))}>
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
          {state.lastFight && <p className="muted">{state.lastFight.summary}</p>}
        </section>
      )}

      {isPlayer && (
        <section className="panel-section">
          <h2>Field Marks</h2>
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
          {state.markDesigns.every((d) => (state.producedMarks[d.id] ?? 0) < 1) && (
            <p className="muted">Produce a Mark at the Hub first.</p>
          )}
        </section>
      )}
    </>
  )
}

function RouteInspector({
  state,
  routeId,
  apply,
  onClear,
  onSelectSite,
}: {
  state: GameState
  routeId: string
  apply: (
    result: { ok: true; state: GameState } | { ok: false; error: string },
  ) => void
  onClear: () => void
  onSelectSite: (id: string) => void
}) {
  const route = routeById(state, routeId)
  if (!route) {
    return (
      <section className="panel-section">
        <p className="muted">Route removed.</p>
        <button type="button" onClick={onClear}>
          Clear
        </button>
      </section>
    )
  }

  return (
    <>
      <InspectorHeader
        title={`${route.tier === 'rail' ? 'Rail' : 'Road'} route`}
        subtitle={`${route.fromSiteId} → ${route.toSiteId}`}
        onClear={onClear}
      />
      <section className="panel-section">
        <h2>Link</h2>
        <p className="muted">Capacity {route.capacity} goods/turn (dual-use path).</p>
        <p className="muted">
          <button
            type="button"
            className="linkish"
            onClick={() => onSelectSite(route.fromSiteId)}
          >
            Open {extractorLabel(state, route.fromSiteId)}
          </button>
          {' · '}
          <button
            type="button"
            className="linkish"
            onClick={() => onSelectSite(route.toSiteId)}
          >
            Open Hub
          </button>
        </p>
        <button
          type="button"
          className="route-on"
          onClick={() => apply(removeRoute(state, route.id))}
        >
          Disconnect route
        </button>
      </section>
    </>
  )
}

function InspectorHeader({
  title,
  subtitle,
  onClear,
}: {
  title: string
  subtitle: string
  onClear: () => void
}) {
  return (
    <div className="inspector-header">
      <div>
        <div className="inspector-title">{title}</div>
        <div className="inspector-sub">{subtitle}</div>
      </div>
      <button type="button" className="inline-btn" onClick={onClear}>
        Deselect
      </button>
    </div>
  )
}
