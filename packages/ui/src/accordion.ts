import { accordion } from '@ui-sdk/core/accordion'
import { Schema } from 'effect'
import { defineComponent, makeParts } from './core.ts'
import { primitiveOf } from './internal/render.ts'
import type { Message } from './core.ts'

export const State = Schema.Struct({
  key: Schema.String,
  /** Open items. */
  value: Schema.Array(Schema.String),
  multiple: Schema.Boolean,
})
export type State = typeof State.Type

export const init = (state: {
  key: string
  value?: ReadonlyArray<string>
  multiple?: boolean
}): State => ({
  key: state.key,
  value: state.value ?? [],
  multiple: state.multiple ?? false,
})

/** Applies ui-sdk's request. The Model decides: ignore the Message to refuse it. */
export const update = (state: State, message: Message): State => {
  if (
    message._tag !== 'ChangedUiState' ||
    message.component !== 'accordion' ||
    message.key !== state.key
  ) {
    return state
  }
  return message.name === 'value'
    ? { ...state, value: Schema.decodeUnknownSync(Schema.Array(Schema.String))(message.value) }
    : state
}

type Slot = 'root' | 'item' | 'header' | 'trigger' | 'panel'

export const component = defineComponent<State, Slot>({
  name: 'accordion',
  primitive: primitiveOf(accordion),
  state: State,
  key: (state) => state.key,
  options: (state) => ({ value: [...state.value], multiple: state.multiple }),
  callbacks: { onValueChange: 'value' },
  tags: { root: 'div', item: 'div', header: 'h3', trigger: 'button', panel: 'div' },
  bound: ['root', 'item', 'header', 'trigger', 'panel'],
})

export const parts = makeParts(component)
