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

## Before and after

The demo page (`apps/web/src/app/main.ts`, nonblank lines) before and after the `Ui` facade:

|                                       | By hand                                               | With `Ui.define`                   |
| ------------------------------------- | ----------------------------------------------------- | ---------------------------------- |
| `GotUiMessage` handler                | 35                                                    | 22                                 |
| `uiSpecs` helper                      | 9                                                     | 0                                  |
| Model fields for ui state             | 8                                                     | 3                                  |
| Places to touch to add a component    | 4 (Model field, update fold, Model spread, spec list) | 2 (the `kit` entry and its `init`) |
| Imports for the wiring                | 3 (`specOf`, `syncUiState`, `Spec`)                   | 1 (`Ui`)                           |
| Components that needed a shape change |                                                       | 0                                  |

The last row is the evidence that the facade is a facade. `accordion.ts`, `combobox.ts`, `dialog.ts` and `field.ts` are byte-for-byte what they were before `Ui` existed. The facade reads their exported `State`, `component` and `update`, and nothing else. The handler win is modest because reactions to a change, such as validation, belong to the app.

## The registry

The registry holds the live ui-sdk instances. It is a value (`Registry`) with no module-level state, and the app provides it as a Foldkit **Resource**: its lifetime is the app's, not a Model condition. `kit.layer(container)` builds it. Commands `yield*` it. The layer's finalizer closes it with the app's scope, so HMR and tests need no reset hook. A test makes its own with `makeRegistry` and closes it in `afterEach`.

A boundary test (`boundaries.test.ts`) fails if any kit source declares a module-level `let`, `var`, `Map`, `Set`, `WeakMap`, `WeakSet` or `import.meta.hot`. That covers the lock state too: the owners and the one-time warning live on the `Registry`.

### Mounts cannot reach the Resource

Foldkit 0.167 does not let a Mount read an app Resource, so the registry has a second way in. The evidence is in [upstream-notes.md](upstream-notes.md#foldkit-resources-are-not-reachable-from-a-mount). In short: `Mount.define` types its requirement as `Scope` only, the context a Mount runs in holds Foldkit's own services and none of the app's Resources, and Resource layers are built lazily, after the first render's Mounts.

So `kit.layer(container)` creates the registry eagerly, when it is called, and records it on an anchor element under a symbol. A Mount finds it by walking up from its own element, and stops at `body`. Foldkit replaces the container node with the view's root while the app runs, so the anchor is the container's parent (the container itself when that is `body`). One registry value, two ways to reach it.

### Several apps under one parent

The anchor holds one registry per app id: the container's `id` when it has one, and `app-<n>` otherwise, counted from what the anchor already holds, so there is no module-level counter. A taken id also gets a counter.

**The layer returns the id, and the app carries it.** `kit.layer(container)` returns `{ layer, anchorId }`. The entry that builds the layer is the one thing that knows the id, so it passes it down through Flags into the Model, and the view hands it to each part as `PartsConfig.anchor`:

```ts
// entry.ts
const ui = kit.layer(container)
Runtime.makeApplication({ Model, Flags, init, update, view, container,
  resources: Layer.mergeAll(ApiRpc.layer, ui.layer) })
Runtime.run(application, { flags: Effect.succeed({ anchorId: ui.anchorId }) })

// main.ts
Flags = Schema.Struct({ anchorId: Schema.String })
init = (flags) => ({ model: Model.make({ anchorId: flags.anchorId, ... }) })
const uiOf = (model) => ({ toMessage, anchor: model.anchorId })   // PartsConfig
Dialog.parts(model.ui.settings, h, uiOf(model))
```

A Mount carries the id as a string arg, which DevTools can show. Nothing reads it back off the DOM, so a counter-derived id works, and two apps under one parent, or an embedded widget next to a host app, are ordinary: each entry builds its own layer and passes its own id.

The lone-app default stays. With no `anchor`, a part matches only when the anchor holds exactly one registry, so a single app needs nothing. With two apps and no `anchor`, or one that matches nothing, the part is unbound, loudly. `mount.test.ts` runs four apps under one parent, two of them with the same requested id, and each part binds to its own registry.

### How it fails: unbound, never silent

A control that binds nothing looks like a hung app, so a Mount that finds no registry does not stay quiet:

- It sets `data-foldlab-unbound="<component>:<slot>"` on the element, so a DOM dump shows which control is dead.
- In dev (`import.meta.env.DEV`) it fails the Mount, which Foldkit logs as an unhandled Mount failure. Outside dev it logs one error and leaves the marker.

The registry check runs before the Stream is built. Inside `Stream.callback` the failure died in a forked fiber and the Stream hung, which is the silent behavior this replaces.

### Portals

A bound element is found through the anchor above it, so an element moved out of the anchor's subtree has no registry. `portal.test.ts` moves a bound part out of the anchor and asserts the unbound marker and the dev failure. It is the constraint for whoever writes the first portaling component. Foldkit's own `PortalToBody` Mount example (it appends the element to `document.body`) would meet it, unless the anchor is `body` itself.

A portaling component has two ways out: bind before the move and keep the registry-bound Mount on the element, or give the portal target its own anchor registration. Neither is built.

## Real-browser proof

Story and Scene tests render vnodes. They have no focus, no layout and no `html` style, so none of the dialog's accessibility behavior is visible to them. `apps/web/e2e/dialog.pw.ts` is one Playwright spec that covers it in Chrome. It has its own command, so the unit loop stays fast:

```sh
pnpm --filter @foldlab/web e2e       # CHROME_PATH=... to use an installed Chrome
```

It proves, for the adapter's dialog:

- Tab and Shift+Tab stay inside an open dialog, and `html` overflow is hidden behind it.
- Escape plays the exit: the content stays in the tree, marked `data-closed`, partway through its fade, past the point where a pure render of `open: false` would have removed it. Then the lock and the inert siblings are released and focus returns to the trigger.
- Closing mid-animation and then removing the dialogs from the page leaves no lock, marker or inert element behind.
- A nested confirm closes alone. The parent stays open and keeps the lock, focus returns to the confirm's trigger inside it, and closing the parent releases everything and focuses its trigger.
- No part on the page failed to bind (`data-foldlab-unbound` count is zero).

I checked that it can fail. With `renderState` emptied, so that the exit is not carried through the Model, two of the four tests fail.

What it cannot prove:

- **Screen reader behavior.** It checks focus and attributes, not what assistive technology announces. An accessibility claim beyond focus management needs a manual pass with a screen reader.
- **Other browsers.** One Chrome version. Safari's focus and inert behavior differ.
- **Other components.** Only the dialog. Combobox and accordion keyboard behavior was checked by hand, not by a spec.
- **The lock's source.** ui-sdk core writes the lock, not the adapter. The spec proves the lock holds and releases through the adapter, not that the adapter's `lockSlot` marker is correct. Removing `lockSlot` leaves the spec green, and `bind.test.ts` covers the marker.
- **Mixing providers.** The `@foldkit/ui` stacking case is in the docs and the dev warning, not in the spec.
- **Timing.** The exit assertions use a 60 ms wait against a 150 ms fade. A very slow machine could flake.

## Parts are always keyed

`makeParts` gives every part a Foldkit key built from its component, instance key, slot and props. It is not optional. A Mount runs once, when its element is inserted, and Foldkit patches a same-tag sibling in place. After a page change, an unkeyed `<button>` from one component is reused for a `<button>` of another: its attributes update, but it keeps the old Mount, so the control looks right and does nothing. `e2e/gallery.pw.ts` navigates between pages and asserts the controls bind. With the key removed it fails.

This applies to your own Mount-carrying elements too: key anything that carries `OnMount` and can swap places with another element of the same tag.
