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
