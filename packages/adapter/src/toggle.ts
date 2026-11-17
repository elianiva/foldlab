import { toggle } from '@ui-sdk/core/toggle'
import { Schema } from 'effect'
import { defineComponent, makeParts, makeUpdate } from './core.ts'
import { primitiveOf } from './internal/render.ts'

export const State = Schema.Struct({
  key: Schema.String,
  pressed: Schema.Boolean,
  disabled: Schema.Boolean,
})
export type State = typeof State.Type

export const init = (state: { key: string; pressed?: boolean; disabled?: boolean }): State => ({
  key: state.key,
  pressed: state.pressed ?? false,
  disabled: state.disabled ?? false,
})

type Slot = 'root'

export const component = defineComponent<State, Slot>({
  name: 'toggle',
  primitive: primitiveOf(toggle),
  state: State,
  key: (state) => state.key,
  options: (state) => ({ pressed: state.pressed, disabled: state.disabled }),
  controlled: ['pressed'],
  callbacks: { onPressedChange: 'pressed' },
  fold: (state, snapshot) => ({ ...state, pressed: snapshot['pressed'] === true }),
  tags: { root: 'button' },
  bound: ['root'],
})

export const parts = makeParts(component)
export const update = makeUpdate(component)
