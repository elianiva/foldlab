# Adapter API: ui-sdk for Foldkit

This page compares the `@foldlab/adapter` with the ui-sdk React, Vue and Svelte adapters, for a combobox and an accordion. It then lists where the shapes diverge, and why.

`@foldlab/adapter` pins `@ui-sdk/core@0.1.0-beta.7`. The adapter reads `@ui-sdk/core/renderer`, which ui-sdk says is not public API. Three source files import it:

- `packages/adapter/src/internal/render.ts` – the render phase.
- `packages/adapter/src/internal/bind.ts` – the bind phase.
- `packages/adapter/src/segmented-input.ts` – the shared date and time segment state.

No ui-sdk type appears in the public API.

## The constraint

Foldkit's `view` receives `(model, h)`. It cannot read a store, and the Model is a serialized Schema. ui-sdk computes attributes from a store that lives in an instance, and `present` decides which parts exist.

So the adapter keeps the instance out of the Model and out of the view. State is plain data in the Model. The adapter turns that data into attributes in a step that is pure given the Model, and into behavior in a separate step.

```
Model slice ──options()──► render phase (pure given the Model) ──► attributes ──► Html
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

**Foldkit** (`@foldlab/adapter`)

```ts
// Model
help: Accordion.State // { key, value: string[], multiple }
// init
help: Accordion.init({ key: 'help', multiple: true })
// update
GotUiMessage: ({ message }) => ({
  model: { ...model, help: Accordion.update(model.help, message) },
})
// update also returns a confirmation Command (the hand-wired path; `Ui.define` does this for you, see kit.md)
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

| Topic             | ui-sdk adapters                                                                                     | `@foldlab/adapter`                                                                             | Why                                                                                             |
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

**Attachment is idempotent.** An entry keeps one binding per element. Attaching the same element again unbinds the old one first, so a reused node never produces two changes per interaction. The registry is a value that the app provides as a Foldkit Resource, so it closes with the app's scope. There is no module-level state and no reset hook. See [kit.md](kit.md#the-registry).

**One Mount per part.** Part props (`value` on an option, `key` on a star) come from the render call, not the DOM. A root-scoped scan could not rebuild `part(slot, props)` without re-serializing props into data attributes and keeping them in sync. Portaled parts leave the root's subtree and need their own Mount anyway.

**Phases.**

- _Render_, `internal/render.ts`: throwaway instance from options, reads state once, calls `attrs` and `present`, discards it. No `window`, no DOM, no counter.
- _Bind_, `internal/bind.ts`: a `Registry` value, outside the Model, keyed by `component:key`. The first part to mount creates the instance. The last one to unmount destroys it.
- _`SyncUiState` Command_: `update` returns it after every ui Message.

### Where ui-sdk's shape was worth keeping

- **Slots and `data-slot`.** The part names, and the attributes they produce, are exactly what we render. Panda styles by them without an adapter.
- **`attrs` is pure.** That is why a render phase is possible at all. It is the most important design choice in ui-sdk for this adapter.
- **`controlled`, `sync` and `createChange`.** They map to "state in, Message out" almost one to one. The `callbacks` map in `defineComponent` is the whole bridge.
- **Reasons.** `details.reason` becomes `Message.reason`, so `update` can tell `item-press` from `escape-key`.
- **Field wiring.** `Field.parts(...).attributes('control', {}, ['aria-describedby', 'aria-invalid'])` lets a combobox input take the Field's description and error ids without a second component.

## Scene limitations

- **`resolveBinds`.** Every bound part is one pending Mount, and Scene demands each be resolved. `@foldlab/adapter/testing` exports `resolveBinds(lift)`. It resolves every `BindUiPart` with `CompletedUiSync` and owns the cast: a Mount resolver is typed with the child Message, and Scene feeds `update` the raw result without the view's `Mount.mapMessage`, so you pass the same lift the view uses.
- **No `input` step.** Scene has `change`, not `input`. A typed value cannot be driven. Scene can assert the handler (`toHaveHandler('input')`), and Stories cover `TypedUiText` through `update`.
- **`query` reset on close.** ui-sdk reports a closed single combobox as a controlled `query` of `undefined`. `Combobox.fold` reads it as "show the chosen label". Tests need to build that snapshot by hand.
- **`@ui-sdk/core` types vs `exactOptionalPropertyTypes`.** `primitiveOf` widens each primitive in one place.

## What it makes hard to test

- **Behavior.** Stories (`update` only) cover the Message flow and validation fully, with no DOM. Real keyboard and focus behavior only exists after `bind`, so only a browser run covers it. I ran that by hand with `agent-browser`: accordion toggle, name check, combobox filter and select, multi-select.
- **View.** Scenes can check attributes, ARIA wiring and structure from the render phase. That is the payoff of a phase that is pure given the Model.
- **Mounts.** See Scene limitations.
- **Binding.** `packages/adapter/src/bind.test.ts` runs the bind phase in happy-dom: one change per click for a doubly attached element, entry reuse across `sync`, and the guard veto.

## Lifecycle state

**The render phase is pure given the Model, not pure given the semantic state.** A primitive whose `present` depends on a leave transition holds state that no semantic field can derive. `open` says what the user asked for. Whether the content is still on screen while it leaves is lifecycle, and only the instance's animation knows when it ends. Three parts handle it, once, for every such component:

1. **The lifecycle bit lives in the Model.** Add a field (`mounted`) next to the semantic one (`open`). `fold` sets it to true when the semantic state turns on, and leaves it alone when the semantic state turns off.
2. **`renderState` patches it over the throwaway render instance.** A fresh instance derives the bit from the semantic state, so it would drop the part the moment `open` turned false. `renderState: (state) => ({ mounted: state.mounted })` makes `present` and `attrs` read what the Model says. The app decides which parts exist.
3. **`completions` carries the end of the animation.** The end is not a request: nothing can refuse it, so it bypasses `guard`. `completions: { onOpenChangeComplete: 'mounted' }` folds the instance's completion callback into the same snapshot key, and the Message clears the bit.

State that ui-sdk learns only when parts bind (`titled`, `described`) follows the same pattern: the Model says it up front, `renderState` patches it in.

Toast, drawer, menu, popover and tooltip all fit this rule. Each component's section says which field is its lifecycle bit and which callback ends it, and does not restate the rule. Dialog (below) is the first.

## Scope

`@foldlab/adapter` serves a throwaway-app kit, not third parties. The `Binding` fields and the four Messages stay as they are and change only when a component needs it. Dialog was the first component to need a change (below).

## Dialog

Dialog is the component that stresses the two design choices that combobox and accordion never touched: one Mount per part, and a registry keyed by the Model. It was built through the adapter (`packages/adapter/src/dialog.ts`) and compared with `@foldkit/ui`'s Dialog (0.170.0) on the same page. `@foldkit/ui` asks for `effect ~4.1.0`; the template pins 4.1.4. It ran, with a peer warning.

### Mapping from `Binding` to a dialog

| Binding field                         | Dialog                                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------------------- |
| `options`                             | `{ open }`                                                                                  |
| `controlled`                          | `['open']`                                                                                  |
| `callbacks`                           | `onOpenChange` to `open`                                                                    |
| `completions` (new)                   | `onOpenChangeComplete` to `mounted`                                                         |
| `fold`                                | `open` from the snapshot. `mounted` from the snapshot when present, else `mounted or open`. |
| `renderState` (new, on the component) | `{ mounted, titled, described }` patched over a fresh instance in the render phase          |
| `lockSlot` (new)                      | `content`: the slot whose bind takes the scroll lock, for the [stacking check](#stacking)   |
| `guard`, `foldkitEvents`              | not used. Escape, outside press and focus are core's.                                       |

Two additions, 32 lines across `core.ts`, `internal/bind.ts` and `internal/render.ts`, implement the [lifecycle rule](#lifecycle-state). For dialog the lifecycle bit is `mounted` (ended by `onOpenChangeComplete`), and `titled` and `described` ride on `renderState` too. ui-sdk keeps `mounted` in the instance and clears it when the exit animation settles. Without the rule, the content vanished the moment `open` turned false and the exit never played.

### Portals and the registry

Nothing was portaled. ui-sdk core does not move DOM: `container` is a hint for adapters. The content renders inline as `position: fixed`, and core provides focus trap, inert outside and scroll lock itself. A portaled part would not need an escape from the registry either. The registry key comes from the Model (`dialog:settings`), not from DOM ancestry, so a part outside the root's subtree still finds its entry. That is the evidence for keying by Model and for one Mount per part. A root-scoped scan would have lost every portaled part. Moving a node out of Foldkit's tree with a Mount was not tried, and is not recommended: Foldkit's patch would no longer own that node.

The nested confirm dialog sits inside the parent's content subtree and gets its own key, entry and instance.

### Numbers

|                          | Adapter (`@foldlab/adapter`)                              | `@foldkit/ui` Dialog                                                                              |
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

`@foldkit/ui` does not write `data-slot`. Its parts arrive as attribute arrays through `toView`. `stamp(h, 'dialog-content')` (`packages/adapter/src/stamp.ts`) returns our `data-slot` as a `ChildAttribute`, and the demo spreads it after each array. The theme in `preset.ts` keys on `dialog-backdrop` and `dialog-content`, and it styles `data-closed`, which both providers write for leave states. The two dialogs render identically. A kit can mix providers without forking the theme.

One caveat: `@foldkit/ui` renders its closed dialog's children (`<dialog>` with the panel), so `[data-slot="dialog-content"]` also matches a closed `@foldkit/ui` panel. The adapter renders nothing when closed. Select by id in tests.

### Recommendation

Use the adapter for dialogs in this kit. The dialog needed 32 lines of adapter change, not per-element portal plumbing, and it duplicates no coordination of its own: core owns focus, inert and lock. See [Stacking](#stacking) for how it coexists with `@foldkit/ui`, and [Dependencies](#dependencies) for where `@foldkit/ui` lives.

## Stacking

**One provider per stacking domain, and the adapter owns modals.** A stacking domain is a set of overlays that lock scroll, make the page inert and trap focus together: every modal on a page. Both providers implement those themselves, and the implementations do not coordinate. With an `@foldkit/ui` dialog open and an adapter dialog opened over it, closing the `@foldkit/ui` one first cleared `html` overflow while the adapter dialog was still open, and focus fell to `body`.

This is a correctness argument, not a preference. The adapter's release follows the DOM node through the registry. `@foldkit/ui`'s release follows the Model: its `Unmounted` handler releases only while the Model is still open or animating. Replace the Model in the same update that unmounts the view and `overflow: hidden` stays on `html`. Notes and a reproduction for the upstream issue: [upstream-notes.md](upstream-notes.md).

**Dev-mode check.** When an adapter modal binds (the component's `lockSlot`) and the document already carries a scroll lock that nobody in our registry wrote, `console.warn` fires once. Core writes the lock and we cannot hook the write, so we stamp `data-foldlab-lock` on `<html>` while any adapter modal holds it. A lock with no marker is someone else's. The check runs before core binds, and only when `import.meta.env.DEV` is set. It covers the case `@foldkit/ui` first, adapter second. The reverse order is not detected. Tests: `bind.test.ts` (foreign lock warns once, own lock does not, the marker leaves with the last modal) and a browser run of both orders.

We do not patch `@foldkit/ui`.

## Dependencies

The kit's peer surface is `foldkit` and `effect`, and nothing else. `@foldkit/ui` is a dev dependency of `apps/web`, where the comparison lives. It asks for `effect ~4.1.0` and the template pins 4.1.4, so the 4.0 versus 4.1 question is now a demo question. If `@foldkit/ui` ever has to enter the shipped surface, bump `effect` to 4.1 and prove it with check, typecheck, tests and build in the same commit.

`packages/adapter/src/boundaries.test.ts` enforces this: `@foldkit/ui` appears in no manifest field of the kit and no kit source imports it, and the peer surface is exactly `effect` and `foldkit`. `@ui-sdk/core` is the kit's one runtime dependency, pinned.

## Bumping `@ui-sdk/core`

`@ui-sdk/core/renderer` is not public API, so every bump is a review.

1. Change the exact version in `packages/adapter/package.json` and run `pnpm install`.
2. Run `pnpm test`. `packages/adapter/src/renderer-contract.test.ts` exercises `attrs`, `present`, `bind`, `part`, `setOptions`, `get` and `destroy`. A failure there names the broken export.
3. Read the release notes for `renderer`, `createChange`, `controlled` and `sync`.
4. Check the demo in a browser: accordion, single and multi combobox, same-tick double selection.
5. Touch only `internal/render.ts`, `internal/bind.ts` and `segmented-input.ts`.

## Render cost, measured

`apps/web/bench.html?rows=N` renders one single-select combobox per row. `view` time is measured in Chrome (dev build, M-series Mac), 10 re-renders from an unrelated `Tick` Message:

| Rows | Bound parts (Mounts) | First `view` | Re-render `view` avg |
| ---- | -------------------- | ------------ | -------------------- |
| 1    | 2                    | 3.2 ms       | 0.8 ms               |
| 50   | 100                  | 3.7 ms       | 4.0 ms               |
| 200  | 400                  | 15.8 ms      | 6.6 ms               |

Baseline to beat: 50 rows, 100 mounts, 4.0 ms re-render. This page is nothing but comboboxes; a real page has one. The numbers do not separate instances built per view from parts patched per view, so the cause is open. A `renderPhase` cache keyed by component, key and controlled snapshot is the next step only if a real page regresses this.

## Behaviours React has

Seven cross-cutting behaviours from the ui-sdk React adapter, and what each became. `behaviours.test.ts` covers each one.

### Swapping a part's element (`render`)

React's `render` prop swaps the element a part makes. A part here takes a fourth argument, `{ render: tag }`, with a tag from the `Tag` union:

```ts
accordion.trigger({ value: 'b' }, [h.Href('/b')], ['Pricing'], { render: 'a' })
```

The attributes, the key and the Mount are the part's own: only the `h` constructor changes. The tag is part of the element key, so Foldkit never patches a `button` into an `a` in place. A `button` part rendered as anything else loses `type` and says `aria-disabled` instead of `disabled`. `render` is not an `as` prop, because `PartProps` go to ui-sdk. The options are Foldkit's.

### Controllers

ui-sdk's `createXController()` is a handle that forwards calls to the attached instance's `api`. A handle cannot live in the Model, so the same calls are a Command. `callController` finds the live instance in the registry by component and key (`liveInstance`) and calls `api[method](...args)`. `controllerOf(component, state)` builds the Commands for one instance:

```ts
const dialog = Controllers.controllerOf(Dialog.component, model.ui.settings)
return { model, commands: [dialog.open()] } // also close(), setValue(v), focus(), call('setOpen', true)
```

It works for any component whose primitive's `api` has the method: `call` is the general form, the rest are names for the common ones. The call runs through the instance's own callbacks, so it passes the guard like a click, and the Model hears it as `ChangedUiState` with the reason `imperative`. Nothing is mounted, or no such method: it does nothing, as a controller does before it attaches. The Command's completion is `CompletedUiSync`, which `update` ignores. What the `controller` option adds in React, a trigger outside the popup that finds it, is not needed: a trigger is any element whose Message opens the popup through the Model.

### Change details: reason and cancel

`details.reason` travels three ways:

- `Message.ChangedUiState.reason` and `RefusedUiChange.reason`, as before.
- `makeUpdate` passes it to `fold(state, snapshot, reason)`, for policy that needs to know why (a `dirty` flag, a log). It never rebuilds state: the snapshot does that. `reason` is optional there, because direct callers have none.
- The guard gets it: `guard(state, snapshot, reason)`.

`details.cancel()` is the guard returning false. Core ignores `cancel` on a controlled component anyway, since the next value comes from the app, so refusing means not acking, and that is what the guard does before the instance moves. "Discard changes?" on a dialog:

```ts
guard: (state, snapshot, reason) =>
  !(state.dirty && snapshot['open'] === false && isDismissal(reason))
```

`isDismissal` is ui-sdk's, re-exported by `@foldlab/adapter`. A vetoed change arrives as `RefusedUiChange` with the same reason, so `update` can show why. `details.source` and `details.event` do not cross: a Message is data, and `source` is for analytics, never behavior.

### Uncontrolled and default values

Every component takes defaults through `init` (`Accordion.init({ key, value: ['a'] })`), and the Model always holds the state. Instance-held state (React's `defaultValue`) is not an option here, because the render phase builds attributes from the Model: a Model that does not follow the instance would draw a stale view on the next render.

What an app can skip is the confirmation. `Ui.define(entries, { uncontrolled: ['faq'] })` still folds the entry's changes into the Model, but never returns a sync for it. The instance keeps what it acked and the Model follows. With every entry listed, `update` returns no Commands, so the app wires one handler and no Command mapping. The cost: nothing reverts a change `update` would refuse, and an app that sets an uncontrolled entry's Model by hand does not reach the instance. `guard` still vetoes, because it runs in the instance.

### Generics

React types `Select`, `Combobox`, `Listbox`, `Tabs`, `Radio` and `SegmentedControl` over their value type. Our `State` holds `string` and does not become generic, for three reasons. The Model is a Schema, so a value must survive encoding, and a generic `T` needs a Schema per use. The registry, the Message `snapshot` and the sync spec are `unknown` by design: one Message union serves every component. A generic `State<T>` would make `Component<State<T>, Slot>` invariant in `T`, which breaks `Ui.define`'s entries. A typed value is a Schema at the edge of the app: `Schema.Literals(['free', 'pro'])`, decoded from `state.value` where the app reads it.

### Agent surface

`Agent` re-exports `createAgent`, `agentTools` and `registerTools`, with their types. The agent listens to every instance as it is created, and ours are ordinary ui-sdk instances, so `snapshot`, `query` and `act` see the registry's components. An agent's `setOpen` reaches the instance's callbacks with the source `agent`, passes the guard, and arrives as `ChangedUiState`. Create the agent at module level, before the first view: it only hears components made after it.

Two Streams for Subscriptions: `registerAgentTools(agent, { allow })` registers the tools with the browser's agent while the Stream runs (`allow` is required, as in ui-sdk), and `watchAgent(agent, toMessage)` turns every change, from a person or an agent, into a Message.

### Page-level modules

| Module                             | Adapter                                                                                                                                                                                                                                        |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shortcuts`                        | `Shortcuts.shortcutStream(keys, toMessage, options)`: a Stream for a Subscription. `setShortcutScope`: a Command. `shortcutHint(keys, apple)`: the text and `aria-keyshortcuts`, with the platform as an argument because a view must be pure. |
| `overlays`                         | `Overlays.watchOverlays(toMessage, registry?)`: a Stream of the entries that marks a host as attached. No host is shipped.                                                                                                                     |
| `preferences` (`createPreference`) | `Preferences.watchPreferences(list, toMessage)`: writes global ones on `<html>`, reports every value by attribute. `preferencesScript(list)` goes inline in `index.html` for the first paint.                                                  |

Why `overlays` stops at the Stream: `confirm()` returns a promise that its host settles through the entry's controller. A controller object cannot be a Model field, so the host React ships (`OverlayHost`) has no Model-pure form. Render a Model-owned `AlertDialog` for a question, and drive it with `controllerOf`. `toast()` into the shared registry has the same reason: the kit's `Toast` owns its toaster instead.

Why preferences have no element: React's `Preferences` sets `data-*` on a wrapper that has `display: contents`. A Foldkit view puts `h.Attribute(attribute, value)` on its own element, from the values in the Model, and `<html>` is reached by the Stream because a view cannot.
