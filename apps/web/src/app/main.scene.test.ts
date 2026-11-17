import { BindPart, Message as UiMessage } from '@foldlab/ui'
import { Scene } from 'foldkit/test'
import { test } from 'vitest'
import { init, Message, update, view } from './main.ts'

// Scene has no `input` step, only `change`, so OnInput controls cannot be typed
// into. The invalid state is reached through `update`, then Scene checks the view.
const invalidEmail = update(init().model, Message.ChangedEmail({ value: 'nope' })).model

// Every bound ui-sdk part is one pending Mount, and Scene demands each be
// resolved. An unknown-key Message acknowledges one without touching the Model.
// The resolver is typed with the raw ui Message, but Scene feeds `update` the
// view's mapped one, so the app Message goes in behind a cast.
const ack = Message.GotUiMessage({
  message: UiMessage.ChangedUiState({
    component: 'none',
    key: 'none',
    name: 'ack',
    value: null,
    reason: 'test',
  }),
}) as never
const resolveBinds = (count: number) =>
  Array.from({ length: count }, () => Scene.Mount.resolve(BindPart, ack))

test('scene: an invalid field wires its error and description onto the control', () => {
  Scene.scene(
    { update, view },
    Scene.given(invalidEmail),
    ...resolveBinds(13),
    Scene.expect(Scene.selector('[data-slot="field-error"]')).toContainText('valid email'),
    Scene.expect(Scene.label('Owner email *')).toHaveAttr('aria-invalid', 'true'),
    Scene.expect(Scene.label('Owner email *')).toHaveAccessibleDescription(
      /Where project notices go/,
    ),
  )
})
