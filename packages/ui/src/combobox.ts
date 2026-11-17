import { fuzzyScore } from '@ui-sdk/core/text-match'
import { combobox } from '@ui-sdk/core/combobox'
import { Schema } from 'effect'
import { defineComponent, makeParts } from './core.ts'
import { primitiveOf } from './internal/render.ts'
import type { Message } from './core.ts'

export const Item = Schema.Struct({ value: Schema.String, label: Schema.String })
export type Item = typeof Item.Type

export const State = Schema.Struct({
  key: Schema.String,
  /** Selected item values. Single mode holds zero or one. */
  value: Schema.Array(Schema.String),
  /** What is typed in the input. */
  query: Schema.String,
  open: Schema.Boolean,
  multiple: Schema.Boolean,
  items: Schema.Array(Item),
})
export type State = typeof State.Type

export const init = (state: {
  key: string
  items: ReadonlyArray<Item>
  value?: ReadonlyArray<string>
  multiple?: boolean
}): State => ({
  key: state.key,
  value: state.value ?? [],
  query: '',
  open: false,
  multiple: state.multiple ?? false,
  items: state.items,
})

const strings = Schema.decodeUnknownSync(Schema.Array(Schema.String))
const asArray = (value: unknown): ReadonlyArray<string> =>
  value === null || value === undefined || value === ''
    ? []
    : Array.isArray(value)
      ? strings(value)
      : [String(value)]

export const labelOf = (state: State, value: string) =>
  state.items.find((item) => item.value === value)?.label ?? value

/** Applies ui-sdk's request. Returns the same object when the Message is not for this state. */
export const update = (state: State, message: Message): State => {
  if (
    message._tag !== 'ChangedUiState' ||
    message.component !== 'combobox' ||
    message.key !== state.key
  ) {
    return state
  }
  switch (message.name) {
    case 'value': {
      const value = asArray(message.value)
      // Single mode shows the chosen label in the input, as a native select would.
      const query = state.multiple ? state.query : labelOf(state, value[0] ?? '')
      return { ...state, value, query: value.length === 0 && !state.multiple ? '' : query }
    }
    case 'query':
      // No value means "reset": ui-sdk sends it when the list closes. Single mode falls back to the chosen label.
      return {
        ...state,
        query:
          typeof message.value === 'string'
            ? message.value
            : state.multiple
              ? ''
              : labelOf(state, state.value[0] ?? ''),
      }
    case 'open':
      return { ...state, open: message.value === true }
    default:
      return state
  }
}

/** The items to render. The app owns filtering, so it decides which parts exist. */
export const visibleItems = (state: State): ReadonlyArray<Item> => {
  const settled =
    !state.multiple &&
    state.value.length === 1 &&
    state.query === labelOf(state, state.value[0] ?? '')
  if (state.query === '' || settled) return state.items
  return state.items
    .map((item) => ({ item, score: fuzzyScore(item.label, state.query) }))
    .filter(({ score }) => score > 0)
    .toSorted((a, b) => b.score - a.score)
    .map(({ item }) => item)
}

type Slot =
  | 'root'
  | 'label'
  | 'input'
  | 'trigger'
  | 'content'
  | 'list'
  | 'item'
  | 'item-text'
  | 'item-indicator'
  | 'empty'
  | 'status'
  | 'clear'

export const component = defineComponent<State, Slot>({
  name: 'combobox',
  primitive: primitiveOf(combobox),
  state: State,
  key: (state) => state.key,
  options: (state) => ({
    value: state.multiple ? [...state.value] : (state.value[0] ?? null),
    query: state.query,
    open: state.open,
    multiple: state.multiple,
    items: state.items.map((item) => ({ ...item })),
    itemToValue: (item: Item) => item.value,
    itemToLabel: (item: Item) => item.label,
  }),
  callbacks: { onValueChange: 'value', onQueryChange: 'query', onOpenChange: 'open' },
  tags: {
    root: 'div',
    label: 'label',
    input: 'input',
    trigger: 'button',
    content: 'div',
    list: 'div',
    item: 'div',
    'item-text': 'span',
    'item-indicator': 'span',
    empty: 'div',
    status: 'div',
    clear: 'button',
  },
  bound: ['root', 'label', 'input', 'trigger', 'content', 'list', 'item', 'empty', 'clear'],
})

export const parts = makeParts(component)
