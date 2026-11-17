# Checking that ui-sdk works through the adapter

Run the demo (`cd apps/web && pnpm dev`, or the portal service) and go down this list. The dialog rows are also covered by `pnpm --filter @foldlab/web e2e`. Everything else is manual.

## Accordion

1. Click "Why is my name taken?". It opens and the sign changes from + to a minus. Click "Date rules": both stay open (the demo is `multiple`).
2. Focus a trigger with Tab and press Enter, then Space. It toggles each time.
3. Press Arrow Down and Arrow Up on a focused trigger. Focus moves between triggers. Home and End jump to the first and last.
4. Inspect a trigger: `aria-expanded` matches its state, and `aria-controls` points at a panel whose `aria-labelledby` points back.

## Combobox, single (Assignee)

1. Click the input. The list opens. Type "ad": only Ada Lovelace and Linus Torvalds match.
2. Press Arrow Down, then Enter. The input shows "Ada Lovelace" and the list closes.
3. Reopen and press Escape. The list closes and the label stays.
4. Clear the text and tab away. The field shows "Pick an assignee" only after you submit, not while typing.
5. Type "zzz". "No matches" appears.
6. Check `role="combobox"`, `aria-expanded`, and `aria-activedescendant` while moving the highlight.

## Combobox, multi (Notification channels)

1. Open it and click Slack, then SMS quickly. "Selected: Slack, SMS", with no duplicates and none lost.
2. Click Slack again. It deselects.
3. The list stays open between picks.

## Field wiring

1. Submit the empty form. Each error appears under its field, and the field border turns red.
2. With a screen reader or the accessibility inspector, focus Owner email: its description is "Where project notices go. Enter a valid email" and `aria-invalid="true"`.
3. Fix the email. The error disappears and `aria-invalid` is gone.
4. The assignee combobox input carries the Field's `aria-describedby` too.

## Validation and the Model

1. Project name: "ab" gives a length error. "panda" shows "Checking availability" and then "already taken" after about 400 ms. "fresh" ends valid.
2. Type "panda" and then "fresh" fast. The late "taken" answer must not overwrite the newer value.
3. Start 2026-05-20, end 2026-05-10: end is invalid. Change start to 2026-05-01 and end becomes valid without touching it.

## Dialog (also in the e2e spec)

1. Open it. Focus goes inside, the page behind stops scrolling, and Tab cycles within the dialog.
2. Escape: the dialog fades, then goes. Focus returns to the button that opened it. Page scrolling works again.
3. Open "Delete project" inside it. Escape closes only the confirm. The parent stays open and the page stays locked. Escape again closes everything.
4. Click the dimmed backdrop. The top dialog closes.
5. Press Escape and click "Drop dialogs" within the fade. Scrolling must work afterwards.
6. Reopen it several times. Each time behaves the same.

## Both providers on one page

1. "Open (@foldkit/ui)" looks the same as the adapter dialog.
2. Open the `@foldkit/ui` dialog and then the adapter one over it, in dev. The console shows one `[foldlab]` warning about two scroll locks. Do not rely on stacking across providers.

## Things that would show a real bug

- A control that does nothing: look for `data-foldlab-unbound` in the DOM. In dev the console also shows a failed Mount.
- A value that jumps back after you pick it: the Model refused the change and the sync reverted it.
- Page scroll stuck after any dialog flow: `document.documentElement.style.overflow` is still `hidden`.
- Two changes per click: an element bound twice.
