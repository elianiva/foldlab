import { definePreset } from '@pandacss/dev'

// Every component rule targets the `data-*` attributes ui-sdk writes, so no part
// needs a class name and no recipe prop has to be known at build time. Variants
// are attributes (`data-size`, `data-variant`) the app sets. The look is plain
// on purpose: neutral colors on CSS variables, one accent, system fonts.
const hit = (selector: string) => `${selector}:not([disabled]):not([aria-disabled="true"])`

const base = {
  // The Graphite palette, after the Quorum design language: near-neutral greys with a
  // faint cool cast, an ink primary, Geist for text and Geist Mono for figures.
  // The `--fl-*` names the components use are aliases of these tokens.
  ':root': {
    '--radius': '10px',
    '--sans': "'Geist', ui-sans-serif, system-ui, sans-serif",
    '--mono': "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
    '--background': 'oklch(0.981 0.0012 260)',
    '--foreground': 'oklch(0.26 0.01 260)',
    '--card': 'oklch(0.997 0.0006 260)',
    '--primary': 'oklch(0.3 0.004 260)',
    '--primary-foreground': 'oklch(0.99 0 0)',
    '--primary-soft': 'oklch(0.3 0 0 / 0.08)',
    '--muted': 'oklch(0.96 0.002 260)',
    '--muted-foreground': 'oklch(0.52 0.01 260)',
    '--accent': 'oklch(0.94 0.0036 260)',
    '--border': 'oklch(0.914 0.004 260)',
    '--input': 'oklch(0.895 0.0044 260)',
    '--ring': 'oklch(0.55 0 0)',
    '--ok': 'oklch(0.5 0.13 155)',
    '--warn': 'oklch(0.66 0.145 66)',
    '--danger': 'oklch(0.52 0.19 27)',
    '--ok-soft': 'oklch(0.56 0.13 155 / 0.12)',
    '--warn-soft': 'oklch(0.66 0.145 66 / 0.14)',
    '--danger-soft': 'oklch(0.545 0.19 27 / 0.12)',
    '--info': 'oklch(0.55 0.12 235)',
    '--info-soft': 'oklch(0.62 0.135 235 / 0.12)',
    '--page': 'oklch(0.955 0.002 260)',
    '--surface-nested': 'oklch(0.975 0.0012 260)',
    '--well': 'oklch(0.938 0.002 260)',
    '--hairline': 'oklch(0.26 0.01 260 / 0.1)',
    '--hairline-soft': 'oklch(0.26 0.01 260 / 0.06)',
    // Depth. Surfaces sit at four heights, each with one recipe: a hairline edge, a light
    // top edge, and a soft shadow below. well = sunk, raised = one step up, card = a panel,
    // float = above everything.
    '--raised-top': 'oklch(1 0 0)',
    '--raised-bottom': 'oklch(0.972 0.0012 260)',
    '--highlight': 'oklch(1 0 0 / 0.95)',
    '--primary-fill-top': 'oklch(0.38 0.004 260)',
    '--primary-fill-bottom': 'oklch(0.25 0.004 260)',
    '--primary-edge': 'oklch(0.18 0 0)',
    '--destructive-fill-top': 'oklch(0.6 0.19 27)',
    '--destructive-fill-bottom': 'oklch(0.5 0.19 27)',
    '--elev-well':
      'inset 0 1px 2px oklch(0.26 0.01 260 / 0.09), inset 0 0 0 1px var(--hairline-soft)',
    '--elev-raised':
      'inset 0 1px 0 var(--highlight), 0 0 0 1px var(--hairline), 0 1px 1px oklch(0.26 0.01 260 / 0.05), 0 2px 4px -1px oklch(0.26 0.01 260 / 0.07)',
    '--elev-card':
      'inset 0 1px 0 var(--highlight), 0 0 0 1px var(--hairline-soft), 0 1px 2px oklch(0.26 0.01 260 / 0.05), 0 10px 28px -12px oklch(0.26 0.01 260 / 0.16)',
    '--elev-float':
      'inset 0 1px 0 var(--highlight), 0 0 0 1px var(--hairline), 0 2px 6px oklch(0.26 0.01 260 / 0.06), 0 28px 56px -18px oklch(0.26 0.01 260 / 0.3)',
    '--elev-primary':
      'inset 0 1px 0 oklch(1 0 0 / 0.22), inset 0 -1px 0 oklch(0 0 0 / 0.2), 0 0 0 1px var(--primary-edge), 0 1px 2px oklch(0 0 0 / 0.25), 0 4px 10px -4px oklch(0 0 0 / 0.35)',
    // Aliases the components already use.
    '--fl-bg': 'var(--page)',
    '--fl-surface': 'var(--card)',
    '--fl-text': 'var(--foreground)',
    '--fl-muted': 'var(--muted-foreground)',
    '--fl-border': 'var(--border)',
    '--fl-accent': 'var(--primary)',
    '--fl-accent-soft': 'var(--accent)',
    '--fl-danger': 'var(--danger)',
    '--fl-radius': 'calc(var(--radius) * 0.8)',
    colorScheme: 'light',
  },
  body: {
    background: 'var(--page)',
    color: 'var(--foreground)',
    fontFamily: 'var(--sans)',
    fontSize: '13px',
    lineHeight: 1.5,
    WebkitFontSmoothing: 'antialiased',
  },
  'h1, h2, h3, h4': { fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.25 },
  h1: { fontSize: '1.5rem' },
  h2: { fontSize: '1.05rem' },
  '::selection': { background: 'var(--primary-soft)' },
  ':focus-visible': {
    outline: '2px solid color-mix(in oklab, var(--ring) 70%, transparent)',
    outlineOffset: '2px',
  },
  '[hidden]': { display: 'none !important' },

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
    color: 'var(--primary-foreground)',
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
    color: 'var(--primary-foreground)',
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
    fontFamily: 'var(--mono)',
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
    background: 'oklch(0.215 0.0018 260)',
    color: 'oklch(0.94 0.0018 260)',
    fontFamily: 'var(--mono)',
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
    color: 'var(--primary-foreground)',
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
    color: 'var(--primary-foreground)',
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
}

// Depth recipes. Merged over the flat rules by selector: an object literal with a repeated
// key keeps only the last one, which would drop the earlier properties.
const depth = {
  '[data-slot="autocomplete-content"]': {
    zIndex: 20,
    padding: '0.3rem',
    borderRadius: '10px',
    background: 'var(--card)',
    boxShadow: 'var(--elev-float)',
    minWidth: '14rem',
  },
  '[data-slot="autocomplete-item"], [data-slot="command-item"]': {
    padding: '0.4rem 0.65rem',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  '[data-slot="autocomplete-item"][data-highlighted], [data-slot="command-item"][data-highlighted]':
    { background: 'var(--accent)' },
  '[data-slot="autocomplete-empty"], [data-slot="command-empty"]': {
    padding: '0.5rem 0.65rem',
    color: 'var(--muted-foreground)',
  },
  '[data-slot="command"]': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '100%',
    maxWidth: '26rem',
    padding: '0.6rem',
    borderRadius: '12px',
    background: 'var(--card)',
    boxShadow: 'var(--elev-float)',
  },
  '[data-slot="calendar"]': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '17rem',
  },
  '[data-slot="calendar"] > div:first-child': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  '[data-slot="calendar-heading"]': { fontWeight: 600 },
  '[data-slot="calendar-weekdays"], [data-slot="calendar-week"]': {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
  },
  '[data-slot="calendar-weekday"]': {
    textAlign: 'center',
    color: 'var(--muted-foreground)',
    fontSize: '0.75rem',
  },
  '[data-slot="calendar-day"]': {
    padding: '0.4rem 0',
    textAlign: 'center',
    background: 'transparent',
    boxShadow: 'none',
    borderRadius: '6px',
  },
  '[data-slot="calendar-day"][data-outside]': { color: 'var(--muted-foreground)', opacity: 0.55 },
  '[data-slot="calendar-day"][data-today]': { fontWeight: 700 },
  '[data-slot="calendar-day"][data-selected]': {
    background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
    color: 'var(--primary-foreground)',
  },
  '[data-slot="toc"]': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    fontSize: '0.85rem',
  },
  '[data-slot="toc-title"]': {
    margin: 0,
    fontFamily: 'var(--mono)',
    fontSize: '0.68rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--muted-foreground)',
  },
  '[data-slot="toc"] ul': {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  '[data-slot="toc"] a': { color: 'var(--muted-foreground)', textDecoration: 'none' },
  '[data-slot="toc"] a[aria-current="location"]': { color: 'var(--foreground)', fontWeight: 550 },
  '[data-slot="sidebar"]': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
    width: '14rem',
    padding: '0.75rem',
    background: 'var(--muted)',
    borderRadius: 'calc(var(--radius) * 1.4)',
    boxShadow: 'var(--elev-card)',
  },
  '[data-slot="sidebar-group"]': {
    margin: '0.6rem 0.5rem 0.25rem',
    fontFamily: 'var(--mono)',
    fontSize: '0.68rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--muted-foreground)',
  },
  '[data-slot="sidebar-link"]': {
    padding: '0.35rem 0.5rem',
    borderRadius: '6px',
    color: 'var(--muted-foreground)',
    textDecoration: 'none',
  },
  '[data-slot="sidebar-link"][aria-current="page"]': {
    background: 'var(--raised-top)',
    boxShadow: 'var(--elev-raised)',
    color: 'var(--foreground)',
  },
  '[data-slot="copy-text"]': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    padding: '0.5rem 0.5rem 0.5rem 0.85rem',
    borderRadius: 'var(--fl-radius)',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    fontFamily: 'var(--mono)',
    fontSize: '0.8rem',
  },
  '[data-slot="copy-text"][data-inline]': {
    display: 'inline-flex',
    padding: '0.1rem 0.1rem 0.1rem 0.5rem',
  },
  '[data-slot="copy-button"]': { padding: '0.2rem 0.55rem', fontSize: '0.75rem' },
  '[data-slot="flow"]': { display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' },
  '[data-slot="flow-node"]': {
    padding: '0.7rem 1rem',
    borderRadius: 'var(--fl-radius)',
    background: 'var(--card)',
    boxShadow: 'var(--elev-raised)',
    minWidth: '7rem',
  },
  '[data-slot="flow-node"][data-tone="success"]': { background: 'var(--ok-soft)' },
  '[data-slot="flow-node"][data-tone="warning"]': { background: 'var(--warn-soft)' },
  '[data-slot="flow-node"][data-tone="error"]': { background: 'var(--danger-soft)' },
  '[data-slot="flow-title"]': { margin: 0, fontWeight: 550 },
  '[data-slot="flow-arrow"]': { color: 'var(--muted-foreground)' },
  '[data-slot="page-header"]': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    width: '100%',
  },
  '[data-slot="page-header-title"]': { margin: 0, fontSize: '1.2rem' },
  '[data-slot="page-header-description"]': { margin: 0, color: 'var(--muted-foreground)' },
  '[data-slot="page-header-actions"]': { display: 'flex', gap: '0.5rem' },
  '[data-slot="resource-list"]': {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    width: '100%',
    borderRadius: 'var(--fl-radius)',
    background: 'var(--card)',
    boxShadow: 'var(--elev-card)',
  },
  '[data-slot="resource-list"] li': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--hairline-soft)',
  },
  '[data-slot="resource-list"] li:last-child': { borderBottom: 0 },
  '[data-slot="resource-name"]': { margin: 0, fontWeight: 550 },
  '[data-slot="resource-meta"]': {
    margin: 0,
    color: 'var(--muted-foreground)',
    fontSize: '0.8rem',
  },
  // ── Depth ── (these come last, so they win over the flat rules above)
  'button, [data-slot="button"]': {
    border: 0,
    borderRadius: 'calc(var(--radius) * 1)',
    background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
    boxShadow: 'var(--elev-raised)',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), filter 150ms, box-shadow 150ms',
  },
  '[data-slot="button"]:active:not(:disabled), button:active:not(:disabled)': {
    transform: 'scale(0.97)',
  },
  [hit('button:hover')]: {
    background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
    filter: 'brightness(0.98)',
  },
  '[data-slot="button"][data-variant="primary"]': {
    background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
    boxShadow: 'var(--elev-primary)',
    color: 'var(--primary-foreground)',
  },
  [hit('[data-slot="button"][data-variant="primary"]:hover')]: {
    background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
    filter: 'brightness(1.08)',
  },
  '[data-slot="button"][data-variant="destructive"]': {
    background: 'linear-gradient(var(--destructive-fill-top), var(--destructive-fill-bottom))',
    boxShadow: 'var(--elev-primary)',
    color: '#fff',
  },
  [hit('[data-slot="button"][data-variant="destructive"]:hover')]: {
    background: 'linear-gradient(var(--destructive-fill-top), var(--destructive-fill-bottom))',
    filter: 'brightness(1.08)',
  },
  '[data-slot="button"][data-variant="ghost"]': { background: 'transparent', boxShadow: 'none' },
  [hit('[data-slot="button"][data-variant="ghost"]:hover')]: {
    background: 'var(--accent)',
    filter: 'none',
  },
  'input, select, [data-slot="input-area"]': {
    border: 0,
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    borderRadius: 'var(--fl-radius)',
    fontSize: '13px',
  },
  'input:focus-visible, [data-slot="input-area"]:focus-visible': {
    outline: 0,
    boxShadow: 'var(--elev-well), 0 0 0 3px color-mix(in oklab, var(--ring) 45%, transparent)',
  },
  '[data-slot="input"][data-invalid], [data-slot="field-control"][data-invalid], [data-slot="combobox-input"][data-invalid]':
    {
      boxShadow: 'var(--elev-well), 0 0 0 2px color-mix(in oklab, var(--danger) 55%, transparent)',
    },
  '[data-slot="layer-card"], [data-slot="accordion"], [data-slot="table"], [data-slot="banner"], [data-slot="toolbar"]':
    {
      border: 0,
      boxShadow: 'var(--elev-card)',
    },
  '[data-slot="table"] th': { background: 'var(--surface-nested)' },
  '[data-slot="dialog-content"], [data-slot="popover-content"], [data-slot="menu-content"], [data-slot="select-content"], [data-slot="combobox-content"]':
    {
      border: 0,
      boxShadow: 'var(--elev-float)',
    },
  '[data-slot="tooltip-content"]': {
    boxShadow: 'var(--elev-float)',
    background: 'oklch(0.26 0.01 260)',
  },
  '[data-slot="switch"]': { background: 'var(--well)', boxShadow: 'var(--elev-well)' },
  '[data-slot="switch"][data-checked]': {
    background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
    boxShadow: 'var(--elev-primary)',
  },
  '[data-slot="switch-thumb"]': {
    background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
    boxShadow: 'var(--elev-raised)',
  },
  '[data-slot="checkbox"], [data-slot="radio"]': {
    border: 0,
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
  },
  '[data-slot="checkbox"][data-checked], [data-slot="radio"][data-checked]': {
    background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
    boxShadow: 'var(--elev-primary)',
  },
  '[data-slot="slider-track"]': { background: 'var(--well)', boxShadow: 'var(--elev-well)' },
  '[data-slot="slider-indicator"]': { background: 'var(--primary)' },
  '[data-slot="slider-thumb"]': {
    border: 0,
    background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
    boxShadow: 'var(--elev-raised)',
  },
  '[data-slot="tabs-tab"], [data-slot="accordion-trigger"]': {
    boxShadow: 'none',
    background: 'transparent',
  },
  '[data-slot="tabs-tab"][data-selected]': { borderBottomColor: 'var(--primary)' },
  '[data-slot="meter-track"]': { background: 'var(--well)', boxShadow: 'var(--elev-well)' },
  '[data-slot="meter-indicator"]': { background: 'var(--primary)' },
  '[data-slot="badge"]': {
    background: 'var(--muted)',
    color: 'var(--muted-foreground)',
    boxShadow: 'inset 0 0 0 1px var(--hairline-soft)',
  },
  '[data-slot="badge"][data-tone="info"]': {
    background: 'var(--info-soft)',
    color: 'var(--info)',
  },
  '[data-slot="badge"][data-tone="success"]': {
    background: 'var(--ok-soft)',
    color: 'var(--ok)',
  },
  '[data-slot="badge"][data-tone="warning"]': {
    background: 'var(--warn-soft)',
    color: 'var(--warn)',
  },
  '[data-slot="badge"][data-tone="error"]': {
    background: 'var(--danger-soft)',
    color: 'var(--danger)',
  },
  '[data-slot="banner"]': { background: 'var(--info-soft)' },
  '[data-slot="banner"][data-tone="neutral"]': { background: 'var(--muted)' },
  '[data-slot="banner"][data-tone="success"]': { background: 'var(--ok-soft)' },
  '[data-slot="banner"][data-tone="warning"]': { background: 'var(--warn-soft)' },
  '[data-slot="banner"][data-tone="error"]': { background: 'var(--danger-soft)' },
  '[data-slot="link"]': { color: 'var(--foreground)', textDecorationColor: 'var(--hairline)' },
  '[data-slot="combobox-item"][data-highlighted], [data-slot="menu-item"][data-highlighted], [data-slot="select-item"][data-highlighted]':
    {
      background: 'var(--accent)',
    },
  '[data-slot="combobox-item"][data-selected], [data-slot="select-item"][data-selected]': {
    color: 'var(--foreground)',
    fontWeight: 600,
  },
}

type Rules = Record<string, Record<string, unknown>>
const merge = (a: Rules, b: Rules): Rules => {
  const out: Rules = { ...a }
  for (const [selector, rule] of Object.entries(b)) out[selector] = { ...out[selector], ...rule }
  return out
}

export const foldlab = definePreset({
  name: 'foldlab',
  globalCss: merge(base, depth) as never,
})
