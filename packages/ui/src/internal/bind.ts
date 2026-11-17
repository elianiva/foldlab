// Bind phase. The only file that attaches a live ui-sdk instance to an element.
// Instances live in this registry, outside the Model, keyed by the key the
// Model carries. An entry is created by the first part that mounts and
// destroyed when the last one unmounts.
import type { PrimitiveInstance } from '@ui-sdk/core'
import { bind } from '@ui-sdk/core/renderer'
import type { PartProps, Primitive } from './render.ts'

export type Change = Readonly<{ name: string; value: unknown; reason: string }>

export type Binding = Readonly<{
  primitive: Primitive
  // Model state in, ui-sdk options out. Pure.
  options: (state: unknown) => Readonly<Record<string, unknown>>
  // ui-sdk callback option -> the state field it asks to change.
  callbacks: Readonly<Record<string, string>>
}>

type Entry = {
  readonly instance: PrimitiveInstance
  readonly sinks: Set<(change: Change) => void>
  readonly binding: Binding
  leases: number
}

const registry = new Map<string, Entry>()
const registryKey = (component: string, key: string) => `${component}:${key}`

const optionsFor = (
  binding: Binding,
  sinks: ReadonlySet<(change: Change) => void>,
  key: string,
  state: unknown,
) => {
  // One Message per change, however many parts are mounted.
  const emit = (name: string) => (value: unknown, details?: { reason?: string }) => {
    const [first] = sinks
    first?.({ name, value, reason: details?.reason ?? 'unknown' })
  }
  const callbacks = Object.fromEntries(
    Object.entries(binding.callbacks).map(([option, name]) => [option, emit(name)]),
  )
  return { ...binding.options(state), ...callbacks, id: key }
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
    const sinks = new Set<(change: Change) => void>()
    entry = {
      instance: binding.primitive(optionsFor(binding, sinks, key, state)),
      sinks,
      binding,
      leases: 0,
    }
    registry.set(id, entry)
  }
  const held = entry
  held.leases++
  held.sinks.add(sink)
  const unbind = bind(held.instance.part(slot, props), element)
  return () => {
    unbind()
    held.sinks.delete(sink)
    if (--held.leases === 0) {
      held.instance.destroy()
      registry.delete(id)
    }
  }
}

// Model -> instance. Called whenever the Model's ui state changes.
export const sync = (component: string, key: string, state: unknown) => {
  const entry = registry.get(registryKey(component, key))
  entry?.instance.setOptions(optionsFor(entry.binding, entry.sinks, key, state))
}
