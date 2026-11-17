import { definePreset } from '@pandacss/dev'

// Styling hooks only: every rule targets the `data-*` attributes ui-sdk writes,
// so no part needs a class name and no recipe prop has to be known at build
// time. Variants are attributes (`data-size`, `data-variant`) the app sets.
// There is deliberately no design here: just what the behavior needs to be usable.
export const foldlab = definePreset({
  name: 'foldlab',
  globalCss: {
    '[hidden]': { display: 'none !important' },
    '[data-slot^="accordion-trigger"], [data-slot="combobox-trigger"], [data-slot="combobox-clear"]':
      {
        cursor: 'pointer',
      },
    '[data-slot="accordion-trigger"]': { display: 'block', width: '100%', textAlign: 'start' },
    '[data-slot="combobox"]': { position: 'relative' },
    '[data-slot="combobox-content"]': {
      position: 'absolute',
      zIndex: 1,
      insetInlineStart: 0,
      border: '1px solid currentColor',
      background: 'Canvas',
      color: 'CanvasText',
      minWidth: '100%',
    },
    '[data-slot="combobox-item"]': { cursor: 'pointer', padding: '0.25rem 0.5rem' },
    '[data-slot="combobox-item"][data-highlighted]': {
      background: 'Highlight',
      color: 'HighlightText',
    },
    '[data-slot="combobox-item"][data-selected]': { fontWeight: 'bold' },
    '[data-slot="field-error"]': { color: 'crimson' },
    '[data-slot="field-control"][data-invalid], [data-slot="combobox-input"][data-invalid]': {
      borderColor: 'crimson',
    },
    // One theme for both providers: ui-sdk's parts and `@foldkit/ui`'s, stamped.
    '[data-slot="dialog-backdrop"]': {
      position: 'fixed',
      inset: 0,
      background: 'rgb(0 0 0 / 0.4)',
      transition: 'opacity 150ms',
    },
    '[data-slot="dialog-content"]': {
      position: 'fixed',
      top: '50%',
      left: '50%',
      translate: '-50% -50%',
      minWidth: '20rem',
      padding: '1rem',
      border: '1px solid currentColor',
      background: 'Canvas',
      color: 'CanvasText',
      transition: 'opacity 150ms',
    },
    '[data-slot="dialog-backdrop"][data-closed], [data-slot="dialog-content"][data-closed]': {
      opacity: 0,
    },
    ':focus-visible': { outline: '2px solid currentColor', outlineOffset: '2px' },
  },
})
