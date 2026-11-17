import { autocomplete } from '@ui-sdk/core/autocomplete'
import { Schema } from 'effect'
import { defineComponent, makeParts, makeUpdate } from './core.ts'
import type { Snapshot } from './internal/bind.ts'
import { primitiveOf } from './internal/render.ts'

export const State = Schema.Struct({
  key: Schema.String,
  /** The text in the input. Unlike a combobox, the text is the value. */
  value: Schema.String,
  open: Schema.Boolean,
  items: Schema.Array(Schema.String),
})
export type State = typeof State.Type

export const init = (state: { key: string; items: ReadonlyArray<string> }): State => ({
  key: state.key,
  value: '',
  open: false,
  items: state.items,
})

/** The suggestions to render. The app filters, so it decides which parts exist. */
export const visibleItems = (state: State): ReadonlyArray<string> => {
  const query = state.value.trim().toLowerCase()
  return query === ''
    ? state.items
    : state.items.filter((item) => item.toLowerCase().includes(query))
}

type Slot =
  | 'label'
  | 'input'
  | 'trigger'
  | 'clear'
  | 'content'
  | 'list'
  | 'item'
  | 'item-text'
  | 'empty'

export const component = defineComponent<State, Slot>({
  name: 'autocomplete',
  primitive: primitiveOf(autocomplete),
  state: State,
  key: (state) => state.key,
  options: (state) => ({ value: state.value, open: state.open, items: [...state.items] }),
  controlled: ['value', 'open'],
  callbacks: { onValueChange: 'value', onOpenChange: 'open' },
  fold: (state, snapshot: Snapshot): State => ({
    ...state,
    value: typeof snapshot['value'] === 'string' ? snapshot['value'] : '',
    open: snapshot['open'] === true,
  }),
  typed: (state, text) => ({ ...state, value: text, open: true }),
  text: 'input',
  tags: {
    label: 'label',
    input: 'input',
    trigger: 'button',
    clear: 'button',
    content: 'div',
    list: 'div',
    item: 'div',
    'item-text': 'span',
    empty: 'div',
  },
  bound: ['label', 'input', 'trigger', 'clear', 'content', 'list', 'item', 'empty'],
})

export const parts = makeParts(component)
export const update = makeUpdate(component)
