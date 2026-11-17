import { Dialog as FkDialog } from '@foldkit/ui'
import { AcquireResources } from '@foldkit/ui/dialog'
import { BindPart, Dialog, Message as UiMessage } from '@foldlab/ui'
import { resolveBinds } from '@foldlab/ui/testing'
import { Scene } from 'foldkit/test'
import { expect, test } from 'vitest'
import { init, Message, update, view } from './main.ts'

const lift = (message: UiMessage) => Message.GotUiMessage({ message })
const base = init().model
const withSettings = (settings: Dialog.State) => ({ ...base, ui: { ...base.ui, settings } })
// Two comboboxes (3 parts each) and the accordion (7): the page's own Mounts.
const PAGE_MOUNTS = 13
const bindMounts = (sim: { mounts: ReadonlyArray<{ name: string }> }) =>
  sim.mounts.filter((mount) => mount.name === BindPart.name).length

test('adapter dialog, closed: one Mount (the trigger) and no content part', () => {
  Scene.scene(
    { update, view },
    Scene.given(base),
    Scene.tap((sim) => expect(bindMounts(sim) - PAGE_MOUNTS).toBe(1)),
    resolveBinds(lift),
    Scene.expect(Scene.selector('#settings-content')).not.toExist(),
  )
})

test('adapter dialog, open: role, modal, naming; six Mounts for one dialog', () => {
  const open = Dialog.init({ key: 'settings', open: true, described: true })
  Scene.scene(
    { update, view },
    Scene.given(withSettings(open)),
    // settings: trigger, backdrop, content, title, description, close.
    // Plus the nested confirm dialog's trigger, which lives in the content.
    Scene.tap((sim) => expect(bindMounts(sim) - PAGE_MOUNTS).toBe(6 + 1)),
    resolveBinds(lift),
    Scene.expect(Scene.selector('#settings-content')).toHaveAttr('role', 'dialog'),
    Scene.expect(Scene.selector('#settings-content')).toHaveAttr('aria-modal', 'true'),
    Scene.expect(Scene.selector('#settings-content')).toHaveAttr(
      'aria-labelledby',
      'settings-title',
    ),
    Scene.expect(Scene.selector('#settings-content')).toHaveAttr(
      'aria-describedby',
      'settings-description',
    ),
  )
})

test('adapter dialog, closing: the Model keeps the content mounted with data-closed', () => {
  const closing = { ...Dialog.init({ key: 'settings', open: true, described: true }), open: false }
  Scene.scene(
    { update, view },
    Scene.given(withSettings(closing)),
    resolveBinds(lift),
    Scene.expect(Scene.selector('#settings-content')).toHaveAttr('data-closed'),
    Scene.expect(Scene.selector('#settings-content')).not.toHaveAttr('data-open'),
  )
})

test('@foldkit/ui dialog, open: one Mount, resolved without a cast', () => {
  const opened = FkDialog.open(FkDialog.init({ id: 'fk-settings' })).model
  Scene.scene(
    { update, view },
    Scene.given({ ...base, fkDialog: opened }),
    resolveBinds(lift),
    Scene.Mount.resolve(AcquireResources, FkDialog.Message.SucceededAcquireResources()),
    Scene.expect(Scene.selector('#fk-settings')).toHaveAttr('aria-modal', 'true'),
    Scene.expect(Scene.selector('#fk-settings-panel')).toHaveAttr('data-slot', 'dialog-content'),
  )
})
