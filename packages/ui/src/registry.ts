// The registry is a Foldkit Resource, not a ManagedResource: its lifetime is the
// app's, not a Model condition. Commands `yield*` it, and the layer's finalizer
// closes it with the app's scope.
//
// Mounts cannot reach a Resource, for two reasons seen in foldkit 0.167:
//   - `Mount.define` types its requirement as Scope only, and at runtime the
//     context a Mount runs in holds Foldkit's own services (Dispatch,
//     MountTracker, Scope, ...) and none of the app's Resources.
//   - Resource layers are built lazily, on the first Command that needs one,
//     and the first render's Mounts run before that.
// So `layer(...)` creates the registry eagerly, when it is called, and leaves it
// on an element under a symbol. A Mount finds it by walking up from its own
// element. Foldkit replaces the container node with the view's root while the
// app runs, so the anchor is the container's parent, which stays. One registry
// value, two ways to reach it, no module-level state. Two apps rendering into
// the same parent would share an anchor: not supported.
import { Context, Effect, Layer, Option } from 'effect'
import { type Binding, closeRegistry, makeRegistry, type Registry } from './internal/bind.ts'

const SCOPE = Symbol.for('foldlab.ui.registry')

export class UiRegistry extends Context.Service<UiRegistry, Registry>()('foldlab/ui/Registry') {
  /** `container` is the element the app renders into (`Runtime.makeApplication`'s `container`). */
  static readonly layer = (bindings: ReadonlyMap<string, Binding>, container: Element) => {
    const anchor = container.parentElement ?? container
    const registry = makeRegistry(bindings)
    Reflect.set(anchor, SCOPE, registry)
    return Layer.effect(
      UiRegistry,
      Effect.acquireRelease(Effect.succeed(registry), () =>
        Effect.sync(() => {
          Reflect.deleteProperty(anchor, SCOPE)
          closeRegistry(registry)
        }),
      ),
    )
  }
}

/** The registry of the app that owns `element`, found on its container. */
export const findRegistry = (element: Element): Option.Option<Registry> => {
  for (let node: Element | null = element; node !== null; node = node.parentElement) {
    const found: unknown = Reflect.get(node, SCOPE)
    if (found !== undefined) return Option.some(found as Registry)
  }
  return Option.none()
}
