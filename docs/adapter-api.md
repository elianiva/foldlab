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
     └──► syncSubscription ──► instance.setOptions(options(model))
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
// subscriptions
specOf(Accordion.component, model.help)
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
- **`syncSubscription`**. Pushes the Model's state into mounted instances with `setOptions`.

### Where ui-sdk's shape was worth keeping

- **Slots and `data-slot`.** The part names, and the attributes they produce, are exactly what we render. Panda styles by them without an adapter.
- **`attrs` is pure.** That is why a render phase is possible at all. It is the most important design choice in ui-sdk for this adapter.
- **`controlled`, `sync` and `createChange`.** They map to "state in, Message out" almost one to one. The `callbacks` map in `defineComponent` is the whole bridge.
- **Reasons.** `details.reason` becomes `Message.reason`, so `update` can tell `item-press` from `escape-key`.
- **Field wiring.** `Field.parts(...).attributes('control', {}, ['aria-describedby', 'aria-invalid'])` lets a combobox input take the Field's description and error ids without a second component.

## Problems we found

1. **The Model round trip is asynchronous.** The instance sees a new value only after `update`, then the subscription. Two selections in the same tick lose the first one. With a 600 ms gap between clicks, multi-select works. A real user is slower, but a fast keyboard sequence may beat it (not tested). Fix candidates: apply the change to the instance immediately and reconcile on the next sync, or keep a local optimistic copy in the registry.
2. **`Subscription` as a push channel is off-label.** `syncSubscription` has no stream. It runs a side effect when its dependencies change. Foldkit's docs prefer a Command from `update`. A Command per `GotUiMessage` would remove the Subscription, but the app would have to emit it.
3. **Render cost.** Every `view` builds one ui-sdk instance per `parts(...)` call. The demo has 5 of them. That works at this size, and Foldkit already warned `Slow patch: 13.5ms (budget: 8ms)` on first render. Memoizing by state with `createLazy` is the likely fix.
4. **Scene wants every Mount resolved.** Each bound part is one Mount, so the demo's view has 13. The scene test needs `resolveBinds(13)`. Binding only the root slot (and handling the rest by delegation) would cut that to one per component.
5. **Scene cannot type.** It has `change` but no `input` step, and our controls use `OnInput`. The scene test builds the invalid state through `update`, then checks the view.
6. **Message typing.** `Scene.Mount.resolve(BindPart, …)` types the result as the raw ui Message, but the view maps it into the app's Message. The test needs a cast.
7. **ui-sdk sends "reset" as a `query` change with no value.** A single-mode combobox must treat it as "show the selected label". `Combobox.update` handles it.
8. **`@ui-sdk/core` types vs `exactOptionalPropertyTypes`.** `primitiveOf` widens each primitive in one place.
9. **`renderer` is unstable.** Pinning the version holds it for now. A beta bump needs a pass over two files.

## What it makes hard to test

- **Behavior.** Stories (`update` only) cover the Message flow and validation fully, with no DOM. Real keyboard and focus behavior only exists after `bind`, so only a browser run covers it. I ran that by hand with `agent-browser`: accordion toggle, name check, combobox filter and select, multi-select.
- **View.** Scenes can check attributes, ARIA wiring and structure from the render phase. That is the payoff of the pure phase.
- **Mounts.** See items 4 to 6 above.
