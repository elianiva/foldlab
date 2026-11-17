import { resolveBinds } from '@foldlab/ui/testing'
import { Message as UiMessage } from '@foldlab/ui'
import { Scene } from 'foldkit/test'
import { test } from 'vitest'
import { init, Message, update, view } from './main.ts'

const lift = (message: UiMessage) => Message.GotUiMessage({ message })

// Scene has no `input` step, so a typed value cannot be driven. The invalid
// state is reached through `update`, and Scene checks what the view renders.
const invalidEmail = update(
  init({ anchorId: '' }).model,
  Message.ChangedEmail({ value: 'nope' }),
).model

test('scene: an invalid field wires its error and description onto the control', () => {
  Scene.scene(
    { update, view },
    Scene.given(invalidEmail),
    resolveBinds(lift),
    Scene.expect(Scene.selector('[data-slot="field-error"]')).toContainText('valid email'),
    Scene.expect(Scene.label('Owner email *')).toHaveAttr('aria-invalid', 'true'),
    Scene.expect(Scene.label('Owner email *')).toHaveAccessibleDescription(
      /Where project notices go/,
    ),
  )
})

test('scene: the assignee input is Foldkit-owned text entry; core keeps ARIA and keys', () => {
  Scene.scene(
    { update, view },
    Scene.given(init({ anchorId: '' }).model),
    resolveBinds(lift),
    Scene.expect(Scene.selector('[data-slot="combobox-input"]')).toHaveHandler('input'),
    Scene.expect(Scene.selector('[data-slot="combobox-input"]')).toHaveAttr(
      'aria-expanded',
      'false',
    ),
  )
})
