import { Command, given, message, model, story } from 'foldkit/story'
import { expect, test } from 'vitest'
import { Combobox } from '@foldlab/ui'
import { CheckName, init, isFormValid, Message, update } from './main.ts'
import { Message as UiMessage } from '@foldlab/ui'

const ui = (name: string, value: unknown, key: string, component = 'combobox') =>
  Message.GotUiMessage({
    message: UiMessage.ChangedUiState({ component, key, name, value, reason: 'test' }),
  })

test('name: sync rule fails first, then the async check decides', () => {
  story(
    update,
    given(init().model),
    message(Message.ChangedName({ value: 'ab' })),
    model((m) => expect(m.name._tag).toBe('Invalid')),
    message(Message.ChangedName({ value: 'panda' })),
    model((m) => expect(m.name._tag).toBe('Validating')),
    Command.expectHas(CheckName),
    Command.resolveAll([CheckName, Message.GotNameAvailability({ name: 'panda', taken: true })]),
    model((m) => expect(m.name._tag).toBe('Invalid')),
    message(Message.ChangedName({ value: 'fresh' })),
    Command.resolveAll([CheckName, Message.GotNameAvailability({ name: 'fresh', taken: false })]),
    model((m) => expect(m.name._tag).toBe('Valid')),
  )
})

test('name: a late answer for an older value is ignored', () => {
  const typed = update(init().model, Message.ChangedName({ value: 'fresh' })).model
  const late = update(typed, Message.GotNameAvailability({ name: 'panda', taken: true })).model
  expect(late.name._tag).toBe('Validating')
})

test('cross-field: changing start re-checks a touched end', () => {
  story(
    update,
    given(init().model),
    message(Message.ChangedStart({ value: '2026-05-10' })),
    message(Message.ChangedEnd({ value: '2026-05-12' })),
    model((m) => expect(m.schedule.end._tag).toBe('Valid')),
    message(Message.ChangedStart({ value: '2026-05-20' })),
    model((m) => expect(m.schedule.end._tag).toBe('Invalid')),
  )
})

test('ui-sdk Messages flow into field validation; the app can refuse them', () => {
  story(
    update,
    given(init().model),
    message(ui('value', 'ada', 'assignee')),
    model((m) => {
      expect(m.assigneeBox.value).toEqual(['ada'])
      expect(m.owner.assignee._tag).toBe('Valid')
    }),
    message(ui('value', [], 'channels')),
    message(ui('value', ['sms', 'slack'], 'channels')),
    model((m) => expect(m.channels._tag).toBe('Valid')),
    // A Message for an unknown key changes nothing.
    message(ui('value', 'grace', 'someone-else')),
    model((m) => expect(m.assigneeBox.value).toEqual(['ada'])),
  )
})

test('submit validates everything at once', () => {
  story(
    update,
    given(init().model),
    message(Message.ClickedSubmit()),
    model((m) => {
      expect(m.submitted).toBe(false)
      expect(isFormValid(m)).toBe(false)
      expect(m.owner.email._tag).toBe('Invalid')
      expect(m.channels._tag).toBe('Invalid')
    }),
  )
})

test('Combobox.visibleItems filters with the app, not the primitive', () => {
  const state = {
    ...Combobox.init({
      key: 'k',
      items: [
        { value: 'a', label: 'Alpha' },
        { value: 'b', label: 'Beta' },
      ],
    }),
    query: 'alp',
  }
  expect(Combobox.visibleItems(state).map((i) => i.value)).toEqual(['a'])
})
