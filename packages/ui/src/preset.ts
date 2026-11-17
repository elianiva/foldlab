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

    // ── Elements (no behavior) ──
    '[data-slot="button"]': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.4rem',
      fontWeight: 500,
      whiteSpace: 'nowrap',
    },
    '[data-slot="button"][data-size="sm"]': { padding: '0.3rem 0.65rem', fontSize: '0.85rem' },
    '[data-slot="button"][data-size="lg"]': { padding: '0.65rem 1.2rem', fontSize: '1.05rem' },
    '[data-slot="button"][data-shape="square"]': {
      padding: 0,
      width: '2.25rem',
      height: '2.25rem',
    },
    '[data-slot="button"][data-shape="square"][data-size="sm"]': {
      width: '1.8rem',
      height: '1.8rem',
    },
    '[data-slot="button"][data-shape="square"][data-size="lg"]': {
      width: '2.8rem',
      height: '2.8rem',
    },
    '[data-slot="button"][data-variant="primary"]': {
      background: 'var(--fl-accent)',
      borderColor: 'var(--fl-accent)',
      color: '#fff',
    },
    [hit('[data-slot="button"][data-variant="primary"]:hover')]: {
      background: '#244ad0',
      borderColor: '#244ad0',
    },
    '[data-slot="button"][data-variant="ghost"]': {
      background: 'transparent',
      borderColor: 'transparent',
    },
    '[data-slot="button"][data-variant="destructive"]': {
      background: 'var(--fl-danger)',
      borderColor: 'var(--fl-danger)',
      color: '#fff',
    },
    [hit('[data-slot="button"][data-variant="destructive"]:hover')]: {
      background: '#a31f26',
      borderColor: '#a31f26',
    },
    '[data-slot="button"]:disabled': { opacity: 0.5, cursor: 'not-allowed' },
    '[data-slot="button-group"]': { display: 'inline-flex' },
    '[data-slot="button-group"] > [data-slot="button"]': { borderRadius: 0 },
    '[data-slot="button-group"] > [data-slot="button"]:first-child': {
      borderStartStartRadius: 'var(--fl-radius)',
      borderEndStartRadius: 'var(--fl-radius)',
    },
    '[data-slot="button-group"] > [data-slot="button"]:last-child': {
      borderStartEndRadius: 'var(--fl-radius)',
      borderEndEndRadius: 'var(--fl-radius)',
    },
    '[data-slot="button-group"] > [data-slot="button"] + [data-slot="button"]': {
      marginInlineStart: '-1px',
    },

    '[data-slot="loader"]': {
      display: 'inline-block',
      width: '1em',
      height: '1em',
      border: '2px solid currentColor',
      borderRightColor: 'transparent',
      borderRadius: '50%',
      animation: 'fl-spin 0.7s linear infinite',
    },
    '[data-slot="loader"][data-size="lg"]': { width: '1.6em', height: '1.6em' },

    '[data-slot="badge"]': {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.1rem 0.5rem',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: 550,
      background: '#eceef2',
      color: '#3a414f',
    },
    '[data-slot="badge"][data-tone="info"]': { background: '#e8edfd', color: '#2447c0' },
    '[data-slot="badge"][data-tone="success"]': { background: '#e2f5e9', color: '#17703a' },
    '[data-slot="badge"][data-tone="warning"]': { background: '#fdf0d8', color: '#8a5a05' },
    '[data-slot="badge"][data-tone="error"]': { background: '#fbe5e6', color: '#a31f26' },

    '[data-slot="banner"]': {
      padding: '0.75rem 1rem',
      border: '1px solid var(--fl-border)',
      borderRadius: 'var(--fl-radius)',
      background: '#e8edfd',
      borderColor: '#c3cffa',
    },
    '[data-slot="banner"][data-tone="neutral"]': {
      background: '#f1f2f5',
      borderColor: 'var(--fl-border)',
    },
    '[data-slot="banner"][data-tone="success"]': { background: '#e2f5e9', borderColor: '#b5e3c6' },
    '[data-slot="banner"][data-tone="warning"]': { background: '#fdf0d8', borderColor: '#f2d9a0' },
    '[data-slot="banner"][data-tone="error"]': { background: '#fbe5e6', borderColor: '#f1b9bc' },
    '[data-slot="banner-title"]': { margin: 0, fontWeight: 600 },
    '[data-slot="banner-body"]': { fontSize: '0.92rem' },

    '[data-slot="breadcrumbs"] ol': {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.4rem',
      listStyle: 'none',
      margin: 0,
      padding: 0,
      fontSize: '0.9rem',
      color: 'var(--fl-muted)',
    },
    '[data-slot="breadcrumbs"] li + li::before': {
      content: '"/"',
      marginInlineEnd: '0.4rem',
      opacity: 0.6,
    },
    '[data-slot="breadcrumbs"] [aria-current="page"]': { color: 'var(--fl-text)', fontWeight: 550 },

    '[data-slot="empty"]': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '2rem 1rem',
      textAlign: 'center',
      border: '1px dashed var(--fl-border)',
      borderRadius: 'var(--fl-radius)',
    },
    '[data-slot="empty-title"]': { margin: 0, fontWeight: 600 },
    '[data-slot="empty-description"]': { margin: 0, color: 'var(--fl-muted)', fontSize: '0.9rem' },

    '[data-slot="label"]': { fontWeight: 550, fontSize: '0.9rem' },
    '[data-slot="label"][data-required]::after': { content: '" *"', color: 'var(--fl-danger)' },
    '[data-slot="input"][data-size="sm"]': { padding: '0.3rem 0.55rem', fontSize: '0.85rem' },
    '[data-slot="input"][data-size="lg"]': { padding: '0.7rem 0.85rem', fontSize: '1.05rem' },
    '[data-slot="input"][data-invalid]': { borderColor: 'var(--fl-danger)' },
    '[data-slot="input"]:disabled': { opacity: 0.55, cursor: 'not-allowed' },

    '[data-slot="link"]': {
      color: 'var(--fl-accent)',
      textDecoration: 'underline',
      textUnderlineOffset: '2px',
    },
    '[data-slot="link"][data-variant="plain"]': { color: 'inherit', textDecoration: 'none' },
    '[data-slot="link"]:hover': { textDecoration: 'none' },

    '[data-slot="skeleton-line"]': {
      display: 'block',
      height: '0.8rem',
      borderRadius: '4px',
      background: 'linear-gradient(90deg, #e9ebf0 25%, #f4f5f8 50%, #e9ebf0 75%)',
      backgroundSize: '200% 100%',
      animation: 'fl-shimmer 1.4s ease-in-out infinite',
    },

    '[data-slot="text"]': { margin: 0 },
    '[data-slot="text"][data-variant="heading1"]': {
      fontSize: '1.9rem',
      fontWeight: 650,
      letterSpacing: '-0.02em',
    },
    '[data-slot="text"][data-variant="heading2"]': { fontSize: '1.35rem', fontWeight: 620 },
    '[data-slot="text"][data-variant="heading3"]': { fontSize: '1.05rem', fontWeight: 600 },
    '[data-slot="text"][data-variant="secondary"]': { color: 'var(--fl-muted)' },
    '[data-slot="text"][data-variant="mono"]': {
      fontFamily: 'ui-monospace, "SF Mono", monospace',
      fontSize: '0.88rem',
    },

    '[data-slot="layer-card"]': {
      padding: '1rem 1.1rem',
      border: '1px solid var(--fl-border)',
      borderRadius: '12px',
      background: 'var(--fl-surface)',
      boxShadow: '0 1px 2px rgb(23 26 33 / 0.05)',
    },

    '[data-slot="table"]': {
      overflowX: 'auto',
      border: '1px solid var(--fl-border)',
      borderRadius: 'var(--fl-radius)',
      background: 'var(--fl-surface)',
    },
    '[data-slot="table"] table': { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
    '[data-slot="table"] th': {
      textAlign: 'start',
      padding: '0.6rem 0.9rem',
      color: 'var(--fl-muted)',
      fontWeight: 550,
      fontSize: '0.8rem',
      background: '#f8f9fb',
      borderBottom: '1px solid var(--fl-border)',
    },
    '[data-slot="table"] td': {
      padding: '0.65rem 0.9rem',
      borderBottom: '1px solid var(--fl-border)',
    },
    '[data-slot="table"] tbody tr:last-child td': { borderBottom: 0 },

    '[data-slot="meter"]': { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
    '[data-slot="meter-label"]': {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '0.85rem',
    },
    '[data-slot="meter-track"]': {
      height: '8px',
      borderRadius: '999px',
      background: '#e9ebf0',
      overflow: 'hidden',
    },
    '[data-slot="meter-indicator"]': {
      height: '100%',
      background: 'var(--fl-accent)',
      borderRadius: '999px',
    },

    '[data-slot="toolbar"]': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.3rem',
      border: '1px solid var(--fl-border)',
      borderRadius: '10px',
      background: 'var(--fl-surface)',
    },
    '[data-slot="toolbar"] [data-slot="button"]': { border: 0 },
    '[data-slot="grid"]': { display: 'grid', gap: '0.75rem', width: '100%' },
    '[data-slot="input-area"]': {
      font: 'inherit',
      width: '100%',
      padding: '0.6rem 0.7rem',
      border: '1px solid var(--fl-border)',
      borderRadius: 'var(--fl-radius)',
      background: 'var(--fl-surface)',
      resize: 'vertical',
    },
    '[data-slot="input-group"]': { display: 'flex', width: '100%' },
    '[data-slot="input-group"] > [data-slot="input"]': {
      borderStartEndRadius: 0,
      borderEndEndRadius: 0,
      flex: 1,
    },
    '[data-slot="input-group"] > [data-slot="button"]': {
      borderStartStartRadius: 0,
      borderEndStartRadius: 0,
      marginInlineStart: '-1px',
    },
    '[data-slot="code"]': {
      margin: 0,
      padding: '0.9rem 1rem',
      borderRadius: 'var(--fl-radius)',
      background: '#14171d',
      color: '#e6e9ef',
      fontFamily: 'ui-monospace, "SF Mono", monospace',
      fontSize: '0.85rem',
      overflowX: 'auto',
      width: '100%',
    },

    // ── Controlled components ──
    '[data-slot="checkbox"], [data-slot="radio"]': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '1.15rem',
      height: '1.15rem',
      padding: 0,
      border: '1.5px solid #9aa3b2',
      background: 'var(--fl-surface)',
      color: '#fff',
      transition: 'background 120ms, border-color 120ms',
    },
    '[data-slot="checkbox"]': { borderRadius: '4px' },
    '[data-slot="radio"]': { borderRadius: '50%' },
    '[data-slot="checkbox"][data-checked], [data-slot="radio"][data-checked]': {
      background: 'var(--fl-accent)',
      borderColor: 'var(--fl-accent)',
    },
    '[data-slot="checkbox"][data-checked]:hover, [data-slot="radio"][data-checked]:hover': {
      background: 'var(--fl-accent)',
    },
    '[data-slot="checkbox-indicator"]': { fontSize: '0.8rem', lineHeight: 1, visibility: 'hidden' },
    '[data-slot="checkbox-indicator"][data-checked]': { visibility: 'visible' },
    '[data-slot="radio-indicator"]': {
      width: '0.45rem',
      height: '0.45rem',
      borderRadius: '50%',
      background: '#fff',
      visibility: 'hidden',
    },
    '[data-slot="radio-indicator"][data-checked]': { visibility: 'visible' },
    '[data-slot="checkbox"][data-disabled], [data-slot="radio"][data-disabled], [data-slot="switch"][data-disabled]':
      {
        opacity: 0.5,
        cursor: 'not-allowed',
      },

    '[data-slot="switch"]': {
      position: 'relative',
      width: '2.4rem',
      height: '1.4rem',
      padding: 0,
      border: 0,
      borderRadius: '999px',
      background: '#c3c9d4',
      transition: 'background 140ms',
    },
    '[data-slot="switch"][data-checked]': { background: 'var(--fl-accent)' },
    '[data-slot="switch"]:hover': { background: '#b3bac7' },
    '[data-slot="switch"][data-checked]:hover': { background: 'var(--fl-accent)' },
    '[data-slot="switch-thumb"]': {
      position: 'absolute',
      top: '0.15rem',
      insetInlineStart: '0.15rem',
      width: '1.1rem',
      height: '1.1rem',
      borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 1px 2px rgb(0 0 0 / 0.25)',
      transition: 'transform 140ms',
    },
    '[data-slot="switch-thumb"][data-checked]': { transform: 'translateX(1rem)' },

    '[data-slot="tabs"]': { width: '100%' },
    '[data-slot="tabs-list"]': {
      display: 'flex',
      gap: '0.25rem',
      borderBottom: '1px solid var(--fl-border)',
    },
    '[data-slot="tabs-tab"]': {
      border: 0,
      borderBottom: '2px solid transparent',
      borderRadius: 0,
      background: 'transparent',
      color: 'var(--fl-muted)',
      padding: '0.55rem 0.9rem',
      marginBottom: '-1px',
    },
    '[data-slot="tabs-tab"][data-selected]': {
      color: 'var(--fl-text)',
      borderBottomColor: 'var(--fl-accent)',
      fontWeight: 550,
    },
    '[data-slot="tabs-tab"]:hover': { background: 'transparent', color: 'var(--fl-text)' },
    '[data-slot="tabs-panel"]': { padding: '1rem 0.25rem', color: 'var(--fl-muted)' },

    '[data-slot="collapsible"]': { width: '100%' },
    '[data-slot="collapsible-trigger"]': { fontWeight: 500 },
    '[data-slot="collapsible-panel"]': {
      marginTop: '0.6rem',
      padding: '0.8rem 1rem',
      border: '1px solid var(--fl-border)',
      borderRadius: 'var(--fl-radius)',
      background: '#fafbfc',
      color: 'var(--fl-muted)',
    },

    '[data-slot="slider"]': { width: '100%', maxWidth: '24rem' },
    '[data-slot="slider-control"]': {
      display: 'flex',
      alignItems: 'center',
      height: '1.5rem',
      cursor: 'pointer',
    },
    '[data-slot="slider-track"]': {
      width: '100%',
      height: '6px',
      borderRadius: '999px',
      background: '#e1e4ea',
    },
    '[data-slot="slider-indicator"]': { borderRadius: '999px', background: 'var(--fl-accent)' },
    '[data-slot="slider-thumb"]': {
      width: '1.2rem',
      height: '1.2rem',
      borderRadius: '50%',
      background: '#fff',
      border: '2px solid var(--fl-accent)',
      boxShadow: '0 1px 3px rgb(0 0 0 / 0.2)',
    },
    '[data-slot="slider-thumb"]:focus-within': {
      outline: '2px solid var(--fl-accent)',
      outlineOffset: '2px',
    },

    // ── Popups ──
    '[data-slot="tooltip-content"]': {
      zIndex: 20,
      padding: '0.3rem 0.6rem',
      borderRadius: '6px',
      background: '#1f232b',
      color: '#fff',
      fontSize: '0.8rem',
      pointerEvents: 'none',
    },
    '[data-slot="popover-content"], [data-slot="menu-content"], [data-slot="select-content"]': {
      zIndex: 20,
      border: '1px solid var(--fl-border)',
      borderRadius: '10px',
      background: 'var(--fl-surface)',
      boxShadow: '0 12px 32px rgb(23 26 33 / 0.16)',
    },
    '[data-slot="popover-content"]': {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      width: '18rem',
      padding: '1rem',
    },
    '[data-slot="popover-title"]': { margin: 0, fontSize: '1rem', fontWeight: 600 },
    '[data-slot="popover-description"]': {
      margin: 0,
      color: 'var(--fl-muted)',
      fontSize: '0.9rem',
    },
    '[data-slot="menu-content"], [data-slot="select-content"]': {
      minWidth: '11rem',
      padding: '0.3rem',
    },
    '[data-slot="menu-item"], [data-slot="select-item"]': {
      padding: '0.4rem 0.65rem',
      borderRadius: '6px',
      cursor: 'pointer',
    },
    '[data-slot="menu-item"][data-highlighted], [data-slot="select-item"][data-highlighted]': {
      background: 'var(--fl-accent-soft)',
    },
    '[data-slot="select-item"][data-selected]': { fontWeight: 600, color: 'var(--fl-accent)' },
    '[data-slot="select-trigger"]': {
      display: 'inline-flex',
      minWidth: '12rem',
      justifyContent: 'space-between',
    },
    '[data-slot="select"]': { position: 'relative', display: 'inline-block' },
    '[data-slot="tooltip-content"][data-closed], [data-slot="popover-content"][data-closed], [data-slot="menu-content"][data-closed], [data-slot="select-content"][data-closed]':
      {
        opacity: 0,
      },
    '[data-slot="tooltip-content"], [data-slot="popover-content"], [data-slot="menu-content"], [data-slot="select-content"]':
      {
        transition: 'opacity 120ms',
      },

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
