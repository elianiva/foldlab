// Bind phase. The only file that attaches a live ui-sdk instance to an element.
// Instances live in this registry, outside the Model, keyed by the key the
// Model carries. An entry is created by the first part that mounts and
// destroyed when the last one unmounts.
import type { PrimitiveInstance } from '@ui-sdk/core'
import { bind } from '@ui-sdk/core/renderer'
import type { PartProps, Primitive } from './render.ts'

/** The controlled options of one instance, by ui-sdk option name. */
export type Snapshot = Readonly<Record<string, unknown>>
/** `refused` changes were vetoed by the guard: the instance did not move. */
export type Change = Readonly<{ snapshot: Snapshot; reason: string; refused: boolean }>

export type Binding = Readonly<{
  primitive: Primitive
  /** Model state in, ui-sdk options out. Pure. */
  options: (state: unknown) => Readonly<Record<string, unknown>>
  /** Option names the Model controls. */
  controlled: ReadonlyArray<string>
  /** ui-sdk callback option to the controlled option it asks to change. */
  callbacks: Readonly<Record<string, string>>
  /** State after a snapshot lands. Pure and idempotent. */
  fold: (state: unknown, snapshot: Snapshot) => unknown
  /**
   * Synchronous veto, pure. Gets the state the instance holds and the snapshot
   * it asked for. False means: do not ack, do not call setOptions.
   */
  guard: (state: unknown, snapshot: Snapshot) => boolean
  /** DOM events Foldkit owns on a slot, so core does not attach them. */
  foldkitEvents: Readonly<Record<string, ReadonlyArray<string>>>
}>

type Entry = {
  instance: PrimitiveInstance
  readonly key: string
  readonly binding: Binding
  readonly sinks: Set<(change: Change) => void>
  /** What the instance currently believes: the Model's state, plus changes it acked itself. */
  state: unknown
  leases: number
  /** One binding per element. Attaching the same element again replaces the old one. */
  readonly bound: WeakMap<Element, () => void>
}

const registry = new Map<string, Entry>()
const registryKey = (component: string, key: string) => `${component}:${key}`

const snapshotOf = (binding: Binding, state: unknown): Snapshot => {
  const options = binding.options(state)
  return Object.fromEntries(binding.controlled.map((name) => [name, options[name]]))
}

const optionsOf = (entry: Entry) => {
  const { binding } = entry
  // Ack first, then tell the app: a second interaction in the same tick reads
  // the acked value, and the Message carries everything `update` needs.
  const callback = (option: string) => (value: unknown, details?: { reason?: string }) => {
    const reason = details?.reason ?? 'unknown'
    const next = { ...snapshotOf(binding, entry.state), [option]: value }
    const [sink] = entry.sinks
    if (!binding.guard(entry.state, next)) {
      // Not acking is the veto: core keeps the old option, so nothing moves.
      sink?.({ snapshot: next, reason, refused: true })
      return
    }
    entry.state = binding.fold(entry.state, next)
    entry.instance.setOptions(optionsOf(entry))
    sink?.({ snapshot: snapshotOf(binding, entry.state), reason, refused: false })
  }
  const callbacks = Object.fromEntries(
    Object.entries(binding.callbacks).map(([name, option]) => [name, callback(option)]),
  )
  return { ...binding.options(entry.state), ...callbacks, id: entry.key }
}

export const attach = (
  component: string,
  binding: Binding,
  key: string,
  state: unknown,
  slot: string,
  props: PartProps,
  element: HTMLElement,
  sink: (change: Change) => void,
): (() => void) => {
  const id = registryKey(component, key)
  let entry = registry.get(id)
  if (entry === undefined) {
    const created: Entry = {
      // Assigned on the next line: the options it is built from close over `created`.
      instance: undefined as unknown as PrimitiveInstance,
      key,
      binding,
      sinks: new Set(),
      state,
      leases: 0,
      bound: new WeakMap(),
    }
    created.instance = binding.primitive(optionsOf(created))
    registry.set(id, created)
    entry = created
  }
  const held = entry
  held.leases++
  held.sinks.add(sink)
  // Lease first, so replacing a binding never takes the count to zero.
  held.bound.get(element)?.()
  const events = binding.foldkitEvents[slot]
  const unbind = bind(
    held.instance.part(slot, props),
    element,
    events === undefined ? undefined : { by: 'framework', attaches: events },
  )
  let released = false
  const release = () => {
    if (released) return
    released = true
    unbind()
    if (held.bound.get(element) === release) held.bound.delete(element)
    held.sinks.delete(sink)
    if (--held.leases === 0) {
      held.instance.destroy()
      if (registry.get(id) === held) registry.delete(id)
    }
  }
  held.bound.set(element, release)
  return release
}

/** The live instance for a key, if any part of it is mounted. */
export const liveInstance = (component: string, key: string) =>
  registry.get(registryKey(component, key))?.instance

/** Destroys every instance. Runs on HMR dispose, and between tests. */
export const destroyAll = () => {
  for (const entry of registry.values()) entry.instance.destroy()
  registry.clear()
}

const hot = (import.meta as { hot?: { dispose: (callback: () => void) => void } }).hot
hot?.dispose(destroyAll)

/** Model to instance. Confirms what the instance acked, or reverts it when `update` refused. */
export const sync = (component: string, key: string, state: unknown) => {
  const entry = registry.get(registryKey(component, key))
  if (entry === undefined) return
  entry.state = state
  entry.instance.setOptions(optionsOf(entry))
}
