# Adapter API: ui-sdk for Foldkit

This page compares the `@foldlab/ui` adapter with the ui-sdk React, Vue and Svelte adapters, for a combobox and an accordion. It then lists where the shapes diverge, and why.

`@foldlab/ui` pins `@ui-sdk/core@0.1.0-beta.7`. The adapter reads `@ui-sdk/core/renderer`, which ui-sdk says is not public API. Only two files import it:

- `packages/ui/src/internal/render.ts` – the render phase.
- `packages/ui/src/internal/bind.ts` – the bind phase.

No ui-sdk type appears in the public API.

## The constraint

Foldkit's `view` receives `(model, h)`. It cannot read a store, and the Model is a serialized Schema. ui-sdk computes attributes from a store that lives in an instance, and `present` decides which parts exist.

So the adapter keeps the instance out of the Model and out of the view. State is plain data in the Model. The adapter turns that data into attributes in a pure step, and into behavior in a separate step.

```
Model slice ──options()──► render phase (pure) ──► attributes ──► Html
     ▲                                                              │
     │                                                       OnMount│(bind)
     │                                                              ▼
 update ◄── Message.ChangedUiState ◄── core handlers ◄── live instance on the element
     │
     └──► SyncUiState Command ──► instance.setOptions(options(model))
```

## Side by side: accordion

**React** (`@ui-sdk/react/accordion`)

```tsx
<Accordion defaultValue={['shipping']}>
  {items.map((item) => (
    <AccordionItem key={item.value} value={item.value}>
      <AccordionHeader>
        <AccordionTrigger>{item.label}</AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel>
        <p>{item.body}</p>
      </AccordionPanel>
    </AccordionItem>
  ))}
</Accordion>
```

**Vue** (`@ui-sdk/vue/accordion`)

```vue
<Accordion :default-value="['shipping']">
  <AccordionItem v-for="item in items" :key="item.value" :value="item.value">
    <AccordionHeader>
      <AccordionTrigger>{{ item.label }}</AccordionTrigger>
    </AccordionHeader>
    <AccordionPanel><p>{{ item.body }}</p></AccordionPanel>
  </AccordionItem>
</Accordion>
```

**Svelte** (`@ui-sdk/svelte/accordion`)

```svelte
<Accordion defaultValue={["shipping"]}>
  {#each items as item (item.value)}
    <AccordionItem value={item.value}>
      <AccordionHeader>
        <AccordionTrigger>{item.label}</AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel><p>{item.body}</p></AccordionPanel>
    </AccordionItem>
  {/each}
</Accordion>
```

**Foldkit** (`@foldlab/ui`)

```ts
// Model
help: Accordion.State // { key, value: string[], multiple }
// init
help: Accordion.init({ key: 'help', multiple: true })
// update
GotUiMessage: ({ message }) => ({
  model: { ...model, help: Accordion.update(model.help, message) },
})
// update also returns a confirmation Command
syncUiState({ specs: [specOf(Accordion.component, model.help)] })
// view
const accordion = Accordion.parts(model.help, h, ui) // ui = { toMessage }
accordion.root(
  {},
  [],
  items.map((item) =>
    accordion.item(
      { value: item.value },
      [],
      [
        accordion.header({}, [], [accordion.trigger({ value: item.value }, [], [item.label])]),
        accordion.panel({ value: item.value }, [], [h.p([], [item.body])]),
      ],
    ),
  ),
)
```

## Side by side: combobox

**React**

```tsx
<Combobox>
  <ComboboxLabel>Framework</ComboboxLabel>
  <ComboboxInput placeholder="Select a framework" />
  <ComboboxContent>
    <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
    <ComboboxList>
      {frameworks.map((f) => (
        <ComboboxItem key={f.value} value={f.value} label={f.label}>
          {f.label}
        </ComboboxItem>
      ))}
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

**Vue**

```vue
<Combobox>
  <ComboboxLabel>Framework</ComboboxLabel>
  <ComboboxInput placeholder="Select a framework" />
  <ComboboxContent>
    <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
    <ComboboxList>
      <ComboboxItem v-for="f in frameworks" :key="f.value" :value="f.value" :label="f.label">
        {{ f.label }}
      </ComboboxItem>
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

**Svelte**

```svelte
<Combobox>
  <ComboboxLabel>Framework</ComboboxLabel>
  <ComboboxInput placeholder="Select a framework" />
  <ComboboxContent>
    <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
    <ComboboxList>
      {#each frameworks as f (f.value)}
        <ComboboxItem value={f.value} label={f.label}>{f.label}</ComboboxItem>
      {/each}
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

**Foldkit**

```ts
// Model: Combobox.State = { key, value: string[], query, open, multiple, items }
const box = Combobox.parts(model.assigneeBox, h, ui)
const visible = Combobox.visibleItems(model.assigneeBox) // the app filters

box.root(
  {},
  [],
  [
    box.label({}, [], ['Assignee']),
    box.input({}, [h.Placeholder('Search people')], []),
    box.content(
      {},
      [],
      [
        box.list(
          {},
          [],
          visible.length === 0
            ? [box.empty({}, [], ['No matches'])]
            : visible.map((item) =>
                box.item({ value: item.value }, [], [box['item-text']({}, [], [item.label])]),
              ),
        ),
      ],
    ),
  ],
)
```

## Where we diverge

| Topic             | ui-sdk adapters                                                                                     | `@foldlab/ui`                                                                                  | Why                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Where state lives | Inside the instance, created by the root component. Optional `value` / `onValueChange` controls it. | Always in the Model, as a Schema. Always "controlled".                                         | Foldkit has one source of truth. DevTools, hydration and time travel need the state to be data. |
| Instance identity | Generated id at mount.                                                                              | `key` in the state, threaded into every part.                                                  | A counter breaks SSR and hydration. The Model decides identity.                                 |
| What a part is    | A component that reads context from its root.                                                       | A function `(props, attributes, children) => Html` from `parts(state, h, config)`.             | Foldkit has no components. A part needs no hidden context, only the state it was built from.    |
| Which parts exist | A `present` check inside the library hides parts.                                                   | The app decides, and the render phase still honors `present`. The app filters combobox items.  | The app already owns the list and its filtering.                                                |
| Output            | Re-render, or direct DOM writes (`live`, `direct`).                                                 | A new `Html` tree every `view`. Foldkit diffs it.                                              | No second renderer.                                                                             |
| Change flow       | Callback props (`onValueChange`) run during the event.                                              | One Message, `ChangedUiState { component, key, name, value, reason }`. `update` decides.       | Messages are how Foldkit moves change. Ignoring a Message refuses the change.                   |
| Events            | Core attaches its handlers.                                                                         | Core attaches its handlers through `Mount`. `h.OnClick` and friends are not part of this path. | See below.                                                                                      |
| Variants          | Class names, or `data-*`.                                                                           | `data-*` only. Panda targets `[data-slot=…]`.                                                  | No recipe props, so no `staticCss: ['*']`.                                                      |

### Two event systems, kept apart

Core's handlers are DOM listeners that `bind` attaches to a real element. They call core's `api`, and `api` calls `createChange` or `dispatch`. Those become our `Message.ChangedUiState`.

Foldkit's `h.OnClick`, `h.OnInput` and `h.OnKeyDown` are a different path: Foldkit's own vnode hooks. They are not part of the ui-sdk path.

Do not put `h.OnClick` on a slot to change the ui-sdk state. It does not reach core. Do not put `h.OnKeyDown` on a combobox input either; core's keyboard handling lives there. Put Foldkit events on elements ui-sdk does not own, or on slots with no core handler, such as the Field control's `OnInput` in the demo.

### The settled API

**Binding** (`internal/bind.ts`) is the contract between a component and the registry:

| Field                    | Purpose                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `primitive`              | The ui-sdk primitive, seen as options in, instance out.                                    |
| `options(state)`         | Model state to ui-sdk options. Pure.                                                       |
| `controlled`             | Option names the Model controls. A snapshot holds exactly these.                           |
| `callbacks`              | ui-sdk callback option to the controlled option it changes.                                |
| `fold(state, snapshot)`  | State after a snapshot lands. Pure and idempotent.                                         |
| `guard(state, snapshot)` | Synchronous veto. False means no ack. Default: allow.                                      |
| `foldkitEvents`          | Events Foldkit owns on a slot (`input` on the combobox input). Core attaches none of them. |

**Messages** (`core.ts`):

- `ChangedUiState { component, key, snapshot, reason }`: the instance acked a change. `snapshot` holds every controlled option, so applying it twice equals applying it once. `reason` is for policy, never for rebuilding state.
- `RefusedUiChange { component, key, snapshot, reason }`: the guard vetoed the change. `snapshot` is what was asked for. `update` normally ignores it.
- `TypedUiText { component, key, value }`: text typed into a Foldkit-owned input.
- `CompletedUiSync`: the `SyncUiState` Command finished. `update` ignores it.

**Two tiers of refusal.**

1. _Synchronous guard._ Policy the app knows at view time (max selections, a locked row, a value out of range) goes in `guard`. The callback computes the next snapshot and asks the guard. On false it does not change its state and does not call `setOptions`, and it emits `RefusedUiChange`. Not acking is the veto: for a controlled key core keeps the old option value, so nothing moves and no round trip happens.
2. _Asynchronous revert._ Policy only the server can answer is applied optimistically. `update` ignores or rewrites the change, and the `SyncUiState` Command pushes the Model's state back into the instance. There is a brief window where the instance holds the acked value.

**Attachment is idempotent.** An entry keeps one binding per element. Attaching the same element again unbinds the old one first, so a reused node never produces two changes per interaction. HMR dispose destroys every registry entry (`destroyAll`).

**One Mount per part.** Part props (`value` on an option, `key` on a star) come from the render call, not the DOM. A root-scoped scan could not rebuild `part(slot, props)` without re-serializing props into data attributes and keeping them in sync. Portaled parts leave the root's subtree and need their own Mount anyway.

**Phases.**

- _Render_, `internal/render.ts`: throwaway instance from options, reads state once, calls `attrs` and `present`, discards it. No `window`, no DOM, no counter.
- _Bind_, `internal/bind.ts`: registry outside the Model keyed by `component:key`. The first part to mount creates the instance. The last one to unmount destroys it.
- _`SyncUiState` Command_: `update` returns it after every ui Message.

### Where ui-sdk's shape was worth keeping

- **Slots and `data-slot`.** The part names, and the attributes they produce, are exactly what we render. Panda styles by them without an adapter.
- **`attrs` is pure.** That is why a render phase is possible at all. It is the most important design choice in ui-sdk for this adapter.
- **`controlled`, `sync` and `createChange`.** They map to "state in, Message out" almost one to one. The `callbacks` map in `defineComponent` is the whole bridge.
- **Reasons.** `details.reason` becomes `Message.reason`, so `update` can tell `item-press` from `escape-key`.
- **Field wiring.** `Field.parts(...).attributes('control', {}, ['aria-describedby', 'aria-invalid'])` lets a combobox input take the Field's description and error ids without a second component.

## Scene limitations

- **`resolveBinds`.** Every bound part is one pending Mount, and Scene demands each be resolved. `@foldlab/ui/testing` exports `resolveBinds(lift)`. It resolves every `BindUiPart` with `CompletedUiSync` and owns the cast: a Mount resolver is typed with the child Message, and Scene feeds `update` the raw result without the view's `Mount.mapMessage`, so you pass the same lift the view uses.
- **No `input` step.** Scene has `change`, not `input`. A typed value cannot be driven. Scene can assert the handler (`toHaveHandler('input')`), and Stories cover `TypedUiText` through `update`.
- **`query` reset on close.** ui-sdk reports a closed single combobox as a controlled `query` of `undefined`. `Combobox.fold` reads it as "show the chosen label". Tests need to build that snapshot by hand.
- **`@ui-sdk/core` types vs `exactOptionalPropertyTypes`.** `primitiveOf` widens each primitive in one place.

## What it makes hard to test

- **Behavior.** Stories (`update` only) cover the Message flow and validation fully, with no DOM. Real keyboard and focus behavior only exists after `bind`, so only a browser run covers it. I ran that by hand with `agent-browser`: accordion toggle, name check, combobox filter and select, multi-select.
- **View.** Scenes can check attributes, ARIA wiring and structure from the render phase. That is the payoff of the pure phase.
- **Mounts.** See Scene limitations.
- **Binding.** `packages/ui/src/bind.test.ts` runs the bind phase in happy-dom: one change per click for a doubly attached element, entry reuse across `sync`, and the guard veto.

## Scope

`@foldlab/ui` serves a throwaway-app kit, not third parties. The `Binding` fields and the four Messages stay as they are and change only when a component needs it. Dialog was the first component to need a change (below).

## Dialog

Dialog is the component that stresses the two design choices that combobox and accordion never touched: one Mount per part, and a registry keyed by the Model. It was built through the adapter (`packages/ui/src/dialog.ts`) and compared with `@foldkit/ui`'s Dialog (0.170.0) on the same page. `@foldkit/ui` asks for `effect ~4.1.0`; the template pins 4.0.0. It ran, with a peer warning.

### Mapping from `Binding` to a dialog

| Binding field                         | Dialog                                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------------------- |
| `options`                             | `{ open }`                                                                                  |
| `controlled`                          | `['open']`                                                                                  |
| `callbacks`                           | `onOpenChange` to `open`                                                                    |
| `completions` (new)                   | `onOpenChangeComplete` to `mounted`                                                         |
| `fold`                                | `open` from the snapshot. `mounted` from the snapshot when present, else `mounted or open`. |
| `renderState` (new, on the component) | `{ mounted, titled, described }` patched over a fresh instance in the render phase          |
| `guard`, `foldkitEvents`              | not used. Escape, outside press and focus are core's.                                       |

Two additions, 32 lines across `core.ts`, `internal/bind.ts` and `internal/render.ts`:

- **`renderState`.** ui-sdk keeps `mounted` in the instance. It stays true while the exit animation runs, and `present` for the content and the backdrop reads it. A fresh render instance derives `mounted` from `open`, so a pure render drops the content the moment `open` turns false, and the exit animation never plays. The Model now carries `mounted`, and the render phase patches it in. The app decides which parts exist.
- **`completions`.** `onOpenChangeComplete` is not a change request, so it bypasses the guard and sets a snapshot key. It clears `mounted` when the animation settles. `titled` and `described` follow the same pattern: ui-sdk learns them when title and description parts bind, and the Model says so up front.

### Portals and the registry

Nothing was portaled. ui-sdk core does not move DOM: `container` is a hint for adapters. The content renders inline as `position: fixed`, and core provides focus trap, inert outside and scroll lock itself. A portaled part would not need an escape from the registry either. The registry key comes from the Model (`dialog:settings`), not from DOM ancestry, so a part outside the root's subtree still finds its entry. That is the evidence for keying by Model and for one Mount per part. A root-scoped scan would have lost every portaled part. Moving a node out of Foldkit's tree with a Mount was not tried, and is not recommended: Foldkit's patch would no longer own that node.

The nested confirm dialog sits inside the parent's content subtree and gets its own key, entry and instance.

### Numbers

|                          | Adapter (`@foldlab/ui`)                                   | `@foldkit/ui` Dialog                                                                              |
| ------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Component code           | `dialog.ts`: 71 lines (58 without comments)               | none: it is the library                                                                           |
| Consumer view            | 15 lines, including the nested confirm dialog             | 25 lines (`h.submodel` and `toView`)                                                              |
| Consumer update glue     | 0: shares `GotUiMessage`                                  | 19 lines (`GotFkDialog`, open)                                                                    |
| Model                    | `State`: 5 fields                                         | `Model`: id, isOpen, isAnimated, animation (4 fields), maybeFocusSelector                         |
| Messages the app handles | the shared 4                                              | 10 plus 2 OutMessages                                                                             |
| Mounts, closed           | 1 (trigger)                                               | 0                                                                                                 |
| Mounts, open             | 6 (trigger, backdrop, content, title, description, close) | 1 (`AcquireResources`), plus an `OnUnmount` hook                                                  |
| Library code behind it   | ui-sdk popup, modal, slots and dialog: about 2100 lines   | dialog 340 code lines, animation 134, Dom helpers about 1700 (all of them, not only the dialog's) |

### Behavior, in a browser (Chrome, agent-browser)

| Scenario                                          | Adapter                                                                                                                  | `@foldkit/ui`                    |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| Open                                              | focus to close, `html` overflow hidden, siblings inert                                                                   | same                             |
| Escape                                            | exit animation plays (`data-closed`, opacity falls), content removed, lock and inert released, focus back on the trigger | same                             |
| Tab, 5 presses                                    | stays in the content                                                                                                     | stays in the panel               |
| Unmounted while closing                           | lock and inert released                                                                                                  | released                         |
| Unmounted while open                              | lock and inert released                                                                                                  | released                         |
| Reopened mid-animation                            | ends open, one lock, then closes cleanly                                                                                 | not tried                        |
| Unmounted with the Model reset in the same update | released                                                                                                                 | **`html` overflow stays hidden** |
| Two dialogs, one open and one closing (nested)    | independent: parent keeps `data-open` while the child is `data-closed`; the lock holds until the last one closes         | not applicable                   |

The `@foldkit/ui` leak needs the Model to be replaced as the view unmounts. Its `Unmounted` handler releases the resources only when the Model is still open or animating, so release follows the Model. The adapter's release follows the DOM node through the registry, and does not care what the Model says. This is a real difference, but the case is narrow (a route change that swaps the whole Model). I reproduced it twice, and it did not reproduce once the demo left the Model alone.

`bind.test.ts` asserts the registry side: two dialog entries, one open and one finishing its exit, share nothing. The completion reaches only the entry that finished.

### Testing

- **Focus trap, scroll lock, inert:** untestable in Scene or Story, for both providers. Scene renders vnodes, with no focus and no `html` style. The browser run above is the only evidence.
- **Adapter, Scene:** every bound part is a pending Mount (`resolveBinds`, with the cast owned once). Scene can assert `role`, `aria-modal`, `aria-labelledby`, and the closing phase (`data-closed`, content still present).
- **`@foldkit/ui`, Scene:** resolve one Mount, `Scene.Mount.resolve(AcquireResources, SucceededAcquireResources())`, with no cast, because the submodel boundary applies the lift.

### Sharing one Panda theme

`@foldkit/ui` does not write `data-slot`. Its parts arrive as attribute arrays through `toView`. `stamp(h, 'dialog-content')` (`packages/ui/src/stamp.ts`) returns our `data-slot` as a `ChildAttribute`, and the demo spreads it after each array. The theme in `preset.ts` keys on `dialog-backdrop` and `dialog-content`, and it styles `data-closed`, which both providers write for leave states. The two dialogs render identically. A kit can mix providers without forking the theme.

One caveat: `@foldkit/ui` renders its closed dialog's children (`<dialog>` with the panel), so `[data-slot="dialog-content"]` also matches a closed `@foldkit/ui` panel. The adapter renders nothing when closed. Select by id in tests.

### Mixing providers: where it breaks

Both providers implement scroll lock, inert and focus themselves. With an `@foldkit/ui` dialog open and an adapter dialog opened over it, closing the `@foldkit/ui` one first cleared `html` overflow while the adapter dialog was still open. Focus then went to `body`. The two locks do not coordinate. Safe: both providers on one page, with modals that never stack across providers.

### Recommendation

Use the adapter for dialogs in this kit. The dialog needed 32 lines of adapter change, not per-element portal plumbing, and it duplicates no coordination of its own: core owns focus, inert and lock. Mix in `@foldkit/ui` only for components with no adapter yet, and do not stack a modal from one provider on a modal from the other. If the kit ever needs a stack across providers, one provider's lock has to become the owner.

## Bumping `@ui-sdk/core`

`@ui-sdk/core/renderer` is not public API, so every bump is a review.

1. Change the exact version in `packages/ui/package.json` and run `pnpm install`.
2. Run `pnpm test`. `packages/ui/src/renderer-contract.test.ts` exercises `attrs`, `present`, `bind`, `part`, `setOptions`, `get` and `destroy`. A failure there names the broken export.
3. Read the release notes for `renderer`, `createChange`, `controlled` and `sync`.
4. Check the demo in a browser: accordion, single and multi combobox, same-tick double selection.
5. Touch only `internal/render.ts` and `internal/bind.ts`.

## Render cost, measured

`apps/web/bench.html?rows=N` renders one single-select combobox per row. `view` time is measured in Chrome (dev build, M-series Mac), 10 re-renders from an unrelated `Tick` Message:

| Rows | Bound parts (Mounts) | First `view` | Re-render `view` avg |
| ---- | -------------------- | ------------ | -------------------- |
| 1    | 2                    | 3.2 ms       | 0.8 ms               |
| 50   | 100                  | 3.7 ms       | 4.0 ms               |
| 200  | 400                  | 15.8 ms      | 6.6 ms               |

Baseline to beat: 50 rows, 100 mounts, 4.0 ms re-render. This page is nothing but comboboxes; a real page has one. The numbers do not separate instances built per view from parts patched per view, so the cause is open. A `renderPhase` cache keyed by component, key and controlled snapshot is the next step only if a real page regresses this.
