import type { Rules } from './rules.ts'

const ease = 'cubic-bezier(0.23, 1, 0.32, 1)'
const trigger = 'button[aria-haspopup]'
const pressed = '[data-slot="toggle-group"] [data-slot="toggle"]'

/** Fixes from review: dropdown triggers, toasts that stack, grouped controls, handles, segments. */
export const reviewStyles: Rules = {
  // A trigger that opens a popup has no press-down; while open it sits sunk, like a held key.
  [`${trigger}:active:not(:disabled)`]: { transform: 'none' },
  [`${trigger}[aria-expanded="true"]`]: {
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    filter: 'none',
  },
  '[data-slot="switch"]:hover:not([data-checked])': {
    background: 'var(--well)',
    filter: 'brightness(0.97)',
  },
  '[data-slot="switch"][data-checked]:hover': {
    background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
    filter: 'brightness(1.08)',
  },
  'label > input[type="checkbox"], label > input[type="radio"]': {
    width: '1.1rem',
    height: '1.1rem',
    padding: 0,
    flex: 'none',
    accentColor: 'var(--primary)',
  },

  // Fieldset: the legend is the first line of the card, as a mono caption.
  '[data-slot="field-set"]': {
    border: 0,
    padding: '1rem',
    borderRadius: 'var(--fl-radius)',
    background: 'var(--card)',
    boxShadow: 'var(--elev-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    width: '100%',
  },
  '[data-slot="field-legend"]': {
    padding: 0,
    marginBottom: '0.2rem',
    fontFamily: 'var(--mono)',
    fontSize: '0.68rem',
    fontWeight: 500,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--muted-foreground)',
  },
  '[data-slot="field-set"] > legend': { float: 'none', width: 'auto' },

  // Menubar: a quiet bar of text triggers.
  '[data-slot="menubar"]': {
    gap: '2px',
    padding: '0.2rem',
    borderRadius: '10px',
    background: 'var(--card)',
    boxShadow: 'var(--elev-raised)',
  },
  '[data-slot="menubar"] [data-slot="menu-trigger"]': {
    padding: '0.3rem 0.7rem',
    borderRadius: '7px',
    boxShadow: 'none',
    background: 'transparent',
    fontWeight: 500,
  },
  '[data-slot="menubar"] [data-slot="menu-trigger"][aria-expanded="true"]': {
    background: 'var(--accent)',
    boxShadow: 'none',
  },

  // Toggle group: a sunk track with a raised pill under the pressed item.
  '[data-slot="toggle-group"]': {
    gap: '2px',
    padding: '3px',
    borderRadius: '10px',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    overflow: 'visible',
  },
  [pressed]: {
    minWidth: 0,
    padding: '0.3rem 0.8rem',
    borderRadius: '7px',
    border: 0,
    background: 'transparent',
    boxShadow: 'none',
    color: 'var(--muted-foreground)',
    transition: `background 150ms ${ease}, color 150ms, box-shadow 150ms`,
  },
  [`${pressed}[aria-pressed="true"], ${pressed}[data-pressed]`]: {
    background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
    boxShadow: 'var(--elev-raised)',
    color: 'var(--foreground)',
  },

  // Number and password inputs: one well, ghost buttons inside it.
  '[data-slot="number-input-group"], [data-slot="password-input"]': {
    alignItems: 'center',
    borderRadius: 'var(--fl-radius)',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
  },
  '[data-slot="number-input-group"]:focus-within, [data-slot="password-input"]:focus-within': {
    boxShadow: 'var(--elev-well), 0 0 0 3px color-mix(in oklab, var(--ring) 45%, transparent)',
  },
  '[data-slot="number-input-control"], [data-slot="password-input-control"]': {
    background: 'transparent',
    boxShadow: 'none',
    border: 0,
    outline: 0,
    borderRadius: 0,
  },
  '[data-slot="number-input-control"]': { textAlign: 'center', fontVariantNumeric: 'tabular-nums' },
  '[data-slot="number-input-increment"], [data-slot="number-input-decrement"], [data-slot="password-input-toggle"]':
    {
      background: 'transparent',
      boxShadow: 'none',
      border: 0,
      borderRadius: '7px',
      margin: '3px',
      padding: '0.25rem 0.6rem',
      color: 'var(--muted-foreground)',
    },
  [`[data-slot="number-input-increment"]:hover, [data-slot="number-input-decrement"]:hover, [data-slot="password-input-toggle"]:hover`]:
    { background: 'var(--accent)', color: 'var(--foreground)', filter: 'none' },

  // Resizable: a hairline that thickens into a grip while hovered or dragged.
  '[data-slot="resizable"]': { gap: 0, boxShadow: 'none', overflow: 'visible' },
  '[data-slot="resizable-panel"]': {
    borderRadius: 'var(--fl-radius)',
    background: 'var(--card)',
    boxShadow: 'var(--elev-raised)',
  },
  '[data-slot="resizable-handle"]': {
    position: 'relative',
    flex: '0 0 14px',
    minWidth: '14px',
    background: 'transparent',
  },
  '[data-slot="resizable-handle"]::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '4px',
    height: '2.2rem',
    translate: '-50% -50%',
    borderRadius: '999px',
    background: 'color-mix(in oklab, var(--foreground) 22%, transparent)',
    transition: `height 200ms ${ease}, background 150ms`,
  },
  '[data-slot="resizable-handle"]:hover::after, [data-slot="resizable-handle"][data-dragging]::after, [data-slot="resizable-handle"]:focus-visible::after':
    { height: '3.4rem', background: 'var(--primary)' },
  '[data-slot="resizable-handle"][data-dragging], [data-slot="resizable-handle"]:hover': {
    background: 'transparent',
  },

  // Segmented inputs: each segment is a small well that lights when focused.
  '[data-slot="time-input"], [data-slot="date-input"]': {
    gap: '0.15rem',
    padding: '0.3rem 0.5rem',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    border: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  '[data-slot="time-input"]:focus-within, [data-slot="date-input"]:focus-within': {
    boxShadow: 'var(--elev-well), 0 0 0 3px color-mix(in oklab, var(--ring) 45%, transparent)',
  },
  'input[data-slot="time-input-segment"], input[data-slot="date-input-segment"]': {
    width: '2.1ch',
    padding: '0.15rem 0.3rem',
    boxSizing: 'content-box',
    textAlign: 'center',
    borderRadius: '5px',
    background: 'transparent',
    boxShadow: 'none',
    outline: 0,
    caretColor: 'transparent',
  },
  'input[data-slot="time-input-segment"]:focus, input[data-slot="date-input-segment"]:focus': {
    background: 'var(--primary)',
    color: 'var(--primary-foreground)',
  },
  'input[data-slot="time-input-segment"][data-type="dayPeriod"]': { width: '2.6ch' },
  'span[data-slot="time-input-segment"], span[data-slot="date-input-segment"]': {
    color: 'var(--muted-foreground)',
    padding: 0,
  },

  // Toast: stacked like ui-sdk's own. Hidden behind the front one until the region is hovered.
  '[data-slot="toast-region"]': {
    '--dir': -1,
    height: 'var(--toast-front-height)',
    outline: 0,
  },
  '[data-slot="toast-region"][data-expanded]': {
    height: 'calc(var(--toast-stack-height) + (var(--toast-count) - 1) * 0.6rem)',
  },
  '[data-slot="toast-list"]': { display: 'contents' },
  '[data-slot="toast"]': {
    '--y': 'calc(var(--dir) * var(--toast-index) * 0.6rem)',
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    zIndex: 'calc(100 - var(--toast-index))',
    '--behind': 'min(var(--toast-index), 1)',
    height:
      'calc(var(--toast-height) + (var(--toast-front-height) - var(--toast-height)) * var(--behind))',
    overflow: 'hidden',
    background: 'color-mix(in oklab, var(--tone) 10%, oklch(0.99 0 0))',
    backdropFilter: 'none',
    translate:
      'var(--toast-swipe-x, 0px) calc(var(--y) + var(--toast-swipe-y, 0px) + var(--exit-y, 0px))',
    scale: 'calc(1 - var(--toast-index) * 0.05)',
    opacity: 1,
    transition: 'translate 400ms ease, scale 400ms ease, opacity 400ms ease, height 400ms ease',
    userSelect: 'none',
  },
  '[data-slot="toast"]::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'var(--card)',
    opacity: 'var(--behind)',
    pointerEvents: 'none',
    transition: 'opacity 400ms ease',
  },
  '[data-slot="toast"][data-expanded]': {
    '--y': 'calc(var(--dir) * (var(--toast-offset) + var(--toast-index) * 0.6rem))',
    scale: 1,
    '--behind': 0,
    height: 'var(--toast-height)',
    transitionDuration: '200ms',
    transitionTimingFunction: 'ease-out',
  },
  '[data-slot="toast"][data-starting-style]': {
    transition: 'none',
    opacity: 0,
    '--y': 'calc(var(--dir) * -100% * (1 - var(--behind)))',
  },
  '[data-slot="toast"][data-ending-style]': {
    opacity: 0,
    '--exit-y': 'calc(var(--dir) * -100% * (1 - var(--behind)))',
    transitionDuration: '200ms',
    transitionTimingFunction: 'ease-out',
  },
  '[data-slot="toast"][data-swiping]': { transition: 'none' },
  '@media (prefers-reduced-motion: reduce)': {
    '[data-slot="toast"]': { transitionProperty: 'opacity' },
  },
}
