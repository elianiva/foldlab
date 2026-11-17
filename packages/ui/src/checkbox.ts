import { checkbox } from '@ui-sdk/core/checkbox'
import { Schema } from 'effect'
import { defineComponent, makeParts, makeUpdate } from './core.ts'
import { primitiveOf } from './internal/render.ts'

export const State = Schema.Struct({
  key: Schema.String,
  checked: Schema.Boolean,
  disabled: Schema.Boolean,
})
export type State = typeof State.Type

export const init = (state: { key: string; checked?: boolean; disabled?: boolean }): State => ({
  key: state.key,
  checked: state.checked ?? false,
  disabled: state.disabled ?? false,
})

type Slot = 'root' | 'indicator'

export const component = defineComponent<State, Slot>({
  name: 'checkbox',
  primitive: primitiveOf(checkbox),
  state: State,
  key: (state) => state.key,
  options: (state) => ({ checked: state.checked, disabled: state.disabled }),
  controlled: ['checked'],
  callbacks: { onCheckedChange: 'checked' },
  fold: (state, snapshot) => ({ ...state, checked: snapshot['checked'] === true }),
  tags: { root: 'button', indicator: 'span' },
  bound: ['root'],
})

export const parts = makeParts(component)
export const update = makeUpdate(component)
