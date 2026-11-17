# Using `@foldlab/ui`

The kit is an adapter from ui-sdk to Foldkit: state in the Model, Messages out, a view that is pure given the Model. This page says what a component author writes, what an app author imports and wires, and what the `Ui` facade removes. [adapter-api.md](adapter-api.md) has the design and the evidence behind it.

## What a component author writes

A component is a plain value. Three small files' worth of decisions, in one file (`packages/ui/src/dialog.ts` is the model):

```ts
export const State = Schema.Struct({ key: Schema.String, open: Schema.Boolean, mounted: Schema.Boolean, ... })
export const init = (state: { key: string; open?: boolean }): State => ({ ... })

export const component = defineComponent<State, Slot>({
  name: 'dialog',                       // data-slot prefix and registry name
  primitive: primitiveOf(dialog),       // the one cast, in one place
  state: State,
  key: (state) => state.key,            // identity comes from the Model
  options: (state) => ({ open: state.open }),
  controlled: ['open'],
  callbacks: { onOpenChange: 'open' },
  fold: (state, snapshot) => ({ ... }), // pure and idempotent
  tags: { trigger: 'button', content: 'div', ... },
  bound: ['trigger', 'content', ...],   // parts that need a live element
  // optional: guard, completions, renderState, lockSlot, text + typed
})

export const parts = makeParts(component)
export const update = makeUpdate(component)
```

`defineComponent` registers nothing. It names the shape for the compiler. The optional fields are the [lifecycle rule](adapter-api.md#lifecycle-state) (`renderState`, `completions`), the synchronous veto (`guard`), the scroll-lock claim (`lockSlot`) and Foldkit-owned text entry (`text`, `typed`).

The helpers (`defineComponent`, `makeParts`, `makeUpdate`, `primitiveOf`) are not exported from the package index yet. Components live inside `packages/ui` for now.

## What an app author imports

From `@foldlab/ui`:

| Import                                     | Use                                                                                                            |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `Accordion`, `Combobox`, `Dialog`, `Field` | Each exports `State`, `init`, `update`, `parts` and `component`.                                               |
| `Ui`                                       | `Ui.define(entries)` is the facade. `Ui.layerOf(components, container)` is the registry layer for hand wiring. |
| `Message`                                  | The ui Message union. The app wraps it once, as `GotUiMessage`.                                                |
| `UiRegistry`                               | The Resource. Add its type to `Update.Return<Model, Message, UiRegistry>`.                                     |
| `specOf`, `syncUiState`, `BindPart`        | The hand-wired path, and what tests resolve.                                                                   |
| `stamp`                                    | Puts our `data-slot` on another provider's attribute arrays.                                                   |

Also `@foldlab/ui/testing` (`resolveBinds(lift)`) and `@foldlab/ui/preset` (the Panda preset).

## What an app author wires

With the facade, an app does five things.

```ts
// 1. Declare the components.
export const kit = Ui.define({
  assigneeBox: Combobox.component,
  help: Accordion.component,
  settings: Dialog.component,
})

// 2. One Model slice. Each component's State and init stay yours to call.
Model = Schema.Struct({ ..., ui: kit.Model })
init:   ui: { assigneeBox: Combobox.init({ key: 'assignee', items }), help: Accordion.init({ key: 'help' }), ... }

// 3. One Message, wrapping the ui Message.
GotUiMessage: { message: UiMessage }

// 4. One update. Compare before and after to react, as validation does.
GotUiMessage: ({ message: child }) => {
  const result = kit.update(model.ui, child)
  return {
    model: { ...model, ui: result.model /* ...your reactions */ },
    commands: Command.mapMessages(result.commands, (message) => Message.GotUiMessage({ message })),
  }
}

// 5. The registry layer, with the element the app renders into.
Runtime.makeApplication({ ..., container, resources: Layer.mergeAll(ApiRpc.layer, kit.layer(container)) })
```

In the view: `Dialog.parts(model.ui.settings, h, { toMessage })`, as before.

### The facade is not a lock-in

`Ui.define` does only the wiring that was identical in every app. Each component's `State`, `init` and `update` stay exported, and `GotUiMessage`, `specOf` and `syncUiState` are the same ones. An app can wire one component by hand:

```ts
const update = (model, message) => {
  if (message._tag === 'CompletedUiSync') return { model, commands: [] }
  const help = Accordion.update(model.help, message)
  return {
    model: { help },
    commands: [syncUiState({ specs: [specOf(Accordion.component, help)] })],
  }
}
// resources: Ui.layerOf([Accordion.component], container)
```

`ui.test.ts` runs this path as a Story. The message flow stays visible either way.

### What the facade removes

1. **State folded but not confirmed.** By hand, each component appears in three places: the `update` fold, the Model, and the sync spec list. Forget the third and a refused change leaves the instance holding the acked value, with nothing to revert it. Nothing fails and the Model looks right. `Ui.define` builds the spec list from the same entries it folds.
2. **The sync loop.** A sync Command's completion is itself a ui Message. An `update` that returns a sync for every ui Message, including that completion, runs forever. `Ui.update` returns no Commands for `CompletedUiSync`. By hand you must remember the early return.

### What it does not remove

Reactions to a change (the demo's validation on assignee and channels) stay in the app's handler, because they are the app's. The handler shrinks by the wiring only.

## The registry

The registry holds the live ui-sdk instances. It is a value (`Registry`) with no module-level state, and the app provides it as a Foldkit **Resource**: its lifetime is the app's, not a Model condition. `kit.layer(container)` builds it. Commands `yield*` it. The layer's finalizer closes it with the app's scope, so HMR and tests need no reset hook. A test makes its own with `makeRegistry` and closes it in `afterEach`.

A boundary test (`boundaries.test.ts`) fails if any kit source declares a module-level `let`, `var`, `Map`, `Set`, `WeakMap`, `WeakSet` or `import.meta.hot`. That covers the lock state too: the owners and the one-time warning live on the `Registry`.

### Mounts cannot reach the Resource

Foldkit 0.167 does not let a Mount read an app Resource, so the registry has a second way in:

- `Mount.define` types its requirement as `Scope` only.
- At runtime, the context a Mount runs in holds Foldkit's own services (`Dispatch`, `MountTracker`, `MountRuntime`, `Scope`, ...) and none of the app's Resources. I checked the context keys in a browser.
- Resource layers are built lazily, on the first Command that needs one. The first render's Mounts run before that.

So `kit.layer(container)` creates the registry eagerly, when it is called, and leaves it on an element under a symbol. A Mount finds it by walking up from its own element. Foldkit replaces the container node with the view's root while the app runs, so the anchor is the container's parent. If the registry is missing, the Mount logs an error that names the component and binds nothing.

One registry value, two ways to reach it. Two apps rendering into the same parent would share an anchor, which is not supported.
