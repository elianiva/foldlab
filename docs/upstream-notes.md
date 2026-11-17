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
