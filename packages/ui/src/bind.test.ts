// @vitest-environment happy-dom
import { accordion } from '@ui-sdk/core/accordion'
import { afterEach, expect, test } from 'vitest'
import {
  attach,
  type Binding,
  type Change,
  destroyAll,
  liveInstance,
  sync,
} from './internal/bind.ts'
import { primitiveOf } from './internal/render.ts'

type State = { key: string; value: ReadonlyArray<string> }
const strings = (value: unknown) => (Array.isArray(value) ? (value as Array<string>) : [])

const make = (guard: Binding['guard'] = () => true): Binding => ({
  primitive: primitiveOf(accordion),
  options: (state) => ({ value: [...(state as State).value] }),
  controlled: ['value'],
  callbacks: { onValueChange: 'value' },
  fold: (state, snapshot) => ({ ...(state as State), value: strings(snapshot['value']) }),
  guard,
  foldkitEvents: {},
})

const state: State = { key: 'k', value: [] }
const trigger = () => {
  const el = document.createElement('button')
  document.body.append(el)
  return el
}
const mount = (binding: Binding, el: HTMLElement, changes: Array<Change>, s: unknown = state) =>
  attach('accordion', binding, 'k', s, 'trigger', { value: 'a' }, el, (c) => changes.push(c))

afterEach(() => {
  destroyAll()
  document.body.replaceChildren()
})

test('attaching the same element twice yields one change per click', () => {
  const el = trigger()
  const changes: Array<Change> = []
  const binding = make()
  mount(binding, el, changes)
  mount(binding, el, changes)
  el.click()
  expect(changes).toHaveLength(1)
  expect(changes[0]?.snapshot).toEqual({ value: ['a'] })
})

test('cleanup of a replaced binding does not tear down the live one', () => {
  const el = trigger()
  const changes: Array<Change> = []
  const binding = make()
  const first = mount(binding, el, changes)
  const second = mount(binding, el, changes)
  first()
  el.click()
  expect(changes).toHaveLength(1)
  second()
  expect(liveInstance('accordion', 'k')).toBeUndefined()
})

test('sync reuses the entry instead of rebuilding it', () => {
  const el = trigger()
  const changes: Array<Change> = []
  mount(make(), el, changes)
  const before = liveInstance('accordion', 'k')
  sync('accordion', 'k', { key: 'k', value: ['a'] })
  expect(liveInstance('accordion', 'k')).toBe(before)
  expect(before?.get()).toMatchObject({ value: ['a'] })
  el.click()
  expect(changes[0]?.snapshot).toEqual({ value: [] })
})

test('a guard veto does not move the instance and emits a refused change', () => {
  const el = trigger()
  const changes: Array<Change> = []
  mount(
    make(() => false),
    el,
    changes,
  )
  el.click()
  expect(changes).toEqual([{ snapshot: { value: ['a'] }, reason: 'trigger-press', refused: true }])
  expect(liveInstance('accordion', 'k')?.get()).toMatchObject({ value: [] })
  el.click()
  expect(changes).toHaveLength(2)
  expect(changes[1]?.snapshot).toEqual({ value: ['a'] })
})
