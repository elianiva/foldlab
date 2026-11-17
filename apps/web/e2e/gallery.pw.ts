// Navigation reuses DOM. A Mount runs once, when its element is inserted, and Foldkit
// patches a same-tag sibling in place, so a part that is not keyed keeps the previous
// page's binding and its controls go dead. Parts are keyed by identity to prevent it.
import { expect, test } from '@playwright/test'

test('controls bind after navigating from another page', async ({ page }) => {
  await page.goto('/components/checkbox')
  await expect(page.locator('[data-slot="checkbox"]').first()).toBeVisible()

  await page.getByRole('link', { name: 'Switch' }).click()
  const second = page.locator('[data-slot="switch"]').nth(1)
  await expect(second).toHaveAttribute('aria-checked', 'false')
  await second.click()
  await expect(second).toHaveAttribute('aria-checked', 'true')

  await page.getByRole('link', { name: 'Radio' }).click()
  await page.getByRole('radio').nth(2).click()
  await expect(page.getByText('Selected: team')).toBeVisible()
  await expect(page.locator('[data-foldlab-unbound]')).toHaveCount(0)
})

test('the overview grid shows every component live, and a title opens its page', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('[data-slot="overview-cell"]').first()).toBeVisible()
  await expect(page.locator('[data-foldlab-unbound]')).toHaveCount(0)
  await page
    .locator('[data-slot="overview-cell"]')
    .getByRole('link', { name: 'Checkbox', exact: true })
    .click()
  await expect(page).toHaveURL(/\/components\/checkbox$/)
  await expect(page.locator('[data-foldlab-unbound]')).toHaveCount(0)
})
