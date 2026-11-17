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

### What the adapter has

- **Render phase**, `internal/render.ts`. Builds a throwaway instance from options, reads state once, calls `attrs` and `present` from the renderer entry, and discards it. No `window`, no DOM, no counter.
- **Bind phase**, `internal/bind.ts`. A registry outside the Model, keyed by `component:key`. The first part to mount creates the instance. The last one to unmount destroys it.
- **`Mount`**, `BindUiPart`. One per part that needs a live element. Its lifetime follows the DOM node, and its stream carries `ChangedUiState` Messages out.
- **`syncUiState`**. Pushes the Model's state into mounted instances with `setOptions`.

### Where ui-sdk's shape was worth keeping

- **Slots and `data-slot`.** The part names, and the attributes they produce, are exactly what we render. Panda styles by them without an adapter.
- **`attrs` is pure.** That is why a render phase is possible at all. It is the most important design choice in ui-sdk for this adapter.
- **`controlled`, `sync` and `createChange`.** They map to "state in, Message out" almost one to one. The `callbacks` map in `defineComponent` is the whole bridge.
- **Reasons.** `details.reason` becomes `Message.reason`, so `update` can tell `item-press` from `escape-key`.
- **Field wiring.** `Field.parts(...).attributes('control', {}, ['aria-describedby', 'aria-invalid'])` lets a combobox input take the Field's description and error ids without a second component.

## Decisions and open problems

1. **Acks happen in bind.** On a controlled key, core's `createChange` calls the callback and waits for the value to return through `sync`. The bind callback writes the accepted value into the instance first (`setOptions`), then emits `ChangedUiState` with the full controlled snapshot. A second interaction in the same tick reads the acked value. Messages are idempotent and order-independent. `reason` is for policy, never for rebuilding state.
2. **`SyncUiState` is a Command, not a Subscription.** `update` returns it after every ui Message. It confirms the ack, or reverts the instance when `update` ignored the change.
3. **Text entry is Foldkit's.** The `text` slot (the combobox input) gets `h.Value` and `h.OnInput` and a `TypedUiText` Message. Bind passes `{ by: 'framework', attaches: ['input'] }` so core attaches no `input` handler there. Core keeps keys, ARIA and focus on that element.
4. **One Mount per part, kept.** Part props come from the render call, not the DOM, so a root-scoped scan cannot rebuild `part(slot, props)`. Test noise is handled in `@foldlab/ui/testing`: `resolveBinds(lift)` resolves every pending `BindUiPart` and owns the one cast.
5. **Scene has no `input` step.** Typing a value is still not drivable, although the input now has an `OnInput` handler a Scene can assert (`toHaveHandler('input')`).
6. **Unstable `renderer` accepted**, pinned and isolated. `renderer-contract.test.ts` fails on a break.
7. **ui-sdk sends "reset" as a controlled `query` of `undefined`.** `Combobox` folds it to the chosen label in single mode.
8. **`@ui-sdk/core` types vs `exactOptionalPropertyTypes`.** `primitiveOf` widens each primitive in one place.
9. **Not fixed: a stale ack.** If `update` refuses a change, the instance holds the acked value until the Command lands. One Command round trip.

## What it makes hard to test

- **Behavior.** Stories (`update` only) cover the Message flow and validation fully, with no DOM. Real keyboard and focus behavior only exists after `bind`, so only a browser run covers it. I ran that by hand with `agent-browser`: accordion toggle, name check, combobox filter and select, multi-select.
- **View.** Scenes can check attributes, ARIA wiring and structure from the render phase. That is the payoff of the pure phase.
- **Mounts.** See items 4 and 5 above.

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

At 50 rows the render phase costs about 4 ms of an 8 ms Foldkit budget. Not worth a cache yet. If it grows, cache `renderPhase` by component, key and the controlled-state snapshot. The demo's 13 ms slow patch on first render was mostly Foldkit mounting, not the render phase.
