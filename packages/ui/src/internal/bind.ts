// Bind phase. The only file that attaches a live ui-sdk instance to an element.
// Instances live in this registry, outside the Model, keyed by the key the
// Model carries. An entry is created by the first part that mounts and
// destroyed when the last one unmounts.
import type { PrimitiveInstance } from '@ui-sdk/core'
import { bind } from '@ui-sdk/core/renderer'
import type { PartProps, Primitive } from './render.ts'

/** The controlled options of one instance, by ui-sdk option name. */
export type Snapshot = Readonly<Record<string, unknown>>
export type Change = Readonly<{ snapshot: Snapshot; reason: string }>

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
    const next = { ...snapshotOf(binding, entry.state), [option]: value }
    entry.state = binding.fold(entry.state, next)
    entry.instance.setOptions(optionsOf(entry))
    const [sink] = entry.sinks
    sink?.({ snapshot: snapshotOf(binding, entry.state), reason: details?.reason ?? 'unknown' })
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
    }
    created.instance = binding.primitive(optionsOf(created))
    registry.set(id, created)
    entry = created
  }
  const held = entry
  held.leases++
  held.sinks.add(sink)
  const events = binding.foldkitEvents[slot]
  const unbind = bind(
    held.instance.part(slot, props),
    element,
    events === undefined ? undefined : { by: 'framework', attaches: events },
  )
  return () => {
    unbind()
    held.sinks.delete(sink)
    if (--held.leases === 0) {
      held.instance.destroy()
      registry.delete(id)
    }
  }
}

/** Model to instance. Confirms what the instance acked, or reverts it when `update` refused. */
export const sync = (component: string, key: string, state: unknown) => {
  const entry = registry.get(registryKey(component, key))
  if (entry === undefined) return
  entry.state = state
  entry.instance.setOptions(optionsOf(entry))
}
