# Notes for upstream

## `@foldkit/ui` Dialog: scroll lock stays when the Model is replaced as the view unmounts

Version 0.170.0, with `foldkit` 0.167.0. Seen twice in Chrome.

`Dialog.update` handles `Unmounted` by releasing resources only when the Model is still open or animating (`isOpenOrAnimating`). If the update that removes the dialog's view also replaces its Model with `Dialog.init(...)`, the handler sees a closed Model and releases nothing. `Dom.lockScroll` is undone only by `CloseDialog`, so `html { overflow: hidden }` stays after the dialog is gone. Inert and focus are released by the Mount's `acquireRelease`, so only the scroll lock leaks.

```ts
// Model: { dialog: Dialog.Model, shown: boolean }
ClickedLeave: () => ({
  // The view below stops rendering the dialog in this same update.
  model: { dialog: Dialog.init({ id: 'd', isAnimated: true }), shown: false },
})
// view: model.shown ? h.submodel({ slotId: 'd', model: model.dialog, view: Dialog.view, ... }) : h.p([], ['gone'])
```

Steps: open the dialog, then dispatch `ClickedLeave`. Expected: `document.documentElement.style.overflow` is empty. Actual: `hidden`. Leaving the dialog's Model alone in the same update makes the problem disappear, because `Unmounted` then sees it open and releases.

The snippet is distilled from the demo's "Drop dialogs" button. I have not run it as a standalone program. A fix would release the scroll lock from the Mount's release, next to the inert release, so it does not depend on the Model.

## Two providers' scroll locks do not coordinate

With an `@foldkit/ui` dialog open and another provider's modal open over it, closing the `@foldkit/ui` dialog first removes `overflow: hidden` from `html` while the second modal is still open. A lock counter or a shared owner would fix it. Our answer is the stacking rule in `adapter-api.md`.

## Draft issue for `vercel-labs/ui`: a supported adapter entry point

Not filed. Title: **A supported entry point for framework adapters, and option types that survive `exactOptionalPropertyTypes`**

> `@ui-sdk/core` ships adapters for React, Vue, Svelte, Solid and web components, and they all build on `@ui-sdk/core/renderer`. Its header says it is not documented, may change with any release, and is not public API. I am writing an adapter for another framework (Foldkit, an Elm-style framework whose view is a pure function of one serialized Model), and I depend on that entry at `0.1.0-beta.7`, pinned.
>
> **1. A supported adapter entry point.** An adapter for a new framework needs the same small surface the first-party adapters use. What I call from `@ui-sdk/core/renderer`: `attrs(part, props, state)`, `present(part, props, state)` and `bind(part, el, host)` from `part.js`, plus `instance.part`, `get`, `setOptions` and `destroy` from the instance. I also read `startState` and `preview` and did not need them. Could these be documented and covered by semver, even as an explicit `@experimental` adapter surface? The things I had to learn by reading source:
>
> - `attrs` and `present` are pure given `(part, props, state)`, so a server or test renderer can compute them without a DOM. That is the property that makes a Model-driven adapter possible, and it is not written down.
> - A part's `present` can depend on state that exists only in a live instance. `mounted` stays true during the exit animation and is cleared when `animateOut` finishes. A fresh instance derives it from `open`. A pure render therefore drops the part immediately, and the adapter has to carry `mounted` itself and learn of the end from `onOpenChangeComplete`. Documenting which state keys are lifecycle, and that `onOpenChangeComplete` is the end signal, would save the next adapter author this.
> - `bind(part, el, { by: 'framework', attaches })` lets the framework own some events. It is how I leave text entry to the framework. It is only visible in `part.d.ts`.
> - `createChange` on a controlled key calls the callback and waits for the value to return through `sync`. An adapter that acks into the instance before emitting avoids a lost update on two changes in one tick. This is worth a sentence in "Handle Changes".
>
> **2. `definePrimitive`'s option types under `exactOptionalPropertyTypes`.** With that flag on, `AccordionPrimitive` is not assignable to `Primitive`: the primitive's `options` is `Record<string, PropSpec> | undefined`, and `Primitive` declares `options?: Record<string, PropSpec>`. Every adapter that stores primitives generically needs a cast. I have one, in one function:
>
> ```ts
> const primitiveOf = (primitive: (options: never) => PrimitiveInstance): Primitive =>
>   primitive as Primitive
> ```
>
> Declaring `options?: Record<string, PropSpec> | undefined` and `slots?: object | undefined` on `Primitive`, or making `definePrimitive` omit the keys it does not set, would remove the cast. I take the cast as evidence that the adapter entry is missing something: the exported types are meant for adapters to consume, and they do not accept the library's own primitives under a flag many strict projects use.
>
> Happy to send a PR for either. Versions: `@ui-sdk/core@0.1.0-beta.7`, TypeScript 7.1 beta (`tsrs`).

## Draft issue for Foldkit: Resources are not reachable from a Mount

Not filed. Foldkit 0.167.0 (also checked: 0.170.0 declarations).

Title: **Mount docs say app Resources are available in `execute`; they are not**

> The Mount guide, under "Per-Instance Args", says:
>
> > Args are only per-instance inputs. Module constants stay in lexical scope, app-wide services come from Foldkit `Resources`, Model-owned handles come from `ManagedResources`, and Effect services remain available through `yield*` inside `execute`.
>
> (https://foldkit.dev/core/mount)
>
> That reads as: an app `Resource` passed to `Runtime.makeApplication({ resources })` can be `yield*`-ed inside a Mount's `execute`. I could not make that work, and the types agree with what I saw.
>
> **What I observed**
>
> 1. **Types.** `Mount.define`'s `execute` returns `Effect<Message, never, Scope.Scope>`, and `Mount.defineStream`'s returns `Stream<Message, never, never>`. A Resource has no place in `R`.
> 2. **Runtime context.** I read `Effect.context()` inside a `defineStream` Mount, in the browser, in dev. Its keys: `effect/Scheduler`, `effect/Layer/CurrentMemoMap`, `@foldkit/DialogRuntime`, `@foldkit/RenderCommit`, `effect/Scope`, `@foldkit/MountRuntime`, `@foldkit/MountTracker`, `@foldkit/Dispatch`. None of the app's Resources, though the same Resource works from a Command. `html/index.js` runs Mounts with `Effect.runForkWith(capturedContext)`; I did not trace why that context lacks the Resources.
> 3. **Lazy layers.** A Resource layer is built when the first Command that needs it runs. I wrapped the layer in `Layer.effect(Tag, Effect.acquireRelease(...))` and logged in the acquire. It never ran before the first render's Mounts, and did not run at all until a Command used the service.
>
> **What I would like**
>
> Either Resources reachable from Mount contexts, with the types to match, or docs that say plainly that they are not, plus the intended pattern for element-scoped work that needs an app service. Today the only routes I found are a Message to `update` and a Command (the Mount has no handle on the service), or a module-level singleton, which defeats the point of a Resource.
>
> The use case: a UI library whose Mount binds a live behavior instance to an element. The instances live in an app-scoped registry, and the Commands that sync the Model into them need the same registry the Mounts use.
>
> **Separate observation: the container node is replaced while the app runs**
>
> With `Runtime.makeApplication({ container })`, the container element does not stay in the document. After the first render, `document.getElementById('root')` is `null` and the view's root element sits in its place. (`renderer.js` patches the container out and restores it on teardown.) Anything attached to the container node, such as an expando property or an observer, is gone by the time the first Mount runs. The `container` option docs do not mention it. Worth a sentence, since anyone who reaches for the container as a stable anchor will lose it. What stays is the container's parent.
