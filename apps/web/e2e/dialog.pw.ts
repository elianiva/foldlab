// One spec for the dialog, in a real browser. It is the proof that the focus trap,
// the exit animation, focus restore and scroll lock work through the adapter. It is
// not the start of a suite: Story and Scene tests cannot see any of this.
import { expect, type Page, test } from '@playwright/test'

const settings = '#settings-content'
const confirm = '#confirm-content'

const lock = (page: Page) =>
  page.evaluate(() => ({
    overflow: document.documentElement.style.overflow,
    marker: document.documentElement.hasAttribute('data-foldlab-lock'),
    inert: document.querySelectorAll('[inert]').length,
  }))

const unlocked = { overflow: '', marker: false, inert: 0 }

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Open (ui-sdk adapter)' })).toBeVisible()
  // Part of the claim: nothing in this page failed to bind.
  await expect(page.locator('[data-foldlab-unbound]')).toHaveCount(0)
})

test('Tab stays inside an open dialog and the page is locked behind it', async ({ page }) => {
  await page.getByRole('button', { name: 'Open (ui-sdk adapter)' }).click()
  await expect(page.locator(settings)).toHaveAttribute('data-open', '')
  expect((await lock(page)).overflow).toBe('hidden')
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab')
    expect(await page.evaluate((s) => !!document.activeElement?.closest(s), settings)).toBe(true)
  }
  await page.keyboard.press('Shift+Tab')
  expect(await page.evaluate((s) => !!document.activeElement?.closest(s), settings)).toBe(true)
})

test('Escape plays the exit, then releases the lock and returns focus to the trigger', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'Open (ui-sdk adapter)' })
  await trigger.click()
  await expect(page.locator(settings)).toHaveAttribute('data-open', '')
  await page.keyboard.press('Escape')
  // The exit: the content is still in the tree, marked closed and partway through its
  // fade, well after a pure render of `open: false` would have removed it.
  await expect(page.locator(settings)).toHaveAttribute('data-closed', '')
  await page.waitForTimeout(60)
  await expect(page.locator(settings)).toHaveCount(1)
  const opacity = await page
    .locator(settings)
    .evaluate((el) => Number(getComputedStyle(el).opacity))
  expect(opacity).toBeLessThan(1)
  await expect(page.locator(settings)).toHaveCount(0)
  expect(await lock(page)).toEqual(unlocked)
  await expect(trigger).toBeFocused()
})

test('closing mid-animation, then dropping the dialogs, leaves no lock behind', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Open (ui-sdk adapter)' }).click()
  await expect(page.locator(settings)).toHaveAttribute('data-open', '')
  await page.keyboard.press('Escape')
  await expect(page.locator(settings)).toHaveAttribute('data-closed', '')
  await page.waitForTimeout(40)
  await expect(page.locator(settings)).toHaveCount(1)
  await page.getByRole('button', { name: 'Drop dialogs' }).evaluate((el) => el.click())
  await expect(page.locator(settings)).toHaveCount(0)
  await expect.poll(() => lock(page)).toEqual(unlocked)
})

test('a nested confirm closes alone, and the lock holds until the last one closes', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Open (ui-sdk adapter)' }).click()
  const deleteButton = page.getByRole('button', { name: 'Delete project' })
  await deleteButton.click()
  await expect(page.locator(confirm)).toHaveAttribute('data-open', '')
  await expect(page.locator(settings)).toHaveAttribute('data-open', '')

  await page.keyboard.press('Escape')
  await expect(page.locator(confirm)).toHaveCount(0)
  // The parent is untouched: open, still locking, and the trigger inside it has focus back.
  await expect(page.locator(settings)).toHaveAttribute('data-open', '')
  expect((await lock(page)).overflow).toBe('hidden')
  await expect(deleteButton).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(page.locator(settings)).toHaveCount(0)
  expect(await lock(page)).toEqual(unlocked)
  await expect(page.getByRole('button', { name: 'Open (ui-sdk adapter)' })).toBeFocused()
})
