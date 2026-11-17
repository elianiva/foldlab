import { Command, given, message, model, story } from 'foldkit/story'
import { expect, test } from 'vitest'
import { Combobox, syncUiState } from '@foldlab/ui'
import { CheckName, init, isFormValid, Message, update } from './main.ts'
import { Message as UiMessage } from '@foldlab/ui'

// A change as bind sends it: a full snapshot of the instance's controlled options.
const ui = (snapshot: Record<string, unknown>, key: string, component = 'combobox') =>
  Message.GotUiMessage({
    message: UiMessage.ChangedUiState({ component, key, snapshot, reason: 'test' }),
  })

// The Command is lifted into the app Message, so it resolves with the raw ui Message.
const sync = Command.resolveAll([syncUiState, UiMessage.CompletedUiSync()])

test('name: sync rule fails first, then the async check decides', () => {
  story(
    update,
    given(init({ anchorId: '' }).model),
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
  const typed = update(init({ anchorId: '' }).model, Message.ChangedName({ value: 'fresh' })).model
  const late = update(typed, Message.GotNameAvailability({ name: 'panda', taken: true })).model
  expect(late.name._tag).toBe('Validating')
})

test('cross-field: changing start re-checks a touched end', () => {
  story(
    update,
    given(init({ anchorId: '' }).model),
    message(Message.ChangedStart({ value: '2026-05-10' })),
    message(Message.ChangedEnd({ value: '2026-05-12' })),
    model((m) => expect(m.schedule.end._tag).toBe('Valid')),
    message(Message.ChangedStart({ value: '2026-05-20' })),
    model((m) => expect(m.schedule.end._tag).toBe('Invalid')),
  )
})

const pick = (value: string | null, query = '', open = false) => ({ value, query, open })
const pickMany = (value: ReadonlyArray<string>) => ({ value, query: '', open: true })

test('ui-sdk snapshots flow into field validation, and every one is confirmed by a sync', () => {
  story(
    update,
    given(init({ anchorId: '' }).model),
    message(ui(pick('ada', 'Ada Lovelace'), 'assignee')),
    sync,
    model((m) => {
      expect(m.ui.assigneeBox.value).toEqual(['ada'])
      expect(m.ui.assigneeBox.query).toBe('Ada Lovelace')
      expect(m.owner.assignee._tag).toBe('Valid')
    }),
    message(ui(pickMany(['sms', 'slack']), 'channels')),
    sync,
    model((m) => expect(m.channels._tag).toBe('Valid')),
    // A Message for an unknown key changes nothing.
    message(ui(pick('grace'), 'someone-else')),
    sync,
    model((m) => expect(m.ui.assigneeBox.value).toEqual(['ada'])),
  )
})

test('a snapshot is idempotent: applying it twice equals applying it once', () => {
  const once = update(
    init({ anchorId: '' }).model,
    ui(pick('ada', 'Ada Lovelace'), 'assignee'),
  ).model
  const twice = update(once, ui(pick('ada', 'Ada Lovelace'), 'assignee')).model
  expect(twice).toEqual(once)
})

test('a snapshot with no query resets a single combobox to its chosen label', () => {
  const state = Combobox.update(
    { ...Combobox.init({ key: 'k', items: [{ value: 'a', label: 'Alpha' }] }), value: ['a'] },
    UiMessage.ChangedUiState({
      component: 'combobox',
      key: 'k',
      snapshot: { value: 'a', query: undefined, open: false },
      reason: 'imperative',
    }),
  )
  expect(state.query).toBe('Alpha')
})

test('typing is a Foldkit Message: it sets the query and opens the list', () => {
  story(
    update,
    given(init({ anchorId: '' }).model),
    message(
      Message.GotUiMessage({
        message: UiMessage.TypedUiText({ component: 'combobox', key: 'assignee', value: 'al' }),
      }),
    ),
    sync,
    model((m) => {
      expect(m.ui.assigneeBox.query).toBe('al')
      expect(m.ui.assigneeBox.open).toBe(true)
    }),
  )
})

test('the app refuses a change by ignoring it: the sync Command carries the old state back', () => {
  const refusing = (model: Parameters<typeof update>[0], msg: Parameters<typeof update>[1]) =>
    msg._tag === 'GotUiMessage' && msg.message._tag === 'ChangedUiState'
      ? update(model, Message.GotUiMessage({ message: UiMessage.CompletedUiSync() }))
      : update(model, msg)
  const result = refusing(init({ anchorId: '' }).model, ui(pick('ada', 'Ada Lovelace'), 'assignee'))
  expect(result.model.ui.assigneeBox.value).toEqual([])
})

test('submit validates everything at once', () => {
  story(
    update,
    given(init({ anchorId: '' }).model),
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
