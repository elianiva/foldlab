import { definePreset } from '@pandacss/dev'

// Every component rule targets the `data-*` attributes ui-sdk writes, so no part
// needs a class name and no recipe prop has to be known at build time. Variants
// are attributes (`data-size`, `data-variant`) the app sets. The look is plain
// on purpose: neutral colors on CSS variables, one accent, system fonts.
const hit = (selector: string) => `${selector}:not([disabled]):not([aria-disabled="true"])`

export const foldlab = definePreset({
  name: 'foldlab',
  globalCss: {
    ':root': {
      '--fl-bg': '#f6f7f9',
      '--fl-surface': '#ffffff',
      '--fl-text': '#171a21',
      '--fl-muted': '#5d6675',
      '--fl-border': '#d5d9e0',
      '--fl-accent': '#2f5bea',
      '--fl-accent-soft': '#e8edfd',
      '--fl-danger': '#c4262e',
      '--fl-radius': '8px',
      colorScheme: 'light',
    },
    body: {
      background: 'var(--fl-bg)',
      color: 'var(--fl-text)',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
      lineHeight: 1.5,
    },
    h1: { fontSize: '1.5rem', fontWeight: 650, letterSpacing: '-0.01em' },
    h2: { fontSize: '1.05rem', fontWeight: 600 },
    '[hidden]': { display: 'none !important' },
    ':focus-visible': {
      outline: '2px solid var(--fl-accent)',
      outlineOffset: '2px',
    },

    // Buttons and inputs. The demo renders plain elements, so these are element rules.
    button: {
      font: 'inherit',
      padding: '0.5rem 0.9rem',
      border: '1px solid var(--fl-border)',
      borderRadius: 'var(--fl-radius)',
      background: 'var(--fl-surface)',
      color: 'inherit',
      cursor: 'pointer',
      transition: 'background 120ms, border-color 120ms',
    },
    [hit('button:hover')]: { background: 'var(--fl-accent-soft)', borderColor: 'var(--fl-accent)' },
    'input, select': {
      font: 'inherit',
      padding: '0.5rem 0.65rem',
      border: '1px solid var(--fl-border)',
      borderRadius: 'var(--fl-radius)',
      background: 'var(--fl-surface)',
      color: 'inherit',
      width: '100%',
    },
    'input:focus-visible': { outlineOffset: '0', borderColor: 'var(--fl-accent)' },
    'input::placeholder': { color: 'var(--fl-muted)' },

    // Field
    '[data-slot="field"]': { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
    '[data-slot="field-label"], [data-slot="combobox-label"]': {
      fontWeight: 550,
      fontSize: '0.9rem',
    },
    '[data-slot="field-description"]': { color: 'var(--fl-muted)', fontSize: '0.85rem', margin: 0 },
    '[data-slot="field-error"]': { color: 'var(--fl-danger)', fontSize: '0.85rem', margin: 0 },
    '[data-slot="field-control"][data-invalid], [data-slot="combobox-input"][data-invalid]': {
      borderColor: 'var(--fl-danger)',
    },

    // Combobox
    '[data-slot="combobox"]': {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.35rem',
    },
    '[data-slot="combobox-content"]': {
      position: 'absolute',
      top: '100%',
      insetInlineStart: 0,
      zIndex: 5,
      marginTop: '0.25rem',
      minWidth: '100%',
      maxHeight: '14rem',
      overflow: 'auto',
      padding: '0.25rem',
      border: '1px solid var(--fl-border)',
      borderRadius: 'var(--fl-radius)',
      background: 'var(--fl-surface)',
      boxShadow: '0 8px 24px rgb(23 26 33 / 0.12)',
    },
    '[data-slot="combobox-item"]': {
      cursor: 'pointer',
      padding: '0.4rem 0.6rem',
      borderRadius: '6px',
    },
    '[data-slot="combobox-item"][data-highlighted]': { background: 'var(--fl-accent-soft)' },
    '[data-slot="combobox-item"][data-selected]': { fontWeight: 600, color: 'var(--fl-accent)' },
    '[data-slot="combobox-empty"]': { padding: '0.4rem 0.6rem', color: 'var(--fl-muted)' },

    // Accordion
    '[data-slot="accordion"]': {
      border: '1px solid var(--fl-border)',
      borderRadius: 'var(--fl-radius)',
      background: 'var(--fl-surface)',
      overflow: 'hidden',
    },
    '[data-slot="accordion-item"] + [data-slot="accordion-item"]': {
      borderTop: '1px solid var(--fl-border)',
    },
    '[data-slot="accordion-header"]': { margin: 0, fontSize: 'inherit' },
    '[data-slot="accordion-trigger"]': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      padding: '0.75rem 1rem',
      border: 0,
      borderRadius: 0,
      background: 'transparent',
      fontWeight: 550,
      textAlign: 'start',
      cursor: 'pointer',
    },
    '[data-slot="accordion-trigger"]::after': {
      content: '"+"',
      color: 'var(--fl-muted)',
      fontWeight: 400,
    },
    '[data-slot="accordion-trigger"][data-open]::after': { content: '"\\2212"' },
    '[data-slot="accordion-panel"]': { padding: '0 1rem 0.9rem', color: 'var(--fl-muted)' },
    '[data-slot="accordion-panel"] p': { margin: 0 },

    // Dialog. One theme for both providers: ui-sdk's parts and `@foldkit/ui`'s, stamped.
    '[data-slot="dialog-backdrop"]': {
      position: 'fixed',
      inset: 0,
      background: 'rgb(15 18 25 / 0.5)',
      transition: 'opacity 150ms',
    },
    '[data-slot="dialog-content"]': {
      position: 'fixed',
      top: '50%',
      left: '50%',
      translate: '-50% -50%',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      width: 'min(26rem, calc(100vw - 2rem))',
      padding: '1.25rem',
      border: '1px solid var(--fl-border)',
      borderRadius: '12px',
      background: 'var(--fl-surface)',
      boxShadow: '0 24px 64px rgb(15 18 25 / 0.3)',
      transition: 'opacity 150ms',
    },
    '[data-slot="dialog-title"]': { margin: 0, fontSize: '1.1rem', fontWeight: 650 },
    '[data-slot="dialog-description"]': { margin: 0, color: 'var(--fl-muted)' },
    '[data-slot="dialog-backdrop"][data-closed], [data-slot="dialog-content"][data-closed]': {
      opacity: 0,
    },
  },
})
